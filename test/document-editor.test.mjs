import test from 'node:test';
import assert from 'node:assert/strict';
import { createDocumentEditor } from '../lib/client/src/document-editor.js';
import { fetchGlobalPrompt, fetchPersonaMemory } from '../lib/client/src/api.js';
import { fetchPersonaById } from '../lib/client/src/personas.js';

const PATH = 'D:/memory/baby/MEMORY.md';
const doc = (text, rev = 'r1', path = PATH) => ({ text, rev, path });
const turn = () => new Promise((resolve) => setImmediate(resolve));
function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function failure(status, body) {
  const error = new Error(body.error || '请求失败');
  error.status = status;
  error.body = body;
  return error;
}

test('读取失败不变成空文档，也不能输入或保存', async () => {
  let writes = 0;
  const editor = createDocumentEditor({
    read: async () => { throw new Error('读取失败'); },
    write: async () => { writes += 1; return doc(''); },
  });
  assert.equal(await editor.refresh(), false);
  editor.change({ text: '不能在未知基线上编辑' });
  assert.equal(editor.getState().loaded, false);
  assert.equal(editor.getState().dirty, false);
  assert.equal(await editor.save(), false);
  assert.equal(writes, 0);
  assert.match(editor.getState().error, /读取失败/);
});

test('200 响应缺正文或正文类型错误时，不能成为可写空文档', async () => {
  const cases = [
    { fields: ['text'], response: { path: PATH, rev: 'r1' } },
    { fields: ['text'], response: { path: PATH, rev: 'r1', text: null } },
    { fields: ['name', 'body'], response: { path: PATH, rev: 'r1', name: '角色' } },
    { fields: ['name', 'body'], response: { path: PATH, rev: 'r1', name: 3, body: '正文' } },
  ];
  for (const { fields, response } of cases) {
    let writes = 0;
    const editor = createDocumentEditor({
      fields,
      read: async () => response,
      write: async () => { writes += 1; return response; },
    });
    assert.equal(await editor.refresh(), false);
    assert.equal(editor.getState().loaded, false);
    assert.equal(await editor.save(), false);
    assert.equal(writes, 0);
    assert.match(editor.getState().error, /正文不完整/);
  }
});

