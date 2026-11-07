/**
 * Panel.jsx —— 侧边栏「记忆」入口点开的主面板
 *
 * 布局照抄原插件 PersonaTab（docs/original-persona-ui.png）：
 *   左 260 窄列 = 「＋ 新建」+ 角色卡列表（activeId 那张带「默认」chip）
 *   右内容区   = 内页 tab 行（角色设定 / 全局记忆）+ 当前页
 *
 * 两个「选中」是分开的，别混：
 *   activeId  —— 宿主概念，决定下一轮对话注入哪张卡（右键「设为默认」改它）
 *   selectedId —— 界面概念，决定右边正在编辑哪张卡（点哪张就是哪张）
 * 混成一个的话，「想看看另一张卡」就会把默认卡改掉，这行为很吓人。
 *
 * 角色卡列表在本层拉一次，编辑页只负责改；保存后通过 onSaved 回填列表，
 * 左边那张卡的名字能立刻跟着变，不用再拉一次接口。
 */
import * as React from 'react';
import { PersonaSection } from './PersonaSection.jsx';
import { GlobalMemoryPage } from './GlobalMemoryPage.jsx';
import { ContextMenu, menuAt } from './ContextMenu.jsx';
import { PromptDialog, ConfirmDialog } from './Dialog.jsx';
import { fetchPersonas, createPersona, updatePersona, deletePersona, setDefaultPersona } from './personas.js';
import { ensureStyle } from './styles.js';

const TABS = [
  { key: 'role', label: '角色设定' },
  { key: 'memory', label: '全局记忆' },
];

/**
 * @param {{close?: () => void}} props
 *   close 由槽位 inject 注入（外壳给的关闭回调），拿不到就不渲染关闭按钮。
 */
export function MemoryPanel({ close } = {}) {
  const [tab, setTab] = React.useState('role');
  /** { items, activeId } */
  const [list, setList] = React.useState(null);
  const [selectedId, setSelectedId] = React.useState(null);
  const [err, setErr] = React.useState('');
  const [menu, setMenu] = React.useState(null);
  const [dialog, setDialog] = React.useState(null);

  React.useEffect(() => {
    ensureStyle();
  }, []);

  /** 拉列表：保留当前选中（还在的话），否则退回默认卡 */
  const load = React.useCallback(async () => {
    const res = await fetchPersonas();
    setList(res);
    setSelectedId((prev) =>
      prev && res.items.some((i) => i.id === prev) ? prev : (res.activeId ?? res.items[0]?.id ?? null),
    );
    return res;
  }, []);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetchPersonas();
        if (!alive) return;
        setList(res);
        setSelectedId(res.activeId ?? res.items[0]?.id ?? null);
      } catch (e) {
        if (alive) setErr(`读取角色卡失败：${e?.message || e}`);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  /**
   * 统一动作包装：先干活、再刷新列表；错误原样落到顶部红字。
   * 特别注意「删最后一张」这种宿主拒绝的 400 —— 文案必须露出来，不许吞。
   */
  async function act(fn) {
    setErr('');
    try {
      await fn();
      await load();
    } catch (e) {
      setErr(String(e?.message || e));
    }
  }

  const closeMenu = React.useCallback(() => setMenu(null), []);

  function openCreate() {
    setDialog({
      kind: 'prompt',
      title: '新建角色',
      label: '名字',
      placeholder: '给这张卡起个名字',
      confirmText: '创建',
      onOk: async (name) => {
        setDialog(null);
        setErr('');
        try {
          const created = await createPersona({ name });
          await load();
          // 新建完直接切到这张（用户的心理预期是「现在在编辑我刚建的那张」）
          if (created?.id) setSelectedId(created.id);
          setTab('role');
        } catch (e) {
          setErr(`新建失败：${e?.message || e}`);
        }
      },
    });
  }

  function openRename(persona) {
    setDialog({
      kind: 'prompt',
      title: '重命名角色卡',
      label: '名字',
      defaultValue: persona.name || '',
      confirmText: '保存',
      onOk: async (name) => {
        setDialog(null);
        await act(() => updatePersona(persona.id, { name }));
      },
    });
  }

  function openDelete(persona) {
    setDialog({
      kind: 'confirm',
      title: '删除角色卡',
      message: `确定删除「${persona.name || persona.id}」？这张卡的设定会一起消失。`,
      confirmText: '删除',
      danger: true,
      onOk: async () => {
        setDialog(null);
        await act(() => deletePersona(persona.id));
      },
    });
  }

  /** 右键菜单三项：设为默认 / 重命名 / 删除 */
  function menuFor(persona) {
    return [
      {
        label: '设为默认',
        disabled: !!list && list.activeId === persona.id,
        onClick: () => act(() => setDefaultPersona(persona.id)),
      },
      { label: '重命名', onClick: () => openRename(persona) },
      { label: '删除', onClick: () => openDelete(persona) },
    ];
  }

  const selected = list?.items.find((i) => i.id === selectedId) || null;

  return (
    <div className="dsh-mymem-root dsh-mymem-panel" data-dsh-plugin="my-memory" data-dsh-part="panel">
      <div className="dsh-mymem-split">
        <div className="dsh-mymem-side">
          <div className="dsh-mymem-side-head">
            <button className="dsh-mymem-btn" type="button" onClick={openCreate}>
              ＋ 新建
            </button>
          </div>

          <div className="dsh-mymem-cards">
            {list ? (
              list.items.map((p) => (
                <div
                  key={p.id}
                  className="dsh-mymem-row"
                  data-active={p.id === selectedId ? '1' : '0'}
                  onClick={() => setSelectedId(p.id)}
                  onContextMenu={(e) => setMenu(menuAt(e, menuFor(p)))}
                >
                  <span className="dsh-mymem-avatar">{(p.name || p.id).slice(0, 1)}</span>
                  <div className="dsh-mymem-rowmain">
                    <div className="dsh-mymem-name" title={p.name || p.id}>
                      {p.name || p.id}
                      {list.activeId === p.id ? <span className="dsh-mymem-badge">默认</span> : null}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="dsh-mymem-hint">读取中…</div>
            )}
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

          {err ? <div className="dsh-mymem-error">{err}</div> : null}

          {tab === 'memory' ? (
            <GlobalMemoryPage />
          ) : selected ? (
            // key 用 id：换一张卡时把编辑页的内部状态整体重置，别把上一张的草稿带过来
            <PersonaSection
              key={selected.id}
              persona={selected}
              onSaved={(saved) =>
                setList((prev) =>
                  prev
                    ? { ...prev, items: prev.items.map((i) => (i.id === saved.id ? { ...i, ...saved } : i)) }
                    : prev,
                )
              }
            />
          ) : (
            <div className="dsh-mymem-hint">{list ? '还没有角色卡，点左上角「＋ 新建」建一张' : '读取中…'}</div>
          )}
        </div>
      </div>

      <ContextMenu menu={menu} onClose={closeMenu} />
      {dialog?.kind === 'prompt' ? (
        <PromptDialog
          title={dialog.title}
          label={dialog.label}
          defaultValue={dialog.defaultValue}
          placeholder={dialog.placeholder}
          confirmText={dialog.confirmText}
          onOk={dialog.onOk}
          onCancel={() => setDialog(null)}
        />
      ) : null}
      {dialog?.kind === 'confirm' ? (
        <ConfirmDialog
          title={dialog.title}
          message={dialog.message}
          confirmText={dialog.confirmText}
          danger={dialog.danger}
          onOk={dialog.onOk}
          onCancel={() => setDialog(null)}
        />
      ) : null}
    </div>
  );
}
