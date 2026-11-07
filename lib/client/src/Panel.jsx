/**
 * Panel.jsx —— 侧边栏「记忆」入口点开的主面板
 *
 * 结构（照原插件的两层 tab）：
 *   顶层 tab   角色卡 | 全局设置        ← 大字 + 下划线，管「这个面板有哪些大块」
 *   ├ 角色卡：工具行 [＋ 新建] ......... [角色设定 | 长期记忆]  ← 小字选项卡 + 底边线
 *   │        下面左列卡列表 + 右侧内容
 *   └ 全局设置：数据目录等进程级设置
 *
 * 每张卡两行：第一行 圆头像 + 名字 + 「默认」chip；第二行是这卡 agent.md 的路径小字
 * —— 它回答「我现在改的到底是哪个文件」，比任何说明都直接。
 *
 * 两个「选中」分开：
 *   activeId   —— 宿主概念，决定下一轮对话注入哪张卡（右键「设为默认」改它）
 *   selectedId —— 界面概念，决定右边正在编辑哪张卡（点哪张就是哪张）
 * 混成一个的话，「想看看另一张卡」就会把默认卡改掉，这行为很吓人。
 */
import * as React from 'react';
import { PersonaSection } from './PersonaSection.jsx';
import { GlobalMemoryPage } from './GlobalMemoryPage.jsx';
import { SettingsPage } from './SettingsPage.jsx';
import { ContextMenu, menuAt } from './ContextMenu.jsx';
import { PromptDialog, ConfirmDialog } from './Dialog.jsx';
import { fetchMemory } from './api.js';
import {
  fetchPersonas,
  createPersona,
  updatePersona,
  deletePersona,
  setDefaultPersona,
  revealPersona,
  renamePersona,
} from './personas.js';
import { ensureStyle } from './styles.js';

/** 顶层大 tab */
const TOP_TABS = [
  { key: 'persona', label: '角色卡' },
  { key: 'settings', label: '全局设置' },
];

/** 角色卡页里的内页 tab（第二个就叫「长期记忆」，虽然内容就是 MEMORY.md 原文） */
const INNER_TABS = [
  { key: 'role', label: '角色设定' },
  { key: 'memory', label: '长期记忆' },
];

/**
 * 新建角色时输入的是**目录名**：它同时是磁盘上的文件夹名和卡片 id，
 * 所以只能是英文/数字/点/下划线/短横线（中文目录跨工具很难用）。
 * 40 字上限：够表达，又不至于超出任何文件系统的单层路径限制。
 */
const DIR_RE = /^[A-Za-z0-9._-]{1,40}$/;

/**
 * @param {{close?: () => void, pick?: null | ((signal?: AbortSignal) => Promise<string|null>)}} props
 *   close 由槽位 inject 注入（外壳给的关闭回调），拿不到就不渲染关闭按钮；
 *   pick 是外壳的系统文件夹选择框，拿不到就用设置页里的手填弹窗。
 */
