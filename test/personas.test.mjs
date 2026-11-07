// 单测 · 角色卡（一角色一目录）+ 数据根指针
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm, readdir, stat } from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  AGENT_FILE,
  createMemoryStore,
  defaultPersonaDir,
  displayPathOf,
  expandUserPath,
  parsePersonaCard,
  parsePersonaIndex,
  readRootPointerSync,
  resolveDataDir,
  serializePersona,
  serializePersonaCard,
  uniquePersonaDir,
  validatePersonaDir,
  writeRootPointer,
} from '../lib/host/store.js';
import { clearSyncCache } from '../lib/host/atomic.js';

/** 全局记忆文件名 */
const MEMORY_FILE_NAME = 'MEMORY.md';

async function tempStore(options = {}) {
  const dir = await mkdtemp(join(tmpdir(), 'dsh-my-memory-persona-'));
  clearSyncCache();
  return { dir, store: createMemoryStore({ dataDir: dir, ...options }) };
}

/** 手工造一个角色目录（模拟用户自己在磁盘上做的事） */
async function makeCard(root, dir, { name, body, created = 1762146000000 } = {}) {
  await mkdir(join(root, dir), { recursive: true });
  await writeFile(
    join(root, dir, AGENT_FILE),
    serializePersonaCard({ name: name ?? dir, created, updated: created, body: body ?? `我是${dir}。` }),
    'utf8',
  );
}

test('validatePersonaDir: 只允许英文/数字/点/下划线/短横线，1~40 位', () => {
  for (const ok of ['baby', 'cat-2', 'my_cat', 'a.b', 'A1']) {
    assert.equal(validatePersonaDir(ok).ok, true, `${ok} 应当合法`);
  }
  for (const bad of ['', '  ', '大肥鱼', 'a b', 'a/b', 'a\\b', 'a:b', 'x'.repeat(41)]) {
    const res = validatePersonaDir(bad);
    assert.equal(res.ok, false, `${JSON.stringify(bad)} 应当非法`);
    assert.ok(res.message);
  }
  // 具体的报错文案（界面会原样显示）
  assert.equal(validatePersonaDir('大肥鱼').message, '目录名只能用英文、数字、点、下划线、短横线');
  // 结尾点/空格：Windows 会静默吞掉
  assert.equal(validatePersonaDir('baby.').ok, false);
  // 插件自己的目录名不能被当成角色
  assert.match(validatePersonaDir('projects').message, /占用/);
  assert.match(validatePersonaDir('state').message, /占用/);
});

test('defaultPersonaDir / uniquePersonaDir: 中文名退回 baby，重名追加 -2', () => {
  assert.equal(defaultPersonaDir('baby'), 'baby');
  assert.equal(defaultPersonaDir('大肥鱼'), 'baby');
  assert.equal(defaultPersonaDir(''), 'baby');
  assert.equal(uniquePersonaDir('baby', []), 'baby');
  assert.equal(uniquePersonaDir('baby', ['baby']), 'baby-2');
  assert.equal(uniquePersonaDir('baby', ['baby', 'baby-2']), 'baby-3');
});

test('displayPathOf: 家目录缩成 ~，家目录外原样返回', () => {
  const home = process.platform === 'win32' ? 'C:\\Users\\luoyi' : '/home/luoyi';
  const abs = join(home, '.dsh', 'my-memory', 'baby', 'agent.md');
  const shown = displayPathOf(abs, home);
  assert.ok(shown.startsWith('~'), shown);
  assert.ok(shown.endsWith('agent.md'));
  assert.ok(!shown.includes(home), '不能把整个家目录路径原样带出来');
  // 家目录之外：原样
  const outside = process.platform === 'win32' ? 'D:\\other\\x.md' : '/other/x.md';
  assert.equal(displayPathOf(outside, home), outside);
});

test('parsePersonaCard: id 永远来自目录名，frontmatter 里残留的 id 行被忽略', () => {
  const text = '---\nid: ghost\nname: 大肥鱼\ncreated: 1762146000000\nupdated: 1762146000001\n---\n\n正文';
  const card = parsePersonaCard(text, 'baby');
  assert.equal(card.id, 'baby');
  assert.equal(card.name, '大肥鱼');
  assert.equal(card.created, 1762146000000);
  assert.equal(card.updated, 1762146000001);
  assert.equal(card.body, '正文');
  // 序列化不写 id 行
  assert.ok(!serializePersonaCard(card).includes('id:'));
});

