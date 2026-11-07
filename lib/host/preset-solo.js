// 宿主插件（预设内作用域） · @local/dsh-my-memory/preset-solo
//
// 用途：把「系统提示词只留 my-memory 的裸正文 + 工具只留 IM」做成一整套**作用域级**开关 ——
// 挂在某个 agent preset（例如「聊天模式」）里，只对选中该预设的 agent 生效，
// 标准模式等其它预设完全不受影响。
//
// 四件事，机制全部从源码读出来（不是猜的）：
//
//   1. complete 段：@deepseek-ai/dsh-system-prompt 的 assemble() 末尾把 `sections` 整体换成
//      `[completeSection]`（无 complete 段时才用瀑布的结果）。所以只要本插件在自己的作用域里
//      注册一个 complete:true 的段，根层那几段英文（harness:identity / deployment:persona-prefix /
//      ui:deliverable-file-references / harness:source / app:web-surface）就全部被丢弃，
//      整段提示词只剩这一段的内容。
//      注意「同一作用域只能有一个 complete 段」，多一个直接组装失败 ——
//      因此不要再往同一个 preset 里挂第二个 complete（比如 persona 的 complete:true）。
//      聊天模式的正文规定为「一句多余的话都不要写」：
//      全局记忆裸正文 + 空行 + 角色卡裸正文（无标题、无介绍句、不含 AGENT.md）。
//
//   2. suppressRuntimeContext()：去掉**可选**的 runtime-context 贡献
//      （sandbox:policy / approval:policy / harness:source / app:web-surface）。
//      可选贡献清空后 renderContextSections() 得到空列表，joinContextSections()
//      返回 ''，RuntimeContextProjection.project() 就不再产出那条
//      "Current runtime context…" 的 user 消息。
//
//   3. working-directory:current 是 required:true 的**强制**上下文，抑制器拦不住，
//      而且 working-directory 服务还会在 system-prompt/assemble 瀑布里把它写回。
//      这里在**同一作用域**注册一条同名 context 把全局那条影子覆盖成空文本：
//      merge(scope) 之后 providers / requiredContexts 取到的都是这条（非 required），
//      于是 assemble 末尾的 required 过滤和 refreshContext() 的「补回 required」
//      都不会把它带回来，最终快照里一条 context 都没有。
//
//   4. tools.restrict({ allow }):工具可见性白名单，聊天模式只留 IM 工具。
//      为什么只能在这里做：要藏掉的 `working_directory` 来自根层
//      @deepseek-ai/dsh-tool-working-directory，`load_workspace_dependencies` 由桌面宿主
//      dsh-desktop-host 启动时用 ctx.plugin() 硬挂（见其 lib/index.js 的 apply），
//      两者都没有「按预设关掉」的配置项；而它们都是**全局注册**的工具，
//      所以只能在 agent 作用域里用 registry 的可见性过滤把它们摘掉。
//
// 四件事都只写进「本 agent 的作用域层」（dsh-scope 的 ScopedLayers.effect 按 scopeOf(ctx) 分层，
// merge 时近作用域覆盖远作用域），所以不会泄漏到别的 agent。
//
// 关于 restrict 的真实语义（读 @deepseek-ai/dsh-tools 的 ToolsService.restrict 得到）：
//   - 入参 ToolRestriction = { allow?: readonly string[]; deny?: readonly string[] }；
//   - allow 是**精确工具名**白名单（内部 new Set(allow) + Set.has），**不支持通配**，
//     匹配的是「注册时的工具名」（defineTool({ name })），不是别的 key；
//   - 作用域：必须在**带 scope 的 ctx**（agent.ctx / preset scope）里调用，否则直接抛错；
//     只约束**继承来的**工具（全局 + 祖先作用域），本作用域自己注册的工具豁免；
//     多个 restriction 取交集；对**子作用域**同样生效（链上逐层 admits）。
//   - 未知名字会抛错（`names unknown global tool…`），所以多列的名字必须先取交集再传；
//   - 返回值是「撤销这条 restriction」的 disposer，交给 ctx.effect 注册就能在卸载时自动摘掉。

