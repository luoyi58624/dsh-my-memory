// 单测 · 会话级角色绑定 + 项目局部记忆开关（存储层）
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile, stat, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  createMemoryStore,
  normalizeProjectCwd,
  parseProjectStateMap,
  parseSessionBindings,
  PROJECT_MEMORY_DISABLED,
  PROJECT_MEMORY_HEADER,
} from '../lib/host/store.js';
import { clearSyncCache } from '../lib/host/atomic.js';

async function tempStore(options = {}) {
  const dir = await mkdtemp(join(tmpdir(), 'dsh-my-memory-sp-'));
  clearSyncCache();
  return { dir, store: createMemoryStore({ dataDir: dir, ...options }) };
}

/** 造一个角色目录 */
async function makeCard(root, dir, name) {
  await mkdir(join(root, dir), { recursive: true });
  await writeFile(
    join(root, dir, 'agent.md'),
    `---\nname: ${name ?? dir}\ncreated: 1762146000000\nupdated: 1762146000000\n---\n\n我是 ${name ?? dir}。\n`,
    'utf8',
  );
}

test('parseSessionBindings：坏 JSON / 坏条目都被忽略', () => {
  assert.deepEqual(parseSessionBindings(null), {});
  assert.deepEqual(parseSessionBindings('not json'), {});
  assert.deepEqual(parseSessionBindings('[]'), {});
  assert.deepEqual(parseSessionBindings('{"s1":{}}'), {});
  assert.deepEqual(parseSessionBindings('{"s1":{"personaId":"baby"}}'), { s1: { personaId: 'baby', boundAt: 0 } });
});

test('parseProjectStateMap / normalizeProjectCwd：只认 enabled 是布尔的记录', () => {
  assert.deepEqual(parseProjectStateMap('{"a":{"enabled":"yes"}}'), {});
  assert.deepEqual(parseProjectStateMap('{"a":{"enabled":true,"updatedAt":5}}'), { a: { enabled: true, updatedAt: 5 } });
  // Windows 大小写与分隔符归一（同一目录不能有两条开关记录）
  assert.equal(normalizeProjectCwd('D:\\Repo\\Sub'), normalizeProjectCwd('d:/repo/sub'));
  assert.equal(normalizeProjectCwd('D:\\Repo\\Sub\\'), normalizeProjectCwd('D:/repo/sub'));
});

