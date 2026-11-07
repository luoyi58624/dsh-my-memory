// 单测 · 多角色卡（迁移 / 新建 / 改名 / 改正文 / 删除 / 设为默认 / activeId 回落）
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  createMemoryStore,
  personaIdFromName,
  parsePersonaCard,
  parsePersonaIndex,
  serializePersona,
  uniquePersonaId,
} from '../lib/host/store.js';
import { clearSyncCache } from '../lib/host/atomic.js';

async function tempStore(options = {}) {
  const dir = await mkdtemp(join(tmpdir(), 'dsh-my-memory-persona-'));
  clearSyncCache();
  return { dir, store: createMemoryStore({ dataDir: dir, ...options }) };
}

/** 写一份旧版单卡 persona.md */
async function writeLegacy(dir, { name, body, updated }) {
  await writeFile(join(dir, 'persona.md'), serializePersona({ name, body, updated }), 'utf8');
}

test('personaIdFromName: ASCII 用安全段并小写，中文/空名用 p_+8 位 hash', () => {
  assert.equal(personaIdFromName('baby'), 'baby');
  assert.equal(personaIdFromName('Baby'), 'baby');
  assert.equal(personaIdFromName('cat-2'), 'cat-2');
  assert.match(personaIdFromName('大肥鱼'), /^p_[0-9a-f]{8}$/);
  // 同一个中文名稳定得到同一个 id（便于「同名重建」场景）
  assert.equal(personaIdFromName('大肥鱼'), personaIdFromName('大肥鱼'));
  assert.notEqual(personaIdFromName('大肥鱼'), personaIdFromName('小猫娘'));
  // 带空格的 ASCII 名字不当文件名用（容易在命令行/跨平台出问题）
  assert.match(personaIdFromName('Baby Girl'), /^p_[0-9a-f]{8}$/);
});

test('uniquePersonaId: 重名追加 -2、-3', () => {
  assert.equal(uniquePersonaId('baby', []), 'baby');
  assert.equal(uniquePersonaId('baby', ['baby']), 'baby-2');
  assert.equal(uniquePersonaId('baby', ['baby', 'baby-2']), 'baby-3');
});

test('parsePersonaIndex: 坏 JSON / 缺字段都当「没有 activeId」', () => {
  assert.deepEqual(parsePersonaIndex(null), { activeId: null });
  assert.deepEqual(parsePersonaIndex('not json'), { activeId: null });
  assert.deepEqual(parsePersonaIndex('{}'), { activeId: null });
  assert.deepEqual(parsePersonaIndex('{"activeId":""}'), { activeId: null });
  assert.deepEqual(parsePersonaIndex('{"activeId":"baby"}'), { activeId: 'baby' });
});

