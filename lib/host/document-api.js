// 三类文档的 HTTP 接口，统一版本冲突与文件身份检查。
import { contentRev, DEFAULT_AGENT_PROMPT } from './store.js';

/** 把明确的请求/存储错误写成稳定的 HTTP 响应。 */
export function sendApiError(res, error, sendJson) {
  sendJson(res, Number(error?.status) || 500, {
    error: String(error?.message ?? error),
    ...(error?.code ? { code: error.code } : {}),
  });
}

/** 请求正文必须显式提供文本；缺字段不能被误当成清空文件。 */
function requireText(body) {
  if (typeof body?.text !== 'string') {
    const error = new Error('text 必须是字符串；清空文件请传空字符串');
    error.status = 400;
    throw error;
  }
  return body.text;
}

/** 只允许已经存在的真实角色参与文件读写。 */
async function requirePersona(store, id) {
  if (!id) throw Object.assign(new Error('缺少角色 id'), { status: 400 });
  if (store.isPersonaNone(id)) throw Object.assign(new Error('空白卡没有可编辑文件'), { status: 400 });
  if (!(await store.listPersonaIds()).includes(id)) {
    throw Object.assign(new Error('找不到角色卡 ' + id), { status: 404 });
  }
}

/**
 * 处理角色设定、角色记忆和全局提示词；未匹配的路径交回主路由。
 * store 必须是请求开始时的快照，避免切换数据目录时跨目录完成一次读写。
 */
export async function handleDocumentApi({ sub, req, res, url, store, readBody, sendJson, changed }) {
  const cardMatch = /^\/personas\/([^/]+)$/.exec(sub);
  const isMemory = sub === '/persona/memory';
  const isPrompt = sub === '/settings/prompt';
  const method = req.method;
  const isRead = method === 'GET';
  const isWrite = method === 'PUT' || method === 'POST';
  if ((!isMemory && !isPrompt && !cardMatch) || (!isRead && !isWrite)) return false;
  // 角色的新建/删除/目录管理仍由主路由负责。
  if (cardMatch && method === 'POST') return false;

  try {
    let saved;
    if (cardMatch) {
      const id = decodeURIComponent(cardMatch[1]).trim();
      await requirePersona(store, id);
      if (isRead) {
        sendJson(res, 200, await store.reloadPersona(id));
        return true;
      }
      const body = await readBody(req);
      if ((body.name !== undefined && typeof body.name !== 'string') ||
          (body.body !== undefined && typeof body.body !== 'string')) {
        throw Object.assign(new Error('name 和 body 必须是字符串'), { status: 400 });
      }
      saved = await store.savePersonaCardCas(id, body);
    } else if (isPrompt) {
      if (isRead) {
        const current = await store.readAgentPrompt();
        sendJson(res, 200, { ...current, defaultText: DEFAULT_AGENT_PROMPT });
        return true;
      }
      const body = await readBody(req);
      saved = await store.writeAgentPromptCas({ ...body, text: requireText(body) });
    } else {
      if (isRead) {
        const personaId = String(url.searchParams.get('id') || '').trim();
        if (store.isPersonaNone(personaId)) {
          sendJson(res, 200, { personaId, path: '', text: '', exists: false, rev: '' });
          return true;
        }
        await requirePersona(store, personaId);
        const memory = await store.readPersonaMemory(personaId);
        sendJson(res, 200, { ...memory, personaId, rev: contentRev(memory.text) });
        return true;
      }
      const body = await readBody(req);
      const personaId = String(body?.personaId ?? body?.id ?? '').trim();
      await requirePersona(store, personaId);
      saved = await store.writePersonaMemoryCas({ ...body, personaId, text: requireText(body) });
    }

    if (!saved.ok) {
      sendJson(res, 409, { ...saved, conflict: true, error: '磁盘上的内容已经变了' });
      return true;
    }
    changed();
    sendJson(res, 200, saved);
  } catch (error) {
    sendApiError(res, error, sendJson);
  }
  return true;
}
