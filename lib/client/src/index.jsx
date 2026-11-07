/**
 * index.jsx —— 客户端插件入口（浏览器侧 cordis 插件）
 *
 * 落点（用同一个 id `my-memory` 把侧边栏入口和面板关联起来，外壳点图标时按 id 选中面板）：
 *   sidebar.panellist   list slot，id=my-memory，渲染 16px 图标
 *   main                keyed slot，key=my-memory，渲染面板
 *   conversation.view   list slot，id=my-memory，会话标签栏里的一页「局部记忆」（只放这个会话的局部记忆）
 *
 * 为什么不再注册 settings.section：角色卡是「这个插件的核心」，不是一堆散装偏好里的一项，
 * 藏在设置第三个分节里没人会翻；放侧边栏入口 = 点图标就进面板，一步到位。
 *
 * 为什么文案直接写中文而不走 locale：本插件只面向中文环境，
 * 引 locale 服务会多一个注入依赖、多一层 key 对齐，收益为零。
 */
import { MemoryPanel } from './Panel.jsx';
import { MemorySidebarIcon } from './icon.jsx';
import { MemoryTab } from './MemoryTab.jsx';
import { HeroPersonaPicker } from './HeroPersonaPicker.jsx';
import { ensureStyle } from './styles.js';

export const name = 'my-memory';

/**
 * slots 用来注册落点，layout 用来在面板内关闭（selectPanel(null)）。
 */
export const inject = ['slots', 'layout'];

const LOG = '[my-memory]';

/** 侧边栏入口 id 与 main 槽位的 key，必须是同一个值 */
const PANEL_ID = 'my-memory';

/**
 * 面板导航：面板里点关闭时把主区域退回会话。
 * layout 拿不到时静默失败（不显示关闭按钮的降级路径由 Panel 自己处理，这里只兜底）。
 * @param {any} ctx cordis 上下文
 */
function createNavigation(ctx) {
  // 复用 DSH 桌面端提供的选框，Web 端没有此入口时由面板显示路径输入框。
  const directoryPicker = globalThis.__DSH_DIRECTORY_PICKER__;
  const pick =
    typeof directoryPicker?.pick === 'function'
      ? () => directoryPicker.pick()
      : null;

  return {
    pick,
    close() {
      try {
        ctx.layout.selectPanel(null);
      } catch (err) {
        console.warn(LOG, 'selectPanel(null) 失败', err);
      }
    },
  };
}

/**
 * 往一个 list slot 注册一项（只够处理简单 list slot）。
 *
 * 形态必须严格遵守：`slots.inject(name, fn)` 的 fn **必须返回 disposer**，
 * 整个 inject 再包一层 `ctx.effect(fn, label)`，这样插件卸载时插槽会被摘干净；
 * 少了 effect 包一层，热更新/禁用插件后会留下「幽灵 tab」。
 *
 * @param {any} ctx cordis 上下文
 * @param {string} slotName 槽位名
 * @param {string} id 注册 id
 * @param {number} order 排序
 * @param {() => string} label 文案
 * @param {any} Component React 组件
 * @returns {boolean} 是否注册成功
 */
function registerSection(ctx, slotName, id, order, label, Component) {
  try {
    if (!ctx.slots || typeof ctx.slots.inject !== 'function') throw new Error('ctx.slots 不可用');
    ctx.effect(
      () =>
        ctx.slots.inject(slotName, () =>
          ctx.slots.register({ name: slotName, id, order, label }, Component),
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
 * 注册侧边栏入口 + 主面板。
 *
 * 这两个必须在**同一条 inject 链**里注册：外壳要求 `main` 的 key 与侧边栏的 id 成对出现，
 * 只挂上其中一个会出现「有图标点不开」或「面板挂在那儿没有入口」的半截状态。
 * 所以任何一半失败，都把已经挂上的另一半摘掉再抛。
 *
 * @param {any} ctx cordis 上下文
 * @param {{close: () => void}} navigation
 * @returns {boolean}
 */
function registerSidebarPanel(ctx, navigation) {
  try {
    if (!ctx.slots || typeof ctx.slots.inject !== 'function') throw new Error('ctx.slots 不可用');
    ctx.effect(
      () =>
        ctx.slots.inject('main', () =>
          ctx.slots.inject('sidebar.panellist', () => {
            const stopMain = ctx.slots.register(
              // inject 把外壳的关闭回调 + 目录选择能力交给面板；
              // 面板拿不到 close 就隐藏关闭按钮，拿不到 pick 就退回手填路径
              { name: 'main', key: PANEL_ID, inject: () => ({ close: navigation.close, pick: navigation.pick }) },
              MemoryPanel,
            );
            let stopIcon = null;
            try {
              stopIcon = ctx.slots.register(
                { name: 'sidebar.panellist', id: PANEL_ID, order: 43, label: () => '记忆' },
                MemorySidebarIcon,
              );
            } catch (err) {
              // 图标没挂上就等于没有入口，留着面板只会让人以为插件坏了
              try {
                stopMain();
              } catch {
                /* 卸载不抛 */
              }
              throw err;
            }
            return () => {
              try {
                stopIcon();
              } finally {
                try {
                  stopMain();
                } catch {
                  /* 卸载不抛 */
                }
              }
            };
          }),
        ),
      'my-memory.sidebar',
    );
    console.info(LOG, '已注册侧边栏入口与记忆面板');
    return true;
  } catch (err) {
    console.warn(LOG, '注册侧边栏入口/主面板失败（不影响会话内「记忆」页）', err);
    return false;
  }
}

/**
 * 插件工厂。
 * @param {any} ctx cordis 上下文
 */
export function apply(ctx) {
  // 样式在这里注入一次即可：所有界面都只依赖这一张样式表，且注入是幂等的
  ensureStyle();

  // 1) 侧边栏入口 + 主面板（角色卡 / 全局·项目记忆）
  registerSidebarPanel(ctx, createNavigation(ctx));

  // 2) 会话标签栏里的一页「记忆」：两个落点互不依赖，各自 try/catch
  registerSection(ctx, 'conversation.view', PANEL_ID, 40, () => '局部记忆', MemoryTab);

  // 3) 新建会话页的角色选择（下拉菜单）。组件自己判断有没有 sessionId，
  //    拿不到就整条不渲染 —— 这里的注册失败也只 warn，不影响前面两个落点。
  registerSection(ctx, 'conversation.hero.options', 'my-memory-persona', 10, () => '角色', HeroPersonaPicker);
}
