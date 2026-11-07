/**
 * icon.jsx —— 侧边栏入口图标
 *
 * 手写 SVG，不引图标库：外壳的侧边栏按钮自己管尺寸/选中态/悬浮底色，
 * 这里只负责画图形，线条颜色一律 currentColor（跟着外壳的选中态自动变色）。
 */
import * as React from 'react';

/**
 * 「记忆卡」图形：一张圆角卡片 + 三行字 + 右上角一个小圆点。
 * @param {{size?: number}} props size 默认 16（和外壳其它侧边栏图标一致）
 */
export function MemoryIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3.2" y="4.6" width="17.6" height="14.8" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M7 9.4h6.4M7 12.6h9.4M7 15.8h4.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="17.3" cy="9.4" r="1.05" fill="currentColor" />
    </svg>
  );
}

/** 侧边栏入口组件：外壳当按钮内容渲染，所以只包一层居中的 span */
export function MemorySidebarIcon({ size = 16 }) {
  return (
    <span
      data-dsh-plugin="my-memory"
      data-dsh-part="sidebar-icon"
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <MemoryIcon size={size} />
    </span>
  );
}
