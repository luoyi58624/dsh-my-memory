// 单测 · 预设内「唯一提示词 + 工具白名单」插件（@local/dsh-my-memory/preset-solo）
//
// 这个插件的全部价值在于「四件事都写进 agent 作用域」：一个唯一的 complete 段、
// 一个 runtime-context 抑制器、一条把 required 上下文影子覆盖成空的注册、
// 一条 tools.restrict() 工具白名单。
// 这里用假 ctx 断言这四点各自的**形状**（真值语义由 dsh-system-prompt / dsh-tools 保证，
// 见 lib/host/preset-solo.js 顶部注释里引用的 assemble() 与 ToolsService.restrict() 代码）。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  apply,
  allowListOf,
  DEFAULT_ALLOWED_TOOLS,
  inject,
  joinSoloText,
  name,
  restrictableToolNames,
  SECTION_SOLO,
  WORKING_DIRECTORY_CONTEXT,
} from '../lib/host/preset-solo.js';

/** 普通会话里真实存在的全局工具名（working_directory / 依赖包来自根层与宿主硬挂） */
const KNOWN_GLOBALS = [
  'dsh_im_group_history',
  'dsh_im_group_file',
  'dsh_im_return_file',
  'working_directory',
  'load_workspace_dependencies',
];

/**
 * 假 cordis 上下文：记录段 / 上下文 / 抑制器 / 工具白名单，并可按需提供 myMemoryPrompt 服务。
 * @param {any} prompt myMemoryPrompt 服务（undefined = 根层没装 my-memory）
 * @param {{known?: string[]|null}} [options] known=null 表示模拟没有 tools.view() 的老宿主
 */
function makeCtx(prompt, options = {}) {
  const known = options.known === undefined ? KNOWN_GLOBALS : options.known;
  const state = {
    sections: [],
    contexts: [],
    suppresses: 0,
    restricts: [],
    effects: [],
  };
  const ctx = {
    state,
    logger: { info() {}, warn() {}, error() {}, debug() {} },
    get(serviceName) {
      return serviceName === 'myMemoryPrompt' ? prompt : undefined;
    },
    effect(action, label) {
      const dispose = action();
      state.effects.push({ label, dispose });
      return dispose;
    },
    systemPrompt: {
      section(definition) {
        state.sections.push(definition);
        return () => {
          const index = state.sections.indexOf(definition);
          if (index >= 0) state.sections.splice(index, 1);
        };
      },
      context(definition) {
        state.contexts.push(definition);
        return () => {
          const index = state.contexts.indexOf(definition);
          if (index >= 0) state.contexts.splice(index, 1);
        };
      },
      suppressRuntimeContext() {
        state.suppresses += 1;
        return () => {};
      },
      getContextOrder(sectionName) {
        // 与 dsh-system-prompt 的 CONTEXT_ORDERS 对齐（WORKING_DIRECTORY = 100）
        return { WORKING_DIRECTORY: 100 }[sectionName];
      },
    },
    tools: {
      // 与 ToolsService.view(scope) 对齐：只给 restrict() 校验要用的那一个集合
      ...(known === null
        ? {}
        : { view: () => ({ restrictableNames: new Set(known) }) }),
      restrict(filter) {
        // 真实现会在这里对未知名字抛错，假实现保持同样的契约
        if (filter.allow === undefined && filter.deny === undefined) {
          throw new Error('tools.restrict({}) is a no-op');
        }
        for (const toolName of [...(filter.allow ?? []), ...(filter.deny ?? [])]) {
          if (known !== null && !known.includes(toolName)) {
            throw new Error(`tools.restrict() names unknown global tool "${toolName}"`);
          }
        }
        const record = { filter };
        state.restricts.push(record);
        return () => {
          const index = state.restricts.indexOf(record);
          if (index >= 0) state.restricts.splice(index, 1);
        };
      },
    },
  };
  return ctx;
}

test('模块导出：插件四件套 + 稳定名字 + 默认白名单', () => {
  assert.equal(name, 'my-memory-preset-solo');
  assert.deepEqual(
    inject,
    ['systemPrompt', 'tools'],
    'myMemoryPrompt 是可选依赖（不能写进 inject），tools 是硬依赖（工具白名单要用）',
  );
  assert.equal(typeof apply, 'function');
  assert.equal(SECTION_SOLO, 'my-memory:preset-solo');
  assert.equal(WORKING_DIRECTORY_CONTEXT, 'working-directory:current');
  assert.deepEqual(
    [...DEFAULT_ALLOWED_TOOLS],
    [
      'dsh_im_context',
      'dsh_im_files',
      'dsh_im_group_file',
      'dsh_im_group_history',
      'dsh_im_reply_to',
      'dsh_im_return_file',
    ],
    '聊天模式的默认白名单就是 dsh-im 的 IM 工具',
  );
  assert.ok(Object.isFrozen(DEFAULT_ALLOWED_TOOLS), '默认值是常量，别让调用方改掉');
});

