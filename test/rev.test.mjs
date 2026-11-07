// 单测 · 全局记忆原文的版本号与并发写（rev / CAS / 串行队列）
//
// 这一组测的是「两个页签同时保存」和「外部编辑器同时改」这两类真实事故：
// 版本号靠内容哈希，比较与写必须在同一把按路径队列里完成，写完还要回读校验。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { contentRev, createMemoryStore } from '../lib/host/store.js';
import { clearSyncCache } from '../lib/host/atomic.js';

async function tempStore(options = {}) {
  const dir = await mkdtemp(join(tmpdir(), 'dsh-my-memory-rev-'));
  clearSyncCache();
  return { dir, store: createMemoryStore({ dataDir: dir, ...options }) };
}

test('contentRev：内容哈希，前 12 位；内容不变 rev 不变、内容变 rev 变', () => {
  const a = contentRev('# 全局记忆\n');
  assert.match(a, /^[0-9a-f]{12}$/);
  assert.equal(contentRev('# 全局记忆\n'), a);
  assert.notEqual(contentRev('# 全局记忆\n\n## 称呼\n'), a);
  // 空内容也有稳定 rev（文件不存在时用它）
  assert.equal(contentRev(''), contentRev(undefined));
  assert.notEqual(contentRev(''), a);
});

