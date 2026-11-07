/**
 * HeroPersonaPicker.jsx —— 新建会话页的角色选择（挂在 conversation.hero.options）
 *
 * 形态照 DSH 官方的「标准模式」下拉：一个胶囊按钮（图标 + 当前角色名 + ⌄），
 * 点开是一个浮层菜单，每项两行（角色名 + 角色信息首行），选中项右侧打勾。
 *
 * 几条硬约束：
 * - **sessionId 拿不到就整条不渲染** —— 没有会话就无从绑定，渲染一个点了没用的控件更糟。
 * - 菜单必须 portal + fixed：它下面就是输入框区域，absolute 会被裁。
 * - 会话一旦建立（locked 或 409），菜单照旧能打开看，但所有项 disabled ——
 *   「能看见可选项」和「能改」是两件事，藏起来会让人以为没配好。
 */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { fetchSessionPersona, bindSessionPersona } from './api.js';
import { fetchPersonas } from './personas.js';
import { ensureStyle } from './styles.js';

/** 从 slot props 里尽力取 sessionId（不同外壳版本字段不一样） */
function sessionIdFromProps(props) {
  return (
    props?.session?.id ||
    props?.sessionId ||
    props?.session?.sessionId ||
    props?.session?.session_id ||
    null
  );
}

/** 取角色信息的第一行，当菜单里的说明 */
function firstLine(body) {
  const s = String(body ?? '').trim();
  if (!s) return '';
  const line = s.split('\n').map((x) => x.trim()).find(Boolean) || '';
  return line.replace(/^[「【\[]?[^」】\]]{0,6}[」】\]]?\s*/, '').trim() || line;
}

function PersonaIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8.2" r="3.4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5.2 19.2c.9-3.3 3.6-5.2 6.8-5.2s5.9 1.9 6.8 5.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9.5 12 15l6-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 内层：只负责「拿得到 sessionId」时的全部逻辑 */
function PickerInner({ sessionId }) {
  const [personas, setPersonas] = React.useState(null);
  const [bound, setBound] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState(null);
  const [err, setErr] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const btnRef = React.useRef(null);

  React.useEffect(() => {
    ensureStyle();
  }, []);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetchPersonas();
        if (alive) setPersonas(res.items || []);
      } catch {
        if (alive) setPersonas([]);
      }
      try {
        const sp = await fetchSessionPersona(sessionId);
        if (alive) setBound(sp);
      } catch {
        // 会话还没建：不算错误，保持「选择角色」状态
      }
    })();
    return () => {
      alive = false;
    };
  }, [sessionId]);

  /** 菜单坐标：贴着按钮下方，贴边时往回翻 */
  const place = React.useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const W = 380;
    const vw = window.innerWidth || 0;
    const vh = window.innerHeight || 0;
    const left = Math.max(8, Math.min(r.left, vw - W - 8));
    // 下面放不下就往上翻（新建会话页按钮往往贴近输入区底部）
    const below = r.bottom + 6;
    const top = below + 320 > vh ? Math.max(8, r.top - 6 - 320) : below;
    setPos({ left, top, width: W });
  }, []);

  React.useEffect(() => {
    if (!open) return undefined;
    place();
    const onDown = (e) => {
      if (btnRef.current?.contains(e.target)) return;
      if (e.target?.closest?.('.dsh-mymem-heromenu')) return;
      setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onResize = () => place();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [open, place]);

  const locked = Boolean(bound?.locked) || Boolean(err);
  const label = bound?.name || '选择角色';

  async function choose(persona) {
    if (locked || busy) return;
    if (persona.id === bound?.personaId) {
      setOpen(false);
      return;
    }
    setBusy(true);
    setErr('');
    try {
      const res = await bindSessionPersona(sessionId, persona.id);
      setBound({
        sessionId,
        personaId: String(res?.personaId ?? persona.id),
        name: String(res?.name ?? persona.name ?? ''),
        locked: res?.locked === undefined ? true : !!res.locked,
      });
      setOpen(false);
    } catch (e) {
      if (e?.status === 409) {
        // 会话已经建立：菜单**不关**，红字说明，所有项变不可点
        setErr('会话已经建立，角色不能切换');
        try {
          const sp = await fetchSessionPersona(sessionId);
          setBound(sp);
        } catch {
          /* 拿不到就沿用原来的绑定 */
        }
      } else {
        setErr(`绑定失败：${e?.message || e}`);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="dsh-mymem-herobtn"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="dsh-mymem-herobtn-icon">
          <PersonaIcon />
        </span>
        <span className="dsh-mymem-herobtn-label">{label}</span>
        <span className="dsh-mymem-herobtn-chev">
          <ChevronIcon />
        </span>
      </button>

      {open && pos && typeof document !== 'undefined'
        ? ReactDOM.createPortal(
            <div className="dsh-mymem-heromenu" style={{ position: 'fixed', left: pos.left, top: pos.top, width: pos.width }}>
              {err ? <div className="dsh-mymem-heromenu-err">{err}</div> : null}
              <div className="dsh-mymem-heromenu-list" role="listbox">
                {(personas || []).map((p) => {
                  const active = p.id === bound?.personaId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      role="option"
                      aria-selected={active}
                      className="dsh-mymem-heroitem"
                      data-active={active ? '1' : '0'}
                      disabled={locked || busy}
                      onClick={() => void choose(p)}
                    >
                      <span className="dsh-mymem-heroitem-main">
                        <span className="dsh-mymem-heroitem-name">{p.name || p.id}</span>
                        {firstLine(p.body) ? <span className="dsh-mymem-heroitem-desc">{firstLine(p.body)}</span> : null}
                      </span>
                      {active ? <span className="dsh-mymem-heroitem-check">✓</span> : null}
                    </button>
                  );
                })}
                {personas && personas.length === 0 ? <div className="dsh-mymem-heromenu-hint">还没有角色卡</div> : null}
              </div>
              {locked ? <div className="dsh-mymem-heromenu-hint">会话建立后角色不可更改</div> : null}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

/** 外层：没有 sessionId 就整条不渲染（连按钮都不出现） */
export function HeroPersonaPicker(props) {
  const sessionId = sessionIdFromProps(props);
  if (!sessionId) return null;
  return <PickerInner sessionId={String(sessionId)} />;
}