test('package.json 暴露 ./preset-solo 子路径导出（预设就是按这个名字挂的）', async () => {
  const pkg = JSON.parse(
    await readFile(new URL('../package.json', import.meta.url), 'utf8'),
  );
  assert.equal(pkg.exports['./preset-solo'], './lib/host/preset-solo.js');
});

test('注册：恰好一个段，且是 complete + interpolate:false + 函数 text', () => {
  const ctx = makeCtx({ personaRaw: () => '角色', memoryRaw: () => '记忆' });
  apply(ctx);
  assert.equal(ctx.state.sections.length, 1, '同一作用域只能有一个 complete 段');
  const def = ctx.state.sections[0];
  assert.equal(def.name, SECTION_SOLO);
  assert.equal(def.complete, true, '必须是 complete 段，否则根层英文段还会被拼进来');
  assert.equal(def.interpolate, false, '正文里的 {} 不能被当变量插值');
  assert.equal(typeof def.text, 'function', 'text 必须是函数，每轮组装都求值');
  assert.ok(Number.isFinite(def.order));
});

test('注册：抑制器一次 + working-directory 上下文被影子覆盖成空文本', () => {
  const ctx = makeCtx({ personaRaw: () => 'x', memoryRaw: () => 'y' });
  apply(ctx);
  assert.equal(ctx.state.suppresses, 1, '可选 runtime-context 必须被抑制');
  assert.equal(ctx.state.contexts.length, 1);
  const shadow = ctx.state.contexts[0];
  assert.equal(shadow.name, 'working-directory:current', '必须同名才覆盖得住全局那条');
  assert.equal(shadow.text, '', '空文本 → 渲染阶段被丢弃；非 required → 不会被 refreshContext 补回');
  assert.equal(shadow.required, undefined, '绝不能标 required，否则抑制器与补回逻辑都会把它留下');
  assert.equal(shadow.order, 100, '沿用 WORKING_DIRECTORY 的中心段序');
});

test('工具白名单：apply 后调用一次 tools.restrict，allow 只留「此刻真实存在」的 IM 工具', () => {
  const ctx = makeCtx({ personaRaw: () => 'x', memoryRaw: () => 'y' });
  apply(ctx);
  assert.equal(ctx.state.restricts.length, 1, 'restrict 必须被调用一次');
  assert.deepEqual(
    ctx.state.restricts[0].filter.allow,
    ['dsh_im_group_file', 'dsh_im_group_history', 'dsh_im_return_file'],
    '默认清单里 6 个名字只有 3 个存在 → 交集后只剩这 3 个（restrict 对未知名字会抛错）',
  );
  assert.deepEqual(
    ctx.state.restricts[0].filter.deny,
    undefined,
    '用 allow 白名单，不用 deny 黑名单（聊天模式是「只留 IM」，将来新增工具也必须被藏掉）',
  );
});

test('工具白名单：working_directory / load_workspace_dependencies 不在 allow 里（就是靠它俩被藏掉）', () => {
  const ctx = makeCtx({ personaRaw: () => 'x', memoryRaw: () => 'y' });
  apply(ctx);
  const allow = ctx.state.restricts[0].filter.allow;
  assert.equal(allow.includes('working_directory'), false);
  assert.equal(allow.includes('load_workspace_dependencies'), false);
});

test('工具白名单：注册进 ctx.effect，卸载时 disposer 撤销这条 restriction', () => {
  const ctx = makeCtx({ personaRaw: () => 'x', memoryRaw: () => 'y' });
  apply(ctx);
  const entry = ctx.state.effects.find((e) => typeof e.label === 'string' && e.label.includes('restrict'));
  assert.ok(entry, 'restrict 必须通过 ctx.effect 注册（卸载后白名单要失效）');
  assert.equal(typeof entry.dispose, 'function', 'effect 的撤销函数来自 restrict 的返回值');
  entry.dispose();
  assert.equal(ctx.state.restricts.length, 0, '撤销后 registry 里不能再留着这条 restriction');
});

test('工具白名单：config.allow 覆盖默认清单', () => {
  const ctx = makeCtx({ personaRaw: () => 'x', memoryRaw: () => 'y' });
  apply(ctx, { allow: ['working_directory', 'dsh_im_group_history'] });
  assert.deepEqual(ctx.state.restricts[0].filter.allow, [
    'working_directory',
    'dsh_im_group_history',
  ]);
});

