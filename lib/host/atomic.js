// 存储 · 原子写 + 小文本直接读取
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
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { dirname, resolve } from 'node:path';

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
 * rename 仍会互相顶掉。队列串行执行本进程的操作，不把它当作跨进程事务。
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
 * @param {{createParent?:boolean}} options 已有角色的保存可禁用自动创建父目录。
 * @returns {Promise<void>}
 */
export async function writeTextAtomic(path, text, options = {}) {
  await enqueueWrite(path, () => doWriteTextAtomic(path, text, options));
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
 * @param {{createParent?:boolean}} options 是否允许创建父目录。
 * @returns {Promise<void>}
 */
export async function writeTextAtomicDirect(path, text, options = {}) {
  await doWriteTextAtomic(path, text, options);
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
  // 同一个 Windows 路径的大小写和分隔符写法共用队列。
  const absolute = resolve(path);
  const key = process.platform === 'win32' ? absolute.toLowerCase() : absolute;
  const prev = writeQueues.get(key) || Promise.resolve();
  const run = prev.then(task, task);
  const tail = run.catch(() => {});
  writeQueues.set(key, tail);
  tail.then(() => {
    if (writeQueues.get(key) === tail) writeQueues.delete(key);
  });
  return run;
}

/**
 * 真正的写入：唯一临时名 + 瞬时错误重试。
 * @param {string} path
 * @param {string} text
 * @returns {Promise<void>}
 */
async function doWriteTextAtomic(path, text, { createParent = true } = {}) {
  if (createParent) await ensureDir(dirname(path));
  const tmp = `${path}.tmp-${process.pid}-${Date.now()}-${randomUUID()}`;
  let renamed = false;
  try {
    await writeFile(tmp, text, 'utf8');
    let lastErr = null;
    for (const delay of RENAME_RETRY_DELAYS) {
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
      try {
        await rename(tmp, path);
        renamed = true;
        return;
      } catch (err) {
        lastErr = err;
        // 临时文件消失或目录被移走也是失败，不能把一次失败的 rename 当成功。
        if (!TRANSIENT_CODES.has(err?.code)) break;
      }
    }
    throw lastErr;
  } finally {
    if (!renamed) await unlink(tmp).catch(() => {});
  }
}

/** 只有明确的路径缺失才能当作空文件；权限、设备和其它 I/O 错误必须上报。 */
function isMissing(error) {
  return error?.code === 'ENOENT' || error?.code === 'ENOTDIR';
}

/** 读取文本，文件缺失时返回 null，其它错误交给调用方处理。 */
export async function readText(path) {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    if (isMissing(error)) return null;
    throw error;
  }
}

/** 读取文件元信息，文件缺失时返回 exists:false。 */
export async function fileStat(path) {
  try {
    const s = await stat(path);
    return { exists: true, size: s.size, mtimeMs: s.mtimeMs };
  } catch (error) {
    if (isMissing(error)) return { exists: false, size: 0, mtimeMs: 0 };
    throw error;
  }
}

/**
 * 每轮同步读取小文本，外部编辑器保留 mtime 或写入相同长度时也能立即生效。
 * 文件内容相同就会产生相同的提示词字节；重新读盘本身不会影响模型的前缀缓存。
 */
export function readTextSync(path) {
  try {
    return readFileSync(path, 'utf8');
  } catch (error) {
    if (isMissing(error)) return null;
    throw error;
  }
}

/** 保留旧接口名；现在始终读盘，不再按 mtime 或大小缓存。 */
export const readTextSyncCached = readTextSync;

/** 兼容旧调用；每次都读盘，已无缓存需要失效。 */
export function invalidateSyncCache(_path) {}

/** 兼容旧测试入口；读取层已无全局缓存。 */
export function clearSyncCache() {}
