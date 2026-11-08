// 文档保存回归：版本冲突、目标身份、外部编辑和角色目录操作。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fsPromises, { mkdtemp, readFile, writeFile, rm, stat, utimes, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { syncBuiltinESMExports } from 'node:module';

import { contentRev, createMemoryStore, parsePersona, parsePersonaCard, serializePersona, serializePersonaCard, validatePersonaDir } from '../lib/host/store.js';
import { readText, readTextSync, writeTextAtomic } from '../lib/host/atomic.js';
import { readTextDocument, writeTextDocumentCas } from '../lib/host/text-document.js';

/** 所有测试只操作自己的临时目录。 */
async function fixture(t) {
  const dir = await mkdtemp(join(tmpdir(), 'dsh-memory-documents-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const store = createMemoryStore({ dataDir: dir, now: () => 1762146000000 });
  await store.createPersona({ dir: 'fish', name: '大肥鱼', body: 'alpha' });
  return { dir, store };
}

function documentApi(store, kind) {
  if (kind === '角色卡') {
    return {
      read: () => store.reloadPersona('fish'),
      write: (text, input = {}) => store.savePersonaCardCas('fish', { body: text, ...input }),
      body: (result) => result.body,
    };
  }
  if (kind === '角色记忆') {
    return {
      read: () => store.readPersonaMemory('fish'),
      write: (text, input = {}) => store.writePersonaMemoryCas({ personaId: 'fish', text, ...input }),
      body: (result) => result.text,
    };
  }
  return {
    read: () => store.readAgentPrompt(),
    write: (text, input = {}) => store.writeAgentPromptCas({ text, ...input }),
    body: (result) => result.text,
  };
}

for (const kind of ['全局提示', '角色卡', '角色记忆']) {
  test(kind + '：同版本并发保存只能有一份成功，冲突携带磁盘内容', async (t) => {
    const { store } = await fixture(t);
    const api = documentApi(store, kind);
    await api.write('原始');
    const base = await api.read();
    assert.equal(base.rev, contentRev(await readFile(base.path, 'utf8')));
    const results = await Promise.all([
      api.write('版本甲', { baseRev: base.rev, expectedPath: base.path }),
      api.write('版本乙', { baseRev: base.rev, expectedPath: base.path }),
    ]);
    const saved = results.filter((item) => item.ok);
    const conflicts = results.filter((item) => item.conflict);
    assert.equal(saved.length, 1);
    assert.equal(conflicts.length, 1);
    const disk = await api.read();
    assert.equal(api.body(disk), api.body(saved[0]));
    assert.equal(api.body(conflicts[0]), api.body(disk));
    assert.equal(conflicts[0].rev, disk.rev);
    assert.equal(saved[0].rev, contentRev(await readFile(base.path, 'utf8')));
  });

  test(kind + '：外部编辑后旧版本不能覆盖，确认 force 才能覆盖', async (t) => {
    const { store } = await fixture(t);
    const api = documentApi(store, kind);
    await api.write('初始');
    const base = await api.read();
    const raw = await readFile(base.path, 'utf8');
    await writeFile(base.path, raw.replace('初始', '外改'), 'utf8');
    const conflict = await api.write('旧草稿', { baseRev: base.rev, expectedPath: base.path });
    assert.equal(conflict.conflict, true);
    assert.equal(api.body(conflict), '外改');
    const forced = await api.write('已确认', { baseRev: base.rev, expectedPath: base.path, force: true });
    assert.equal(forced.ok, true);
    assert.equal(api.body(await api.read()), '已确认');
  });

  test(kind + '：内容相同的另一数据根也不能被旧页面强制覆盖', async (t) => {
    const first = await fixture(t);
    const second = await fixture(t);
    const apiA = documentApi(first.store, kind);
    const apiB = documentApi(second.store, kind);
    await apiA.write('同一正文');
    await apiB.write('同一正文');
    const seen = await apiA.read();
    const current = await apiB.read();
    assert.equal(seen.rev, current.rev);
    await assert.rejects(
      apiB.write('旧页面的草稿', { baseRev: seen.rev, expectedPath: seen.path, force: true }),
      (error) => error.status === 409 && error.code === 'DOCUMENT_MOVED',
    );
    assert.equal(apiB.body(await apiB.read()), '同一正文');
  });
}

test('角色卡列表、默认卡与重载返回实际磁盘原文的 rev', async (t) => {
  const { store } = await fixture(t);
  const original = await store.reloadPersona('fish');
  // 外部编辑器的换行及注释不应在算版本时被重新序列化。
  const raw = (await readFile(original.path, 'utf8')).replace(/\n/g, '\r\n') + '\r\n<!-- 手写备注 -->\r\n';
  await writeFile(original.path, raw, 'utf8');
  const listed = (await store.listPersonas()).items.find((item) => item.id === 'fish');
  const active = await store.readActivePersona();
  const reloaded = await store.reloadPersona('fish');
  for (const card of [listed, active, reloaded]) assert.equal(card.rev, contentRev(raw));
});


test('角色正文往返保留前后空行、CRLF、缩进和 Markdown 双空格', async (t) => {
  const { store } = await fixture(t);
  const bodies = [
    '\n\n  第一行  \n第二行\n\n',
    '\r\n  第一行  \r\n第二行\r\n\r\n  ',
    '末尾双空格  ',
    '',
  ];
  for (const body of bodies) {
    const serialized = serializePersonaCard({ name: '鱼', created: 1, updated: 2, body });
    assert.equal(parsePersonaCard(serialized, 'fish').body, body);
    assert.equal(parsePersona(serializePersona({ name: '鱼', updated: 2, body })).body, body);
    const before = await store.reloadPersona('fish');
    const saved = await store.savePersonaCardCas('fish', { body, baseRev: before.rev, expectedPath: before.path });
    assert.equal(saved.body, body);
    assert.equal((await store.reloadPersona('fish')).body, body);
    assert.equal(store.readActivePersonaSync().body, body);
    // 只改显示名也不能顺带清理正文格式。
    await store.savePersonaCardCas('fish', { name: '新名字', baseRev: saved.rev });
    assert.equal((await store.reloadPersona('fish')).body, body);
  }

  const plain = '\n  没有 frontmatter 的原文  \n\n';
  assert.equal(parsePersonaCard(plain, 'fish').body, plain);
  const body = '\r\n保留正文首行空白\r\n\r\n';
  const crlf = '---\r\nname: 鱼\r\ncreated: 1\r\nupdated: 2\r\n---\r\n\r\n' + body;
  assert.equal(parsePersonaCard(crlf, 'fish').body, body);
});

test('同尺寸、同 mtime 的外部修改会在下一次同步读取中生效', async (t) => {
  const { store } = await fixture(t);
  await store.writeAgentPrompt('old');
  await store.writePersonaMemory('fish', 'cold');
  const card = await store.reloadPersona('fish');
  const targets = [
    { path: store.paths.prompt, from: 'old', to: 'new', read: () => store.agentPromptTextSync() },
    { path: card.path, from: 'alpha', to: 'bravo', read: () => store.readActivePersonaSync().body },
    { path: store.personaMemoryFileOf('fish'), from: 'cold', to: 'warm', read: () => store.personaMemoryTextSync('fish') },
  ];
  const stamp = new Date('2020-01-01T00:00:00Z');
  for (const target of targets) {
    await utimes(target.path, stamp, stamp);
    const before = await stat(target.path);
    assert.equal(target.read(), target.from);
    const raw = await readFile(target.path, 'utf8');
    await writeFile(target.path, raw.replace(target.from, target.to), 'utf8');
    await utimes(target.path, stamp, stamp);
    const after = await stat(target.path);
    assert.equal(after.size, before.size);
    assert.equal(after.mtimeMs, before.mtimeMs);
    assert.equal(target.read(), target.to);
  }
});

test('追加角色记忆保留已有原文，并发追加不会吞掉其中一条', async (t) => {
  const { store, dir } = await fixture(t);
  const original = '# 自己写的笔记\n\n保留空行、格式和 {占位符}。';
  await store.writePersonaMemory('fish', original);
  const memories = ['爱喝冰美式', '喜欢雨天', '不吃香菜'];
  const results = await Promise.all(memories.map((text) => store.appendPersonaMemory('fish', text)));
  const disk = await store.readPersonaMemory('fish');
  assert.equal(disk.text, original + '\n' + memories.map((text) => '- ' + text + '\n').join(''));
  assert.equal(results.at(-1).rev, disk.rev);
  assert.equal(results.every((item) => item.personaId === 'fish'), true);
  await assert.rejects(readFile(join(dir, 'MEMORY.md')), (error) => error.code === 'ENOENT');
  await assert.rejects(store.appendPersonaMemory('fish', ' \n '), /记忆正文不能为空/);
  await assert.rejects(store.appendPersonaMemory('__none__', '不应保存'), /空白卡/);
});

test('改名移动角色记忆，并让已有会话继续使用同一角色', async (t) => {
  const { store, dir } = await fixture(t);
  await store.writePersonaMemory('fish', '这条记忆属于鱼。');
  await store.bindSessionPersona('chat-1', 'fish');
  const before = (await store.readSessionBindings())['chat-1'];
  const renamed = await store.renamePersona('fish', 'dolphin');
  assert.equal(renamed.id, 'dolphin');
  assert.equal(await store.sessionPersonaId('chat-1'), 'dolphin');
  assert.equal((await store.readSessionBindings())['chat-1'].boundAt, before.boundAt);
  assert.equal(store.sessionPersonaCardSync('chat-1').id, 'dolphin');
  assert.equal(store.personaMemoryTextSync('dolphin'), '这条记忆属于鱼。');
  assert.equal(store.readActivePersonaSync().id, 'dolphin');
  await assert.rejects(stat(join(dir, 'fish')), (error) => error.code === 'ENOENT');
});

test('改名之后排队到达的旧角色保存不能恢复旧目录', async (t) => {
  const { store, dir } = await fixture(t);
  await store.writePersonaMemory('fish', '原有记忆');
  const before = await store.reloadPersona('fish');
  const results = await Promise.allSettled([
    store.renamePersona('fish', 'dolphin'),
    store.savePersonaCardCas('fish', { body: '旧角色卡草稿', expectedPath: before.path, force: true }),
    store.writePersonaMemory('fish', '旧记忆草稿'),
    store.appendPersonaMemory('fish', '旧会话追加'),
  ]);
  assert.equal(results[0].status, 'fulfilled');
  for (const result of results.slice(1)) {
    assert.equal(result.status, 'rejected');
    assert.equal(result.reason.status, 404);
  }
  await assert.rejects(stat(join(dir, 'fish')), (error) => error.code === 'ENOENT');
  assert.equal(store.personaMemoryTextSync('dolphin'), '原有记忆');
});

test('先开始的保存完整结束后再改名，最新记忆会随目录一起移动', async (t) => {
  const { store } = await fixture(t);
  await Promise.all([
    store.writePersonaMemory('fish', '保存中的记忆'),
    store.renamePersona('fish', 'dolphin'),
  ]);
  assert.equal(store.personaMemoryTextSync('dolphin'), '保存中的记忆');
});

test('删除与旧保存排队时不复活角色，重建同名角色也不会继承旧绑定', async (t) => {
  const { store, dir } = await fixture(t);
  await store.createPersona({ dir: 'cat' });
  await store.bindSessionPersona('chat-1', 'fish');
  const results = await Promise.allSettled([
    store.deletePersona('fish'),
    store.savePersonaCard('fish', { body: '不应复活' }),
    store.writePersonaMemory('fish', '不应复活'),
  ]);
  assert.equal(results[0].status, 'fulfilled');
  for (const result of results.slice(1)) {
    assert.equal(result.status, 'rejected');
    assert.equal(result.reason.status, 404);
  }
  await assert.rejects(stat(join(dir, 'fish')), (error) => error.code === 'ENOENT');
  assert.equal(await store.sessionPersonaId('chat-1'), null);
  await store.createPersona({ dir: 'fish' });
  assert.equal(await store.sessionPersonaId('chat-1'), null);
});

test('并发创建同名角色只创建一次，显式空白默认不会被创建或删除覆盖', async (t) => {
  const { store } = await fixture(t);
  await store.setActivePersona('__none__');
  const results = await Promise.allSettled([
    store.createPersona({ dir: 'cat', body: '甲' }),
    store.createPersona({ dir: 'cat', body: '乙' }),
  ]);
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
  assert.equal(store.readActivePersonaSync().id, '__none__');
  await store.deletePersona('cat');
  assert.equal(store.readActivePersonaSync().id, '__none__');
  await assert.rejects(store.deletePersona('fish'), /至少保留一张角色卡/);
});

test('公共角色操作拒绝点号路径，外部手改绑定也不能读出数据根', async (t) => {
  const { store, dir } = await fixture(t);
  for (const id of ['.', '..', '../fish']) {
    assert.equal(validatePersonaDir(id).ok, false);
    await assert.rejects(store.reloadPersona(id), (error) => error.status === 400);
    await assert.rejects(store.savePersonaCardCas(id, { body: 'x' }), (error) => error.status === 400);
    await assert.rejects(store.renamePersona(id, 'new'), (error) => error.status === 400);
    await assert.rejects(store.deletePersona(id), (error) => error.status === 400);
    await assert.rejects(store.bindSessionPersona('chat-1', id), (error) => error.status === 400);
    assert.equal((await store.readPersonaMemory(id)).text, '');
  }
  await writeFile(join(dir, 'state', 'sessions.json'), JSON.stringify({ 'chat-1': { personaId: '..' } }));
  assert.equal(await store.sessionPersonaCard('chat-1'), null);
  assert.equal(store.sessionPersonaCardSync('chat-1'), null);
});

test('只把文件缺失视为空，实际读取失败必须报错且不能继续覆盖', async (t) => {
  const { dir } = await fixture(t);
  assert.equal(await readText(join(dir, 'missing.md')), null);
  assert.equal(readTextSync(join(dir, 'missing.md')), null);
  await assert.rejects(readText(dir));
  assert.throws(() => readTextSync(dir));
  await assert.rejects(readTextDocument(dir));
  await assert.rejects(writeTextDocumentCas(dir, { text: '不应写入', force: true }));
  assert.equal((await stat(dir)).isDirectory(), true);
});

test('角色文档写入不会自动恢复已被外部删掉的父目录', async (t) => {
  const { dir } = await fixture(t);
  const absent = join(dir, 'removed');
  await assert.rejects(
    writeTextDocumentCas(join(absent, 'MEMORY.md'), { text: '不应创建', createParent: false }),
    (error) => error.code === 'ENOENT',
  );
  await assert.rejects(stat(absent), (error) => error.code === 'ENOENT');
});

test('rename 失败且临时文件消失时仍须报错，失败不会堵住后续保存', async (t) => {
  const { dir } = await fixture(t);
  const path = join(dir, 'raw.md');
  await writeFile(path, '旧文档');
  const rename = t.mock.method(fsPromises, 'rename', async (temporary) => {
    await unlink(temporary).catch(() => {});
    throw Object.assign(new Error('模拟目录操作使临时文件消失'), { code: 'ENOENT' });
  });
  syncBuiltinESMExports();
  try {
    await assert.rejects(writeTextAtomic(path, '不能假装成功'), (error) => error.code === 'ENOENT');
    assert.ok(rename.mock.callCount() > 0);
    assert.equal(await readFile(path, 'utf8'), '旧文档');
  } finally {
    rename.mock.restore();
    syncBuiltinESMExports();
  }
  await writeTextAtomic(path, '后续保存');
  assert.equal(await readFile(path, 'utf8'), '后续保存');
});
