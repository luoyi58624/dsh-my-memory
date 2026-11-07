/**
 * PersonaSection.jsx —— 面板「角色设定」页
 *
 * 只有两个输入框：名字、角色信息（正文）。别的行一个都不要。
 * **没有保存按钮**：跟原插件一样失焦即存（onBlur）。
 * why：角色卡是「写完就走」的东西，多一个保存按钮只会多一次「我改了半天好像没生效」；
 * 另外原插件的保存按钮用品牌色实心填充 + 白字，主题里 brand 接近白时就是一个白块，
 * 这个坑不再踩。
 *
 * 数据由父组件先读好传进来（persona），保存成功后通过 onSaved 回传，
 * 这样左边那张卡的显示名能跟着变，不需要二次拉接口。
 */
import * as React from 'react';
import { updatePersona } from './personas.js';

/** 一行「标签 + 控件」，抄自原插件 UserProfileTab 的四个 SETTING_* 常量（照抄值，不 import 组件） */
const SETTING_ROW_STYLE = { display: 'flex', alignItems: 'center', gap: 10, minHeight: 34 };
const SETTING_LABEL_STYLE = {
  flex: '0 0 72px',
  minWidth: 0,
  fontSize: 12.5,
  fontWeight: 600,
  color: 'var(--dsw-alias-label-primary, #e8ecf7)',
};
const SETTING_CONTROL_STYLE = {
  flex: '1 1 auto',
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};
const SETTING_CELL_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  minWidth: 0,
};

/** 「已自动保存」停留时长 */
const SAVED_FLASH_MS = 1600;

/**
 * @param {{persona?: {name?:string, body?:string}, onSaved?: (p:{name:string,body:string,updated:number})=>void}} props
 */
export function PersonaSection({ persona, onSaved } = {}) {
  const [name, setName] = React.useState(String(persona?.name ?? ''));
  const [body, setBody] = React.useState(String(persona?.body ?? ''));
  const [saving, setSaving] = React.useState(false);
  const [flash, setFlash] = React.useState('');
  const [err, setErr] = React.useState('');

  /** 已落盘的基线：只拿来判断「这个字段到底变了没有」，避免光标进出就写一次盘 */
  const baseline = React.useRef({ name: String(persona?.name ?? ''), body: String(persona?.body ?? '') });
  /** 防重入用 ref：失焦可能连着触发，state 读到的还是旧值 */
  const savingRef = React.useRef(false);
  const flashTimer = React.useRef(null);

  React.useEffect(
    () => () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    },
    [],
  );

  /**
   * 失焦自动保存。
   * @param {{name?:string, body?:string}} patch 本次要提交的字段（其余沿用当前值）
   */
  async function autosave(patch) {
    if (savingRef.current) return;
    const next = {
      name: patch.name !== undefined ? String(patch.name) : name,
      body: patch.body !== undefined ? String(patch.body) : body,
    };
    // 没变就不写：宿主保存会 refresh 注入段，每改一次 prompt 前缀都变（KV 缓存全废）
    if (next.name === baseline.current.name && next.body === baseline.current.body) return;

    savingRef.current = true;
    setSaving(true);
    setErr('');
    try {
      if (!persona?.id) throw new Error('没有选中角色卡');
      // 只提交真正变了的字段：改名字不该顺手把正文也写一遍（少一次整文件重写）
      const patch = {};
      if (next.name !== baseline.current.name) patch.name = next.name;
      if (next.body !== baseline.current.body) patch.body = next.body;
      const saved = await updatePersona(persona.id, patch);
      const stored = {
        name: String(saved?.name ?? next.name),
        body: String(saved?.body ?? next.body),
      };
      baseline.current = stored;
      // 宿主会 trim 名字 / 空名兜底，用返回值回填，避免输入框和磁盘上的内容不一致
      setName(stored.name);
      setBody(stored.body);
      onSaved?.({ ...stored, id: persona.id, updated: Number(saved?.updated) || 0 });
      setFlash('已自动保存');
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => {
        flashTimer.current = null;
        setFlash('');
      }, SAVED_FLASH_MS);
    } catch (e) {
      setErr(`保存失败：${e?.message || e}`);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <>
      <div style={SETTING_CELL_STYLE}>
        <div style={SETTING_ROW_STYLE}>
          <span style={SETTING_LABEL_STYLE} title="保存后显示在对话顶部">
            名字
          </span>
          <div style={SETTING_CONTROL_STYLE}>
            <input
              className="dsh-mymem-input"
              style={{ width: '100%' }}
              value={name}
              placeholder="角色名"
              spellCheck={false}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => void autosave({ name })}
            />
          </div>
        </div>
      </div>

      <div className="dsh-mymem-hint">
        改动会自动保存{saving ? ' · 保存中…' : flash ? ` · ${flash}` : ''}
      </div>

      {err ? <div className="dsh-mymem-error">{err}</div> : null}

      <label className="dsh-mymem-field">
        <span className="dsh-mymem-label">角色信息</span>
        <textarea
          className="dsh-mymem-textarea"
          rows={16}
          value={body}
          placeholder="随便写：她是谁、怎么说话、怎么称呼你……失焦自动保存"
          spellCheck={false}
          onChange={(e) => setBody(e.target.value)}
          onBlur={() => void autosave({ body })}
        />
      </label>
    </>
  );
}
