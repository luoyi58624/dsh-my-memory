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
 * @param {{title:string, label?:string, defaultValue?:string, placeholder?:string, confirmText?:string,
 *          onOk:(value:string)=>void, onCancel:()=>void}} props
 */
export function PromptDialog({ title, label, defaultValue = '', placeholder, confirmText = '确定', onOk, onCancel }) {
  const [value, setValue] = React.useState(defaultValue);
  const inputRef = React.useRef(null);
  useDialog(onCancel, inputRef);

  const submit = () => {
    const v = value.trim();
    if (!v) return;
    onOk?.(v);
  };

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
        {label ? <div className="dsh-mymem-modal-label">{label}</div> : null}
        <input
          ref={inputRef}
          className="dsh-mymem-input"
          value={value}
          placeholder={placeholder || ''}
          spellCheck={false}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            }
          }}
        />
        <div className="dsh-mymem-modal-actions">
          <button className="dsh-mymem-btn dsh-mymem-btn--ghost" type="button" onClick={() => onCancel?.()}>
            取消
          </button>
          <button className="dsh-mymem-btn" type="button" disabled={!value.trim()} onClick={submit}>
            {confirmText}
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
