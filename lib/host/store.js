// 存储层 · 角色卡（多张） + 全局记忆 + 项目记忆
//
// 数据布局（严格固定，绝不写进插件源码目录）：
//
//   <root>/personas/<id>.md               每张角色卡一个文件（frontmatter: id/name/created/updated + 正文）
//   <root>/personas.json                  { "activeId": "baby" } —— 当前默认用哪张卡
//   <root>/persona.md                     旧版单卡文件（迁移后保留不删，人可能还想看）
//   <root>/MEMORY.md                      全局记忆（单文件，只装「人相关、通用、与技术无关」的内容）
//   <root>/projects/<slug>/MEMORY.md      该项目局部记忆的主索引（一行一条摘要，只用于注入）
//   <root>/projects/<slug>/<entry-id>.md  单条局部记忆全文
//
// 为什么角色卡要拆成多文件、全局记忆却是单文件：
//   - 角色卡要能新建/改名/删除/切换，一卡一文件才能各自原子写、互不影响；
//   - 全局记忆量小（称呼、口味、作息、脾气），单文件人可读可手改，注入时整段读走；
//   - 项目记忆会长（技术细节写完就忘不掉），必须能按 id 精确读取/删除，也要能塞长正文，
//     所以拆成一文件一条，索引只留一行摘要——注入索引，正文按需读。

import { homedir } from 'node:os';
import { join } from 'node:path';
import { createHash, randomBytes } from 'node:crypto';
import { readdirSync } from 'node:fs';
import { readdir, rm } from 'node:fs/promises';

import {
  ensureDir,
  fileStat,
  invalidateSyncCache,
  readText,
  readTextSyncCached,
  writeTextAtomic,
} from './atomic.js';
import { projectSlug, safeSegment } from './project.js';

/** 默认数据根目录：~/.dsh/my-memory/ */
export function defaultDataDir() {
  return join(homedir(), '.dsh', 'my-memory');
}

/** 角色卡默认显示名（用户没设置过时用它 + 「我是 X。」这句默认正文） */
export const DEFAULT_PERSONA_NAME = '助手';

/** 全局记忆文件的标题行 */
const GLOBAL_HEADER = '# 全局记忆';
/** 全局记忆里没有指定小节时落到这里 */
export const DEFAULT_GLOBAL_SECTION = '杂项';

/** 列表项：`- [g_1a2b3c4d] 2026-11-07 正文 | tag: 称呼` */
const ENTRY_RE = /^-\s*\[([A-Za-z0-9_]+)\]\s*(.*)$/;
/** 行尾的 `| tag: a, b` */
const TAG_RE = /\s*\|\s*tag:\s*(.+)\s*$/;
/** 正文前的日期 `2026-11-07 ` */
const DATE_RE = /^(\d{4}-\d{2}-\d{2})\s+(.*)$/;

/** 生成条目 id：全局 `g_` + 8 位 hex，项目 `p_` + 8 位 hex */
export function newEntryId(prefix) {
  return `${prefix}_${randomBytes(4).toString('hex')}`;
}

