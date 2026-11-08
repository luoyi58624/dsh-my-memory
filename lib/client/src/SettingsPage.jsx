/**
 * 全局设置：数据目录与 AGENT.md。
 * 更换数据目录之前保存当前文档，成功后重新创建编辑器，避免把旧正文写到新位置。
 */
import * as React from 'react';
import { fetchSettings, changeDataDir, revealDataDir, fetchGlobalPrompt, saveGlobalPrompt } from './api.js';
import { PromptDialog } from './Dialog.jsx';
import { useDocumentEditor, DocumentEditorFeedback } from './DocumentEditor.jsx';

function shortPath(path) {
  return String(path || '').replace(/^[A-Za-z]:\\Users\\[^\\]+/i, '~');
}

function GlobalPromptEditor({ dataDir, registerEditor, onSaved, blocked }) {
  const { editor, state } = useDocumentEditor({
    documentKey: 'agent:' + dataDir,
    read: fetchGlobalPrompt,
    write: saveGlobalPrompt,
    onSaved,
    registerEditor,
  });
  return (
    <>
      <div className="dsh-mymem-settings-title">全局提示词</div>
      <div className="dsh-mymem-hint">
        对所有角色生效，正文保存在数据根下的 <code>AGENT.md</code>。可以直接修改文件；留空表示不注入。
      </div>
      <textarea
        className="dsh-mymem-textarea dsh-mymem-settings-textarea"
        value={state.draft.text}
        disabled={!state.loaded || blocked}
        spellCheck={false}
        placeholder={state.loaded ? '留空 = 不注入这段要求' : '读取中…'}
        onFocus={() => void editor.refresh()}
        onBlur={() => void editor.save()}
        onChange={(event) => editor.change({ text: event.target.value })}
      />
      <div className="dsh-mymem-settings-row">
        <button
          className="dsh-mymem-btn"
          type="button"
          disabled={!state.loaded || state.saving || state.moved || blocked}
          onClick={() => void editor.save()}
        >
          {state.saving ? '保存中…' : '保存'}
        </button>
        <button
          className="dsh-mymem-btn dsh-mymem-btn--ghost"
          type="button"
          disabled={!state.loaded || blocked}
          onClick={() => editor.change({ text: String(state.document?.defaultText ?? '') })}
        >
          恢复默认
        </button>
        <button
          className="dsh-mymem-btn dsh-mymem-btn--ghost"
          type="button"
          disabled={state.loading || state.saving || blocked}
          onClick={() => void editor.refresh()}
        >
          {state.loading ? '读取中…' : '刷新'}
        </button>
        {state.document?.path ? (
          <span className="dsh-mymem-hint" title={state.document.path}>{shortPath(state.document.path)}</span>
        ) : null}
      </div>
      <DocumentEditorFeedback editor={editor} state={state} />
    </>
  );
}

