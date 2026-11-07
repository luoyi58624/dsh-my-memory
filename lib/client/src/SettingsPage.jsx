/**
 * SettingsPage.jsx —— 面板「全局设置」页
 *
 * 目前只有一件事：数据目录。为什么先做它：角色卡、记忆全落在这个目录里，
 * 用户搬盘或换机器时，唯一需要说清楚「东西在哪」的就是这一行路径。
 *
 * 两条改目录的路径：
 *   1. 有 `pick`（外壳的 ctx.remote.directoryPicker.pick）→ 弹系统文件夹选择框，
 *      用户选的是**父目录**，子目录名固定（宿主拼成 <父目录>/<folderName>）。
 *   2. 没有 remote（老外壳/桩环境）→ 退回手填父目录的输入框，行为一致。
 *
 * 为什么界面必须写出「数据会放在 X\Y」：用户选的是 D:\abc，但东西落在 D:\abc\dsh-my-memory，
 * 不写清楚他会去 D:\abc 里找一个不存在的 MEMORY.md。
 */
import * as React from 'react';
import { fetchSettings, changeDataDir, revealDataDir } from './api.js';
import { PromptDialog } from './Dialog.jsx';

/** 把绝对路径缩成 ~\... 这种短形式（面板里空间小） */
function shortPath(p) {
  if (!p) return '';
  return String(p).replace(/^[A-Za-z]:\\Users\\[^\\]+/i, '~');
}

/**
 * @param {{onChanged?: () => void, pick?: null | ((signal?: AbortSignal) => Promise<string|null>)}} props
 *   pick 由 index.jsx 从 ctx.remote.directoryPicker 探测后传进来；拿不到就是 null
 */
export function SettingsPage({ onChanged, pick } = {}) {
  const [data, setData] = React.useState(null);
  const [err, setErr] = React.useState('');
  const [notice, setNotice] = React.useState('');
  const [movedFrom, setMovedFrom] = React.useState('');
  /** 只在没有 pick、退化到手填时才用 */
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [picking, setPicking] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const noticeTimer = React.useRef(null);

  React.useEffect(
    () => () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    },
    [],
  );

  const load = React.useCallback(async () => {
    try {
      const res = await fetchSettings();
      setData(res);
      setErr('');
    } catch (e) {
      setErr(`读取设置失败：${e?.message || e}`);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  function flash(text) {
    setNotice(text);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => {
      noticeTimer.current = null;
      setNotice('');
    }, 2600);
  }

  const folderName = data?.folderName || 'dsh-my-memory';
  const canPick = typeof pick === 'function';

  /** 提交父目录：宿主负责拼上固定子目录名 */
  async function submitParent(parent) {
    setBusy(true);
    setErr('');
    try {
      const res = await changeDataDir(parent);
      setDialogOpen(false);
      setMovedFrom(String(res?.movedFrom ?? ''));
      await load();
      flash(`数据目录已切换：${shortPath(String(res?.dataDir ?? ''))}`);
      // 目录一变，角色卡和记忆全在新位置 —— 让父组件重拉一遍
      onChanged?.();
    } catch (e) {
      // 手填弹窗不关：路径写错时用户还要改
      throw new Error(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  /** 更改目录：优先系统选择框；取消（null）就什么都不做 */
  async function onChangeDir() {
    setErr('');
    if (!canPick) {
      setDialogOpen(true);
      return;
    }
    setPicking(true);
    try {
      const picked = await pick();
      // 用户取消 → 不发任何请求（这条很容易写错成「取消也保存」）
      if (!picked) return;
      await submitParent(picked);
    } catch (e) {
      setErr(`选择目录失败：${e?.message || e}`);
    } finally {
      setPicking(false);
    }
  }

  async function onReveal() {
    setErr('');
    try {
      await revealDataDir();
    } catch (e) {
      setErr(`打开目录失败：${e?.message || e}`);
    }
  }

  return (
    <div className="dsh-mymem-settings" data-dsh-plugin="my-memory" data-dsh-part="settings">
      <div className="dsh-mymem-settings-title">数据目录</div>
      <div className="dsh-mymem-hint">
        角色卡、全局记忆、项目记忆都存在这个目录里。换目录后旧数据不会自动搬过去。
      </div>

      <div className="dsh-mymem-settings-path" title={data?.dataDir || ''}>
        {data?.dataDir || (data ? '（空）' : '读取中…')}
      </div>

      <div className="dsh-mymem-settings-row">
        <button className="dsh-mymem-btn" type="button" disabled={!data} onClick={() => void onReveal()}>
          打开目录
        </button>
        <button
          className="dsh-mymem-btn"
          type="button"
          disabled={!data || picking || busy}
          onClick={() => void onChangeDir()}
        >
          {picking ? '选择中…' : '更改目录'}
        </button>
        {notice ? <span className="dsh-mymem-ok">{notice}</span> : null}
      </div>

      {/* 把「选父目录、子目录名固定」这件事写在明面上，别让人去父目录里找一个不存在的文件 */}
      <div className="dsh-mymem-hint">
        {'更改目录时选的是父目录，数据固定放在 '}
        <code>{folderName}</code>
        {' 子目录里：例如选了 D:\\projects，实际位置是 D:\\projects\\' + folderName + '。'}
      </div>

      {data?.defaultDataDir ? (
        <div className="dsh-mymem-hint">
          默认目录：{shortPath(data.defaultDataDir)}（不选 = 使用默认）
        </div>
      ) : null}

      {movedFrom ? (
        <div className="dsh-mymem-hint">
          旧数据没有迁移，仍然留在 {shortPath(movedFrom)}；需要的话可以手动复制过来。
        </div>
      ) : null}

      {err ? <div className="dsh-mymem-error">{err}</div> : null}

      {dialogOpen ? (
        <PromptDialog
          title="更改数据目录"
          description={`选一个父目录（留空 = 使用默认目录）。数据会放在所选目录下的 ${folderName} 里。`}
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
