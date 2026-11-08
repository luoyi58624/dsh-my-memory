/**
 * 角色设定页：名字与正文分别编辑，失焦保存同一份 agent.md。
 * 使用文件版本保护外部修改，保存回包只确认已经提交的那一份内容。
 */
import * as React from 'react';
import { fetchPersonaById, updatePersona } from './personas.js';
import { useDocumentEditor, DocumentEditorFeedback } from './DocumentEditor.jsx';

const FIELDS = ['name', 'body'];

/** 编辑指定角色的名字与正文；registerEditor 让上层离开前等待保存。 */
export function PersonaSection({ persona, onSaved, registerEditor } = {}) {
  const personaId = String(persona?.id ?? '');
  const { editor, state } = useDocumentEditor({
    documentKey: 'persona:' + personaId,
    fields: FIELDS,
    read: () => fetchPersonaById(personaId),
    write: (input) => updatePersona(personaId, input),
    onSaved,
    registerEditor,
  });

  return (
    <>
      <label className="dsh-mymem-field">
        <span className="dsh-mymem-label">名字</span>
        <input
          className="dsh-mymem-input"
          value={state.draft.name}
          disabled={!state.loaded}
          placeholder="展示用的角色名（不改目录名）"
          spellCheck={false}
          onFocus={() => void editor.refresh()}
          onChange={(event) => editor.change({ name: event.target.value })}
          onBlur={() => void editor.save()}
        />
      </label>

      <div className="dsh-mymem-settings-row">
        <span className="dsh-mymem-hint">改动会自动保存</span>
        <button
          className="dsh-mymem-btn dsh-mymem-btn--ghost"
          type="button"
          disabled={state.loading || state.saving}
          onClick={() => void editor.refresh()}
        >
          {state.loading ? '读取中…' : '刷新'}
        </button>
      </div>

      <label className="dsh-mymem-field">
        <span className="dsh-mymem-label">角色信息</span>
        <textarea
          className="dsh-mymem-textarea"
          rows={16}
          value={state.draft.body}
          disabled={!state.loaded}
          placeholder="随便写：她是谁、怎么说话、怎么称呼你……失焦自动保存"
          spellCheck={false}
          onFocus={() => void editor.refresh()}
          onChange={(event) => editor.change({ body: event.target.value })}
          onBlur={() => void editor.save()}
        />
      </label>
      <DocumentEditorFeedback editor={editor} state={state} fields={FIELDS} />
    </>
  );
}
