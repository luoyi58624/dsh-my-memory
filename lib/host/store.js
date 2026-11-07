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
import { isAbsolute, join, relative, resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { readdir, rename, rmdir, rm } from 'node:fs/promises';

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

/**
 * 「当前数据根指向哪里」的指针文件。
 *
 * 为什么放在 `~/.dsh/` 而不是数据目录里：指针必须比它指向的目录更稳定，
 * 放进数据目录就成自引用 —— 换了根之后旧指针还在旧根里，下次启动找不到新根。
 * 也刻意不动 profile 的 config：那是用户/组合层的地盘，插件改它等于改配置。
 * @returns {string}
 */
export function rootPointerFile() {
  return join(homedir(), '.dsh', 'my-memory.roots.json');
}

/**
 * 展开 `~` 并解析成绝对路径（不检查存在性、不创建）。
 * @param {string} value
 * @returns {string}
 */
export function expandUserPath(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  if (raw === '~') return homedir();
  if (raw.startsWith('~/') || raw.startsWith('~\\')) return resolve(join(homedir(), raw.slice(2)));
  return resolve(raw);
}

/**
 * 同步读指针文件里的 dataDir（插件 apply 是同步的，等不了 await）。
 * 坏 JSON / 缺字段都当「没设置过」。
 * @param {string} [file]
 * @returns {string|null}
 */
export function readRootPointerSync(file = rootPointerFile()) {
  try {
    const text = readFileSync(file, 'utf8');
    const value = JSON.parse(text);
    const dir = typeof value?.dataDir === 'string' ? value.dataDir.trim() : '';
    return dir ? expandUserPath(dir) : null;
  } catch {
    return null;
  }
}

/**
 * 写指针文件（原子写）。dataDir 为空 = 清掉指针，回到默认根。
 * @param {string|null} dataDir
 * @param {string} [file]
 * @returns {Promise<void>}
 */
export async function writeRootPointer(dataDir, file = rootPointerFile()) {
  const value = dataDir ? expandUserPath(dataDir) : null;
  await writeTextAtomic(file, `${JSON.stringify({ dataDir: value }, null, 2)}\n`);
}

/**
 * 决定这次启动用哪个数据根。
 *
 * 优先级：config.dataDir（显式配置最高）> 指针文件 > 默认 ~/.dsh/my-memory。
 * 为什么 config 优先：用户手写配置是「我更懂我在干什么」的表达，
 * 而指针文件是面板点出来的；两者打架时以手写配置为准，避免「怎么改配置都没用」。
 * @param {{configured?:string, file?:string}} input
 * @returns {{dataDir:string, source:'config'|'pointer'|'default'}}
 */
export function resolveDataDir({ configured, file } = {}) {
  const fromConfig = expandUserPath(configured);
  if (fromConfig) return { dataDir: fromConfig, source: 'config' };
  const fromPointer = readRootPointerSync(file ?? rootPointerFile());
  if (fromPointer) return { dataDir: fromPointer, source: 'pointer' };
  return { dataDir: defaultDataDir(), source: 'default' };
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
 * 角色目录里的固定文件名。为什么固定叫 agent.md：一个角色后面还会挂头像、
 * 形象图、会话状态，目录里唯一必须存在的锚点就是这个文件，名字不能随人改。
 */
export const AGENT_FILE = 'agent.md';

/** 目录名的合法字符集：英文/数字/点/下划线/短横线，1~40 位 */
export const PERSONA_DIR_RE = /^[A-Za-z0-9._-]{1,40}$/;

/**
 * 插件自己占用的目录名，不能当角色名。
 * 为什么必须显式排除：列表是「扫根目录找含 agent.md 的文件夹」，
 * 一旦 projects/ 或 state/ 里恰好有个 agent.md，就会被误认成一个角色。
 */
const RESERVED_PERSONA_DIRS = new Set(['projects', 'state', 'personas', 'node_modules', 'tmp', '.git']);

/** 这个目录名是不是插件自己的（projects / state / personas …） */
export function isReservedPersonaDir(dir) {
  const name = String(dir ?? '').trim().toLowerCase();
  return !name || RESERVED_PERSONA_DIRS.has(name);
}

/**
 * 校验用户输入的角色目录名。
 * @param {string} dir
 * @returns {{ok:boolean, message?:string}}
 */
export function validatePersonaDir(dir) {
  const value = String(dir ?? '').trim();
  if (!value) return { ok: false, message: '目录名不能为空' };
  if (isReservedPersonaDir(value)) {
    return { ok: false, message: '这个目录名被插件自己占用了（projects / state / personas），换一个' };
  }
  if (!PERSONA_DIR_RE.test(value)) {
    return { ok: false, message: '目录名只能用英文、数字、点、下划线、短横线' };
  }
  // Windows 会把结尾的点和空格静默吞掉，导致「建了 baby. 实际是 baby」
  if (/[. ]$/.test(value)) return { ok: false, message: '目录名不能以点或空格结尾' };
  return { ok: true };
}

/**
 * 由显示名猜一个可用的目录名（只用于迁移/建默认卡；新建角色永远是用户自己输入）。
 * 中文名猜不出合法目录名时退回 baby。
 * @param {string} name
 * @returns {string}
 */
export function defaultPersonaDir(name) {
  const raw = oneLine(name).slice(0, 40);
  const candidate = safeSegment(raw, '').trim();
  if (candidate && validatePersonaDir(candidate).ok) return candidate.toLowerCase();
  return 'baby';
}

/**
 * 找出一个当前不冲突的目录名（重复就追加 -2、-3…）。
 * @param {string} base
 * @param {string[]} existingIds
 * @returns {string}
 */
export function uniquePersonaDir(base, existingIds = []) {
  const start = validatePersonaDir(base).ok ? base : 'baby';
  const taken = new Set(existingIds.map(String));
  if (!taken.has(start)) return start;
  for (let n = 2; n < 1000; n += 1) {
    const candidate = `${start}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${start}-${randomBytes(3).toString('hex')}`;
}

/**
 * 把绝对路径缩成给人看的形式（家目录缩成 `~`）。
 * 例：`C:\Users\luoyi\.dsh\my-memory\baby\agent.md` → `~\.dsh\my-memory\baby\agent.md`
 * @param {string} abs
 * @param {string} [home]
 * @returns {string}
 */
export function displayPathOf(abs, home = homedir()) {
  const target = String(abs ?? '');
  if (!target || !home) return target;
  const rel = relative(home, target);
  if (!rel || rel.startsWith('..') || isAbsolute(rel)) return target;
  const sep = process.platform === 'win32' ? '\\' : '/';
  return `~${sep}${rel.split(/[\\/]+/).filter(Boolean).join(sep)}`;
}

/**
 * 造一个带 HTTP 状态码的错误：路由直接读 err.status 决定 400/404/500，
 * 而不是去匹配错误文案（文案一改就静默错码）。
 * @param {number} status
 * @param {string} message
 * @returns {Error}
 */
export function statusError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/**
 * 解析一张角色卡（frontmatter: name / created / updated + 正文）。
 * id 永远来自目录名，**不从 frontmatter 里读** —— 目录名是唯一身份，
 * 两处都能定义身份迟早会打架（旧版文件里残留的 `id:` 行会被忽略）。
 * @param {string|null} text
 * @param {string} dir 目录名（= id）
 * @returns {{id:string, name:string, body:string, created:number, updated:number}}
 */
export function parsePersonaCard(text, dir = '') {
  const id = String(dir ?? '');
  if (text === null || text === undefined) {
    const name = id || DEFAULT_PERSONA_NAME;
    return { id, name, body: `我是 ${name}。`, created: 0, updated: 0 };
  }
  const { meta, body } = splitFrontmatter(text);
  const name = oneLine(meta.name).slice(0, 60) || id || DEFAULT_PERSONA_NAME;
  return {
    id,
    name,
    body: normalizePersonaBody(body),
    created: Number(meta.created) || 0,
    updated: Number(meta.updated) || 0,
  };
}

/**
 * 序列化一张角色卡：frontmatter 只有 name / created / updated（id 就是目录名）。
 * @param {{name:string, body:string, created:number, updated:number}} card
 * @returns {string}
 */
export function serializePersonaCard(card) {
  const name = oneLine(card?.name).slice(0, 60) || DEFAULT_PERSONA_NAME;
  const created = Number(card?.created) || Date.now();
  const updated = Number(card?.updated) || created;
  const body = String(card?.body ?? '').replace(/\n+$/, '');
  return `${FENCE}\nname: ${name}\ncreated: ${created}\nupdated: ${updated}\n${FENCE}\n\n${body}\n`;
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
    /** 上一版「一卡一 md 文件」目录（迁移后只删空目录） */
    personas: join(root, 'personas'),
    /** 插件自己的状态目录：activeId 放这儿，不跟角色目录混在一起 */
    state: join(root, 'state'),
    personaIndex: join(root, 'state', 'personas.json'),
    /** 旧版索引位置（迁移时读一次 activeId） */
    personaIndexLegacy: join(root, 'personas.json'),
    global: join(root, 'MEMORY.md'),
    projects: join(root, 'projects'),
  };
  const projectDirOf = (slug) => join(paths.projects, slug);
  const projectIndexOf = (slug) => join(projectDirOf(slug), 'MEMORY.md');
  const projectEntryOf = (slug, id) => join(projectDirOf(slug), `${id}.md`);
  /** 角色目录（目录名 = 角色 id） */
  const personaDirOf = (dir) => join(root, dir);
  /** 角色卡固定文件名 */
  const agentFileOf = (dir) => join(personaDirOf(dir), AGENT_FILE);

  /** 只删空目录（非空会抛，直接忽略：里面还有别的东西就说明不该动它） */
  async function rmdirIfEmpty(dir) {
    try {
      await rmdir(dir);
    } catch {
      /* 不存在或不空：都不删 */
    }
  }

  // ---------- 角色卡（一个角色一个目录） ----------
  //
  // 布局照旧插件：<root>/<dir>/agent.md，目录名就是角色 id，
  // activeId 存在 state/personas.json。为什么用「目录」而不是「单文件」：
  // 一个角色后面还会挂头像、形象图、会话状态、每角色独立的记忆，
  // 目录是唯一能把这些东西放在一起又不打架的结构。

  /** 现有角色目录名（同步版：注入段每轮都要问一次，不能 await） */
  function listPersonaIdsSync() {
    try {
      return readdirSync(root, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
        .filter((name) => {
          if (isReservedPersonaDir(name)) return false;
          try {
            return statSync(join(root, name, AGENT_FILE)).isFile();
          } catch {
            return false;
          }
        });
    } catch {
      return [];
    }
  }

  /** 现有角色目录名（异步版） */
  async function listPersonaIds() {
    let entries = [];
    try {
      entries = (await readdir(root, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name);
    } catch {
      return [];
    }
    const ids = [];
    for (const name of entries) {
      if (isReservedPersonaDir(name)) continue;
      if ((await fileStat(join(root, name, AGENT_FILE))).exists) ids.push(name);
    }
    return ids;
  }

  /** 读 state/personas.json；坏文件/缺失都返回 {activeId:null}（不让一个坏 JSON 弄死所有卡） */
  async function readPersonaIndex() {
    return parsePersonaIndex(await readText(paths.personaIndex));
  }

  /** 同步读 state/personas.json（注入路径用，走 mtime 缓存） */
  function readPersonaIndexSync() {
    return parsePersonaIndex(readTextSyncCached(paths.personaIndex));
  }

  /** 写 state/personas.json（原子写） */
  async function writePersonaIndex(index) {
    const activeId = index?.activeId ? String(index.activeId) : null;
    await ensureDir(paths.state);
    await writeTextAtomic(paths.personaIndex, `${JSON.stringify({ activeId }, null, 2)}\n`);
    invalidateSyncCache(paths.personaIndex);
  }

  /**
   * 卡排序：created 升序，同一时刻再按目录名。
   * 「排序第一张」是 activeId 失效时的兜底卡，顺序必须稳定，否则注入内容会跳。
   * @param {string[]} ids
   * @returns {Promise<string[]>}
   */
  async function orderedPersonaIds(ids) {
    const rows = [];
    for (const id of ids) {
      const card = parsePersonaCard(await readText(agentFileOf(id)), id);
      rows.push({ id, created: card.created });
    }
    rows.sort((a, b) => a.created - b.created || a.id.localeCompare(b.id));
    return rows.map((r) => r.id);
  }

  /** 同步版排序（读 frontmatter 走 mtime 缓存，卡通常只有几张） */
  function orderedPersonaIdsSync(ids) {
    const rows = ids.map((id) => ({ id, created: parsePersonaCard(readTextSyncCached(agentFileOf(id)), id).created }));
    rows.sort((a, b) => a.created - b.created || a.id.localeCompare(b.id));
    return rows.map((r) => r.id);
  }

  /**
   * 解析出真正生效的 activeId。
   * activeId 指向的目录被手删了、或 state/personas.json 丢了 —— 都回落到排序第一张，
   * 并把自愈结果写回磁盘（只有异步路径写；同步注入路径只算不写）。
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
   * 一张卡的对外形状（面板要 path/display 才能显示位置）。
   *
   * display 刻意写成 `~\<dir>\agent.md` 而不是完整绝对路径：
   * 原插件列表里就是这么显示的（`~\baby\agent.md`），路径只用来区分是哪张卡，
   * 数据根目录那么长一段对用户没有信息量。真实绝对路径仍然在 path 里给到。
   */
  function cardView(card) {
    const file = agentFileOf(card.id);
    return { ...card, path: file, display: `~\\${card.id}\\agent.md` };
  }

  /**
   * 列出全部角色卡（含正文，界面要显示）。
   * @returns {Promise<{items:Array<{id:string,name:string,body:string,created:number,updated:number,path:string,display:string}>, activeId:string|null}>}
   */
  async function listPersonas() {
    const ids = await orderedPersonaIds(await listPersonaIds());
    const items = [];
    for (const id of ids) {
      const text = await readText(agentFileOf(id));
      if (text === null) continue;
      items.push(cardView(parsePersonaCard(text, id)));
    }
    const activeId = await resolveActivePersonaId(items.map((i) => i.id));
    return { items, activeId: activeId ?? items[0]?.id ?? null };
  }

  /**
   * 读当前生效的角色卡；一张都没有时返回默认空卡。
   * @returns {Promise<object>}
   */
  async function readActivePersona() {
    const { items, activeId } = await listPersonas();
    const card = items.find((i) => i.id === activeId) ?? items[0];
    if (card) return card;
    return cardView({
      id: '',
      name: DEFAULT_PERSONA_NAME,
      body: `我是 ${DEFAULT_PERSONA_NAME}。`,
      created: 0,
      updated: 0,
    });
  }

  /**
   * 同步读当前生效的角色卡（注入段用）。
   * 迁移还没跑完（一张目录卡都没有）时回落到旧的单文件 persona.md，
   * 这样插件一启动就有内容可注入，不必等异步迁移。
   * @returns {object}
   */
  function readActivePersonaSync() {
    const ids = listPersonaIdsSync();
    if (ids.length) {
      const index = readPersonaIndexSync();
      const ordered = orderedPersonaIdsSync(ids);
      const activeId = index.activeId && ids.includes(index.activeId) ? index.activeId : ordered[0];
      const text = readTextSyncCached(agentFileOf(activeId));
      if (text !== null) return cardView(parsePersonaCard(text, activeId));
    }
    const legacy = parsePersona(readTextSyncCached(paths.persona));
    return {
      id: '',
      name: legacy.name,
      body: legacy.body,
      created: legacy.updated,
      updated: legacy.updated,
      path: paths.persona,
      display: displayPathOf(paths.persona),
    };
  }

  /**
   * 新建一个角色目录 + agent.md。
   *
   * dir 就是目录名（= 角色 id），跟显示名无关：显示名随时能改，目录名永不改 ——
   * 目录一旦定下来，外部引用（面板 URL、命令行、脚本）才稳定。
   * @param {{dir?:string, name?:string, body?:string}} input
   * @returns {Promise<object>} 新建的卡
   */
  async function createPersona({ dir, name, body } = {}) {
    const wanted = String(dir ?? name ?? '').trim();
    const check = validatePersonaDir(wanted);
    if (!check.ok) throw new Error(check.message);
    if ((await fileStat(agentFileOf(wanted))).exists) throw new Error('这个目录已经有了');
    await ensureDir(personaDirOf(wanted));
    const ts = now();
    const displayName = oneLine(name).slice(0, 60) || wanted;
    const card = {
      id: wanted,
      name: displayName,
      created: ts,
      updated: ts,
      body: normalizePersonaBody(body === undefined ? `我是 ${wanted}。` : String(body)),
    };
    await writeTextAtomic(agentFileOf(wanted), serializePersonaCard(card));
    invalidateSyncCache(agentFileOf(wanted));
    // 第一张卡顺带成为默认：否则新用户建完卡还是「没有角色」
    const index = await readPersonaIndex();
    const ids = await listPersonaIds();
    if (!index.activeId || !ids.includes(index.activeId)) await writePersonaIndex({ activeId: card.id });
    return cardView(card);
  }

  /**
   * 保存某张卡（原子写）。id（= 目录名）不可变 —— 改名只改 frontmatter 的 name。
   * @param {string} id
   * @param {{name?:string, body?:string}} input
   * @returns {Promise<object>}
   */
  async function savePersonaCard(id, { name, body } = {}) {
    const key = String(id ?? '').trim();
    if (!key) throw new Error('缺少角色卡 id');
    if (!validatePersonaDir(key).ok) throw new Error('这个目录名不合法');
    const file = agentFileOf(key);
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
    return cardView(next);
  }

  /**
   * 重新从磁盘读一张卡（用户在编辑器里手改过 agent.md，点一下刷新）。
   * 必须主动失效 mtime 缓存：同一秒内改两次时 mtime 可能不变，
   * 不失效就会「点了刷新还是旧内容」——这种静默不动最容易被当成坏掉。
   * @param {string} id
   * @returns {Promise<object>}
   */
  async function reloadPersona(id) {
    const key = String(id ?? '').trim();
    const file = agentFileOf(key);
    invalidateSyncCache(file);
    const text = await readText(file);
    if (text === null) throw new Error(`找不到角色卡 ${key}`);
    return cardView(parsePersonaCard(text, key));
  }

  /**
   * 重命名角色目录：`<root>/<id>/` → `<root>/<dir>/`。
   *
   * 用 fs.rename 搬**整个目录**而不是只搬 agent.md —— 角色目录里还可能有人自己放的头像、
   * 形象图、笔记，这些必须跟着走，否则「改个文件夹名」就悄悄把别人的素材弄丢了。
   *
   * 三步都不可省：搬目录 → 失效两边的 mtime 缓存（旧路径的缓存不清，注入可能还读旧内容）
   * → activeId 跟着改（否则下一次组装会因为 activeId 指向不存在的目录而回落到别的卡）。
   *
   * 错误带 .status，路由直接拿来定 HTTP 码，不用靠匹配字符串。
   * @param {string} id 当前目录名
   * @param {string} nextDir 新目录名
   * @returns {Promise<object>} 重命名后的卡
   */
  async function renamePersona(id, nextDir) {
    const from = String(id ?? '').trim();
    const to = String(nextDir ?? '').trim();
    if (!from) throw statusError(400, '缺少角色目录名');
    const check = validatePersonaDir(to);
    if (!check.ok) throw statusError(400, check.message);

    const ids = await listPersonaIds();
    if (!ids.includes(from)) throw statusError(404, `找不到角色卡 ${from}`);

    // 名字没变：幂等返回，不报错也不动磁盘（界面上手滑点两次不该失败）
    if (to === from) {
      const text = await readText(agentFileOf(from));
      if (text === null) throw statusError(404, `找不到角色卡 ${from}`);
      return cardView(parsePersonaCard(text, from));
    }

    // 目标已存在就拒绝：包含「有 agent.md 的卡」和「空目录/别的目录」两种情况 ——
    // 直接 rename 到已存在的目录，在 Windows 上会失败、在 POSIX 上可能覆盖空目录，
    // 行为不一致，所以统一由我们先挡住，文案对用户也更清楚。
    if ((await fileStat(personaDirOf(to))).exists) throw statusError(400, '这个目录已经有了');

    await rename(personaDirOf(from), personaDirOf(to));
    invalidateSyncCache(agentFileOf(from));
    invalidateSyncCache(agentFileOf(to));

    const index = await readPersonaIndex();
    if (index.activeId === from) await writePersonaIndex({ activeId: to });

    const text = await readText(agentFileOf(to));
    if (text === null) throw statusError(500, `目录已改名，但读不到 ${to}/agent.md`);
    return cardView(parsePersonaCard(text, to));
  }

  /**
   * 删除某个角色（整个目录）。只剩一张时拒绝 —— 注入总得有个角色。
   * 删掉的如果是 active，activeId 改成剩下排序第一张。
   * @param {string} id
   * @returns {Promise<{removed:string, activeId:string}>}
   */
  async function deletePersona(id) {
    const key = String(id ?? '').trim();
    const ids = await listPersonaIds();
    if (!ids.includes(key)) throw new Error(`找不到角色卡 ${key}`);
    if (ids.length <= 1) throw new Error('至少保留一张角色卡');
    await rm(personaDirOf(key), { recursive: true, force: true });
    invalidateSyncCache(agentFileOf(key));
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
   * 迁移：把三种历史布局收敛到「一角色一目录」。
   *
   * 顺序与理由：
   *   1. personas/<id>.md（上一版「一卡一文件」）→ 复制成 <id>/agent.md，然后把空的 personas/ 删掉。
   *      先做这一步，因为它是最近的布局，数据最可能都在这里。
   *   2. 更早的单文件 persona.md → 只在「一张目录卡都没有」时转成目录卡，
   *      否则会把用户早就删掉的旧角色又复活出来。
   *   3. 已经有 <dir>/agent.md 的，什么都不做（幂等，重复启动不会生出第二份）。
   *
   * 旧文件一律**保留不删**（只有 personas/ 这个空目录会被删），删了不可逆而它只有几 KB。
   * @returns {Promise<{migrated:boolean, ids:string[], fromLegacyFiles:string[], fromLegacySingle:boolean}>}
   */
  async function migratePersona() {
    const fromLegacyFiles = [];

    // ---- 1) personas/<id>.md → <id>/agent.md ----
    let legacyNames = [];
    try {
      legacyNames = (await readdir(paths.personas, { withFileTypes: true }))
        .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.md'))
        .map((e) => e.name.replace(/\.md$/i, ''))
        .filter(Boolean);
    } catch {
      legacyNames = [];
    }
    for (const rawId of legacyNames) {
      const dirName = validatePersonaDir(rawId).ok ? rawId : defaultPersonaDir(rawId);
      const target = agentFileOf(dirName);
      if ((await fileStat(target)).exists) continue; // 已经有目录卡了，绝不覆盖
      const text = await readText(join(paths.personas, `${rawId}.md`));
      if (text === null) continue;
      const parsed = parsePersonaCard(text, dirName);
      const stamp = parsed.created || now();
      const card = {
        id: dirName,
        name: parsed.name,
        created: stamp,
        updated: parsed.updated || stamp,
        body: normalizePersonaBody(parsed.body) || `我是 ${parsed.name}。`,
      };
      await ensureDir(personaDirOf(dirName));
      await writeTextAtomic(target, serializePersonaCard(card));
      invalidateSyncCache(target);
      fromLegacyFiles.push(dirName);
    }
    // 旧目录搬空了就删掉（rmdir 只删空目录，非空说明旧 md 还在/还有别的东西，留着）。
    // 无条件试一次：即使这次没有待搬的 md，上次遗留下来的空目录也该顺手清掉。
    await rmdirIfEmpty(paths.personas);

    // 旧的 <root>/personas.json（activeId）→ state/personas.json
    if ((await readText(paths.personaIndex)) === null) {
      const legacyIndex = parsePersonaIndex(await readText(paths.personaIndexLegacy));
      if (legacyIndex.activeId) {
        const ids = await listPersonaIds();
        if (ids.includes(legacyIndex.activeId)) await writePersonaIndex({ activeId: legacyIndex.activeId });
      }
    }

    // ---- 2) 单文件 persona.md → 目录卡（仅当一张目录卡都没有） ----
    let fromLegacySingle = false;
    let ids = await listPersonaIds();
    if (!ids.length) {
      const legacyText = await readText(paths.persona);
      if (legacyText !== null) {
        const legacy = parsePersona(legacyText);
        const dirName = uniquePersonaDir(defaultPersonaDir(legacy.name), ids);
        const stamp = legacy.updated || now();
        const card = {
          id: dirName,
          name: legacy.name,
          created: stamp,
          updated: stamp,
          body: normalizePersonaBody(legacy.body) || `我是 ${legacy.name}。`,
        };
        await ensureDir(personaDirOf(dirName));
        await writeTextAtomic(agentFileOf(dirName), serializePersonaCard(card));
        invalidateSyncCache(agentFileOf(dirName));
        fromLegacySingle = true;
        ids = [dirName];
      }
    }

    // ---- 3) 收敛 activeId（已有的卡只修索引） ----
    if (ids.length) await resolveActivePersonaId(ids, { persist: true });

    return {
      migrated: fromLegacyFiles.length > 0 || fromLegacySingle,
      ids,
      fromLegacyFiles,
      fromLegacySingle,
    };
  }

  /**
   * 保证至少有一个角色目录：先迁移，迁移不出卡就建一个默认的。
   * 插件启动时调一次（失败只 warn，不拦插件）。
   * @param {{name?:string}} options
   * @returns {Promise<{created:boolean, id:string|null}>}
   */
  async function ensurePersonas({ name } = {}) {
    const migrated = await migratePersona();
    if (migrated.ids.length) {
      return { created: false, id: await resolveActivePersonaId(migrated.ids) };
    }
    const dirName = defaultPersonaDir(name || DEFAULT_PERSONA_NAME);
    const card = await createPersona({ dir: dirName, name: name || DEFAULT_PERSONA_NAME });
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
   * 保存当前生效的卡（旧 API）。一张卡都没有时自动建一个再写。
   * @param {{name?:string, body?:string}} input
   * @returns {Promise<{name:string, body:string, updated:number}>}
   */
  async function savePersona({ name, body } = {}) {
    const { items, activeId } = await listPersonas();
    const target = items.find((i) => i.id === activeId) ?? items[0];
    if (!target) {
      const created = await createPersona({ dir: defaultPersonaDir(name || DEFAULT_PERSONA_NAME), name, body });
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
    personaDirOf,
    agentFileOf,
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
    reloadPersona,
    renamePersona,
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
