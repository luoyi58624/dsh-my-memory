/**
 * personas.js —— 多角色卡接口层
 *
 * 单独成文件而不塞进 api.js：api.js 已经够长，且这一组接口的返回形状更统一
 * （都是「卡」对象），单独放一处好维护。
 *
 * 宿主契约（字段名别改）：
 *   GET    /personas              → { items:[{id,name,body,created,updated,path,display}], activeId }
 *                                  id 是**目录名**，display 形如 ~\baby\agent.md
 *   POST   /personas              { dir }          → 卡（400 时 { error }）
 *   PUT    /personas/:id          { name?, body? } → 卡（改显示名，目录名不变）
 *   DELETE /personas/:id          → { ok:true }（只剩一张时 400 + { error:'至少保留一张角色卡' }）
 *   POST   /personas/:id/default  → { ok:true, activeId }
 *   POST   /personas/:id/reveal   → { ok:true, path }（系统文件管理器打开目录）
 *   POST   /personas/:id/rename   { dir } → 改名后的卡（id = 新目录名）
 */

const BASE = '/my-memory/api';

/**
 * 统一请求。**不吞错误**：删除最后一张、新建目录重名这类 400 的文案
 * 必须原样传到界面上，否则用户只会看到「点了没反应」。
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

/** 把绝对路径缩成 ~\baby\agent.md 这种短形式（列表里空间小） */
function shortPath(p) {
  if (!p) return '';
  return String(p).replace(/^[A-Za-z]:\\Users\\[^\\]+/i, '~');
}

/**
 * 把宿主返回的卡规整成稳定形状。
 * display 优先用宿主给的；没给就从 path 缩；两者都没有时按目录名拼一个
 * （过渡期兜底：老宿主还没返回 path/display，列表第二行也不该是空白）。
 * @param {any} p
 */
function normalizePersona(p) {
  const id = String(p?.id ?? '');
  const path = String(p?.path ?? '');
  const display = String(p?.display ?? '') || shortPath(path) || (id ? `~\\${id}\\agent.md` : '');
  return {
    id,
    name: String(p?.name ?? ''),
    body: String(p?.body ?? ''),
    created: Number(p?.created) || 0,
    updated: Number(p?.updated) || 0,
    path,
    display,
  };
}

/**
 * 角色卡列表。
 * @returns {Promise<{items:Array<object>, activeId:string|null}>}
 */
export async function fetchPersonas() {
  const raw = await request('/personas');
  const items = Array.isArray(raw?.items) ? raw.items.map(normalizePersona) : [];
  const activeId = raw?.activeId ? String(raw.activeId) : (items[0]?.id ?? null);
  return { items, activeId };
}

/**
 * 新建一张卡。
 *
 * body 同时带 `dir` 和 `name`：契约是 `{ dir }`（新建时输入的是目录名，
 * 显示名默认就用它），多带一个 name 是为了兼容还在用 `{ name }` 的旧宿主 ——
 * 少了它，旧宿主会建出一张没有名字的空卡。
 * @param {{dir:string}} input
 */
export async function createPersona(input) {
  const dir = String(input?.dir ?? '').trim();
  const raw = await request('/personas', {
    method: 'POST',
    body: JSON.stringify({ dir, name: dir }),
  });
  return normalizePersona(raw);
}

/**
 * 改显示名 / 改正文（id 是目录名，不会变）。
 * @param {string} id
 * @param {{name?:string, body?:string}} patch
 */
export async function updatePersona(id, patch) {
  const raw = await request(`/personas/${encodeURIComponent(String(id))}`, {
    method: 'PUT',
    body: JSON.stringify(patch ?? {}),
  });
  return normalizePersona(raw);
}

/**
 * 删除一张卡。宿主会拒绝删最后一张（400 + error），错误原样抛出。
 * @param {string} id
 */
export function deletePersona(id) {
  return request(`/personas/${encodeURIComponent(String(id))}`, { method: 'DELETE' });
}

/**
 * 设为默认卡（决定下一轮对话注入哪张角色卡）。
 * @param {string} id
 * @returns {Promise<{ok:boolean, activeId:string}>}
 */
export function setDefaultPersona(id) {
  return request(`/personas/${encodeURIComponent(String(id))}/default`, { method: 'POST' });
}

/**
 * 在系统文件管理器里打开这张卡所在目录。
 * @param {string} id
 * @returns {Promise<{ok:boolean, path:string}>}
 */
export function revealPersona(id) {
  return request(`/personas/${encodeURIComponent(String(id))}/reveal`, { method: 'POST' });
}

/**
 * 改磁盘上的角色文件夹名（目录名 = 卡片 id）。
 *
 * 注意和 updatePersona 的区别：那个改的是**显示名**（只影响注入与界面），
 * 这个会真的把磁盘上的文件夹改名，改名后 id 会变。
 *
 * @param {string} id 旧目录名
 * @param {string} dir 新目录名（英文/数字/点/下划线/短横线）
 */
export async function renamePersona(id, dir) {
  const raw = await request(`/personas/${encodeURIComponent(String(id))}/rename`, {
    method: 'POST',
    body: JSON.stringify({ dir: String(dir ?? '').trim() }),
  });
  return normalizePersona(raw);
}

/**
 * 写回全局记忆文件原文。
 * @param {{text:string, scope?:string}} input
 */
export function saveGlobalMemoryRaw(input) {
  return request('/memory/raw', {
    method: 'PUT',
    body: JSON.stringify({ scope: input?.scope || 'global', text: String(input?.text ?? '') }),
  });
}