test('目录布局：新建 / 读 / 改 / 列，agent.md 落在 <root>/<dir>/agent.md', async () => {
  const { dir, store } = await tempStore({ now: () => 1762146000000 });
  try {
    const card = await store.createPersona({ dir: 'baby' });
    assert.equal(card.id, 'baby');
    assert.equal(card.name, 'baby');
    assert.equal(card.body, '我是 baby。');
    assert.equal(card.path, join(dir, 'baby', AGENT_FILE));
    assert.equal((await stat(join(dir, 'baby', AGENT_FILE))).isFile(), true);
    // 目录里只有 agent.md，没有多余文件
    assert.deepEqual(await readdir(join(dir, 'baby')), [AGENT_FILE]);
    // 索引在 state/ 下，且指向新建的卡
    const index = JSON.parse(await readFile(join(dir, 'state', 'personas.json'), 'utf8'));
    assert.equal(index.activeId, 'baby');

    // 改名只改 frontmatter，不动目录
    const renamed = await store.savePersonaCard('baby', { name: '小猫娘' });
    assert.equal(renamed.id, 'baby');
    assert.equal(renamed.name, '小猫娘');
    assert.deepEqual(await readdir(join(dir, 'baby')), [AGENT_FILE]);
    assert.ok((await readFile(join(dir, 'baby', AGENT_FILE), 'utf8')).includes('name: 小猫娘'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('列表：只认含 agent.md 的目录，projects/state 被排除', async () => {
  const { dir, store } = await tempStore();
  try {
    await makeCard(dir, 'baby', { name: '大肥鱼' });
    await makeCard(dir, 'cat', { name: '小猫娘' });
    // 干扰项：没有 agent.md 的目录、插件自己的目录里塞一个 agent.md
    await mkdir(join(dir, 'notes'), { recursive: true });
    await writeFile(join(dir, 'notes', 'x.md'), 'hi', 'utf8');
    await mkdir(join(dir, 'state'), { recursive: true });
    await writeFile(join(dir, 'state', AGENT_FILE), 'name: 不该出现', 'utf8');
    await mkdir(join(dir, 'projects', 'demo'), { recursive: true });
    await writeFile(join(dir, 'projects', 'demo', AGENT_FILE), 'name: 也不该出现', 'utf8');

    const { items } = await store.listPersonas();
    assert.deepEqual(items.map((i) => i.id).sort(), ['baby', 'cat']);
    for (const item of items) {
      assert.ok(item.path.endsWith(`agent.md`));
      assert.ok(item.display.includes('~') || item.display.endsWith('agent.md'));
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('当前卡：activeId 生效；失效/缺文件时回落 created 最早的卡并自愈', async () => {
  const { dir, store } = await tempStore();
  try {
    await makeCard(dir, 'baby', { created: 1000 });
    await makeCard(dir, 'cat', { created: 2000 });
    await mkdir(join(dir, 'state'), { recursive: true });
    await writeFile(join(dir, 'state', 'personas.json'), JSON.stringify({ activeId: 'cat' }), 'utf8');
    clearSyncCache();
    assert.equal((await store.listPersonas()).activeId, 'cat');
    assert.equal(store.readActivePersonaSync().id, 'cat');

    // 指向不存在的目录 → 回落 baby，并写回磁盘
    await writeFile(join(dir, 'state', 'personas.json'), JSON.stringify({ activeId: 'ghost' }), 'utf8');
    clearSyncCache();
    assert.equal((await store.listPersonas()).activeId, 'baby');
    assert.equal(JSON.parse(await readFile(join(dir, 'state', 'personas.json'), 'utf8')).activeId, 'baby');

    // 索引文件整个删掉也不崩
    await rm(join(dir, 'state', 'personas.json'), { force: true });
    clearSyncCache();
    assert.equal(store.readActivePersonaSync().id, 'baby');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('迁移 1：personas/<id>.md（一卡一文件）→ <id>/agent.md，旧目录删掉、旧文件保留', async () => {
  const { dir, store } = await tempStore();
  try {
    await mkdir(join(dir, 'personas'), { recursive: true });
    // 旧格式（frontmatter 带 id）
    await writeFile(
      join(dir, 'personas', 'baby.md'),
      '---\nid: baby\nname: 大肥鱼\ncreated: 1500\nupdated: 1600\n---\n\n我是大肥鱼。\n说话要柔和。\n',
      'utf8',
    );
    await writeFile(join(dir, 'personas.json'), JSON.stringify({ activeId: 'baby' }), 'utf8');

    const res = await store.migratePersona();
    assert.equal(res.migrated, true);
    assert.deepEqual(res.fromLegacyFiles, ['baby']);
    // 新位置
    const cardText = await readFile(join(dir, 'baby', AGENT_FILE), 'utf8');
    assert.ok(cardText.includes('name: 大肥鱼'));
    assert.ok(cardText.includes('created: 1500'));
    assert.ok(cardText.includes('说话要柔和。'));
    // 旧文件保留（不删数据）→ 目录非空，所以 personas/ 不会被删；
    // 只有它真的空出来（用户自己清过）才删
    assert.ok((await readFile(join(dir, 'personas', 'baby.md'), 'utf8')).includes('说话要柔和'));
    await rm(join(dir, 'personas', 'baby.md'), { force: true });
    const emptyRes = await store.migratePersona();
    assert.equal(emptyRes.migrated, false);
    await assert.rejects(stat(join(dir, 'personas')), '空目录应当被清掉');
    // activeId 从旧索引搬进 state/
    assert.equal(JSON.parse(await readFile(join(dir, 'state', 'personas.json'), 'utf8')).activeId, 'baby');
    // 幂等
    const again = await store.migratePersona();
    assert.equal(again.migrated, false);
    assert.equal((await store.listPersonas()).items.length, 1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('迁移 2：更早的单文件 persona.md → baby/agent.md，旧文件保留', async () => {
  const { dir, store } = await tempStore();
  try {
    await writeFile(
      join(dir, 'persona.md'),
      serializePersona({ name: '大肥鱼', body: '我是大肥鱼。\n\n别凶我。', updated: 1762000000000 }),
      'utf8',
    );
    const res = await store.ensurePersonas({ name: '助手' });
    assert.equal(res.created, false);
    assert.equal(res.id, 'baby');
    const card = await store.listPersonas();
    assert.equal(card.items.length, 1);
    assert.equal(card.items[0].name, '大肥鱼');
    assert.equal(card.items[0].created, 1762000000000);
    // 旧文件还在
    assert.ok((await readFile(join(dir, 'persona.md'), 'utf8')).includes('别凶我'));
    // 注入路径同步可读
    clearSyncCache();
    assert.equal(store.readActivePersonaSync().name, '大肥鱼');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('迁移 3：已经有 <dir>/agent.md 时什么都不做（不会被旧文件复活/覆盖）', async () => {
  const { dir, store } = await tempStore();
  try {
    await makeCard(dir, 'cat', { name: '现有的猫' });
    // 同时留着旧单文件 + 旧目录
    await writeFile(join(dir, 'persona.md'), serializePersona({ name: '旧角色', body: '旧正文' }), 'utf8');
    await mkdir(join(dir, 'personas'), { recursive: true });
    await writeFile(join(dir, 'personas', 'dog.md'), '---\nname: 旧狗\n---\n\n旧狗正文', 'utf8');

    const res = await store.migratePersona();
    const ids = (await store.listPersonas()).items.map((i) => i.id).sort();
    // 旧单文件不会复活（已有目录卡），但 personas/ 里的 md 会被搬成目录（那是最近的布局）
    assert.deepEqual(ids, ['cat', 'dog']);
    assert.equal(res.fromLegacySingle, false);
    // 已存在的 cat 内容没被覆盖
    assert.equal((await store.listPersonas()).items.find((i) => i.id === 'cat').name, '现有的猫');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('reload：能读到磁盘上被外部改过的内容（即使 mtime 缓存里还是旧的）', async () => {
  const { dir, store } = await tempStore();
  try {
    await store.createPersona({ dir: 'baby', name: '大肥鱼', body: '旧正文' });
    // 先读一次，把内容灌进同步缓存
    clearSyncCache();
    assert.equal(store.readActivePersonaSync().body, '旧正文');

    // 用户在外面手改 agent.md
    await writeFile(
      join(dir, 'baby', AGENT_FILE),
      serializePersonaCard({ name: '大肥鱼', created: 1, updated: 2, body: '我在编辑器里改的新正文' }),
      'utf8',
    );
    const reloaded = await store.reloadPersona('baby');
    assert.equal(reloaded.body, '我在编辑器里改的新正文');
    assert.equal(reloaded.id, 'baby');
    // 刷新后注入路径也拿到新内容
    assert.equal(store.readActivePersonaSync().body, '我在编辑器里改的新正文');
    // 不存在的卡
    await assert.rejects(store.reloadPersona('ghost'), /找不到角色卡/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('删除：删整个目录；只剩一张拒绝；删 active 时 activeId 改指剩下的', async () => {
  const { dir, store } = await tempStore();
  try {
    await makeCard(dir, 'baby', { created: 1000 });
    await makeCard(dir, 'cat', { created: 2000 });
    await store.setActivePersona('cat');

    const res = await store.deletePersona('cat');
    assert.equal(res.removed, 'cat');
    assert.equal(res.activeId, 'baby');
    await assert.rejects(stat(join(dir, 'cat')), '整个目录都要被删掉');

    await assert.rejects(store.deletePersona('baby'), /至少保留一张角色卡/);
    await assert.rejects(store.deletePersona('ghost'), /找不到角色卡/);
    assert.equal((await readdir(dir)).filter((n) => n === 'baby').length, 1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('重命名：连目录里的其他文件一起搬，activeId 跟着变', async () => {
  const { dir, store } = await tempStore();
  try {
    await makeCard(dir, 'baby', { name: '大肥鱼', body: '我是大肥鱼。' });
    // 用户自己在角色目录里放的东西
    await writeFile(join(dir, 'baby', 'avatar.png'), 'fake-image', 'utf8');
    await mkdir(join(dir, 'baby', 'notes'), { recursive: true });
    await writeFile(join(dir, 'baby', 'notes', 'a.md'), '笔记', 'utf8');
    await store.setActivePersona('baby');

    const card = await store.renamePersona('baby', 'fish');
    assert.equal(card.id, 'fish');
    assert.equal(card.path, join(dir, 'fish', AGENT_FILE));
    assert.equal(card.name, '大肥鱼', '显示名不变');
    assert.ok(card.display.endsWith('agent.md'));

    // 旧目录没了、新目录里东西齐全（整个目录搬，不是只搬 agent.md）
    await assert.rejects(stat(join(dir, 'baby')));
    assert.deepEqual((await readdir(join(dir, 'fish'))).sort(), ['agent.md', 'avatar.png', 'notes']);
    assert.equal(await readFile(join(dir, 'fish', 'notes', 'a.md'), 'utf8'), '笔记');
    // activeId 同步改了
    assert.equal(JSON.parse(await readFile(join(dir, 'state', 'personas.json'), 'utf8')).activeId, 'fish');
    assert.equal(store.readActivePersonaSync().id, 'fish');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('重命名：同名幂等、重名 400、非法名 400、源不存在 404', async () => {
  const { dir, store } = await tempStore();
  try {
    await makeCard(dir, 'baby');
    await makeCard(dir, 'cat');

    // 同名：原样返回，不报错也不动磁盘
    const same = await store.renamePersona('baby', 'baby');
    assert.equal(same.id, 'baby');
    assert.ok((await stat(join(dir, 'baby', AGENT_FILE))).isFile());

    // 目标已存在
    await assert.rejects(store.renamePersona('baby', 'cat'), (err) => {
      assert.equal(err.status, 400);
      assert.equal(err.message, '这个目录已经有了');
      return true;
    });
    // 目标是个没有 agent.md 的普通目录，也不能覆盖
    await mkdir(join(dir, 'plain'), { recursive: true });
    await assert.rejects(store.renamePersona('baby', 'plain'), (err) => err.status === 400);

    // 非法目录名 / 保留名
    await assert.rejects(store.renamePersona('baby', '大肥鱼'), (err) => {
      assert.equal(err.status, 400);
      assert.match(err.message, /目录名只能用英文、数字、点、下划线、短横线/);
      return true;
    });
    await assert.rejects(store.renamePersona('baby', 'state'), (err) => err.status === 400);

    // 源不存在
    await assert.rejects(store.renamePersona('ghost', 'x'), (err) => err.status === 404);

    // 失败之后目录结构没被破坏
    assert.deepEqual((await store.listPersonas()).items.map((i) => i.id).sort(), ['baby', 'cat']);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('重命名：非 active 那张不影响 activeId', async () => {
  const { dir, store } = await tempStore();
  try {
    await makeCard(dir, 'baby', { created: 1000 });
    await makeCard(dir, 'cat', { created: 2000 });
    await store.setActivePersona('cat');
    await store.renamePersona('baby', 'fish');
    const index = JSON.parse(await readFile(join(dir, 'state', 'personas.json'), 'utf8'));
    assert.equal(index.activeId, 'cat');
    assert.deepEqual((await store.listPersonas()).items.map((i) => i.id).sort(), ['cat', 'fish']);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('新建校验：非法目录名 400 文案、重名拒绝、state/projects 拒绝', async () => {
  const { dir, store } = await tempStore();
  try {
    await assert.rejects(store.createPersona({ dir: '大肥鱼' }), /目录名只能用英文、数字、点、下划线、短横线/);
    await assert.rejects(store.createPersona({ dir: '' }), /目录名不能为空/);
    await assert.rejects(store.createPersona({ dir: 'state' }), /占用/);
    await store.createPersona({ dir: 'baby' });
    await assert.rejects(store.createPersona({ dir: 'baby' }), /这个目录已经有了/);
    // 大小写不同在 Windows 上是同一个目录，这里不额外特殊处理，但要确认不会崩
    const ids = (await store.listPersonas()).items.map((i) => i.id);
    assert.deepEqual(ids, ['baby']);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('兼容层：readPersona / savePersona 等价于 active 那张卡', async () => {
  const { dir, store } = await tempStore({ now: () => 1762146000000 });
  try {
    await store.createPersona({ dir: 'baby', name: '大肥鱼' });
    const read = await store.readPersona();
    assert.equal(read.name, '大肥鱼');
    assert.equal(read.body, '我是 baby。');
    const saved = await store.savePersona({ body: '我是宝贝。' });
    assert.equal(saved.name, '大肥鱼');
    assert.equal(saved.body, '我是宝贝。');
    assert.equal((await store.listPersonas()).items.length, 1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('数据根指针：写 / 读 / 清空，且 resolveDataDir 优先级正确', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'dsh-my-memory-roots-'));
  const pointer = join(dir, 'my-memory.roots.json');
  try {
    // 没指针时读不到
    assert.equal(readRootPointerSync(pointer), null);
    // 写入后能读回（相对路径会被解析成绝对路径）
    await writeRootPointer(join(dir, 'data-a'), pointer);
    const raw = JSON.parse(await readFile(pointer, 'utf8'));
    assert.equal(raw.dataDir, join(dir, 'data-a'));
    assert.equal(readRootPointerSync(pointer), join(dir, 'data-a'));
    // 清空
    await writeRootPointer(null, pointer);
    assert.deepEqual(JSON.parse(await readFile(pointer, 'utf8')), { dataDir: null });
    assert.equal(readRootPointerSync(pointer), null);

    // 优先级：config > 指针 > 默认
    await writeRootPointer(join(dir, 'data-b'), pointer);
    assert.equal(resolveDataDir({ configured: join(dir, 'from-config'), file: pointer }).source, 'config');
    assert.equal(resolveDataDir({ configured: '', file: pointer }).dataDir, join(dir, 'data-b'));
    assert.equal(resolveDataDir({ configured: '', file: pointer }).source, 'pointer');
    // 坏 JSON 当没设置
    await writeFile(pointer, 'not json', 'utf8');
    assert.equal(readRootPointerSync(pointer), null);
    assert.equal(resolveDataDir({ configured: '', file: pointer }).source, 'default');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('expandUserPath: ~ 展开、空值返回空、普通路径绝对化', () => {
  const home = homedir();
  assert.equal(expandUserPath(''), '');
  assert.equal(expandUserPath('   '), '');
  assert.equal(expandUserPath('~'), home);
  assert.equal(expandUserPath('~/x'), join(home, 'x'));
  assert.ok(expandUserPath('relative-dir').startsWith('/') || /^[A-Za-z]:/.test(expandUserPath('relative-dir')));
});

test('全局记忆原文：writeGlobalRaw 允许空串，写完 listGlobal 立刻一致', async () => {
  const { dir, store } = await tempStore();
  try {
    const saved = await store.writeGlobalRaw('# 全局记忆\n\n## 称呼\n\n- [g_1a2b3c4d] 2026-11-07 主人叫我大肥鱼\n');
    assert.equal(saved.path, join(dir, MEMORY_FILE_NAME));
    assert.equal(store.globalTextSync(), saved.text);
    const entries = await store.listGlobal();
    assert.equal(entries.length, 1);
    assert.equal(entries[0].id, 'g_1a2b3c4d');

    const cleared = await store.writeGlobalRaw('');
    assert.equal(cleared.text, '');
    assert.equal(await readFile(join(dir, MEMORY_FILE_NAME), 'utf8'), '');
    assert.deepEqual(await store.listGlobal(), []);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('parsePersonaIndex: 坏 JSON / 缺字段都当「没有 activeId」', () => {
  assert.deepEqual(parsePersonaIndex(null), { activeId: null });
  assert.deepEqual(parsePersonaIndex('not json'), { activeId: null });
  assert.deepEqual(parsePersonaIndex('{}'), { activeId: null });
  assert.deepEqual(parsePersonaIndex('{"activeId":"baby"}'), { activeId: 'baby' });
});

