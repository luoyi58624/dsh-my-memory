/**
 * GlobalMemoryPage.jsx —— 面板「长期记忆」页
 *
 * 一整块**始终可编辑**的 textarea，铺的就是 ~/.dsh/my-memory/MEMORY.md 的原文。
 * 没有「编辑」按钮、没有只读态：这页的用途就是「看一眼 / 顺手改一行」，
 * 多一层状态切换只是多一次误点。
 *
 * 三个关键行为（都是老板明确要的）：
 * 1. **聚焦即同步**：onFocus 拉一次磁盘最新内容。
 *    - 本地干净（dirty=false）→ 直接换成磁盘版，静默；
 *    - 本地有改动且磁盘 rev 变了 → **不覆盖**，顶部出一条黄条提示 + 「对比」。
 * 2. **失焦自动保存**：只有 dirty 才发，带 baseRev。
 * 3. **版本冲突**：宿主 409 时不覆盖、不丢本地内容，弹 diff 面板三选一
 *    （用我的覆盖 / 用磁盘的 / 取消）。
 *
 * 为什么不在这里放保存按钮：和角色卡一致 —— 页面上永远没有「我刚才是不是忘了点保存」这个问题。
 */
import * as React from 'react';
import { fetchGlobalMemoryRaw, saveGlobalMemoryRaw } from './api.js';
import { diffLines, countDiff } from './diff.js';

/** 把绝对路径缩成 ~\.dsh\my-memory\MEMORY.md 这种短形式（面板里空间小） */
function shortPath(p) {
  if (!p) return '';
  return String(p).replace(/^[A-Za-z]:\\Users\\[^\\]+/i, '~');
}

