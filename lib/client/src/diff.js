/**
 * diff.js —— 行级 diff（自己实现，不引依赖）
 *
 * 只做一件事：把「磁盘上的版本」和「我改完的版本」按行对齐，
 * 标出哪些行只在我这边（add）、哪些行磁盘有而我没有（del）。
 *
 * 算法是教科书 LCS（最长公共子序列）的 DP，O(n·m)。记忆文件一般几百行，
 * 1500 行以上直接退化成「整段替换」——那种规模下逐行高亮本来也看不清，
 * 而且 DP 会开始吃内存，不如保住界面不卡。
 */

/** 超过这个行数就退化成整段替换 */
const MAX_LINES = 1500;

/**
 * 逐行比较两段文本。
 * @param {string} baseText 基准（这里恒为「磁盘上的内容」）
 * @param {string} nextText 新内容（这里恒为「我的改动」）
 * @returns {Array<{kind: 'same'|'add'|'del', text: string}>}
 *   same = 两边一样；add = 只有我这边有（新增）；del = 只有磁盘有（我删掉了）
 */
export function diffLines(baseText, nextText) {
  const a = String(baseText ?? '').split('\n');
  const b = String(nextText ?? '').split('\n');

  if (a.length > MAX_LINES || b.length > MAX_LINES) {
    return [
      ...a.map((text) => ({ kind: 'del', text })),
      ...b.map((text) => ({ kind: 'add', text })),
    ];
  }

  const n = a.length;
  const m = b.length;
  // dp[i][j] = a[i..] 与 b[j..] 的 LCS 长度。Uint16 够用（上限 1500）
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const out = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ kind: 'same', text: a[i] });
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ kind: 'del', text: a[i] });
      i += 1;
    } else {
      out.push({ kind: 'add', text: b[j] });
      j += 1;
    }
  }
  while (i < n) {
    out.push({ kind: 'del', text: a[i] });
    i += 1;
  }
  while (j < m) {
    out.push({ kind: 'add', text: b[j] });
    j += 1;
  }
  return out;
}

/**
 * 统计差异行数（状态小字/提示用）。
 * @param {Array<{kind:string}>} rows
 * @returns {{added:number, removed:number}}
 */
export function countDiff(rows) {
  let added = 0;
  let removed = 0;
  for (const r of rows || []) {
    if (r.kind === 'add') added += 1;
    else if (r.kind === 'del') removed += 1;
  }
  return { added, removed };
}
