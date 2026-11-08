// 存储层 · 全局提示词 + 角色卡 + 每角色长期记忆
//
//   <root>/AGENT.md              所有角色通用的提示词
//   <root>/<id>/agent.md         角色卡（frontmatter + 正文）
//   <root>/<id>/MEMORY.md        该角色的长期记忆原文
//   <root>/state/personas.json   默认角色
//   <root>/state/sessions.json   会话与角色的绑定
//
// 根 MEMORY.md 和 projects/ 下的旧记忆接口保留兼容，不作为角色长期记忆的数据源。
// 用户文档直接读写 UTF-8 原文；保存检查内容版本，角色操作在同一队列中执行。

import { homedir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import { readFileSync, readdirSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { readdir, rename, rmdir, rm } from 'node:fs/promises';

import {
  ensureDir,
  fileStat,
  readText,
  readTextSync,
  withPathLock,
  writeTextAtomic,
  writeTextAtomicDirect,
} from './atomic.js';
import { projectSlug, safeSegment, detectProject } from './project.js';
import { contentRev, readTextDocument, writeTextDocumentCas } from './text-document.js';

/** 数据目录的固定子目录名（跟包名一致）。用户只选父目录，这一层由插件定。 */
export const DEFAULT_FOLDER_NAME = 'dsh-my-memory';

/** 默认数据根目录：~/.dsh/dsh-my-memory/ */
export function defaultDataDir() {
  return join(homedir(), '.dsh', DEFAULT_FOLDER_NAME);
}

/** 旧版默认数据根（少了 dsh 前缀）：启动时搬到新名字 */
export function legacyDefaultDataDir() {
  return join(homedir(), '.dsh', 'my-memory');
}

/**
 * 把旧默认目录 ~/.dsh/my-memory 搬到 ~/.dsh/dsh-my-memory。
 *
 * 用同步 rename：同一块盘上这只是目录项改名，几毫秒；而插件 apply 是同步的，
 * 「这次到底用哪个根」必须在它之前定下来，所以这里不等 await。
 * 搬不动（跨盘 EXDEV / 被占用 / 没权限）就**保留旧目录继续用**并返回原因 ——
 * 一次搬家失败绝不能让插件起不来。
 * @returns {{migrated:boolean, from:string, to:string, reason?:string}}
 */
export function migrateDefaultDataDir({ file } = {}) {
  const from = legacyDefaultDataDir();
  const to = defaultDataDir();
  if (from === to) return { migrated: false, from, to };
  const isDir = (dir) => {
    try {
      return statSync(dir).isDirectory();
    } catch {
      return false;
    }
  };
  // 新目录已存在 = 之前搬过了（或用户自己建了）；旧目录不在 = 没什么可搬
  if (!isDir(from) || isDir(to)) return { migrated: false, from, to };
  try {
    renameSync(from, to);
  } catch (err) {
    return { migrated: false, from, to, reason: String(err?.code || err?.message || err) };
  }
  // 指针如果指着旧目录，跟着改到新路径；否则下次启动会去读一个已经不存在的目录。
  // 这里**同步**写：紧接着的 resolveDataDir 就要读它，异步写会读到旧值，
  // 结果是「目录已经搬走、根却还指着旧路径」，插件会往一个空位置重新长一份数据。
  try {
    const pointerTarget = file ? expandUserPath(file) : rootPointerFile();
    const pointed = readRootPointerSync(pointerTarget);
    if (pointed && resolve(pointed) === resolve(from)) {
      writeFileSync(pointerTarget, `${JSON.stringify({ dataDir: to }, null, 2)}\n`, 'utf8');
    }
  } catch {
    /* 指针改不动不影响搬家结果 */
  }
  return { migrated: true, from, to };
}

/**
 * 把「用户选的目录」规整成最终数据根：如果它本身不是以固定子目录名结尾，
 * 就当成父目录，自动补一层 dsh-my-memory。
 *
 * 为什么这么设计：用户在系统选择框里挑的是父目录（比如 D:\data），插件的文件
 * 应该固定收在自己的子目录里，别把 agent.md / MEMORY.md 直接铺在用户选的目录上。
 * 空值 = 回到默认根。
 * @param {string} value
 * @returns {string}
 */
export function withFolderName(value) {
  const raw = expandUserPath(value);
  if (!raw) return defaultDataDir();
  const tail = raw.split(/[\\/]+/).filter(Boolean).pop() || '';
  if (tail.toLowerCase() === DEFAULT_FOLDER_NAME) return raw;
  return join(raw, DEFAULT_FOLDER_NAME);
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

/**
 * 虚拟角色卡「空白」的 id，语义是「不使用角色卡」。
 *
 * 它**不对应磁盘目录** —— 所以 personaDirOf() / agentFileOf() 永远不该被它调用。
 * 选中它（全局默认或某个会话绑定）时插件不注入任何提示词：角色卡段、AGENT.md
 * 全局对话要求、记忆段全部消失，用户得到的就是「本插件什么都不加」的干净提示词。
 *
 * 为什么留一张虚拟卡而不是「一张卡都没有」：删光真实卡会让面板/命令无法表达
 * 「我就是要没有角色」，而且注入段会一直回落到第一张卡，没有开关可关。
 */
export const PERSONA_NONE = '__none__';

/** 这张虚拟卡（UI 靠 virtual:true 判断只读；body 恒为空，path 恒为空串） */
export function nonePersonaCard() {
  return {
    id: PERSONA_NONE,
    name: '空白',
    body: '',
    created: 0,
    updated: 0,
    path: '',
    display: '不使用角色卡（不注入任何提示词）',
    virtual: true,
  };
}

/** 这个 id 是不是虚拟的「空白」卡（注入层用它决定整段返回空串） */
export function isPersonaNone(id) {
  return String(id ?? '').trim() === PERSONA_NONE;
}

/**
 * 全局提示词默认值（数据根下 AGENT.md 的初始内容）。
 * 作用于**所有角色**，所以它不属于任何一张角色卡，单独存一个文件。
 */
export const DEFAULT_AGENT_PROMPT =
  '像真人一样自然聊天，使用第一人称直接交流，禁止旁白表达，通过自然语言流露情绪，禁止说自己是 AI';

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
 * 角色文档只去 frontmatter 与固定的一行空白分隔，其余正文逐字保留。
 * 旧项目条目继续使用 splitFrontmatter，避免改变它们的历史解析规则。
 */
function splitPersonaDocument(text) {
  const source = String(text ?? '');
  const opening = /^---\r?\n/.exec(source);
  if (!opening) return { meta: {}, body: source };
  const rest = source.slice(opening[0].length);
  const closing = /^---(?:\r?\n|$)/m.exec(rest);
  if (!closing) return { meta: {}, body: source };
  const meta = {};
  for (const line of rest.slice(0, closing.index).split(/\r?\n/)) {
    const colon = line.indexOf(':');
    if (colon > 0) meta[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }
  const body = rest.slice(closing.index + closing[0].length).replace(/^\r?\n/, '');
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
  const { meta, body } = splitPersonaDocument(text);
  const name = oneLine(meta.name).slice(0, 60) || DEFAULT_PERSONA_NAME;
  return {
    name,
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
  return `${FENCE}\nname: ${name}\nupdated: ${updated}\n${FENCE}\n\n${body}`;
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

/** 正文只转为字符串；换行、缩进和 Markdown 行末双空格均属于用户内容。 */
export function normalizePersonaBody(value) {
  return String(value ?? '');
}

/**
 * 角色目录里的固定文件名。为什么固定叫 agent.md：一个角色后面还会挂头像、
 * 形象图、会话状态，目录里唯一必须存在的锚点就是这个文件，名字不能随人改。
 */
export const AGENT_FILE = 'agent.md';

/**
 * 角色长期记忆的文件名：`<root>/<角色id>/MEMORY.md`。
 * 自由文本（和数据根下的 AGENT.md 一样，用户手改即生效），只属于这个角色。
 * 注意它和数据根下的 `<root>/MEMORY.md`（旧版全局记忆）同名但不同目录，别搞混。
 */
export const PERSONA_MEMORY_FILE = 'MEMORY.md';

/** 目录名的合法字符集：英文/数字/点/下划线/短横线，1~40 位 */
export const PERSONA_DIR_RE = /^[A-Za-z0-9._-]{1,40}$/;

/**
 * 插件自己占用的目录名，不能当角色名。
 * 为什么必须显式排除：列表是「扫根目录找含 agent.md 的文件夹」，
 * 一旦 projects/ 或 state/ 里恰好有个 agent.md，就会被误认成一个角色。
 */
const RESERVED_PERSONA_DIRS = new Set([
  'projects',
  'state',
  'personas',
  'node_modules',
  'tmp',
  '.git',
  // 「空白」是虚拟卡：万一用户在根目录手建了同名文件夹，也不能被当成真实卡混进列表
  PERSONA_NONE,
]);

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
  if (value === '.' || value === '..') return { ok: false, message: '目录名不能是 . 或 ..' };
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

/** 项目局部记忆放在项目自己的 `.dsh/MEMORY.md` 里（跟着仓库走，不再塞进插件数据目录） */
export const PROJECT_MEMORY_DIRNAME = '.dsh';
export const PROJECT_MEMORY_FILENAME = 'MEMORY.md';
/** 新建局部记忆文件时的表头（与全局记忆同一套模板：一个 H1 + 若干 `## 小节`） */
export const PROJECT_MEMORY_HEADER = '# 项目记忆';
/** 闸门关着时的统一错误文案（工具/HTTP/命令共用一份，别各写各的） */
export const PROJECT_MEMORY_DISABLED = '当前目录的局部记忆开关是关的，先打开再记';

/**
 * cwd 的规范化形式，用作状态表 key。
 * Windows 上 `D:\a\b` 与 `d:/a/b` 是同一个目录，不归一化就会一个目录两条开关记录。
 * @param {string} cwd
 * @returns {string}
 */
export function normalizeProjectCwd(cwd) {
  let p = resolve(String(cwd ?? '').trim() || '.').replace(/\\/g, '/');
  if (process.platform === 'win32') p = p.toLowerCase();
  return p.replace(/\/+$/, '');
}

/**
 * 解析会话绑定表（`{ "<sessionId>": { personaId, boundAt } }`）。
 * 坏 JSON / 坏条目一律忽略（手改坏一行不该让所有会话都失忆）。
 * @param {string|null} text
 * @returns {Record<string, {personaId:string, boundAt:number}>}
 */
export function parseSessionBindings(text) {
  if (!text) return {};
  try {
    const value = JSON.parse(text);
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    const out = {};
    for (const [key, entry] of Object.entries(value)) {
      if (!key || !entry || typeof entry !== 'object') continue;
      const personaId = typeof entry.personaId === 'string' ? entry.personaId.trim() : '';
      if (!personaId) continue;
      out[key] = { personaId, boundAt: Number(entry.boundAt) || 0 };
    }
    return out;
  } catch {
    return {};
  }
}

/**
 * 解析局部记忆开关表（`{ "<normalizedCwd>": { enabled, updatedAt } }`）。
 * @param {string|null} text
 * @returns {Record<string, {enabled:boolean, updatedAt:number}>}
 */
export function parseProjectStateMap(text) {
  if (!text) return {};
  try {
    const value = JSON.parse(text);
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    const out = {};
    for (const [key, entry] of Object.entries(value)) {
      if (!key || !entry || typeof entry !== 'object') continue;
      if (typeof entry.enabled !== 'boolean') continue;
      out[key] = { enabled: entry.enabled, updatedAt: Number(entry.updatedAt) || 0 };
    }
    return out;
  } catch {
    return {};
  }
}

/**
 * 内容版本号：sha1(内容) 前 12 位。
 *
 * 为什么用内容哈希而不是 mtime：mtime 的分辨率、文件系统缓存、「同一毫秒改两次」
 * 都会骗人。内容哈希只回答一个问题——磁盘上这份和客户端基于的那份是不是同一份，
 * 而这正好是冲突检测需要的全部信息。
 * @param {string} text
 * @returns {string}
 */
export { contentRev };

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
  const { meta, body } = splitPersonaDocument(text);
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
  const body = String(card?.body ?? '');
  return `${FENCE}\nname: ${name}\ncreated: ${created}\nupdated: ${updated}\n${FENCE}\n\n${body}`;
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
  // 保存、改名和删除共用数据根队列，检查身份后到写完之前不能被另一个角色操作打断。
  const withPersonaLock = (task) => withPathLock(root, task);

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
    /**
     * 全局提示词（所有角色通用），和 MEMORY.md 同级；内容就是提示词本体，
     * 不加 frontmatter/标题 —— 用户看到什么就注入什么。
     * 注意别和角色目录里的 <root>/<角色目录名>/agent.md 搞混：不同目录、大小写也不同。
     */
    prompt: join(root, 'AGENT.md'),
    projects: join(root, 'projects'),
  };
  const projectDirOf = (slug) => join(paths.projects, slug);
  const projectIndexOf = (slug) => join(projectDirOf(slug), 'MEMORY.md');
  const projectEntryOf = (slug, id) => join(projectDirOf(slug), `${id}.md`);
  /** 角色目录（目录名 = 角色 id） */
  const personaDirOf = (dir) => join(root, dir);
  /** 角色卡固定文件名 */
  const agentFileOf = (dir) => join(personaDirOf(dir), AGENT_FILE);
  /** 角色长期记忆文件（自由文本，缺失 = 空；不自动创建） */
  const personaMemoryFileOf = (dir) => join(personaDirOf(dir), PERSONA_MEMORY_FILE);

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
          if (!validatePersonaDir(name).ok) return false;
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
      if (!validatePersonaDir(name).ok) continue;
      if ((await fileStat(join(root, name, AGENT_FILE))).exists) ids.push(name);
    }
    return ids;
  }

  /** 读 state/personas.json；坏文件/缺失都返回 {activeId:null}（不让一个坏 JSON 弄死所有卡） */
  async function readPersonaIndex() {
    return parsePersonaIndex(await readText(paths.personaIndex));
  }

  /** 同步读取默认角色状态，外部修改下一轮即可生效。 */
  function readPersonaIndexSync() {
    return parsePersonaIndex(readTextSync(paths.personaIndex));
  }

  /** 写 state/personas.json（原子写） */
  async function writePersonaIndex(index) {
    const activeId = index?.activeId ? String(index.activeId) : null;
    await ensureDir(paths.state);
    await writeTextAtomic(paths.personaIndex, `${JSON.stringify({ activeId }, null, 2)}\n`);
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

  /** 同步版排序，按磁盘角色卡的创建时间稳定排列。 */
  function orderedPersonaIdsSync(ids) {
    const rows = ids.map((id) => ({ id, created: parsePersonaCard(readTextSync(agentFileOf(id)), id).created }));
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
    const index = await readPersonaIndex();
    // 「空白」是虚拟卡、磁盘上没有目录，不受 ids 约束，必须单独放行
    if (isPersonaNone(index.activeId)) return PERSONA_NONE;
    if (!ids.length) return null;
    if (index.activeId && ids.includes(index.activeId)) return index.activeId;
    const ordered = await orderedPersonaIds(ids);
    const fallback = ordered[0] ?? null;
    if (persist && fallback && index.activeId !== fallback) {
      await writePersonaIndex({ activeId: fallback });
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
  function cardView(card, source = '') {
    const file = agentFileOf(card.id);
    return { ...card, path: file, display: `~\\${card.id}\\agent.md`, rev: contentRev(source) };
  }

  /**
   * 列出全部角色卡（含正文，界面要显示）。
   * items 第一项恒为虚拟卡「空白」（它不参与 orderedPersonaIds 排序，也不进磁盘目录列表）。
   * @returns {Promise<{items:Array<{id:string,name:string,body:string,created:number,updated:number,path:string,display:string,virtual?:boolean}>, activeId:string|null}>}
   */
  async function listPersonas() {
    return withPersonaLock(async () => {
      const ids = await orderedPersonaIds(await listPersonaIds());
      const real = [];
      for (const id of ids) {
        const text = await readText(agentFileOf(id));
        if (text === null) continue;
        real.push(cardView(parsePersonaCard(text, id), text));
      }
      const activeId = await resolveActivePersonaId(real.map((i) => i.id));
      return {
        items: [nonePersonaCard(), ...real],
        activeId: activeId ?? real[0]?.id ?? null,
      };
    });
  }

  /**
   * 读当前生效的角色卡；一张都没有时返回默认空卡。
   * activeId 是「空白」时返回那张虚拟卡 —— 不能回落到第一张真实卡，否则开关就失效了。
   * @returns {Promise<object>}
   */
  async function readActivePersona() {
    const { items, activeId } = await listPersonas();
    if (isPersonaNone(activeId)) return nonePersonaCard();
    // items[0] 一直是虚拟卡，找「真实卡」时要排除它
    const real = items.filter((i) => !i.virtual);
    const card = real.find((i) => i.id === activeId) ?? real[0];
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
   * 注意「空白」的判断要排在最前面：它是用户显式关掉提示词的开关，不能回落到任何真实卡。
   * @returns {object}
   */
  function readActivePersonaSync() {
    const index = readPersonaIndexSync();
    if (isPersonaNone(index.activeId)) return nonePersonaCard();
    const ids = listPersonaIdsSync();
    if (ids.length) {
      const ordered = orderedPersonaIdsSync(ids);
      const activeId = index.activeId && ids.includes(index.activeId) ? index.activeId : ordered[0];
      const text = readTextSync(agentFileOf(activeId));
      if (text !== null) return cardView(parsePersonaCard(text, activeId), text);
    }
    const legacy = parsePersona(readTextSync(paths.persona));
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

  /** 新建角色目录和角色卡；已存在的卡不会被并发创建覆盖。 */
  async function createPersona(input = {}) {
    return withPersonaLock(() => createPersonaUnlocked(input));
  }

  /** 调用者已持有数据根队列。 */
  async function createPersonaUnlocked({ dir, name, body } = {}) {
    const wanted = String(dir ?? name ?? '').trim();
    const check = validatePersonaDir(wanted);
    if (!check.ok) throw statusError(400, check.message);
    if ((await fileStat(agentFileOf(wanted))).exists) throw statusError(400, '这个目录已经有了');
    await ensureDir(personaDirOf(wanted));
    const ts = now();
    const displayName = oneLine(name).slice(0, 60) || wanted;
    const card = {
      id: wanted,
      name: displayName,
      created: ts,
      updated: ts,
      body: normalizePersonaBody(body === undefined ? `我是 ${displayName}。` : String(body)),
    };
    const text = serializePersonaCard(card);
    await writeTextAtomic(agentFileOf(wanted), text);
    const index = await readPersonaIndex();
    const ids = await listPersonaIds();
    if (!isPersonaNone(index.activeId) && (!index.activeId || !ids.includes(index.activeId))) {
      await writePersonaIndex({ activeId: card.id });
    }
    return cardView(card, text);
  }

  /** 保存角色卡字段；兼容不传版本的旧调用。 */
  async function savePersonaCard(id, { name, body } = {}) {
    const saved = await savePersonaCardCas(id, { name, body, force: true });
    return cardView(parsePersonaCard(saved.text, saved.id), saved.text);
  }

  /**
   * 按读取时的原文版本保存角色卡；冲突时返回当前卡，强制覆盖也会检查目标路径。
   * @param {string} id
   * @param {{name?:string,body?:string,baseRev?:string,force?:boolean,expectedPath?:string}} input
   * @returns {Promise<object>} 新角色卡或带 conflict 的磁盘角色卡。
   */
  async function savePersonaCardCas(id, input = {}) {
    return withPersonaLock(async () => {
      const key = requirePersonaId(id);
      const saved = await writeTextDocumentCas(agentFileOf(key), {
        baseRev: input.baseRev,
        force: input.force,
        expectedPath: input.expectedPath,
        requireExisting: true,
        missingMessage: `找不到角色卡 ${key}`,
        createParent: false,
        update: ({ text }) => {
          const current = parsePersonaCard(text, key);
          return serializePersonaCard({
            id: key,
            name: oneLine(input.name).slice(0, 60) || current.name,
            created: current.created || now(),
            updated: now(),
            body: input.body === undefined ? current.body : normalizePersonaBody(input.body),
          });
        },
      });
      return { ...saved, ...cardView(parsePersonaCard(saved.text, key), saved.text) };
    });
  }

  /** 重新读取指定角色卡；非法身份不能用来拼接磁盘路径。 */
  async function reloadPersona(id) {
    return withPersonaLock(async () => {
      const key = requirePersonaId(id);
      const text = await readText(agentFileOf(key));
      if (text === null) throw statusError(404, `找不到角色卡 ${key}`);
      return cardView(parsePersonaCard(text, key), text);
    });
  }

  /**
   * 整个角色目录一起改名，并同步默认角色与会话绑定；长期记忆和其它素材一起移动。
   * @param {string} id 当前目录名
   * @param {string} nextDir 新目录名
   * @returns {Promise<object>} 重命名后的角色卡。
   */
  async function renamePersona(id, nextDir) {
    return withPersonaLock(async () => {
      const from = requirePersonaId(id);
      const to = requirePersonaId(nextDir);
      const ids = await listPersonaIds();
      if (!ids.includes(from)) throw statusError(404, `找不到角色卡 ${from}`);
      if (to === from) {
        const text = await readText(agentFileOf(from));
        if (text === null) throw statusError(404, `找不到角色卡 ${from}`);
        return cardView(parsePersonaCard(text, from), text);
      }
      if ((await fileStat(personaDirOf(to))).exists) throw statusError(400, '这个目录已经有了');

      const index = await readPersonaIndex();
      const bindings = await readSessionBindings();
      await rename(personaDirOf(from), personaDirOf(to));
      if (index.activeId === from) await writePersonaIndex({ activeId: to });
      let changed = false;
      for (const binding of Object.values(bindings)) {
        if (binding.personaId !== from) continue;
        binding.personaId = to;
        changed = true;
      }
      if (changed) await writeSessionBindings(bindings);
      const text = await readText(agentFileOf(to));
      if (text === null) throw statusError(500, `目录已改名，但读不到 ${to}/agent.md`);
      return cardView(parsePersonaCard(text, to), text);
    });
  }

  /** 删除整个角色目录并清理它的绑定；最后一张真实卡和显式空白默认都保留。 */
  async function deletePersona(id) {
    return withPersonaLock(async () => {
      const key = requirePersonaId(id);
      const ids = await listPersonaIds();
      if (!ids.includes(key)) throw statusError(404, `找不到角色卡 ${key}`);
      if (ids.length <= 1) throw statusError(400, '至少保留一张角色卡');
      const index = await readPersonaIndex();
      const bindings = await readSessionBindings();
      await rm(personaDirOf(key), { recursive: true, force: true });
      const remaining = await orderedPersonaIds(ids.filter((x) => x !== key));
      let activeId = index.activeId;
      if (!isPersonaNone(activeId) && (!activeId || !remaining.includes(activeId))) activeId = remaining[0];
      await writePersonaIndex({ activeId });
      let changed = false;
      for (const [sessionId, binding] of Object.entries(bindings)) {
        if (binding.personaId !== key) continue;
        delete bindings[sessionId];
        changed = true;
      }
      if (changed) await writeSessionBindings(bindings);
      return { removed: key, activeId };
    });
  }

  /** 设置默认角色；空白卡是合法的明确选择。 */
  async function setActivePersona(id) {
    return withPersonaLock(async () => {
      const raw = String(id ?? '').trim();
      const key = isPersonaNone(raw) ? PERSONA_NONE : requirePersonaId(raw);
      if (!isPersonaNone(key) && !(await listPersonaIds()).includes(key)) {
        throw statusError(404, `找不到角色卡 ${key}`);
      }
      await writePersonaIndex({ activeId: key });
      return { activeId: key };
    });
  }

  // ---------- 每角色长期记忆（<root>/<id>/MEMORY.md） ----------

  /** 需要真实磁盘角色的公共操作统一从这里校验身份。 */
  function requirePersonaId(id) {
    const key = String(id ?? '').trim();
    if (!key) throw statusError(400, '缺少角色 id');
    if (isPersonaNone(key)) throw statusError(400, '空白卡不是磁盘上的角色卡');
    const check = validatePersonaDir(key);
    if (!check.ok) throw statusError(400, check.message);
    return key;
  }

  /** 同步注入与兼容读接口遇到非法身份时返回空，不访问其它目录。 */
  function safePersonaId(id) {
    const key = String(id ?? '').trim();
    return !isPersonaNone(key) && validatePersonaDir(key).ok ? key : '';
  }

  /** 必须在角色队列内校验，防止检查通过后角色被改名或删除。 */
  async function assertMemoryPersona(id) {
    if (isPersonaNone(id)) throw statusError(400, '空白卡没有长期记忆');
    const key = requirePersonaId(id);
    if ((await readText(agentFileOf(key))) === null) throw statusError(404, `找不到角色卡 ${key}`);
    return key;
  }

  /** 读取角色长期记忆原文及其版本；缺失为空且不创建文件。 */
  async function readPersonaMemory(id) {
    return withPersonaLock(async () => {
      const key = safePersonaId(id);
      if (!key) return { path: '', text: '', exists: false, rev: contentRev('') };
      return readTextDocument(personaMemoryFileOf(key));
    });
  }

  /** 整份保存长期记忆，保留不传版本的旧调用。 */
  async function writePersonaMemory(id, text) {
    const saved = await writePersonaMemoryCas({ personaId: id, text, force: true });
    return { path: saved.path, text: saved.text, rev: saved.rev };
  }

  /**
   * 按版本保存指定角色的长期记忆；只改这一份原文。
   * @param {{personaId?:string,text?:string,baseRev?:string,force?:boolean,expectedPath?:string}} input
   * @returns {Promise<object>} 新文档或带 conflict 的磁盘文档。
   */
  async function writePersonaMemoryCas({ personaId, text, baseRev, force, expectedPath } = {}) {
    return withPersonaLock(async () => {
      const key = await assertMemoryPersona(personaId);
      const saved = await writeTextDocumentCas(personaMemoryFileOf(key), {
        text, baseRev, force, expectedPath, createParent: false,
      });
      return { ...saved, personaId: key };
    });
  }

  /**
   * 给当前角色追加一条普通 Markdown 列表项；已有原文不重排、不改写。
   * @param {string} id 角色目录名
   * @param {string} text 需要记住的内容
   * @returns {Promise<{path:string,text:string,rev:string,personaId:string}>}
   */
  async function appendPersonaMemory(id, text) {
    return withPersonaLock(async () => {
      const key = await assertMemoryPersona(id);
      const content = oneLine(text);
      if (!content) throw statusError(400, '记忆正文不能为空');
      const saved = await writeTextDocumentCas(personaMemoryFileOf(key), {
        createParent: false,
        update: ({ text: current }) => current + (current && !current.endsWith('\n') ? '\n' : '') + `- ${content}\n`,
      });
      return { ...saved, personaId: key };
    });
  }

  /** 同步读取角色长期记忆原文，外部编辑下一轮即可生效。 */
  function personaMemoryTextSync(id) {
    const key = safePersonaId(id);
    if (!key) return '';
    return readTextSync(personaMemoryFileOf(key)) ?? '';
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
    return withPersonaLock(() => migratePersonaUnlocked());
  }

  /** 调用者已持有角色队列；只迁移角色卡布局，不分配旧全局记忆。 */
  async function migratePersonaUnlocked() {
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
    return withPersonaLock(async () => {
      const migrated = await migratePersonaUnlocked();
      if (migrated.ids.length) {
        return { created: false, id: await resolveActivePersonaId(migrated.ids) };
      }
      const dirName = defaultPersonaDir(name || DEFAULT_PERSONA_NAME);
      const card = await createPersonaUnlocked({ dir: dirName, name: name || DEFAULT_PERSONA_NAME });
      return { created: true, id: card.id };
    });
  }

  // ---------- 全局提示词（数据根下 AGENT.md，作用于所有角色） ----------

  /**
   * 确保提示词文件存在：没有就用默认值原子创建，**已存在绝不覆盖**。
   * why：这个文件是给用户直接手改的，启动、切数据根都不能把用户写过的东西冲掉。
   * @returns {Promise<{created:boolean, path:string}>}
   */
  async function ensureAgentPromptFile() {
    if ((await readText(paths.prompt)) !== null) return { created: false, path: paths.prompt };
    await ensureDir(root);
    let created = false;
    await withPathLock(paths.prompt, async () => {
      // 抢锁后再确认一次：并发启动时别两边都写
      if ((await readText(paths.prompt)) !== null) return;
      await writeTextAtomicDirect(paths.prompt, `${DEFAULT_AGENT_PROMPT}\n`);
      created = true;
    });
    return { created, path: paths.prompt };
  }

  /** 同步读取全局提示词原文；缺失用默认值，明确清空则保留空串。 */
  function agentPromptTextSync() {
    const text = readTextSync(paths.prompt);
    return text === null ? DEFAULT_AGENT_PROMPT : text;
  }

  /** 读取全局提示词与磁盘版本；缺失时只在展示正文中使用默认值。 */
  async function readAgentPrompt() {
    const current = await readTextDocument(paths.prompt);
    return { ...current, text: current.exists ? current.text : DEFAULT_AGENT_PROMPT };
  }

  /** 整份保存全局提示词，兼容不传版本的旧调用。 */
  async function writeAgentPrompt(text) {
    const saved = await writeAgentPromptCas({ text, force: true });
    return { path: saved.path, text: saved.text, rev: saved.rev };
  }

  /**
   * 按版本保存全局提示词，强制保存也不能写到另一数据根。
   * @param {{text?:string,baseRev?:string,force?:boolean,expectedPath?:string}} input
   * @returns {Promise<object>} 新文档或带 conflict 的磁盘文档。
   */
  async function writeAgentPromptCas({ text, baseRev, force, expectedPath } = {}) {
    return writeTextDocumentCas(paths.prompt, { text, baseRev, force, expectedPath });
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
    // 当前默认是「空白」时没有「active 那张卡」可写：明确拒绝，而不是悄悄改到别的卡上
    if (isPersonaNone(activeId)) {
      throw statusError(400, '当前默认是空白卡（不注入任何提示词），先切换到一张真实角色卡再编辑');
    }
    // items 第一项恒为虚拟卡，真实卡要排除它
    const real = items.filter((i) => !i.virtual);
    const target = real.find((i) => i.id === activeId) ?? real[0];
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
    return readTextSync(paths.global) ?? '';
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
    // 读-改-写整体排在 MEMORY.md 的写队列里：否则并发的 append 与「面板整份保存」
    // 会各自读到同一份旧内容，后写的把先写的那条条目吞掉。
    await withPathLock(paths.global, async () => {
      const current = (await readText(paths.global)) ?? `${GLOBAL_HEADER}\n`;
      await writeTextAtomicDirect(paths.global, insertGlobalLine(current, sec, line));
    });
    return { id, scope: 'global', text: content, section: sec, date, tags: tagList, path: paths.global };
  }

  /**
   * 按 id 删除一条全局记忆。
   * @param {string} id
   * @returns {Promise<{removed:boolean, path:string}>}
   */
  async function forgetGlobal(id) {
    return withPathLock(paths.global, async () => {
      const current = await readText(paths.global);
      if (current === null) return { removed: false, path: paths.global };
      const { text, removed } = removeGlobalLine(current, id);
      if (!removed) return { removed: false, path: paths.global };
      await writeTextAtomicDirect(paths.global, text);
      return { removed: true, path: paths.global };
    });
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
    const result = await writeGlobalRawCas({ text, force: true });
    return { path: result.path, text: result.text };
  }

  /**
   * 读全局记忆原文 + 内容版本号（面板那个始终可编辑的输入框靠它做冲突检测）。
   * @returns {Promise<{path:string, text:string, rev:string}>}
   */
  async function readGlobalRaw() {
    const text = (await readText(paths.global)) ?? '';
    return { path: paths.global, text, rev: contentRev(text) };
  }

  /**
   * 带版本号的整份写入（乐观锁）。
   *
   * 「读磁盘 → 比对 rev → 写」三步必须**全在同一个队列任务里**。
   * 比较放在锁外的话，两个并发保存会同时通过检查再先后写，后写的静默覆盖先写的
   * ——这正是「两个页签同时按保存，丢一份」。放进锁内，第二个请求必然看到新内容 → 409。
   *
   * 规则：
   *   - force=true          → 无视 baseRev 直接写（用户点「用我的覆盖」）
   *   - baseRev 缺省         → 也直接写（老客户端没有版本号，不能因此写不进去）
   *   - baseRev === 磁盘 rev → 写
   *   - 否则                → 不写，返回冲突结果（带磁盘当前全文，界面拿去出 diff）
   * @param {{text?:string, baseRev?:string, force?:boolean}} input
   * @returns {Promise<{ok:true, path:string, text:string, rev:string}
   *   | {ok:false, conflict:true, path:string, rev:string, text:string, baseRev:string}>}
   */
  async function writeGlobalRawCas({ text, baseRev, force } = {}) {
    const nextText = text === undefined || text === null ? '' : String(text);
    const hasBase = typeof baseRev === 'string' && baseRev.trim().length > 0;
    return withPathLock(paths.global, async () => {
      const diskText = (await readText(paths.global)) ?? '';
      const diskRev = contentRev(diskText);
      if (!force && hasBase && baseRev.trim() !== diskRev) {
        return { ok: false, conflict: true, path: paths.global, rev: diskRev, text: diskText, baseRev };
      }
      await writeTextAtomicDirect(paths.global, nextText);
      // 写完回读：宁可直接报错，也不要「返回成功但盘上是别的东西」
      const check = (await readText(paths.global)) ?? '';
      if (check !== nextText) {
        throw statusError(500, '写入后回读校验失败：磁盘内容与期望不一致（可能有外部程序同时在写）');
      }
      return { ok: true, path: paths.global, text: check, rev: contentRev(check) };
    });
  }

  // ---------- 项目记忆 ----------

  /** 同步读项目索引原文（注入段用） */
  function projectIndexTextSync(slug) {
    if (!slug) return '';
    return readTextSync(projectIndexOf(slug)) ?? '';
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
  async function forgetById(id, { cwd } = {}) {
    const value = String(id ?? '').trim();
    if (!/^(g|p)_[0-9a-f]+$/i.test(value)) return { removed: false, scope: null };
    if (value.startsWith('g_')) {
      const res = await forgetGlobal(value);
      return { removed: res.removed, scope: res.removed ? 'global' : null, path: res.path };
    }
    // 先找当前目录的局部记忆（新位置），再退回旧的 projects/<slug>/ 目录（旧数据我们不动，
    // 但用户要删某条旧条目时仍然要能删掉）
    if (String(cwd ?? '').trim()) {
      const file = projectMemoryFileOf(cwd);
      const text = await readText(file);
      if (text !== null && parseGlobal(text).some((entry) => entry.id === value)) {
        const res = await forgetProjectMemory(cwd, value);
        return { removed: res.removed, scope: 'project', path: file };
      }
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
  async function stats({ cwd = null } = {}) {
    const globalCount = (await listGlobal()).length;
    let projectCount = 0;
    let project = null;
    if (cwd && String(cwd).trim()) {
      project = await projectMemoryState(cwd);
      projectCount = project.enabled ? (await listProjectMemory(cwd)).length : 0;
    }
    return { dataDir: paths.root, globalCount, projectCount, project };
  }

  // ---------- 会话级角色绑定（随时可改，只决定注入哪张卡） ----------

  const sessionsFile = join(paths.state, 'sessions.json');

  /** 读会话绑定表；坏 JSON/缺失都当空表 */
  async function readSessionBindings() {
    const text = await readText(sessionsFile);
    return parseSessionBindings(text);
  }

  /** 同步读取绑定表，供每轮提示词组装使用。 */
  function readSessionBindingsSync() {
    return parseSessionBindings(readTextSync(sessionsFile));
  }

  /** 原子写绑定表 */
  async function writeSessionBindings(map) {
    await ensureDir(paths.state);
    await writeTextAtomic(sessionsFile, `${JSON.stringify(map, null, 2)}\n`);
  }

  /**
   * 查某个会话绑了哪张卡。
   * @param {string} sessionId
   * @returns {Promise<string|null>} personaId（= 角色目录名），没绑过是 null
   */
  async function sessionPersonaId(sessionId) {
    const id = String(sessionId ?? '').trim();
    if (!id) return null;
    const map = await readSessionBindings();
    const entry = map[id];
    return entry && typeof entry.personaId === 'string' && entry.personaId ? entry.personaId : null;
  }

  /** 同步版（注入段用） */
  function sessionPersonaIdSync(sessionId) {
    const id = String(sessionId ?? '').trim();
    if (!id) return null;
    const entry = readSessionBindingsSync()[id];
    return entry && typeof entry.personaId === 'string' && entry.personaId ? entry.personaId : null;
  }

  /**
   * 给会话绑一张角色卡（**任何时候都能改**，没有「锁死」这套东西）。
   *
   * 为什么可以随便改：这个选择只决定「这一轮注入哪张卡的正文」，
   * 不存在「换了会把前面聊过的内容弄坏」的问题 —— 换个角色就是换个说话的人，
   * 用户在新建会话页反复挑几次完全正常。所以这里永远是覆盖写。
   * 绑同一个 id 重复调用是幂等的（boundAt 不变，界面重试/双击都不该改历史）。
   * @param {string} sessionId
   * @param {string} personaId
   * @returns {Promise<{ok:true, sessionId:string, personaId:string, boundAt:number}>}
   */
  async function bindSessionPersona(sessionId, personaId) {
    return withPersonaLock(async () => {
      const sid = String(sessionId ?? '').trim();
      if (!sid) throw statusError(400, '缺少会话 id');
      const raw = String(personaId ?? '').trim();
      const pid = isPersonaNone(raw) ? PERSONA_NONE : requirePersonaId(raw);
      if (!isPersonaNone(pid) && !(await listPersonaIds()).includes(pid)) {
        throw statusError(404, `找不到角色卡 ${pid}`);
      }

      return withPathLock(sessionsFile, async () => {
        const map = await readSessionBindings();
        const entry = map[sid];
        if (entry?.personaId === pid) {
          return { ok: true, sessionId: sid, personaId: pid, boundAt: Number(entry.boundAt) || now() };
        }
        const boundAt = now();
        map[sid] = { personaId: pid, boundAt };
        await writeTextAtomicDirect(sessionsFile, `${JSON.stringify(map, null, 2)}\n`);
        return { ok: true, sessionId: sid, personaId: pid, boundAt };
      });
    });
  }

  /**
   * 会话绑定的卡（拿去注入）；绑的目录被删了就返回 null，让调用方回落 active 卡。
   * @param {string} sessionId
   * @returns {Promise<object|null>}
   */
  async function sessionPersonaCard(sessionId) {
    const pid = await sessionPersonaId(sessionId);
    if (isPersonaNone(pid)) return nonePersonaCard();
    const key = safePersonaId(pid);
    if (!key) return null;
    const text = await readText(agentFileOf(key));
    if (text === null) return null;
    return cardView(parsePersonaCard(text, key), text);
  }

  /** 同步读取会话角色；手改绑定表也不能绕过目录身份校验。 */
  function sessionPersonaCardSync(sessionId) {
    const pid = sessionPersonaIdSync(sessionId);
    if (isPersonaNone(pid)) return nonePersonaCard();
    const key = safePersonaId(pid);
    if (!key) return null;
    const text = readTextSync(agentFileOf(key));
    if (text === null) return null;
    return cardView(parsePersonaCard(text, key), text);
  }

  // ---------- 项目局部记忆（放在项目自己的 .dsh/MEMORY.md） ----------

  const projectStateFile = join(paths.state, 'projects.json');

  /** 项目记忆文件路径：<cwd>/.dsh/MEMORY.md */
  function projectMemoryFileOf(cwd) {
    const dir = resolve(String(cwd ?? '').trim() || '.');
    return join(dir, PROJECT_MEMORY_DIRNAME, PROJECT_MEMORY_FILENAME);
  }

  /** 读「哪些目录开着局部记忆」的开关表 */
  async function readProjectStateMap() {
    return parseProjectStateMap(await readText(projectStateFile));
  }

  /** 同步读开关表（注入段用） */
  function readProjectStateMapSync() {
    return parseProjectStateMap(readTextSync(projectStateFile));
  }

  /** 原子写开关表 */
  async function writeProjectStateMap(map) {
    await ensureDir(paths.state);
    await writeTextAtomic(projectStateFile, `${JSON.stringify(map, null, 2)}\n`);
  }

  /**
   * 旧版项目记忆（<root>/projects/<slug>/）里有没有东西。
   * 只用来给界面提示「这里还有旧数据」，**不读、不迁、不删**。
   * @param {string} cwd
   * @returns {Promise<boolean>}
   */
  async function hasLegacyProjectMemory(cwd) {
    try {
      const detected = detectProject(cwd);
      const slug = detected ? detected.slug : projectSlug(cwd);
      const files = await readdir(projectDirOf(slug));
      return files.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * 某个目录的局部记忆状态。
   *
   * enabled 的判定：状态文件里有记录就用记录；**没有记录时默认值 = 文件是否存在**
   * （文件在 = 用户已经在这项目里记过东西，默认开着；文件不在 = 默认关着，
   * 免得插件悄悄在每个打开过的目录里建 .dsh）。
   * @param {string} cwd
   * @returns {Promise<{cwd:string, memoryPath:string, exists:boolean, enabled:boolean, hasLegacy:boolean}>}
   */
  async function projectMemoryState(cwd) {
    const dir = resolve(String(cwd ?? '').trim() || '.');
    const file = projectMemoryFileOf(dir);
    const exists = (await fileStat(file)).exists;
    const map = await readProjectStateMap();
    const record = map[normalizeProjectCwd(dir)];
    const enabled = record && typeof record.enabled === 'boolean' ? record.enabled : exists;
    return { cwd: dir, memoryPath: file, exists, enabled, hasLegacy: await hasLegacyProjectMemory(dir) };
  }

  /**
   * 改某个目录的局部记忆开关。
   *
   * 打开时顺手把文件建出来（否则用户打开开关后还是没地方写）；
   * **关闭时只写状态文件，绝不删文件/目录、绝不清空内容** —— 用户关的是「以后别往这里记」，
   * 不是「把我记过的东西删掉」。这条最容易写反，所以有单测钉死。
   * @param {{cwd:string, enabled:boolean}} input
   * @returns {Promise<{cwd:string, memoryPath:string, exists:boolean, enabled:boolean, hasLegacy:boolean}>}
   */
  async function setProjectMemoryState({ cwd, enabled } = {}) {
    const dir = resolve(String(cwd ?? '').trim() || '.');
    if (!String(cwd ?? '').trim()) throw statusError(400, '缺少目录路径');
    const value = !!enabled;
    const file = projectMemoryFileOf(dir);
    return withPathLock(projectStateFile, async () => {
      const map = await readProjectStateMap();
      map[normalizeProjectCwd(dir)] = { enabled: value, updatedAt: now() };
      await writeTextAtomicDirect(projectStateFile, `${JSON.stringify(map, null, 2)}\n`);
      if (value && !(await fileStat(file)).exists) {
        await ensureDir(dirname(file));
        await writeTextAtomic(file, `${PROJECT_MEMORY_HEADER}\n`);
      }
      return projectMemoryState(dir);
    });
  }

  /** 同步判断某目录的局部记忆是否开着（注入闸门用，不能 await） */
  function projectMemoryEnabledSync(cwd) {
    const dir = resolve(String(cwd ?? '').trim() || '.');
    const record = readProjectStateMapSync()[normalizeProjectCwd(dir)];
    if (record && typeof record.enabled === 'boolean') return record.enabled;
    // 没记录：默认值 = 文件是否存在
    try {
      return statSync(projectMemoryFileOf(dir)).isFile();
    } catch {
      return false;
    }
  }

  /** 同步读局部记忆原文（注入段用）；文件不存在返回空串 */
  function projectMemoryTextSync(cwd) {
    return readTextSync(projectMemoryFileOf(cwd)) ?? '';
  }

  /**
   * 读局部记忆条目。
   * @param {string} cwd
   * @returns {Promise<Array<{id:string, section:string, text:string, date:string, tags:string[]}>>}
   */
  async function listProjectMemory(cwd) {
    return parseGlobal((await readText(projectMemoryFileOf(cwd))) ?? '');
  }

  /**
   * 追加一条项目记忆。开关关着就抛（闸门写在存储层，工具/HTTP/命令都绕不过去）。
   * @param {{cwd:string, text:string, section?:string, tags?:string[]|string}} input
   * @returns {Promise<{id:string, scope:'project', path:string, date:string, section:string, tags:string[]}>}
   */
  async function appendProjectMemory({ cwd, text, section, tags } = {}) {
    const dir = resolve(String(cwd ?? '').trim() || '.');
    if (!String(cwd ?? '').trim()) throw statusError(400, '缺少目录路径');
    const content = oneLine(text);
    if (!content) throw statusError(400, '记忆正文不能为空');
    if (!projectMemoryEnabledSync(dir)) throw statusError(403, PROJECT_MEMORY_DISABLED);

    const file = projectMemoryFileOf(dir);
    const sec = normalizeSection(section);
    const tagList = normalizeTags(tags);
    const id = newEntryId('p');
    const date = formatDate(now());
    const suffix = tagList.length ? ` | tag: ${tagList.join(', ')}` : '';
    const line = `- [${id}] ${date} ${content}${suffix}`;
    await withPathLock(file, async () => {
      const current = (await readText(file)) ?? `${PROJECT_MEMORY_HEADER}\n`;
      await ensureDir(dirname(file));
      await writeTextAtomicDirect(file, insertGlobalLine(current, sec, line));
    });
    return { id, scope: 'project', path: file, date, section: sec, tags: tagList, text: content };
  }

  /**
   * 删一条项目记忆（按 id）。开关关着也拒绝 —— 闸门管的是「这个目录的局部记忆功能」，
   * 不只是「能不能写」。
   * @param {string} cwd
   * @param {string} id
   * @returns {Promise<{removed:boolean, path:string}>}
   */
  async function forgetProjectMemory(cwd, id) {
    const dir = resolve(String(cwd ?? '').trim() || '.');
    const file = projectMemoryFileOf(dir);
    if (!projectMemoryEnabledSync(dir)) throw statusError(403, PROJECT_MEMORY_DISABLED);
    return withPathLock(file, async () => {
      const current = await readText(file);
      if (current === null) return { removed: false, path: file };
      const { text, removed } = removeGlobalLine(current, id);
      if (!removed) return { removed: false, path: file };
      await writeTextAtomicDirect(file, text);
      return { removed: true, path: file };
    });
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
    /** 这个 id 是不是虚拟的「空白」卡 */
    isPersonaNone,
    createPersona,
    savePersonaCard,
    savePersonaCardCas,
    deletePersona,
    setActivePersona,
    reloadPersona,
    renamePersona,
    migratePersona,
    ensurePersonas,
    // 每角色长期记忆（<root>/<id>/MEMORY.md）
    personaMemoryFileOf,
    readPersonaMemory,
    writePersonaMemory,
    writePersonaMemoryCas,
    appendPersonaMemory,
    personaMemoryTextSync,
    // 角色卡（旧版单卡兼容层，等价于 active 那张卡）
    readPersona,
    readPersonaSync,
    savePersona,
    // 会话级角色绑定
    readSessionBindings,
    sessionPersonaId,
    sessionPersonaIdSync,
    sessionPersonaCard,
    sessionPersonaCardSync,
    bindSessionPersona,
    // 项目局部记忆（项目自己的 .dsh/MEMORY.md）
    projectMemoryFileOf,
    projectMemoryState,
    setProjectMemoryState,
    projectMemoryEnabledSync,
    projectMemoryTextSync,
    listProjectMemory,
    appendProjectMemory,
    forgetProjectMemory,
    hasLegacyProjectMemory,
    // 全局提示词（所有角色通用）
    ensureAgentPromptFile,
    agentPromptTextSync,
    readAgentPrompt,
    writeAgentPrompt,
    writeAgentPromptCas,
    // 全局
    listGlobal,
    globalTextSync,
    appendGlobal,
    forgetGlobal,
    writeGlobalRaw,
    readGlobalRaw,
    writeGlobalRawCas,
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
