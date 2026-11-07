/**
 * styles.js —— 两个界面的样式（运行时注入，不走构建期 CSS）
 *
 * 约定：
 * - 颜色全部吃外壳主题变量 `--dsw-alias-*`，取不到才退回深色兜底，亮/暗主题都不违和
 * - 类名统一 `.dsh-mymem-` 前缀，绝不污染外壳其它面板
 * - 只注入一次（STYLE_ID 去重），见 index.jsx
 */

export const STYLE_ID = 'dsh-my-memory-style';

export const CSS = `
/* 面板根容器。
   height:100% + position:relative 是硬性要求：
   **不要** position:absolute —— 外壳给的容器本身不是定位元素时，absolute 会一路找到视口，
   把整个窗口都盖住（旧插件踩过这个坑）。position:relative 只为让内部绝对定位锚在这里。 */
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
  line-height: 1.5;
}

/* ---------- 通用小件 ---------- */

.dsh-mymem-btn {
  flex: 0 0 auto;
  height: 30px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-family: inherit;
  font-size: 12.5px;
  white-space: nowrap;
  cursor: pointer;
  color: #fff;
  background: var(--dsw-alias-button-primary-fill, #3b6fe0);
  transition: background .12s ease, box-shadow .12s ease, opacity .12s ease;
}
.dsh-mymem-btn:hover:not(:disabled) { background: var(--dsw-alias-button-primary-hover, #4a7ff0); }
.dsh-mymem-btn:disabled { opacity: .5; cursor: default; }
/* 有未保存改动时给按钮加一圈光：不用文字提示也能一眼看出「还没存」 */
.dsh-mymem-btn--dirty { box-shadow: 0 0 0 3px var(--dsw-alias-interactive-bg-active, rgba(90,140,255,.28)); }

.dsh-mymem-btn--ghost {
  color: var(--dsw-alias-label-secondary, #9aa3b2);
  background: transparent;
  border-color: var(--dsw-alias-border-l1, rgba(150,170,210,.16));
}
.dsh-mymem-btn--ghost:hover:not(:disabled) {
  color: var(--dsw-alias-label-primary, #e8ecf7);
  background: var(--dsw-alias-interactive-bg-hover, rgba(150,170,210,.12));
}

.dsh-mymem-input {
  box-sizing: border-box;
  width: 100%;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(150,170,210,.16));
  border-radius: 8px;
  font-family: inherit;
  font-size: 13px;
  color: var(--dsw-alias-label-primary, #e8ecf7);
  background: var(--dsw-alias-bg-layer-1, #1d2027);
  outline: none;
  transition: border-color .12s ease;
}
.dsh-mymem-input:focus { border-color: var(--dsw-alias-border-l2, rgba(150,190,255,.5)); }
.dsh-mymem-input::placeholder { color: var(--dsw-alias-label-tertiary, #6d7686); }

/* 错误一行红字：任何 fetch 失败都落到这里，绝不让界面白屏 */
.dsh-mymem-error {
  flex: 0 0 auto;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-state-error-primary, #f0596b);
  word-break: break-word;
}
.dsh-mymem-ok {
  flex: 0 0 auto;
  font-size: 12px;
  color: var(--dsw-alias-state-done-primary, #3ecf8e);
}
.dsh-mymem-hint {
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--dsw-alias-label-tertiary, #6d7686);
}

/* ---------- A. 设置页「角色卡」 ---------- */

.dsh-mymem-page {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 20px 28px;
}
.dsh-mymem-title { font-size: 15px; font-weight: 600; }
.dsh-mymem-field { display: flex; flex-direction: column; gap: 6px; }
.dsh-mymem-label { font-size: 12px; color: var(--dsw-alias-label-secondary, #9aa3b2); }

/* 角色设定：原生 textarea。外壳组件库没有多行输入框，这里只能自己来 */
.dsh-mymem-textarea {
  box-sizing: border-box;
  width: 100%;
  min-height: 250px;          /* 13px x 1.6 x 12 行 ≈ 250px */
  padding: 10px 12px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(150,170,210,.16));
  border-radius: 10px;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.6;
  color: var(--dsw-alias-label-primary, #e8ecf7);
  background: var(--dsw-alias-bg-layer-1, #1d2027);
  outline: none;
  resize: vertical;           /* 只允许垂直拉伸，横向拉伸会把布局撑烂 */
  transition: border-color .12s ease;
}
.dsh-mymem-textarea:focus { border-color: var(--dsw-alias-border-l2, rgba(150,190,255,.5)); }

.dsh-mymem-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.dsh-mymem-spacer { flex: 1 1 auto; }

/* ---------- B. 会话标签栏「记忆」 ---------- */

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

/* 分段控件：全局 / 项目 */
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
  transition: background .12s ease, color .12s ease;
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

/* 删除按钮平时几乎不可见，hover 到条目上才显形：列表要能扫读，不能被一排叉号占满 */
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
  opacity: 0;
  transition: opacity .12s ease, background .12s ease, color .12s ease;
}
.dsh-mymem-item:hover .dsh-mymem-del,
.dsh-mymem-del:focus-visible { opacity: 1; }
.dsh-mymem-del:hover {
  color: #fff;
  background: var(--dsw-alias-state-error-primary, #f0596b);
}

.dsh-mymem-empty {
  padding: 30px 18px;
  text-align: center;
  font-size: 12px;
  line-height: 1.8;
  color: var(--dsw-alias-label-tertiary, #6d7686);
}

.dsh-mymem-compose { flex: 0 0 auto; display: flex; align-items: center; gap: 8px; }
.dsh-mymem-compose .dsh-mymem-input { flex: 1 1 auto; }
`;

/**
 * 注入样式表（幂等）。
 * 为什么不走构建期 CSS：DSH 客户端只加载单个 JS bundle，没有配套的 <link> 通道。
 */
export function ensureStyle() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = CSS;
  document.head.appendChild(el);
}
