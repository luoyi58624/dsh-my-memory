/**
 * api.js —— 面板与宿主之间的 HTTP 契约
 *
 * 为什么走 HTTP：面板跑在浏览器侧 bundle 里，宿主注册的 Service 不跨进程；
 * webServer 路由是唯一稳定通道。同源请求会自动带上 web-server 的会话凭据。
 *
 * 本文件里的「归一化」是有意为之：宿主返回的字段名和最初约定的契约有差异
 * （见各函数注释），组件不该关心这些差异，所以统一在这里抹平并只对外暴露稳定形状。
 */

const BASE = '/my-memory/api';

/**
 * 统一请求：解析 JSON、非 2xx 抛带 status 的 Error。
 * 失败时把响应文本塞进 body.error —— 宿主所有错误都是 `{ error: string }`，
 * 但代理层/网关报错会返回 HTML，所以截断 500 字防止把整页 HTML 塞进红字里。
 * @param {string} path
 * @param {RequestInit} [init]
 * @returns {Promise<any>}
 */
async function request(path, init) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'same-origin',
    ...init,
    headers: { 'content-type': 'application/json', ...(init && init.headers) },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { error: text.slice(0, 500) };
  }
  if (!res.ok) {
    const err = new Error((body && (body.error || body.message)) || `HTTP ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

/**
 * 读角色卡。
 * 宿主实际返回 `{ name, body, updated }`（和契约一致）。
 * @returns {Promise<{name:string, body:string, updated:number}>}
 */
export function fetchPersona() {
  return request('/persona');
}

/**
 * 保存角色卡。
 * 宿主实际返回的是保存后的角色卡对象 `{ name, body, updated }`，**不是** 契约里的 `{ ok: true }`。
 * 所以这里不看返回值内容，请求没抛错就算成功。
 * @param {{name:string, body:string}} input
 * @returns {Promise<{name:string, body:string, updated:number}>}
 */
export function savePersona(input) {
  return request('/persona', {
    method: 'PUT',
    body: JSON.stringify({ name: input?.name ?? '', body: input?.body ?? '' }),
  });
}

/**
 * 运行状态：数据目录、两边条数、当前项目。
 *
 * 宿主实际字段（与契约不同，这里做映射）：
 *   契约 { dataDir, globalCount, projectCount, projectSlug, projectName, projectRoot }
 *   实际 { dataDir, globalCount, projectCount, slug, project, root, sectionOrder, personaOrder }
 * `project` 是项目的显示名（目录名），`slug` 才是可回传给接口的身份。
 * @returns {Promise<{dataDir:string, globalCount:number, projectCount:number, projectSlug:string|null, projectName:string, projectRoot:string|null}>}
 */
export async function fetchStatus() {
  const raw = await request('/status');
  return {
    dataDir: String(raw?.dataDir ?? ''),
    globalCount: Number(raw?.globalCount) || 0,
    projectCount: Number(raw?.projectCount) || 0,
    projectSlug: raw?.slug ?? raw?.projectSlug ?? null,
    projectName: String(raw?.project ?? raw?.projectName ?? ''),
    projectRoot: raw?.root ?? raw?.projectRoot ?? null,
  };
}

/**
 * 列记忆。
 *
 * 宿主实际返回 `{ scope, slug, project, items }`，item 形如
 * `{ id, scope, section, summary, text, date, tags }`（项目条目还有 title）。
 * 这里统一压成 `{ id, summary, date }` + 可选的 title/tags，列表只用到这几个字段。
 * @param {{scope:'global'|'project', project?:string|null}} input
 * @returns {Promise<{items:Array<{id:string, summary:string, date:string, title?:string, tags?:string[]}>}>}
 */
export async function fetchMemory(input) {
  const scope = input?.scope === 'project' ? 'project' : 'global';
  const params = new URLSearchParams({ scope });
  // 项目必须显式带 project 参数：宿主不带时会退回「服务默认目录」，
  // 而面板里显示的是 /status 报出来的那个项目，两者要指向同一个东西才不会错位。
  if (scope === 'project' && input?.project) params.set('project', String(input.project));
  const raw = await request(`/memory?${params.toString()}`);
  const items = Array.isArray(raw?.items) ? raw.items : [];
  return {
    items: items.map((it) => ({
      id: String(it?.id ?? ''),
      summary: String(it?.summary ?? it?.text ?? ''),
      date: String(it?.date ?? ''),
      title: it?.title ? String(it.title) : '',
      tags: Array.isArray(it?.tags) ? it.tags : [],
    })),
  };
}

/**
 * 读全局记忆文件原文（面板「全局记忆」页直接铺出来的就是它）。
 *
 * 为什么不用 GET /memory 的 items：那是解析后的条目（摘要 + 日期），
 * 而这一页要的正是「文件里到底是什么字」，任何结构化都不算同一份东西。
 * @returns {Promise<{scope:string, path:string, text:string}>}
 */
export async function fetchGlobalMemoryRaw() {
  const raw = await request('/memory/raw?scope=global');
  return {
    scope: String(raw?.scope ?? 'global'),
    path: String(raw?.path ?? ''),
    text: String(raw?.text ?? ''),
    // 版本号：保存时带回去，宿主据此判断「我读到的还是不是最新的」
    rev: String(raw?.rev ?? ''),
  };
}

/**
 * 写回全局记忆原文（带版本号检测冲突）。
 *
 * 409 时**不吞**：把 conflict 原样抛给界面，界面弹 diff 面板让用户选。
 * force=true 表示「我知道磁盘变了，就要用我的覆盖」。
 *
 * @param {{text:string, baseRev?:string, force?:boolean, scope?:string}} input
 * @returns {Promise<{ok:boolean, rev:string, text:string}>}
 */
export function saveGlobalMemoryRaw(input) {
  return request('/memory/raw', {
    method: 'PUT',
    body: JSON.stringify({
      scope: input?.scope || 'global',
      text: String(input?.text ?? ''),
      baseRev: String(input?.baseRev ?? ''),
      ...(input?.force ? { force: true } : {}),
    }),
  });
}

/**
 * 新增一条记忆。
 * 宿主实际返回 `{ id, scope, path, slug? }`。
 * @param {{scope:'global'|'project', text:string, project?:string|null, title?:string}} input
 * @returns {Promise<{id:string, scope:string, path:string}>}
 */
export function addMemory(input) {
  return request('/memory', {
    method: 'POST',
    body: JSON.stringify({
      scope: input?.scope,
      text: input?.text,
      ...(input?.title ? { title: input.title } : {}),
      ...(input?.project ? { project: input.project } : {}),
    }),
  });
}

/**
 * 删除一条记忆。
 * 宿主按 id 前缀（g_ / p_）自己判断删哪边，返回 `{ removed: true, id, scope, slug }`，不是 `{ ok: true }`。
 * @param {string} id
 * @returns {Promise<any>}
 */
export function deleteMemory(id) {
  return request(`/memory/${encodeURIComponent(String(id))}`, { method: 'DELETE' });
}

/**
 * 运行设置：当前数据目录 + 默认数据目录。
 * @returns {Promise<{dataDir:string, defaultDataDir:string}>}
 */
export async function fetchSettings() {
  const raw = await request('/settings');
  return {
    dataDir: String(raw?.dataDir ?? ''),
    defaultDataDir: String(raw?.defaultDataDir ?? ''),
    // 子目录名由宿主决定（默认 dsh-my-memory），界面不写死
    folderName: String(raw?.folderName ?? 'dsh-my-memory'),
  };
}

/**
 * 切换数据目录。
 *
 * 传的是**父目录**：宿主自己拼成 `<parent>/<folderName>`，子目录名固定，
 * 用户选的永远是放它的那个父目录。parent 传空字符串 = 用默认位置。
 * 成功可能带 movedFrom：说明旧目录的数据没有被迁移，界面要把这句讲出来。
 * @param {string} parent
 * @returns {Promise<{ok:boolean, dataDir:string, movedFrom?:string}>}
 */
export function changeDataDir(parent) {
  return request('/settings/dataDir', {
    method: 'POST',
    body: JSON.stringify({ parent: String(parent ?? '') }),
  });
}

/**
 * 在系统文件管理器里打开数据目录。
 * @returns {Promise<{ok:boolean}>}
 */
export function revealDataDir() {
  return request('/settings/reveal', { method: 'POST' });
}

/* ---------- 会话级：角色绑定 / 局部记忆 ---------- */

/**
 * 某个会话绑定的角色卡。
 * locked=true 表示会话已经建立过，角色不可再改（宿主说了算）。
 * @param {string} session
 * @returns {Promise<{sessionId:string, personaId:string|null, name:string, locked:boolean}>}
 */
export async function fetchSessionPersona(session) {
  const raw = await request(`/session/persona?session=${encodeURIComponent(String(session))}`);
  return {
    sessionId: String(raw?.sessionId ?? session),
    personaId: raw?.personaId ? String(raw.personaId) : null,
    name: String(raw?.name ?? ''),
    locked: !!raw?.locked,
  };
}

/**
 * 给会话绑定角色卡。
 * 已绑定过的会话换卡会返回 409（错误原样抛出，界面据此把选择器切成只读）。
 * @param {string} session
 * @param {string} personaId
 */
export function bindSessionPersona(session, personaId) {
  return request('/session/persona', {
    method: 'POST',
    body: JSON.stringify({ session: String(session), personaId: String(personaId) }),
  });
}

/**
 * 项目（= 会话工作目录）局部记忆的开关状态。
 * @param {string|null} cwd 不传就让宿主按它自己的默认目录处理
 */
export async function fetchProjectState(cwd) {
  const q = cwd ? `?cwd=${encodeURIComponent(String(cwd))}` : '';
  const raw = await request(`/project/state${q}`);
  return {
    cwd: String(raw?.cwd ?? ''),
    memoryPath: String(raw?.memoryPath ?? ''),
    exists: !!raw?.exists,
    enabled: !!raw?.enabled,
    hasLegacy: !!raw?.hasLegacy,
  };
}

/**
 * 开关局部记忆。
 * 关掉只是「不再记录」，已有内容不会被删 —— 界面上要把这句写出来。
 * @param {string|null} cwd
 * @param {boolean} enabled
 */
export function saveProjectState(cwd, enabled) {
  return request('/project/state', {
    method: 'POST',
    body: JSON.stringify({ ...(cwd ? { cwd: String(cwd) } : {}), enabled: !!enabled }),
  });
}

/**
 * 读项目局部记忆原文（`.dsh/MEMORY.md`）。
 * @param {string|null} cwd
 * @returns {Promise<{path:string, text:string}>}
 */
export async function fetchProjectRaw(cwd) {
  const q = cwd ? `?cwd=${encodeURIComponent(String(cwd))}` : '';
  const raw = await request(`/project/raw${q}`);
  return { path: String(raw?.path ?? ''), text: String(raw?.text ?? '') };
}

/* ---------- 全局提示词（数据根下 AGENT.md，作用于所有角色） ---------- */

/**
 * 读全局提示词。
 * 宿主返回 `{ path, text, defaultText, exists }`；text 是文件正文（缺失时给默认值）。
 * @returns {Promise<{path:string, text:string, defaultText:string, exists:boolean}>}
 */
export async function fetchGlobalPrompt() {
  const raw = await request('/settings/prompt');
  return {
    path: String(raw?.path ?? ''),
    text: String(raw?.text ?? ''),
    defaultText: String(raw?.defaultText ?? ''),
    exists: !!raw?.exists,
  };
}

/**
 * 保存全局提示词（整份覆盖；空串 = 不要这段，注入时整节省略）。
 * 面板只是把 `<数据根>/AGENT.md` 的正文写回去，用户直接改那个文件也一样生效。
 * @param {string} text
 * @returns {Promise<{ok:boolean, path:string, text:string}>}
 */
export async function saveGlobalPrompt(text) {
  const raw = await request('/settings/prompt', {
    method: 'PUT',
    body: JSON.stringify({ text: String(text ?? '') }),
  });
  return { ok: raw?.ok !== false, path: String(raw?.path ?? ''), text: String(raw?.text ?? '') };
}
