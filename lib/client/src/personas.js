/**
 * personas.js —— 多角色卡与原文编辑的接口层
 *
 * 单独成文件而不塞进 api.js：api.js 已经够长，且这一组接口的返回形状更统一
 * （都是「卡」对象），单独放一处好维护。
 *
 * 宿主契约（字段名别改）：
 *   GET    /personas              → { items:[{id,name,body,created,updated}], activeId }
 *   POST   /personas              { name }        → 卡
 *   PUT    /personas/:id          { name?, body? } → 卡
 *   DELETE /personas/:id          → { ok:true }（只剩一张时 400 + { error:'至少保留一张角色卡' }）
 *   POST   /personas/:id/default  → { ok:true, activeId }
 *   PUT    /memory/raw            { scope:'global', text } → { ok:true, path, text }
 */

const BASE = '/my-memory/api';

/**
 * 统一请求（与 api.js 同款，但这里不抛自定义错误包装，直接把宿主 `error` 文案带出来）。
 * 关键是**不吞错误**：删除最后一张卡的 400 文案必须原样传到界面上。
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

/** 把宿主返回的卡规整成稳定形状（缺字段一律补空，界面不用到处写 ?.） */
function normalizePersona(p) {
  return {
    id: String(p?.id ?? ''),
    name: String(p?.name ?? ''),
    body: String(p?.body ?? ''),
    created: Number(p?.created) || 0,
    updated: Number(p?.updated) || 0,
  };
}

/**
 * 角色卡列表。
 * @returns {Promise<{items:Array<{id:string,name:string,body:string,created:number,updated:number}>, activeId:string|null}>}
 */
export async function fetchPersonas() {
  const raw = await request('/personas');
  const items = Array.isArray(raw?.items) ? raw.items.map(normalizePersona) : [];
  const activeId = raw?.activeId ? String(raw.activeId) : (items[0]?.id ?? null);
  return { items, activeId };
}

/**
 * 新建一张卡。
 * @param {{name:string}} input
 * @returns {Promise<{id:string,name:string,body:string,created:number,updated:number}>}
 */
export async function createPersona(input) {
  const raw = await request('/personas', {
    method: 'POST',
    body: JSON.stringify({ name: String(input?.name ?? '') }),
  });
  return normalizePersona(raw);
}

/**
 * 改名字 / 改正文。
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
 * 写回全局记忆文件原文。
 * @param {{text:string, scope?:string}} input
 * @returns {Promise<{ok:boolean, path:string, text:string}>}
 */
export function saveGlobalMemoryRaw(input) {
  return request('/memory/raw', {
    method: 'PUT',
    body: JSON.stringify({ scope: input?.scope || 'global', text: String(input?.text ?? '') }),
  });
}
