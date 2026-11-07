// 单测 · 项目识别（git 根探测 + slug 稳定性）
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, sep } from 'node:path';

import {
  clearDetectCache,
  detectProject,
  findRepoRoot,
  normalizeRootForHash,
  projectSlug,
  safeSegment,
} from '../lib/host/project.js';

/** 造一个临时目录树，返回根目录 */
async function tempDir() {
  return await mkdtemp(join(tmpdir(), 'dsh-my-memory-proj-'));
}

test('safeSegment: 去掉非法字符、结尾点空格，截断 64 字符', () => {
  assert.equal(safeSegment('a/b\\c:d*e?f"g<h>i|j'), 'a_b_c_d_e_f_g_h_i_j');
  assert.equal(safeSegment('名字...'), '名字');
  assert.equal(safeSegment('名字 . '), '名字');
  assert.equal(safeSegment(''), 'project');
  assert.equal(safeSegment('x'.repeat(100)).length, 64);
});

test('projectSlug: 同一个仓库根的两种写法得到同一个 slug', () => {
  const a = projectSlug('/tmp/demo');
  const b = projectSlug('/tmp/demo/');
  assert.equal(a, b);
  // 目录名 + '-' + 6 位 hex
  assert.match(a, /^demo-[0-9a-f]{6}$/);
  if (process.platform === 'win32') {
    // Windows 大小写不敏感：大小写不同不能生出第二个 slug
    assert.equal(projectSlug('C:\\Repo\\Demo'), projectSlug('c:/repo/demo'));
    assert.match(normalizeRootForHash('C:\\Repo\\Demo'), /^c:\/repo\/demo$/);
  }
  // 不同路径必须不同（否则两个仓库会共享记忆）
  assert.notEqual(projectSlug('/tmp/demo'), projectSlug('/tmp/demo2'));
});

test('findRepoRoot: 从子目录向上找到 .git 目录', async () => {
  const dir = await tempDir();
  try {
    const repo = join(dir, 'my-repo');
    const nested = join(repo, 'lib', 'host');
    await mkdir(join(repo, '.git'), { recursive: true });
    await mkdir(nested, { recursive: true });
    assert.equal(findRepoRoot(repo), repo);
    assert.equal(findRepoRoot(nested), repo);
    // 检测结果应该是仓库根，而不是 cwd
    clearDetectCache();
    const detected = detectProject(nested);
    assert.equal(detected.root, repo);
    assert.equal(detected.name, 'my-repo');
    assert.match(detected.slug, /^my-repo-[0-9a-f]{6}$/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('findRepoRoot: .git 是文件（worktree / submodule）也算仓库', async () => {
  const dir = await tempDir();
  try {
    const repo = join(dir, 'worktree');
    await mkdir(repo, { recursive: true });
    await writeFile(join(repo, '.git'), 'gitdir: /somewhere/.git/worktrees/wt\n', 'utf8');
    assert.equal(findRepoRoot(repo), repo);
    clearDetectCache();
    assert.equal(detectProject(repo).root, repo);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('findRepoRoot: 没有 .git 返回 null（不报错）', async () => {
  const dir = await tempDir();
  try {
    const plain = join(dir, 'not-a-repo', 'sub');
    await mkdir(plain, { recursive: true });
    assert.equal(findRepoRoot(plain), null);
    clearDetectCache();
    assert.equal(detectProject(plain), null);
    // 空字符串 / 不存在的路径也不抛
    assert.equal(detectProject(''), null);
    assert.equal(detectProject('/definitely/not/here/dsh-my-memory'), null);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('findRepoRoot: 传入文件路径时用它的目录寻找', async () => {
  const dir = await tempDir();
  try {
    const repo = join(dir, 'repo-file');
    await mkdir(join(repo, '.git'), { recursive: true });
    const file = join(repo, 'README.md');
    await writeFile(file, '# hi\n', 'utf8');
    assert.equal(findRepoRoot(file), repo);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('detectProject: 命中缓存但结果稳定（同一 cwd 两次一致）', async () => {
  const dir = await tempDir();
  try {
    const repo = join(dir, 'cached-repo');
    await mkdir(join(repo, '.git'), { recursive: true });
    clearDetectCache();
    const first = detectProject(repo);
    const second = detectProject(repo);
    assert.deepEqual(first, second);
    // 路径里带平台分隔符也能命中同一个仓库
    const mixed = detectProject(join(repo, '.') );
    assert.equal(mixed?.root, repo);
    assert.ok(sep.length > 0);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