/** 本地日期（YYYY-MM-DD） */
export function formatDate(ms) {
  const d = new Date(Number(ms) || Date.now());
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * 把多行正文压成一行（全局记忆的列表项必须是单行，否则整行解析不出来）。
 * @param {string} value
 * @returns {string}
 */
export function oneLine(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 小节标题清理：去掉开头的 #、压成一行、截断 40；空值落默认小节。
 * @param {string} section
 * @returns {string}
 */
export function normalizeSection(section) {
  const s = oneLine(String(section ?? '').replace(/^#+\s*/, '')).slice(0, 40);
  return s || DEFAULT_GLOBAL_SECTION;
}

/**
 * 标签规整：去空、去重、单个标签压成一行且不超过 24 字。
 * @param {string[]|string|null|undefined} tags
 * @returns {string[]}
 */
export function normalizeTags(tags) {
  const raw = Array.isArray(tags) ? tags : String(tags ?? '').split(/[,，]/);
  const seen = new Set();
  const out = [];
  for (const t of raw) {
    const v = oneLine(t).slice(0, 24);
    if (!v || seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

/**
 * 解析一条全局记忆的列表项。
 * @param {string} line 原始行
 * @param {string} section 所属小节
 * @returns {{id:string, section:string, text:string, date:string, tags:string[]}|null}
 */
export function parseGlobalLine(line, section) {
  const m = ENTRY_RE.exec(String(line ?? '').trim());
  if (!m) return null;
  let rest = m[2].trim();
  let tags = [];
  const tagMatch = TAG_RE.exec(rest);
  if (tagMatch) {
    tags = normalizeTags(tagMatch[1]);
    rest = rest.slice(0, tagMatch.index).trim();
  }
  let date = '';
  const dateMatch = DATE_RE.exec(rest);
  if (dateMatch) {
    date = dateMatch[1];
    rest = dateMatch[2].trim();
  }
  if (!rest) return null;
  return { id: m[1], section, text: rest, date, tags };
}

/**
 * 解析整份全局记忆：先按 `## 小节` 分组，再逐行取列表项。
 * 认不出的行一律忽略（用户手写的内容不能让它整份读不出来）。
 * @param {string} text
 * @returns {Array<{id:string, section:string, text:string, date:string, tags:string[]}>}
 */
export function parseGlobal(text) {
  const entries = [];
  let section = DEFAULT_GLOBAL_SECTION;
  for (const line of String(text ?? '').split(/\r?\n/)) {
    const h = /^##\s+(.*)$/.exec(line);
    if (h) {
      section = normalizeSection(h[1]);
      continue;
    }
    const entry = parseGlobalLine(line, section);
    if (entry) entries.push(entry);
  }
  return entries;
}

/**
 * 把一行条目插进指定小节末尾；小节不存在就在文件末尾新建。
 * 直接做文本级编辑而不是「解析 → 重新序列化」：用户手写的注释/空行/顺序都要留住。
 * @param {string} text 现有全文
 * @param {string} section 小节名
 * @param {string} line 要插入的列表项
 * @returns {string}
 */
export function insertGlobalLine(text, section, line) {
  const sec = normalizeSection(section);
  const src = String(text ?? '').trim() ? String(text) : `${GLOBAL_HEADER}\n`;
  const lines = src.replace(/\r\n/g, '\n').replace(/\n+$/, '').split('\n');
  if (!lines.some((l) => /^#\s/.test(l))) lines.unshift(GLOBAL_HEADER);

  const heading = `## ${sec}`;
  const at = lines.findIndex((l) => l.trim() === heading);
  if (at < 0) {
    lines.push('', heading, '', line);
    return `${lines.join('\n')}\n`;
  }
  let end = lines.length;
  for (let i = at + 1; i < lines.length; i += 1) {
    if (/^##\s+/.test(lines[i])) {
      end = i;
      break;
    }
  }
  const body = lines.slice(at + 1, end).filter((l) => l.trim());
  if (!body.length) {
    // 空小节：把标题下的空白换成「空行 + 条目」，避免出现两个连续空行
    lines.splice(at + 1, end - (at + 1), '', line);
  } else {
    let ins = end;
    while (ins > at + 1 && !lines[ins - 1].trim()) ins -= 1;
    lines.splice(ins, 0, line);
  }
  return `${lines.join('\n')}\n`;
}

/**
 * 从全文里删掉某个 id 的那一行。
 * @param {string} text
 * @param {string} id
 * @returns {{text:string, removed:boolean}}
 */
export function removeGlobalLine(text, id) {
  const src = String(text ?? '').replace(/\r\n/g, '\n');
  const lines = src.split('\n');
  const idx = lines.findIndex((l) => {
    const m = ENTRY_RE.exec(l.trim());
    return m && m[1] === id;
  });
  if (idx < 0) return { text: src, removed: false };
  lines.splice(idx, 1);
  return { text: lines.join('\n').replace(/\n{3,}/g, '\n\n'), removed: true };
}

/** 摘要：正文第一行「非标题、非空」内容，压成一行后截断 120 字 */
export function summaryOf(body, limit = 120) {
  for (const line of String(body ?? '').split(/\r?\n/)) {
    const v = line.trim();
    if (!v || /^#{1,6}\s/.test(v) || /^<!--/.test(v)) continue;
    return oneLine(v.replace(/^[-*>\d.]+\s*/, '')).slice(0, limit);
  }
  return '';
}

/** 角色卡 frontmatter 分隔线 */
const FENCE = '---';

/**
 * 拆出 frontmatter 与正文。只认第一个 `---` 块；没有就是「无元信息」。
 * @param {string} text
 * @returns {{meta:Record<string,string>, body:string}}
 */
export function splitFrontmatter(text) {
  const src = String(text ?? '');
  if (!src.startsWith(FENCE)) return { meta: {}, body: src };
  const end = src.indexOf(`\n${FENCE}`, FENCE.length);
  if (end < 0) return { meta: {}, body: src };
  const head = src.slice(FENCE.length, end);
  const body = src.slice(end + FENCE.length + 1);
  const meta = {};
  for (const line of head.split('\n')) {
    const idx = line.indexOf(':');
    if (idx <= 0) continue;
    meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return { meta, body };
}

/**
 * 解析角色卡：frontmatter 只有 name/updated 两个字段，正文原样保存。
 * @param {string|null} text
 * @returns {{name:string, body:string, updated:number}}
 */
export function parsePersona(text) {
  if (text === null || text === undefined) {
    return { name: DEFAULT_PERSONA_NAME, body: `我是 ${DEFAULT_PERSONA_NAME}。\n`, updated: 0 };
  }
  const { meta, body } = splitFrontmatter(text);
  const name = oneLine(meta.name).slice(0, 60) || DEFAULT_PERSONA_NAME;
  return {
    name,
    // 正文原样保留（不拆小节、不改写），只去掉首尾空白换行：
    // 这样「读→写→读」的往返是幂等的，注入文本也不会因为多一个换行而每轮抖动。
    body: normalizePersonaBody(body),
    updated: Number(meta.updated) || 0,
  };
}

/**
 * 序列化角色卡（旧版单卡格式，只给兼容读用）。
 * @param {{name:string, body:string, updated:number}} persona
 * @returns {string}
 */
export function serializePersona(persona) {
  const name = oneLine(persona?.name).slice(0, 60) || DEFAULT_PERSONA_NAME;
  const body = String(persona?.body ?? '');
  const updated = Number(persona?.updated) || Date.now();
  return `${FENCE}\nname: ${name}\nupdated: ${updated}\n${FENCE}\n\n${body.replace(/\n+$/, '')}\n`;
}

/**
 * 解析 personas.json。坏 JSON/缺字段一律当「没有指定 activeId」，
 * 由上层回落到排序第一张 —— 一个手滑改坏的 config 文件不该让所有卡都读不出来。
 * @param {string|null} text
 * @returns {{activeId:string|null}}
 */
export function parsePersonaIndex(text) {
  if (!text) return { activeId: null };
  try {
    const value = JSON.parse(text);
    const activeId = typeof value?.activeId === 'string' && value.activeId.trim() ? value.activeId.trim() : null;
    return { activeId };
  } catch {
    return { activeId: null };
  }
}

/**
 * 正文归一化：去掉首尾空白换行，中间一个字都不改。
 * 为什么必须归一：写盘后再读回来是这条数据唯一的真相，
 * 如果「写入返回值」带着尾部换行而「读回来」没有，界面立刻就会显示不一致。
 * @param {string} value
 * @returns {string}
 */
export function normalizePersonaBody(value) {
  return String(value ?? '').replace(/^\n+/, '').replace(/\s+$/, '');
}

/**
 * 解析一张多角色卡（frontmatter: id / name / created / updated + 正文）。
 * @param {string|null} text
 * @param {string} fallbackId 文件名推出来的 id
 * @returns {{id:string, name:string, body:string, created:number, updated:number}}
 */
export function parsePersonaCard(text, fallbackId = '') {
  if (text === null || text === undefined) {
    const name = DEFAULT_PERSONA_NAME;
    return { id: fallbackId || '', name, body: `我是 ${name}。\n`, created: 0, updated: 0 };
  }
  const { meta, body } = splitFrontmatter(text);
  const name = oneLine(meta.name).slice(0, 60) || fallbackId || DEFAULT_PERSONA_NAME;
  return {
    id: String(meta.id || fallbackId || ''),
    name,
    body: normalizePersonaBody(body),
    created: Number(meta.created) || 0,
    updated: Number(meta.updated) || 0,
  };
}

/**
 * 序列化一张多角色卡（正文原样写回）。
 * @param {{id:string, name:string, body:string, created:number, updated:number}} card
 * @returns {string}
 */
export function serializePersonaCard(card) {
  const id = oneLine(card?.id);
  if (!id) throw new Error('角色卡缺少 id');
  const name = oneLine(card?.name).slice(0, 60) || DEFAULT_PERSONA_NAME;
  const created = Number(card?.created) || Date.now();
  const updated = Number(card?.updated) || created;
  const body = String(card?.body ?? '').replace(/\n+$/, '');
  return `${FENCE}\nid: ${id}\nname: ${name}\ncreated: ${created}\nupdated: ${updated}\n${FENCE}\n\n${body}\n`;
}

/**
 * 由名字生成角色卡 id。
 *
 * 规则（刻意简单）：
 *   - 纯 ASCII 标识符（`baby` / `cat-2`）→ 直接用 safeSegment 的结果并转小写
 *     （Windows 文件名大小写不敏感，`Baby` 与 `baby` 会是同一个文件，id 必须提前归一）；
 *   - 中文 / 带空格 / 空名字 → `p_` + 名字 sha1 前 8 位。
 *     为什么不直接把中文当文件名：跨平台编码、大小写折叠、路径长度都会咬人，
 *     而 id 只是内部句柄，显示名在 frontmatter 里。
 * @param {string} name
 * @returns {string}
 */
export function personaIdFromName(name) {
  const raw = oneLine(name);
  if (/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(raw)) {
    const seg = safeSegment(raw, '').toLowerCase();
    if (seg) return seg;
  }
  const hash = createHash('sha1').update(raw || 'persona').digest('hex').slice(0, 8);
  return `p_${hash}`;
}

/**
 * 生成一个当前不冲突的卡 id（重复就追加 -2、-3…）。
 * @param {string} name
 * @param {string[]} existingIds
 * @returns {string}
 */
export function uniquePersonaId(name, existingIds = []) {
  const base = personaIdFromName(name);
  const taken = new Set(existingIds.map(String));
  if (!taken.has(base)) return base;
  for (let n = 2; n < 1000; n += 1) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
  // 极端情况（同名卡超过 999 张）：退回随机后缀，宁可难看也不能撞
  return `${base}-${randomBytes(3).toString('hex')}`;
}

/**
 * 解析单条项目记忆文件（frontmatter: id/title/created/tags + 正文）。
 * @param {string} text
 * @param {string} fallbackId 文件名推出来的 id
 * @returns {{id:string, title:string, created:number, tags:string[], body:string}}
 */
export function parseEntryFile(text, fallbackId = '') {
  const { meta, body } = splitFrontmatter(text);
  let tags = [];
  const raw = meta.tags;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      tags = Array.isArray(parsed) ? normalizeTags(parsed) : normalizeTags(raw);
    } catch {
      tags = normalizeTags(raw.replace(/^\[|\]$/g, ''));
    }
  }
  return {
    id: meta.id || fallbackId,
    title: oneLine(meta.title).slice(0, 120) || summaryOf(body, 40) || fallbackId,
    created: Number(meta.created) || 0,
    tags,
    body: String(body ?? '').replace(/^\n+/, ''),
  };
}

/**
 * 序列化单条项目记忆文件。
 * @param {{id:string, title:string, created:number, tags:string[], body:string}} entry
 * @returns {string}
 */
export function serializeEntryFile(entry) {
  const tags = JSON.stringify(normalizeTags(entry.tags));
  return [
    FENCE,
    `id: ${entry.id}`,
    `title: ${oneLine(entry.title)}`,
    `created: ${Number(entry.created) || Date.now()}`,
    `tags: ${tags}`,
    FENCE,
    '',
    String(entry.body ?? '').replace(/\n+$/, ''),
    '',
  ].join('\n');
}

/**
 * 索引行：`- [p_x] 摘要（2026-11-07）`
 * @param {{id:string, summary:string, created:number}} entry
 * @returns {string}
 */
export function indexLineOf(entry) {
  return `- [${entry.id}] ${entry.summary}（${formatDate(entry.created)}）`;
}

/** 索引文件里一行的解析：`- [p_x] 摘要（2026-11-07）` */
export function parseIndexLine(line) {
  const m = ENTRY_RE.exec(String(line ?? '').trim());
  if (!m) return null;
  let rest = m[2].trim();
  let date = '';
  const d = /（(\d{4}-\d{2}-\d{2})）\s*$/.exec(rest);
  if (d) {
    date = d[1];
    rest = rest.slice(0, d.index).trim();
  }
  return { id: m[1], summary: rest, date };
}

/**
 * 取中文/拉丁混排文本的 bigram（不引依赖：中文没有空格分词，bigram 是最省事的近似）。
 * 英文单词按整词算，标点与空白丢掉。
 * @param {string} text
 * @returns {string[]}
 */
export function bigrams(text) {
  const s = String(text ?? '').toLowerCase();
  const out = new Set();
  // 拉丁/数字整词
  for (const m of s.matchAll(/[a-z0-9_]{2,}/g)) out.add(m[0]);
  // 连续的非拉丁字符（中日韩等）按相邻两字切
  for (const m of s.matchAll(/[^\sa-z0-9_,.;:!?'"()\[\]{}<>|/\\-]{2,}/g)) {
    const run = m[0];
    for (let i = 0; i + 1 < run.length; i += 1) out.add(run.slice(i, i + 2));
  }
  return [...out];
}

/**
 * 关键词相关度：整句子串命中优先，其次看 bigram 重合数。
 * 纯词法匹配，不做语义近似——用户问「上次那个配置怎么写」时能靠 bigram 命中，
 * 而「长得像但不同」的条目不会被误召回（比引入向量库可解释得多）。
 * @param {string} query
 * @param {string} text
 * @returns {number} 0 表示不相关
 */
export function matchScore(query, text) {
  const q = String(query ?? '').trim().toLowerCase();
  const t = String(text ?? '').toLowerCase();
  if (!q || !t) return 0;
  let score = 0;
  if (t.includes(q)) score += 100 + Math.min(q.length, 40);
  for (const gram of bigrams(q)) if (t.includes(gram)) score += 1;
  return score;
}

/**
 * 创建存储实例。
 * @param {{dataDir?:string, now?:() => number}} options
 * @returns {object} 存储 API
 */
export function createMemoryStore(options = {}) {
  const root = options.dataDir ? String(options.dataDir) : defaultDataDir();
  const now = typeof options.now === 'function' ? options.now : () => Date.now();

  const paths = {
    root,
    /** 旧版单卡文件（迁移后保留，只读不写） */
    persona: join(root, 'persona.md'),
    personas: join(root, 'personas'),
    personaIndex: join(root, 'personas.json'),
    global: join(root, 'MEMORY.md'),
    projects: join(root, 'projects'),
  };
  const projectDirOf = (slug) => join(paths.projects, slug);
  const projectIndexOf = (slug) => join(projectDirOf(slug), 'MEMORY.md');
  const projectEntryOf = (slug, id) => join(projectDirOf(slug), `${id}.md`);
  const personaFileOf = (id) => join(paths.personas, `${id}.md`);

  // ---------- 角色卡（多张） ----------

  /** 现有卡 id（同步版：注入段每轮都要问一次，不能 await） */
  function listPersonaIdsSync() {
    try {
      return readdirSync(paths.personas, { withFileTypes: true })
        .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.md'))
        .map((e) => e.name.replace(/\.md$/i, ''))
        .filter(Boolean);
    } catch {
      return [];
    }
  }

  /** 现有卡 id（异步版） */
  async function listPersonaIds() {
    try {
      return (await readdir(paths.personas, { withFileTypes: true }))
        .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.md'))
        .map((e) => e.name.replace(/\.md$/i, ''))
        .filter(Boolean);
    } catch {
      return [];
    }
  }

  /** 读 personas.json；坏文件/缺失都返回 {activeId:null}（不让一个坏 JSON 弄死所有卡） */
  async function readPersonaIndex() {
    const text = await readText(paths.personaIndex);
    return parsePersonaIndex(text);
  }

  /** 同步读 personas.json（注入路径用，走 mtime 缓存） */
  function readPersonaIndexSync() {
    return parsePersonaIndex(readTextSyncCached(paths.personaIndex));
  }

  /** 写 personas.json（原子写） */
  async function writePersonaIndex(index) {
    const activeId = index?.activeId ? String(index.activeId) : null;
    await writeTextAtomic(paths.personaIndex, `${JSON.stringify({ activeId }, null, 2)}\n`);
    invalidateSyncCache(paths.personaIndex);
  }

  /**
   * 卡排序：created 升序，同一时刻再按 id。
   * 「排序第一张」是 activeId 失效时的兜底卡，顺序必须稳定，否则注入内容会跳。
   * @param {string[]} ids
   * @returns {Promise<string[]>}
   */
  async function orderedPersonaIds(ids) {
    const rows = [];
    for (const id of ids) {
      const card = parsePersonaCard(await readText(personaFileOf(id)), id);
      rows.push({ id, created: card.created });
    }
    rows.sort((a, b) => a.created - b.created || a.id.localeCompare(b.id));
    return rows.map((r) => r.id);
  }

  /** 同步版排序（读 frontmatter 走 mtime 缓存，卡通常只有几张） */
  function orderedPersonaIdsSync(ids) {
    const rows = ids.map((id) => ({ id, created: parsePersonaCard(readTextSyncCached(personaFileOf(id)), id).created }));
    rows.sort((a, b) => a.created - b.created || a.id.localeCompare(b.id));
    return rows.map((r) => r.id);
  }

  /**
   * 解析出真正生效的 activeId。
   * activeId 指向的卡被手删了、或 personas.json 丢了 —— 都回落到排序第一张，
   * 并把自愈结果写回磁盘（异步路径才写；同步路径只算不写）。
   * @param {string[]} ids
   * @param {{persist?:boolean}} options
   * @returns {Promise<string|null>}
   */
  async function resolveActivePersonaId(ids, { persist = true } = {}) {
    if (!ids.length) return null;
    const index = await readPersonaIndex();
    if (index.activeId && ids.includes(index.activeId)) return index.activeId;
    const ordered = await orderedPersonaIds(ids);
    const fallback = ordered[0] ?? null;
    if (persist && fallback && index.activeId !== fallback) {
      await writePersonaIndex({ activeId: fallback }).catch(() => {});
    }
    return fallback;
  }

  /**
   * 列出全部角色卡（含正文，界面要显示）。
   * @returns {Promise<{items:Array<{id:string,name:string,body:string,created:number,updated:number}>, activeId:string|null}>}
   */
  async function listPersonas() {
    const ids = await orderedPersonaIds(await listPersonaIds());
    const items = [];
    for (const id of ids) {
      const text = await readText(personaFileOf(id));
      if (text === null) continue;
      const card = parsePersonaCard(text, id);
      items.push({ ...card, id: card.id || id });
    }
    const activeId = await resolveActivePersonaId(items.map((i) => i.id));
    return { items, activeId: activeId ?? items[0]?.id ?? null };
  }

  /**
   * 读当前生效的角色卡；一张都没有时返回默认空卡。
   * @returns {Promise<{id:string|null,name:string,body:string,created:number,updated:number}>}
   */
  async function readActivePersona() {
    const { items, activeId } = await listPersonas();
    const card = items.find((i) => i.id === activeId) ?? items[0];
    if (card) return card;
    return { id: null, name: DEFAULT_PERSONA_NAME, body: `我是 ${DEFAULT_PERSONA_NAME}。\n`, created: 0, updated: 0 };
  }

  /**
   * 同步读当前生效的角色卡（注入段用）。
   * 迁移还没跑完（personas/ 还是空的）时自动回落到旧的单卡 persona.md，
   * 这样插件一启动就有内容可注入，不必等异步迁移。
   * @returns {{id:string|null,name:string,body:string,created:number,updated:number}}
   */
  function readActivePersonaSync() {
    const ids = listPersonaIdsSync();
    if (ids.length) {
      const index = readPersonaIndexSync();
      const ordered = orderedPersonaIdsSync(ids);
      const activeId = index.activeId && ids.includes(index.activeId) ? index.activeId : ordered[0];
      const text = readTextSyncCached(personaFileOf(activeId));
      if (text !== null) {
        const card = parsePersonaCard(text, activeId);
        return { ...card, id: card.id || activeId };
      }
    }
    const legacy = parsePersona(readTextSyncCached(paths.persona));
    return { id: null, ...legacy, created: legacy.updated };
  }

  /**
   * 新建一张角色卡。
   * @param {{name?:string, body?:string}} input
   * @returns {Promise<{id:string,name:string,body:string,created:number,updated:number}>}
   */
  async function createPersona({ name, body } = {}) {
    const displayName = oneLine(name).slice(0, 60) || '新角色';
    const ts = now();
    await ensureDir(paths.personas);

    // 并发防护：id 是先「列目录算出来」再「写文件」，两个并发新建同名卡可能算出同一个 id，
    // 后写的会把先写的覆盖掉（静默丢一张卡）。写完前再看一眼目标文件在不在，
    // 在就重算一次 id —— 窗口极小，但代价只是一次 stat。
    let id = '';
    let card = null;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const existing = await listPersonaIds();
      id = uniquePersonaId(displayName, existing);
      if ((await fileStat(personaFileOf(id))).exists) continue;
      card = {
        id,
        name: displayName,
        created: ts,
        updated: ts,
        body: normalizePersonaBody(body === undefined ? `我是 ${displayName}。` : String(body)),
      };
      await writeTextAtomic(personaFileOf(id), serializePersonaCard(card));
      invalidateSyncCache(personaFileOf(id));
      break;
    }
    if (!card) throw new Error('新建角色卡失败：同名卡太多或目录不可写');
    // 第一张卡顺带成为默认：否则新用户建完卡还是「没有角色」
    const index = await readPersonaIndex();
    const ids = await listPersonaIds();
    if (!index.activeId || !ids.includes(index.activeId)) await writePersonaIndex({ activeId: card.id });
    return card;
  }

  /**
   * 保存某张卡（原子写）。id 不可变 —— 改名只改 frontmatter 的 name，文件名不动。
   * @param {string} id
   * @param {{name?:string, body?:string}} input
   * @returns {Promise<{id:string,name:string,body:string,created:number,updated:number}>}
   */
  async function savePersonaCard(id, { name, body } = {}) {
    const key = String(id ?? '').trim();
    if (!key) throw new Error('缺少角色卡 id');
    const file = personaFileOf(key);
    const text = await readText(file);
    if (text === null) throw new Error(`找不到角色卡 ${key}`);
    const current = parsePersonaCard(text, key);
    const next = {
      id: key,
      name: oneLine(name).slice(0, 60) || current.name,
      created: current.created || now(),
      updated: now(),
      body: body === undefined ? current.body : normalizePersonaBody(body),
    };
    await writeTextAtomic(file, serializePersonaCard(next));
    invalidateSyncCache(file);
    return next;
  }

  /**
   * 删除某张卡。只剩一张时拒绝（注入总得有个角色）。
   * 删掉的如果是 active，activeId 改成剩下排序第一张。
   * @param {string} id
   * @returns {Promise<{removed:string, activeId:string}>}
   */
  async function deletePersona(id) {
    const key = String(id ?? '').trim();
    const ids = await listPersonaIds();
    if (!ids.includes(key)) throw new Error(`找不到角色卡 ${key}`);
    if (ids.length <= 1) throw new Error('至少保留一张角色卡');
    await rm(personaFileOf(key), { force: true });
    invalidateSyncCache(personaFileOf(key));
    const remaining = await orderedPersonaIds(ids.filter((x) => x !== key));
    const index = await readPersonaIndex();
    let activeId = index.activeId;
    if (!activeId || !remaining.includes(activeId)) activeId = remaining[0];
    await writePersonaIndex({ activeId });
    return { removed: key, activeId };
  }

  /**
   * 设为默认卡。
   * @param {string} id
   * @returns {Promise<{activeId:string}>}
   */
  async function setActivePersona(id) {
    const key = String(id ?? '').trim();
    const ids = await listPersonaIds();
    if (!ids.includes(key)) throw new Error(`找不到角色卡 ${key}`);
    await writePersonaIndex({ activeId: key });
    return { activeId: key };
  }

  /**
   * 迁移：旧版单卡 persona.md → personas/<id>.md + personas.json。
   *
   * 只在「personas/ 不存在或为空」时才迁；旧 persona.md **保留不删**（人可能还想看）。
   * 幂等：已经有卡就只顺手修一下 activeId。
   * @returns {Promise<{migrated:boolean, id?:string, ids?:string[]}>}
   */
  async function migratePersona() {
    const ids = await listPersonaIds();
    if (ids.length) {
      await resolveActivePersonaId(ids, { persist: true });
      return { migrated: false, ids };
    }
    const legacyText = await readText(paths.persona);
    if (legacyText === null) return { migrated: false, ids: [] };
    const legacy = parsePersona(legacyText);
    const id = uniquePersonaId(legacy.name, []);
    const stamp = legacy.updated || now();
    const card = {
      id,
      name: legacy.name,
      created: stamp,
      updated: stamp,
      body: normalizePersonaBody(legacy.body) || `我是 ${legacy.name}。`,
    };
    await ensureDir(paths.personas);
    await writeTextAtomic(personaFileOf(id), serializePersonaCard(card));
    invalidateSyncCache(personaFileOf(id));
    await writePersonaIndex({ activeId: id });
    return { migrated: true, id };
  }

  /**
   * 保证至少有一张卡：先迁移，迁移不出卡就建一张默认的。
   * 插件启动时调一次（失败只 warn，不拦插件）。
   * @param {{name?:string}} options
   * @returns {Promise<{created:boolean, id:string|null}>}
   */
  async function ensurePersonas({ name } = {}) {
    const migrated = await migratePersona();
    if (migrated.migrated && migrated.id) return { created: false, id: migrated.id };
    const ids = await listPersonaIds();
    if (ids.length) return { created: false, id: await resolveActivePersonaId(ids) };
    const card = await createPersona({ name: name || DEFAULT_PERSONA_NAME });
    return { created: true, id: card.id };
  }

  // ---------- 兼容层：旧版单卡 API（等价于「active 那张卡」） ----------

  /** 读当前生效的卡（旧形状：{name, body, updated}） */
  async function readPersona() {
    const card = await readActivePersona();
    return { name: card.name, body: card.body, updated: card.updated };
  }

  /** 同步读当前生效的卡（旧形状） */
  function readPersonaSync() {
    const card = readActivePersonaSync();
    return { name: card.name, body: card.body, updated: card.updated };
  }

  /**
   * 保存当前生效的卡（旧 API）。一张卡都没有时自动建一张再写。
   * @param {{name?:string, body?:string}} input
   * @returns {Promise<{name:string, body:string, updated:number}>}
   */
  async function savePersona({ name, body } = {}) {
    const { items, activeId } = await listPersonas();
    const target = items.find((i) => i.id === activeId) ?? items[0];
    if (!target) {
      const created = await createPersona({ name, body });
      return { name: created.name, body: created.body, updated: created.updated };
    }
    const saved = await savePersonaCard(target.id, { name, body });
    return { name: saved.name, body: saved.body, updated: saved.updated };
  }

  // ---------- 全局记忆 ----------

  /** 读全局记忆条目（按文件顺序） */
  async function listGlobal() {
    return parseGlobal(await readText(paths.global));
  }

  /** 同步读全局记忆原文（注入段用） */
  function globalTextSync() {
    return readTextSyncCached(paths.global) ?? '';
  }

  /**
   * 追加一条全局记忆。
   *
   * 语义约束（工具 description 里也写了）：全局记忆只装「人相关、通用、与具体技术无关」的内容
   * —— 称呼、口味、作息、脾气、偏好。技术细节必须进项目记忆，否则全局记忆会被
   * 「某个库的某个参数名」这种三个月后就作废的内容挤爆，而它每轮都会注入。
   *
   * @param {{text:string, section?:string, tags?:string[]|string}} input
   * @returns {Promise<{id:string, scope:'global', text:string, section:string, date:string, tags:string[], path:string}>}
   */
  async function appendGlobal({ text, section, tags } = {}) {
    const content = oneLine(text);
    if (!content) throw new Error('全局记忆正文不能为空');
    const sec = normalizeSection(section);
    const tagList = normalizeTags(tags);
    const id = newEntryId('g');
    const date = formatDate(now());
    const suffix = tagList.length ? ` | tag: ${tagList.join(', ')}` : '';
    const line = `- [${id}] ${date} ${content}${suffix}`;
    const current = (await readText(paths.global)) ?? `${GLOBAL_HEADER}\n`;
    await writeTextAtomic(paths.global, insertGlobalLine(current, sec, line));
    invalidateSyncCache(paths.global);
    return { id, scope: 'global', text: content, section: sec, date, tags: tagList, path: paths.global };
  }

  /**
   * 按 id 删除一条全局记忆。
   * @param {string} id
   * @returns {Promise<{removed:boolean, path:string}>}
   */
  async function forgetGlobal(id) {
    const current = await readText(paths.global);
    if (current === null) return { removed: false, path: paths.global };
    const { text, removed } = removeGlobalLine(current, id);
    if (!removed) return { removed: false, path: paths.global };
    await writeTextAtomic(paths.global, text);
    invalidateSyncCache(paths.global);
    return { removed: true, path: paths.global };
  }

  /**
   * 整份覆盖 MEMORY.md（面板里直接编辑原文）。
   *
   * **不校验格式**：用户就是可能在编辑器里手写一半再存。结构损坏的后果是
   * 「这一份读不出条目」，而不是「插件报错」——parseGlobal 本来就会跳过认不出的行。
   * 允许空字符串（清空全部全局记忆是合法操作）。
   * @param {string} text
   * @returns {Promise<{path:string, text:string}>}
   */
  async function writeGlobalRaw(text) {
    const value = text === undefined || text === null ? '' : String(text);
    await writeTextAtomic(paths.global, value);
    invalidateSyncCache(paths.global);
    return { path: paths.global, text: value };
  }

  // ---------- 项目记忆 ----------

  /** 同步读项目索引原文（注入段用） */
  function projectIndexTextSync(slug) {
    if (!slug) return '';
    return readTextSyncCached(projectIndexOf(slug)) ?? '';
  }

  /**
   * 从磁盘重建项目索引（索引文件被用户手删 / 内容被清空 / 手工拷进新条目时用）。
   * why 必须能重建：索引是派生数据，真数据是每个 `<id>.md`；索引丢了不该等于记忆丢了。
   * @param {string} slug
   * @returns {Promise<Array<{id:string, summary:string, created:number}>>}
   */
  async function rebuildProjectIndex(slug) {
    const dir = projectDirOf(slug);
    let names = [];
    try {
      names = (await readdir(dir, { withFileTypes: true }))
        .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.md'))
        .map((e) => e.name)
        // 索引文件自己不算条目
        .filter((n) => n.toLowerCase() !== 'memory.md');
    } catch {
      return [];
    }
    const rows = [];
    for (const name of names) {
      const file = join(dir, name);
      const text = await readText(file);
      if (text === null) continue;
      const id = name.replace(/\.md$/i, '');
      const parsed = parseEntryFile(text, id);
      rows.push({
        id: parsed.id || id,
        summary: summaryOf(parsed.body) || parsed.title,
        created: parsed.created || (await fileStat(file)).mtimeMs || 0,
      });
    }
    rows.sort((a, b) => a.created - b.created);
    const title = slug.replace(/-[0-9a-f]{6}$/, '');
    const out = [`# 项目记忆 · ${title}`, ''];
    for (const row of rows) out.push(indexLineOf(row));
    await ensureDir(dir);
    await writeTextAtomic(projectIndexOf(slug), `${out.join('\n')}\n`);
    invalidateSyncCache(projectIndexOf(slug));
    return rows;
  }

  /**
   * 读项目索引；索引缺失或与磁盘不符（有条目文件但索引里一条都没有）时自动重建。
   * @param {string} slug
   * @returns {Promise<{slug:string, entries:Array<{id:string, summary:string, date:string}>, rebuilt:boolean, path:string}>}
   */
  async function listProject(slug) {
    const indexFile = projectIndexOf(slug);
    const text = await readText(indexFile);
    const parsed = String(text ?? '')
      .split(/\r?\n/)
      .map((line) => parseIndexLine(line))
      .filter(Boolean);
    if (parsed.length) return { slug, entries: parsed, rebuilt: false, path: indexFile };
    const rebuiltRows = await rebuildProjectIndex(slug);
    if (!rebuiltRows.length) return { slug, entries: [], rebuilt: false, path: indexFile };
    return {
      slug,
      entries: rebuiltRows.map((r) => ({ id: r.id, summary: r.summary, date: formatDate(r.created) })),
      rebuilt: true,
      path: indexFile,
    };
  }

  /**
   * 读一条项目记忆全文。
   * @param {string} slug
   * @param {string} id
   * @returns {Promise<{id:string,title:string,created:number,tags:string[],body:string,date:string,path:string}|null>}
   */
  async function readProjectEntry(slug, id) {
    const file = projectEntryOf(slug, id);
    const text = await readText(file);
    if (text === null) return null;
    const parsed = parseEntryFile(text, id);
    return { ...parsed, date: formatDate(parsed.created), path: file };
  }

  /**
   * 追加一条项目记忆：先写条目全文文件，再往主索引末尾追一行摘要。
   *
   * 顺序很重要：**先文件后索引**。反过来的话，中途失败会留下一个指向不存在文件的索引行，
   * 注入与列表都会露出坏 id；现在这种顺序最坏情况只是「有条目没索引」，而 listProject
   * 发现索引里没条目时会重建索引，自动修好。
   *
   * @param {{root?:string, slug?:string, title?:string, body:string, tags?:string[]|string}} input
   *   slug 给了就直接用（HTTP 面板按 slug 指定项目时，root 可能不可知）
   * @returns {Promise<{id:string, scope:'project', slug:string, title:string, summary:string, date:string, path:string}>}
   */
  async function appendProject({ root: projectRoot, slug: slugOverride, title, body, tags } = {}) {
    const content = String(body ?? '').trim();
    if (!content) throw new Error('项目记忆正文不能为空');
    const slug = slugOverride ? String(slugOverride) : projectSlug(projectRoot);
    if (!slug) throw new Error('缺少项目标识（root 或 slug）');
    const id = newEntryId('p');
    const created = now();
    const summary = summaryOf(content);
    const finalTitle = oneLine(title).slice(0, 120) || summary.slice(0, 60) || '未命名条目';
    const entry = { id, title: finalTitle, created, tags: normalizeTags(tags), body: content };
    const file = projectEntryOf(slug, id);
    await ensureDir(projectDirOf(slug));
    await writeTextAtomic(file, serializeEntryFile(entry));

    const indexFile = projectIndexOf(slug);
    const currentIndex = (await readText(indexFile)) ?? '';
    const hasEntryLine = currentIndex.split(/\r?\n/).some((line) => parseIndexLine(line) !== null);
    if (!hasEntryLine) {
      // 索引丢失或为空：按磁盘重建。刚写的条目文件已在磁盘上，重建会把它一并收进去，
      // 所以这里不需要再追加一次（重复追加会出现同一个 id 两行）。
      await rebuildProjectIndex(slug);
      return { id, scope: 'project', slug, title: finalTitle, summary, date: formatDate(created), path: file };
    }
    const next = `${String(currentIndex).replace(/\n+$/, '')}\n${indexLineOf({ id, summary, created })}\n`;
    await writeTextAtomic(indexFile, next);
    invalidateSyncCache(indexFile);
    return { id, scope: 'project', slug, title: finalTitle, summary, date: formatDate(created), path: file };
  }

  /**
   * 删除一条项目记忆：删条目文件 + 删索引里的那一行。
   * @param {string} slug
   * @param {string} id
   * @returns {Promise<{removed:boolean, slug:string}>}
   */
  async function forgetProjectEntry(slug, id) {
    const file = projectEntryOf(slug, id);
    const stat = await fileStat(file);
    if (!stat.exists) return { removed: false, slug };
    await rm(file, { force: true });
    const indexFile = projectIndexOf(slug);
    const text = await readText(indexFile);
    if (text !== null) {
      const lines = text.split(/\r?\n/).filter((line) => {
        const parsed = parseIndexLine(line);
        return !(parsed && parsed.id === id);
      });
      await writeTextAtomic(indexFile, `${lines.join('\n').replace(/\n+$/, '')}\n`);
      invalidateSyncCache(indexFile);
    }
    return { removed: true, slug };
  }

  /** 列出所有项目 slug（forget 时要跨项目找 id） */
  async function listProjectSlugs() {
    try {
      return (await readdir(paths.projects, { withFileTypes: true }))
        .filter((e) => e.isDirectory())
        .map((e) => e.name);
    } catch {
      return [];
    }
  }

  /**
   * 按 id 找条目并删除（不关心它属于哪个项目）。
   * @param {string} id
   * @returns {Promise<{removed:boolean, scope:'global'|'project'|null, slug?:string, path?:string}>}
   */
  async function forgetById(id) {
    const value = String(id ?? '').trim();
    if (!/^(g|p)_[0-9a-f]+$/i.test(value)) return { removed: false, scope: null };
    if (value.startsWith('g_')) {
      const res = await forgetGlobal(value);
      return { removed: res.removed, scope: res.removed ? 'global' : null, path: res.path };
    }
    for (const slug of await listProjectSlugs()) {
      const stat = await fileStat(projectEntryOf(slug, value));
      if (!stat.exists) continue;
      const res = await forgetProjectEntry(slug, value);
      return { removed: res.removed, scope: 'project', slug, path: projectEntryOf(slug, value) };
    }
    return { removed: false, scope: null };
  }

  /**
   * 统计：全局几条、指定项目几条、数据目录。
   * @param {string|null} slug
   * @returns {Promise<{dataDir:string, globalCount:number, projectCount:number, slug:string|null}>}
   */
  async function stats(slug = null) {
    const globalCount = (await listGlobal()).length;
    const projectCount = slug ? (await listProject(slug)).entries.length : 0;
    return { dataDir: paths.root, globalCount, projectCount, slug };
  }

  return {
    paths,
    root,
    projectDirOf,
    projectIndexOf,
    projectEntryOf,
    personaFileOf,
    listProjectSlugs,
    // 角色卡（多张）
    listPersonaIds,
    listPersonas,
    readActivePersona,
    readActivePersonaSync,
    createPersona,
    savePersonaCard,
    deletePersona,
    setActivePersona,
    migratePersona,
    ensurePersonas,
    // 角色卡（旧版单卡兼容层，等价于 active 那张卡）
    readPersona,
    readPersonaSync,
    savePersona,
    // 全局
    listGlobal,
    globalTextSync,
    appendGlobal,
    forgetGlobal,
    writeGlobalRaw,
    // 项目
    projectIndexTextSync,
    appendProject,
    listProject,
    rebuildProjectIndex,
    readProjectEntry,
    forgetProjectEntry,
    // 通用
    forgetById,
    stats,
  };
}
