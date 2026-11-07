/**
 * Panel.jsx —— 侧边栏「记忆」入口点开的主面板
 *
 * 结构：一行标题 + 关闭按钮，一排分段 Tab，下面是当前页。
 * 两页都是别处已经在用的组件，直接复用，不复制实现：
 *   角色卡        → PersonaSection（原本给设置页写的，内容与位置无关）
 *   全局/项目记忆 → MemoryTab（会话标签栏里那一页，同一份数据、同一套交互）
 *
 * 为什么不在这里再套一层滚动容器：两个内容组件自己就是「撑满 + 内部列表自己滚」的，
 * 这层只做 flex 分配高度（min-height:0 是关键，否则子元素会把面板顶到溢出）。
 */
import * as React from 'react';
import { PersonaSection } from './PersonaSection.jsx';
import { MemoryTab } from './MemoryTab.jsx';
import { ensureStyle } from './styles.js';

const TABS = [
  { key: 'persona', label: '角色卡' },
  { key: 'memory', label: '全局 / 项目记忆' },
];

/**
 * @param {{close?: () => void}} props
 *   close 由槽位 inject 注入（外壳给的关闭回调），拿不到就不渲染关闭按钮——
 *   宁可少一个按钮，也不要留一个点不动的叉。
 */
export function MemoryPanel({ close } = {}) {
  const [tab, setTab] = React.useState('persona');

  React.useEffect(() => {
    ensureStyle();
  }, []);

  return (
    <div className="dsh-mymem-root dsh-mymem-panel" data-dsh-plugin="my-memory" data-dsh-part="panel">
      <div className="dsh-mymem-panel-head">
        <span className="dsh-mymem-panel-title">记忆</span>
        <span className="dsh-mymem-spacer" />
        {typeof close === 'function' ? (
          <button
            className="dsh-mymem-panel-close"
            type="button"
            title="关闭面板"
            aria-label="关闭面板"
            onClick={() => close()}
          >
            ×
          </button>
        ) : null}
      </div>

      <div className="dsh-mymem-panel-tabs">
        <div className="dsh-mymem-seg" role="tablist" aria-label="面板分页">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`dsh-mymem-seg-btn${tab === t.key ? ' dsh-mymem-seg-btn--on' : ''}`}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="dsh-mymem-panel-body">
        {tab === 'persona' ? <PersonaSection /> : <MemoryTab />}
      </div>
    </div>
  );
}
