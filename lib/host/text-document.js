// 三份用户文档共用的原文读取、版本检查和原子保存。
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

import { readText, withPathLock, writeTextAtomicDirect } from './atomic.js';

/** 用内容哈希标识磁盘版本；缺失文件与空文本使用同一个版本。 */
export function contentRev(text) {
  return createHash('sha1').update(String(text ?? ''), 'utf8').digest('hex').slice(0, 12);
}

/** 校验保存目标仍是读取时的文件；强制覆盖也不能跨数据目录或跨角色。 */
export function assertDocumentPath(path, expectedPath) {
  if (expectedPath === undefined) return;
  const normalize = (value) => {
    const absolute = resolve(value);
    return process.platform === 'win32' ? absolute.toLowerCase() : absolute;
  };
  if (typeof expectedPath !== 'string' || !expectedPath || normalize(expectedPath) !== normalize(path)) {
    throw Object.assign(new Error('文件位置已经变了，请重新加载后保存'), {
      status: 409,
      code: 'DOCUMENT_MOVED',
      path,
    });
  }
}

/** 读取 UTF-8 原文与同一份内容的版本；只有文件缺失时返回空文本。 */
export async function readTextDocument(path) {
  const source = await readText(path);
  const text = source ?? '';
  return { path, text, exists: source !== null, rev: contentRev(text) };
}

/**
 * 在同一路径队列内检查版本、保存并回读；update 用于角色卡字段保存和记忆追加。
 * @param {string} path
 * @param {{text?:string, baseRev?:string, force?:boolean, expectedPath?:string,
 *   requireExisting?:boolean, missingMessage?:string, createParent?:boolean,
 *   update?:(current:{path:string,text:string,rev:string,exists:boolean})=>string|Promise<string>}} input
 * @returns {Promise<object>} 成功返回新文档，版本不一致返回磁盘文档与 conflict。
 */
export async function writeTextDocumentCas(path, input = {}) {
  return withPathLock(path, async () => {
    assertDocumentPath(path, input.expectedPath);
    const current = await readTextDocument(path);
    if (input.requireExisting && !current.exists) {
      throw Object.assign(new Error(input.missingMessage || '文件已经不存在，请重新加载'), { status: 404 });
    }
    const baseRev = typeof input.baseRev === 'string' ? input.baseRev.trim() : '';
    if (input.force !== true && baseRev && baseRev !== current.rev) {
      return { ok: false, conflict: true, ...current, baseRev: input.baseRev };
    }

    const text = String(input.update ? await input.update(current) : (input.text ?? ''));
    await writeTextAtomicDirect(path, text, { createParent: input.createParent !== false });
    const check = await readText(path);
    if (check !== text) {
      throw Object.assign(new Error('写入后回读校验失败：磁盘内容与期望不一致'), { status: 500 });
    }
    return { ok: true, path, text: check, rev: contentRev(check), exists: true };
  });
}