/** Cordis 插件名 */
export const name = 'my-memory-preset-solo';

/**
 * 需要的宿主 Service。
 * myMemoryPrompt 由根层 @local/dsh-my-memory 提供，但它属于**可选**依赖：
 * 用户把 my-memory 关掉（config.enabled=false）时它不存在，此时本插件应降级成
 * 「提示词为空」而不是让整个 preset 挂起，所以不写进 inject，改用 ctx.get 懒取。
 * tools 是硬依赖：工具白名单是本插件的核心职责之一，缺了它这个 preset 就是错的。
 */
export const inject = ['systemPrompt', 'tools'];

/** 本插件注册的唯一提示段的段名（complete 段只有一段，名字用于诊断） */
export const SECTION_SOLO = 'my-memory:preset-solo';

/** working-directory 服务的强制上下文名：要影子覆盖成空文本 */
export const WORKING_DIRECTORY_CONTEXT = 'working-directory:current';

/**
 * 聊天模式默认保留的工具名：@xmanrui/dsh-im 提供的 IM 工具。
 *
 * why 列全 6 个：dsh-im 只在 IM 会话里注册其中一部分（普通会话里通常只有
 * group_history / group_file / return_file 三个），多列几个名字无害 ——
 * 真正传给 restrict() 之前会和「当前已知的全局工具名」取交集，
 * 不然 restrict() 会因为未知名字直接抛错（见 applyToolWhitelist）。
 */
export const DEFAULT_ALLOWED_TOOLS = Object.freeze([
  'dsh_im_context',
  'dsh_im_files',
  'dsh_im_group_file',
  'dsh_im_group_history',
  'dsh_im_reply_to',
  'dsh_im_return_file',
]);

/**
 * 把 my-memory 的两份**裸正文**按聊天模式的规定拼成一段完整提示词：
 * 全局记忆在前、角色卡在后，中间空一行；空段直接丢掉（不留多余空行）。
 *
 * 为什么用「裸」字段而不是 personaText/contextText：那两个是给其它模式的成品文本，
 * 带「# 角色设定」「# 长期记忆（全局）」标题和「你现在扮演这个角色（角色卡「X」）：」介绍句，
 * 还会带上 AGENT.md 的「# 全局对话要求」；聊天模式要求一句多余的话都不要写。
 * 单段抛错只丢这一段，不影响整段提示词 —— 注入失败绝不能让模型请求崩掉。
 * @param {{personaRaw?:Function, memoryRaw?:Function}|undefined} prompt 根层 my-memory 暴露的读取函数
 * @param {any} assembly dsh-system-prompt 组装时传入的上下文（含 agent/session）
 * @returns {string} 两段都空时返回空串（系统提示词为空是正确行为，不塞占位符）
 */
export function joinSoloText(prompt, assembly) {
  const parts = [];
  if (!prompt || typeof prompt !== 'object') return '';
  // 顺序：全局记忆 → 角色卡
  for (const fn of [prompt.memoryRaw, prompt.personaRaw]) {
    if (typeof fn !== 'function') continue;
    let text = '';
    try {
      text = String(fn(assembly) ?? '');
    } catch {
      text = '';
    }
    if (text) parts.push(text);
  }
  return parts.join('\n\n');
}

/**
 * 取「当前 registry 里可被 restrict 约束的全局工具名」。
 *
 * why 需要它：restrict() 对未知全局工具名抛错，而我们的默认清单里故意多写了几个
 * 可能还没注册的 IM 工具名；restrict() 内部校验用的就是 view(scope).restrictableNames，
 * 这里用同一个集合做交集，多写名字就变成无害的。
 * @param {any} tools tools Service
 * @returns {Set<string>|undefined} 拿不到（没有 view()，老版本宿主）时返回 undefined
 */
