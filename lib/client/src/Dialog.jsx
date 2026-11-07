/**
 * Dialog.jsx —— 面板里自己画的小弹窗（输入 / 二次确认）
 *
 * 为什么不用 window.prompt / confirm：
 * 1. 它们会丢焦点 —— 关掉之后用户不知道光标在哪，接着敲键盘什么都没发生；
 * 2. 样式完全不受控，和面板两个世界。
 * 这里用 portal + fixed 居中，自己记住「打开前的 activeElement」，关闭时还回去。
 *
 * 两种形态共用一套壳：prompt（带输入框）/ confirm（只有一段话）。
 */
import * as React from 'react';
import * as ReactDOM from 'react-dom';

/**
 * 弹窗公共逻辑：Esc 关闭、打开时聚焦、关闭时把焦点还给原来的元素。
 * @param {(() => void) | undefined} onCancel
 * @param {{current: any}} focusRef 需要聚焦的元素
 */
function useDialog(onCancel, focusRef) {
  const previous = React.useRef(null);

  React.useEffect(() => {
    // 记住打开前的焦点，关闭时还回去（用户接着敲键盘不会「打到空处」）
    previous.current = typeof document !== 'undefined' ? document.activeElement : null;
    const el = focusRef.current;
    if (el) {
      el.focus();
      if (typeof el.select === 'function') el.select();
    }
    return () => {
      const back = previous.current;
      if (back && typeof back.focus === 'function' && document.contains(back)) {
        try {
          back.focus();
        } catch {
          /* 元素可能已经没了：不追 */
        }
      }
    };
  }, [focusRef]);

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);
}

/**
 * 输入弹窗。
 *
 * onSubmit 允许抛错：抛出来的文案会显示在弹窗里、**弹窗保持打开**。
 * 这点很关键 —— 宿主返回 400（目录重名、名字非法）时如果弹窗直接关掉，
 * 用户只会看到「点了没反应」。
 *
 * @param {{title:string, description?:string, label?:string, defaultValue?:string, placeholder?:string,
 *          confirmText?:string, validate?:(value:string)=>string, allowEmpty?:boolean,
 *          onSubmit?:(value:string)=>Promise<void>|void, onCancel:()=>void}} props
 */
export function PromptDialog({
  title,
  description,
  label,
  defaultValue = '',
  placeholder,
  confirmText = '确定',
  validate,
  allowEmpty = false,
  onSubmit,
  onCancel,
}) {
  const [value, setValue] = React.useState(defaultValue);
  const [err, setErr] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const inputRef = React.useRef(null);
  useDialog(onCancel, inputRef);

  const trimmed = value.trim();
  // 校验实时跑：按钮是禁用的，但红字要说清「为什么不给点」
  const invalid = trimmed && validate ? validate(trimmed) : '';
  // allowEmpty：数据目录那种「留空 = 恢复默认」的字段，空值是合法输入，
  // 不能拿「非空」当提交条件，否则用户永远点不动按钮。
  const canSubmit = (allowEmpty || !!trimmed) && !invalid && !busy;

  async function submit() {
    if (!canSubmit) return;
    // 空值 + allowEmpty 时不跑校验（校验函数通常假设有内容）
    if (validate && trimmed) {
      const bad = validate(trimmed);
      if (bad) {
        setErr(bad);
        return;
      }
    }
    setBusy(true);
    setErr('');
    try {
      await onSubmit?.(trimmed);
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  if (typeof document === 'undefined') return null;
  return ReactDOM.createPortal(
    <div
      className="dsh-mymem-modal-mask"
      onMouseDown={(e) => {
        // 只有点在遮罩本身（不是卡片里）才取消
        if (e.target === e.currentTarget) onCancel?.();
      }}
    >
      <div className="dsh-mymem-modal" role="dialog" aria-modal="true">
        <div className="dsh-mymem-modal-title">{title}</div>
        {description ? <div className="dsh-mymem-modal-message">{description}</div> : null}
        {label ? <div className="dsh-mymem-modal-label">{label}</div> : null}
        <input
          ref={inputRef}
          className="dsh-mymem-input"
          value={value}
          placeholder={placeholder || ''}
          spellCheck={false}
          onChange={(e) => {
            setValue(e.target.value);
            setErr('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void submit();
            }
          }}
        />
        {invalid || err ? <div className="dsh-mymem-modal-error">{err || invalid}</div> : null}
        <div className="dsh-mymem-modal-actions">
          <button className="dsh-mymem-btn dsh-mymem-btn--ghost" type="button" onClick={() => onCancel?.()}>
            取消
          </button>
          <button className="dsh-mymem-btn" type="button" disabled={!canSubmit} onClick={() => void submit()}>
            {busy ? '处理中…' : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/**
 * 二次确认弹窗。
 * @param {{title:string, message?:string, confirmText?:string, danger?:boolean,
 *          onOk:()=>void, onCancel:()=>void}} props
 */
export function ConfirmDialog({ title, message, confirmText = '确定', danger, onOk, onCancel }) {
  const focusRef = React.useRef(null);
  useDialog(onCancel, focusRef);

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onOk?.();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onOk]);

  if (typeof document === 'undefined') return null;
  return ReactDOM.createPortal(
    <div
      className="dsh-mymem-modal-mask"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel?.();
      }}
    >
      <div className="dsh-mymem-modal" role="dialog" aria-modal="true">
        <div className="dsh-mymem-modal-title">{title}</div>
        {message ? <div className="dsh-mymem-modal-message">{message}</div> : null}
        <div className="dsh-mymem-modal-actions">
          <button className="dsh-mymem-btn dsh-mymem-btn--ghost" type="button" onClick={() => onCancel?.()}>
            取消
          </button>
          <button
            ref={focusRef}
            className={`dsh-mymem-btn${danger ? ' dsh-mymem-btn--danger' : ''}`}
            type="button"
            onClick={() => onOk?.()}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
