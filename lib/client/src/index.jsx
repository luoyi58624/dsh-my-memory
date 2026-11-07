/**
 * index.jsx —— 客户端插件入口（浏览器侧 cordis 插件）
 *
 * 两个落点，都用同一个 id `my-memory`：
 *   settings.section     list slot，scope=root    → 设置页「角色卡」一节
 *   conversation.view    list slot，scope=session → 会话标签栏「记忆」一页
 *
 * 为什么文案直接写中文而不走 locale：本插件只面向中文环境，
 * 引 locale 服务会多一个注入依赖、多一层 key 对齐，收益为零。
 *
 * 为什么每个注册都各自 try/catch：两个落点属于不同外壳版本的能力，
 * 一个槽位不存在（换布局 / 老壳）不该连带把另一个也废掉。
 */
import { PersonaSection } from './PersonaSection.jsx';
import { MemoryTab } from './MemoryTab.jsx';
import { ensureStyle } from './styles.js';

export const name = 'my-memory';

/** 只需要 slots：样式自己注入、文案自己写、不碰 locale / configForms */
export const inject = ['slots'];

const LOG = '[my-memory]';

/**
 * 往一个 list slot 注册一项。
 *
 * 形态必须严格遵守：`slots.inject(name, fn)` 的 fn **必须返回 disposer**，
 * 整个 inject 再包一层 `ctx.effect(fn, label)`，这样插件卸载时插槽会被摘干净；
 * 少了 effect 包一层，热更新/禁用插件后会留下「幽灵 tab」。
 *
 * @param {any} ctx cordis 上下文
 * @param {string} slotName 槽位名
 * @param {number} order 排序
 * @param {() => string} label 文案
 * @param {any} Component React 组件
 * @returns {boolean} 是否注册成功
 */
function registerSection(ctx, slotName, order, label, Component) {
  try {
    if (!ctx.slots || typeof ctx.slots.inject !== 'function') throw new Error('ctx.slots 不可用');
    ctx.effect(
      () =>
        ctx.slots.inject(slotName, () =>
          ctx.slots.register({ name: slotName, id: 'my-memory', order, label }, Component),
        ),
      `my-memory.${slotName}`,
    );
    console.info(LOG, `已注册 ${slotName} → ${label()}`);
    return true;
  } catch (err) {
    console.warn(LOG, `注册 ${slotName} 失败（不影响其它入口）`, err);
    return false;
  }
}

/**
 * 插件工厂。
 * @param {any} ctx cordis 上下文
 */
export function apply(ctx) {
  // 样式在这里注入一次即可：两个界面都只依赖这一张样式表，且注入是幂等的
  ensureStyle();

  // 角色卡：设置页里的一节
  registerSection(ctx, 'settings.section', 60, () => '角色卡', PersonaSection);
  // 记忆：会话标签栏里的一页
  registerSection(ctx, 'conversation.view', 40, () => '记忆', MemoryTab);
}
