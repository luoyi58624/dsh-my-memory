/**
 * 三类 Markdown 编辑器共用的文档状态。
 * 这里只保护草稿、文件版本和请求顺序，不解析或加工 Markdown 正文。
 */
export function createDocumentEditor({ fields = ['text'], read, write, onSaved } = {}) {
  const names = [...fields];
  const valuesOf = (doc) => Object.fromEntries(names.map((key) => [key, String(doc?.[key] ?? '')]));
  const same = (a, b) => names.every((key) => a[key] === b[key]);
  let draft = valuesOf(null);
  let baseline = valuesOf(null);
  let document = null;
  let loaded = false;
  let loading = false;
  let saving = false;
  let error = '';
  let conflict = null;
  let moved = false;
  let savedAt = 0;
  let sequence = 0;
  let disposed = false;
  let pendingSave = null;
  const listeners = new Set();

  const dirty = () => !same(draft, baseline);
  const messageOf = (err) => String(err?.message || err);
  const validDocument = (doc) => {
    if (!doc || typeof doc.path !== 'string' || !doc.path || typeof doc.rev !== 'string' || !doc.rev) {
      throw new Error('无法确认文件路径或版本，请重新读取后再试');
    }
    if (names.some((key) => typeof doc[key] !== 'string')) {
      throw new Error('文件正文不完整，请重新读取后再试');
    }
    return doc;
  };
  const snapshot = () => ({
    draft: { ...draft },
    baseline: { ...baseline },
    document,
    loaded,
    loading,
    saving,
    dirty: dirty(),
    error,
    conflict,
    moved,
    savedAt,
  });
  const publish = () => {
    if (disposed) return;
    const state = snapshot();
    for (const listener of listeners) listener(state);
  };
  const accept = (doc) => {
    document = document?.path === doc.path ? { ...document, ...doc } : doc;
    baseline = valuesOf(doc);
    draft = { ...baseline };
    loaded = true;
    conflict = null;
    moved = false;
    error = '';
  };
  const markMoved = (detail) => {
    moved = true;
    conflict = null;
    error = detail || '文件位置已经变化，草稿已保留；请重新读取文件后再编辑。';
  };

  /** React 开发模式可能重新挂载同一实例，重新启用后仍沿用该文档身份。 */
  function activate() {
    disposed = false;
  }

  /** 订阅状态变化；返回取消订阅函数。 */
  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  /** 同步记录输入，失焦事件可以立即取到最后一次按键。 */
  function change(patch) {
    if (disposed || !loaded) return;
    for (const key of names) {
      if (Object.prototype.hasOwnProperty.call(patch, key)) draft[key] = String(patch[key] ?? '');
    }
    publish();
  }

  /**
   * 重新读磁盘：有草稿时只报告冲突，只有用户明确放弃草稿才覆盖。
   * 读请求序号同时隔离乱序响应和保存前发出的旧读取。
   */
  async function refresh({ discard = false } = {}) {
    if (disposed) return false;
    if (pendingSave) await pendingSave;
    if (disposed) return false;
    const request = ++sequence;
    loading = true;
    error = '';
    publish();
    try {
      const incoming = validDocument(await read());
      if (disposed || request !== sequence) return false;
      if (discard || !loaded) {
        accept(incoming);
      } else if (incoming.path !== document.path) {
        markMoved();
      } else if (!dirty()) {
        accept(incoming);
      } else if (incoming.rev !== document.rev) {
        conflict = { kind: 'remote', document: incoming };
      }
      return !moved && !conflict;
    } catch (err) {
      if (!disposed && request === sequence) error = '读取失败：' + messageOf(err);
      return false;
    } finally {
      if (!disposed && request === sequence) {
        loading = false;
        publish();
      }
    }
  }

  /**
   * 按顺序写回：保存期间的新输入继续留在 draft，收到确认后再存下一份。
   * 每次写都使用上一份成功响应的版本和文件路径。
   */
  function save({ force = false } = {}) {
    if (disposed) return Promise.resolve(false);
    if (pendingSave) return pendingSave;
    if (!loaded || moved || (conflict && !force)) return Promise.resolve(false);
    if (!dirty() && !force) return Promise.resolve(true);
    ++sequence;
    loading = false;
    saving = true;
    error = '';
    publish();

    pendingSave = Promise.resolve().then(async () => {
      let overwrite = force;
      try {
        do {
          const sent = { ...draft };
          const target = document.path;
          const raw = await write({
            ...sent,
            baseRev: document.rev,
            expectedPath: target,
            ...(overwrite ? { force: true } : {}),
          });
          if (disposed) return false;
          const stored = validDocument(raw);
          if (stored.path !== target) {
            markMoved();
            return false;
          }
          const confirmed = valuesOf(stored);
          // 只回填没有继续改过的字段，不能让旧回包擦掉用户的新输入。
          for (const key of names) {
            if (draft[key] === sent[key]) draft[key] = confirmed[key];
          }
          baseline = confirmed;
          document = { ...document, ...stored };
          conflict = null;
          moved = false;
          savedAt = Date.now();
          overwrite = false;
          if (typeof onSaved === 'function') onSaved(stored);
          publish();
        } while (!disposed && dirty());
        return !disposed;
      } catch (err) {
        if (disposed) return false;
        if (err?.status === 409 && err?.body?.code === 'DOCUMENT_MOVED') {
          markMoved(messageOf(err));
        } else if (err?.status === 409 && err?.body?.conflict) {
          conflict = {
            kind: 'conflict',
            document: { ...err.body, path: err.body.path || document.path },
          };
          error = '';
        } else {
          error = '保存失败：' + messageOf(err);
        }
        return false;
      }
    }).finally(() => {
      pendingSave = null;
      saving = false;
      publish();
    });
    return pendingSave;
  }

  /** 离开文档前等待保存；冲突或写入失败返回 false，界面保留原页与草稿。 */
  function flush() {
    if (pendingSave) return pendingSave;
    if (!dirty()) return Promise.resolve(true);
    return save();
  }

  /** 明确放弃本地改动，只恢复最后确认的基线，不读取或写入磁盘。 */
  function discard() {
    if (disposed || saving) return false;
    ++sequence;
    loading = false;
    draft = { ...baseline };
    conflict = null;
    // 已知的文件错误和 moved 状态继续显示，放弃草稿不代表目标文件已恢复。
    publish();
    return true;
  }

  /** 用户明确选择磁盘版本后才丢弃本地草稿。 */
  function useDisk() {
    if (disposed || saving || moved || !conflict?.document) return false;
    const incoming = conflict.document;
    if (incoming.path !== document.path) {
      markMoved();
      publish();
      return false;
    }
    try {
      accept(validDocument(incoming));
      publish();
      return true;
    } catch (err) {
      error = messageOf(err);
      publish();
      return false;
    }
  }

  /** 卸载后屏蔽旧请求的回调；已经发出的写入仍由宿主完成。 */
  function dispose() {
    disposed = true;
    ++sequence;
    listeners.clear();
  }

  return { getState: snapshot, subscribe, change, refresh, save, flush, discard, useDisk, activate, dispose };
}