test('HTTP 适配层不把缺少的正文补成空串绕过文档验证', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    text: async () => JSON.stringify({ id: 'baby', path: PATH, rev: 'r1' }),
  });
  try {
    for (const [fields, read] of [
      [['text'], fetchGlobalPrompt],
      [['text'], () => fetchPersonaMemory('baby')],
      [['name', 'body'], () => fetchPersonaById('baby')],
    ]) {
      const editor = createDocumentEditor({ fields, read, write: async () => { throw new Error('不应写入'); } });
      assert.equal(await editor.refresh(), false);
      assert.equal(editor.getState().loaded, false);
      assert.match(editor.getState().error, /正文不完整/);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('保存的200响应缺正文时保留草稿与原基线，不声称保存成功', async () => {
  const editor = createDocumentEditor({
    read: async () => doc('A'),
    write: async () => ({ path: PATH, rev: 'r2' }),
  });
  await editor.refresh();
  editor.change({ text: 'B' });
  assert.equal(await editor.save(), false);
  assert.equal(editor.getState().draft.text, 'B');
  assert.equal(editor.getState().baseline.text, 'A');
  assert.equal(editor.getState().dirty, true);
});

test('Markdown 原文与尾部空白往返保留，写入带版本与文件身份', async () => {
  const text = '# 标题  \r\n\r\n内容 \t\r\n\r\n';
  let sent;
  const editor = createDocumentEditor({
    read: async () => doc('原文'),
    write: async (input) => { sent = input; return doc(input.text, 'r2'); },
  });
  await editor.refresh();
  editor.change({ text });
  assert.equal(await editor.flush(), true);
  assert.deepEqual(sent, { text, baseRev: 'r1', expectedPath: PATH });
  assert.equal(editor.getState().draft.text, text);
  assert.equal(editor.getState().baseline.text, text);
  assert.equal(editor.getState().dirty, false);
});

test('保存期间继续编辑并再次失焦，会按确认版本串行补存最新草稿', async () => {
  const first = deferred();
  const second = deferred();
  const calls = [];
  const editor = createDocumentEditor({
    read: async () => doc('A'),
    write: (input) => {
      calls.push(input);
      return calls.length === 1 ? first.promise : second.promise;
    },
  });
  await editor.refresh();
  editor.change({ text: 'B' });
  const save = editor.save();
  await turn();
  editor.change({ text: 'C' });
  assert.equal(editor.save(), save);
  first.resolve(doc('B', 'r2'));
  await turn();
  assert.equal(editor.getState().draft.text, 'C');
  assert.deepEqual(calls, [
    { text: 'B', baseRev: 'r1', expectedPath: PATH },
    { text: 'C', baseRev: 'r2', expectedPath: PATH },
  ]);
  second.resolve(doc('C', 'r3'));
  assert.equal(await save, true);
  assert.equal(editor.getState().dirty, false);
  assert.equal(editor.getState().document.rev, 'r3');
});

test('改名保存的旧回包不会擦掉同时输入的新角色正文', async () => {
  const first = deferred();
  const calls = [];
  const path = 'D:/memory/baby/agent.md';
  const editor = createDocumentEditor({
    fields: ['name', 'body'],
    read: async () => ({ name: '旧名', body: '旧正文', rev: 'r1', path }),
    write: (input) => {
      calls.push(input);
      return calls.length === 1
        ? first.promise
        : Promise.resolve({ name: input.name, body: input.body, rev: 'r3', path });
    },
  });
  await editor.refresh();
  editor.change({ name: '  新名  ' });
  const save = editor.save();
  await turn();
  editor.change({ body: '正在输入的新正文' });
  first.resolve({ name: '新名', body: '旧正文', rev: 'r2', path });
  assert.equal(await save, true);
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[1], {
    name: '新名', body: '正在输入的新正文', baseRev: 'r2', expectedPath: path,
  });
  assert.deepEqual(editor.getState().draft, { name: '新名', body: '正在输入的新正文' });
});

test('保存途中撤销到原文，也会在首个写入完成后把原文写回', async () => {
  const first = deferred();
  const calls = [];
  const editor = createDocumentEditor({
    read: async () => doc('A'),
    write: (input) => {
      calls.push(input);
      return calls.length === 1 ? first.promise : Promise.resolve(doc(input.text, 'r3'));
    },
  });
  await editor.refresh();
  editor.change({ text: 'B' });
  const save = editor.save();
  await turn();
  editor.change({ text: 'A' });
  first.resolve(doc('B', 'r2'));
  await save;
  assert.equal(calls[1].text, 'A');
  assert.equal(calls[1].baseRev, 'r2');
  assert.equal(editor.getState().draft.text, 'A');
  assert.equal(editor.getState().dirty, false);
});

test('乱序读取只接受最后发起的一次，不把旧磁盘结果盖回去', async () => {
  const oldRead = deferred();
  const newRead = deferred();
  let reads = 0;
  const editor = createDocumentEditor({
    read: () => ++reads === 1 ? oldRead.promise : newRead.promise,
    write: async () => { throw new Error('不应写入'); },
  });
  const first = editor.refresh();
  const second = editor.refresh();
  newRead.resolve(doc('新', 'r2'));
  await second;
  oldRead.resolve(doc('旧', 'r1'));
  await first;
  assert.equal(editor.getState().draft.text, '新');
  assert.equal(editor.getState().document.rev, 'r2');
});

test('保存前发出的聚焦读取不能覆盖保存后的新内容', async () => {
  const staleRead = deferred();
  let reads = 0;
  const editor = createDocumentEditor({
    read: () => ++reads === 1 ? Promise.resolve(doc('A')) : staleRead.promise,
    write: async (input) => doc(input.text, 'r2'),
  });
  await editor.refresh();
  const refresh = editor.refresh();
  editor.change({ text: 'B' });
  await editor.save();
  staleRead.resolve(doc('A'));
  await refresh;
  assert.equal(editor.getState().draft.text, 'B');
  assert.equal(editor.getState().document.rev, 'r2');
  assert.equal(editor.getState().conflict, null);
});

test('有草稿时刷新只标记外部冲突，离开失败，明确覆盖才写入', async () => {
  let disk = doc('A');
  const calls = [];
  const editor = createDocumentEditor({
    read: async () => disk,
    write: async (input) => { calls.push(input); return doc(input.text, 'r3'); },
  });
  await editor.refresh();
  editor.change({ text: '我的草稿' });
  disk = doc('外部编辑', 'r2');
  assert.equal(await editor.refresh(), false);
  assert.equal(editor.getState().draft.text, '我的草稿');
  assert.equal(editor.getState().conflict.document.text, '外部编辑');
  assert.equal(await editor.flush(), false);
  assert.equal(calls.length, 0);
  assert.equal(await editor.save({ force: true }), true);
  assert.deepEqual(calls[0], { text: '我的草稿', baseRev: 'r1', expectedPath: PATH, force: true });
});

test('409 保存冲突保留草稿，用户可明确使用磁盘版本', async () => {
  const editor = createDocumentEditor({
    read: async () => doc('A'),
    write: async () => {
      throw failure(409, { error: '磁盘变了', conflict: true, text: '外部内容', rev: 'r2' });
    },
  });
  await editor.refresh();
  editor.change({ text: '我的内容' });
  assert.equal(await editor.flush(), false);
  assert.equal(editor.getState().draft.text, '我的内容');
  assert.equal(editor.getState().dirty, true);
  assert.equal(editor.useDisk(), true);
  assert.equal(editor.getState().draft.text, '外部内容');
  assert.equal(editor.getState().dirty, false);
});

test('文件位置变化不能 force，只有明确重新读取才能重置编辑身份', async () => {
  let disk = doc('A');
  let writes = 0;
  const editor = createDocumentEditor({
    read: async () => disk,
    write: async () => {
      writes += 1;
      throw failure(409, { error: '文件位置变化', code: 'DOCUMENT_MOVED' });
    },
  });
  await editor.refresh();
  editor.change({ text: '旧目录草稿' });
  assert.equal(await editor.save(), false);
  assert.equal(editor.getState().moved, true);
  assert.equal(await editor.save({ force: true }), false);
  assert.equal(writes, 1);
  assert.equal(editor.getState().draft.text, '旧目录草稿');
  assert.equal(editor.discard(), true);
  assert.equal(editor.getState().moved, true);
  assert.equal(await editor.flush(), true);
  assert.equal(await editor.save({ force: true }), false);
  assert.equal(writes, 1);
  disk = doc('新目录原文', 'r9', 'E:/memory/baby/MEMORY.md');
  assert.equal(await editor.refresh({ discard: true }), true);
  assert.equal(editor.getState().draft.text, '新目录原文');
  assert.equal(editor.getState().document.path, disk.path);
  assert.equal(editor.getState().moved, false);
});

test('刷新发现路径变化同样保留草稿，不把另一份文件接到当前编辑器', async () => {
  let disk = doc('A');
  const editor = createDocumentEditor({ read: async () => disk, write: async () => disk });
  await editor.refresh();
  editor.change({ text: '未保存' });
  disk = doc('另一个根的数据', 'r1', 'E:/memory/baby/MEMORY.md');
  await editor.refresh();
  assert.equal(editor.getState().draft.text, '未保存');
  assert.equal(editor.getState().moved, true);
  assert.equal(editor.getState().document.path, PATH);
});

test('普通保存错误可重试，失败不清空草稿也不放行离开', async () => {
  let writes = 0;
  const editor = createDocumentEditor({
    read: async () => doc('A'),
    write: async (input) => {
      if (++writes === 1) throw new Error('网络断开');
      return doc(input.text, 'r2');
    },
  });
  await editor.refresh();
  editor.change({ text: 'B' });
  assert.equal(await editor.flush(), false);
  assert.equal(editor.getState().draft.text, 'B');
  assert.equal(editor.getState().dirty, true);
  assert.equal(await editor.flush(), true);
  assert.equal(editor.getState().dirty, false);
});

test('角色文件被外部删除后，可明确放弃草稿离开而不再读写磁盘', async () => {
  let reads = 0;
  let writes = 0;
  const missing = () => failure(404, { error: '找不到角色卡 baby' });
  const editor = createDocumentEditor({
    read: async () => {
      if (++reads > 1) throw missing();
      return doc('最后确认的正文');
    },
    write: async () => { writes += 1; throw missing(); },
  });
  await editor.refresh();
  editor.change({ text: '尚未保存的草稿' });
  assert.equal(await editor.flush(), false);
  assert.equal(await editor.refresh(), false);
  assert.equal(editor.getState().dirty, true);
  assert.equal(editor.discard(), true);
  assert.equal(editor.getState().draft.text, '最后确认的正文');
  assert.equal(editor.getState().dirty, false);
  assert.equal(await editor.flush(), true);
  assert.equal(reads, 2);
  assert.equal(writes, 1);
  assert.match(editor.getState().error, /找不到角色卡/);
});

test('写入尚未结束时不能放弃草稿并假装已经退出', async () => {
  const pending = deferred();
  const editor = createDocumentEditor({
    read: async () => doc('A'),
    write: () => pending.promise,
  });
  await editor.refresh();
  editor.change({ text: 'B' });
  const saving = editor.save();
  await turn();
  assert.equal(editor.discard(), false);
  assert.equal(editor.getState().draft.text, 'B');
  pending.resolve(doc('B', 'r2'));
  assert.equal(await saving, true);
});

test('卸载后的旧保存不回调到新的角色页面', async () => {
  const pending = deferred();
  let callbackCount = 0;
  const editor = createDocumentEditor({
    read: async () => doc('A'),
    write: () => pending.promise,
    onSaved: () => { callbackCount += 1; },
  });
  await editor.refresh();
  editor.change({ text: 'B' });
  const save = editor.save();
  await turn();
  editor.dispose();
  pending.resolve(doc('B', 'r2'));
  assert.equal(await save, false);
  assert.equal(callbackCount, 0);
});

test('开发模式重挂载后可重新读取，卸载前的旧请求仍被忽略', async () => {
  const oldRead = deferred();
  let reads = 0;
  const editor = createDocumentEditor({
    read: () => ++reads === 1 ? oldRead.promise : Promise.resolve(doc('新', 'r2')),
    write: async (input) => doc(input.text, 'r3'),
  });
  const stale = editor.refresh();
  editor.dispose();
  editor.activate();
  await editor.refresh();
  oldRead.resolve(doc('旧'));
  await stale;
  assert.equal(editor.getState().draft.text, '新');
});

test('全局提示词冲突后使用磁盘版本仍能恢复最初读取的默认正文', async () => {
  const editor = createDocumentEditor({
    read: async () => ({ ...doc('A'), defaultText: '默认正文' }),
    write: async () => { throw failure(409, { conflict: true, text: '磁盘内容', rev: 'r2' }); },
  });
  await editor.refresh();
  editor.change({ text: 'B' });
  await editor.save();
  assert.equal(editor.useDisk(), true);
  assert.equal(editor.getState().draft.text, '磁盘内容');
  assert.equal(editor.getState().document.defaultText, '默认正文');
});

test('保存响应未重复返回默认文本时保留读取时的元数据', async () => {
  const editor = createDocumentEditor({
    read: async () => ({ ...doc('A'), defaultText: '默认正文' }),
    write: async (input) => doc(input.text, 'r2'),
  });
  await editor.refresh();
  editor.change({ text: 'B' });
  await editor.save();
  assert.equal(editor.getState().document.defaultText, '默认正文');
});
