/**
 * PersonaSection.jsx —— 设置页「角色卡」
 *
 * 挂在 `settings.section`（kind=list，scope=root），只有一个角色卡，不做多角色。
 * 交互刻意做到最笨：改完点「保存」，不自动保存。
 * why：角色卡正文可能几千字，自动保存会在用户打字中途反复写盘，
 * 且写盘会 refresh 注入段——每敲一个字系统提示就变一次，KV 缓存全废。
 */
import * as React from 'react';
import { fetchPersona, savePersona } from './api.js';
import { ensureStyle } from './styles.js';

/** 「已保存」停留时长：够看清，又不至于一直挂在那儿宣布自己存过了 */
const SAVED_FLASH_MS = 1800;

export function PersonaSection() {
  const [name, setName] = React.useState('');
  const [body, setBody] = React.useState('');
  const [loaded, setLoaded] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [flash, setFlash] = React.useState('');
  const [err, setErr] = React.useState('');
  /** 已落盘的基线：dirty = 当前值 != 基线，避免「改回来又变成干净」的判定错乱 */
  const baseline = React.useRef({ name: '', body: '' });
  const flashTimer = React.useRef(null);

  React.useEffect(() => {
    ensureStyle();
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, []);

  const load = React.useCallback(async () => {
    try {
      const persona = await fetchPersona();
      const nextName = String(persona?.name ?? '');
      const nextBody = String(persona?.body ?? '');
      baseline.current = { name: nextName, body: nextBody };
      setName(nextName);
      setBody(nextBody);
      setErr('');
    } catch (e) {
      setErr(`读取角色卡失败：${e?.message || e}`);
    } finally {
      // 无论成败都放行输入：读失败时用户还可以自己写一份存上去
      setLoaded(true);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const dirty = name !== baseline.current.name || body !== baseline.current.body;

  async function onSubmit(event) {
    event?.preventDefault?.();
    if (saving) return;
    setSaving(true);
    setErr('');
    try {
      const saved = await savePersona({ name, body });
      // 宿主返回保存后的角色卡；名字可能被宿主做了 trim/兜底，用返回值回填基线才准确
      const nextName = String(saved?.name ?? name);
      const nextBody = String(saved?.body ?? body);
      baseline.current = { name: nextName, body: nextBody };
      setName(nextName);
      setBody(nextBody);
      setFlash('已保存');
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => {
        flashTimer.current = null;
        setFlash('');
      }, SAVED_FLASH_MS);
    } catch (e) {
      setErr(`保存失败：${e?.message || e}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dsh-mymem-root" data-dsh-plugin="my-memory" data-dsh-part="persona">
      <form className="dsh-mymem-page" onSubmit={onSubmit}>
        <div className="dsh-mymem-title">角色卡</div>
        <div className="dsh-mymem-hint">
          角色设定会原样注入到对话上下文，写什么就是什么——不会被改写、不会被总结、也不会被模型解释。
        </div>

        <label className="dsh-mymem-field">
          <span className="dsh-mymem-label">名字</span>
          <input
            className="dsh-mymem-input"
            type="text"
            value={name}
            placeholder="她怎么称呼自己"
            spellCheck={false}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label className="dsh-mymem-field">
          <span className="dsh-mymem-label">角色设定</span>
          <textarea
            className="dsh-mymem-textarea"
            value={body}
            placeholder={'我是谁、说话什么调子、在意什么、不要做什么……\n写在这里的每一句都会出现在系统提示里。'}
            spellCheck={false}
            onChange={(e) => setBody(e.target.value)}
          />
        </label>

        {err ? <div className="dsh-mymem-error">{err}</div> : null}

        <div className="dsh-mymem-actions">
          <button
            className={`dsh-mymem-btn${dirty && !saving ? ' dsh-mymem-btn--dirty' : ''}`}
            type="submit"
            disabled={saving || !loaded}
          >
            {saving ? '保存中…' : '保存'}
          </button>
          {flash ? <span className="dsh-mymem-ok">{flash}</span> : null}
          {!flash && dirty ? <span className="dsh-mymem-hint">有改动未保存</span> : null}
          <span className="dsh-mymem-spacer" />
          <span className="dsh-mymem-hint">改动不会自动保存</span>
        </div>
      </form>
    </div>
  );
}