test('迁移：只有 persona.md → 生成 personas/<id>.md + personas.json，旧文件保留', async () => {
  const { dir, store } = await tempStore({ now: () => 1762146000000 });
  try {
    await writeLegacy(dir, { name: '大肥鱼', body: '我是大肥鱼。\n\n说话要柔和。', updated: 1762000000000 });
    const res = await store.ensurePersonas({ name: '助手' });
    assert.equal(res.created, false);
    assert.match(String(res.id), /^p_[0-9a-f]{8}$/);

    // 卡文件：frontmatter 含 id/name/created/updated，正文原样
    const files = (await readdir(join(dir, 'personas'))).filter((f) => f.endsWith('.md'));
    assert.deepEqual(files, [`${res.id}.md`]);
    const cardText = await readFile(join(dir, 'personas', `${res.id}.md`), 'utf8');
    const card = parsePersonaCard(cardText, res.id);
    assert.equal(card.id, res.id);
    assert.equal(card.name, '大肥鱼');
    assert.equal(card.body, '我是大肥鱼。\n\n说话要柔和。');
    // created 沿用旧卡的 updated（迁移不能把「这张卡什么时候有的」洗掉）
    assert.equal(card.created, 1762000000000);

    // personas.json 指向迁移出来的这张
    const index = JSON.parse(await readFile(join(dir, 'personas.json'), 'utf8'));
    assert.deepEqual(index, { activeId: res.id });

    // 旧文件保留不删
    assert.ok((await readFile(join(dir, 'persona.md'), 'utf8')).includes('说话要柔和'));

    // 幂等：再跑一次不会多出卡
    const again = await store.ensurePersonas({ name: '助手' });
    assert.equal(again.created, false);
    assert.equal((await store.listPersonas()).items.length, 1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('迁移：没有 persona.md 也没有卡 → 建一张默认卡', async () => {
  const { dir, store } = await tempStore();
  try {
    const res = await store.ensurePersonas({ name: '助手' });
    assert.equal(res.created, true);
    const { items, activeId } = await store.listPersonas();
    assert.equal(items.length, 1);
    assert.equal(items[0].name, '助手');
    assert.equal(items[0].body, '我是 助手。');
    assert.equal(activeId, items[0].id);
    // 旧 persona.md 不该被创建（迁移是单向的，新卡只进 personas/）
    await assert.rejects(readFile(join(dir, 'persona.md'), 'utf8'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('新建 / 改名 / 改正文：id 不随改名变化，created 不变、updated 前进', async () => {
  const { dir, store } = await tempStore({ now: () => 1762146000000 });
  try {
    const first = await store.createPersona({ name: '小猫娘' });
    assert.match(first.id, /^p_[0-9a-f]{8}$/);
    assert.equal(first.body, '我是 小猫娘。');
    assert.equal(first.created, 1762146000000);

    const renamed = await store.savePersonaCard(first.id, { name: '小猫猫' });
    assert.equal(renamed.id, first.id, 'id 一旦生成就不再随改名变化');
    assert.equal(renamed.name, '小猫猫');
    assert.equal(renamed.created, first.created);
    assert.equal(renamed.body, first.body, '只改名时正文保持不变');

    const rewritten = await store.savePersonaCard(first.id, { body: '我是小猫猫。\n\n别凶我。' });
    assert.equal(rewritten.name, '小猫猫');
    assert.equal(rewritten.body, '我是小猫猫。\n\n别凶我。');
    // 重新列出来也一致
    const { items } = await store.listPersonas();
    assert.equal(items.length, 1);
    assert.equal(items[0].body, '我是小猫猫。\n\n别凶我。');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('设为默认：只改 activeId，且注入路径立刻读到新卡', async () => {
  const { dir, store } = await tempStore({ now: () => 1762146000000 });
  try {
    const a = await store.createPersona({ name: 'baby' });
    const b = await store.createPersona({ name: 'cat' });
    // 第一张自动成为 active
    assert.equal((await store.listPersonas()).activeId, a.id);
    const res = await store.setActivePersona(b.id);
    assert.equal(res.activeId, b.id);
    assert.equal((await store.listPersonas()).activeId, b.id);
    clearSyncCache();
    assert.equal(store.readActivePersonaSync().id, b.id);
    assert.equal(store.readActivePersonaSync().name, 'cat');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('删除：剩最后一张时拒绝，删 active 时 activeId 自动改指剩下的第一张', async () => {
  const { dir, store } = await tempStore({ now: () => 1762146000000 });
  try {
    const a = await store.createPersona({ name: 'baby' });
    const b = await store.createPersona({ name: 'cat' });
    await store.setActivePersona(b.id);

    const res = await store.deletePersona(b.id);
    assert.equal(res.removed, b.id);
    assert.equal(res.activeId, a.id);
    const left = await store.listPersonas();
    assert.deepEqual(left.items.map((i) => i.id), [a.id]);
    assert.equal(left.activeId, a.id);

    // 只剩一张：拒绝
    await assert.rejects(store.deletePersona(a.id), /至少保留一张角色卡/);
    assert.equal((await store.listPersonas()).items.length, 1);

    // 删不存在的卡：明确报错
    await assert.rejects(store.deletePersona('nope'), /找不到角色卡/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('activeId 失效时回落到排序第一张（并自愈写回磁盘）', async () => {
  const { dir, store } = await tempStore({ now: () => 1762146000000 });
  try {
    const a = await store.createPersona({ name: 'baby' });
    const b = await store.createPersona({ name: 'cat' });
    // 手工把 activeId 指到一个不存在的卡
    await writeFile(join(dir, 'personas.json'), JSON.stringify({ activeId: 'ghost' }), 'utf8');
    clearSyncCache();
    const listed = await store.listPersonas();
    assert.equal(listed.activeId, a.id, '回落到排序第一张（created 最早）');
    // 自愈：磁盘上的 personas.json 被修正
    const healed = JSON.parse(await readFile(join(dir, 'personas.json'), 'utf8'));
    assert.equal(healed.activeId, a.id);

    // personas.json 整个删掉也不能崩
    await rm(join(dir, 'personas.json'), { force: true });
    clearSyncCache();
    assert.equal((await store.listPersonas()).activeId, a.id);
    // 同步注入路径同样回落
    assert.equal(store.readActivePersonaSync().id, a.id);
    assert.ok(b.id);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('旧版单卡 API 兼容：readPersona/savePersona 等价于 active 那张卡', async () => {
  const { dir, store } = await tempStore({ now: () => 1762146000000 });
  try {
    const card = await store.createPersona({ name: 'baby' });
    const read = await store.readPersona();
    assert.equal(read.name, 'baby');
    assert.equal(read.body, card.body);
    assert.equal(read.updated, card.updated);

    const saved = await store.savePersona({ body: '我是宝贝。' });
    assert.equal(saved.name, 'baby');
    assert.equal(saved.body, '我是宝贝。');
    // 写的是同一张卡（没新建）
    assert.equal((await store.listPersonas()).items.length, 1);
    assert.equal((await store.listPersonas()).items[0].id, card.id);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('全局记忆原文：writeGlobalRaw 允许空串，写完 listGlobal 立刻一致', async () => {
  const { dir, store } = await tempStore();
  try {
    const saved = await store.writeGlobalRaw('# 全局记忆\n\n## 称呼\n\n- [g_1a2b3c4d] 2026-11-07 主人叫我大肥鱼\n');
    assert.equal(saved.path, join(dir, 'MEMORY.md'));
    assert.equal(store.globalTextSync(), saved.text);
    const entries = await store.listGlobal();
    assert.equal(entries.length, 1);
    assert.equal(entries[0].id, 'g_1a2b3c4d');

    // 空字符串是合法输入（清空全部全局记忆）
    const cleared = await store.writeGlobalRaw('');
    assert.equal(cleared.text, '');
    assert.equal(await readFile(join(dir, 'MEMORY.md'), 'utf8'), '');
    assert.deepEqual(await store.listGlobal(), []);
    // 手写的乱七八糟内容不报错，只是读不出条目
    await store.writeGlobalRaw('这不是记忆，是我随手写的\r\n');
    assert.deepEqual(await store.listGlobal(), []);
    assert.ok((await readFile(join(dir, 'MEMORY.md'), 'utf8')).includes('随手写的'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