/** 状态小字里的时间：HH:MM */
function hhmm() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function GlobalMemoryPage() {
  const [doc, setDoc] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState('');
  /** 编辑器内容 */
  const [text, setText] = React.useState('');
  /** 最后确认落盘的内容：dirty = text !== syncedText */
  const [syncedText, setSyncedText] = React.useState('');
  /** 磁盘版本号（保存时作 baseRev 带回去） */
  const [rev, setRev] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [savedAt, setSavedAt] = React.useState('');
  /** 本地有改动时发现磁盘变了：{text, rev} */
  const [remote, setRemote] = React.useState(null);
  /** 面板：mode='compare' 看差异 / 'conflict' 409 冲突 */
  const [panel, setPanel] = React.useState(null);

  const dirty = text !== syncedText;
  const textRef = React.useRef(text);
  const dirtyRef = React.useRef(dirty);
  const revRef = React.useRef(rev);
  React.useEffect(() => {
    textRef.current = text;
    dirtyRef.current = dirty;
    revRef.current = rev;
  }, [text, dirty, rev]);

  /** 载入磁盘内容（首次进入 / 点刷新） */
  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchGlobalMemoryRaw();
      const disk = String(res?.text ?? '');
      setDoc({ path: String(res?.path ?? '') });
      setText(disk);
      setSyncedText(disk);
      setRev(String(res?.rev ?? ''));
      setRemote(null);
      setErr('');
    } catch (e) {
      setErr(`读取失败：${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  /**
   * 聚焦同步：拿磁盘最新版。
   * 干净 → 静默替换；脏且有更新 → 只出提示条（绝不覆盖用户正在敲的东西）。
   */
  async function onFocus() {
    try {
      const res = await fetchGlobalMemoryRaw();
      const diskText = String(res?.text ?? '');
      const diskRev = String(res?.rev ?? '');
      if (!dirtyRef.current) {
        setText(diskText);
        setSyncedText(diskText);
        setRev(diskRev);
        setRemote(null);
        setErr('');
        return;
      }
      if (diskRev && diskRev !== revRef.current) setRemote({ text: diskText, rev: diskRev });
    } catch {
      // 聚焦同步失败不打扰用户：内容还在编辑器里，等失焦保存时再报错
    }
  }

  /** 失焦自动保存（只在 dirty 时） */
  async function onBlur() {
    if (!dirtyRef.current || saving) return;
    const payload = textRef.current;
    setSaving(true);
    setErr('');
    try {
      const res = await saveGlobalMemoryRaw({ scope: 'global', text: payload, baseRev: revRef.current });
      setRev(String(res?.rev ?? ''));
      setSyncedText(String(res?.text ?? payload));
      setRemote(null);
      setSavedAt(hhmm());
    } catch (e) {
      if (e?.status === 409) {
        // 冲突：内容留在编辑器里，交给用户裁决
        const body = e.body || {};
        setPanel({
          mode: 'conflict',
          diskText: String(body.text ?? ''),
          diskRev: String(body.rev ?? ''),
          baseRev: String(body.baseRev ?? revRef.current),
        });
      } else {
        setErr(`保存失败：${e?.message || e}`);
      }
    } finally {
      setSaving(false);
    }
  }

  /** 「用我的覆盖」：带 force 再写一次 */
  async function overwriteWithMine() {
    setSaving(true);
    setErr('');
    try {
      const res = await saveGlobalMemoryRaw({ scope: 'global', text: textRef.current, baseRev: revRef.current, force: true });
      setRev(String(res?.rev ?? ''));
      setSyncedText(String(res?.text ?? textRef.current));
      setRemote(null);
      setPanel(null);
      setSavedAt(hhmm());
    } catch (e) {
      setErr(`覆盖失败：${e?.message || e}`);
    } finally {
      setSaving(false);
    }
  }

  /** 「用磁盘的」：丢弃本地改动 */
  function useDisk(diskText, diskRev) {
    setText(diskText);
    setSyncedText(diskText);
    if (diskRev) setRev(diskRev);
    setRemote(null);
    setPanel(null);
  }

  const rows = panel ? diffLines(panel.mode === 'conflict' ? panel.diskText : panel.text, text) : [];
  const counts = countDiff(rows);

  return (
    <div className="dsh-mymem-raw" data-dsh-plugin="my-memory" data-dsh-part="global-memory">
      <div className="dsh-mymem-raw-head">
        <span className="dsh-mymem-hint" title={doc?.path || ''}>
          {doc?.path ? `文件：${shortPath(doc.path)}` : ''}
        </span>
        <span className="dsh-mymem-spacer" />
        <button className="dsh-mymem-btn dsh-mymem-btn--ghost" type="button" disabled={loading || saving} onClick={() => void load()}>
          {loading ? '刷新中…' : '刷新'}
        </button>
      </div>

      {/* 磁盘变了但本地有改动：只提示，不动内容 */}
      {remote && !panel ? (
        <div className="dsh-mymem-remotebar">
          <span>磁盘上的内容已更新</span>
          <span className="dsh-mymem-raw-grow" />
          <button
            className="dsh-mymem-btn dsh-mymem-btn--ghost"
            type="button"
            onClick={() => setPanel({ mode: 'compare', text: remote.text, rev: remote.rev })}
          >
            对比
          </button>
        </div>
      ) : null}

      {err ? <div className="dsh-mymem-error">{err}</div> : null}

      <textarea
        className="dsh-mymem-raw-edit"
        value={text}
        spellCheck={false}
        placeholder="这里是 MEMORY.md 的原文，直接改就行；失焦自动保存"
        onFocus={() => void onFocus()}
        onBlur={() => void onBlur()}
        onChange={(e) => setText(e.target.value)}
      />

      {/* diff 面板：冲突（409）与主动对比共用，按钮不同 */}
      {panel ? (
        <div className="dsh-mymem-diff" data-kind={panel.mode}>
          <div className="dsh-mymem-diff-head">
            <span className="dsh-mymem-diff-title">
              {panel.mode === 'conflict' ? '磁盘上的内容已经被改过' : '和磁盘上的内容对比'}
            </span>
            <span className="dsh-mymem-diff-count">
              新增 {counts.added} 行 · 删除 {counts.removed} 行
            </span>
          </div>
          <div className="dsh-mymem-diff-body">
            {rows.map((r, i) => (
              <div
                key={i}
                className="dsh-mymem-diffline"
                data-kind={r.kind}
              >
                <span className="dsh-mymem-diffmark">{r.kind === 'add' ? '+' : r.kind === 'del' ? '−' : ' '}</span>
                <span className="dsh-mymem-difftext">{r.text || ' '}</span>
              </div>
            ))}
          </div>
          <div className="dsh-mymem-diff-actions">
            {panel.mode === 'conflict' ? (
              <>
                <button className="dsh-mymem-btn" type="button" disabled={saving} onClick={() => void overwriteWithMine()}>
                  用我的覆盖
                </button>
                <button
                  className="dsh-mymem-btn dsh-mymem-btn--ghost"
                  type="button"
                  onClick={() => useDisk(panel.diskText, panel.diskRev)}
                >
                  用磁盘的
                </button>
                <button className="dsh-mymem-btn dsh-mymem-btn--ghost" type="button" onClick={() => setPanel(null)}>
                  取消
                </button>
              </>
            ) : (
              <>
                <button
                  className="dsh-mymem-btn dsh-mymem-btn--ghost"
                  type="button"
                  onClick={() => useDisk(panel.text, panel.rev)}
                >
                  用磁盘的
                </button>
                <button className="dsh-mymem-btn dsh-mymem-btn--ghost" type="button" onClick={() => setPanel(null)}>
                  关闭
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}

      <div className="dsh-mymem-raw-status">
        {saving ? '保存中…' : savedAt ? `已保存 · ${savedAt}` : '改动会自动保存'}
        {dirty && !saving ? ' · 有未保存的改动' : ''}
      </div>
    </div>
  );
}
