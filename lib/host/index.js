// 宿主插件 · @local/dsh-my-memory
//
// 职责边界：
//   - 这里只做「接线」：Config、注入、系统提示段、工具、命令、HTTP 路由
//   - 落盘全在 lib/host/store.js，仓库识别在 lib/host/project.js，原子写在 lib/host/atomic.js
//
// 三条对外通道：
//   1. systemPrompt.section —— 角色卡（my-memory:persona）+ 全局/项目记忆（my-memory:context）
//   2. tools/commands      —— 模型主动记/查/删，用户手动 /remember /memory
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
  defaultDataDir,
  expandUserPath,
  resolveDataDir,
  writeRootPointer,
  DEFAULT_PERSONA_NAME,
  matchScore,
  normalizeTags,
  oneLine,
} from './store.js';

/** Cordis 插件名 */
export const name = 'my-memory';

/**
 * 需要的宿主 Service。
 * workingDirectory / commands 不写进这里：拿不到也应该能用，所以走 ctx.inject 可选注入。
 */
export const inject = ['webServer', 'systemPrompt', 'tools'];

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
    /** 总开关：关掉就不注册任何段/工具/命令/路由 */
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
 * 误判后果很轻：项目记忆也只是本仓库可见，随时能 memory_forget。
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
  const pointerFile = cfg.rootPointerFile ? expandUserPath(cfg.rootPointerFile) : undefined;
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

  /**
   * 角色卡段文本：取 activeId 那张卡的正文（activeId 失效时回落排序第一张）。
   * 只做一件事：超出 personaBudget 后截断加省略号。正文不拆小节、不改写。
   * @param {any} assembly
   * @returns {string}
   */
  function personaSectionText(assembly) {
    try {
      const persona = store.readActivePersonaSync();
      const body = String(persona.body ?? '').replace(/\s+$/, '');
      if (!body) return '';
      const budget = Math.floor(Number(cfg.personaBudget) || 0);
      const rendered = budget > 0 && body.length > budget ? `${body.slice(0, budget)}…` : body;
      const name = oneLine(persona.name) || cfg.personaName;
      return `# 角色设定\n\n你现在扮演这个角色（角色卡「${name}」）：\n${rendered}`;
    } catch (err) {
      ctx.logger?.warn?.('%s 角色卡段计算失败：%s', LOG, String(err?.message ?? err));
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
      const globalText = store.globalTextSync();
      const cwd = cwdFrom(ctx, assembly);
      const project = cwd ? detectProject(cwd) : null;
      const projectText = project ? store.projectIndexTextSync(project.slug) : '';
      const projectName = project ? project.name : '';

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
          `# 项目记忆 · ${projectName}\n\n${projectBody}\n\n> 需要全文时用 memory_recall 查询，memory_list 看全部条目。`,
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

  /** 解析 HTTP 的 project 参数：可以是 cwd，也可以直接是 slug */
  async function projectFromParam(raw) {
    const value = String(raw ?? '').trim();
    if (!value) return projectOfCwd(currentDefaultCwd());
    const detected = projectOfCwd(value);
    if (detected) return detected;
    const slugs = await store.listProjectSlugs();
    if (slugs.includes(value)) {
      return { slug: value, name: value.replace(/-[0-9a-f]{6}$/, ''), root: null };
    }
    return null;
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
   * 统一的新增入口（工具、命令、HTTP 共用，保证行为一致）。
   * @param {{text:string, scope?:string, title?:string, tags?:string[]|string, cwd?:string|null, project?:any}} input
   *   project 给了就直接用（HTTP 按 slug 指定时），否则按 cwd 探测
   * @returns {Promise<{id:string, scope:'global'|'project', path:string, slug?:string}>}
   */
  async function remember(input) {
    const text = String(input?.text ?? '').trim();
    if (!text) throw new Error('要记住的内容不能为空');
    const project =
      input?.project !== undefined
        ? input.project
        : projectOfCwd(input?.cwd ?? currentDefaultCwd());
    const target = resolveScope(input?.scope, text, project);
    if (target === 'project') {
      if (!project) throw new Error('当前目录不在 git 仓库里，没法写项目记忆；改用 scope=global');
      const res = await store.appendProject({
        root: project.root,
        slug: project.slug,
        title: input?.title,
        body: text,
        tags: input?.tags,
      });
      return { id: res.id, scope: 'project', path: res.path, slug: res.slug };
    }
    const res = await store.appendGlobal({ text, section: input?.title || '通用', tags: input?.tags });
    return { id: res.id, scope: 'global', path: res.path };
  }

  /**
   * 检索：全局 + 项目（可限定）。
   * 关键词走 bigram/子串匹配；不传 query 返回最近的 N 条。
   * @param {{query?:string, scope?:string, limit?:number, cwd?:string|null}} input
   * @returns {Promise<Array<{id:string, scope:string, date:string, text:string, score:number}>>}
   */
  async function recall(input) {
    const query = String(input?.query ?? '').trim();
    const limit = Math.max(1, Math.floor(Number(input?.limit) || cfg.recallLimit));
    const wanted = String(input?.scope ?? 'auto').trim().toLowerCase();
    const project = projectOfCwd(input?.cwd ?? currentDefaultCwd());
    const scopes = [];
    if (wanted === 'global') scopes.push('global');
    else if (wanted === 'project') scopes.push('project');
    else scopes.push('global', 'project');

    const rows = [];
    if (scopes.includes('global')) {
      for (const entry of await store.listGlobal()) {
        rows.push({
          id: entry.id,
          scope: 'global',
          date: entry.date,
          text: entry.text,
          tags: entry.tags,
          order: 0,
        });
      }
    }
    if (scopes.includes('project') && project) {
      const listed = await store.listProject(project.slug);
      for (const item of listed.entries) {
        const full = await store.readProjectEntry(project.slug, item.id);
        rows.push({
          id: item.id,
          scope: 'project',
          date: item.date,
          text: full ? `${full.title}\n${full.body}` : item.summary,
          tags: full?.tags ?? [],
          order: 1,
        });
      }
    }
    if (!query) {
      // 无 query：全局按文件顺序倒着取（越靠后越新），项目按索引顺序倒着取
      const globalRows = rows.filter((r) => r.scope === 'global').reverse();
      const projectRows = rows.filter((r) => r.scope === 'project').reverse();
      return [...projectRows, ...globalRows].slice(0, limit).map((r) => ({ ...r, score: 0 }));
    }
    const scored = rows
      .map((r) => ({ ...r, score: matchScore(query, `${r.text}\n${(r.tags || []).join(' ')}`) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  }

  // ---------- 3. 工具 ----------
  //
  // 关于 parameters 的写法（这里是**踩坑后的结论**）：
  // DSH 的 `parameters: { text: { type, required, description } }` 是 defineTool 的
  // **author 侧 DSL**，只有 defineTool 会把它编译成 JSON Schema
  // （parameterSchemaSpecToJsonSchema）。我们为了零依赖直接 register 原对象，
  // 注册时 parameters 会被原样交给模型 —— 所以这里必须直接写**真正的、object 根**的
  // JSON Schema，否则模型收到的参数声明是坏的（不报错，但工具调用会变差）。
  // output.schema 同样受 DSH 的 JSON Schema 子集约束：只用
  // type / properties / required / additionalProperties / items / enum / const。

  try {
    const tools = [
      {
        name: 'memory_remember',
        description:
          '把一条值得长期记住的信息写进记忆库。只记「稳定的偏好 / 事实 / 决定 / 关系」，以及用户明确要求记住的内容；' +
          '不要记对话过程、临时任务、一次性的调试输出。' +
          'scope=auto（默认）时：当前目录是 git 仓库且内容像技术细节 → 写进该项目记忆；否则写进全局记忆。' +
          '全局记忆只装「人相关、通用、与具体技术无关」的内容（称呼、口味、作息、脾气、偏好）；' +
          '技术细节（API、配置项、报错、命令、路径、版本号）必须进项目记忆，否则会挤爆每轮都注入的全局记忆。' +
          '正文要一句话说清、能脱离上下文独立理解。',
        parameters: {
          type: 'object',
          additionalProperties: false,
          properties: {
            text: { type: 'string', description: '一句话记忆，主谓宾完整、能独立理解' },
            scope: {
              type: 'string',
              enum: ['auto', 'global', 'project'],
              description: 'auto（默认）按「有无 git 仓库 + 是否像技术细节」自动选；global 只进全局；project 只进项目',
            },
            title: {
              type: 'string',
              description:
                '项目记忆的标题（短标题）；全局记忆用它当分组名（如「称呼」「作息」），默认「通用」',
            },
            tags: { type: 'string', description: '逗号分隔的标签，如 "插件,api"' },
          },
          required: ['text'],
        },
        output: {
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              id: { type: 'string' },
              scope: { type: 'string' },
              path: { type: 'string' },
            },
          },
          render: (_args, value) => [
            {
              type: 'text',
              text: `已记住（${value.scope}，id=${value.id}）：${value.path}`,
            },
          ],
        },
        isConcurrencySafe: () => false,
        async execute(args, exec) {
          const res = await remember({
            text: args?.text,
            scope: args?.scope,
            title: args?.title,
            tags: normalizeTags(args?.tags),
            cwd: cwdFrom(ctx, exec),
          });
          refreshSections();
          return { id: res.id, scope: res.scope, path: res.path };
        },
      },
      {
        name: 'memory_recall',
        description:
          '按关键词检索记忆（全局 + 当前项目，或指定 scope）。返回命中的条目 id、日期和正文。' +
          '不传 query 则返回最近 N 条。用于「你还记得…」「上次那个配置怎么写」这类需要翻记忆的场景。',
        parameters: {
          type: 'object',
          additionalProperties: false,
          properties: {
            query: { type: 'string', description: '关键词或实体；留空 = 最近 N 条' },
            scope: {
              type: 'string',
              enum: ['auto', 'global', 'project'],
              description: 'auto（默认，全局+当前项目）| global | project',
            },
            limit: { type: 'number', description: `条数，默认 ${cfg.recallLimit}` },
          },
        },
        output: {
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              count: { type: 'number' },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    id: { type: 'string' },
                    scope: { type: 'string' },
                    date: { type: 'string' },
                    text: { type: 'string' },
                  },
                },
              },
            },
          },
          render: (_args, value) => [
            {
              type: 'text',
              text: value.count
                ? value.items
                    .map((it) => `- [${it.id}] ${it.scope} · ${it.date || '未知日期'}：${it.text}`)
                    .join('\n')
                : '没有找到相关记忆。',
            },
          ],
        },
        isConcurrencySafe: () => true,
        async execute(args, exec) {
          const items = await recall({
            query: args?.query,
            scope: args?.scope,
            limit: args?.limit,
            cwd: cwdFrom(ctx, exec),
          });
          return {
            count: items.length,
            items: items.map((it) => ({ id: it.id, scope: it.scope, date: it.date, text: it.text })),
          };
        },
      },
      {
        name: 'memory_forget',
        description:
          '按 id 删除一条记忆。g_ 开头的是全局记忆（从 MEMORY.md 删掉那一行），p_ 开头的是项目记忆（删条目文件 + 索引行）。' +
          'id 可以通过 memory_list / memory_recall 拿到。找不到会明确报错。',
        parameters: {
          type: 'object',
          additionalProperties: false,
          properties: {
            id: { type: 'string', description: '条目 id，如 g_1a2b3c4d / p_9f8e7d6c' },
          },
          required: ['id'],
        },
        output: {
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              id: { type: 'string' },
              scope: { type: 'string' },
              slug: { type: 'string' },
            },
          },
          render: (_args, value) => [
            { type: 'text', text: `已删除 ${value.id}（${value.scope}${value.slug ? ` · ${value.slug}` : ''}）` },
          ],
        },
        isConcurrencySafe: () => false,
        async execute(args) {
          const id = String(args?.id ?? '').trim();
          if (!id) throw new Error('id 不能为空');
          const res = await store.forgetById(id);
          if (!res.removed) throw new Error(`找不到 id 为 ${id} 的记忆条目`);
          refreshSections();
          return { id, scope: res.scope || '', slug: res.slug || '' };
        },
      },
      {
        name: 'memory_list',
        description:
          '列出记忆条目（id + 摘要 + 日期）。scope=all（默认）返回全局和当前项目；global 只看全局；project 只看当前项目。',
        parameters: {
          type: 'object',
          additionalProperties: false,
          properties: {
            scope: {
              type: 'string',
              enum: ['all', 'global', 'project'],
              description: 'all（默认）| global 只看全局 | project 只看当前项目',
            },
          },
        },
        output: {
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              globalCount: { type: 'number' },
              projectCount: { type: 'number' },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    id: { type: 'string' },
                    scope: { type: 'string' },
                    summary: { type: 'string' },
                    date: { type: 'string' },
                  },
                },
              },
            },
          },
          render: (_args, value) => [
            {
              type: 'text',
              text: value.items.length
                ? value.items.map((it) => `- [${it.id}] ${it.scope} · ${it.date}：${it.summary}`).join('\n')
                : '记忆库是空的。',
            },
          ],
        },
        isConcurrencySafe: () => true,
        async execute(args, exec) {
          const wanted = String(args?.scope ?? 'all').trim().toLowerCase();
          const cwd = cwdFrom(ctx, exec);
          const project = projectOfCwd(cwd);
          const items = [];
          let globalCount = 0;
          let projectCount = 0;
          if (wanted !== 'project') {
            for (const entry of await store.listGlobal()) {
              globalCount += 1;
              items.push({ id: entry.id, scope: 'global', summary: entry.text, date: entry.date });
            }
          }
          if (wanted !== 'global' && project) {
            const listed = await store.listProject(project.slug);
            for (const item of listed.entries) {
              projectCount += 1;
              items.push({ id: item.id, scope: 'project', summary: item.summary, date: item.date });
            }
          }
          return { globalCount, projectCount, items };
        },
      },
    ];
    for (const tool of tools) {
      try {
        ctx.tools.register(tool);
      } catch (err) {
        // 单个工具挂掉只 warn：不能让一个工具的 schema 问题带走整个插件
        ctx.logger?.warn?.('%s 注册工具 %s 失败：%s', LOG, tool.name, String(err?.message ?? err));
      }
    }
  } catch (err) {
    ctx.logger?.warn?.('%s 工具注册不可用：%s', LOG, String(err?.message ?? err));
  }

  // ---------- 4. 命令（可选注入：没有 commands 服务也能跑） ----------

  try {
    ctx.inject(['commands'], (c) => {
      const commands = [
        {
          name: 'remember',
          description: '把这句话记成记忆（等价 memory_remember，scope=auto）',
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
              const project = projectOfCwd(cwdFrom(ctx, input) ?? currentDefaultCwd());
              const s = await store.stats(project ? project.slug : null);
              return {
                kind: 'success',
                text: [
                  `全局记忆 ${s.globalCount} 条`,
                  project
                    ? `项目记忆 ${s.projectCount} 条（${project.name} / ${project.slug}）`
                    : '项目记忆 0 条（当前目录不在 git 仓库里）',
                  `数据目录：${s.dataDir}`,
                ].join('\n'),
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

  // ---------- 5. HTTP API（面板用） ----------

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
        if (!(await store.listPersonaIds()).includes(id)) {
          sendJson(res, 404, { error: `找不到角色卡 ${id}` });
          return;
        }
        const card = await store.reloadPersona(id);
        refreshSections();
        sendJson(res, 200, card);
        return;
      }

      // PUT /personas/:id { name?, body? } → 保存该卡（目录名永不改，只改显示名/正文）
      if (sub.startsWith('/personas/') && req.method === 'PUT') {
        const id = decodeURIComponent(sub.slice('/personas/'.length)).trim();
        if (!id) {
          sendJson(res, 400, { error: '缺少角色目录名' });
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

      // ---------- 数据目录设置（全局设置页） ----------

      // GET /settings → { dataDir, defaultDataDir }
      if (sub === '/settings' && req.method === 'GET') {
        sendJson(res, 200, { dataDir: store.paths.root, defaultDataDir: defaultDataDir() });
        return;
      }

      // POST /settings/dataDir { path } → 切换数据根
      // 空值 / 等于默认值 = 回到默认根（并清掉指针文件）。不迁移旧数据：挪几万条记忆
      // 是个不可撤销的大动作，界面上点一下不该触发这种副作用；返回 movedFrom 让界面提示。
      if (sub === '/settings/dataDir' && req.method === 'POST') {
        const body = await readBody(req);
        const raw = String(body?.path ?? '').trim();
        const fallback = defaultDataDir();
        const next = raw ? expandUserPath(raw) : fallback;
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

      // GET /memory?scope=global|project&project=<cwd|slug>
      if (sub === '/memory' && req.method === 'GET') {
        const scope = String(url.searchParams.get('scope') || 'all').toLowerCase();
        const project = await projectFromParam(url.searchParams.get('project'));
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
        if (scope !== 'global' && project) {
          const listed = await store.listProject(project.slug);
          for (const item of listed.entries) {
            const full = await store.readProjectEntry(project.slug, item.id);
            items.push({
              id: item.id,
              scope: 'project',
              section: project.name,
              summary: item.summary,
              text: full?.body ?? item.summary,
              title: full?.title ?? item.summary,
              date: item.date,
              tags: full?.tags ?? [],
            });
          }
        }
        sendJson(res, 200, { scope, slug: project?.slug ?? null, project: project?.name ?? null, items });
        return;
      }

      // GET /memory/raw?scope=global → 全局记忆文件的原文（面板只需要把它铺出来）
      if (sub === '/memory/raw' && req.method === 'GET') {
        const scope = String(url.searchParams.get('scope') || 'global').toLowerCase();
        if (scope !== 'global') {
          sendJson(res, 400, { error: 'raw 目前只支持 scope=global' });
          return;
        }
        sendJson(res, 200, { scope: 'global', path: store.paths.global, text: store.globalTextSync() });
        return;
      }

      // PUT /memory/raw { scope:'global', text } → 原子写回 MEMORY.md 原文
      // 不校验格式：用户可能手写一半再存；写完让注入段的 mtime 缓存失效，下一轮就是新内容
      if (sub === '/memory/raw' && (req.method === 'PUT' || req.method === 'POST')) {
        const body = await readBody(req);
        const scope = String(body?.scope || 'global').toLowerCase();
        if (scope !== 'global') {
          sendJson(res, 400, { error: 'raw 目前只支持 scope=global' });
          return;
        }
        const saved = await store.writeGlobalRaw(body?.text);
        refreshSections();
        sendJson(res, 200, { ok: true, path: saved.path, text: saved.text });
        return;
      }

      // POST /memory → 新增 { text, title, body, scope, project, tags }
      if (sub === '/memory' && req.method === 'POST') {
        const body = await readBody(req);
        const raw = String(body?.text ?? body?.body ?? '').trim();
        const project = await projectFromParam(body?.project);
        const res2 = await remember({
          text: raw,
          scope: body?.scope,
          title: body?.title,
          tags: body?.tags,
          project: project ?? null,
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
        const res3 = await store.forgetById(id);
        if (!res3.removed) {
          sendJson(res, 404, { error: `找不到 id 为 ${id} 的记忆条目` });
          return;
        }
        refreshSections();
        sendJson(res, 200, { removed: true, id, scope: res3.scope, slug: res3.slug ?? null });
        return;
      }

      // GET /status → 数据目录、条目数、当前项目 slug
      if (sub === '/status' && req.method === 'GET') {
        const project = await projectFromParam(url.searchParams.get('project'));
        const s = await store.stats(project?.slug ?? null);
        sendJson(res, 200, {
          dataDir: s.dataDir,
          globalCount: s.globalCount,
          projectCount: s.projectCount,
          slug: project?.slug ?? null,
          project: project?.name ?? null,
          root: project?.root ?? null,
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
    } catch (err) {
      ctx.logger?.warn?.('%s 初始化角色卡失败：%s', LOG, String(err?.message ?? err));
    }
  })();
}
