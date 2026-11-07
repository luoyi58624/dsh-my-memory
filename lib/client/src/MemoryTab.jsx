/**
 * MemoryTab.jsx —— 会话标签栏里的「记忆」页
 *
 * 这一页只管**这个会话自己的局部记忆**（`<cwd>/.dsh/MEMORY.md`）：
 *   顶部：当前会话绑定的角色名 + 「局部记忆」开关
 *   内容：那份文件的原文，只读、等宽、pre-wrap、可滚动
 *
 * 为什么这里不放全局记忆：面板里「长期记忆」页已经是全局那份（还能编辑），
 * 这里再放一份全局的，等于同一份数据两个入口，用户根本分不清改的是哪个。
 *
 * 关闭开关的语义要写在脸上：**只是不再记录，已有内容不会被删**。
 * 不写的话，关掉的人会以为记忆被清了。
 */
import * as React from 'react';
import { fetchSessionPersona, fetchProjectState, saveProjectState, fetchProjectRaw } from './api.js';
import { ensureStyle } from './styles.js';

/** sessionId / cwd 都从 slot props 里尽力取（不同外壳版本字段不一样） */
function sessionIdFromProps(props) {
  return props?.session?.id || props?.sessionId || props?.session?.sessionId || props?.session?.session_id || null;
}
function cwdFromProps(props) {
  return props?.session?.cwd || props?.cwd || props?.session?.workingDirectory || null;
}

export function MemoryTab(props) {
  const sessionId = sessionIdFromProps(props);
  const cwd = cwdFromProps(props);

  const [persona, setPersona] = React.useState(null);
  const [state, setState] = React.useState(null);
  const [doc, setDoc] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState('');
  /** 请求序号：连点开关时只认最后一次响应 */
  const seq = React.useRef(0);

  React.useEffect(() => {
    ensureStyle();
  }, []);

  /** 读状态 + 原文（cwd 拿不到就不传，让宿主用默认目录，它自己认） */
  const load = React.useCallback(async () => {
    const my = ++seq.current;
    setLoading(true);
    try {
      const st = await fetchProjectState(cwd);
      if (my !== seq.current) return;
      setState(st);
      // 开关关着也读一次：内容还在，用户可以看看关了之后还剩什么
      try {
        const raw = await fetchProjectRaw(cwd);
        if (my === seq.current) setDoc(raw);
      } catch {
        if (my === seq.current) setDoc({ path: '', text: '' });
      }
      setErr('');
    } catch (e) {
      if (my === seq.current) setErr(`读取失败：${e?.message || e}`);
    } finally {
      if (my === seq.current) setLoading(false);
    }
  }, [cwd]);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    let alive = true;
    if (!sessionId) return undefined;
    (async () => {
      try {
        const sp = await fetchSessionPersona(sessionId);
        if (alive) {
          setPersona(sp);
          // 标签名跟着角色名走（老板要的是这一页叫角色的名字，不是「记忆」）
          if (sp?.name) props.onPersonaName?.(sp.name);
        }
      } catch {
        // 没绑定角色不是错误，顶部显示「未绑定角色」即可
      }
    })();
    return () => {
      alive = false;
    };
  }, [sessionId]);

  const enabled = Boolean(state?.enabled);

  /** 开关：开着就关、关着就开；关掉不删内容 */
  async function toggle() {
    if (busy || !state) return;
    setBusy(true);
    setErr('');
    try {
      await saveProjectState(cwd, !enabled);
      await load();
    } catch (e) {
      setErr(`切换失败：${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  const text = String(doc?.text ?? '');
  const hasText = text.trim().length > 0;

  return (
    <div className="dsh-mymem-root dsh-mymem-pane" data-dsh-plugin="my-memory" data-dsh-part="session-memory">
      <div className="dsh-mymem-head">
        <span className="dsh-mymem-scope-name">{persona?.name || '未绑定角色'}</span>
        <span className="dsh-mymem-spacer" />
        <span className="dsh-mymem-switch">
          <span className="dsh-mymem-switch-label">局部记忆</span>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label="局部记忆"
            className="dsh-mymem-switch-track"
            data-on={enabled ? '1' : '0'}
            disabled={busy || loading || !state}
            onClick={() => void toggle()}
          >
            <span className="dsh-mymem-switch-thumb" />
          </button>
        </span>
      </div>

      {err ? <div className="dsh-mymem-error">{err}</div> : null}

      <div className="dsh-mymem-local" data-off={enabled ? '0' : '1'}>
        {hasText ? (
          <pre className="dsh-mymem-raw-pre dsh-mymem-localpre">{text}</pre>
        ) : (
          <div className="dsh-mymem-empty">
            {loading ? '读取中…' : enabled ? '还没有局部记忆' : '局部记忆已关闭'}
          </div>
        )}
        {/* 关了之后给一层遮罩，内容还在、只是变灰看不清 */}
        {!enabled && hasText ? <div className="dsh-mymem-localmask">局部记忆已关闭</div> : null}
      </div>

      <div className="dsh-mymem-hint">关闭只是不再记录，已有内容不会删除。</div>
    </div>
  );
}