/** 管理数据目录，并把当前全局提示词编辑器交给面板的离开检查。 */
export function SettingsPage({ onChanged, pick, registerEditor } = {}) {
  const [data, setData] = React.useState(null);
  const [err, setErr] = React.useState('');
  const [notice, setNotice] = React.useState('');
  const [movedFrom, setMovedFrom] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [picking, setPicking] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const promptEditor = React.useRef(null);
  const directoryTask = React.useRef(null);
  const noticeTimer = React.useRef(null);
  const alive = React.useRef(true);
  const loadSequence = React.useRef(0);

  const registerPrompt = React.useCallback((editor) => {
    promptEditor.current = editor;
    return () => {
      if (promptEditor.current === editor) promptEditor.current = null;
    };
  }, []);
  const pageEditor = React.useMemo(() => ({
    async flush() {
      if (directoryTask.current) {
        try {
          await directoryTask.current;
        } catch {
          return false;
        }
      }
      return promptEditor.current ? promptEditor.current.flush() : true;
    },
  }), []);
  React.useEffect(() => registerEditor?.(pageEditor), [pageEditor, registerEditor]);

  const load = React.useCallback(async () => {
    const request = ++loadSequence.current;
    const result = await fetchSettings();
    if (alive.current && request === loadSequence.current) setData(result);
    return result;
  }, []);

  React.useEffect(() => {
    alive.current = true;
    void load().catch((error) => {
      if (alive.current) setErr('读取设置失败：' + String(error?.message || error));
    });
    return () => {
      alive.current = false;
      ++loadSequence.current;
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    };
  }, [load]);

  function flash(message) {
    if (!alive.current) return;
    setNotice(message);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => {
      noticeTimer.current = null;
      if (alive.current) setNotice('');
    }, 2600);
  }

  /** 只允许一项目录切换在途，面板离开也会等待它完成。 */
  function submitParent(parent) {
    if (directoryTask.current) return directoryTask.current;
    setBusy(true);
    setErr('');
    directoryTask.current = Promise.resolve().then(async () => {
      if (promptEditor.current && !(await promptEditor.current.flush())) {
        throw new Error('全局提示词尚未保存，请先处理当前的错误或冲突。');
      }
      if (!alive.current) return;
      const result = await changeDataDir(parent);
      if (!alive.current) return;
      // 立即卸下旧编辑器，即使后续读取失败，也不能继续编辑旧路径的内容。
      setData(null);
      setDialogOpen(false);
      setMovedFrom(String(result?.movedFrom ?? ''));
      await load();
      if (!alive.current) return;
      await onChanged?.();
      flash('数据目录已切换：' + shortPath(result?.dataDir));
    }).catch((error) => {
      if (alive.current) setErr('切换目录失败：' + String(error?.message || error));
      throw error;
    }).finally(() => {
      directoryTask.current = null;
      if (alive.current) setBusy(false);
    });
    return directoryTask.current;
  }

  async function onChangeDir() {
    setErr('');
    if (typeof pick !== 'function') {
      setDialogOpen(true);
      return;
    }
    setPicking(true);
    try {
      const picked = await pick();
      if (!picked || !alive.current) return;
      await submitParent(picked);
    } catch (error) {
      if (alive.current) setErr('切换目录失败：' + String(error?.message || error));
    } finally {
      if (alive.current) setPicking(false);
    }
  }

  async function onReveal() {
    setErr('');
    try {
      await revealDataDir();
    } catch (error) {
      if (alive.current) setErr('打开目录失败：' + String(error?.message || error));
    }
  }

  const folderName = data?.folderName || 'dsh-my-memory';
  return (
    <div className="dsh-mymem-settings" data-dsh-plugin="my-memory" data-dsh-part="settings">
      <div className="dsh-mymem-settings-title">数据目录</div>
      <div className="dsh-mymem-hint">
        角色卡、各角色的长期记忆和全局提示词保存在这里。换目录后旧数据不会自动搬过去。
      </div>
      <div className="dsh-mymem-settings-path" title={data?.dataDir || ''}>
        {data?.dataDir || '读取中…'}
      </div>
      <div className="dsh-mymem-settings-row">
        <button className="dsh-mymem-btn" type="button" disabled={!data || busy} onClick={() => void onReveal()}>打开目录</button>
        <button className="dsh-mymem-btn" type="button" disabled={!data || picking || busy} onClick={() => void onChangeDir()}>
          {picking ? '选择中…' : busy ? '切换中…' : '更改目录'}
        </button>
        {!data && err ? (
          <button className="dsh-mymem-btn" type="button" onClick={() => void load().catch((error) => setErr(String(error?.message || error)))}>
            重新读取
          </button>
        ) : null}
        {notice ? <span className="dsh-mymem-ok">{notice}</span> : null}
      </div>
      <div className="dsh-mymem-hint">
        更改目录时选的是父目录，数据固定放在其中的 <code>{folderName}</code> 子目录里。
      </div>
      {data?.defaultDataDir ? <div className="dsh-mymem-hint">默认目录：{shortPath(data.defaultDataDir)}</div> : null}
      {movedFrom ? <div className="dsh-mymem-hint">旧数据没有迁移，仍然留在 {shortPath(movedFrom)}。</div> : null}
      {err ? <div className="dsh-mymem-error">{err}</div> : null}
      {data ? (
        <GlobalPromptEditor
          key={data.dataDir}
          dataDir={data.dataDir}
          registerEditor={registerPrompt}
          blocked={busy}
          onSaved={() => flash('全局提示词已保存，下一轮对话生效')}
        />
      ) : null}
      {dialogOpen ? (
        <PromptDialog
          title="更改数据目录"
          description={'选一个父目录（留空 = 使用默认目录），数据放在它的 ' + folderName + ' 子目录里。'}
          label="父目录"
          defaultValue=""
          placeholder="父目录路径，例如 D:\projects"
          confirmText={busy ? '切换中…' : '切换'}
          allowEmpty
          onSubmit={submitParent}
          onCancel={() => setDialogOpen(false)}
        />
      ) : null}
    </div>
  );
}
