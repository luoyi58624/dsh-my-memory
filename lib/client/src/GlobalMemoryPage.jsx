/**
 * GlobalMemoryPage.jsx —— 面板「全局记忆」页
 *
 * 阅读态 = 把 ~/.dsh/my-memory/MEMORY.md 的**原文**铺出来（不做列表/卡片化）。
 * 编辑态 = 同一个文本换成一个大 textarea，保存后回到阅读态。
 *
 * 为什么允许直接改原文：这页的定位就是「这个文件长什么样」，用户想手改一行不该开别的编辑器；
 * 但默认落在阅读态 —— 绝大多数时候是来看的，不是来改的。
 *
 * 数据：
 *   GET /my-memory/api/memory/raw?scope=global → { scope, path, text }
 *   PUT /my-memory/api/memory/raw { scope:'global', text } → { ok, path, text }
 */
import * as React from 'react';
import { fetchGlobalMemoryRaw } from './api.js';
import { saveGlobalMemoryRaw } from './personas.js';

/** 把绝对路径缩成 ~\.dsh\my-memory\MEMORY.md 这种短形式（面板里空间小） */
function shortPath(p) {
  if (!p) return '';
  return String(p).replace(/^[A-Za-z]:\\Users\\[^\\]+/i, '~');
}

export function GlobalMemoryPage() {
  const [doc, setDoc] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState('');
  const [notice, setNotice] = React.useState('');
  /** 编辑态：null = 阅读态；字符串 = 正在编辑的草稿 */
  const [draft, setDraft] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  /** 请求序号：连点刷新时只认最后一次响应 */
  const seq = React.useRef(0);
  const draftRef = React.useRef(null);

  React.useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const load = React.useCallback(async () => {
    const my = ++seq.current;
    setLoading(true);
    try {
      const res = await fetchGlobalMemoryRaw();
      if (my !== seq.current) return;
      setDoc({ path: String(res?.path ?? ''), text: String(res?.text ?? '') });
      setErr('');
    } catch (e) {
      if (my !== seq.current) return;
      // 失败保留上一次的正文：红字说明问题，内容还在，别把用户正在读的东西抹掉
      setErr(`读取失败：${e?.message || e}`);
    } finally {
      if (my === seq.current) setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const editing = draft !== null;

  async function onSave() {
    if (saving) return;
    if (draft === (doc?.text ?? '')) {
      // 没改就不写盘：这种保存只会白白改 mtime
      setDraft(null);
      return;
    }
    setSaving(true);
    setErr('');
    try {
      await saveGlobalMemoryRaw({ scope: 'global', text: draft ?? '' });
      await load();
      setDraft(null);
      setNotice('已保存');
      setTimeout(() => setNotice(''), 1600);
    } catch (e) {
      // 保存失败必须留在编辑态：把用户写的东西弄丢是最不可接受的失败
      setErr(`保存失败：${e?.message || e}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dsh-mymem-raw" data-dsh-plugin="my-memory" data-dsh-part="global-memory">
      <div className="dsh-mymem-raw-head">
        <span className="dsh-mymem-hint" title={doc?.path || ''}>
          {doc?.path ? `文件：${shortPath(doc.path)}` : ''}
        </span>
        <span className="dsh-mymem-spacer" />
        {editing ? null : (
          <>
            {notice ? <span className="dsh-mymem-ok">{notice}</span> : null}
            <button
              className="dsh-mymem-btn dsh-mymem-btn--ghost"
              type="button"
              disabled={loading || !doc}
              onClick={() => {
                setNotice('');
                setErr('');
                setDraft(doc?.text ?? '');
              }}
            >
              编辑
            </button>
            <button
              className="dsh-mymem-btn dsh-mymem-btn--ghost"
              type="button"
              disabled={loading}
              onClick={() => void load()}
            >
              {loading ? '刷新中…' : '刷新'}
            </button>
          </>
        )}
      </div>

      {err ? <div className="dsh-mymem-error">{err}</div> : null}

      {editing ? (
        <>
          <textarea
            className="dsh-mymem-raw-edit"
            value={draft}
            spellCheck={false}
            placeholder="这里是 MEMORY.md 的原文，直接改就行"
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="dsh-mymem-raw-actions">
            <button
              className="dsh-mymem-btn dsh-mymem-btn--ghost"
              type="button"
              disabled={saving}
              onClick={() => {
                setDraft(null);
                setErr('');
              }}
            >
              取消
            </button>
            <button className="dsh-mymem-btn" type="button" disabled={saving} onClick={() => void onSave()}>
              {saving ? '保存中…' : '保存'}
            </button>
          </div>
        </>
      ) : (
        <pre className="dsh-mymem-raw-pre">{doc?.text || (loading ? '' : '（这个文件还是空的）')}</pre>
      )}
    </div>
  );
}
