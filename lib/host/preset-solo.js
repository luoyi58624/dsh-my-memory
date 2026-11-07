// 宿主插件（预设内作用域） · @local/dsh-my-memory/preset-solo
//
// 唯一职责：在某个 agent 预设（例如「聊天模式」）的**作用域**里做工具可见性白名单 ——
// 只对选中该预设的 agent 生效，标准模式等其它预设完全不受影响。
//
// why 白名单只能在这里做：
//   要藏掉的 `working_directory` 来自根层 @deepseek-ai/dsh-tool-working-directory，
//   `load_workspace_dependencies` 由桌面宿主 dsh-desktop-host 启动时用 ctx.plugin() 硬挂
//   （见其 lib/index.js 的 apply），两者都没有「按预设关掉」的配置开关；
//   而它们都是**全局注册**的工具，所以只能在 agent 作用域里用 registry 的可见性过滤摘掉。
//
// 历史说明（保留备查）：本插件曾经用 `complete: true` 提示段独占整个系统提示词，
// 顺带 suppressRuntimeContext() 并影子覆盖 working-directory:current。实测模型不遵守
// 「只写一句话」那套要求，而且 complete 段会把宿主那些官方英文段整片顶掉，不划算，已放弃。
// 现在聊天模式的提示词由**根层 my-memory 正常注入**（my-memory:agent / my-memory:persona /
// my-memory:context 三段，与标准模式同口径），聊天模式只是工具更少。
//
// restrict 只写进「本 agent 的作用域层」（dsh-scope 的 ScopedLayers.effect 按 scopeOf(ctx) 分层，
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
 * tools 是硬依赖：工具白名单是本插件**唯一**职责，缺了它这个 preset 就是错的。
 * （不再需要 systemPrompt：提示词由根层 my-memory 正常注入。）
 */
export const inject = ['tools'];

/**
 * 聊天模式默认保留的工具名：@xmanrui/dsh-im 提供的 IM 工具。
 *
 * why 列全 6 个：dsh-im 只在 IM 会话里注册其中一部分（普通会话里通常只有
 * group_history / group_file / return_file 三个），多列几个名字无害 ——
 * 真正传给 restrict() 之前会和「当前已知的全局工具名」取交集，
 * 不然 restrict() 会因为未知名字直接抛错（见 apply 里的取交集逻辑）。
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
 * 在挂载上下文的作用域里注册工具可见性白名单（本插件唯一职责）。
 * @param {any} ctx 预设内（agent 作用域）的 cordis 上下文
 * @param {{allow?: string[]}|undefined} config 插件配置（可选）
 */
export function apply(ctx, config) {
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
    // 白名单失败不能让整个 preset 挂掉；
    // 退化成「工具不裁剪」是可解释的降级，日志里留证据。
    ctx.logger?.warn?.('[my-memory:preset-solo] 工具白名单注册失败：%s', String(err?.message ?? err));
  }
}