export function restrictableToolNames(tools) {
  try {
    const view = typeof tools?.view === 'function' ? tools.view() : undefined;
    const names = view?.restrictableNames;
    return names instanceof Set ? names : undefined;
  } catch {
    return undefined;
  }
}

/**
 * 把 config.allow 归一成字符串数组：非数组 / 空数组之外的脏数据一律回落默认值。
 * @param {any} config 插件配置
 * @returns {string[]}
 */
export function allowListOf(config) {
  const raw = Array.isArray(config?.allow) ? config.allow : DEFAULT_ALLOWED_TOOLS;
  const out = [];
  for (const name of raw) {
    const text = typeof name === 'string' ? name.trim() : '';
    if (text && !out.includes(text)) out.push(text);
  }
  return out;
}

/**
 * 在挂载上下文的作用域里注册「唯一提示段 + 抑制器 + 强制上下文影子 + 工具白名单」。
 * @param {any} ctx 预设内（agent 作用域）的 cordis 上下文
 * @param {{allow?: string[]}|undefined} config 插件配置（可选）
 */
export function apply(ctx, config) {
  /** 懒取根层的 my-memory 提示词服务（缺失 = 用户关了 my-memory，返回空段） */
  function promptOf() {
    try {
      return ctx.get?.('myMemoryPrompt');
    } catch {
      return undefined;
    }
  }

  ctx.systemPrompt.section({
    name: SECTION_SOLO,
    // complete 段是唯一段，order 不参与排序；给 0 只是为了满足「必须是有限数」的校验。
    order: 0,
    // 函数 text：每轮组装都会求值，改角色卡/记忆下一轮就生效。
    text: (assembly) => joinSoloText(promptOf(), assembly),
    // 正文里的 `{}` 不能被当变量插值，未知变量会让整段组装失败。
    interpolate: false,
    complete: true,
  });

  // 去掉可选的 runtime-context 贡献（让那条 "Current runtime context…" user 消息彻底消失）
  ctx.systemPrompt.suppressRuntimeContext();

  // 影子覆盖 required 的 working-directory 上下文（空文本 = 渲染阶段被丢弃）
  ctx.systemPrompt.context({
    name: WORKING_DIRECTORY_CONTEXT,
    order: ctx.systemPrompt.getContextOrder('WORKING_DIRECTORY'),
    text: '',
    interpolate: false,
  });

  // 工具白名单：聊天模式只留 IM，其它工具（working_directory / load_workspace_dependencies …）
  // 在**本作用域**里全部不可见。
  const allow = allowListOf(config);
  const known = restrictableToolNames(ctx.tools);
  // 已知才取交集；探测不到（没有 view()）就原样传，让 restrict 自己校验名字。
  const effective = known ? allow.filter((toolName) => known.has(toolName)) : allow;
  if (known && effective.length !== allow.length) {
    const missing = allow.filter((toolName) => !known.has(toolName));
    ctx.logger?.debug?.(
      '[my-memory:preset-solo] 这些白名单工具此刻还没注册，已跳过：%s',
      missing.join(', '),
    );
  }
  try {
    // restrict() 返回「撤销这条 restriction」的 disposer；交给 effect 注册，
    // 插件卸载 / preset 换代时白名单自动失效，不会残留在 registry 里。
    ctx.effect(
      () => ctx.tools.restrict({ allow: effective }),
      'my-memory:preset-solo tools.restrict()',
    );
  } catch (err) {
    // 白名单失败不能让整个 preset 挂掉（挂了聊天模式就没有提示词了）；
    // 退化成「工具不裁剪」是可解释的降级，日志里留证据。
    ctx.logger?.warn?.('[my-memory:preset-solo] 工具白名单注册失败：%s', String(err?.message ?? err));
  }
}