test('会话绑定：首绑成功 → 再换卡冲突 → 同卡幂等 → 未知卡 404', async () => {
  const { dir, store } = await tempStore({ now: () => 1762146000000 });
  try {
    await makeCard(dir, 'baby', '大肥鱼');
    await makeCard(dir, 'cat', '小猫娘');

    const first = await store.bindSessionPersona('s1', 'baby');
    assert.equal(first.ok, true);
    assert.equal(first.personaId, 'baby');
    assert.equal(first.boundAt, 1762146000000);
    // 落盘的形状
    const saved = JSON.parse(await readFile(join(dir, 'state', 'sessions.json'), 'utf8'));
    assert.deepEqual(saved, { s1: { personaId: 'baby', boundAt: 1762146000000 } });

    // 换一张 → 冲突
    const conflict = await store.bindSessionPersona('s1', 'cat');
    assert.equal(conflict.ok, false);
    assert.equal(conflict.conflict, true);
    assert.equal(conflict.personaId, 'baby', '冲突时要告诉调用方现在绑的是谁');

    // 同一个 id 再来一次 → 幂等成功，boundAt 不变
    const again = await store.bindSessionPersona('s1', 'baby');
    assert.equal(again.ok, true);
    assert.equal(again.boundAt, 1762146000000);

    // 未知卡 / 空参数
    await assert.rejects(store.bindSessionPersona('s2', 'ghost'), (err) => err.status === 404);
    await assert.rejects(store.bindSessionPersona('', 'baby'), (err) => err.status === 400);
    await assert.rejects(store.bindSessionPersona('s2', ''), (err) => err.status === 400);

    // 同步读（注入路径）
    clearSyncCache();
    assert.equal(store.sessionPersonaIdSync('s1'), 'baby');
    assert.equal(store.sessionPersonaCardSync('s1').name, '大肥鱼');
    assert.equal(store.sessionPersonaIdSync('unknown'), null);
    assert.equal(store.sessionPersonaCardSync('unknown'), null);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('会话绑定的卡被删掉后：返回 null，让调用方回落 active', async () => {
  const { dir, store } = await tempStore();
  try {
    await makeCard(dir, 'baby');
    await makeCard(dir, 'cat');
    await store.bindSessionPersona('s1', 'cat');
    await store.deletePersona('cat');
    clearSyncCache();
    assert.equal(await store.sessionPersonaCard('s1'), null);
    assert.equal(store.sessionPersonaCardSync('s1'), null);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('项目开关默认值：文件不存在 → false；文件存在 → true', async () => {
  const { dir, store } = await tempStore();
  const project = join(dir, 'proj');
  await mkdir(project, { recursive: true });
  try {
    const empty = await store.projectMemoryState(project);
    assert.equal(empty.exists, false);
    assert.equal(empty.enabled, false, '没记录 + 文件不存在 → 默认关');
    assert.equal(empty.memoryPath, join(project, '.dsh', 'MEMORY.md'));

    // 用户手动放了文件（或以前记过）→ 默认开
    await mkdir(join(project, '.dsh'), { recursive: true });
    await writeFile(join(project, '.dsh', 'MEMORY.md'), '# 项目记忆\n', 'utf8');
    clearSyncCache();
    const withFile = await store.projectMemoryState(project);
    assert.equal(withFile.exists, true);
    assert.equal(withFile.enabled, true, '没记录 + 文件存在 → 默认开');
    assert.equal(store.projectMemoryEnabledSync(project), true);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('打开开关会建文件；关闭只写状态、文件与内容原样保留', async () => {
  const { dir, store } = await tempStore();
  const project = join(dir, 'proj');
  await mkdir(project, { recursive: true });
  try {
    const on = await store.setProjectMemoryState({ cwd: project, enabled: true });
    assert.equal(on.enabled, true);
    assert.equal(on.exists, true);
    const file = join(project, '.dsh', 'MEMORY.md');
    assert.equal(await readFile(file, 'utf8'), `${PROJECT_MEMORY_HEADER}\n`);

    // 记一条，再关掉
    await store.appendProjectMemory({ cwd: project, text: '关之前记的一条', section: '约定' });
    const before = await readFile(file, 'utf8');
    const off = await store.setProjectMemoryState({ cwd: project, enabled: false });
    assert.equal(off.enabled, false);
    assert.equal(off.exists, true, '关闭不等于删文件');
    assert.equal(await readFile(file, 'utf8'), before, '关闭后内容一个字节都不能变');
    // 目录也还在
    assert.ok((await stat(join(project, '.dsh'))).isDirectory());
    // 状态表里记成 false（下次即使文件在也是关）
    clearSyncCache();
    assert.equal((await store.projectMemoryState(project)).enabled, false);
    assert.equal(store.projectMemoryEnabledSync(project), false);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('闸门：关着时 append / forget 都被拒绝，开着才放行', async () => {
  const { dir, store } = await tempStore();
  const project = join(dir, 'proj');
  await mkdir(project, { recursive: true });
  try {
    await assert.rejects(store.appendProjectMemory({ cwd: project, text: '记一条' }), (err) => {
      assert.equal(err.status, 403);
      assert.equal(err.message, PROJECT_MEMORY_DISABLED);
      return true;
    });
    // 关闭状态下也不会有文件被偷偷建出来
    await assert.rejects(stat(join(project, '.dsh')), '关着时不能建目录');

    await store.setProjectMemoryState({ cwd: project, enabled: true });
    const entry = await store.appendProjectMemory({ cwd: project, text: '记一条', section: '约定', tags: ['a'] });
    assert.match(entry.id, /^p_[0-9a-f]{8}$/);
    assert.equal(entry.path, join(project, '.dsh', 'MEMORY.md'));
    const file = await readFile(entry.path, 'utf8');
    assert.ok(file.startsWith(PROJECT_MEMORY_HEADER));
    assert.ok(file.includes('## 约定'));
    assert.ok(file.includes(entry.id));
    assert.deepEqual((await store.listProjectMemory(project)).map((e) => e.id), [entry.id]);

    // 关掉后 forget 也被拒
    await store.setProjectMemoryState({ cwd: project, enabled: false });
    await assert.rejects(store.forgetProjectMemory(project, entry.id), (err) => err.status === 403);
    assert.equal((await readFile(entry.path, 'utf8')).includes(entry.id), true, '被拒绝就不能删掉');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('路径：局部记忆落在 <cwd>/.dsh/MEMORY.md，不在插件数据根下', async () => {
  const { dir, store } = await tempStore();
  const project = join(dir, 'some-project');
  await mkdir(project, { recursive: true });
  try {
    await store.setProjectMemoryState({ cwd: project, enabled: true });
    const entry = await store.appendProjectMemory({ cwd: project, text: '项目里的一条' });
    assert.equal(entry.path, join(project, '.dsh', 'MEMORY.md'));
    // 数据根下不该出现 projects/<slug>/ 这种新数据（旧目录可能还在，但这条新记录不在那儿）
    const rootFiles = await readdir(dir);
    assert.deepEqual(rootFiles.filter((n) => n === entry.id), []);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
