/**
 * ContextMenu.jsx —— 自绘右键菜单（照抄原插件结构，不 import 任何外壳包）
 *
 * 两个关键点（原插件踩过）：
 * 1. 用 portal 挂到 body + **fixed** 定位 —— 菜单常常出现在滚动容器里，
 *    绝对定位会被容器的 overflow 裁掉；fixed 顶着视口才不会缺一半。
 * 2. 关窗条件要齐全：点外面（mousedown）、Esc、窗口失焦、点任一菜单项。
 */
import * as React from 'react';
import * as ReactDOM from 'react-dom';

const MENU_W = 160;
const MENU_H_GUESS = 130;

/**
 * @param {{menu: {x:number,y:number,items:Array<{label:string,disabled?:boolean,onClick?:()=>void}>}|null, onClose: ()=>void}} props
 */
export function ContextMenu({ menu, onClose }) {
  React.useEffect(() => {
    if (!menu) return undefined;
    const close = () => onClose();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    window.addEventListener('blur', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('blur', close);
    };
  }, [menu, onClose]);

  if (!menu || typeof document === 'undefined') return null;

  // 贴边时往回翻：菜单不能被视口切掉一截（右下角点的卡片最容易撞边）
  const vw = window.innerWidth || 0;
  const vh = window.innerHeight || 0;
  const left = Math.max(4, Math.min(menu.x, vw - MENU_W - 6));
  const top = Math.max(4, Math.min(menu.y, vh - MENU_H_GUESS - 6));

  return ReactDOM.createPortal(
    <div
      className="dsh-mymem-ctxmenu"
      style={{ position: 'fixed', left, top, zIndex: 2147483002 }}
      // 菜单自身的 mousedown 不能再冒到 document，否则一按就关（点不到项）
      onMouseDown={(e) => e.stopPropagation()}
    >
      {menu.items.map((item) => (
        <button
          key={item.label}
          type="button"
          className="dsh-mymem-ctxitem"
          disabled={item.disabled}
          onClick={() => {
            onClose();
            item.onClick?.();
          }}
        >
          {item.label}
        </button>
      ))}
    </div>,
    document.body,
  );
}

/**
 * 便捷：把一次右键事件的坐标转成菜单状态。
 * @param {React.MouseEvent} e
 * @param {Array<{label:string,disabled?:boolean,onClick?:()=>void}>} items
 */
export function menuAt(e, items) {
  e.preventDefault();
  e.stopPropagation();
  return { x: e.clientX, y: e.clientY, items };
}
