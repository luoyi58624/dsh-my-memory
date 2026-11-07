// 单测 · 预设内「工具白名单」插件（@local/dsh-my-memory/preset-solo）
//
// 这个插件现在**只有一个职责**：在 agent 作用域里注册一条 tools.restrict() 白名单，
// 让「聊天模式」这类预设只看见 IM 工具。
// 这里用假 ctx 断言它的**形状**（真值语义由 dsh-tools 的 ToolsService.restrict() 保证，
// 见 lib/host/preset-solo.js 顶部注释里引用的 restrict 语义）。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  apply,
  allowListOf,
  DEFAULT_ALLOWED_TOOLS,
  inject,
  name,
  restrictableToolNames,
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
 * 假 cordis 上下文：只记录 effect 与工具白名单（本插件不再注册段/上下文/抑制器）。
 * @param {{known?: string[]|null}} [options] known=null 表示模拟没有 tools.view() 的老宿主
 */
function makeCtx(options = {}) {
  const known = options.known === undefined ? KNOWN_GLOBALS : options.known;
  const state = {
    restricts: [],
    effects: [],
  };
  const ctx = {
    state,
    logger: { info() {}, warn() {}, error() {}, debug() {} },
    effect(action, label) {
      const dispose = action();
      state.effects.push({ label, dispose });
      return dispose;
    },
    // 故意不提供 systemPrompt：插件不该再碰提示词，碰了这里会直接抛 TypeError
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

test('模块导出：只依赖 tools，且只暴露白名单相关的东西', () => {
  assert.equal(name, 'my-memory-preset-solo');
  assert.deepEqual(inject, ['tools'], '提示词改由根层正常注入，本插件不再需要 systemPrompt');
  assert.equal(typeof apply, 'function');
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

test('注册：apply 只调一次 tools.restrict，不碰 systemPrompt', () => {
  const ctx = makeCtx();
  // 没有任何 systemPrompt 也能跑完：说明 complete 段 / 抑制器 / 影子上下文都删干净了
  assert.doesNotThrow(() => apply(ctx));
  assert.equal(ctx.state.restricts.length, 1, 'restrict 必须被调用一次');
  assert.equal(ctx.state.effects.length, 1, '所有注册都走 ctx.effect');
});

test('工具白名单：allow 只留「此刻真实存在」的 IM 工具', () => {
  const ctx = makeCtx();
  apply(ctx);
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
  const ctx = makeCtx();
  apply(ctx);
  const allow = ctx.state.restricts[0].filter.allow;
  assert.equal(allow.includes('working_directory'), false);
  assert.equal(allow.includes('load_workspace_dependencies'), false);
});

test('工具白名单：注册进 ctx.effect，卸载时 disposer 撤销这条 restriction', () => {
  const ctx = makeCtx();
  apply(ctx);
  const entry = ctx.state.effects.find((e) => typeof e.label === 'string' && e.label.includes('restrict'));
  assert.ok(entry, 'restrict 必须通过 ctx.effect 注册（卸载后白名单要失效）');
  assert.equal(typeof entry.dispose, 'function', 'effect 的撤销函数来自 restrict 的返回值');
  entry.dispose();
  assert.equal(ctx.state.restricts.length, 0, '撤销后 registry 里不能再留着这条 restriction');
});

test('工具白名单：config.allow 覆盖默认清单（且仍与已知工具名取交集）', () => {
  const ctx = makeCtx();
  apply(ctx, { allow: ['working_directory', 'dsh_im_group_history', 'dsh_im_not_registered'] });
  assert.deepEqual(
    ctx.state.restricts[0].filter.allow,
    ['working_directory', 'dsh_im_group_history'],
    '未知名字被交集剔掉，已知的按配置顺序保留',
  );
});

test('工具白名单：config.allow 里全是未知名字 → allow 为空数组（仍然调用 restrict）', () => {
  const ctx = makeCtx();
  apply(ctx, { allow: ['nope', 'nope2'] });
  assert.equal(ctx.state.restricts.length, 1);
  assert.deepEqual(ctx.state.restricts[0].filter.allow, [], '显式配置就照办，只是没有名字活下来');
});

test('工具白名单：已知工具名取交集，未知名字不会传给 restrict（后者会抛错）', () => {
  const ctx = makeCtx();
  apply(ctx);
  const allow = ctx.state.restricts[0].filter.allow;
  for (const toolName of allow) {
    assert.ok(KNOWN_GLOBALS.includes(toolName), `${toolName} 必须是此刻真实存在的全局工具`);
  }
});

test('工具白名单：拿不到 view()（老宿主）时原样传清单，交给 restrict 自己校验', () => {
  const ctx = makeCtx({ known: null });
  apply(ctx);
  assert.deepEqual([...ctx.state.restricts[0].filter.allow], [...DEFAULT_ALLOWED_TOOLS]);
});

test('工具白名单：restrict 抛错时降级为「不裁剪工具」，不弄挂整个 preset', () => {
  const ctx = makeCtx();
  ctx.tools.restrict = () => {
    throw new Error('boom');
  };
  assert.doesNotThrow(() => apply(ctx), '白名单失败不能让 preset 挂掉');
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
