/**
 * styles.js —— 面板样式（运行时注入，不走构建期 CSS）
 *
 * **整体照抄原插件 PersonaTab 的观感**：左右分栏（左 260 窄列卡列表 + 右内容区）、
 * 胶囊内页 tab、行式设置项、卡式记忆列表。规则体基本是原插件 styles.js 的搬运，
 * 唯一改动是类名前缀换成 `.dsh-mymem-`。
 *
 * why 不直接沿用原插件的 `.dsh-memory-* / .dsh-persona-*` 类名：
 * 两个插件同时启用时会把各自 <style> 注入同一个 document，
 * 同名不同义（或同义不同值）的规则会互相覆盖，谁后注入谁赢 —— 这是看不见的定时炸弹。
 *
 * 另外一条踩过的坑：**不要给按钮做「品牌色实心填充 + #fff 文字」**。
 * 主题里 `--dsw-alias-button-primary-fill` 可能接近白色，实心填充再写白字
 * 就是一个白色空块（上一版保存按钮就是这么翻车的）。所以按钮一律用
 * 「bg-layer-2 底 + border-l1 描边 + label-primary 文字」，和原插件一致。
 */

export const STYLE_ID = 'dsh-my-memory-style';

export const CSS = `
/* ---------- 根容器 ---------- */

/* height:100% + position:relative 是硬性要求。
   **不要** position:absolute —— 外壳给的容器本身不是定位元素时，absolute 会一路找到视口，
   把整个窗口都盖住。position:relative 只为让内部绝对定位锚在这里。 */
.dsh-mymem-root {
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  max-height: 100%;
  min-height: 0;
  color: var(--dsw-alias-label-primary, #e8ecf7);
  font-size: 13px;
}

/* ---------- 面板：左右分栏（照抄原插件 .dsh-memory-split） ---------- */

.dsh-mymem-panel {
  background: var(--dsw-alias-bg-base, #16181d);
  /* 面板自己不留内边距：顶层 tab 行要贴着面板边缘画满贯通的底线 */
  padding: 0;
}
.dsh-mymem-split {
  display: grid;
  grid-template-columns: minmax(200px, 260px) minmax(0, 1fr);
  gap: 14px;
  min-height: 0;
  height: 100%;
}
@media (max-width: 640px) {
  .dsh-mymem-split { grid-template-columns: 1fr; }
}

/* ---------- 两层 tab ---------- */

/* ---------- 标题区（照原插件 .dsh-memory-head） ---------- */

.dsh-mymem-panel .dsh-mymem-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px 0;
  flex: 0 0 auto;
}
.dsh-mymem-title {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--dsw-alias-label-primary, #e8ecf7);
}
.dsh-mymem-sub {
  font-size: 11.5px;
  color: var(--dsw-alias-label-secondary, #9aa3b2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ---------- 两层 tab ---------- */

/* 顶层：照原插件 .dsh-memory-tabs / .dsh-memory-tab（13px + 2px 品牌色短下划线） */
.dsh-mymem-toptabs {
  display: flex;
  gap: 4px;
  padding: 10px 16px 0;
  border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(150,170,210,0.16));
  flex: 0 0 auto;
}
.dsh-mymem-toptab {
  appearance: none;
  border: 0;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #9aa3b2);
  font: inherit;
  font-size: 13px;
  padding: 7px 12px 9px;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  position: relative;
}
.dsh-mymem-toptab:hover { color: var(--dsw-alias-label-primary, #e8ecf7); }
.dsh-mymem-toptab[data-active="1"] {
  color: var(--dsw-alias-label-primary, #e8ecf7);
  background: var(--dsw-alias-bg-layer-1, #1d2027);
}
.dsh-mymem-toptab[data-active="1"]::after {
  content: "";
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: -1px;
  height: 2px;
  border-radius: 2px;
  background: var(--dsw-alias-brand-primary, #4f7dff);
}

/* 工具行：左「＋ 新建」、右内页分段。
   用和分栏同一套栅格（260 + gap 14），分段控件才会**正好落在右栏的左边线**上
   —— 原插件就是这个位置（分段在右栏开头），不是贴面板右边缘。 */
.dsh-mymem-toolbar {
  display: grid;
  grid-template-columns: minmax(200px, 260px) minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  flex: 0 0 auto;
  margin-bottom: 8px;
}
.dsh-mymem-toolbar-left { display: flex; align-items: center; gap: 8px; min-width: 0; }
.dsh-mymem-toolbar-right { display: flex; align-items: center; gap: 8px; min-width: 0; }
.dsh-mymem-tabs-spacer { flex: 1 1 auto; }
/* 弹性占位：把右边的东西（刷新按钮 / 开关）推到行尾。
   注意它和 .dsh-mymem-tabs-spacer 是两个类，都别删 —— 早前整理样式时误删过一次，
   结果「刷新」和开关都挤到了文件名/角色名旁边。 */
.dsh-mymem-spacer { flex: 1 1 auto; }

/* 内页：一个圆角容器装着若干段（照原插件 .dsh-segmented） */
.dsh-mymem-inner-tabs {
  display: inline-flex;
  border: 1px solid var(--dsw-alias-border-l1, rgba(150,170,210,0.16));
  border-radius: 8px;
  overflow: hidden;
  flex: 0 0 auto;
}
.dsh-mymem-inner-tab {
  appearance: none;
  font: inherit;
  font-size: 12px;
  padding: 4px 12px;
  border: 0;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #9aa3b2);
  cursor: pointer;
}
.dsh-mymem-inner-tab:hover { color: var(--dsw-alias-label-primary, #e8ecf7); }
.dsh-mymem-inner-tab[data-active="1"] {
  background: var(--dsw-alias-bg-layer-2, #24272f);
  color: var(--dsw-alias-label-primary, #e8ecf7);
}

/* 角色卡页的内容容器（内边距照原插件 .dsh-memory-body） */
.dsh-mymem-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  padding: 14px 16px 24px;
}
.dsh-mymem-body .dsh-mymem-split { flex: 1 1 auto; height: auto; }

/* 左列：固定 260，不跟着面板一起变宽 */
.dsh-mymem-side {
  min-height: 0;
  overflow: auto;
  width: 100%;
  max-width: 260px;
}
.dsh-mymem-cards { display: flex; flex-direction: column; gap: 8px; }

/* 一张卡：圆头像 + 名字 + 「默认」chip，选中态是品牌色描边（原插件同款） */
.dsh-mymem-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
  background: var(--dsw-alias-bg-layer-1, #1d2027);
}
.dsh-mymem-row:hover { background: var(--dsw-alias-bg-layer-2, #24272f); }
.dsh-mymem-row[data-active="1"] {
  border-color: var(--dsw-alias-brand-primary, #4f7dff);
  background: var(--dsw-alias-bg-layer-2, #24272f);
}
.dsh-mymem-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  flex: 0 0 auto;
  background: var(--dsw-alias-bg-layer-2, #24272f);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--dsw-alias-label-secondary, #9aa3b2);
}
.dsh-mymem-rowmain { min-width: 0; }
.dsh-mymem-name {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* 卡片第二行：这张卡的 agent.md 路径。它回答「我现在改的是哪个文件」，比任何说明都直接 */
.dsh-mymem-path {
  margin-top: 2px;
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, #9aa3b2);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsh-mymem-badge {
  display: inline-block;
  margin-left: 6px;
  font-size: 10.5px;
  padding: 1px 6px;
  border-radius: 999px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(150,170,210,0.3));
  color: var(--dsw-alias-label-secondary, #9aa3b2);
  white-space: nowrap;
  vertical-align: 1px;
}

/* 右区：纵向排布，自己滚（面板里内容可能比视口长） */
.dsh-mymem-main {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: auto;
}

/* 关闭按钮：原插件面板没有（它的关闭在外壳层），但我们要能退回会话 */
.dsh-mymem-close {
  flex: 0 0 auto;
  /* 20px 高：不把 .dsh-mymem-head 撑高（原插件没有这个按钮，head 是 31px） */
  width: 22px;
  height: 20px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1;
  color: var(--dsw-alias-label-tertiary, #6d7686);
  background: transparent;
  cursor: pointer;
}
.dsh-mymem-close:hover {
  color: var(--dsw-alias-label-primary, #e8ecf7);
  background: var(--dsw-alias-interactive-bg-hover, rgba(150,170,210,.12));
}

/* ---------- 通用表单件（照抄原插件 .dsh-memory-input / -textarea） ---------- */

.dsh-mymem-input,
.dsh-mymem-textarea {
  font: inherit;
  font-size: 12.5px;
  color: var(--dsw-alias-label-primary, #e8ecf7);
  background: var(--dsw-alias-bg-layer-2, #24272f);
  border: 1px solid var(--dsw-alias-border-l1, rgba(150,170,210,0.16));
  border-radius: 8px;
  padding: 6px 10px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}
.dsh-mymem-input:focus,
.dsh-mymem-textarea:focus { border-color: var(--dsw-alias-brand-primary, #4f7dff); }
.dsh-mymem-textarea {
  resize: vertical;
  line-height: 1.65;
  font-family: inherit;
}
.dsh-mymem-input::placeholder,
.dsh-mymem-textarea::placeholder { color: var(--dsw-alias-label-tertiary, #6d7686); }

/* 一行「标签 + 控件」没有共用 CSS：原插件用 SETTING_* 内联常量，这里同样内联（Panel 里那份常量） */

/* 正文整行：标签在上、控件在下（原插件 .dsh-persona-field / -label） */
.dsh-mymem-field { display: flex; flex-direction: column; gap: 5px; }
.dsh-mymem-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #e8ecf7);
}

.dsh-mymem-hint {
  font-size: 11.5px;
  color: var(--dsw-alias-label-secondary, #9aa3b2);
  line-height: 1.7;
}
.dsh-mymem-error {
  font-size: 12px;
  line-height: 1.6;
  color: var(--dsw-alias-state-error-primary, #e06b6b);
  word-break: break-word;
}
.dsh-mymem-ok {
  font-size: 11.5px;
  color: var(--dsw-alias-state-done-primary, #48b884);
}

/* ---------- 通用按钮（bg-layer-2 + 描边，绝不用实心品牌填充） ---------- */

.dsh-mymem-btn {
  appearance: none;
  font: inherit;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 7px;
  cursor: pointer;
  white-space: nowrap;
  color: var(--dsw-alias-label-primary, #e8ecf7);
  background: var(--dsw-alias-bg-layer-2, #24272f);
  border: 1px solid var(--dsw-alias-border-l1, rgba(150,170,210,0.16));
}
.dsh-mymem-btn:hover:not(:disabled) { border-color: var(--dsw-alias-border-l2, rgba(150,170,210,0.32)); }
.dsh-mymem-btn:disabled { opacity: .5; cursor: default; }
.dsh-mymem-btn--ghost { background: transparent; color: var(--dsw-alias-label-secondary, #9aa3b2); }
.dsh-mymem-btn--ghost:hover:not(:disabled) {
  color: var(--dsw-alias-label-primary, #e8ecf7);
  background: var(--dsw-alias-interactive-bg-hover, rgba(150,170,210,.12));
}
.dsh-mymem-btn--danger {
  color: var(--dsw-alias-state-error-primary, #e06b6b);
  border-color: currentColor;
}
.dsh-mymem-btn--danger:hover:not(:disabled) { border-color: currentColor; }

/* ---------- 全局设置页 ---------- */

.dsh-mymem-settings {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
}
.dsh-mymem-settings-title { font-size: 13px; font-weight: 600; }
/* 当前数据目录：等宽 + 可选中复制（这行是给人复制去资源管理器用的，不是输入框） */
.dsh-mymem-settings-path {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.6;
  padding: 8px 10px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(150,170,210,0.16));
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1, #1d2027);
  color: var(--dsw-alias-label-primary, #e8ecf7);
  word-break: break-all;
  user-select: text;
}
.dsh-mymem-settings-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }


/* ---------- 右键菜单（portal + fixed，不能被面板容器裁掉） ---------- */

.dsh-mymem-ctxmenu {
  min-width: 160px;
  padding: 5px;
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-3, #23262e);
  border: 1px solid var(--dsw-alias-border-l2, rgba(150,170,210,0.28));
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.45);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.dsh-mymem-ctxitem {
  appearance: none;
  font: inherit;
  font-size: 12.5px;
  text-align: left;
  padding: 6px 10px;
  border-radius: 7px;
  border: 0;
  background: transparent;
  color: var(--dsw-alias-label-primary, #e8ecf7);
  cursor: pointer;
  white-space: nowrap;
}
.dsh-mymem-ctxitem:hover:not(:disabled) { background: var(--dsw-alias-bg-layer-2, #2b2f38); }
.dsh-mymem-ctxitem:disabled {
  color: var(--dsw-alias-label-secondary, #9aa3b2);
  cursor: not-allowed;
  background: transparent;
}

/* ---------- 小弹窗（新建 / 重命名 / 删除确认） ---------- */

.dsh-mymem-modal-mask {
  position: fixed;
  inset: 0;
  z-index: 2147483001;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.42);
}
.dsh-mymem-modal {
  width: 360px;
  max-width: calc(100vw - 32px);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-3, #23262e);
  border: 1px solid var(--dsw-alias-border-l2, rgba(150,170,210,0.28));
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.5);
  color: var(--dsw-alias-label-primary, #e8ecf7);
}
.dsh-mymem-modal-title { font-size: 13.5px; font-weight: 600; }
.dsh-mymem-modal-label { font-size: 11.5px; color: var(--dsw-alias-label-secondary, #9aa3b2); }
.dsh-mymem-modal-message { font-size: 12.5px; line-height: 1.7; color: var(--dsw-alias-label-secondary, #9aa3b2); }
/* 弹窗内校验/接口错误：一行红字，不弹 alert，也不把弹窗关掉 */
.dsh-mymem-modal-error {
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--dsw-alias-state-error-primary, #e06b6b);
  word-break: break-word;
}
.dsh-mymem-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 2px;
}

/* ---------- 全局记忆页：MEMORY.md 原文阅读区 ---------- */

/* 这一页不卡片化、不分段、不列表：就是把文件原文铺出来，占满内容区高度自己滚 */
.dsh-mymem-raw {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dsh-mymem-raw-head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
}
.dsh-mymem-raw-pre {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  margin: 0;
  padding: 10px 12px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(150,170,210,0.16));
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1, #1d2027);
  color: var(--dsw-alias-label-primary, #e8ecf7);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 编辑态：同一个位置换成大 textarea（等宽、占满、可竖向拉伸） */
.dsh-mymem-raw-edit {
  flex: 1 1 auto;
  min-height: 220px;
  box-sizing: border-box;
  width: 100%;
  margin: 0;
  padding: 10px 12px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(150,170,210,0.28));
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1, #1d2027);
  color: var(--dsw-alias-label-primary, #e8ecf7);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.7;
  outline: none;
  resize: vertical;
}
.dsh-mymem-raw-edit:focus { border-color: var(--dsw-alias-brand-primary, #4f7dff); }
/* 长期记忆页：底部状态小字（无保存按钮，改动自动保存） */
.dsh-mymem-raw-status {
  flex: 0 0 auto;
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary, #8d95a5);
}
.dsh-mymem-raw-grow { flex: 1 1 auto; }

/* 磁盘变了但本地有改动：只提示，不动用户输入 */
.dsh-mymem-remotebar {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-state-warning-primary, #d9a441);
  background: rgba(217, 164, 65, 0.12);
  color: var(--dsw-alias-state-warning-primary, #d9a441);
  font-size: 11.5px;
}

/* 冲突 / 对比面板：行级 diff（新增绿底、删除红底） */
.dsh-mymem-diff {
  flex: 0 0 auto;
  max-height: 44%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--dsw-alias-border-l2, rgba(150,170,210,0.28));
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1, #1d2027);
  overflow: hidden;
}
.dsh-mymem-diff-head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(150,170,210,0.16));
}
.dsh-mymem-diff-title { font-size: 12.5px; font-weight: 600; }
.dsh-mymem-diff-count { font-size: 11px; color: var(--dsw-alias-label-tertiary, #8d95a5); }
.dsh-mymem-diff-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  padding: 6px 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.6;
}
.dsh-mymem-diffline { display: flex; gap: 6px; padding: 0 10px; white-space: pre-wrap; word-break: break-word; }
.dsh-mymem-diffline[data-kind="add"] { background: rgba(72, 184, 132, 0.16); }
.dsh-mymem-diffline[data-kind="del"] { background: rgba(224, 107, 107, 0.16); }
.dsh-mymem-diffmark { flex: 0 0 10px; color: var(--dsw-alias-label-secondary, #9aa3b2); }
.dsh-mymem-diffline[data-kind="add"] .dsh-mymem-diffmark { color: var(--dsw-alias-state-done-primary, #48b884); }
.dsh-mymem-diffline[data-kind="del"] .dsh-mymem-diffmark { color: var(--dsw-alias-state-error-primary, #e06b6b); }
.dsh-mymem-difftext { flex: 1 1 auto; min-width: 0; }
.dsh-mymem-diff-actions {
  flex: 0 0 auto;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 8px 10px;
  border-top: 1px solid var(--dsw-alias-border-l1, rgba(150,170,210,0.16));
}

.dsh-mymem-raw-actions {
  flex: 0 0 auto;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* ---------- 会话标签栏「记忆」页（conversation.view，保持原样） ---------- */

.dsh-mymem-pane {
  flex: 1 1 auto;
  min-height: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 16px 14px;
  background: var(--dsw-alias-bg-base, transparent);
}
.dsh-mymem-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; flex: 0 0 auto; }
.dsh-mymem-scope-name { font-size: 12.5px; font-weight: 600; }
.dsh-mymem-datadir {
  min-width: 0;
  max-width: 44ch;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary, #6d7686);
}
.dsh-mymem-seg {
  flex: 0 0 auto;
  display: inline-flex;
  gap: 2px;
  padding: 2px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(150,170,210,.16));
  border-radius: 9px;
  background: var(--dsw-alias-bg-layer-1, #1d2027);
}
.dsh-mymem-seg-btn {
  height: 24px;
  padding: 0 12px;
  border: 0;
  border-radius: 7px;
  font-family: inherit;
  font-size: 12px;
  color: var(--dsw-alias-label-secondary, #9aa3b2);
  background: transparent;
  cursor: pointer;
}
.dsh-mymem-seg-btn:hover { color: var(--dsw-alias-label-primary, #e8ecf7); }
.dsh-mymem-seg-btn--on {
  color: var(--dsw-alias-label-primary, #e8ecf7);
  font-weight: 600;
  background: var(--dsw-alias-bg-layer-2, rgba(150,170,210,.16));
}
.dsh-mymem-list {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--dsw-alias-border-l1, rgba(150,170,210,.16));
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1, #1d2027);
}
.dsh-mymem-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(150,170,210,.16));
}
.dsh-mymem-item:last-child { border-bottom: 0; }
.dsh-mymem-item:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(150,170,210,.1)); }
.dsh-mymem-item-main { flex: 1 1 auto; min-width: 0; }
.dsh-mymem-item-summary {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12.5px;
}
.dsh-mymem-item-date { margin-top: 2px; font-size: 10.5px; color: var(--dsw-alias-label-tertiary, #6d7686); }
.dsh-mymem-del {
  flex: 0 0 auto;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 0;
  border-radius: 7px;
  font-family: inherit;
  font-size: 13px;
  line-height: 1;
  color: var(--dsw-alias-label-tertiary, #6d7686);
  background: transparent;
  cursor: pointer;
  opacity: .55;
  transition: opacity .12s ease, background .12s ease, color .12s ease;
}
.dsh-mymem-item:hover .dsh-mymem-del,
.dsh-mymem-del:focus-visible { opacity: 1; }
.dsh-mymem-del:hover {
  color: var(--dsw-alias-label-primary, #e8ecf7);
  background: var(--dsw-alias-state-error-primary, #e06b6b);
}
.dsh-mymem-empty {
  padding: 28px 10px;
  text-align: center;
  color: var(--dsw-alias-label-secondary, #9aa3b2);
  font-size: 12.5px;
  line-height: 1.8;
}
.dsh-mymem-compose { flex: 0 0 auto; display: flex; align-items: center; gap: 8px; }
.dsh-mymem-compose .dsh-mymem-input { flex: 1 1 auto; }
/* 角色选择要跟「文件夹 / 标准模式」排成一排左起。
   官方布局（conversation 包的 CSS module）：heroWorkspaceRow 是 flex 行，
   里面 workspace chip → agentPreset → 一个 heroOptions 容器，而 heroOptions 用
   用了 margin-left:auto 被顶到行尾，所以挂在这个槽位里的东西天然靠右。
   这里只把那个 auto 拿掉，让整组回到左起；别的一概不动。
   类名带构建哈希（形如 an3WzG_heroOptions），所以用属性包含选择器，不写死哈希。 */
[class*="_heroWorkspaceRow"] > [class*="_heroOptions"] { margin-left: 0; }

/* ---------- 新建会话页：角色选择（胶囊按钮 + 浮层菜单） ---------- */

.dsh-mymem-herobtn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 28px;
  padding: 0 9px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #9aa3b2);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  transition: background .12s ease, color .12s ease;
}
.dsh-mymem-herobtn:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(150,170,210,.12));
  color: var(--dsw-alias-label-primary, #e8ecf7);
}
.dsh-mymem-herobtn-icon,
.dsh-mymem-herobtn-chev { display: inline-flex; align-items: center; color: inherit; }
.dsh-mymem-herobtn-chev { opacity: .7; }
.dsh-mymem-herobtn-label { white-space: nowrap; }

.dsh-mymem-heromenu {
  z-index: 2147483002;
  box-sizing: border-box;
  max-height: 340px;
  display: flex;
  flex-direction: column;
  /* 宽度跟着内容走：菜单里只有角色名，写死宽度会拖出一大片空白 */
  width: max-content;
  /* 有点最小宽度，勾才对得齐右边缘；同时不至于空一大片 */
  min-width: 188px;
  max-width: 280px;
  padding: 6px;
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-3, var(--dsw-alias-bg-overlay, #2b2f38));
  border: 1px solid var(--dsw-alias-border-l2, rgba(150,170,210,0.28));
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.5);
}
.dsh-mymem-heromenu-list { min-height: 0; overflow: auto; display: flex; flex-direction: column; gap: 1px; }
.dsh-mymem-heroitem {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
  padding: 7px 10px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--dsw-alias-label-primary, #e8ecf7);
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.dsh-mymem-heroitem:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover, rgba(150,170,210,.12)); }
.dsh-mymem-heroitem:disabled { cursor: default; }
.dsh-mymem-heroitem[data-active="1"] .dsh-mymem-heroitem-name { font-weight: 600; }
.dsh-mymem-heroitem-main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.dsh-mymem-heroitem-name { font-size: 13px; font-weight: 600; }
.dsh-mymem-heroitem-check {
  flex: 0 0 auto;
  margin-left: auto;
  font-size: 12px;
  line-height: 1;
  color: var(--dsw-alias-label-primary, #e8ecf7);
}
.dsh-mymem-heromenu-hint {
  padding: 8px 12px;
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--dsw-alias-label-tertiary, #8d95a5);
}
.dsh-mymem-heromenu-err {
  margin: 2px 2px 6px;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
  color: var(--dsw-alias-state-error-primary, #e06b6b);
  background: rgba(224, 107, 107, 0.12);
}

/* ---------- 会话「记忆」页：局部记忆开关 + 只读原文 ---------- */

.dsh-mymem-switch { display: inline-flex; align-items: center; gap: 8px; }
.dsh-mymem-switch-label { font-size: 12px; color: var(--dsw-alias-label-secondary, #9aa3b2); }
.dsh-mymem-switch-track {
  position: relative;
  width: 34px;
  height: 18px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: var(--dsw-alias-bg-layer-2, #24272f);
  box-shadow: inset 0 0 0 1px var(--dsw-alias-border-l1, rgba(150,170,210,0.16));
  cursor: pointer;
  transition: background .15s ease;
}
.dsh-mymem-switch-track[data-on="1"] {
  background: var(--dsw-alias-brand-primary, #4f7dff);
  box-shadow: none;
}
.dsh-mymem-switch-track:disabled { opacity: .5; cursor: default; }
.dsh-mymem-switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  transition: transform .15s ease;
}
.dsh-mymem-switch-track[data-on="1"] .dsh-mymem-switch-thumb { transform: translateX(16px); }

.dsh-mymem-local {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.dsh-mymem-localpre { flex: 1 1 auto; min-height: 0; }
/* 关掉开关：内容还在，只是变灰看不清 */
.dsh-mymem-local[data-off="1"] .dsh-mymem-localpre { opacity: .28; }
.dsh-mymem-localmask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(22, 24, 29, 0.35);
  color: var(--dsw-alias-label-secondary, #9aa3b2);
  font-size: 12.5px;
  pointer-events: none;
}

`;

/**
 * 注入样式表（幂等）。
 * why 运行时注入：DSH 客户端只加载单个 JS bundle，没有配套的 <link> 通道。
 */
export function ensureStyle() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = CSS;
  document.head.appendChild(el);
}