test('readGlobalRaw：文件不存在时给空串与空串的 rev', async () => {
  const { dir, store } = await tempStore();
  try {
    const raw = await store.readGlobalRaw();
    assert.equal(raw.path, join(dir, 'MEMORY.md'));
    assert.equal(raw.text, '');
    assert.equal(raw.rev, contentRev(''));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('CAS：baseRev 正确 → 写成功且 rev 变成新内容的 rev', async () => {
  const { dir, store } = await tempStore();
  try {
    const base = await store.readGlobalRaw();
    const res = await store.writeGlobalRawCas({ text: '# A\n', baseRev: base.rev });
    assert.equal(res.ok, true);
    assert.equal(res.text, '# A\n');
    assert.equal(res.rev, contentRev('# A\n'));
    assert.equal(await readFile(join(dir, 'MEMORY.md'), 'utf8'), '# A\n');
    // 再拿新 rev 写一次也成功
    const again = await store.writeGlobalRawCas({ text: '# B\n', baseRev: res.rev });
    assert.equal(again.ok, true);
    assert.equal(again.rev, contentRev('# B\n'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('CAS：baseRev 过期 → 不写、返回磁盘全文与磁盘 rev', async () => {
  const { dir, store } = await tempStore();
  try {
    await store.writeGlobalRaw('# 别人的版本\n');
    const stale = contentRev('# 我很久以前看到的\n');
    const res = await store.writeGlobalRawCas({ text: '# 我的版本\n', baseRev: stale });
    assert.equal(res.ok, false);
    assert.equal(res.conflict, true);
    assert.equal(res.text, '# 别人的版本\n', '冲突时要带回磁盘当前全文（界面出 diff 用）');
    assert.equal(res.rev, contentRev('# 别人的版本\n'));
    assert.equal(res.baseRev, stale);
    // 关键：文件没被改
    assert.equal(await readFile(join(dir, 'MEMORY.md'), 'utf8'), '# 别人的版本\n');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('CAS：force 无视 baseRev 直接写；缺省 baseRev 也按强制写（老客户端不坏）', async () => {
  const { dir, store } = await tempStore();
  try {
    await store.writeGlobalRaw('# 别人的版本\n');
    const forced = await store.writeGlobalRawCas({ text: '# 我覆盖了\n', baseRev: 'nosuchrev', force: true });
    assert.equal(forced.ok, true);
    assert.equal(await readFile(join(dir, 'MEMORY.md'), 'utf8'), '# 我覆盖了\n');

    const legacy = await store.writeGlobalRawCas({ text: '# 老客户端\n' });
    assert.equal(legacy.ok, true);
    assert.equal(await readFile(join(dir, 'MEMORY.md'), 'utf8'), '# 老客户端\n');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('CAS 并发：baseRev 相同的两个写 → 恰好一个成功、一个 409，文件是成功那份', async () => {
  const { dir, store } = await tempStore();
  try {
    const base = await store.readGlobalRaw();
    const [a, b] = await Promise.all([
      store.writeGlobalRawCas({ text: '# 甲\n', baseRev: base.rev }),
      store.writeGlobalRawCas({ text: '# 乙\n', baseRev: base.rev }),
    ]);
    const oks = [a, b].filter((r) => r.ok);
    const conflicts = [a, b].filter((r) => !r.ok);
    assert.equal(oks.length, 1, '只能有一个成功');
    assert.equal(conflicts.length, 1, '另一个必须是冲突');
    assert.equal(conflicts[0].conflict, true);
    const disk = await readFile(join(dir, 'MEMORY.md'), 'utf8');
    assert.equal(disk, oks[0].text, '文件内容必须等于成功那份');
    // 冲突方带回的「磁盘全文」就是赢家写进去的内容
    assert.equal(conflicts[0].text, disk);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('外部改写：GET 拿 rev 后文件被外部改，再用旧 rev 写 → 409', async () => {
  const { dir, store } = await tempStore();
  try {
    await store.writeGlobalRaw('# 初始\n');
    const seen = await store.readGlobalRaw();
    // 模拟外部编辑器直接写盘（不经过插件）
    await writeFile(join(dir, 'MEMORY.md'), '# 外部编辑器改的\n', 'utf8');
    const res = await store.writeGlobalRawCas({ text: '# 我的\n', baseRev: seen.rev });
    assert.equal(res.ok, false);
    assert.equal(res.text, '# 外部编辑器改的\n');
    assert.equal(await readFile(join(dir, 'MEMORY.md'), 'utf8'), '# 外部编辑器改的\n');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('队列：并发 10 次写不同内容 → 最终文件完整、无交错、等于某一次的内容', async () => {
  const { dir, store } = await tempStore();
  try {
    const bodies = Array.from({ length: 10 }, (_, i) => `# 第 ${i} 份\n\n${'- 行\n'.repeat(i + 1)}`);
    const results = await Promise.all(bodies.map((text) => store.writeGlobalRawCas({ text, force: true })));
    assert.equal(results.every((r) => r.ok), true);
    const disk = await readFile(join(dir, 'MEMORY.md'), 'utf8');
    // 完整：一定是其中某一份，且行数与它一致（没有半截 / 交错）
    const matched = bodies.find((b) => b === disk);
    assert.ok(matched, '最终文件必须是某一次完整写入的内容');
    assert.equal(disk.split('\n').length, matched.split('\n').length);
    assert.equal(disk.includes('\u0000'), false);
    // 每份内容都跑过一遍回读校验，rev 必须是最后那份的
    assert.equal(results[results.length - 1].rev, contentRev(disk));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('队列：appendGlobal 与整份保存并发时不会互相吞掉', async () => {
  const { dir, store } = await tempStore();
  try {
    // 先有一份结构
    await store.writeGlobalRaw('# 全局记忆\n\n## 称呼\n\n- [g_aaaaaaaa] 2026-11-07 原有条目\n');
    // 并发：一条 append + 一次 force 整份写
    await Promise.all([
      store.appendGlobal({ text: '并发条目', section: '称呼' }),
      store.writeGlobalRawCas({ text: '# 全局记忆\n\n## 称呼\n\n- [g_bbbbbbbb] 2026-11-07 面板写的\n', force: true }),
    ]);
    const disk = await readFile(join(dir, 'MEMORY.md'), 'utf8');
    // 不管谁先谁后，文件都必须是一份完整、可解析的 MEMORY.md
    assert.ok(disk.startsWith('# 全局记忆'));
    assert.equal(disk.includes('\u0000'), false);
    const entries = await store.listGlobal();
    assert.ok(entries.length >= 1, '至少要能解析出条目，不能写坏');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
