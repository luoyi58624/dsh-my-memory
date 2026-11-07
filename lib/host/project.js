// 项目识别 · 从 cwd 向上找 git 仓库根，并算出稳定的项目 slug
//
// 为什么不直接拿 cwd 当项目身份：一个仓库里在不同子目录开会话（lib/host vs test）
// 应该共享同一份项目记忆，否则记忆会被切碎。仓库根才是「这个项目」的自然边界。
//
// 找不到 .git 就返回 null，**不报错**：绝大多数临时目录、家目录、纯文本工作区都不是仓库，
// 那不是异常，只是「这个会话没有项目记忆」。

import { statSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { createHash } from 'node:crypto';

/**
 * 把一个名字压成一个安全的单层路径段（用于项目目录名）。
 * 去掉 Windows/POSIX 都不允许的字符、去掉结尾的点与空格（Windows 会静默吞掉）、截断 64 字符。
 * @param {string} value
 * @param {string} fallback
 * @returns {string}
 */
export function safeSegment(value, fallback = 'project') {
  const out = String(value ?? '')
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/[\u0000-\u001f]/g, '')
    .replace(/[. ]+$/g, '')
    .trim()
    .slice(0, 64);
  return out || fallback;
}

/**
 * 仓库根路径的归一化形式（只用于算 hash，不用于访问文件）。
 *
 * why 要归一化：Windows 上 `D:\a\b` 与 `D:/a/b` 指向同一个仓库，
 * 大小写也不敏感（`D:\A\B` 也是它）。不归一化就会给同一个仓库生出两个 slug，
 * 记忆被静默拆成两半。所以统一成 POSIX 分隔符，Windows 上再转小写。
 * @param {string} root
 * @returns {string}
 */
export function normalizeRootForHash(root) {
  let p = resolve(String(root ?? '')).replace(/\\/g, '/');
  if (process.platform === 'win32') p = p.toLowerCase();
  return p.replace(/\/+$/, '');
}

/**
 * 项目 slug = 目录名 + '-' + 仓库根路径 sha1 前 6 位。
 * 例：`dsh-my-memory-3f9a2c`。目录名部分已安全化，可安全当目录名用。
 * @param {string} root 仓库根绝对路径
 * @returns {string}
 */
export function projectSlug(root) {
  const abs = resolve(String(root ?? ''));
  let name = safeSegment(basename(abs), 'project');
  // Windows 上目录名大小写不敏感：`E:\Repo` 和 `e:\repo` 是同一个仓库，
  // slug 里的名字部分也必须归一化，否则字符串层面会生出两个「不同项目」。
  if (process.platform === 'win32') name = name.toLowerCase();
  const hash = createHash('sha1').update(normalizeRootForHash(abs)).digest('hex').slice(0, 6);
  return `${name}-${hash}`;
}

/** `/x/y/.git` 是否存在（目录 = 普通仓库，文件 = worktree/submodule 的 gitdir 指针，两者都算） */
function hasGitEntry(dir) {
  try {
    statSync(join(dir, '.git'));
    return true;
  } catch {
    return false;
  }
}

/**
 * 从目录向上找 git 仓库根。
 * 向上最多走到文件系统根，不会越界；任何一层出错就当作「这层没有」。
 * @param {string} cwd 起始目录（文件路径也行，会先取它的目录）
 * @returns {string|null} 仓库根绝对路径，找不到返回 null
 */
export function findRepoRoot(cwd) {
  const start = resolve(String(cwd ?? '').trim() || '.');
  let dir = start;
  // 起始路径可能是个文件：取它的目录再开始找
  try {
    if (!statSync(dir).isDirectory()) dir = dirname(dir);
  } catch {
    // 路径不存在：仍然按字符串向上找 —— 用户可能在已删除的目录里开会话，
    // 这种情况找不到 .git 自然返回 null，不需要在这里报错。
  }
  for (;;) {
    if (hasGitEntry(dir)) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/** cwd → 探测结果 的缓存（注入段每轮都会问一次，别每轮都 stat 一串目录） */
const detectCache = new Map();
const DETECT_CACHE_MAX = 128;

/**
 * 探测项目：返回仓库根、目录名和 slug。
 * @param {string|null|undefined} cwd
 * @returns {{root:string, name:string, slug:string}|null} 不是 git 仓库返回 null
 */
export function detectProject(cwd) {
  const start = String(cwd ?? '').trim();
  if (!start) return null;
  const key = resolve(start);
  if (detectCache.has(key)) return detectCache.get(key);
  const root = findRepoRoot(key);
  const value = root ? { root, name: basename(root), slug: projectSlug(root) } : null;
  if (detectCache.size >= DETECT_CACHE_MAX) detectCache.delete(detectCache.keys().next().value);
  detectCache.set(key, value);
  return value;
}

/** 清空探测缓存（测试用） */
export function clearDetectCache() {
  detectCache.clear();
}
