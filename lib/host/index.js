// 宿主插件 · @local/dsh-my-memory
//
// 职责边界：
//   - 这里只做「接线」：Config、注入、系统提示段、命令、HTTP 路由
//   - 落盘全在 lib/host/store.js，仓库识别在 lib/host/project.js，原子写在 lib/host/atomic.js
//
// 三条对外通道：
//   1. systemPrompt.section —— 角色卡（my-memory:persona）+ 全局/项目记忆（my-memory:context）
//   2. commands            —— 用户手动 /remember /memory（本版不再向模型注册 memory_* 工具）
//   3. webServer           —— 面板用的 HTTP API（/my-memory/api/*）
//
// 关于注入段用「函数 text」：dsh-system-prompt 每次组装都会调用它，
// 所以改文件下一轮就生效，不需要像旧插件那样 dispose + 重注册。
// 但为了两条路都通（也方便用户在面板里改完立刻看到），HTTP 写入成功后仍会 refresh 一次。

import { spawn } from 'node:child_process';
import { join } from 'node:path';

import z from '@deepseek-ai/schemastery';

import { ensureDir } from './atomic.js';
import { detectProject } from './project.js';
import {
  createMemoryStore,
  DEFAULT_AGENT_PROMPT,
  defaultDataDir,
  DEFAULT_FOLDER_NAME,
  expandUserPath,
  migrateDefaultDataDir,
  resolveDataDir,
  withFolderName,
  writeRootPointer,
  DEFAULT_PERSONA_NAME,
  oneLine,
} from './store.js';

/** Cordis 插件名 */
export const name = 'my-memory';

/**
 * 需要的宿主 Service。
 * workingDirectory / commands 不写进这里：拿不到也应该能用，所以走 ctx.inject 可选注入。
 */
export const inject = ['webServer', 'systemPrompt'];

const LOG = '[my-memory]';

/** 段名：角色卡与记忆分开两段，预算各自控制 */
const SECTION_PERSONA = 'my-memory:persona';
const SECTION_CONTEXT = 'my-memory:context';

/**
 * 默认配置：唯一的一份默认值。
 * 为什么不写 `Config({})` 去取默认值：schemastery 的 `.volatile()` 在调用时**不物化默认值**
 * （实测 `Config({})` 返回 `{}`），拿它当默认值来源会得到一堆 undefined。
 * 所以默认值只在这里定义一次，Config schema 的 .default() 直接引用同一批常量。
 */
const DEFAULT_CONFIG = {
  enabled: true,
  dataDir: '',
  order: 1.2,
  personaOrder: 1.1,
  personaBudget: 800,
  globalBudget: 1200,
  projectBudget: 800,
  apiPrefix: '/my-memory/api',
  personaName: DEFAULT_PERSONA_NAME,
  recallLimit: 8,
  rootPointerFile: '',
};

/**
 * Config：每个字段都必须给 .default()（否则合成层校验会要求用户显式填），
 * 最后 .volatile() 表示这份配置不参与持久化快照。
 */
export const Config = z
  .object({
    /** 总开关：关掉就不注册任何段/命令/路由 */
    enabled: z.boolean().default(DEFAULT_CONFIG.enabled),
    /** 数据根目录；空 = ~/.dsh/my-memory/ */
    dataDir: z.string().default(DEFAULT_CONFIG.dataDir),
    /** 记忆段（全局 + 项目索引）的段序，插在运行时上下文之前 */
    order: z.number().default(DEFAULT_CONFIG.order),
    /** 角色卡段序，排在记忆段之前：先知道「我是谁」，再看「我记住了什么」 */
    personaOrder: z.number().default(DEFAULT_CONFIG.personaOrder),
    /** 角色卡注入上限（字）；0 = 不限 */
    personaBudget: z.number().default(DEFAULT_CONFIG.personaBudget),
    /** 全局记忆注入上限（字，保留头尾）；0 = 不限 */
    globalBudget: z.number().default(DEFAULT_CONFIG.globalBudget),
    /** 当前项目索引注入上限（字，保留头尾）；0 = 不限 */
    projectBudget: z.number().default(DEFAULT_CONFIG.projectBudget),
    /** HTTP API 前缀 */
    apiPrefix: z.string().default(DEFAULT_CONFIG.apiPrefix),
    /** 没设置过角色卡时的默认名字 */
    personaName: z.string().default(DEFAULT_CONFIG.personaName),
    /** recall 不传 limit 时的条数 */
    recallLimit: z.number().default(DEFAULT_CONFIG.recallLimit),
    /** 数据根指针文件路径；空 = ~/.dsh/my-memory.roots.json（单测用它指到临时目录，避免动真环境） */
    rootPointerFile: z.string().default(DEFAULT_CONFIG.rootPointerFile),
  })
  .volatile();

/** 把 config 里缺失的字段补成默认值（防御：老 profile / 手改 yml 可能给 undefined） */
function resolveConfig(config) {
  const raw = config && typeof config === 'object' ? config : {};
  const num = (value, dflt) => (Number.isFinite(Number(value)) ? Number(value) : dflt);
  return {
    enabled: raw.enabled === undefined ? DEFAULT_CONFIG.enabled : raw.enabled !== false,
    dataDir: String(raw.dataDir || DEFAULT_CONFIG.dataDir),
    order: num(raw.order, DEFAULT_CONFIG.order),
    personaOrder: num(raw.personaOrder, DEFAULT_CONFIG.personaOrder),
    personaBudget: num(raw.personaBudget, DEFAULT_CONFIG.personaBudget),
    globalBudget: num(raw.globalBudget, DEFAULT_CONFIG.globalBudget),
    projectBudget: num(raw.projectBudget, DEFAULT_CONFIG.projectBudget),
    apiPrefix: String(raw.apiPrefix || DEFAULT_CONFIG.apiPrefix),
    personaName: String(raw.personaName || DEFAULT_CONFIG.personaName),
    recallLimit: Math.max(1, Math.floor(num(raw.recallLimit, DEFAULT_CONFIG.recallLimit))),
    rootPointerFile: String(raw.rootPointerFile || DEFAULT_CONFIG.rootPointerFile),
  };
}

/**
 * 预算裁剪：保留头尾（头部是分区标题与最老的条目，尾部是最近追加的条目）。
 * 为什么不只留头部：记忆是「越新越重要」，只截头部等于永远读不到刚记住的东西。
 * @param {string} text
 * @param {number} cap 字符上限；<=0 表示不限
 * @returns {string}
 */
export function retainEnds(text, cap) {
  const value = String(text ?? '');
  const limit = Math.floor(Number(cap) || 0);
  if (limit <= 0 || value.length <= limit) return value;
  const sep = '\n…（中段省略）…\n';
  if (limit <= sep.length) return value.slice(-limit);
  const room = limit - sep.length;
  const head = Math.ceil(room / 2);
  const tail = room - head;
  return value.slice(0, head) + sep + (tail ? value.slice(-tail) : '');
}

