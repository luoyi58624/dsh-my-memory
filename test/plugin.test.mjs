// 单测 · 插件接线（段注册 / 命令 / HTTP / 注入字节稳定性）
//
// 这里用一个假 ctx 跑真实的 apply()：假如只测 store，接线写错（段名、interpolate、
// handler 形状）照样测不出来，而那正是最容易让插件「加载成功但什么都不生效」的地方。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, stat, utimes, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { apply, Config, inject, looksTechnical, name, retainEnds, revealCommandOf } from '../lib/host/index.js';
import { contentRev, DEFAULT_AGENT_PROMPT } from '../lib/host/store.js';
import { clearDetectCache } from '../lib/host/project.js';
import { clearSyncCache } from '../lib/host/atomic.js';

/** 假 cordis 上下文：记录所有注册，供断言 */
function makeCtx() {
  const state = {
    sections: [],
    tools: new Map(),
    commands: new Map(),
    routes: [],
    effects: [],
    services: new Map(),
  };
  const ctx = {
    state,
    logger: { info() {}, warn() {}, error() {}, debug() {} },
    workingDirectory: null,
    get(serviceName) {
      if (serviceName === 'workingDirectory') return ctx.workingDirectory;
      return state.services.get(serviceName);
    },
    provide(serviceName, value) {
      state.services.set(serviceName, value);
      return () => state.services.delete(serviceName);
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
async function startPlugin(config = {}, configure = () => {}) {
  const dir = await mkdtemp(join(tmpdir(), 'dsh-my-memory-plugin-'));
  const ctx = makeCtx();
  const cwd = config.cwd ?? join(dir, 'workspace');
  await mkdir(cwd, { recursive: true });
  ctx.workingDirectory = { get: () => cwd, defaultDirectory: cwd };
  configure(ctx);
  // 指针文件也指到临时目录：绝不能因为跑测试就改掉用户真实的 ~/.dsh/my-memory.roots.json
  apply(ctx, { dataDir: dir, rootPointerFile: join(dir, '.roots.json'), ...config });
  // 启动引导是异步的（建目录 + 迁移/建默认卡 + 写 state/personas.json + 建 AGENT.md），
  // 等它落盘避免断言抢跑。必须等到 AGENT.md 也出现：Windows 上测试结束得比引导快时，
  // 清理用的 rm(dir) 会和还在进行的写文件撞车（EBUSY: resource busy or locked）。
  await waitFor(async () => {
    try {
      const index = JSON.parse(await readFile(join(dir, 'state', 'personas.json'), 'utf8'));
      if (!(index && index.activeId)) return false;
      await stat(join(dir, 'AGENT.md'));
      return true;
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
  assert.deepEqual(inject, ['webServer', 'systemPrompt']);
  assert.equal(typeof apply, 'function');
  assert.equal(typeof Config, 'function');
  // 每个字段都在 schema 里有 default（用 volatile 之外的调用方式验证不了默认值，
  // 所以直接检查 Config.meta 里的嵌套结构不为空）
  assert.ok(Config.meta && typeof Config.meta === 'object');
});

test('注册：三段原文都禁止插值，默认依次放在宿主身份段之前', async () => {
  const { ctx, dir } = await startPlugin();
  try {
    const names = ['my-memory:agent', 'my-memory:persona', 'my-memory:paths', 'my-memory:context'];
    const sections = names.map((sectionName) => sectionOf(ctx, sectionName));
    assert.equal(ctx.state.sections.length, 4);
    for (const def of sections) {
      assert.ok(def, '四段都必须注册');
      assert.equal(def.interpolate, false, '正文里的 {{}} 必须作为原文保留');
      assert.equal(def.complete, undefined, '本插件不独占整个宿主提示词');
      assert.equal(typeof def.text, 'function');
    }
    // 路径约定用 +0.5 夹在角色卡与记忆之间，因此这里出现小数是预期行为
    assert.deepEqual(sections.map((section) => section.order), [-1003, -1002, -1001.5, -1001]);
    assert.equal(ctx.state.tools.size, 0);
    assert.ok(ctx.state.commands.has('remember'));
    assert.ok(ctx.state.commands.has('memory'));
    assert.equal(ctx.state.routes[0].kind, 'prefix');
    assert.equal(ctx.state.routes[0].path, '/my-memory/api');
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});
test('服务：兼容读取器与三段注册共用原文，没有另一套角色拼接规则', async () => {
  const { ctx, api, dir } = await startPlugin();
  try {
    await api('PUT', '/settings/prompt', { text: '全局要求。\n' });
    await api('PUT', '/personas/baby', { body: '角色正文。\n' });
    await api('PUT', '/persona/memory', { personaId: 'baby', text: '角色记忆。\n' });
    const service = ctx.state.services.get('myMemoryPrompt');
    assert.ok(service);
    const assembly = { agent: { session: { id: 's1' } } };
    assert.equal(service.promptRaw(assembly), renderSection(ctx, 'my-memory:agent', assembly));
    assert.equal(service.personaText(assembly), renderSection(ctx, 'my-memory:persona', assembly));
    assert.equal(service.personaRaw(assembly), service.personaText(assembly));
    assert.equal(service.contextText(assembly), renderSection(ctx, 'my-memory:context', assembly));
    assert.equal(service.memoryRaw(assembly), '角色记忆。\n');
    assert.equal(service.personaRaw(assembly), '角色正文。\n');
    assert.equal(service.promptRaw(assembly), '全局要求。\n');
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});
test('角色卡段：正文原样注入，显式预算仍兼容截断', async () => {
  const { ctx, api, dir } = await startPlugin({ personaBudget: 10 });
  try {
    assert.equal(renderSection(ctx, 'my-memory:persona'), '我是 助手。');
    const put = await api('PUT', '/persona', { name: '大肥鱼', body: '一二三四五六七八九十十一十二' });
    assert.equal(put.status, 200);
    assert.equal(put.body.name, '大肥鱼');
    const text = renderSection(ctx, 'my-memory:persona');
    // 预算 10 → 截断 10 字 + 省略号，不多不少
    assert.equal(text, '一二三四五六七八九十…');
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

/** 等某个文件出现（启动引导是异步的） */
async function waitForFile(file, timeoutMs = 2000) {
  await waitFor(async () => {
    try {
      await stat(file);
      return true;
    } catch {
      return false;
    }
  }, timeoutMs);
}

test('全局提示词：启动后在数据根建出 AGENT.md，默认值注入独立的 my-memory:agent 段', async () => {
  const { ctx, dir } = await startPlugin();
  try {
    const promptFile = join(dir, 'AGENT.md');
    await waitForFile(promptFile);
    // 文件内容是提示词本体：没有 frontmatter、没有标题
    assert.equal(await readFile(promptFile, 'utf8'), `${DEFAULT_AGENT_PROMPT}\n`);
    // 没改过就直接用默认值注入，且不挑会话（所有角色通用）
    const text = renderSection(ctx, 'my-memory:agent', { agent: { session: { id: 'sess-x' } } });
    assert.equal(text, await readFile(promptFile, 'utf8'));
    assert.ok(text.includes(DEFAULT_AGENT_PROMPT), text);
    // 它不再混进角色卡段：规矩和「这个人是谁」是两件事
    const personaText = renderSection(ctx, 'my-memory:persona', { agent: { session: { id: 'sess-x' } } });
    assert.ok(!personaText.includes(DEFAULT_AGENT_PROMPT), personaText);
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('全局提示词：PUT /settings/prompt 保存生效，空串 = 整节不再注入', async () => {
  const { ctx, api, dir } = await startPlugin();
  try {
    await waitForFile(join(dir, 'AGENT.md'));
    const got = await api('GET', '/settings/prompt');
    assert.equal(got.status, 200);
    assert.equal(got.body.path, join(dir, 'AGENT.md'));
    // 返回的是文件原文（建文件时末尾补了一个换行，方便编辑器打开）
    assert.equal(String(got.body.text).trim(), DEFAULT_AGENT_PROMPT);
    assert.equal(got.body.defaultText, DEFAULT_AGENT_PROMPT);
    assert.equal(got.body.exists, true);

    const saved = await api('PUT', '/settings/prompt', { text: '只说实话。' });
    assert.equal(saved.status, 200);
    assert.equal(saved.body.ok, true);
    assert.equal(await readFile(join(dir, 'AGENT.md'), 'utf8'), '只说实话。');
    const afterSave = renderSection(ctx, 'my-memory:agent', {
      agent: { session: { id: 'sess-x' } },
    });
    assert.equal(afterSave, '只说实话。');
    assert.ok(!afterSave.includes(DEFAULT_AGENT_PROMPT), '改过之后不该再注入默认值');

    // 清空 = 用户不要这段：整节消失（不是注入空标题）
    const cleared = await api('PUT', '/settings/prompt', { text: '' });
    assert.equal(cleared.status, 200);
    const afterClear = renderSection(ctx, 'my-memory:agent', {
      agent: { session: { id: 'sess-x' } },
    });
    assert.equal(afterClear, '', '清空后这一段整体消失，不留空标题');
    // 角色卡段本身还在
    assert.ok(
      renderSection(ctx, 'my-memory:persona', { agent: { session: { id: 'sess-x' } } }).includes('我是 助手。'),
    );

    // 缺失或非字符串不能被解释成清空；普通长文不再受旧的 4000 字限制。
    assert.equal((await api('PUT', '/settings/prompt', {})).status, 400);
    assert.equal((await api('PUT', '/settings/prompt', { text: 1 })).status, 400);
    const longPrompt = 'x'.repeat(4001);
    assert.equal((await api('PUT', '/settings/prompt', { text: longPrompt })).status, 200);
    assert.equal(renderSection(ctx, 'my-memory:agent'), longPrompt);
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('全局提示词：用户直接改 AGENT.md 也生效（不经面板）', async () => {
  const { ctx, dir } = await startPlugin();
  try {
    await waitForFile(join(dir, 'AGENT.md'));
    // 模拟用户用编辑器改文件：长度和默认值不同，mtime+size 缓存必然失效
    await writeFile(join(dir, 'AGENT.md'), '手改的提示词：别自称模型。\n', 'utf8');
    const text = renderSection(ctx, 'my-memory:agent', { agent: { session: { id: 'sess-x' } } });
    assert.ok(text.includes('手改的提示词：别自称模型。'), text);
    assert.ok(!text.includes(DEFAULT_AGENT_PROMPT), '手改之后默认值不该再出现');
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('记忆段：该角色长期记忆 + 项目索引合成，且内容不变时字节稳定（KV 缓存友好）', async () => {
  const { ctx, api, dir, cwd } = await startPlugin();
  try {
    clearSyncCache();
    clearDetectCache();
    // 造一个 git 仓库，并打开当前目录的局部记忆开关（默认是关的）
    await mkdir(join(cwd, '.git'), { recursive: true });
    await api('POST', '/project/state', { cwd, enabled: true });
    // 长期记忆是**每角色一份**：默认卡是 baby，就写它的 <root>/baby/MEMORY.md
    await api('PUT', '/persona/memory', { personaId: 'baby', text: '主人叫我大肥鱼。' });
    await api('POST', '/memory', {
      text: 'DSH 插件 Config 用 schemastery',
      title: 'Config',
      scope: 'project',
    });
    const first = renderSection(ctx, 'my-memory:context');
    assert.ok(first.startsWith('主人叫我大肥鱼。\n\n'), first);
    assert.ok(first.includes('主人叫我大肥鱼'));
    assert.ok(first.includes('# 项目记忆 · workspace'));
    assert.ok(first.includes('DSH 插件 Config 用 schemastery'));
    // 连续两次组装必须完全一致（否则每轮改写系统提示前缀，KV 缓存全废）
    const second = renderSection(ctx, 'my-memory:context');
    assert.equal(first, second);
    // 没有新内容时，再组装几次也一样
    assert.equal(renderSection(ctx, 'my-memory:context'), first);
    // 记忆内容变了才必须变化
    await api('PUT', '/persona/memory', { personaId: 'baby', text: '主人叫我大肥鱼。\n还是别自称模型。' });
    const third = renderSection(ctx, 'my-memory:context');
    assert.notEqual(third, first);
    assert.ok(third.includes('还是别自称模型。'));
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('记忆段：预算裁剪保留头尾（角色记忆太长时也不能把最近的截掉）', async () => {
  const { ctx, api, dir, cwd } = await startPlugin({ globalBudget: 120 });
  try {
    clearSyncCache();
    const lines = [];
    for (let i = 0; i < 20; i += 1) lines.push(`第${i}条记忆内容内容内容内容内容`);
    await api('PUT', '/persona/memory', { personaId: 'baby', text: lines.join('\n') });
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
    // 有 .git：技术细节落项目（现在写进 <cwd>/.dsh/MEMORY.md，且要先打开开关）
    await mkdir(join(cwd, '.git'), { recursive: true });
    clearDetectCache();
    await api('POST', '/project/state', { cwd, enabled: true });
    const tech = await api('POST', '/memory', {
      text: 'Config 里每个字段必须给 default，否则校验会失败',
      title: 'Config 约定',
    });
    assert.equal(tech.body.scope, 'project');
    assert.equal(tech.body.path, join(cwd, '.dsh', 'MEMORY.md'));
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

test('命令：/remember 追加默认角色记忆，/memory 输出该角色的字数和文件', async () => {
  const { ctx, dir } = await startPlugin();
  try {
    const memoryPath = join(dir, 'baby', 'MEMORY.md');
    const remembered = await ctx.state.commands.get('remember').handler({ rawInput: '主人叫我大肥鱼' });
    assert.equal(remembered.kind, 'success');
    assert.ok(remembered.text.includes(memoryPath));
    const stored = await readFile(memoryPath, 'utf8');
    assert.ok(stored.includes('主人叫我大肥鱼'));
    assert.equal(renderSection(ctx, 'my-memory:context'), stored);
    const empty = await ctx.state.commands.get('remember').handler({ rawInput: '   ' });
    assert.equal(empty.kind, 'error');
    const status = await ctx.state.commands.get('memory').handler({});
    assert.equal(status.kind, 'success');
    assert.ok(status.text.includes('角色：助手'));
    assert.ok(status.text.includes('长期记忆：' + stored.length + ' 字'));
    assert.ok(status.text.includes(memoryPath));
    await assert.rejects(readFile(join(dir, 'MEMORY.md'), 'utf8'), { code: 'ENOENT' });
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

test('工具已下线：4 个 memory_* 工具不再注册给模型', async () => {
  const { ctx, dir } = await startPlugin();
  try {
    // 本版只保留记忆存储/注入/命令/HTTP，模型侧不再有工具入口
    assert.equal(ctx.state.tools.size, 0);
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('HTTP · 多角色卡：列表带 body / 新建 / 改名 / 改正文 / 设为默认', async () => {
  const { ctx, api, dir } = await startPlugin();
  try {
    const created = await api('POST', '/personas', { dir: 'cat' });
    assert.equal(created.status, 200);
    assert.equal(created.body.id, 'cat', 'id 就是目录名');
    assert.equal(created.body.name, 'cat', '没给显示名时默认用目录名');
    assert.equal(created.body.body, '我是 cat。');
    assert.ok(created.body.created > 0);
    // 面板要显示位置：绝对路径 + 缩成 ~ 的展示形式
    assert.equal(created.body.path, join(dir, 'cat', 'agent.md'));
    assert.match(created.body.display, /agent\.md$/);

    const list = await api('GET', '/personas');
    assert.equal(list.status, 200);
    assert.ok(Array.isArray(list.body.items));
    // 界面的卡片预览要显示正文，所以列表必须带 body
    for (const item of list.body.items) {
      for (const key of ['id', 'name', 'body', 'created', 'updated', 'path', 'display']) {
        assert.ok(key in item, `GET /personas 的条目缺字段 ${key}`);
      }
    }
    assert.ok(list.body.items.some((i) => i.id === created.body.id));

    // 改名：id 不变，正文不变
    const renamed = await api('PUT', `/personas/${created.body.id}`, { name: '小猫猫' });
    assert.equal(renamed.body.id, created.body.id);
    assert.equal(renamed.body.name, '小猫猫');
    assert.equal(renamed.body.body, '我是 cat。');

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
    // items[0] 恒为虚拟卡「空白」，真实卡从第二项开始
    assert.deepEqual(first.map((i) => i.id), ['__none__', 'baby'], '启动引导应当已经建了一张默认卡');
    assert.equal(first[0].virtual, true);
    const defaultId = 'baby';

    // 只剩一张：拒绝，文案必须是这句（界面直接展示）
    const refused = await api('DELETE', `/personas/${defaultId}`);
    assert.equal(refused.status, 400);
    assert.equal(refused.body.error, '至少保留一张角色卡');

    // 建第二张后就能删；删 active 时 activeId 自动改指剩下的
    const second = (await api('POST', '/personas', { dir: 'cat2' })).body;
    assert.equal(second.id, 'cat2');
    await api('POST', `/personas/${second.id}/default`);
    const removed = await api('DELETE', `/personas/${second.id}`);
    assert.equal(removed.status, 200);
    assert.equal(removed.body.ok, true);
    assert.equal(removed.body.activeId, defaultId);
    assert.deepEqual(
      (await api('GET', '/personas')).body.items.filter((i) => !i.virtual).map((i) => i.id),
      [defaultId],
    );

    // 未知 id
    assert.equal((await api('DELETE', '/personas/ghost')).status, 404);
    assert.equal((await api('PUT', '/personas/ghost', { name: 'x' })).status, 404);
    const ghostDefault = await api('POST', '/personas/ghost/default');
    assert.equal(ghostDefault.status, 404);
    assert.match(String(ghostDefault.body.error), /找不到角色卡/);
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('HTTP · rename：改目录名后 GET /personas 看到新 id 与 display，activeId 跟随', async () => {
  const { ctx, api, dir } = await startPlugin();
  try {
    const created = await api('POST', '/personas', { dir: 'mycat' });
    assert.equal(created.status, 200);
    await api('POST', '/personas/mycat/default');
    // 目录里放个额外文件，验证「整个目录搬」
    await writeFile(join(dir, 'mycat', 'avatar.png'), 'x', 'utf8');

    const renamed = await api('POST', '/personas/mycat/rename', { dir: 'fish' });
    assert.equal(renamed.status, 200);
    assert.equal(renamed.body.id, 'fish');
    assert.equal(renamed.body.path, join(dir, 'fish', 'agent.md'));
    assert.ok(renamed.body.display.endsWith('agent.md'));
    assert.ok(renamed.body.display.includes('fish'));
    assert.equal(renamed.body.name, 'mycat');
    // 额外文件跟着搬走
    assert.equal((await readFile(join(dir, 'fish', 'avatar.png'), 'utf8')), 'x');

    // 列表里旧 id 消失、新 id 出现，display 也跟着变
    const list = await api('GET', '/personas');
    const ids = list.body.items.map((i) => i.id).sort();
    assert.deepEqual(ids, ['__none__', 'baby', 'fish'], '默认卡 baby 还在，只改了 mycat 那张');
    assert.equal(list.body.activeId, 'fish');
    const fishCard = list.body.items.find((i) => i.id === 'fish');
    assert.ok(fishCard.display.includes('fish'));
    // active 卡注入段立刻指向改名后的那张（正文没变）
    assert.equal(renderSection(ctx, 'my-memory:persona'), (await api('GET', '/personas/fish')).body.body);
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('HTTP · rename：重名 400 / 非法目录名 400 / 源不存在 404 / 同名幂等', async () => {
  const { ctx, api, dir } = await startPlugin();
  try {
    await api('POST', '/personas', { dir: 'baby' });
    await api('POST', '/personas', { dir: 'cat' });

    const dup = await api('POST', '/personas/baby/rename', { dir: 'cat' });
    assert.equal(dup.status, 400);
    assert.equal(dup.body.error, '这个目录已经有了');

    const invalid = await api('POST', '/personas/baby/rename', { dir: '大肥鱼' });
    assert.equal(invalid.status, 400);
    assert.equal(invalid.body.error, '目录名只能用英文、数字、点、下划线、短横线');

    const reserved = await api('POST', '/personas/baby/rename', { dir: 'state' });
    assert.equal(reserved.status, 400);

    const missing = await api('POST', '/personas/ghost/rename', { dir: 'x' });
    assert.equal(missing.status, 404);
    assert.match(String(missing.body.error), /找不到角色卡/);

    // 同名幂等：200 + 原卡
    const same = await api('POST', '/personas/baby/rename', { dir: 'baby' });
    assert.equal(same.status, 200);
    assert.equal(same.body.id, 'baby');

    // 失败后两张卡都还在
    assert.deepEqual((await api('GET', '/personas')).body.items.map((i) => i.id).sort(), ['__none__', 'baby', 'cat']);
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('空白卡：列表首位是虚拟卡，设为默认后三段提示词全空', async () => {
  const { ctx, api, dir } = await startPlugin();
  try {
    const list = await api('GET', '/personas');
    assert.equal(list.status, 200);
    const first = list.body.items[0];
    // 虚拟卡「空白」：id 固定、virtual:true、没有磁盘路径，永远排第一
    assert.equal(first.id, '__none__');
    assert.equal(first.virtual, true);
    assert.equal(first.name, '空白');
    assert.equal(first.body, '');
    assert.equal(first.path, '', '虚拟卡不对应磁盘目录');
    assert.equal(list.body.items.length, 2, '虚拟卡 + 启动时建的那张真实卡');
    assert.equal(list.body.activeId, 'baby', '虚拟卡不参与 activeId 的默认解析');

    // 先证明「非空白」状态下确实有内容可注入，否则下面的空断言没有意义
    await api('PUT', '/persona/memory', { personaId: 'baby', text: '主人叫我大肥鱼' });
    const before = renderSection(ctx, 'my-memory:persona');
    assert.equal(before, '我是 助手。');
    assert.ok(renderSection(ctx, 'my-memory:agent').includes(DEFAULT_AGENT_PROMPT));
    assert.ok(renderSection(ctx, 'my-memory:context').includes('主人叫我大肥鱼'));

    const setDefault = await api('POST', '/personas/__none__/default');
    assert.equal(setDefault.status, 200);
    assert.deepEqual(setDefault.body, { ok: true, activeId: '__none__' });
    assert.equal((await api('GET', '/personas')).body.activeId, '__none__');

    // 未绑定的会话跟着全局默认走 → 三段（全局提示词 / 角色卡 / 角色记忆）都必须是空串
    const assembly = { agent: { session: { id: 'sess-unbound' } } };
    const personaText = renderSection(ctx, 'my-memory:persona', assembly);
    assert.equal(personaText, '');
    assert.ok(!personaText.includes('# 角色设定'));
    assert.equal(renderSection(ctx, 'my-memory:agent', assembly), '', '空白卡连全局提示词也不注入');
    assert.equal(renderSection(ctx, 'my-memory:context', assembly), '');

    // 旧单卡接口也报「空白」空正文，不能悄悄回落到第一张真实卡
    const legacy = await api('GET', '/persona');
    assert.equal(legacy.body.name, '空白');
    assert.equal(legacy.body.body, '');
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('空白卡：会话绑定优先于全局默认，切回真实卡后未绑定会话恢复注入', async () => {
  const { ctx, api, dir } = await startPlugin();
  try {
    const realId = (await api('GET', '/personas')).body.items.find((i) => !i.virtual).id;
    await api('PUT', '/persona/memory', { personaId: realId, text: '主人叫我大肥鱼' });
    await api('POST', '/personas/__none__/default');

    // 给某个会话绑定「空白」
    const bound = await api('POST', '/session/persona', { session: 'sess-none', personaId: '__none__' });
    assert.equal(bound.status, 200);
    assert.deepEqual(
      { personaId: bound.body.personaId, name: bound.body.name, inherited: bound.body.inherited },
      { personaId: '__none__', name: '空白', inherited: false },
    );
    // 读回来的绑定也是「空白」，不能因为读不到目录就回落成默认卡
    const got = await api('GET', '/session/persona?session=sess-none');
    assert.equal(got.body.personaId, '__none__');
    assert.equal(got.body.name, '空白');

    const noneAssembly = { agent: { session: { id: 'sess-none' } } };
    const otherAssembly = { agent: { session: { id: 'sess-other' } } };
    assert.equal(renderSection(ctx, 'my-memory:agent', noneAssembly), '');
    assert.equal(renderSection(ctx, 'my-memory:persona', noneAssembly), '');
    assert.equal(renderSection(ctx, 'my-memory:context', noneAssembly), '');
    // 另一个会话没绑定，此时 active 也是 none → 同样不注入
    assert.equal(renderSection(ctx, 'my-memory:agent', otherAssembly), '');
    assert.equal(renderSection(ctx, 'my-memory:persona', otherAssembly), '');
    assert.equal(renderSection(ctx, 'my-memory:context', otherAssembly), '');

    // active 切回真实卡：未绑定会话恢复注入，绑定 none 的会话仍然不注入（会话绑定优先）
    await api('POST', `/personas/${realId}/default`);
    const restored = renderSection(ctx, 'my-memory:persona', otherAssembly);
    assert.equal(restored, '我是 助手。');
    assert.ok(renderSection(ctx, 'my-memory:agent', otherAssembly).includes(DEFAULT_AGENT_PROMPT));
    assert.ok(renderSection(ctx, 'my-memory:context', otherAssembly).includes('主人叫我大肥鱼'));
    assert.equal(renderSection(ctx, 'my-memory:persona', noneAssembly), '');
    assert.equal(renderSection(ctx, 'my-memory:context', noneAssembly), '');
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('空白卡：编辑类接口全部明确拒绝（4xx + 中文原因）', async () => {
  const { ctx, api, dir } = await startPlugin();
  try {
    const put = await api('PUT', '/personas/__none__', { name: 'x', body: 'y' });
    assert.equal(put.status, 400);
    assert.match(String(put.body.error), /空白卡/);

    const del = await api('DELETE', '/personas/__none__');
    assert.equal(del.status, 400);
    assert.match(String(del.body.error), /空白卡不能删除/);

    const reload = await api('POST', '/personas/__none__/reload');
    assert.equal(reload.status, 400);
    assert.match(String(reload.body.error), /空白卡不能重载/);

    const rename = await api('POST', '/personas/__none__/rename', { dir: 'x' });
    assert.equal(rename.status, 400);
    assert.match(String(rename.body.error), /空白卡/);

    const reveal = await api('POST', '/personas/__none__/reveal');
    assert.equal(reveal.status, 400);
    assert.match(String(reveal.body.error), /空白卡没有角色目录/);

    // 虚拟 id 不能被真实目录占用
    const create = await api('POST', '/personas', { dir: '__none__' });
    assert.equal(create.status, 400);

    // 旧单卡接口：默认是空白时拒绝写，而不是悄悄改到别的卡上
    await api('POST', '/personas/__none__/default');
    const legacyPut = await api('PUT', '/persona', { name: 'x' });
    assert.equal(legacyPut.status, 400);
    assert.match(String(legacyPut.body.error), /空白卡/);
    // 真实卡本身没被改动
    assert.ok((await api('GET', '/personas')).body.items.find((i) => !i.virtual).name !== 'x');
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('HTTP · 旧版全局原文兼容读写，不混入角色记忆', async () => {
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
    // 条目解析正常
    const listed = await api('GET', '/memory?scope=global');
    assert.equal(listed.body.items.length, 1);
    assert.equal(listed.body.items[0].id, 'g_1a2b3c4d');
    // 新模型里这份 <root>/MEMORY.md 只是旧数据：长期记忆改由每角色的 MEMORY.md 提供，
    // 所以它**不再**出现在注入里（底层读写能力仍然保留）
    assert.ok(!renderSection(ctx, 'my-memory:context').includes('主人叫我大肥鱼'));

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

test('启动迁移：已有旧 persona.md → 自动转成 <dir>/agent.md 并被注入段读到', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'dsh-my-memory-migrate-'));
  const ctx = makeCtx();
  const cwd = join(dir, 'workspace');
  await mkdir(cwd, { recursive: true });
  ctx.workingDirectory = { get: () => cwd, defaultDirectory: cwd };
  try {
    // 更早的版本留下的单卡文件（只有 name/updated 两字段）
    await writeFile(
      join(dir, 'persona.md'),
      '---\nname: 大肥鱼\nupdated: 1762000000000\n---\n\n我是大肥鱼。\n说话要柔和。\n',
      'utf8',
    );
    apply(ctx, { dataDir: dir });
    await waitFor(async () => {
      try {
        const index = JSON.parse(await readFile(join(dir, 'state', 'personas.json'), 'utf8'));
        return !!(index && index.activeId);
      } catch {
        return false;
      }
    });
    const index = JSON.parse(await readFile(join(dir, 'state', 'personas.json'), 'utf8'));
    // 中文名猜不出合法目录名 → 用 baby
    assert.equal(index.activeId, 'baby');
    const cardText = await readFile(join(dir, 'baby', 'agent.md'), 'utf8');
    assert.ok(cardText.includes('name: 大肥鱼'));
    assert.ok(cardText.includes('created: 1762000000000'));
    assert.ok(!cardText.includes('id:'), '新格式 frontmatter 不再写 id（目录名就是 id）');
    // 注入段立刻是迁移出来的那张卡
    const text = renderSection(ctx, 'my-memory:persona');
    assert.ok(text.includes('说话要柔和。'));
    // 旧文件还在（迁移只复制，不删）
    assert.ok((await readFile(join(dir, 'persona.md'), 'utf8')).includes('说话要柔和'));
    // 接口上只有一张卡，且就是它
    const route = ctx.state.routes[0];
    const res = makeRes();
    await route.handler(makeReq('GET', '/my-memory/api/personas'), res);
    assert.equal(res.payload.items.length, 2, '虚拟卡「空白」+ 迁移出来的那一张');
    assert.equal(res.payload.activeId, 'baby');
    assert.equal(res.payload.items[0].id, '__none__');
    assert.equal(res.payload.items[1].path, join(dir, 'baby', 'agent.md'));
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});


/** 临时把 HOME/USERPROFILE 指到沙箱：验证「切回默认根」时不碰真实家目录 */
async function withSandboxHome(run) {
  const sandbox = await mkdtemp(join(tmpdir(), 'dsh-my-memory-home-'));
  const saved = { HOME: process.env.HOME, USERPROFILE: process.env.USERPROFILE };
  process.env.HOME = sandbox;
  process.env.USERPROFILE = sandbox;
  try {
    return await run(sandbox);
  } finally {
    if (saved.HOME === undefined) delete process.env.HOME;
    else process.env.HOME = saved.HOME;
    if (saved.USERPROFILE === undefined) delete process.env.USERPROFILE;
    else process.env.USERPROFILE = saved.USERPROFILE;
    // 插件的启动引导是异步的（建默认卡/写索引），清理时它可能还在写 ——
    // Windows 上这时候 rm 会 EBUSY/ENOTEMPTY，所以小退避重试几次。
    for (let attempt = 0; attempt < 8; attempt += 1) {
      try {
        await rm(sandbox, { recursive: true, force: true });
        break;
      } catch {
        await new Promise((r) => setTimeout(r, 40));
      }
    }
  }
}


test('HTTP · 会话级角色绑定：首绑 / 换卡成功 / 同卡幂等 / 未知卡 404 / locked 恒 false / 注入用绑定的卡', async () => {
  const { ctx, api, dir } = await startPlugin();
  try {
    await api('POST', '/personas', { dir: 'cat' });
    // 先造两张内容可区分的卡
    await api('PUT', '/personas/cat', { body: '我是猫。' });
    const first = (await api('GET', '/personas')).body.items.find((i) => i.id === 'baby');
    await api('PUT', '/personas/baby', { body: '我是默认那张。' });
    // 默认卡是 baby；把 cat 设为 active 以便验证「会话绑定优先于 active」
    await api('POST', '/personas/cat/default');
    assert.ok(first);

    // 未绑定时不再是 null：回落到全局默认卡（此时 active 已被设成 cat），并标记 inherited=true；
    // locked 仍然必须是 false（新建会话页还能随便挑）
    const before = await api('GET', '/session/persona?session=sess-1');
    assert.equal(before.status, 200);
    assert.deepEqual(
      {
        personaId: before.body.personaId,
        inherited: before.body.inherited,
        locked: before.body.locked,
      },
      { personaId: 'cat', inherited: true, locked: false },
    );

    // 首绑
    const bound = await api('POST', '/session/persona', { session: 'sess-1', personaId: 'baby' });
    assert.equal(bound.status, 200);
    assert.equal(bound.body.personaId, 'baby');
    assert.equal(bound.body.locked, false, '任何时候都可以改，locked 恒 false');

    // 换卡 → 永远 200，且真的换了
    const changed = await api('POST', '/session/persona', { session: 'sess-1', personaId: 'cat' });
    assert.equal(changed.status, 200);
    assert.equal(changed.body.personaId, 'cat');
    const readBack = await api('GET', '/session/persona?session=sess-1');
    assert.equal(readBack.body.personaId, 'cat');
    assert.equal(readBack.body.locked, false);
    // 这次是会话绑定，不是回落的默认卡
    assert.equal(readBack.body.inherited, false);

    // 同卡再绑 → 200 幂等
    const again = await api('POST', '/session/persona', { session: 'sess-1', personaId: 'cat' });
    assert.equal(again.status, 200);

    // 未知卡 → 404
    const missing = await api('POST', '/session/persona', { session: 'sess-2', personaId: 'ghost' });
    assert.equal(missing.status, 404);

    // 注入用的是会话绑定的卡（现在绑的是 cat），不是 active（active 也是 cat，所以再换回 baby 验证）
    await api('POST', '/session/persona', { session: 'sess-1', personaId: 'baby' });
    const boundText = renderSection(ctx, 'my-memory:persona', {
      agent: { session: { id: 'sess-1' } },
    });
    assert.ok(boundText.includes('我是默认那张。'), boundText);
    assert.ok(!boundText.includes('我是猫。'));
    // 没绑定的会话用 active（cat）
    const activeText = renderSection(ctx, 'my-memory:persona', {
      agent: { session: { id: 'other-session' } },
    });
    assert.ok(activeText.includes('我是猫。'));

    // 绑定落盘位置
    const sessions = JSON.parse(await readFile(join(dir, 'state', 'sessions.json'), 'utf8'));
    assert.equal(sessions['sess-1'].personaId, 'baby');
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('HTTP · 局部记忆开关：默认关 / 打开建文件 / 关闭保留内容 / 关闭时写入被拒', async () => {
  const { ctx, api, dir, cwd } = await startPlugin();
  try {
    const memoryPath = join(cwd, '.dsh', 'MEMORY.md');
    const initial = await api('GET', `/project/state?cwd=${encodeURIComponent(cwd)}`);
    assert.equal(initial.status, 200);
    assert.equal(initial.body.cwd, cwd);
    assert.equal(initial.body.memoryPath, memoryPath);
    assert.equal(initial.body.exists, false);
    assert.equal(initial.body.enabled, false, '没记录 + 文件不存在 → 默认关');

    // 关着时写项目记忆 → 被拒（明确中文错误）
    await mkdir(join(cwd, '.git'), { recursive: true });
    clearDetectCache();
    const denied = await api('POST', '/memory', {
      text: 'Config 的默认值必须给',
      scope: 'project',
    });
    assert.equal(denied.status, 403);
    assert.equal(denied.body.error, '当前目录的局部记忆开关是关的，先打开再记');
    await assert.rejects(readFile(memoryPath, 'utf8'), '被拒时不能建文件');

    // 打开 → 建文件
    const on = await api('POST', '/project/state', { cwd, enabled: true });
    assert.equal(on.body.enabled, true);
    assert.equal(on.body.exists, true);
    assert.equal(await readFile(memoryPath, 'utf8'), '# 项目记忆\n');

    // 记一条
    const saved = await api('POST', '/memory', { text: 'Config 的默认值必须给', scope: 'project' });
    assert.equal(saved.status, 200);
    assert.equal(saved.body.path, memoryPath);
    const withEntry = await readFile(memoryPath, 'utf8');

    // 关闭 → 文件与内容原样
    const off = await api('POST', '/project/state', { cwd, enabled: false });
    assert.equal(off.body.enabled, false);
    assert.equal(off.body.exists, true);
    assert.equal(await readFile(memoryPath, 'utf8'), withEntry, '关闭后内容不能变');

    // 关闭后注入段不含项目记忆，但角色自己的长期记忆照常
    await api('PUT', '/persona/memory', { personaId: 'baby', text: '角色那条' });
    const injected = renderSection(ctx, 'my-memory:context', {
      agent: { session: { id: 's1' } },
    });
    assert.ok(injected.includes('角色那条'));
    assert.ok(!injected.includes('Config 的默认值必须给'), '关掉后项目段不注入');

    // 打开后又能注入
    await api('POST', '/project/state', { cwd, enabled: true });
    const injectedAgain = renderSection(ctx, 'my-memory:context', {
      agent: { session: { id: 's1' } },
    });
    assert.ok(injectedAgain.includes('Config 的默认值必须给'));
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('HTTP · 局部记忆开关：没有记录但文件已存在 → 默认开着', async () => {
  const { ctx, api, dir, cwd } = await startPlugin();
  try {
    await mkdir(join(cwd, '.dsh'), { recursive: true });
    await writeFile(join(cwd, '.dsh', 'MEMORY.md'), '# 项目记忆\n\n## 约定\n\n- [p_1234abcd] 2026-11-07 早就记过的\n', 'utf8');
    const state = await api('GET', `/project/state?cwd=${encodeURIComponent(cwd)}`);
    assert.equal(state.body.exists, true);
    assert.equal(state.body.enabled, true);
    const list = await api('GET', `/memory?scope=project&project=${encodeURIComponent(cwd)}`);
    assert.equal(list.body.items.length, 1);
    assert.equal(list.body.items[0].id, 'p_1234abcd');
    assert.equal(list.body.projectState.enabled, true);
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('HTTP · settings：读当前/默认数据根', async () => {
  const { ctx, api, dir } = await startPlugin();
  try {
    const res = await api('GET', '/settings');
    assert.equal(res.status, 200);
    assert.equal(res.body.dataDir, dir);
    // 默认根带 dsh 前缀（跟包名一致）
    assert.ok(res.body.defaultDataDir.endsWith(join('.dsh', 'dsh-my-memory')), res.body.defaultDataDir);
    assert.equal(res.body.folderName, 'dsh-my-memory');
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('HTTP · settings：切到新目录后新角色落到新目录，指针文件同步', async () => {
  const { ctx, api, dir } = await startPlugin();
  const parent = await mkdtemp(join(tmpdir(), 'mm-parent-'));
  const next = join(parent, 'dsh-my-memory');
  try {
    // 传 parent：宿主自己补固定子目录名
    const switched = await api('POST', '/settings/dataDir', { parent });
    assert.equal(switched.status, 200);
    assert.equal(switched.body.ok, true);
    assert.equal(switched.body.dataDir, next, '传父目录时自动补上 dsh-my-memory');
    assert.equal(switched.body.movedFrom, dir, '要告诉界面从哪搬过来的（界面提示一句）');

    // 新根自动初始化（建了默认卡），旧根的卡不会出现在列表里
    const list = await api('GET', '/personas');
    const realItems = list.body.items.filter((i) => !i.virtual);
    assert.equal(realItems.length, 1);
    assert.equal(realItems[0].path.startsWith(next), true);

    // 新建角色落在新目录
    const created = await api('POST', '/personas', { dir: 'cat' });
    assert.equal(created.status, 200);
    assert.equal(created.body.path, join(next, 'cat', 'agent.md'));
    assert.equal(await readFile(join(next, 'cat', 'agent.md'), 'utf8').then((t) => t.includes('name: cat')), true);

    // 全局记忆也写到新根
    await api('POST', '/memory', { text: '切目录后的第一条', scope: 'global' });
    assert.ok((await readFile(join(next, 'MEMORY.md'), 'utf8')).includes('切目录后的第一条'));

    // 指针文件（测试里指到临时位置）记住新根
    const pointer = JSON.parse(await readFile(join(dir, '.roots.json'), 'utf8'));
    assert.equal(pointer.dataDir, next);
    // GET /settings 反映最新
    assert.equal((await api('GET', '/settings')).body.dataDir, next);
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
    await rm(parent, { recursive: true, force: true });
  }
});

test('HTTP · settings：path 为空切回默认根，并清掉指针', async () => {
  await withSandboxHome(async (sandbox) => {
    const { ctx, api, dir } = await startPlugin();
    const otherParent = await mkdtemp(join(tmpdir(), 'mm-other-'));
    const other = join(otherParent, 'dsh-my-memory');
    try {
      await api('POST', '/settings/dataDir', { parent: otherParent });
      assert.equal(JSON.parse(await readFile(join(dir, '.roots.json'), 'utf8')).dataDir, other);

      const back = await api('POST', '/settings/dataDir', { path: '' });
      assert.equal(back.status, 200);
      assert.equal(back.body.dataDir, join(sandbox, '.dsh', 'dsh-my-memory'), '空值 = 回到默认根');
      assert.equal(back.body.movedFrom, other);
      // 指针清空（null = 没有覆盖，用默认）
      assert.deepEqual(JSON.parse(await readFile(join(dir, '.roots.json'), 'utf8')), { dataDir: null });
      assert.equal((await api('GET', '/settings')).body.dataDir, back.body.dataDir);
    } finally {
      ctx.state.effects.forEach((d) => typeof d === 'function' && d());
      await rm(dir, { recursive: true, force: true });
      await rm(otherParent, { recursive: true, force: true });
    }
  });
});

test('HTTP · settings：目录建不出来时 400（不让一个坏路径把插件搞挂）', async () => {
  const { ctx, api, dir } = await startPlugin();
  try {
    // 拿一个「父路径是文件」的路径：建目录必然失败
    const blocker = join(dir, 'blocker');
    await writeFile(blocker, 'x', 'utf8');
    const res = await api('POST', '/settings/dataDir', { path: join(blocker, 'sub') });
    assert.equal(res.status, 400);
    assert.match(String(res.body.error), /目录创建失败|不可写/);
    // 失败后仍然是原来的数据根
    assert.equal((await api('GET', '/settings')).body.dataDir, dir);
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('HTTP · PUT /memory/raw：rev 与 409 冲突（含并发、force、外部改写）', async () => {
  const { ctx, api, dir } = await startPlugin();
  try {
    clearSyncCache();
    const first = await api('GET', '/memory/raw?scope=global');
    assert.equal(first.status, 200);
    assert.match(String(first.body.rev), /^[0-9a-f]{12}$/);
    assert.equal(first.body.text, '');

    // baseRev 正确 → 写成功，rev 更新
    const text = '# 全局记忆\n\n## 称呼\n\n- [g_1a2b3c4d] 2026-11-07 主人叫我大肥鱼\n';
    const ok = await api('PUT', '/memory/raw', { scope: 'global', text, baseRev: first.body.rev });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.ok, true);
    assert.equal(ok.body.text, text);
    assert.notEqual(ok.body.rev, first.body.rev);
    assert.equal(ok.body.rev, contentRev(text));

    // baseRev 过期 → 409 + 磁盘全文，且文件没被改
    const stale = await api('PUT', '/memory/raw', { scope: 'global', text: '# 我的\n', baseRev: first.body.rev });
    assert.equal(stale.status, 409);
    assert.equal(stale.body.conflict, true);
    assert.equal(stale.body.error, '磁盘上的内容已经变了');
    assert.equal(stale.body.text, text);
    assert.equal(stale.body.rev, contentRev(text));
    assert.equal(await readFile(join(dir, 'MEMORY.md'), 'utf8'), text);

    // POST 等价于 PUT
    const viaPost = await api('POST', '/memory/raw', { scope: 'global', text: '# POST 写的\n', baseRev: stale.body.rev });
    assert.equal(viaPost.status, 200);

    // force → 无视 baseRev
    const forced = await api('PUT', '/memory/raw', { scope: 'global', text: '# 强制覆盖\n', baseRev: 'deadbeef', force: true });
    assert.equal(forced.status, 200);
    assert.equal(await readFile(join(dir, 'MEMORY.md'), 'utf8'), '# 强制覆盖\n');

    // 老客户端：不带 baseRev 直接写（不能坏）
    const legacy = await api('PUT', '/memory/raw', { scope: 'global', text: '# 老界面\n' });
    assert.equal(legacy.status, 200);

    // 外部编辑器改盘后再用旧 rev 写 → 409
    const seen = await api('GET', '/memory/raw?scope=global');
    await writeFile(join(dir, 'MEMORY.md'), '# 外部改的\n', 'utf8');
    const conflict = await api('PUT', '/memory/raw', { scope: 'global', text: '# 我\n', baseRev: seen.body.rev });
    assert.equal(conflict.status, 409);
    assert.equal(conflict.body.text, '# 外部改的\n');
    assert.equal(await readFile(join(dir, 'MEMORY.md'), 'utf8'), '# 外部改的\n');
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('HTTP · PUT /memory/raw 并发：同一 baseRev 两个请求 → 一个 200 一个 409', async () => {
  const { ctx, api, dir } = await startPlugin();
  try {
    clearSyncCache();
    const base = (await api('GET', '/memory/raw?scope=global')).body.rev;
    const [a, b] = await Promise.all([
      api('PUT', '/memory/raw', { scope: 'global', text: '# 甲\n', baseRev: base }),
      api('PUT', '/memory/raw', { scope: 'global', text: '# 乙\n', baseRev: base }),
    ]);
    const codes = [a.status, b.status].sort();
    assert.deepEqual(codes, [200, 409], '恰好一个成功、一个冲突');
    const winner = a.status === 200 ? a : b;
    assert.equal(await readFile(join(dir, 'MEMORY.md'), 'utf8'), winner.body.text);
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('HTTP · settings/picker：没有 directoryPicker 时 supported=false，有则 true', async () => {
  const { ctx, api, dir } = await startPlugin();
  try {
    const none = await api('GET', '/settings/picker');
    assert.equal(none.status, 200);
    assert.deepEqual(none.body, { supported: false });

    // 模拟宿主提供了选择框服务
    const originGet = ctx.get;
    ctx.get = (name) =>
      name === 'directoryPicker' ? { capability: () => ({ kind: 'native' }) } : originGet.call(ctx, name);
    const has = await api('GET', '/settings/picker');
    assert.deepEqual(has.body, { supported: true });
    ctx.get = originGet;
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('HTTP · settings：dataDir 传 parent 自动补子目录、已带子目录不重复拼', async () => {
  const { ctx, api, dir } = await startPlugin();
  const parent = await mkdtemp(join(tmpdir(), 'mm-parent2-'));
  try {
    const asParent = await api('POST', '/settings/dataDir', { parent });
    assert.equal(asParent.status, 200);
    assert.equal(asParent.body.dataDir, join(parent, 'dsh-my-memory'));

    // 已经是 .../dsh-my-memory 结尾：不再拼一层
    const already = await api('POST', '/settings/dataDir', { path: join(parent, 'dsh-my-memory') });
    assert.equal(already.status, 200);
    assert.equal(already.body.dataDir, join(parent, 'dsh-my-memory'));

    // 老客户端传 { path } 且不是子目录名结尾 → 同样当父目录
    const other = await mkdtemp(join(tmpdir(), 'mm-parent3-'));
    const asPath = await api('POST', '/settings/dataDir', { path: other });
    assert.equal(asPath.body.dataDir, join(other, 'dsh-my-memory'));
    await rm(other, { recursive: true, force: true });
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
    await rm(parent, { recursive: true, force: true });
  }
});

test('启动迁移：~/.dsh/my-memory → ~/.dsh/dsh-my-memory（含指针改写）', async () => {
  await withSandboxHome(async (sandbox) => {
    const legacy = join(sandbox, '.dsh', 'my-memory');
    const target = join(sandbox, '.dsh', 'dsh-my-memory');
    const pointer = join(sandbox, 'pointer.json');
    await mkdir(join(legacy, 'baby'), { recursive: true });
    await writeFile(join(legacy, 'baby', 'agent.md'), '---\nname: 老角色\ncreated: 1\nupdated: 1\n---\n\n老正文\n', 'utf8');
    await writeFile(pointer, JSON.stringify({ dataDir: legacy }), 'utf8');

    const ctx = makeCtx();
    const cwd = join(sandbox, 'workspace');
    await mkdir(cwd, { recursive: true });
    ctx.workingDirectory = { get: () => cwd, defaultDirectory: cwd };
    try {
      // dataDir 留空 = 走默认根（才会触发默认目录迁移）；指针用临时文件
      apply(ctx, { rootPointerFile: pointer });
      assert.equal(await readFile(join(target, 'baby', 'agent.md'), 'utf8').then((t) => t.includes('老角色')), true);
      // 旧目录搬走了
      await assert.rejects(stat(legacy));
      // 指针跟着改到新路径
      await waitFor(async () => {
        try {
          return JSON.parse(await readFile(pointer, 'utf8')).dataDir === target;
        } catch {
          return false;
        }
      });
      const route = ctx.state.routes[0];
      const res = makeRes();
      await route.handler(makeReq('GET', '/my-memory/api/personas'), res);
      assert.equal(res.payload.items.length, 2, '虚拟卡「空白」+ 新建的 baby');
      assert.equal(res.payload.items[1].id, 'baby');
    } finally {
      ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    }
  });
});

test('纯函数：revealCommandOf 按平台给出打开目录的命令', () => {
  assert.deepEqual(revealCommandOf('C:\\x', 'win32'), { command: 'explorer.exe', args: ['C:\\x'] });
  assert.deepEqual(revealCommandOf('/x', 'darwin'), { command: 'open', args: ['/x'] });
  assert.deepEqual(revealCommandOf('/x', 'linux'), { command: 'xdg-open', args: ['/x'] });
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

test('注入顺序：全局提示词 → 角色卡 → 该角色长期记忆（三段各自独立、顺序固定）', async () => {
  const { ctx, api, dir } = await startPlugin();
  try {
    await waitForFile(join(dir, 'AGENT.md'));
    await api('PUT', '/settings/prompt', { text: '先是规矩：只说实话。' });
    await api('PUT', '/persona', { name: '大肥鱼', body: '我是大肥鱼，18 岁。' });
    await api('PUT', '/persona/memory', { personaId: 'baby', text: '昨天说过喜欢冰美式。' });

    // 段序：AGENT.md 在最前，角色卡居中，长期记忆最后
    assert.ok(sectionOf(ctx, 'my-memory:agent').order < sectionOf(ctx, 'my-memory:persona').order);
    assert.ok(sectionOf(ctx, 'my-memory:persona').order < sectionOf(ctx, 'my-memory:context').order);

    const assembly = { agent: { session: { id: 's1' } } };
    const agentText = renderSection(ctx, 'my-memory:agent', assembly);
    const personaText = renderSection(ctx, 'my-memory:persona', assembly);
    const contextText = renderSection(ctx, 'my-memory:context', assembly);
    assert.equal(agentText, '先是规矩：只说实话。');
    assert.equal(
      personaText,
      '我是大肥鱼，18 岁。',
    );
    assert.equal(contextText, '昨天说过喜欢冰美式。');
    // 各就各位：AGENT.md 不进角色卡段，角色记忆也不进角色卡段
    assert.ok(!personaText.includes('先是规矩'));
    assert.ok(!personaText.includes('冰美式'));
    assert.ok(!contextText.includes('我是大肥鱼'));
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('每角色长期记忆：写 → 读 → 注入，换角色不串台，空文件不产生多余空行，空白卡被拒', async () => {
  const { ctx, api, dir } = await startPlugin();
  try {
    const memoryPath = join(dir, 'baby', 'MEMORY.md');
    // 一开始没有文件：读接口报空，而且**不自动创建**（用户没写过就是没有）
    const empty = await api('GET', '/persona/memory?id=baby');
    assert.equal(empty.status, 200);
    assert.equal(empty.body.personaId, 'baby');
    assert.equal(empty.body.path, memoryPath);
    assert.equal(empty.body.text, '');
    assert.equal(empty.body.exists, false);
    await assert.rejects(readFile(memoryPath, 'utf8'), '首次访问不能凭空建出 MEMORY.md');

    // 写 → 落盘 → 读回（rev 就是内容指纹）
    const put = await api('PUT', '/persona/memory', { personaId: 'baby', text: '大肥鱼只喝冰美式。\n' });
    assert.equal(put.status, 200);
    assert.equal(put.body.ok, true);
    assert.equal(put.body.path, memoryPath);
    assert.equal(put.body.rev, contentRev('大肥鱼只喝冰美式。\n'));
    assert.equal(await readFile(memoryPath, 'utf8'), '大肥鱼只喝冰美式。\n');
    const got = await api('GET', '/persona/memory?id=baby');
    assert.equal(got.body.text, '大肥鱼只喝冰美式。\n');
    assert.equal(got.body.exists, true);
    assert.equal(got.body.rev, contentRev('大肥鱼只喝冰美式。\n'));

    // 注入保留正文及尾随换行，插件不添加标题或介绍句。
    const injected = renderSection(ctx, 'my-memory:context', { agent: { session: { id: 's1' } } });
    assert.equal(injected, '大肥鱼只喝冰美式。\n');

    // 换一个角色：它自己没有记忆 → 注入里不能再出现别人的内容（隔离）
    assert.equal((await api('POST', '/personas', { dir: 'cat' })).status, 200);
    await api('POST', '/personas/cat/default');
    assert.equal(renderSection(ctx, 'my-memory:context', { agent: { session: { id: 's1' } } }), '');

    // 各存各的
    await api('PUT', '/persona/memory', { personaId: 'cat', text: '猫猫只吃冻干。' });
    assert.equal((await api('GET', '/persona/memory?id=cat')).body.text, '猫猫只吃冻干。');
    assert.equal((await api('GET', '/persona/memory?id=baby')).body.text, '大肥鱼只喝冰美式。\n');

    // 会话绑定优先于 active 卡：绑 baby 的会话读到的是 baby 的记忆
    await api('POST', '/session/persona', { session: 'sess-baby', personaId: 'baby' });
    const bound = renderSection(ctx, 'my-memory:context', { agent: { session: { id: 'sess-baby' } } });
    assert.ok(bound.includes('大肥鱼只喝冰美式。'), bound);
    assert.ok(!bound.includes('猫猫只吃冻干。'), bound);

    // 空文件 / 只有空白 → 空段（不留标题，也不留多余空行）
    await api('PUT', '/persona/memory', { personaId: 'cat', text: '' });
    assert.equal(renderSection(ctx, 'my-memory:context', { agent: { session: { id: 's2' } } }), '');
    await api('PUT', '/persona/memory', { personaId: 'cat', text: '   \n\n  ' });
    assert.equal(renderSection(ctx, 'my-memory:context', { agent: { session: { id: 's2' } } }), '');

    // 空白卡：读返回空、写明确拒绝（不是静默写入）
    const noneRead = await api('GET', '/persona/memory?id=__none__');
    assert.equal(noneRead.status, 200);
    assert.deepEqual(
      {
        personaId: noneRead.body.personaId,
        path: noneRead.body.path,
        text: noneRead.body.text,
        exists: noneRead.body.exists,
      },
      { personaId: '__none__', path: '', text: '', exists: false },
    );
    const noneWrite = await api('PUT', '/persona/memory', { personaId: '__none__', text: 'x' });
    assert.equal(noneWrite.status, 400);
    assert.match(String(noneWrite.body.error), /空白卡/);

    // 缺 id / 不存在的角色
    assert.equal((await api('GET', '/persona/memory')).status, 400);
    assert.equal((await api('GET', '/persona/memory?id=nope')).status, 404);
    assert.equal((await api('PUT', '/persona/memory', { personaId: 'nope', text: 'x' })).status, 404);
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('每角色长期记忆：版本号冲突不写盘（409 + 磁盘当前全文），force 才覆盖', async () => {
  const { ctx, api, dir } = await startPlugin();
  try {
    await api('PUT', '/persona/memory', { personaId: 'baby', text: '第一版' });
    const base = (await api('GET', '/persona/memory?id=baby')).body.rev;
    // 另一个页签先写了
    const second = await api('PUT', '/persona/memory', { personaId: 'baby', text: '第二版', baseRev: base });
    assert.equal(second.status, 200);

    // 拿着旧 rev 再写 → 409，磁盘不动，响应里带磁盘全文
    const stale = await api('PUT', '/persona/memory', {
      personaId: 'baby',
      text: '我的旧版本',
      baseRev: base,
    });
    assert.equal(stale.status, 409);
    assert.equal(stale.body.conflict, true);
    assert.equal(stale.body.text, '第二版');
    assert.equal(await readFile(join(dir, 'baby', 'MEMORY.md'), 'utf8'), '第二版');

    // force：用户明确要覆盖
    const forced = await api('PUT', '/persona/memory', {
      personaId: 'baby',
      text: '我的旧版本',
      baseRev: base,
      force: true,
    });
    assert.equal(forced.status, 200);
    assert.equal(await readFile(join(dir, 'baby', 'MEMORY.md'), 'utf8'), '我的旧版本');
    // 写完注入立刻是新内容
    assert.ok(renderSection(ctx, 'my-memory:context', { agent: { session: { id: 's1' } } }).includes('我的旧版本'));
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('每角色长期记忆：角色目录改名/删除时文件跟着走（不额外删用户记忆）', async () => {
  const { api, dir } = await startPlugin();
  try {
    await api('PUT', '/persona/memory', { personaId: 'baby', text: '属于 baby 的记忆' });
    const renamed = await api('POST', '/personas/baby/rename', { dir: 'doll' });
    assert.equal(renamed.status, 200);
    // 整个目录一起搬：名字变了，内容还在
    assert.equal((await readFile(join(dir, 'doll', 'MEMORY.md'), 'utf8')), '属于 baby 的记忆');
    assert.equal((await api('GET', '/persona/memory?id=doll')).body.text, '属于 baby 的记忆');
    await assert.rejects(readFile(join(dir, 'baby', 'MEMORY.md'), 'utf8'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

/** 三份文档走相同的读写约定，回归测试逐一验证每条真实 HTTP 路径。 */
const editableDocuments = [
  {
    label: '全局提示词',
    read: '/settings/prompt',
    write: '/settings/prompt',
    field: 'text',
    section: 'my-memory:agent',
    input: (text) => ({ text }),
  },
  {
    label: '角色设定',
    read: '/personas/baby',
    write: '/personas/baby',
    field: 'body',
    section: 'my-memory:persona',
    input: (text) => ({ body: text }),
  },
  {
    label: '角色记忆',
    read: '/persona/memory?id=baby',
    write: '/persona/memory',
    field: 'text',
    section: 'my-memory:context',
    input: (text) => ({ personaId: 'baby', text }),
  },
];

test('默认注入完整长文，保留缩进、换行和 Markdown 行末空格', async () => {
  const { ctx, api, dir } = await startPlugin();
  try {
    for (const document of editableDocuments) {
      const text = '  ' + document.label + '\n{{原样保留}}\n' + '长文内容'.repeat(450) + '\n最后一行  \n\n';
      const saved = await api('PUT', document.write, document.input(text));
      assert.equal(saved.status, 200, document.label);
      const fetched = await api('GET', document.read);
      assert.equal(fetched.body[document.field], text, document.label + ' 读回原文');
      assert.equal(renderSection(ctx, document.section), text, document.label + ' 完整注入');
      assert.equal(renderSection(ctx, document.section), text, document.label + ' 重复组装稳定');
    }
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('默认段序跟随宿主身份位置，显式配置的段序保持原值', async () => {
  for (const config of [{}, { promptOrder: -9, personaOrder: -8, order: -7 }]) {
    const { ctx, dir } = await startPlugin(config, (context) => {
      context.systemPrompt.getSectionOrder = (sectionName) => {
        assert.equal(sectionName, 'HARNESS_IDENTITY');
        return -2000;
      };
      context.systemPrompt.section({ name: 'harness:identity', order: -2000, text: '宿主身份' });
    });
    try {
      const names = ['my-memory:agent', 'my-memory:persona', 'my-memory:paths', 'my-memory:context'];
      const expected = config.order === undefined ? [-2003, -2002, -2001.5, -2001] : [-9, -8, -7.5, -7];
      assert.deepEqual(names.map((sectionName) => sectionOf(ctx, sectionName).order), expected);
      if (config.order === undefined) {
        const sorted = [...ctx.state.sections].sort((a, b) => a.order - b.order);
        assert.deepEqual(sorted.map((section) => section.name), [...names, 'harness:identity']);
      }
    } finally {
      ctx.state.effects.forEach((d) => typeof d === 'function' && d());
      await rm(dir, { recursive: true, force: true });
    }
  }
});

test('启动后立即调用文档 API 会等待初始化，首次保存不会被默认内容覆盖', async () => {
  const sandbox = await mkdtemp(join(tmpdir(), 'mm-immediate-'));
  const dir = join(sandbox, 'data');
  const ctx = makeCtx();
  try {
    apply(ctx, { dataDir: dir, rootPointerFile: join(sandbox, 'pointer.json') });
    const route = ctx.state.routes[0];
    assert.ok(route, '初始化期间也应已经注册路由');
    const api = async (method, path, body) => {
      const response = makeRes();
      await route.handler(makeReq(method, '/my-memory/api' + path, body), response);
      return { status: response.statusCode, body: response.payload };
    };
    // 不轮询目录、不等待文件：让真正的请求负责等待初始化。
    const [card, memory, prompt] = await Promise.all([
      api('GET', '/personas/baby'),
      api('PUT', '/persona/memory', { personaId: 'baby', text: '启动时立即保存的记忆' }),
      api('PUT', '/settings/prompt', { text: '启动时立即保存的要求' }),
    ]);
    assert.equal(card.status, 200);
    assert.equal(card.body.id, 'baby');
    assert.equal(memory.status, 200);
    assert.equal(prompt.status, 200);
    assert.equal(await readFile(join(dir, 'baby', 'MEMORY.md'), 'utf8'), '启动时立即保存的记忆');
    assert.equal(await readFile(join(dir, 'AGENT.md'), 'utf8'), '启动时立即保存的要求');
    assert.equal(renderSection(ctx, 'my-memory:context'), '启动时立即保存的记忆');
    assert.equal(renderSection(ctx, 'my-memory:agent'), '启动时立即保存的要求');
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(sandbox, { recursive: true, force: true });
  }
});

test('/remember 尊重会话绑定，技术内容也只追加该角色，空白角色拒绝记忆', async () => {
  const { ctx, api, dir, cwd } = await startPlugin();
  try {
    await mkdir(join(cwd, '.git'), { recursive: true });
    clearDetectCache();
    assert.equal((await api('POST', '/personas', { dir: 'cat' })).status, 200);
    await api('PUT', '/persona/memory', { personaId: 'baby', text: '只属于默认角色' });
    await api('POST', '/session/persona', { session: 'cat-session', personaId: 'cat' });
    const source = { agent: { session: { id: 'cat-session', header: { cwd } } } };
    const text = 'API 的配置文件 config.js 今天已经确认过';
    const result = await ctx.state.commands.get('remember').handler({ ...source, rawInput: text });
    assert.equal(result.kind, 'success');
    assert.ok(result.text.includes(join(dir, 'cat', 'MEMORY.md')));
    const catMemory = (await api('GET', '/persona/memory?id=cat')).body.text;
    assert.ok(catMemory.includes(text));
    assert.equal(renderSection(ctx, 'my-memory:context', source), catMemory);
    assert.equal((await api('GET', '/persona/memory?id=baby')).body.text, '只属于默认角色');
    await assert.rejects(readFile(join(dir, 'MEMORY.md'), 'utf8'), { code: 'ENOENT' });
    await assert.rejects(readFile(join(cwd, '.dsh', 'MEMORY.md'), 'utf8'), { code: 'ENOENT' });
    const status = await ctx.state.commands.get('memory').handler(source);
    assert.equal(status.kind, 'success');
    assert.ok(status.text.includes('角色：cat'));
    assert.ok(status.text.includes('长期记忆：' + catMemory.length + ' 字'));

    await api('POST', '/session/persona', { session: 'cat-session', personaId: '__none__' });
    const refused = await ctx.state.commands.get('remember').handler({ ...source, rawInput: '不能落到默认角色' });
    assert.equal(refused.kind, 'error');
    assert.match(refused.text, /空白角色/);
    assert.equal((await api('GET', '/persona/memory?id=baby')).body.text, '只属于默认角色');
    assert.equal((await api('GET', '/persona/memory?id=cat')).body.text, catMemory);
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('三类文档：相同版本并发保存只有一次成功，冲突返回磁盘内容，确认后才能覆盖', async () => {
  const { ctx, api, dir } = await startPlugin();
  try {
    for (const document of editableDocuments) {
      const before = (await api('GET', document.read)).body;
      assert.match(before.rev, /^[0-9a-f]{12}$/, document.label);
      const input = (text) => ({
        ...document.input(text),
        baseRev: before.rev,
        expectedPath: before.path,
      });
      const results = await Promise.all([
        api('PUT', document.write, input('页签甲的内容')),
        api('PUT', document.write, input('页签乙的内容')),
      ]);
      assert.deepEqual(results.map((result) => result.status).sort(), [200, 409], document.label);
      const winner = results.find((result) => result.status === 200);
      const conflict = results.find((result) => result.status === 409);
      assert.equal(conflict.body.conflict, true, document.label);
      assert.equal(conflict.body.rev, winner.body.rev, document.label);
      assert.equal(conflict.body.text, winner.body.text, document.label);
      assert.equal(await readFile(before.path, 'utf8'), winner.body.text, document.label);
      assert.equal(renderSection(ctx, document.section), winner.body[document.field], document.label);

      const forced = await api('PUT', document.write, { ...input('用户确认覆盖的内容'), force: true });
      assert.equal(forced.status, 200, document.label);
      const after = await api('GET', document.read);
      assert.equal(after.body[document.field], '用户确认覆盖的内容', document.label);
    }
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('文档保存拒绝非字符串与遗漏正文，不会把坏请求当成清空', async () => {
  const { ctx, api, dir } = await startPlugin();
  try {
    for (const document of editableDocuments) {
      await api('PUT', document.write, document.input('必须保留的原文'));
      assert.equal((await api('PUT', document.write, document.input(42))).status, 400, document.label);
      if (document.field === 'text') {
        assert.equal((await api('PUT', document.write, document.input(undefined))).status, 400, document.label);
        assert.equal((await api('PUT', document.write, document.input(null))).status, 400, document.label);
      }
      assert.equal((await api('GET', document.read)).body[document.field], '必须保留的原文', document.label);
    }
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('外部编辑三份文件：尺寸和修改时间相同，下一轮仍读取新正文', async () => {
  const { ctx, api, dir } = await startPlugin();
  const fixedTime = new Date('2026-01-01T00:00:00.000Z');
  try {
    for (const document of editableDocuments) {
      const initial = document.label + '：原文甲\n';
      const updated = document.label + '：原文乙\n';
      await api('PUT', document.write, document.input(initial));
      const before = (await api('GET', document.read)).body;
      const disk = await readFile(before.path, 'utf8');
      await utimes(before.path, fixedTime, fixedTime);
      assert.equal(renderSection(ctx, document.section), initial);

      const replacement = disk.replace(initial, updated);
      assert.notEqual(replacement, disk);
      assert.equal(Buffer.byteLength(replacement), Buffer.byteLength(disk));
      await writeFile(before.path, replacement, 'utf8');
      await utimes(before.path, fixedTime, fixedTime);
      assert.equal(renderSection(ctx, document.section), updated, document.label);
      const after = (await api('GET', document.read)).body;
      assert.equal(after[document.field], updated);
      assert.notEqual(after.rev, before.rev);
    }
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});

test('切换数据根后，旧编辑页的 expectedPath 拒绝写入新根，force 也不能越过', async () => {
  const { ctx, api, dir } = await startPlugin();
  const parent = await mkdtemp(join(tmpdir(), 'mm-document-root-'));
  try {
    const originals = [];
    for (const document of editableDocuments) {
      await api('PUT', document.write, document.input('旧目录的' + document.label));
      const data = (await api('GET', document.read)).body;
      originals.push({ document, data, disk: await readFile(data.path, 'utf8') });
    }
    const switched = await api('POST', '/settings/dataDir', { parent });
    assert.equal(switched.status, 200);
    assert.equal(switched.body.dataDir, join(parent, 'dsh-my-memory'));
    for (const { document, data, disk } of originals) {
      const current = (await api('GET', document.read)).body;
      assert.notEqual(current.path, data.path);
      for (const force of [false, true]) {
        const stale = await api('PUT', document.write, {
          ...document.input('旧页面留下的草稿'),
          baseRev: data.rev,
          expectedPath: data.path,
          force,
        });
        assert.equal(stale.status, 409, document.label);
        assert.equal(stale.body.code, 'DOCUMENT_MOVED', document.label);
      }
      const after = (await api('GET', document.read)).body;
      assert.equal(after[document.field], current[document.field], document.label + ' 新目录保持原样');
      assert.equal(after.rev, current.rev);
      assert.equal(await readFile(data.path, 'utf8'), disk, document.label + ' 旧目录保持原样');
    }
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
    await rm(parent, { recursive: true, force: true });
  }
});

test('切根发生在请求正文读取期间，整个保存仍使用请求开始时的目录', async () => {
  const { ctx, api, dir, route } = await startPlugin();
  const parent = await mkdtemp(join(tmpdir(), 'mm-inflight-root-'));
  let releaseBody;
  let bodyStarted = false;
  const bodyGate = new Promise((resolve) => { releaseBody = resolve; });
  let pending;
  try {
    const before = (await api('GET', '/persona/memory?id=baby')).body;
    const request = {
      method: 'PUT',
      url: '/my-memory/api/persona/memory',
      async *[Symbol.asyncIterator]() {
        bodyStarted = true;
        await bodyGate;
        yield Buffer.from(JSON.stringify({
          personaId: 'baby',
          text: '属于原目录的在途保存',
          baseRev: before.rev,
          expectedPath: before.path,
        }), 'utf8');
      },
    };
    const response = makeRes();
    pending = route.handler(request, response);
    await waitFor(() => bodyStarted);
    assert.equal((await api('POST', '/settings/dataDir', { parent })).status, 200);
    releaseBody();
    await pending;
    assert.equal(response.statusCode, 200);
    assert.equal(response.payload.path, before.path);
    assert.equal(await readFile(before.path, 'utf8'), '属于原目录的在途保存');
    const current = await api('GET', '/persona/memory?id=baby');
    assert.equal(current.body.exists, false);
    assert.equal(current.body.text, '');
    assert.equal(renderSection(ctx, 'my-memory:context'), '');
  } finally {
    releaseBody();
    if (pending) await pending;
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
    await rm(parent, { recursive: true, force: true });
  }
});

test('路径约定段：现算 `<数据根>/<角色id>` 与当前文件夹，切数据根后立刻跟着变', async () => {
  const { ctx, api, dir } = await startPlugin();
  const parent = await mkdtemp(join(tmpdir(), 'mm-paths-root-'));
  try {
    await api('PUT', '/personas/baby', { body: '你的画像在 ~\\avatar，形象图在 ~\\gallery。' });
    const activeId = (await api('GET', '/personas')).body.activeId;

    const first = renderSection(ctx, 'my-memory:paths');
    assert.match(first, /^# 路径约定/);
    // `~` 的语义：当前数据根下的角色文件夹（不是用户主目录）
    assert.ok(first.includes('`' + join(dir, activeId) + '`'), '`~` 必须指向 <数据根>/<角色id>');
    assert.ok(first.includes('`' + join(dir, activeId, 'xxx') + '`'), '`~\\xxx` 要给出换算样例');
    assert.ok(first.includes(join(dir, 'workspace')), '还要告诉模型当前所在文件夹');
    // 角色卡段本身保持原样（不掺路径说明）
    assert.equal(renderSection(ctx, 'my-memory:persona'), '你的画像在 ~\\avatar，形象图在 ~\\gallery。');

    const switched = await api('POST', '/settings/dataDir', { parent });
    assert.equal(switched.status, 200);
    const nextRoot = switched.body.dataDir;
    const nextId = (await api('GET', '/personas')).body.activeId;
    const second = renderSection(ctx, 'my-memory:paths');
    assert.ok(second.includes('`' + join(nextRoot, nextId) + '`'), '新数据根必须立刻生效');
    assert.equal(second.includes(join(dir, activeId) + '`'), false, '旧数据根不能残留');
    assert.equal((await api('GET', '/settings')).body.dataDir, nextRoot);
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
    await rm(parent, { recursive: true, force: true });
  }
});

test('子代理会话不注入：delegationDepth>0 时四段全空，主会话照常', async () => {
  const { ctx, api, dir } = await startPlugin();
  try {
    await api('PUT', '/settings/prompt', { text: '只说实话。' });
    await api('PUT', '/personas/baby', { body: '我是大肥鱼。' });
    await api('PUT', '/persona/memory', { personaId: 'baby', text: '喜欢冰美式。' });
    const names = ['my-memory:agent', 'my-memory:persona', 'my-memory:paths', 'my-memory:context'];
    const main = { agent: { session: { id: 'main', header: { delegationDepth: 0 } } } };
    const child = { agent: { session: { id: 'child', header: { delegationDepth: 1 } } } };

    assert.equal(renderSection(ctx, 'my-memory:persona', main), '我是大肥鱼。');
    assert.equal(renderSection(ctx, 'my-memory:context', main), '喜欢冰美式。');
    for (const sectionName of names) {
      assert.equal(renderSection(ctx, sectionName, child), '', sectionName + ' 在子代理会话里必须为空');
    }
    // 服务字段保留，但子代理读出来是空
    const service = ctx.state.services.get('myMemoryPrompt');
    for (const key of ['promptRaw', 'personaRaw', 'memoryRaw']) {
      assert.equal(service[key](child), '');
      assert.notEqual(service[key](main), '');
    }
  } finally {
    ctx.state.effects.forEach((d) => typeof d === 'function' && d());
    await rm(dir, { recursive: true, force: true });
  }
});