test('工具白名单：拿不到 view()（老宿主）时原样传清单，交给 restrict 自己校验', () => {
  const ctx = makeCtx({ personaRaw: () => 'x', memoryRaw: () => 'y' }, { known: null });
  apply(ctx);
  assert.deepEqual([...ctx.state.restricts[0].filter.allow], [...DEFAULT_ALLOWED_TOOLS]);
});

test('工具白名单：restrict 抛错时降级为「不裁剪工具」，不弄挂整个 preset', () => {
  const ctx = makeCtx({ personaRaw: () => 'x', memoryRaw: () => 'y' });
  ctx.tools.restrict = () => {
    throw new Error('boom');
  };
  apply(ctx);
  assert.equal(ctx.state.sections.length, 1, '白名单失败不影响提示段注册');
  assert.equal(ctx.state.restricts.length, 0);
});

test('restrictableToolNames：没有 view() / 形状不对都安全返回 undefined', () => {
  assert.equal(restrictableToolNames(undefined), undefined);
  assert.equal(restrictableToolNames({}), undefined);
  assert.equal(restrictableToolNames({ view: () => ({}) }), undefined);
  assert.deepEqual([...restrictableToolNames({ view: () => ({ restrictableNames: new Set(['a']) }) })], ['a']);
});

test('allowListOf：数组归一（去空白 / 去空串 / 去重），非数组回落默认值', () => {
  assert.deepEqual(allowListOf(undefined), [...DEFAULT_ALLOWED_TOOLS]);
  assert.deepEqual(allowListOf({ allow: 'nope' }), [...DEFAULT_ALLOWED_TOOLS]);
  assert.deepEqual(allowListOf({ allow: [' a ', '', 3, 'a'] }), ['a']);
  assert.deepEqual(allowListOf({ allow: [] }), [], '显式空数组 = 什么都不留（用户自己的选择）');
});

test('段文本：两段都非空 → 全局记忆 + 空行 + 角色卡，且一句多余的话都没有', () => {
  const ctx = makeCtx({
    memoryRaw: () => '# 记忆正文？不，是裸正文\n\n- 条目',
    personaRaw: () => '你叫大肥鱼，18 岁。\n\n温柔、爱哭。',
  });
  apply(ctx);
  const text = ctx.state.sections[0].text({});
  assert.equal(
    text,
    '# 记忆正文？不，是裸正文\n\n- 条目\n\n你叫大肥鱼，18 岁。\n\n温柔、爱哭。',
  );
});

test('段文本：角色卡空 → 只有全局记忆，前后无多余空行', () => {
  const ctx = makeCtx({ memoryRaw: () => '记忆正文', personaRaw: () => '' });
  apply(ctx);
  assert.equal(ctx.state.sections[0].text({}), '记忆正文');
});

test('段文本：全局记忆空 → 只有角色卡，无前导空行', () => {
  const ctx = makeCtx({ memoryRaw: () => '', personaRaw: () => '角色卡正文' });
  apply(ctx);
  assert.equal(ctx.state.sections[0].text({}), '角色卡正文');
});

test('段文本：两段都空 → 空提示词（不塞占位符）', () => {
  const ctx = makeCtx({ memoryRaw: () => '', personaRaw: () => '' });
  apply(ctx);
  assert.equal(ctx.state.sections[0].text({}), '');
});

test('段文本：my-memory 没装（服务缺失）时降级为空，不抛错', () => {
  const ctx = makeCtx(undefined);
  apply(ctx);
  assert.equal(ctx.state.sections[0].text({}), '');
});

test('joinSoloText：单段抛错只丢这一段，另一段照常输出', () => {
  const text = joinSoloText(
    {
      memoryRaw() {
        throw new Error('读文件炸了');
      },
      personaRaw: () => '角色卡正文',
    },
    {},
  );
  assert.equal(text, '角色卡正文');
});

test('joinSoloText：provider 缺失 / 形状不对 / 只有成品字段（没裸字段）都安全返回空串', () => {
  assert.equal(joinSoloText(undefined, {}), '');
  assert.equal(joinSoloText(null, {}), '');
  assert.equal(joinSoloText({}, {}), '');
  assert.equal(joinSoloText({ memoryRaw: 'not-a-function' }, {}), '');
  // 只有带标题的成品字段时不会退回它们：聊天模式宁可空，也不接受标题和介绍句
  assert.equal(joinSoloText({ personaText: () => '# 角色设定', contextText: () => '# 长期记忆' }, {}), '');
});
