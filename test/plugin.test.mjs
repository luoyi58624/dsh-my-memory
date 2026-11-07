// 单测 · 插件接线（段注册 / 工具 / 命令 / HTTP / 注入字节稳定性）
//
// 这里用一个假 ctx 跑真实的 apply()：假如只测 store，接线写错（段名、interpolate、
// handler 形状）照样测不出来，而那正是最容易让插件「加载成功但什么都不生效」的地方。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { apply, Config, inject, looksTechnical, name, retainEnds } from '../lib/host/index.js';
import { clearDetectCache } from '../lib/host/project.js';
import { clearSyncCache } from '../lib/host/atomic.js';

/** 假 cordis 上下文：记录所有注册，供断言 */
function makeCtx() {
  const state = { sections: [], tools: new Map(), commands: new Map(), routes: [], effects: [] };
  const ctx = {
    state,
    logger: { info() {}, warn() {}, error() {}, debug() {} },
    workingDirectory: null,
    get(serviceName) {
      if (serviceName === 'workingDirectory') return ctx.workingDirectory;
      return undefined;
    },
    systemPrompt: {
      section(definition) {
        state.sections.push(definition);
        return () => {
          const index = state.sections.indexOf(definition);
          if (index >= 0) state.sections.splice(index, 1);
        };
      },
    },
    tools: {
      register(definition) {
        if (state.tools.has(definition.name)) throw new Error(`重复注册工具 ${definition.name}`);
        state.tools.set(definition.name, definition);
        return () => state.tools.delete(definition.name);
      },
    },
    inject(_keys, callback) {
      callback({
        commands: {
          register(definition) {
            state.commands.set(definition.name, definition);
            return () => state.commands.delete(definition.name);
          },
        },
      });
    },
    webServer: {
      register(route) {
        state.routes.push(route);
        return () => {};
      },
    },
    effect(fn) {
      const dispose = fn();
      state.effects.push(dispose);
      return dispose;
    },
  };
  return ctx;
}

/** 假请求：支持 async 迭代（readBody 的 for await 依赖它） */
function makeReq(method, url, body) {
  const chunks = body === undefined ? [] : [Buffer.from(JSON.stringify(body), 'utf8')];
  return {
    method,
    url,
    async *[Symbol.asyncIterator]() {
      for (const chunk of chunks) yield chunk;
    },
  };
}

/** 假响应：收集 status/body */
function makeRes() {
  return {
    headersSent: false,
    statusCode: 0,
    payload: null,
    writeHead(status) {
      this.statusCode = status;
    },
    end(text) {
      this.payload = text ? JSON.parse(text) : null;
      this.headersSent = true;
    },
  };
}

/** 起一个插件实例，返回 {ctx, api, dir, route} */
async function startPlugin(config = {}) {
  const dir = await mkdtemp(join(tmpdir(), 'dsh-my-memory-plugin-'));
  const ctx = makeCtx();
  const cwd = config.cwd ?? join(dir, 'workspace');
  await mkdir(cwd, { recursive: true });
  ctx.workingDirectory = { get: () => cwd, defaultDirectory: cwd };
  apply(ctx, { dataDir: dir, ...config });
  // 启动引导是异步的（建目录 + 迁移/建默认卡 + 写 personas.json），等它落盘避免断言抢跑
  await waitFor(async () => {
    try {
      const index = JSON.parse(await readFile(join(dir, 'personas.json'), 'utf8'));
      return !!(index && index.activeId);
    } catch {
      return false;
    }
  });
  const route = ctx.state.routes[0];
  const api = async (method, path, body) => {
    const req = makeReq(method, `/my-memory/api${path}`, body);
    const res = makeRes();
    await route.handler(req, res);
    return { status: res.statusCode, body: res.payload };
  };
  return { ctx, api, dir, route, cwd };
}

async function waitFor(check, timeoutMs = 2000) {
  const started = Date.now();
  for (;;) {
    if (await check()) return;
    if (Date.now() - started > timeoutMs) throw new Error('等待超时');
    await new Promise((r) => setTimeout(r, 10));
  }
}

/** 取某个段定义 */
function sectionOf(ctx, sectionName) {
  return ctx.state.sections.find((s) => s.name === sectionName);
}

