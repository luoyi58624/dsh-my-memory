/**
 * GlobalMemoryPage.jsx —— 面板「全局记忆」页
 *
 * 就是一个阅读区：把 ~/.dsh/my-memory/MEMORY.md 的**原文**铺出来。
 * 没有列表、没有删除、没有新增、没有分段控件 —— 这页的用途是「看一眼她到底记住了什么」，
 * 任何结构化都会让人怀疑「显示的和文件里的是不是同一份」。
 *
 * 数据走宿主的 GET /my-memory/api/memory/raw?scope=global → { scope, path, text }。
 * 为什么不用 GET /memory 的 items：那是解析后的条目（摘要+日期），不是文件原文。
 */
import * as React from 'react';
import { fetchGlobalMemoryRaw } from './api.js';

/** 把绝对路径缩成 ~\.dsh\my-memory\MEMORY.md 这种短形式（面板里空间小） */
function shortPath(p) {
  if (!p) return '';
  return String(p).replace(/^[A-Za-z]:\\Users\\[^\\]+/i, '~');
}

export function GlobalMemoryPage() {
  const [doc, setDoc] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState('');
  /** 请求序号：连点刷新时只认最后一次响应 */
  const seq = React.useRef(0);

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

  const text = doc?.text ?? '';

  return (
    <div className="dsh-mymem-raw" data-dsh-plugin="my-memory" data-dsh-part="global-memory">
      <div className="dsh-mymem-raw-head">
        <span className="dsh-mymem-hint" title={doc?.path || ''}>
          {doc?.path ? `文件：${shortPath(doc.path)}` : ''}
        </span>
        <span className="dsh-mymem-spacer" />
        <button
          className="dsh-mymem-btn dsh-mymem-btn--ghost"
          type="button"
          disabled={loading}
          onClick={() => void load()}
        >
          {loading ? '刷新中…' : '刷新'}
        </button>
      </div>

      {err ? <div className="dsh-mymem-error">{err}</div> : null}

      <pre className="dsh-mymem-raw-pre">{text || (loading ? '' : '（这个文件还是空的）')}</pre>
    </div>
  );
}
