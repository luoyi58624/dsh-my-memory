import * as React from 'react';
import { createDocumentEditor } from './document-editor.js';
import { diffLines, countDiff } from './diff.js';

/** 把文件状态接到 React；每个文档身份固定绑定自己的读写函数。 */
export function useDocumentEditor({ documentKey, read, write, fields, onSaved, registerEditor }) {
  // read/write 必须随 documentKey 一起固定，旧文档的未完成请求不能借用新角色的接口。
  const editor = React.useMemo(
    () => createDocumentEditor({ read, write, fields, onSaved }),
    [documentKey],
  );
  const [view, setView] = React.useState(() => ({ editor, state: editor.getState() }));
  const state = view.editor === editor ? view.state : editor.getState();

  React.useEffect(() => {
    editor.activate();
    const stop = editor.subscribe((next) => setView({ editor, state: next }));
    setView({ editor, state: editor.getState() });
    void editor.refresh();
    return () => {
      stop();
      editor.dispose();
    };
  }, [editor]);

  React.useEffect(() => registerEditor?.(editor), [editor, registerEditor]);
  return { editor, state };
}

/** 角色卡比对只展示名字和正文；Markdown 文件则直接展示全文。 */
function textOf(value, fields) {
  if (fields.length === 1) return String(value?.[fields[0]] ?? '');
  return '名字：' + String(value?.name ?? '') + '\n\n' + String(value?.body ?? '');
}

/** 三类文件统一显示保存错误与版本冲突，保留本地草稿供用户选择。 */
export function DocumentEditorFeedback({ editor, state, fields = ['text'] }) {
  const [expanded, setExpanded] = React.useState(false);
  React.useEffect(() => {
    setExpanded(state.conflict?.kind === 'conflict');
  }, [state.conflict]);

  const rows = expanded && state.conflict
    ? diffLines(textOf(state.conflict.document, fields), textOf(state.draft, fields))
    : [];
  const counts = countDiff(rows);

  return (
    <>
      {state.error ? <div className="dsh-mymem-error">{state.error}</div> : null}
      {state.moved ? (
        <div className="dsh-mymem-remotebar">
          <span>文件位置已经变化，未保存内容仍保留在上面。</span>
          <button
            className="dsh-mymem-btn dsh-mymem-btn--ghost"
            type="button"
            disabled={state.loading || state.saving}
            onClick={() => void editor.refresh({ discard: true })}
          >
            放弃草稿并重新读取
          </button>
        </div>
      ) : null}
      {state.conflict && !expanded ? (
        <div className="dsh-mymem-remotebar">
          <span>磁盘上的内容已更新，当前改动尚未保存</span>
          <span className="dsh-mymem-raw-grow" />
          <button className="dsh-mymem-btn dsh-mymem-btn--ghost" type="button" onClick={() => setExpanded(true)}>
            对比
          </button>
        </div>
      ) : null}
      {state.conflict && expanded ? (
        <div className="dsh-mymem-diff" data-kind="conflict">
          <div className="dsh-mymem-diff-head">
            <span className="dsh-mymem-diff-title">磁盘上的内容已经被改过</span>
            <span className="dsh-mymem-diff-count">新增 {counts.added} 行 · 删除 {counts.removed} 行</span>
          </div>
          <div className="dsh-mymem-diff-body">
            {rows.map((row, i) => (
              <div key={i} className="dsh-mymem-diffline" data-kind={row.kind}>
                <span className="dsh-mymem-diffmark">{row.kind === 'add' ? '+' : row.kind === 'del' ? '−' : ' '}</span>
                <span className="dsh-mymem-difftext">{row.text || ' '}</span>
              </div>
            ))}
          </div>
          <div className="dsh-mymem-diff-actions">
            <button
              className="dsh-mymem-btn"
              type="button"
              disabled={state.saving || state.loading}
              onClick={() => void editor.save({ force: true })}
            >
              用我的覆盖
            </button>
            <button
              className="dsh-mymem-btn dsh-mymem-btn--ghost"
              type="button"
              disabled={state.saving || state.loading}
              onClick={() => editor.useDisk()}
            >
              用磁盘的
            </button>
            <button className="dsh-mymem-btn dsh-mymem-btn--ghost" type="button" onClick={() => setExpanded(false)}>
              取消
            </button>
          </div>
        </div>
      ) : null}
      <div className="dsh-mymem-raw-status">
        {state.saving ? '保存中…' : !state.loaded ? '尚未载入文件' : state.dirty ? '有未保存的改动' : state.savedAt ? '已保存' : ''}
        {state.dirty ? (
          <button
            className="dsh-mymem-btn dsh-mymem-btn--ghost"
            type="button"
            disabled={state.saving}
            onClick={() => editor.discard()}
          >
            放弃未保存改动
          </button>
        ) : null}
        {state.error && state.dirty && !state.conflict && !state.moved ? (
          <button className="dsh-mymem-btn dsh-mymem-btn--ghost" type="button" disabled={state.saving} onClick={() => void editor.save()}>
            重试保存
          </button>
        ) : null}
      </div>
    </>
  );
}
