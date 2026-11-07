/**
 * SettingsPage.jsx —— 面板「全局设置」页
 *
 * 目前只有一件事：数据目录。为什么先做它：记忆/角色卡全落在这个目录里，
 * 用户搬盘或换机器时，唯一需要说清楚的「东西在哪」就是这一行路径。
 *
 * 交互刻意做得直白：
 *   - 路径用等宽字体铺一行（可选中复制，不是输入框 —— 这行是「告诉你现在在哪」）
 *   - 打开目录：系统文件管理器直接跳过去
 *   - 更改目录：弹输入框填新路径；**留空 = 恢复默认**（placeholder 里写明）
 *
 * 切换成功后必须把「旧数据没搬」讲出来（宿主返回 movedFrom 就说明存在旧目录），
 * 否则用户会以为记忆丢了。
 */
import * as React from 'react';
import { fetchSettings, changeDataDir, revealDataDir } from './api.js';
import { PromptDialog } from './Dialog.jsx';

/**
 * @param {{onChanged?: () => void}} props 数据目录变了之后通知父组件重拉角色列表与记忆
 */
export function SettingsPage({ onChanged } = {}) {
  const [data, setData] = React.useState(null);
  const [err, setErr] = React.useState('');
  const [notice, setNotice] = React.useState('');
  /** 切换目录后如果宿主提示没迁移，就把旧路径记下来一起显示 */
  const [movedFrom, setMovedFrom] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
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

  async function onReveal() {
    setErr('');
    try {
      await revealDataDir();
    } catch (e) {
      setErr(`打开目录失败：${e?.message || e}`);
    }
  }

  async function onSubmitPath(path) {
    setBusy(true);
    setErr('');
    try {
      const res = await changeDataDir(path);
      setDialogOpen(false);
      setMovedFrom(String(res?.movedFrom ?? ''));
      await load();
      flash('数据目录已切换');
      // 目录一变，角色卡和记忆全在新位置 —— 让父组件重拉一遍，别拿旧列表糊弄人
      onChanged?.();
    } catch (e) {
      // 弹窗不关：路径写错时用户还要改，关掉等于让他从头再来
      throw new Error(String(e?.message || e));
    } finally {
      setBusy(false);
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
          disabled={!data}
          onClick={() => {
            setErr('');
            setDialogOpen(true);
          }}
        >
          更改目录
        </button>
        {notice ? <span className="dsh-mymem-ok">{notice}</span> : null}
      </div>

      {data?.defaultDataDir ? (
        <div className="dsh-mymem-hint">默认目录：{data.defaultDataDir}</div>
      ) : null}

      {movedFrom ? (
        <div className="dsh-mymem-hint">
          旧数据没有迁移，仍然留在 {movedFrom}；需要的话可以手动复制过来。
        </div>
      ) : null}

      {err ? <div className="dsh-mymem-error">{err}</div> : null}

      {dialogOpen ? (
        <PromptDialog
          title="更改数据目录"
          description="填一个绝对路径；留空表示恢复默认目录。切换后旧数据不会自动迁移。"
          label="数据目录"
          defaultValue={data?.dataDir || ''}
          placeholder="留空 = 默认 ~/.dsh/my-memory"
          confirmText={busy ? '切换中…' : '切换'}
          allowEmpty
          onSubmit={onSubmitPath}
          onCancel={() => setDialogOpen(false)}
        />
      ) : null}
    </div>
  );
}
