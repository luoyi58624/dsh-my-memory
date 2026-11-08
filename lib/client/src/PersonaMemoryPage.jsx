/**
 * 每个角色的 MEMORY.md 原文编辑页。
 * 读取、草稿、版本冲突和串行保存由公共文档状态负责，不处理记忆内容。
 */
import * as React from 'react';
import { fetchPersonaMemory, savePersonaMemory } from './api.js';
import { useDocumentEditor, DocumentEditorFeedback } from './DocumentEditor.jsx';

function shortPath(path) {
  return String(path || '').replace(/^[A-Za-z]:\\Users\\[^\\]+/i, '~');
}

function PersonaMemoryEditor({ persona, onSaved, registerEditor }) {
  const personaId = String(persona.id);
  const { editor, state } = useDocumentEditor({
    documentKey: 'memory:' + personaId,
    read: () => fetchPersonaMemory(personaId),
    write: (input) => savePersonaMemory({ ...input, personaId }),
    onSaved: (doc) => onSaved?.(doc.text, personaId),
    registerEditor,
  });
  const path = state.document?.path || '';

  return (
    <div className="dsh-mymem-raw" data-dsh-plugin="my-memory" data-dsh-part="persona-memory">
      <div className="dsh-mymem-raw-head">
        <span className="dsh-mymem-hint" title={path}>
          {path ? '文件：' + shortPath(path) : (persona.name || personaId) + ' 的长期记忆'}
        </span>
        <span className="dsh-mymem-spacer" />
        <button
          className="dsh-mymem-btn dsh-mymem-btn--ghost"
          type="button"
          disabled={state.loading || state.saving}
          onClick={() => void editor.refresh()}
        >
          {state.loading ? '刷新中…' : '刷新'}
        </button>
      </div>
      <textarea
        className="dsh-mymem-raw-edit"
        value={state.draft.text}
        disabled={!state.loaded}
        spellCheck={false}
        placeholder={state.loaded ? '这个角色的 MEMORY.md 原文；直接修改，失焦自动保存' : '正在读取角色的长期记忆…'}
        onFocus={() => void editor.refresh()}
        onBlur={() => void editor.save()}
        onChange={(event) => editor.change({ text: event.target.value })}
      />
      <DocumentEditorFeedback editor={editor} state={state} />
    </div>
  );
}

/** 为选中角色编辑独立记忆；虚拟空白卡没有文件，也不发读写请求。 */
export function PersonaMemoryPage({ persona, onSaved, registerEditor } = {}) {
  if (!persona?.id || persona.virtual) {
    return (
      <div className="dsh-mymem-raw" data-dsh-plugin="my-memory" data-dsh-part="persona-memory">
        <div className="dsh-mymem-empty">
          {persona?.virtual ? '空白卡没有长期记忆，也没有对应的角色目录。' : '先在左边选一张角色卡'}
        </div>
      </div>
    );
  }
  return <PersonaMemoryEditor key={persona.id} persona={persona} onSaved={onSaved} registerEditor={registerEditor} />;
}
