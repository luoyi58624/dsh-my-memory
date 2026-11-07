// 单测 · 存储层（角色卡 / 全局记忆 / 项目记忆 / 索引重建）
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  createMemoryStore,
  formatDate,
  insertGlobalLine,
  newEntryId,
  parseGlobal,
  parseGlobalLine,
  parseIndexLine,
  parsePersona,
  removeGlobalLine,
  serializeEntryFile,
  serializePersona,
  summaryOf,
  matchScore,
  normalizeSection,
  normalizeTags,
  oneLine,
} from '../lib/host/store.js';

/** 建一个临时数据目录 */
async function tempStore(options = {}) {
  const dir = await mkdtemp(join(tmpdir(), 'dsh-my-memory-test-'));
  return { dir, store: createMemoryStore({ dataDir: dir, ...options }) };
}

test('persona: 文件不存在时返回默认空卡', async () => {
  const { dir, store } = await tempStore();
  try {
    const persona = await store.readPersona();
    assert.equal(persona.name, '助手');
    assert.equal(persona.updated, 0);
    assert.match(persona.body, /^我是 助手。/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('persona: 序列化/解析往返（frontmatter 只有 name/updated）', () => {
  const src = serializePersona({ name: '大肥鱼', body: '我是大肥鱼。\n\n说话要简短。', updated: 1762146000000 });
  assert.ok(src.startsWith('---\nname: 大肥鱼\nupdated: 1762146000000\n---\n'));
  const parsed = parsePersona(src);
  assert.equal(parsed.name, '大肥鱼');
  assert.equal(parsed.updated, 1762146000000);
  assert.equal(parsed.body, '我是大肥鱼。\n\n说话要简短。');
  // 往返一次后内容仍然一致（写盘读盘不能改写正文）
  assert.equal(parsePersona(serializePersona(parsed)).body, parsed.body);
});

test('persona: savePersona 原子写并能读回', async () => {
  const { dir, store } = await tempStore({ now: () => 1762146000000 });
  try {
    const saved = await store.savePersona({ name: '小助手', body: '第一行\n第二行' });
    assert.equal(saved.updated, 1762146000000);
    const back = await store.readPersona();
    assert.equal(back.name, '小助手');
    assert.equal(back.body, '第一行\n第二行');
    // 同步读（注入段用）必须和异步读一致
    assert.equal(store.readPersonaSync().body, back.body);
    // 只改名字时正文保持不变
    const renamed = await store.savePersona({ name: '新名字' });
    assert.equal(renamed.body, '第一行\n第二行');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('global: 追加到已有小节末尾，id 是 g_+8hex', async () => {
  const { dir, store } = await tempStore({ now: () => Date.UTC(2026, 10, 7, 4, 0, 0) });
  try {
    const a = await store.appendGlobal({ text: '主人叫我大肥鱼', section: '称呼', tags: ['称呼'] });
    assert.match(a.id, /^g_[0-9a-f]{8}$/);
    const b = await store.appendGlobal({ text: '第二句', section: '称呼' });
    assert.notEqual(a.id, b.id);
    const text = await readFile(join(dir, 'MEMORY.md'), 'utf8');
    assert.ok(text.startsWith('# 全局记忆\n'));
    assert.ok(text.includes('## 称呼'));
    const lines = text.split('\n').filter((l) => l.startsWith('- ['));
    assert.equal(lines.length, 2);
    // 后追加的在同一小节里，且顺序稳定
    assert.ok(lines[0].includes(a.id));
    assert.ok(lines[1].includes(b.id));
    assert.ok(lines[0].includes(`| tag: 称呼`));
    const entries = await store.listGlobal();
    assert.deepEqual(entries.map((e) => e.id), [a.id, b.id]);
    assert.equal(entries[0].text, '主人叫我大肥鱼');
    assert.equal(entries[0].section, '称呼');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('global: 新小节追加到文件末尾，空小节不会出现连续空行', async () => {
  const { dir, store } = await tempStore();
  try {
    await store.appendGlobal({ text: 'A', section: '称呼' });
    await store.appendGlobal({ text: 'B', section: '作息' });
    const text = await readFile(join(dir, 'MEMORY.md'), 'utf8');
    assert.ok(text.indexOf('## 称呼') < text.indexOf('## 作息'));
    assert.ok(!/\n\n\n/.test(text), '不应出现连续空行');
    assert.deepEqual(
      (await store.listGlobal()).map((e) => `${e.section}:${e.text}`),
      ['称呼:A', '作息:B'],
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('global: 按 id 删除只删那一行，找不到返回 removed:false', async () => {
  const { dir, store } = await tempStore();
  try {
    const a = await store.appendGlobal({ text: 'A', section: '称呼' });
    const b = await store.appendGlobal({ text: 'B', section: '称呼' });
    const res = await store.forgetGlobal(a.id);
    assert.equal(res.removed, true);
    const left = await store.listGlobal();
    assert.deepEqual(left.map((e) => e.id), [b.id]);
    const missing = await store.forgetGlobal('g_deadbeef');
    assert.equal(missing.removed, false);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('global: 手写/异常行不会让整份文件解析失败', () => {
  const text = [
    '# 全局记忆',
    '',
    '## 称呼',
    '',
    '- [g_1a2b3c4d] 2026-11-07 主人叫我大肥鱼 | tag: 称呼',
    '- 这一行没有 id，应当被忽略',
    '随便一行说明文字',
    '',
    '## 作息',
    '- [g_0000ffff] 2026-11-08 凌晨三点睡',
    '',
  ].join('\n');
  const entries = parseGlobal(text);
  assert.equal(entries.length, 2);
  assert.equal(entries[0].text, '主人叫我大肥鱼');
  assert.equal(entries[0].date, '2026-11-07');
  assert.deepEqual(entries[0].tags, ['称呼']);
  assert.equal(entries[1].section, '作息');
  assert.equal(entries[1].date, '2026-11-08');
});

test('global: 文本级编辑原语（insert / remove）保留用户手写内容', () => {
  const base = '# 全局记忆\n\n## 称呼\n\n- [g_11111111] 2026-11-07 A\n\n<!-- 用户自己的注释 -->\n';
  const inserted = insertGlobalLine(base, '称呼', '- [g_22222222] 2026-11-07 B');
  assert.ok(inserted.includes('<!-- 用户自己的注释 -->'));
  assert.ok(inserted.indexOf('g_11111111') < inserted.indexOf('g_22222222'));
  const removed = removeGlobalLine(inserted, 'g_11111111');
  assert.equal(removed.removed, true);
  assert.ok(!removed.text.includes('g_11111111'));
  assert.ok(removed.text.includes('g_22222222'));
});

test('project: 索引行解析（id / 摘要 / 日期）', () => {
  const s1 = parseIndexLine('- [p_9f8e7d6c] 摘要（2026-11-07）');
  assert.equal(s1.id, 'p_9f8e7d6c');
  assert.equal(s1.summary, '摘要');
  assert.equal(s1.date, '2026-11-07');
  // 非条目行返回 null，不能把标题行当条目
  assert.equal(parseIndexLine('# 项目记忆 · demo'), null);
});

test('project: 追加条目写全文文件 + 索引一行摘要（摘要取正文第一行非标题）', async () => {
  const { dir, store } = await tempStore({ now: () => Date.UTC(2026, 10, 7) });
  try {
    const root = join(dir, 'demo-repo');
    await mkdir(root, { recursive: true });
    const res = await store.appendProject({
      root,
      title: 'DSH 插件 Config 用 schemastery',
      body: '# 标题\n\nDSH 插件 Config 用 schemastery，每个字段必须给 default。\n',
      tags: ['插件', 'api'],
    });
    assert.match(res.id, /^p_[0-9a-f]{8}$/);
    assert.match(res.slug, /^demo-repo-[0-9a-f]{6}$/);
    // 全文文件
    const file = await readFile(res.path, 'utf8');
    assert.match(file, new RegExp(`^---\\nid: ${res.id}\\ntitle: DSH 插件 Config 用 schemastery\\ncreated: \\d+\\ntags: \\["插件","api"\\]\\n---\\n`));
    assert.ok(file.includes('每个字段必须给 default'));
    // 索引
    const index = await readFile(join(dir, 'projects', res.slug, 'MEMORY.md'), 'utf8');
    assert.ok(index.startsWith('# 项目记忆 · demo-repo\n'));
    assert.ok(index.includes(`- [${res.id}] DSH 插件 Config 用 schemastery，每个字段必须给 default。（${formatDate(Date.UTC(2026, 10, 7))}）`));
    // list 读得到
    const listed = await store.listProject(res.slug);
    assert.equal(listed.rebuilt, false);
    assert.equal(listed.entries.length, 1);
    // 读全文
    const full = await store.readProjectEntry(res.slug, res.id);
    assert.equal(full.title, 'DSH 插件 Config 用 schemastery');
    assert.deepEqual(full.tags, ['插件', 'api']);
    assert.ok(full.body.includes('schemastery'));
    assert.equal(full.date, formatDate(Date.UTC(2026, 10, 7)));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('project: 索引文件被删掉后 listProject 自动重建', async () => {
  const { dir, store } = await tempStore();
  try {
    const root = join(dir, 'repo-x');
    await mkdir(root, { recursive: true });
    const a = await store.appendProject({ root, title: 'A', body: '第一条内容' });
    const b = await store.appendProject({ root, title: 'B', body: '第二条内容' });
    const indexPath = join(dir, 'projects', a.slug, 'MEMORY.md');
    await rm(indexPath, { force: true });
    const listed = await store.listProject(a.slug);
    assert.equal(listed.rebuilt, true);
    assert.deepEqual(listed.entries.map((e) => e.id).sort(), [a.id, b.id].sort());
    // 重建后的索引必须落盘（下次注入直接读到，不重复扫目录）
    const text = await readFile(indexPath, 'utf8');
    assert.ok(text.includes(a.id) && text.includes(b.id));
    // 追加时索引缺失也不应产生重复行
    await rm(indexPath, { force: true });
    const c = await store.appendProject({ root, title: 'C', body: '第三条内容' });
    const after = await readFile(indexPath, 'utf8');
    const lines = after.split('\n').filter((l) => l.startsWith('- ['));
    assert.equal(lines.length, 3);
    assert.ok(after.includes(c.id));
    // 手工清空索引内容也能重建
    await writeFile(indexPath, '# 项目记忆 · repo-x\n', 'utf8');
    const again = await store.listProject(a.slug);
    assert.equal(again.rebuilt, true);
    assert.equal(again.entries.length, 3);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('project: forgetProjectEntry 删文件 + 删索引行（条目文件不存在时报 removed:false）', async () => {
  const { dir, store } = await tempStore();
  try {
    const root = join(dir, 'repo-y');
    await mkdir(root, { recursive: true });
    const a = await store.appendProject({ root, title: 'A', body: '要删掉的内容' });
    const b = await store.appendProject({ root, title: 'B', body: '要留下的内容' });
    const res = await store.forgetProjectEntry(a.slug, a.id);
    assert.equal(res.removed, true);
    const listed = await store.listProject(a.slug);
    assert.deepEqual(listed.entries.map((e) => e.id), [b.id]);
    await assert.rejects(readFile(a.path, 'utf8'));
    const missing = await store.forgetProjectEntry(a.slug, 'p_00000000');
    assert.equal(missing.removed, false);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('forgetById: 按前缀分发到全局/项目，坏 id 直接返回未删除', async () => {
  const { dir, store } = await tempStore();
  try {
    const root = join(dir, 'repo-z');
    await mkdir(root, { recursive: true });
    const g = await store.appendGlobal({ text: '全局一条' });
    const p = await store.appendProject({ root, title: 'P', body: '项目一条' });
    assert.equal((await store.forgetById(g.id)).scope, 'global');
    const res = await store.forgetById(p.id);
    assert.equal(res.scope, 'project');
    assert.equal(res.slug, p.slug);
    assert.equal((await store.forgetById('nonsense')).removed, false);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('stats: 全局/项目条目数与数据目录', async () => {
  const { dir, store } = await tempStore();
  try {
    const root = join(dir, 'repo-s');
    await mkdir(root, { recursive: true });
    await store.appendGlobal({ text: 'g1' });
    await store.appendProject({ root, title: 'P1', body: 'p1' });
    const slug = (await store.listProjectSlugs())[0];
    const s = await store.stats(slug);
    assert.equal(s.dataDir, dir);
    assert.equal(s.globalCount, 1);
    assert.equal(s.projectCount, 1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('纯函数: 摘要 / 一行化 / 小节名 / 标签 / 相关度', () => {
  assert.equal(summaryOf('# 标题\n\n正文第一行\n第二行'), '正文第一行');
  assert.equal(summaryOf('- 列表项内容'), '列表项内容');
  assert.equal(summaryOf(''), '');
  assert.equal(oneLine('a\n b\tc'), 'a b c');
  assert.equal(normalizeSection('## 称呼'), '称呼');
  assert.equal(normalizeSection('   '), '杂项');
  assert.deepEqual(normalizeTags('a, b，a , c'), ['a', 'b', 'c']);
  // 中文靠 bigram 命中，英文靠整词
  assert.ok(matchScore('配置', 'DSH 插件 Config 用 schemastery，配置要写 default') > 0);
  assert.ok(matchScore('schemastery', 'DSH 插件 Config 用 schemastery') > 0);
  assert.equal(matchScore('完全不相关的词', 'DSH 插件 Config 用 schemastery'), 0);
});

test('serializeEntryFile: 多行正文与标签 JSON 往返', () => {
  const src = serializeEntryFile({
    id: 'p_1a2b3c4d',
    title: '标题里带冒号: 也没事',
    created: 1762146000000,
    tags: ['插件', 'api'],
    body: '第一行\n\n- 列表\n- 列表2',
  });
  assert.ok(src.includes('title: 标题里带冒号: 也没事'));
  assert.ok(src.includes('tags: ["插件","api"]'));
  assert.ok(src.includes('- 列表2'));
});
