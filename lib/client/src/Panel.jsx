/**
 * Panel.jsx —— 侧边栏「记忆」入口点开的主面板
 *
 * 布局照抄原插件 PersonaTab（见 docs/original-persona-ui.png）：
 *   左 260 窄列 = 角色卡列表（本插件只有一张卡，所以没有「＋新建」）
 *   右内容区   = 内页 tab 行（角色设定 / 全局记忆）+ 当前页
 *
 * 内页只有两个，按老板要求砍到底：角色设定（名字 + 角色信息）、全局记忆（MEMORY.md 原文）。
 *
 * 角色卡的读取放在这一层：左边那张卡要显示名字，右页要编辑同一份，
 * 只拉一次接口、保存完通过 onSaved 回传，两边不会出现「左边还是旧名字」。
 */
import * as React from 'react';
import { PersonaSection } from './PersonaSection.jsx';
import { GlobalMemoryPage } from './GlobalMemoryPage.jsx';
import { fetchPersona } from './api.js';
import { ensureStyle } from './styles.js';

const TABS = [
  { key: 'role', label: '角色设定' },
  { key: 'memory', label: '全局记忆' },
];

/**
 * @param {{close?: () => void}} props
 *   close 由槽位 inject 注入（外壳给的关闭回调），拿不到就不渲染关闭按钮 ——
 *   宁可少一个按钮，也不要留一个点不动的叉。
 */
export function MemoryPanel({ close } = {}) {
  const [tab, setTab] = React.useState('role');
  const [persona, setPersona] = React.useState(null);
  const [err, setErr] = React.useState('');

  React.useEffect(() => {
    ensureStyle();
  }, []);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const p = await fetchPersona();
        if (alive) setPersona(p);
      } catch (e) {
        if (alive) setErr(`读取角色卡失败：${e?.message || e}`);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const displayName = persona?.name || '未命名';

  return (
    <div className="dsh-mymem-root dsh-mymem-panel" data-dsh-plugin="my-memory" data-dsh-part="panel">
      <div className="dsh-mymem-split">
        <div className="dsh-mymem-side">
          <div className="dsh-mymem-cards">
            {/* 只有一张卡，永远选中；avatar 接口里没有，就用名字首字 */}
            <div className="dsh-mymem-row" data-active="1">
              <span className="dsh-mymem-avatar">{displayName.slice(0, 1)}</span>
              <div className="dsh-mymem-rowmain">
                <div className="dsh-mymem-name" title={displayName}>
                  {displayName}
                  <span className="dsh-mymem-badge">默认</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dsh-mymem-main">
          <div className="dsh-mymem-toolbar">
            <div className="dsh-mymem-chips" role="tablist" aria-label="面板分页">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  className="dsh-mymem-chip"
                  type="button"
                  role="tab"
                  aria-selected={tab === t.key}
                  data-active={tab === t.key ? '1' : '0'}
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <span className="dsh-mymem-spacer" />
            {typeof close === 'function' ? (
              <button
                className="dsh-mymem-close"
                type="button"
                title="关闭面板"
                aria-label="关闭面板"
                onClick={() => close()}
              >
                ×
              </button>
            ) : null}
          </div>

          {tab === 'memory' ? (
            <GlobalMemoryPage />
          ) : err ? (
            <div className="dsh-mymem-error">{err}</div>
          ) : persona ? (
            <PersonaSection persona={persona} onSaved={setPersona} />
          ) : (
            <div className="dsh-mymem-hint">读取中…</div>
          )}
        </div>
      </div>
    </div>
  );
}
