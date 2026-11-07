// 存储 · 原子写 + 带 mtime 缓存的读取
//
// 为什么自己实现而不用 storage-domain：那需要 defineDomain + zod 两个外部包，
// 而 profile 的 node_modules 里只有 @deepseek-ai/schemastery（本插件零运行时依赖）。
//
// rename 在同一分区内是原子的：要么旧文件完整，要么新文件完整，
// 不会出现「写到一半进程被杀、记忆库半截」这种最坏情况。
//
// 追加类操作也一律走「读-改-写」——MEMORY.md 是结构化文本（分组 + 列表项），
// 裸 appendFile 遇到掉电/并发会留下半行，整份文件从此解析不出条目。

import { mkdir, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises';
import { readFileSync, statSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { dirname } from 'node:path';

/** 递归建目录（幂等） */
export async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

/**
 * rename 的瞬时失败码：Windows 上多个写者同时 rename 到同一个目标时，
 * 后到的一方会短暂拿到 EPERM/EACCES/EBUSY —— 它不是真的失败，等几毫秒就过去了。
 * 这里带一个小退避重试，而不是直接把整次写入判死（那正是「静默丢写」的来源）。
 */
const TRANSIENT_CODES = new Set(['EPERM', 'EACCES', 'EBUSY', 'ENOENT', 'EMFILE', 'EWOULDBLOCK']);
const RENAME_RETRY_DELAYS = [0, 4, 12, 32, 80];

/**
 * 同进程内按目标路径排队写入（path → 最后一个 Promise 的尾巴）。
 *
 * 为什么需要：唯一临时名解决了「撞名」，但 Windows 上多个写者同时对**同一个目标**
 * rename 仍会互相顶掉。进程内排队把这类竞争消掉，跨进程靠唯一临时名 + 重试兜底。
 */
const writeQueues = new Map();

/**
 * 原子写入文本文件：先写同目录下的临时文件，再 rename 覆盖。
 *
 * 临时名必须进程内唯一：只用 pid + 时间戳时，同进程同一毫秒的两个写者会算出同名，
 * 先 rename 的搬走后另一个撞 ENOENT，等于静默丢写。所以加 randomUUID()。
 *
 * @param {string} path 目标路径
 * @param {string} text 内容（UTF-8）
 * @returns {Promise<void>}
 */
export async function writeTextAtomic(path, text) {
  await enqueueWrite(path, () => doWriteTextAtomic(path, text));
}

/**
 * 在「该路径的写队列」内部执行一段临界区。
 *
 * 为什么必须提供这个原语：带版本号的写入是「读磁盘 → 比较 rev → 写」三步。
 * 如果读在锁外、写在锁内，两个并发请求会**同时通过比较**再先后写，
 * 后写的那个把先写的覆盖掉——这正是「两个页签同时保存，丢一份」的成因。
 * 只有整段读改写都在同一个队列任务里，比较才有意义。
 *
 * 临界区内部要写文件时，必须用 {@link writeTextAtomicDirect}：
 * 再调 writeTextAtomic 会排到自己后面，直接死锁。
 *
 * @param {string} path 目标路径（队列键）
 * @param {() => Promise<any>} task 临界区
 * @returns {Promise<any>} task 的返回值
 */
export function withPathLock(path, task) {
  return enqueueWrite(path, task);
}

/**
 * 直接写（不排队）：**只允许**在 withPathLock 的临界区内部调用。
 * @param {string} path
 * @param {string} text
 * @returns {Promise<void>}
 */
export async function writeTextAtomicDirect(path, text) {
  await doWriteTextAtomic(path, text);
}

/**
 * 按路径排队执行一个任务。
 *
 * 队列尾巴只用于排序，失败不传染给后来者；队列空了就删掉键，避免 map 无限增长。
 * @param {string} path
 * @param {() => Promise<any>} task
 * @returns {Promise<any>}
 */
function enqueueWrite(path, task) {
  const prev = writeQueues.get(path) || Promise.resolve();
  const run = prev.then(task, task);
  const tail = run.catch(() => {});
  writeQueues.set(path, tail);
  tail.then(() => {
    if (writeQueues.get(path) === tail) writeQueues.delete(path);
  });
  return run;
}

/**
 * 真正的写入：唯一临时名 + 瞬时错误重试。
 * @param {string} path
 * @param {string} text
 * @returns {Promise<void>}
 */
async function doWriteTextAtomic(path, text) {
  await ensureDir(dirname(path));
  const tmp = `${path}.tmp-${process.pid}-${Date.now()}-${randomUUID()}`;
  await writeFile(tmp, text, 'utf8');

  let lastErr = null;
  for (const delay of RENAME_RETRY_DELAYS) {
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    try {
      await rename(tmp, path);
      return;
    } catch (err) {
      lastErr = err;
      const left = await stat(tmp).then(
        (s) => s.size,
        () => null,
      );
      // 临时文件已不存在：已被并发写者搬走，本次写入等效成功，不要去 unlink 一个不存在的文件
      if (left === null) return;
      if (!TRANSIENT_CODES.has(err?.code)) break;
    }
  }
  await unlink(tmp).catch(() => {});
  throw lastErr;
}

/**
 * 读文本；文件不存在或读不了返回 null（调用方按「空」处理，绝不抛）。
 * @param {string} path
 * @returns {Promise<string|null>}
 */
export async function readText(path) {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return null;
  }
}

/** 文件元信息；不存在时 exists:false（不抛） */
export async function fileStat(path) {
  try {
    const s = await stat(path);
    return { exists: true, size: s.size, mtimeMs: s.mtimeMs };
  } catch {
    return { exists: false, size: 0, mtimeMs: 0 };
  }
}

/**
 * 同步 mtime 缓存：路径 → { mtimeMs, size, text }。
 *
 * 为什么用同步读：systemPrompt.section 的 text 函数是**同步求值**的（每轮组装都会调），
 * 拿不到 async 的缝隙。而每轮都重新读盘 + 重新拼字符串会让注入内容抖动，
 * 进而每轮改写系统提示前缀 → KV 缓存全废。所以：mtime/size 没变就直接给缓存字符串。
 */
const syncCache = new Map();

/**
 * 同步读文本（带 mtime+size 缓存）。
 * @param {string} path
 * @returns {string|null} 文件不存在时 null
 */
export function readTextSyncCached(path) {
  let st;
  try {
    st = statSync(path);
  } catch {
    syncCache.delete(path);
    return null;
  }
  const hit = syncCache.get(path);
  if (hit && hit.mtimeMs === st.mtimeMs && hit.size === st.size) return hit.text;
  let text = null;
  try {
    text = readFileSync(path, 'utf8');
  } catch {
    return null;
  }
  syncCache.set(path, { mtimeMs: st.mtimeMs, size: st.size, text });
  return text;
}

/** 丢弃某条同步缓存（写入后主动失效，避免 mtime 精度不够时读到旧值） */
export function invalidateSyncCache(path) {
  syncCache.delete(path);
}

/** 清空同步缓存（测试用） */
export function clearSyncCache() {
  syncCache.clear();
}