/**
 * 「这条内容像不像技术细节」——决定 auto scope 落哪边。
 *
 * 判据刻意做得很笨，因为可解释比准确重要：用户问「为什么记到这儿」时，
 * 必须能一句话答上来（「里面有代码符号/技术词，所以进了项目记忆」）。
 * 误判后果很轻：项目记忆也只是本仓库可见，随时能删掉。
 * @param {string} text
 * @returns {boolean}
 */
export function looksTechnical(text) {
  const s = String(text ?? '');
  if (!s) return false;
  // 1) 代码符号：foo(...) / a => b / 花括号 / 反引号 / 文件扩展名
  if (/[A-Za-z_][A-Za-z0-9_.]*\s*\([^)]*\)/.test(s)) return true;
  if (/[{}<>`]|=>|\b[a-z]+_[a-z_]+\b/i.test(s)) return true;
  if (/\.(m?js|ts|jsx|tsx|json|ya?ml|md|py|dart|go|rs|toml|ini|env|sh|ps1)\b/i.test(s)) return true;
  // 2) 技术词：中英文各一批高频的
  if (
    /(代码|源码|函数|方法|接口|报错|异常|堆栈|配置|参数|字段|默认值|依赖|版本|构建|编译|部署|测试|单测|命令|脚本|目录|路径|端口|进程|插件|服务|数据库|仓库|分支|提交|模块|类型|导出|导入|路由|缓存|协议|环境变量)/i.test(
      s,
    )
  )
    return true;
  if (
    /\b(api|sdk|cli|bug|fix|npm|pnpm|node|git|json|yaml|http|https|sql|regex|config|schema|typescript|javascript|python|rust|dart|flutter|react|vue|hook|async|await|import|export|build|deploy|test|docker|env)\b/i.test(
      s,
    )
  )
    return true;
  return false;
}

/**
 * 从 Agent / assembly 上取当前会话的工作目录。
 * 优先问 workingDirectory 服务（唯一权威），拿不到再退回 session.header.cwd，
 * 最后退回服务的 defaultDirectory。全都拿不到返回 null（注入就只给全局部分，不报错）。
 * @param {any} ctx cordis 上下文
 * @param {any} source assembly（含 agent）或 exec（含 agent）
 * @returns {string|null}
 */
export function cwdFrom(ctx, source) {
  const agent = source?.agent ?? null;
  const session = agent?.session ?? null;
  let wd = null;
  try {
    wd = ctx.get?.('workingDirectory') ?? null;
  } catch {
    wd = null;
  }
  if (wd && session) {
    try {
      const p = wd.get(session);
      if (p) return String(p);
    } catch {
      /* 会话还没绑定目录：继续往下试 */
    }
  }
  const headerCwd = session?.header?.cwd ?? agent?.header?.cwd ?? session?.cwd;
  if (headerCwd) return String(headerCwd);
  try {
    if (wd?.defaultDirectory) return String(wd.defaultDirectory);
  } catch {
    /* ignore */
  }
  return null;
}

/** 统一的 JSON 发送（面板要的是稳定形状，全部 no-store） */
function sendJson(res, status, body) {
  if (res.headersSent) return;
  const text = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(text),
    'cache-control': 'no-store',
  });
  res.end(text);
}

/** 读请求体（上限 1MB；坏 JSON 按空对象处理，让调用方给出 400） */
async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1024 * 1024) throw new Error('请求体过大');
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString('utf8');
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    throw new Error('请求体不是合法 JSON');
  }
}

/** 取一个路径的最后一段（用来给注入段做小标题、给状态文案显示目录名） */
export function basenameOf(target) {
  const clean = String(target ?? '').replace(/[/\\]+$/, '');
  const tail = clean.split(/[/\\]+/).pop();
  return tail || clean;
}

/**
 * 该用什么命令打开一个目录（纯函数，方便单测；真正 spawn 的是 openInFileManager）。
 * @param {string} target 目录绝对路径
 * @param {string} [platform]
 * @returns {{command:string, args:string[]}}
 */
export function revealCommandOf(target, platform = process.platform) {
  if (platform === 'win32') return { command: 'explorer.exe', args: [target] };
  if (platform === 'darwin') return { command: 'open', args: [target] };
  return { command: 'xdg-open', args: [target] };
}

/**
 * 用系统文件管理器打开一个目录。
 *
 * 传目录而不是文件：面板上写的是「打开目录」，用户要做的往往是往里放头像/看图，
 * 而 `explorer /select,文件` 会选中文件、还得多按一次返回。
 * detached + unref：文件管理器是独立进程，别让它挂在插件生命周期上
 * （否则插件一重载就把用户的窗口关掉）。
 * @param {string} target
 */
export function openInFileManager(target) {
  const { command, args } = revealCommandOf(target);
  const child = spawn(command, args, { detached: true, stdio: 'ignore' });
  child.unref();
  return { command, args };
}

/**
 * 插件主体。
 * @param {any} ctx cordis 上下文
 * @param {any} config 用户配置（已由 Config 校验）
 */
export function apply(ctx, config) {
  const cfg = resolveConfig(config);
  if (!cfg.enabled) {
    ctx.logger?.info?.('%s 已禁用（config.enabled=false）', LOG);
    return;
  }

  // 数据根可以在运行期切换（面板「全局设置」里改），所以 store 必须是个**变量**：
  // 切换时整个重建 store，而不是改里面的字段 —— store 里到处是捕获了 root 的闭包
  // （paths / personaDirOf / agentFileOf），改字段改不动它们，只有重建才是干净的重指向。
  // 默认目录改过名字（~/.dsh/my-memory → ~/.dsh/dsh-my-memory）：先搬，再决定用哪个根。
  // 只在「真的用默认根」时才搬 —— config.dataDir 明确指定了目录时，默认根跟本次运行无关，
  // 这时候去动用户家目录里的东西是越界（单测也正是靠这条避免碰到真实 ~/.dsh）。
  const pointerFile = cfg.rootPointerFile ? expandUserPath(cfg.rootPointerFile) : undefined;
  if (!cfg.dataDir) {
    try {
      const moved = migrateDefaultDataDir({ file: pointerFile });
      if (moved.migrated) {
        ctx.logger?.info?.('%s 数据目录改名：%s → %s', LOG, moved.from, moved.to);
      } else if (moved.reason) {
        ctx.logger?.warn?.('%s 数据目录迁移失败（继续用 %s）：%s', LOG, moved.from, moved.reason);
      }
    } catch (err) {
      ctx.logger?.warn?.('%s 数据目录迁移异常（忽略，继续启动）：%s', LOG, String(err?.message ?? err));
    }
  }

  const initialRoot = resolveDataDir({ configured: cfg.dataDir, file: pointerFile });
  let store;
  try {
    store = createMemoryStore({ dataDir: initialRoot.dataDir });
  } catch (err) {
    // 存储层起不来就整插件降级：宁可什么都不注入，也不能让宿主加载失败
    ctx.logger?.warn?.('%s 存储初始化失败，插件降级为不工作：%s', LOG, String(err?.message ?? err));
    return;
  }
  ctx.logger?.info?.('%s 数据根 = %s（来源：%s）', LOG, initialRoot.dataDir, initialRoot.source);

  /** 段 disposer（refresh 时要先卸再挂） */
  const sectionDisposers = { persona: null, context: null };

  // ---------- 1. 系统提示段 ----------

  /** 从 assembly 里取会话 id（不同版本字段路径不一样，全都试一遍） */
  function sessionIdFrom(source) {
    const agent = source?.agent ?? null;
    const session = agent?.session ?? null;
    return String(
      session?.id ?? session?.sessionId ?? agent?.sessionId ?? source?.sessionId ?? '',
    ).trim();
  }

  /**
   * 会话实际生效的角色卡 id：会话绑定优先，没绑定（或绑定的目录已被删）回落全局默认卡。
   *
   * 抽出来给角色卡段和记忆段共用：两处各写一套「谁生效」的判断，迟早会走偏
   * （比如一处认「空白」一处不认，就会出现「角色段关了、记忆段还在」的半关状态）。
   * @param {string} sessionId
   * @returns {string}
   */
  function effectivePersonaIdSync(sessionId) {
    const bound = store.sessionPersonaCardSync(sessionId);
    if (bound) return String(bound.id ?? '');
    return String(store.readActivePersonaSync().id ?? '');
  }

  /**
   * 角色卡的两份原料：裸正文（不含任何标题 / 介绍句）和显示名。
   *
   * 抽出来给两条路共用：
   *   1. 角色卡段（personaSectionText）自己加「# 角色设定」标题和介绍句；
   *   2. 聊天模式（preset-solo 的 complete 段）要**裸拼**，一句多余的话都不写。
   * 两处必须同口径判断：「空白」卡整段关闭、会话绑定优先、personaBudget 截断，
   * 各写一套迟早会走偏（比如一处认「空白」一处不认，就会半关）。
   * 数据来自 store 的 mtime 缓存，这里不会多读一遍文件。
   * @param {any} assembly
   * @returns {{body: string, name: string}|null} 生效卡是「空白」时返回 null（提示词整体关闭）
   */
  function personaRawParts(assembly) {
    const sessionId = sessionIdFrom(assembly);
    // 生效卡是「空白」= 用户要彻底关掉本插件的提示词：调用方拿 null 自行返回空串。
    // why 必须在这里就 null，而不是让渲染分支自然为空：AGENT.md 的「# 全局对话要求」
    // 是拼在角色卡段里的，正文为空它仍然会被注入 —— 那就不是「什么都不加」了。
    if (store.isPersonaNone(effectivePersonaIdSync(sessionId))) return null;
    const persona = store.sessionPersonaCardSync(sessionId) ?? store.readActivePersonaSync();
    const body = String(persona.body ?? '').replace(/\s+$/, '');
    const budget = Math.floor(Number(cfg.personaBudget) || 0);
    const rendered = budget > 0 && body.length > budget ? `${body.slice(0, budget)}…` : body;
    return { body: rendered, name: oneLine(persona.name) || cfg.personaName };
  }

  /**
   * 角色卡段文本：优先用「当前会话绑定的卡」，没绑定才回落到 active 卡。
   *
   * 为什么要会话级：用户可能在不同的会话里让「她」是不同的人（工作会话 / 闲聊会话），
   * 而 activeId 是全局的，一旦切了所有会话一起变。绑定存在 state/sessions.json 里，
   * 建会话时可以随时改（没有锁定逻辑）—— 这个选择只决定「这一轮注入哪张卡的正文」。
   * 只做一件事：超出 personaBudget 后截断加省略号。正文不拆小节、不改写。
   * @param {any} assembly
   * @returns {string}
   */
  function personaSectionText(assembly) {
    try {
      const raw = personaRawParts(assembly);
      // 空白卡：整段（含 AGENT.md 的全局对话要求）都不注入
      if (!raw) return '';
      const parts = [];
      // 卡正文为空时不出角色段，但**全局提示词仍然要注入**，所以不能整体 return ''
      if (raw.body) {
        parts.push(`# 角色设定\n\n你现在扮演这个角色（角色卡「${raw.name}」）：\n${raw.body}`);
      }
      // 全局对话要求（数据根下 AGENT.md）：所有角色通用，所以挂在角色卡段里；
      // **不受 personaBudget 截断** —— 预算只管卡正文，否则长卡会把提示词整段挤掉。
      // 每轮同步读文件（带 mtime 缓存），用户改文件下一轮就生效；内容不变时拼出的字符串也稳定。
      const globalPrompt = store.agentPromptTextSync();
      if (globalPrompt) parts.push(`# 全局对话要求\n\n${globalPrompt}`);
      return parts.join('\n\n');
    } catch (err) {
      ctx.logger?.warn?.('%s 角色卡段计算失败：%s', LOG, String(err?.message ?? err));
      return '';
    }
  }

  /**
   * 聊天模式用的**角色卡裸正文**：没有「# 角色设定」标题，也没有
   * 「你现在扮演这个角色（角色卡「X」）：」这类介绍句，更不含 AGENT.md。
   * 聊天模式要求「一句多余的话都不要写」，所以裸到只剩卡正文本身。
   * @param {any} assembly
   * @returns {string}
   */
  function personaRawText(assembly) {
    try {
      return personaRawParts(assembly)?.body ?? '';
    } catch (err) {
      ctx.logger?.warn?.('%s 角色卡裸正文计算失败：%s', LOG, String(err?.message ?? err));
      return '';
    }
  }

  /**
   * 聊天模式用的**全局记忆裸文本**：MEMORY.md 正文，不带「# 长期记忆（全局）」标题，
   * 也不含项目记忆段（项目记忆是别的模式的口味，聊天模式只要全局那份）。
   * 预算沿用 globalBudget（和记忆段同一把尺子，避免聊天模式把上下文撑爆）。
   * @param {any} assembly
   * @returns {string}
   */
  function memoryRawText(assembly) {
    try {
      // 空白卡 = 提示词整体关闭；与 personaRawText 同口径，别只关一半。
      if (store.isPersonaNone(effectivePersonaIdSync(sessionIdFrom(assembly)))) return '';
      return retainEnds(store.globalTextSync(), cfg.globalBudget).trim();
    } catch (err) {
      ctx.logger?.warn?.('%s 记忆裸文本计算失败：%s', LOG, String(err?.message ?? err));
      return '';
    }
  }


  /**
   * 记忆段文本由三块组成：全局记忆全文（头尾裁剪）+ 当前项目索引（头尾裁剪）。
   *
   * 缓存策略：只要两块源文本（字符串内容）没变，就直接返回上一次拼好的**同一个字符串**。
   * why：每轮拼出内容相同的不同字符串在字节上其实一样，但重拼会带来不必要的 CPU；
   * 更关键的是「内容必须稳定」——任何一次多一个空行都会改写系统提示前缀，KV 缓存全废。
   * @param {any} assembly
   * @returns {string}
   */
  const contextCache = { global: null, projectText: null, projectName: '', out: '' };
  function contextSectionText(assembly) {
    try {
      // 生效卡是「空白」= 用户要彻底关掉本插件的提示词，记忆段同样整段不注入。
      // 判断口径与角色卡段共用 effectivePersonaIdSync，别在这里另写一套。
      if (store.isPersonaNone(effectivePersonaIdSync(sessionIdFrom(assembly)))) return '';
      const globalText = store.globalTextSync();
      const cwd = cwdFrom(ctx, assembly);
      // 项目局部记忆现在放在项目自己的 .dsh/MEMORY.md 里；
      // 开关关着就整段不注入（全局段照常，别把用户已有的记忆也一起吞掉）。
      const projectOn = cwd ? store.projectMemoryEnabledSync(cwd) : false;
      const projectText = projectOn ? store.projectMemoryTextSync(cwd) : '';
      const projectName = projectOn && cwd ? basenameOf(cwd) : '';

      if (
        contextCache.global === globalText &&
        contextCache.projectText === projectText &&
        contextCache.projectName === projectName
      ) {
        return contextCache.out;
      }

      const parts = [];
      const globalBody = retainEnds(globalText, cfg.globalBudget).trim();
      if (globalBody) parts.push(`# 长期记忆（全局）\n\n${globalBody}`);
      const projectBody = retainEnds(projectText, cfg.projectBudget).trim();
      if (projectBody) {
        parts.push(
          `# 项目记忆 · ${projectName}\n\n${projectBody}\n\n> 需要全文时可在记忆面板查看全部条目。`,
        );
      }
      const out = parts.join('\n\n');
      contextCache.global = globalText;
      contextCache.projectText = projectText;
      contextCache.projectName = projectName;
      contextCache.out = out;
      return out;
    } catch (err) {
      ctx.logger?.warn?.('%s 记忆段计算失败：%s', LOG, String(err?.message ?? err));
      return '';
    }
  }

  /** 卸掉旧段再按当前配置重挂（HTTP 写入后调一次，保证面板改完立刻生效） */
  function refreshSections() {
    try {
      for (const key of ['context', 'persona']) {
        const dispose = sectionDisposers[key];
        sectionDisposers[key] = null;
        if (typeof dispose === 'function') {
          try {
            dispose();
          } catch {
            /* 卸载不抛 */
          }
        }
      }
      sectionDisposers.persona = ctx.systemPrompt.section({
        name: SECTION_PERSONA,
        order: cfg.personaOrder,
        // 函数 text：dsh-system-prompt 每次组装都会求值，改文件下一轮生效。
        // interpolate 必须 false：角色卡正文里的 `{}` 会被当变量插值，未知变量会让整段组装失败。
        text: personaSectionText,
        interpolate: false,
      });
      sectionDisposers.context = ctx.systemPrompt.section({
        name: SECTION_CONTEXT,
        order: cfg.order,
        text: contextSectionText,
        interpolate: false,
        // 注意：绝不加 complete: true —— 全局只能有一个 complete 段，多一个就组装失败。
      });
    } catch (err) {
      ctx.logger?.warn?.('%s 注册系统提示段失败：%s', LOG, String(err?.message ?? err));
    }
  }

  refreshSections();
  ctx.effect(() => () => {
    for (const key of ['context', 'persona']) {
      const dispose = sectionDisposers[key];
      sectionDisposers[key] = null;
      if (typeof dispose === 'function') {
        try {
          dispose();
        } catch {
          /* ignore */
        }
      }
    }
  }, 'my-memory.sections()');

  // 把两段的拼装函数当作 Service 暴露出去，给「预设内」的 @local/dsh-my-memory/preset-solo 用。
  // why 必须走服务：那个插件跑在 agent 作用域里，拿不到这里的 store / cfg 闭包；
  // 而重新 new 一个 store 会重复跑启动迁移、写出第二份状态文件，绝不能那么干。
  // 服务名以「本插件拥有、别人只读」为准，谁需要就把两段读成一段完整提示词自己去拼。
  // 除了原来两段「带标题的成品文本」（给其它模式/其它插件用），再给两份**裸原料**：
  // 聊天模式要求「一句多余的话都不要写」，所以它要的是不带标题、不带介绍句、不含 AGENT.md
  // 的正文本身，自己在自己的段里裸拼；这里只负责给数据，不做任何拼装决策。
  if (typeof ctx.provide === 'function') {
    ctx.provide('myMemoryPrompt', {
      /** 角色卡段（角色卡正文 + AGENT.md 全局对话要求），签名同 systemPrompt.section 的 text */
      personaText: personaSectionText,
      /** 记忆段（全局记忆 + 当前项目记忆），签名同上 */
      contextText: contextSectionText,
      /** 角色卡**裸正文**（无标题、无介绍句、不含 AGENT.md）：聊天模式直接拼它 */
      personaRaw: personaRawText,
      /** 全局记忆**裸文本**（MEMORY.md 正文，无标题、不含项目记忆）：聊天模式直接拼它 */
      memoryRaw: memoryRawText,
    });
  }


  // ---------- 2. 业务辅助 ----------

  /** 当前会话的项目（从 cwd 探测；不是 git 仓库就是 null） */
  function projectOfCwd(cwd) {
    if (!cwd) return null;
    try {
      return detectProject(cwd);
    } catch {
      return null;
    }
  }

  /** 没有会话上下文时（命令/HTTP 默认值）用服务默认目录 */
  function currentDefaultCwd() {
    try {
      const wd = ctx.get?.('workingDirectory');
      return wd?.defaultDirectory ? String(wd.defaultDirectory) : null;
    } catch {
      return null;
    }
  }

  /**
   * 决定一条新记忆该进哪个 scope。
   * auto 的规则（可解释）：有 git 仓库 **且** 内容像技术细节 → 项目；否则全局。
   * @param {string|undefined} rawScope
   * @param {string} text
   * @param {any} project
   * @returns {'global'|'project'}
   */
  function resolveScope(rawScope, text, project) {
    const wanted = String(rawScope ?? 'auto').trim().toLowerCase();
    if (wanted === 'global') return 'global';
    if (wanted === 'project') return 'project';
    return project && looksTechnical(text) ? 'project' : 'global';
  }

  /**
   * 统一的新增入口（命令、HTTP 共用，保证行为一致）。
   * @param {{text:string, scope?:string, title?:string, tags?:string[]|string, cwd?:string|null, project?:any}} input
   *   project 给了就直接用（HTTP 按 slug 指定时），否则按 cwd 探测
   * @returns {Promise<{id:string, scope:'global'|'project', path:string, slug?:string}>}
   */
  async function remember(input) {
    const text = String(input?.text ?? '').trim();
    if (!text) throw new Error('要记住的内容不能为空');
    const cwd = String(input?.cwd ?? '').trim() || currentDefaultCwd();
    // auto 判定仍然要求「在 git 仓库里」，避免在随便哪个目录里都长出 .dsh/
    const project = projectOfCwd(cwd);
    const target = resolveScope(input?.scope, text, project);
    if (target === 'project') {
      if (!cwd) throw new Error('拿不到当前目录，没法写项目记忆；改用 scope=global');
      if (input?.scope === 'project' && !project) {
        throw new Error('当前目录不在 git 仓库里，没法写项目记忆；改用 scope=global');
      }
      // 开关闸门在 store.appendProjectMemory 里（关着会抛「当前目录的局部记忆开关是关的，先打开再记」）
      const res = await store.appendProjectMemory({
        cwd,
        text,
        section: input?.title || '通用',
        tags: input?.tags,
      });
      return { id: res.id, scope: 'project', path: res.path };
    }
    const res = await store.appendGlobal({ text, section: input?.title || '通用', tags: input?.tags });
    return { id: res.id, scope: 'global', path: res.path };
  }

  // ---------- 3. 命令（可选注入：没有 commands 服务也能跑） ----------

  try {
    ctx.inject(['commands'], (c) => {
      const commands = [
        {
          name: 'remember',
          description: '把这句话记成记忆（scope=auto）',
          input: { hint: '<要记住的内容>' },
          async handler(input) {
            const text = String(input?.rawInput ?? '').trim();
            if (!text) return { kind: 'error', text: '用法：/remember 要记住的内容' };
            try {
              const res = await remember({ text, cwd: cwdFrom(ctx, input) });
              refreshSections();
              return {
                kind: 'success',
                text: `已记住（${res.scope}，id=${res.id}）：${res.path}`,
              };
            } catch (err) {
              return { kind: 'error', text: String(err?.message ?? err) };
            }
          },
        },
        {
          name: 'memory',
          description: '查看记忆状态：全局几条、当前项目几条、数据目录',
          async handler(input) {
            try {
              const cwd = cwdFrom(ctx, input) ?? currentDefaultCwd();
              const s = await store.stats({ cwd });
              const project = s.project;
              return {
                kind: 'success',
                text: [
                  `全局记忆 ${s.globalCount} 条`,
                  project
                    ? `项目记忆 ${s.projectCount} 条（${basenameOf(project.cwd)}，${project.enabled ? '开' : '关'}）`
                    : '项目记忆 0 条（拿不到当前目录）',
                  project ? `局部记忆文件：${project.memoryPath}` : '',
                  `数据目录：${s.dataDir}`,
                ]
                  .filter(Boolean)
                  .join('\n'),
              };
            } catch (err) {
              return { kind: 'error', text: String(err?.message ?? err) };
            }
          },
        },
        {
          name: 'persona',
          description: '切换默认角色卡：/persona <目录名>（不带参数则列出所有卡及其目录名）',
          input: { hint: '<角色目录名>' },
          async handler(input) {
            try {
              const wanted = oneLine(input?.rawInput).slice(0, 60);
              const { items, activeId } = await store.listPersonas();
              if (!items.length) return { kind: 'error', text: '还没有任何角色卡' };
              const current = items.find((i) => i.id === activeId) ?? items[0];
              if (!wanted) {
                const lines = items.map((i) => `${i.id === activeId ? '* ' : '- '}${i.id}　${i.name}`);
                return { kind: 'success', text: `当前：${current.name}\n${lines.join('\n')}` };
              }
              // 先按 id 精确匹配，再按显示名匹配（名字允许重复，所以只认第一个）
              const target =
                items.find((i) => i.id === wanted) ??
                items.find((i) => i.name.toLowerCase() === wanted.toLowerCase());
              if (!target) return { kind: 'error', text: `找不到角色卡「${wanted}」` };
              await store.setActivePersona(target.id);
              refreshSections();
              return { kind: 'success', text: `已切换到「${target.name}」（${target.id}）` };
            } catch (err) {
              return { kind: 'error', text: String(err?.message ?? err) };
            }
          },
        },
      ];
      for (const cmd of commands) {
        try {
          c.commands.register(cmd);
        } catch (err) {
          ctx.logger?.warn?.('%s 注册命令 /%s 失败：%s', LOG, cmd.name, String(err?.message ?? err));
        }
      }
    });
  } catch (err) {
    ctx.logger?.warn?.('%s 命令注册不可用：%s', LOG, String(err?.message ?? err));
  }

  // ---------- 4. HTTP API（面板用） ----------

  const prefix = cfg.apiPrefix || '/my-memory/api';

  async function handler(req, res) {
    let url;
    try {
      url = new URL(req.url ?? '/', 'http://127.0.0.1');
    } catch {
      sendJson(res, 400, { error: '请求 URL 不合法' });
      return;
    }
    const sub = url.pathname.slice(prefix.length) || '/';
    try {
      if (sub === '/health' && req.method === 'GET') {
        sendJson(res, 200, { ok: true, dataDir: store.paths.root });
        return;
      }

      // GET /persona → { name, body, updated }
      if (sub === '/persona' && req.method === 'GET') {
        const persona = await store.readPersona();
        sendJson(res, 200, persona);
        return;
      }
      // PUT /persona → 保存 { name, body }（旧版单卡接口 = 保存 active 那张卡）
      if (sub === '/persona' && (req.method === 'PUT' || req.method === 'POST')) {
        const body = await readBody(req);
        const saved = await store.savePersona({ name: body?.name, body: body?.body });
        refreshSections();
        sendJson(res, 200, saved);
        return;
      }

      // ---------- 角色卡（一个角色一个目录） ----------

      // GET /personas → { items: [{ id, name, body, created, updated, path, display }], activeId }
      // id = 目录名；path = agent.md 绝对路径；display = 缩成 ~\.dsh\my-memory\baby\agent.md
      if (sub === '/personas' && req.method === 'GET') {
        const { items, activeId } = await store.listPersonas();
        sendJson(res, 200, { items, activeId });
        return;
      }

      // POST /personas { dir } → 新建 <dir>/agent.md（输入的就是目录名，不是显示名）
      if (sub === '/personas' && req.method === 'POST') {
        const body = await readBody(req);
        const card = await store.createPersona({
          dir: body?.dir ?? body?.name,
          name: body?.name,
          body: body?.body,
        });
        refreshSections();
        sendJson(res, 200, card);
        return;
      }

      // POST /personas/:id/default → 设为默认卡（必须排在通用 /personas/:id 之前）
      if (sub.startsWith('/personas/') && sub.endsWith('/default') && req.method === 'POST') {
        const id = decodeURIComponent(sub.slice('/personas/'.length, -'/default'.length)).trim();
        if (!id) {
          sendJson(res, 400, { error: '缺少角色目录名' });
          return;
        }
        const resDefault = await store.setActivePersona(id);
        refreshSections();
        sendJson(res, 200, { ok: true, activeId: resDefault.activeId });
        return;
      }

      // POST /personas/:id/reveal → 用系统文件管理器打开**这个角色目录**（不是 agent.md 文件）
      if (sub.startsWith('/personas/') && sub.endsWith('/reveal') && req.method === 'POST') {
        const id = decodeURIComponent(sub.slice('/personas/'.length, -'/reveal'.length)).trim();
        if (store.isPersonaNone(id)) {
          sendJson(res, 400, { error: '空白卡没有角色目录：它是虚拟卡，不落磁盘' });
          return;
        }
        if (!id || !(await store.listPersonaIds()).includes(id)) {
          sendJson(res, 404, { error: `找不到角色卡 ${id || ''}` });
          return;
        }
        const dirPath = store.personaDirOf(id);
        try {
          openInFileManager(dirPath);
          sendJson(res, 200, { ok: true, path: dirPath });
        } catch (err) {
          sendJson(res, 400, { error: `打开目录失败：${String(err?.message ?? err)}` });
        }
        return;
      }

      // POST /personas/:id/reload → 重新从磁盘读这张卡（用户在外面手改过 agent.md）
      if (sub.startsWith('/personas/') && sub.endsWith('/reload') && req.method === 'POST') {
        const id = decodeURIComponent(sub.slice('/personas/'.length, -'/reload'.length)).trim();
        if (!id) {
          sendJson(res, 400, { error: '缺少角色目录名' });
          return;
        }
        if (store.isPersonaNone(id)) {
          sendJson(res, 400, { error: '空白卡不能重载：它没有对应的磁盘文件' });
          return;
        }
        if (!(await store.listPersonaIds()).includes(id)) {
          sendJson(res, 404, { error: `找不到角色卡 ${id}` });
          return;
        }
        const card = await store.reloadPersona(id);
        refreshSections();
        sendJson(res, 200, card);
        return;
      }

      // POST /personas/:id/rename { dir } → 把磁盘上的角色目录 <id>/ 改名成 <dir>/
      // （整个目录一起搬：里面如果还有头像/笔记，也要跟着走）
      if (sub.startsWith('/personas/') && sub.endsWith('/rename') && req.method === 'POST') {
        const id = decodeURIComponent(sub.slice('/personas/'.length, -'/rename'.length)).trim();
        if (!id) {
          sendJson(res, 400, { error: '缺少角色目录名' });
          return;
        }
        const body = await readBody(req);
        try {
          const card = await store.renamePersona(id, body?.dir ?? body?.name);
          refreshSections();
          sendJson(res, 200, card);
        } catch (err) {
          // 错误自带 .status（400 目录合法性问题 / 404 源不存在），别靠匹配文案定码
          sendJson(res, Number(err?.status) || 400, { error: String(err?.message ?? err) });
        }
        return;
      }

      // PUT /personas/:id { name?, body? } → 保存该卡（目录名永不改，只改显示名/正文）
      if (sub.startsWith('/personas/') && req.method === 'PUT') {
        const id = decodeURIComponent(sub.slice('/personas/'.length)).trim();
        if (!id) {
          sendJson(res, 400, { error: '缺少角色目录名' });
          return;
        }
        if (store.isPersonaNone(id)) {
          sendJson(res, 400, { error: '空白卡不能编辑：它是虚拟卡，没有可编辑内容' });
          return;
        }
        if (!(await store.listPersonaIds()).includes(id)) {
          sendJson(res, 404, { error: `找不到角色卡 ${id}` });
          return;
        }
        const body = await readBody(req);
        const saved = await store.savePersonaCard(id, { name: body?.name, body: body?.body });
        refreshSections();
        sendJson(res, 200, saved);
        return;
      }

      // DELETE /personas/:id → 删除整个角色目录；只剩一张时 400（注入总得有个角色）
      if (sub.startsWith('/personas/') && req.method === 'DELETE') {
        const id = decodeURIComponent(sub.slice('/personas/'.length)).trim();
        if (!id) {
          sendJson(res, 400, { error: '缺少角色目录名' });
          return;
        }
        if (store.isPersonaNone(id)) {
          sendJson(res, 400, { error: '空白卡不能删除：它是虚拟卡，不是磁盘上的角色目录' });
          return;
        }
        const ids = await store.listPersonaIds();
        if (!ids.includes(id)) {
          sendJson(res, 404, { error: `找不到角色卡 ${id}` });
          return;
        }
        if (ids.length <= 1) {
          sendJson(res, 400, { error: '至少保留一张角色卡' });
          return;
        }
        const resDelete = await store.deletePersona(id);
        refreshSections();
        sendJson(res, 200, { ok: true, removed: resDelete.removed, activeId: resDelete.activeId });
        return;
      }

      // ---------- 会话级角色绑定 ----------

      // GET /session/persona?session=<id> → { sessionId, personaId, name, locked, inherited }
      // locked **恒为 false**：随时都能改绑。字段留着只是因为客户端已经按它做了兼容判断，
      // 直接删字段会让老界面拿到 undefined 而变味，留着 false 最省事。
      //
      // why 没绑过也要报一张卡：新建的会话还没挑过角色卡时，注入段本来就回落到了全局默认卡
      // （bound ?? readActivePersonaSync()）。所以这里必须报「实际生效的卡」而不是 null ——
      // 否则界面只能显示占位文案「选择角色」，跟真正注入进去的角色对不上。
      // 附带的好处：默认卡改了，没挑过的会话跟着变；用户一挑就落成会话绑定（inherited=false）。
      if (sub === '/session/persona' && req.method === 'GET') {
        const sessionId = String(url.searchParams.get('session') || '').trim();
        if (!sessionId) {
          sendJson(res, 400, { error: '缺少 session 参数' });
          return;
        }
        const boundId = await store.sessionPersonaId(sessionId);
        const boundCard = boundId ? await store.sessionPersonaCard(sessionId) : null;
        // 绑定的目录被删掉时 sessionPersonaCard 会返回 null，这种情况同样回落默认卡
        const effectiveCard = boundCard ?? (await store.readActivePersona());
        // 一张卡都没有时 readActivePersona 返回 id 为 '' 的占位卡 —— 此时仍然报 null，不假装有卡
        const effectiveId = effectiveCard?.id ? String(effectiveCard.id) : null;
        sendJson(res, 200, {
          sessionId,
          personaId: effectiveId,
          name: effectiveId ? String(effectiveCard?.name ?? '') || null : null,
          locked: false,
          inherited: Boolean(effectiveId && !boundCard),
        });
        return;
      }

      // POST /session/persona { session, personaId } → 绑定（**任何时候都能改**，永远 200）
      if (sub === '/session/persona' && req.method === 'POST') {
        const body = await readBody(req);
        const sessionId = String(body?.session ?? '').trim();
        const personaId = String(body?.personaId ?? '').trim();
        if (!sessionId) {
          sendJson(res, 400, { error: '缺少会话 id' });
          return;
        }
        try {
          const result = await store.bindSessionPersona(sessionId, personaId);
          const card = await store.sessionPersonaCard(sessionId);
          refreshSections();
          sendJson(res, 200, {
            ok: true,
            sessionId,
            personaId: result.personaId,
            name: card?.name ?? null,
            locked: false,
            // 形状与 GET 保持一致：这是用户亲手挑的绑定，不是回落的默认卡
            inherited: false,
          });
        } catch (err) {
          sendJson(res, Number(err?.status) || 400, { error: String(err?.message ?? err) });
        }
        return;
      }

      // ---------- 项目局部记忆开关 ----------

      // GET /project/state?cwd=<绝对路径> → { cwd, memoryPath, exists, enabled, hasLegacy }
      if (sub === '/project/state' && req.method === 'GET') {
        const cwd = String(url.searchParams.get('cwd') || '').trim() || currentDefaultCwd();
        if (!cwd) {
          sendJson(res, 400, { error: '缺少目录路径' });
          return;
        }
        sendJson(res, 200, await store.projectMemoryState(cwd));
        return;
      }

      // POST /project/state { cwd, enabled } → 开关
      // 打开会顺手建文件；关闭**只写状态**，绝不删文件/目录、绝不清空内容。
      if (sub === '/project/state' && req.method === 'POST') {
        const body = await readBody(req);
        const cwd = String(body?.cwd ?? '').trim() || currentDefaultCwd();
        if (!cwd) {
          sendJson(res, 400, { error: '缺少目录路径' });
          return;
        }
        try {
          const state = await store.setProjectMemoryState({ cwd, enabled: body?.enabled === true });
          refreshSections();
          sendJson(res, 200, state);
        } catch (err) {
          sendJson(res, Number(err?.status) || 400, { error: String(err?.message ?? err) });
        }
        return;
      }

      // ---------- 数据目录设置（全局设置页） ----------

      // GET /settings → { dataDir, defaultDataDir, folderName, promptPath }
      if (sub === '/settings' && req.method === 'GET') {
        sendJson(res, 200, {
          dataDir: store.paths.root,
          defaultDataDir: defaultDataDir(),
          folderName: DEFAULT_FOLDER_NAME,
          // 界面上要显示「全局提示词文件在哪」，所以把绝对路径一起报出去
          promptPath: store.paths.prompt,
        });
        return;
      }

      // GET /settings/prompt → { path, text, defaultText, exists }
      // 「全局提示词」存在数据根下的 AGENT.md，面板只是读写这个文件，用户直接改文件也生效。
      if (sub === '/settings/prompt' && req.method === 'GET') {
        const current = await store.readAgentPrompt();
        sendJson(res, 200, {
          path: current.path,
          text: current.text,
          defaultText: DEFAULT_AGENT_PROMPT,
          exists: current.exists,
        });
        return;
      }

      // PUT/POST /settings/prompt { text } → 整份原子写，写完立刻重挂注入段
      if (sub === '/settings/prompt' && (req.method === 'PUT' || req.method === 'POST')) {
        const body = await readBody(req);
        const text = body?.text;
        if (typeof text !== 'string') {
          sendJson(res, 400, { error: 'text 必须是字符串' });
          return;
        }
        // 上限 4000 字：这段每轮都注入，太长会把上下文挤爆
        if (text.length > 4000) {
          sendJson(res, 400, { error: '全局提示词最多 4000 字' });
          return;
        }
        try {
          const saved = await store.writeAgentPrompt(text);
          refreshSections();
          sendJson(res, 200, { ok: true, path: saved.path, text: saved.text });
        } catch (err) {
          sendJson(res, 400, { error: String(err?.message ?? err) });
        }
        return;
      }

      // GET /settings/picker → { supported }：宿主有没有系统文件夹选择能力
      // 只探测、不弹框：路由调用不该有「打开一个模态窗口」这种副作用，
      // 客户端先问一次，有就用选择框，没有就退化成手填路径。
      if (sub === '/settings/picker' && req.method === 'GET') {
        let supported = false;
        try {
          const picker = ctx.get?.('directoryPicker');
          supported = !!picker && typeof picker.capability === 'function';
        } catch {
          supported = false;
        }
        sendJson(res, 200, { supported });
        return;
      }

      // POST /settings/dataDir { parent } 或 { path } → 切换数据根
      // parent = 用户在系统选择框里挑的父目录，插件自己补一层固定子目录名；
      // path = 直接给最终目录（老客户端），但如果不是以 dsh-my-memory 结尾，也当父目录补一层。
      // 空值 = 回到默认根。不迁移旧数据：挪几万条记忆是个不可撤销的大动作，
      // 界面上点一下不该触发；返回 movedFrom 让界面提示一句。
      if (sub === '/settings/dataDir' && req.method === 'POST') {
        const body = await readBody(req);
        const raw = String(body?.parent ?? body?.path ?? '').trim();
        const fallback = defaultDataDir();
        const next = raw ? withFolderName(raw) : fallback;
        const isDefault = next === fallback;
        const movedFrom = store.paths.root;

        if (!isDefault) {
          try {
            await ensureDir(next);
          } catch (err) {
            sendJson(res, 400, { error: `目录创建失败：${String(err?.message ?? err)}` });
            return;
          }
          // 探一下真的可写：建个目录不等于能写文件（ACL/只读盘）
          try {
            await ensureDir(join(next, 'projects'));
          } catch (err) {
            sendJson(res, 400, { error: `目录不可写：${String(err?.message ?? err)}` });
            return;
          }
        }

        // 指针文件永远在 ~/.dsh/ 下，不随数据根移动
        try {
          await writeRootPointer(isDefault ? null : next, pointerFile);
        } catch (err) {
          ctx.logger?.warn?.('%s 写数据根指针失败（本次仍生效，重启后会回退）：%s', LOG, String(err?.message ?? err));
        }

        if (next !== movedFrom) {
          store = createMemoryStore({ dataDir: next });
          // 新根可能一张卡都没有：建个默认卡，否则注入段是空的
          await store.ensurePersonas({ name: cfg.personaName }).catch((err) =>
            ctx.logger?.warn?.('%s 新数据目录初始化角色卡失败：%s', LOG, String(err?.message ?? err)),
          );
          await store.ensureAgentPromptFile().catch((err) =>
            ctx.logger?.warn?.('%s 新数据目录初始化全局提示词失败：%s', LOG, String(err?.message ?? err)),
          );
          refreshSections();
        }
        sendJson(res, 200, { ok: true, dataDir: next, movedFrom });
        return;
      }

      // POST /settings/reveal → 用文件管理器打开当前数据目录
      if (sub === '/settings/reveal' && req.method === 'POST') {
        const dirPath = store.paths.root;
        try {
          await ensureDir(dirPath);
          openInFileManager(dirPath);
          sendJson(res, 200, { ok: true, path: dirPath });
        } catch (err) {
          sendJson(res, 400, { error: `打开目录失败：${String(err?.message ?? err)}` });
        }
        return;
      }

      // GET /memory?scope=global|project&project=<cwd>
      // 项目记忆现在从「该项目自己的 .dsh/MEMORY.md」读，所以 project 参数就是目录路径；
      // 同时把开关状态一起返回，界面不用再单独查一次。
      if (sub === '/memory' && req.method === 'GET') {
        const scope = String(url.searchParams.get('scope') || 'all').toLowerCase();
        const projectCwd = String(url.searchParams.get('project') || '').trim() || currentDefaultCwd();
        const projectState = projectCwd ? await store.projectMemoryState(projectCwd) : null;
        const items = [];
        if (scope !== 'project') {
          for (const entry of await store.listGlobal()) {
            items.push({
              id: entry.id,
              scope: 'global',
              section: entry.section,
              summary: entry.text,
              text: entry.text,
              date: entry.date,
              tags: entry.tags,
            });
          }
        }
        if (scope !== 'global' && projectState) {
          for (const entry of await store.listProjectMemory(projectState.cwd)) {
            items.push({
              id: entry.id,
              scope: 'project',
              section: entry.section,
              summary: entry.text,
              text: entry.text,
              title: entry.text,
              date: entry.date,
              tags: entry.tags,
            });
          }
        }
        // project/slug 保持字符串（老面板直接拿去回传，改成对象会把它变成 "[object Object]"）；
        // 新增的 projectState 才是新信息（路径、存在与否、开关）。
        sendJson(res, 200, {
          scope,
          project: projectState ? basenameOf(projectState.cwd) : null,
          slug: projectState ? projectState.cwd : null,
          projectState: projectState
            ? {
                cwd: projectState.cwd,
                memoryPath: projectState.memoryPath,
                exists: projectState.exists,
                enabled: projectState.enabled,
                hasLegacy: projectState.hasLegacy,
              }
            : null,
          items,
        });
        return;
      }

      // GET /memory/raw?scope=global → 全局记忆文件原文 + 内容版本号
      // rev 是「这份内容的指纹」：面板聚焦时同步一次、保存时带上它做冲突检测。
      if (sub === '/memory/raw' && req.method === 'GET') {
        const scope = String(url.searchParams.get('scope') || 'global').toLowerCase();
        if (scope !== 'global') {
          sendJson(res, 400, { error: 'raw 目前只支持 scope=global' });
          return;
        }
        const raw = await store.readGlobalRaw();
        sendJson(res, 200, { scope: 'global', path: raw.path, text: raw.text, rev: raw.rev });
        return;
      }

      // PUT（或 POST）/memory/raw { scope:'global', text, baseRev?, force? } → 带版本号的整份写回
      // 不校验格式：用户可能手写一半再存；写完让注入段的 mtime 缓存失效，下一轮就是新内容。
      // baseRev 与磁盘不一致 → 409 + 磁盘当前全文（界面据此出 diff），且**绝不写盘**。
      if (sub === '/memory/raw' && (req.method === 'PUT' || req.method === 'POST')) {
        const body = await readBody(req);
        const scope = String(body?.scope || 'global').toLowerCase();
        if (scope !== 'global') {
          sendJson(res, 400, { error: 'raw 目前只支持 scope=global' });
          return;
        }
        const saved = await store.writeGlobalRawCas({
          text: body?.text,
          baseRev: body?.baseRev,
          force: body?.force === true,
        });
        if (!saved.ok) {
          // 409 里的 text 是磁盘当前全文：客户端拿它和用户正在编辑的内容出 diff
          sendJson(res, 409, {
            error: '磁盘上的内容已经变了',
            conflict: true,
            rev: saved.rev,
            text: saved.text,
            baseRev: saved.baseRev,
          });
          return;
        }
        refreshSections();
        sendJson(res, 200, {
          ok: true,
          path: saved.path,
          text: saved.text,
          rev: saved.rev,
          baseRev: body?.baseRev ?? null,
        });
        return;
      }

      // POST /memory → 新增 { text, title, body, scope, project, tags }
      if (sub === '/memory' && req.method === 'POST') {
        const body = await readBody(req);
        const raw = String(body?.text ?? body?.body ?? '').trim();
        // project 现在直接就是那个项目的目录（老客户端传 cwd 也照样能用）
        const targetCwd = String(body?.project ?? '').trim() || currentDefaultCwd();
        const res2 = await remember({
          text: raw,
          scope: body?.scope,
          title: body?.title,
          tags: body?.tags,
          cwd: targetCwd,
        });
        refreshSections();
        sendJson(res, 200, res2);
        return;
      }

      // DELETE /memory/:id
      if (sub.startsWith('/memory/') && req.method === 'DELETE') {
        const id = decodeURIComponent(sub.slice('/memory/'.length)).trim();
        if (!id) {
          sendJson(res, 400, { error: '缺少 id' });
          return;
        }
          const res3 = await store.forgetById(id, { cwd: currentDefaultCwd() });
        if (!res3.removed) {
          sendJson(res, 404, { error: `找不到 id 为 ${id} 的记忆条目` });
          return;
        }
        refreshSections();
        sendJson(res, 200, { removed: true, id, scope: res3.scope, path: res3.path ?? null });
        return;
      }

      // GET /status → 数据目录、条目数、当前目录的局部记忆状态
      if (sub === '/status' && req.method === 'GET') {
        const cwd = String(url.searchParams.get('project') || '').trim() || currentDefaultCwd();
        const s = await store.stats({ cwd });
        const project = s.project;
        // 老字段（slug/project/root）保持原语义：project 是显示名、slug 是可回传的身份，
        // 现在「身份」就是那个目录的绝对路径；新信息放在 projectState 里。
        sendJson(res, 200, {
          dataDir: s.dataDir,
          globalCount: s.globalCount,
          projectCount: s.projectCount,
          slug: project ? project.cwd : null,
          project: project ? basenameOf(project.cwd) : null,
          root: project ? project.cwd : null,
          projectState: project
            ? {
                cwd: project.cwd,
                memoryPath: project.memoryPath,
                exists: project.exists,
                enabled: project.enabled,
                hasLegacy: project.hasLegacy,
              }
            : null,
          sectionOrder: cfg.order,
          personaOrder: cfg.personaOrder,
        });
        return;
      }

      sendJson(res, 404, { error: `未知接口 ${sub}` });
    } catch (err) {
      ctx.logger?.warn?.('%s %s 处理失败：%s', LOG, sub, String(err?.message ?? err));
      sendJson(res, 400, { error: String(err?.message ?? err) });
    }
  }

  try {
    // WebRoute 的 prefix 形态：handler 直接吃 (req, res)，pathname 的 prefix 部分已经由我们自己裁掉
    ctx.webServer.register({ kind: 'prefix', path: prefix, handler });
  } catch (err) {
    ctx.logger?.warn?.('%s 注册 HTTP 路由失败（面板 API 不可用，其余功能正常）：%s', LOG, String(err?.message ?? err));
  }

  ctx.logger?.info?.('%s 已启动：dataDir=%s, api=%s', LOG, store.paths.root, prefix);

  // 启动引导：建数据目录、迁移旧单卡 → personas/、保证至少一张卡。
  // 失败只 warn：可能只是没权限，别拦住插件（注入段会自己回落到旧 persona.md）。
  void (async () => {
    try {
      await ensureDir(store.paths.root);
      const result = await store.ensurePersonas({ name: cfg.personaName });
      if (result.created) {
        ctx.logger?.info?.('%s 已创建默认角色卡 %s', LOG, String(result.id));
      }
      // 全局提示词文件（AGENT.md）：只在缺失时创建，用户改过的绝不覆盖
      await store.ensureAgentPromptFile();
    } catch (err) {
      ctx.logger?.warn?.('%s 初始化角色卡失败：%s', LOG, String(err?.message ?? err));
    }
  })();
}