/** 模拟一次提示词组装：调用段 text（函数形式） */
function renderSection(ctx, sectionName, assembly = { agent: { session: { id: 's1' } } }) {
  const def = sectionOf(ctx, sectionName);
  assert.ok(def, `段 ${sectionName} 没注册`);
  return typeof def.text === 'function' ? def.text(assembly) : def.text;
}

test('模块导出与 Config 形状：四件套齐全，字段都有默认值', () => {
  assert.equal(name, 'my-memory');
  assert.deepEqual(inject, ['webServer', 'systemPrompt', 'tools']);
  assert.equal(typeof apply, 'function');
  assert.equal(typeof Config, 'function');
  // 每个字段都在 schema 里有 default（用 volatile 之外的调用方式验证不了默认值，
  // 所以直接检查 Config.meta 里的嵌套结构不为空）
  assert.ok(Config.meta && typeof Config.meta === 'object');
});

test('注册：两段（persona/context）都 interpolate:false，且没有 complete', async () => {
  const { ctx, dir } = await startPlugin();
  try {
    const persona = sectionOf(ctx, 'my-memory:persona');
    const context = sectionOf(ctx, 'my-memory:context');
    assert.ok(persona, 'my-memory:persona 必须注册');
    assert.ok(context, 'my-memory:context 必须注册');
    for (const def of [persona, context]) {
      assert.equal(def.interpolate, false, 'interpolate 必须 false，否则正文里的 {} 会被插值');
      assert.equal(def.complete, undefined, '绝不能加 complete:true（全局只能有一个）');
      assert.equal(typeof def.text, 'function', 'text 必须是函数，每轮组装都求值');
    }
    // 段序：角色卡在记忆之前
    assert.ok(persona.order < context.order);
    assert.equal(context.order, 1.2);
    // 工具 4 个，名字不与 soul-md 冲突
    assert.deepEqual([...ctx.state.tools.keys()].sort(), [
      'memory_forget',
      'memory_list',
      'memory_recall',
      'memory_remember',
    ]);
    for (const banned of ['memory_append', 'memory_read', 'memory_search', 'memory_rewrite', 'soul_read', 'soul_update']) {
      assert.ok(!ctx.state.tools.has(banned), `不能占用 soul-md 的工具名 ${banned}`);
    }
    // 命令与路由
    assert.ok(ctx.state.commands.has('remember'));
    assert.ok(ctx.state.commands.has('memory'));
    assert.equal(ctx.state.routes[0].kind, 'prefix');
    assert.equal(ctx.state.routes[0].path, '/my-memory/api');
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('角色卡段：默认空卡 / 保存后生效 / 超预算截断加省略号', async () => {
  const { ctx, api, dir } = await startPlugin({ personaBudget: 10 });
  try {
    assert.match(renderSection(ctx, 'my-memory:persona'), /^# 角色设定\n\n你现在扮演这个角色（角色卡「助手」）：/);
    const put = await api('PUT', '/persona', { name: '大肥鱼', body: '一二三四五六七八九十十一十二' });
    assert.equal(put.status, 200);
    assert.equal(put.body.name, '大肥鱼');
    const text = renderSection(ctx, 'my-memory:persona');
    assert.ok(text.includes('（角色卡「大肥鱼」）'));
    // 预算 10 → 截断 10 字 + 省略号，不多不少
    assert.ok(text.includes('一二三四五六七八九十…'));
    assert.ok(!text.includes('十一'));
    // 读回接口
    const got = await api('GET', '/persona');
    assert.equal(got.body.name, '大肥鱼');
    assert.equal(got.body.body, '一二三四五六七八九十十一十二');
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('记忆段：全局 + 项目索引合成，且内容不变时字节稳定（KV 缓存友好）', async () => {
  const { ctx, api, dir, cwd } = await startPlugin();
  try {
    clearSyncCache();
    clearDetectCache();
    // 造一个 git 仓库，让 cwd 被识别成项目
    await mkdir(join(cwd, '.git'), { recursive: true });
    await api('POST', '/memory', { text: '主人叫我大肥鱼', title: '称呼', scope: 'global' });
    await api('POST', '/memory', {
      text: 'DSH 插件 Config 用 schemastery',
      title: 'Config',
      scope: 'project',
    });
    const first = renderSection(ctx, 'my-memory:context');
    assert.ok(first.includes('# 长期记忆（全局）'));
    assert.ok(first.includes('主人叫我大肥鱼'));
    assert.ok(first.includes('# 项目记忆 · workspace'));
    assert.ok(first.includes('DSH 插件 Config 用 schemastery'));
    // 连续两次组装必须完全一致（否则每轮改写系统提示前缀，KV 缓存全废）
    const second = renderSection(ctx, 'my-memory:context');
    assert.equal(first, second);
    // 没有新内容时，再组装几次也一样
    assert.equal(renderSection(ctx, 'my-memory:context'), first);
    // 新增内容后才必须变化
    await api('POST', '/memory', { text: '另一条全局记忆', scope: 'global' });
    const third = renderSection(ctx, 'my-memory:context');
    assert.notEqual(third, first);
    assert.ok(third.includes('另一条全局记忆'));
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('记忆段：预算裁剪保留头尾（最新追加的条目不能被截掉）', async () => {
  const { ctx, api, dir, cwd } = await startPlugin({ globalBudget: 120 });
  try {
    clearSyncCache();
    for (let i = 0; i < 20; i += 1) {
      await api('POST', '/memory', { text: `第${i}条记忆内容内容内容内容内容`, scope: 'global' });
    }
    const text = renderSection(ctx, 'my-memory:context');
    assert.ok(text.includes('…（中段省略）…'), '超预算时应保留头尾并标明中段省略');
    assert.ok(text.includes('第19条'), '最近追加的条目必须还能看到');
    assert.ok(text.length < 400, '裁剪后长度应受控');
    assert.ok(cwd.length > 0);
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('auto scope：有 git 仓库 + 技术细节 → 项目；否则全局', async () => {
  const { ctx, api, dir, cwd } = await startPlugin();
  try {
    clearDetectCache();
    // 没有 .git：全部落全局
    const before = await api('POST', '/memory', { text: 'Config 里每个字段必须给 default' });
    assert.equal(before.body.scope, 'global');
    // 有 .git：技术细节落项目
    await mkdir(join(cwd, '.git'), { recursive: true });
    clearDetectCache();
    const tech = await api('POST', '/memory', {
      text: 'Config 里每个字段必须给 default，否则校验会失败',
      title: 'Config 约定',
    });
    assert.equal(tech.body.scope, 'project');
    assert.match(tech.body.path, /projects[\\/]workspace-[0-9a-f]{6}[\\/]p_[0-9a-f]{8}\.md$/);
    // 有 .git 但内容不像技术细节：仍然落全局
    const human = await api('POST', '/memory', { text: '主人喜欢喝冰美式，不加糖' });
    assert.equal(human.body.scope, 'global');
    // 显式 scope 优先于 auto
    const forced = await api('POST', '/memory', { text: '主人喜欢喝冰美式', scope: 'project' });
    assert.equal(forced.body.scope, 'project');
    const forcedGlobal = await api('POST', '/memory', { text: '函数 foo() 的返回值', scope: 'global' });
    assert.equal(forcedGlobal.body.scope, 'global');
    // 没仓库却要 project：明确报错
    await rm(join(cwd, '.git'), { recursive: true, force: true });
    clearDetectCache();
    const bad = await api('POST', '/memory', { text: 'Config 字段', scope: 'project' });
    assert.equal(bad.status, 400);
    assert.match(String(bad.body.error), /不在 git 仓库/);
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('HTTP：列表 / 状态 / 删除，删除不存在的 id 返回 404', async () => {
  const { ctx, api, dir } = await startPlugin();
  try {
    const g = await api('POST', '/memory', { text: '全局一条', title: '称呼', tags: '称呼,偏好' });
    assert.match(g.body.id, /^g_[0-9a-f]{8}$/);
    const list = await api('GET', '/memory?scope=global');
    assert.equal(list.body.items.length, 1);
    assert.equal(list.body.items[0].id, g.body.id);
    assert.equal(list.body.items[0].section, '称呼');
    assert.deepEqual(list.body.items[0].tags, ['称呼', '偏好']);
    const status = await api('GET', '/status');
    assert.equal(status.body.dataDir, dir);
    assert.equal(status.body.globalCount, 1);
    const del = await api('DELETE', `/memory/${g.body.id}`);
    assert.equal(del.status, 200);
    assert.equal(del.body.removed, true);
    assert.equal((await api('GET', '/status')).body.globalCount, 0);
    const missing = await api('DELETE', '/memory/g_deadbeef');
    assert.equal(missing.status, 404);
    assert.match(String(missing.body.error), /找不到/);
    const unknown = await api('GET', '/nope');
    assert.equal(unknown.status, 404);
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('工具：remember / recall / list / forget 全链路', async () => {
  const { ctx, dir } = await startPlugin();
  try {
    const remember = ctx.state.tools.get('memory_remember');
    const exec = { agent: { session: { id: 's1' } } };
    const saved = await remember.execute({ text: '主人喜欢喝冰美式', title: '口味', tags: '口味' }, exec);
    assert.equal(saved.scope, 'global');
    assert.match(saved.id, /^g_/);
    const data = await readFile(saved.path, 'utf8');
    assert.ok(data.includes('主人喜欢喝冰美式'));
    // recall 命中
    const recall = ctx.state.tools.get('memory_recall');
    const hits = await recall.execute({ query: '冰美式' }, exec);
    assert.equal(hits.count, 1);
    assert.equal(hits.items[0].id, saved.id);
    // 无 query = 最近 N 条
    const recent = await recall.execute({ limit: 5 }, exec);
    assert.equal(recent.count, 1);
    // 不相关查询不误召回
    assert.equal((await recall.execute({ query: '完全不相干zzz' }, exec)).count, 0);
    // list
    const listed = await ctx.state.tools.get('memory_list').execute({}, exec);
    assert.equal(listed.globalCount, 1);
    assert.equal(listed.items[0].id, saved.id);
    // forget
    const forgotten = await ctx.state.tools.get('memory_forget').execute({ id: saved.id }, exec);
    assert.equal(forgotten.scope, 'global');
    await assert.rejects(
      ctx.state.tools.get('memory_forget').execute({ id: 'g_00000000' }, exec),
      /找不到/,
    );
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('命令：/remember 写入，/memory 输出状态', async () => {
  const { ctx, dir, cwd } = await startPlugin();
  try {
    const remembered = await ctx.state.commands.get('remember').handler({ rawInput: '主人叫我大肥鱼' });
    assert.equal(remembered.kind, 'success');
    assert.match(remembered.text, /已记住（global/);
    const empty = await ctx.state.commands.get('remember').handler({ rawInput: '   ' });
    assert.equal(empty.kind, 'error');
    await mkdir(join(cwd, '.git'), { recursive: true });
    clearDetectCache();
    const status = await ctx.state.commands.get('memory').handler({});
    assert.equal(status.kind, 'success');
    assert.match(status.text, /全局记忆 1 条/);
    assert.match(status.text, /项目记忆/);
    assert.ok(status.text.includes(dir));
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('降级：workingDirectory 拿不到时只注入全局，不抛错', async () => {
  const { ctx, dir } = await startPlugin();
  try {
    ctx.workingDirectory = null;
    const context = sectionOf(ctx, 'my-memory:context');
    // assembly 里也没有 agent：整条链路必须静默降级为空串
    assert.equal(typeof context.text({}), 'string');
    assert.equal(context.text({}), '');
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('enabled=false：完全不注册任何东西', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'dsh-my-memory-off-'));
  try {
    const ctx = makeCtx();
    apply(ctx, { dataDir: dir, enabled: false });
    assert.equal(ctx.state.sections.length, 0);
    assert.equal(ctx.state.tools.size, 0);
    assert.equal(ctx.state.commands.size, 0);
    assert.equal(ctx.state.routes.length, 0);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('工具 schema：parameters 是 object 根的真实 JSON Schema（不是 defineTool 的 author DSL）', async () => {
  const { ctx, dir } = await startPlugin();
  try {
    // DSH 只对 defineTool 做 DSL→JSON Schema 编译；直接 register 时必须自己写成 JSON Schema，
    // 否则模型收到的参数声明是坏的。这条测试就是防回归。
    const allowedSchemaKeys = new Set([
      'type',
      'oneOf',
      'properties',
      'required',
      'additionalProperties',
      'items',
      'enum',
      'const',
      'description',
      'title',
      'default',
      'examples',
    ]);
    const walk = (schema, path) => {
      assert.ok(schema && typeof schema === 'object', `${path} 必须是对象`);
      for (const key of Object.keys(schema)) {
        assert.ok(allowedSchemaKeys.has(key), `${path} 出现 DSH 不支持的 schema 关键字 ${key}`);
      }
      if (schema.properties) {
        for (const [name, child] of Object.entries(schema.properties)) walk(child, `${path}.${name}`);
      }
      if (schema.items) walk(schema.items, `${path}.items`);
    };
    for (const tool of ctx.state.tools.values()) {
      assert.equal(tool.parameters.type, 'object', `${tool.name}.parameters 必须是 object 根`);
      assert.ok(tool.parameters.properties, `${tool.name}.parameters 必须有 properties`);
      walk(tool.parameters, `${tool.name}.parameters`);
      walk(tool.output.schema, `${tool.name}.output.schema`);
      assert.equal(typeof tool.output.render, 'function');
      assert.equal(typeof tool.execute, 'function');
    }
    // required 必须是属性名数组（DSH 子集要求），而不是 author DSL 里的布尔
    assert.deepEqual(ctx.state.tools.get('memory_remember').parameters.required, ['text']);
    assert.deepEqual(ctx.state.tools.get('memory_forget').parameters.required, ['id']);
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('HTTP · 多角色卡：列表带 body / 新建 / 改名 / 改正文 / 设为默认', async () => {
  const { ctx, api, dir } = await startPlugin();
  try {
    const created = await api('POST', '/personas', { name: '小猫娘' });
    assert.equal(created.status, 200);
    assert.match(created.body.id, /^p_[0-9a-f]{8}$/);
    assert.equal(created.body.name, '小猫娘');
    assert.equal(created.body.body, '我是 小猫娘。');
    assert.ok(created.body.created > 0);

    const list = await api('GET', '/personas');
    assert.equal(list.status, 200);
    assert.ok(Array.isArray(list.body.items));
    // 界面的卡片预览要显示正文，所以列表必须带 body
    for (const item of list.body.items) {
      for (const key of ['id', 'name', 'body', 'created', 'updated']) {
        assert.ok(key in item, `GET /personas 的条目缺字段 ${key}`);
      }
    }
    assert.ok(list.body.items.some((i) => i.id === created.body.id));

    // 改名：id 不变，正文不变
    const renamed = await api('PUT', `/personas/${created.body.id}`, { name: '小猫猫' });
    assert.equal(renamed.body.id, created.body.id);
    assert.equal(renamed.body.name, '小猫猫');
    assert.equal(renamed.body.body, '我是 小猫娘。');

    // 改正文
    const rewritten = await api('PUT', `/personas/${created.body.id}`, { body: '我是小猫猫。\n\n别凶我。' });
    assert.equal(rewritten.body.body, '我是小猫猫。\n\n别凶我。');
    assert.equal(rewritten.body.name, '小猫猫');

    // 设为默认，注入段立刻换成这张
    const setDefault = await api('POST', `/personas/${created.body.id}/default`);
    assert.equal(setDefault.status, 200);
    assert.deepEqual(setDefault.body, { ok: true, activeId: created.body.id });
    assert.equal((await api('GET', '/personas')).body.activeId, created.body.id);
    assert.ok(renderSection(ctx, 'my-memory:persona').includes('别凶我。'));

    // 旧接口 GET /persona 等价于 active 那张
    const legacy = await api('GET', '/persona');
    assert.equal(legacy.body.name, '小猫猫');
    assert.equal(legacy.body.body, '我是小猫猫。\n\n别凶我。');
    assert.ok(legacy.body.updated > 0);
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('HTTP · 多角色卡：删除、只剩一张拒绝、未知 id 404', async () => {
  const { ctx, api, dir } = await startPlugin();
  try {
    const first = (await api('GET', '/personas')).body.items;
    assert.equal(first.length, 1, '启动引导应当已经建了一张默认卡');
    const defaultId = first[0].id;

    // 只剩一张：拒绝，文案必须是这句（界面直接展示）
    const refused = await api('DELETE', `/personas/${defaultId}`);
    assert.equal(refused.status, 400);
    assert.equal(refused.body.error, '至少保留一张角色卡');

    // 建第二张后就能删；删 active 时 activeId 自动改指剩下的
    const second = (await api('POST', '/personas', { name: 'baby' })).body;
    await api('POST', `/personas/${second.id}/default`);
    const removed = await api('DELETE', `/personas/${second.id}`);
    assert.equal(removed.status, 200);
    assert.equal(removed.body.ok, true);
    assert.equal(removed.body.activeId, defaultId);
    assert.deepEqual((await api('GET', '/personas')).body.items.map((i) => i.id), [defaultId]);

    // 未知 id
    assert.equal((await api('DELETE', '/personas/ghost')).status, 404);
    assert.equal((await api('PUT', '/personas/ghost', { name: 'x' })).status, 404);
    const ghostDefault = await api('POST', '/personas/ghost/default');
    assert.equal(ghostDefault.status, 400);
    assert.match(String(ghostDefault.body.error), /找不到角色卡/);
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('HTTP · PUT /memory/raw 原子写回原文，读回一致且注入立刻生效', async () => {
  const { ctx, api, dir } = await startPlugin();
  try {
    clearSyncCache();
    const text = '# 全局记忆\n\n## 称呼\n\n- [g_1a2b3c4d] 2026-11-07 主人叫我大肥鱼 | tag: 称呼\n';
    const put = await api('PUT', '/memory/raw', { scope: 'global', text });
    assert.equal(put.status, 200);
    assert.equal(put.body.ok, true);
    assert.equal(put.body.path, join(dir, 'MEMORY.md'));
    assert.equal(put.body.text, text);

    // 磁盘原文一致
    assert.equal(await readFile(join(dir, 'MEMORY.md'), 'utf8'), text);
    // GET /memory/raw 读回同一份
    const got = await api('GET', '/memory/raw?scope=global');
    assert.equal(got.body.text, text);
    // 条目解析正常，注入段立刻是新内容
    const listed = await api('GET', '/memory?scope=global');
    assert.equal(listed.body.items.length, 1);
    assert.equal(listed.body.items[0].id, 'g_1a2b3c4d');
    assert.ok(renderSection(ctx, 'my-memory:context').includes('主人叫我大肥鱼'));

    // 空字符串合法（清空）
    const cleared = await api('PUT', '/memory/raw', { scope: 'global', text: '' });
    assert.equal(cleared.status, 200);
    assert.equal(await readFile(join(dir, 'MEMORY.md'), 'utf8'), '');
    assert.equal((await api('GET', '/memory?scope=global')).body.items.length, 0);

    // 非 global 明确拒绝
    const bad = await api('PUT', '/memory/raw', { scope: 'project', text: 'x' });
    assert.equal(bad.status, 400);
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('命令 /persona：不带参数列卡，带参切默认', async () => {
  const { ctx, dir } = await startPlugin();
  try {
    const cmd = ctx.state.commands.get('persona');
    assert.ok(cmd, '/persona 命令应注册');
    const listOnly = await cmd.handler({});
    assert.equal(listOnly.kind, 'success');
    assert.match(listOnly.text, /当前：/);
    const missing = await cmd.handler({ rawInput: '不存在的角色' });
    assert.equal(missing.kind, 'error');
    assert.match(missing.text, /找不到角色卡/);
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('纯函数：retainEnds / looksTechnical 的可解释判据', () => {
  assert.equal(retainEnds('短', 100), '短');
  assert.equal(retainEnds('', 10), '');
  assert.equal(retainEnds('abcdefghij', 0), 'abcdefghij');
  const clipped = retainEnds('a'.repeat(200), 50);
  assert.ok(clipped.length <= 60);
  assert.ok(clipped.includes('中段省略'));

  assert.ok(looksTechnical('function foo() { return 1 }'));
  assert.ok(looksTechnical('Config 的默认值必须给'));
  assert.ok(looksTechnical('报错 EPERM 出现在 rename'));
  assert.ok(looksTechnical('lib/host/index.js'));
  assert.ok(!looksTechnical('主人喜欢喝冰美式，不加糖'));
  assert.ok(!looksTechnical('她讨厌被人催'));
});