export function MemoryPanel({ close, pick } = {}) {
  const [topTab, setTopTab] = React.useState('persona');
  const [tab, setTab] = React.useState('role');
  /** { items, activeId } */
  const [list, setList] = React.useState(null);
  const [selectedId, setSelectedId] = React.useState(null);
  const [err, setErr] = React.useState('');
  const [notice, setNotice] = React.useState('');
  const [menu, setMenu] = React.useState(null);
  /** 全局记忆条数：标题区副标题「N 条长期记忆」用；拿不到就不显示这一段 */
  const [globalCount, setGlobalCount] = React.useState(null);
  const [dialog, setDialog] = React.useState(null);
  /** 每次「更新角色目录」或数据目录切换 +1，用来强制重建右侧编辑页与记忆页 */
  const [reloadTick, setReloadTick] = React.useState(0);

  const noticeTimer = React.useRef(null);
  React.useEffect(() => {
    ensureStyle();
    return () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    };
  }, []);

  /** 短暂提示（已更新之类），1.6s 后自动消失 */
  const flash = React.useCallback((text) => {
    setNotice(text);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => {
      noticeTimer.current = null;
      setNotice('');
    }, 1600);
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
        // 副标题里的条数：单独一路，失败只让这一段不显示，不影响面板
        fetchMemory({ scope: 'global' })
          .then((m) => {
            if (alive) setGlobalCount(m.items.length);
          })
          .catch(() => {});
      } catch (e) {
        if (alive) setErr(`读取角色卡失败：${e?.message || e}`);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  /**
   * 统一动作包装：先干活、再刷新列表；错误原样落到红字。
   * 「删最后一张」这种宿主拒绝的 400 文案必须露出来，不许吞。
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
      kind: 'create',
      onCancel: () => setDialog(null),
      onSubmit: async (dir) => {
        setErr('');
        try {
          const created = await createPersona({ dir });
          setDialog(null);
          await load();
          // 新建完直接切到这张：用户此刻想编辑的就是刚建的那张
          if (created?.id) setSelectedId(created.id);
          setTab('role');
        } catch (e) {
          const msg = String(e?.message || e);
          // 双保险：弹窗里显示一份（用户正看着那里），面板顶部再留一份
          setErr(`新建失败：${msg}`);
          throw new Error(msg);
        }
      },
    });
  }

  function openRename(persona) {
    setDialog({
      kind: 'rename',
      persona,
      onCancel: () => setDialog(null),
      onSubmit: async (name) => {
        await updatePersona(persona.id, { name });
        setDialog(null);
        await load();
      },
    });
  }

  function openDelete(persona) {
    setDialog({
      kind: 'delete',
      persona,
      onCancel: () => setDialog(null),
      onOk: async () => {
        setDialog(null);
        await act(() => deletePersona(persona.id));
      },
    });
  }

  /** 「更新角色目录」：弹窗改磁盘上的文件夹名（不是重读，也不是改显示名） */
  function openRenameDir(persona) {
    setDialog({
      kind: 'renameDir',
      persona,
      onCancel: () => setDialog(null),
      onSubmit: async (dir) => {
        setErr('');
        try {
          const renamed = await renamePersona(persona.id, dir);
          setDialog(null);
          await load();
          // 目录名就是 id，改完是另一张卡了 —— 直接选中新的那个
          if (renamed?.id) setSelectedId(renamed.id);
          flash('目录已更新');
        } catch (e) {
          // 重名 / 非法 / 源目录不存在：弹窗不关，错误显示在弹窗里
          setErr(`更新目录失败：${String(e?.message || e)}`);
          throw new Error(String(e?.message || e));
        }
      },
    });
  }

  /** 右键菜单四项 */
  function menuFor(persona) {
    return [
      {
        label: '设为默认',
        disabled: !!list && list.activeId === persona.id,
        onClick: () => act(() => setDefaultPersona(persona.id)),
      },
      {
        label: '打开角色目录',
        onClick: () =>
          act(async () => {
            await revealPersona(persona.id);
          }),
      },
      { label: '更新角色目录', onClick: () => openRenameDir(persona) },
      { label: '删除角色', onClick: () => openDelete(persona) },
    ];
  }

  /** 数据目录切换后：角色卡和记忆都在新位置，重拉一遍 */
  async function onDataDirChanged() {
    setErr('');
    try {
      await load();
      setReloadTick((t) => t + 1);
    } catch (e) {
      setErr(`重新读取角色卡失败：${e?.message || e}`);
    }
  }

  const selected = list?.items.find((i) => i.id === selectedId) || null;

  /**
   * 副标题：`N 条长期记忆 · 当前角色 <名字>`。
   * 两块数据都是异步的，缺哪块就省哪块 —— 宁可短一点，也不要显示「undefined 条」。
   */
  const activePersona = list?.items.find((i) => i.id === list.activeId) || selected;
  const subtitle = [
    globalCount === null ? '' : `${globalCount} 条长期记忆`,
    activePersona ? `当前角色 ${activePersona.name || activePersona.id}` : '',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="dsh-mymem-root dsh-mymem-panel" data-dsh-plugin="my-memory" data-dsh-part="panel">
      {/* 标题区：标题固定「记忆」，副标题是真实数据（原插件同款） */}
      <div className="dsh-mymem-head">
        <div className="dsh-mymem-title">记忆</div>
        <div className="dsh-mymem-sub">{subtitle}</div>
        <span className="dsh-mymem-tabs-spacer" />
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

      {/* 顶层 tab：管大块（角色卡 / 全局设置） */}
      <div className="dsh-mymem-toptabs" role="tablist" aria-label="面板分区">
        {TOP_TABS.map((t) => (
          <button
            key={t.key}
            className="dsh-mymem-toptab"
            type="button"
            role="tab"
            aria-selected={topTab === t.key}
            data-active={topTab === t.key ? '1' : '0'}
            onClick={() => setTopTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {topTab === 'settings' ? (
        <SettingsPage onChanged={onDataDirChanged} pick={pick} />
      ) : (
        <>
          <div className="dsh-mymem-body">
          {/* 工具行：左边新建、右边内页分段（一个圆角容器装着两段） */}
          <div className="dsh-mymem-toolbar">
            <div className="dsh-mymem-toolbar-left">
              <button className="dsh-mymem-btn" type="button" onClick={openCreate}>
                ＋ 新建
              </button>
              {notice ? <span className="dsh-mymem-ok">{notice}</span> : null}
            </div>
            <div className="dsh-mymem-toolbar-right">
            <div className="dsh-mymem-inner-tabs" role="tablist" aria-label="角色卡分页">
              {INNER_TABS.map((t) => (
                <button
                  key={t.key}
                  className="dsh-mymem-inner-tab"
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
            </div>
          </div>

            {err ? <div className="dsh-mymem-error">{err}</div> : null}

            <div className="dsh-mymem-split">
              <div className="dsh-mymem-side">
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
                          <div className="dsh-mymem-path" title={p.path || p.display}>
                            {p.display}
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
                {tab === 'memory' ? (
                  // 数据目录切换后 key 变化 → 记忆页重新读一次原文
                  <GlobalMemoryPage key={`raw:${reloadTick}`} />
                ) : selected ? (
                  // key 里带 id：换卡 / 目录改名后整体重建，别把旧草稿带过来
                  <PersonaSection
                    key={`${selected.id}:${reloadTick}`}
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
                  <div className="dsh-mymem-hint">
                    {list ? '还没有角色卡，点左上角「＋ 新建」建一张' : '读取中…'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <ContextMenu menu={menu} onClose={closeMenu} />

      {dialog?.kind === 'create' ? (
        <PromptDialog
          title="新建角色"
          description="输入角色目录名。它同时是磁盘上的文件夹名，建好后可以再改显示名。"
          label="角色目录（只能英文、数字、点、下划线、短横线）"
          placeholder="例如 baby"
          confirmText="创建"
          validate={(v) => (DIR_RE.test(v) ? '' : '只能用英文、数字、点、下划线、短横线，1~40 个字符')}
          onSubmit={dialog.onSubmit}
          onCancel={dialog.onCancel}
        />
      ) : null}

      {dialog?.kind === 'renameDir' ? (
        <PromptDialog
          title="更新角色目录"
          description="改的是磁盘上的角色文件夹名，英文、数字、点、下划线、短横线。"
          label="角色目录"
          defaultValue={dialog.persona.id || ''}
          placeholder="例如 baby"
          confirmText="更新"
          validate={(v) => (DIR_RE.test(v) ? '' : '只能用英文、数字、点、下划线、短横线，1~40 个字符')}
          onSubmit={dialog.onSubmit}
          onCancel={dialog.onCancel}
        />
      ) : null}

      {dialog?.kind === 'rename' ? (
        <PromptDialog
          title="重命名角色卡"
          description="只改显示名，目录名不变。"
          label="名字"
          defaultValue={dialog.persona.name || ''}
          confirmText="保存"
          onSubmit={dialog.onSubmit}
          onCancel={dialog.onCancel}
        />
      ) : null}

      {dialog?.kind === 'delete' ? (
        <ConfirmDialog
          title="删除角色卡"
          message={`确定删除「${dialog.persona.name || dialog.persona.id}」？这张卡的设定会一起消失。`}
          confirmText="删除"
          danger
          onOk={dialog.onOk}
          onCancel={dialog.onCancel}
        />
      ) : null}
    </div>
  );
}
