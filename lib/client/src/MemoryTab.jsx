/**
 * MemoryTab.jsx —— 会话标签栏里的「记忆」视图
 *
 * 挂在 `conversation.view`（kind=list，scope=session），与「对话 / 轨迹 / 上下文」同一排。
 * 只做两件事：看两边记忆（全局 / 当前项目）、往里加一条和删一条。
 *
 * 关于「哪个项目」：浏览器侧拿不到会话 cwd，所以项目身份统一问宿主 /status 要
 * （宿主用自己的默认工作目录探测 git 仓库），拿到 slug 后再把它显式回传给 /memory。
 * 这样「顶部显示的项目」和「列表里的项目」一定是同一个，不会出现显示 A 项目却列出 B 项目的情况。
 */
import * as React from 'react';
import { addMemory, deleteMemory, fetchMemory, fetchStatus } from './api.js';
import { ensureStyle } from './styles.js';

const SCOPES = [
  { key: 'global', label: '全局' },
  { key: 'project', label: '项目' },
];

export function MemoryTab() {
  const [scope, setScope] = React.useState('global');
  const [status, setStatus] = React.useState(null);
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState('');
  const [notice, setNotice] = React.useState('');
  const [draft, setDraft] = React.useState('');
  /** 请求序号：切 tab / 连点刷新时只认最后一次响应，避免旧列表盖掉新列表 */
  const seq = React.useRef(0);

  const projectSlug = status?.projectSlug || null;

  const load = React.useCallback(async (nextScope) => {
    const my = ++seq.current;
    setLoading(true);
    try {
      const st = await fetchStatus();
      if (my !== seq.current) return;
      setStatus(st);
      const slug = st.projectSlug;
      // 没有项目（默认目录不在 git 仓库里）就别发项目请求：宿主那边同样会返回空，
      // 白跑一趟还多一条「假错误」的风险。
      if (nextScope === 'project' && !slug) {
        setItems([]);
        setErr('');
        return;
      }
      const res = await fetchMemory({ scope: nextScope, project: slug });
      if (my !== seq.current) return;
      setItems(res.items);
      setErr('');
    } catch (e) {
      if (my !== seq.current) return;
      // 失败时保留旧列表不清空：红字说明问题，列表还能看，别把用户正在看的东西抹掉
      setErr(`加载失败：${e?.message || e}`);
    } finally {
      if (my === seq.current) setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    ensureStyle();
  }, []);

  React.useEffect(() => {
    void load(scope);
  }, [load, scope]);

  async function onAdd(event) {
    event?.preventDefault?.();
    const text = draft.trim();
    if (!text || busy) return;
    setBusy(true);
    setErr('');
    setNotice('');
    try {
      await addMemory({
        scope,
        text,
        ...(scope === 'project' && projectSlug ? { project: projectSlug } : {}),
      });
      setDraft('');
      setNotice('记住啦');
      await load(scope);
      setTimeout(() => setNotice(''), 1500);
    } catch (e) {
      setErr(`记下失败：${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id) {
    setErr('');
    try {
      await deleteMemory(id);
      // 乐观移除：列表只用来扫读，先去掉行再拉全量，手感更跟手
      setItems((prev) => prev.filter((it) => it.id !== id));
      await load(scope);
    } catch (e) {
      setErr(`删除失败：${e?.message || e}`);
      await load(scope);
    }
  }

  const scopeTitle = scope === 'global' ? '全局记忆' : `项目记忆 · ${status?.projectName || '当前项目'}`;
  const emptyText =
    scope === 'global'
      ? '还没有记忆。让她记住点什么吧～'
      : projectSlug
        ? '这个项目还没有记忆。技术细节、坑、约定都可以记在这儿～'
        : '当前目录不在 git 仓库里，没有项目记忆。';

  return (
    <div className="dsh-mymem-root dsh-mymem-pane" data-dsh-plugin="my-memory" data-dsh-part="memory-tab">
      <div className="dsh-mymem-head">
        <span className="dsh-mymem-scope-name">{scopeTitle}</span>
        <span className="dsh-mymem-datadir" title={status?.dataDir || ''}>
          {status?.dataDir ? `数据目录 ${status.dataDir}` : ''}
        </span>
        <span className="dsh-mymem-spacer" />
        <button
          className="dsh-mymem-btn dsh-mymem-btn--ghost"
          type="button"
          disabled={loading}
          onClick={() => void load(scope)}
        >
          {loading ? '刷新中…' : '刷新'}
        </button>
      </div>

      <div className="dsh-mymem-seg" role="tablist" aria-label="记忆范围">
        {SCOPES.map((s) => (
          <button
            key={s.key}
            className={`dsh-mymem-seg-btn${scope === s.key ? ' dsh-mymem-seg-btn--on' : ''}`}
            type="button"
            role="tab"
            aria-selected={scope === s.key}
            onClick={() => setScope(s.key)}
          >
            {s.label}
            {status
              ? ` ${s.key === 'global' ? status.globalCount : status.projectCount}`
              : ''}
          </button>
        ))}
      </div>

      {/* 全局记忆是每轮都注入的，塞技术细节会挤爆预算 —— 这句提示就放列表正上方 */}
      {scope === 'global' ? (
        <div className="dsh-mymem-hint">全局记忆只放「人相关、通用、和技术无关」的内容。</div>
      ) : null}

      {err ? <div className="dsh-mymem-error">{err}</div> : null}

      <div className="dsh-mymem-list">
        {items.length === 0 ? (
          <div className="dsh-mymem-empty">{loading ? '读取中…' : emptyText}</div>
        ) : (
          items.map((it) => (
            <div className="dsh-mymem-item" key={it.id}>
              <div className="dsh-mymem-item-main">
                <div className="dsh-mymem-item-summary" title={it.summary}>
                  {it.summary}
                </div>
                <div className="dsh-mymem-item-date">
                  {it.date || '未知日期'}
                  {it.title && it.title !== it.summary ? ` · ${it.title}` : ''}
                </div>
              </div>
              <button
                className="dsh-mymem-del"
                type="button"
                title="删掉这条"
                aria-label="删掉这条"
                onClick={() => void onDelete(it.id)}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      <form className="dsh-mymem-compose" onSubmit={onAdd}>
        <input
          className="dsh-mymem-input"
          type="text"
          value={draft}
          placeholder={scope === 'global' ? '记一条关于她的（偏好、称呼、忌讳…）' : '记一条这个项目的（约定、坑、命令…）'}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button className="dsh-mymem-btn" type="submit" disabled={busy || !draft.trim()}>
          {busy ? '记着…' : '记一条'}
        </button>
        {notice ? <span className="dsh-mymem-ok">{notice}</span> : null}
      </form>
    </div>
  );
}
