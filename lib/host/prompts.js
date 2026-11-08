// 三份 Markdown 的提示词读取：所有模式共用正文，会话绑定优先于默认角色。

import { join } from 'node:path';

/** 从 DSH 的会话/命令上下文取得会话 id。 */
export function sessionIdFrom(source) {
  const agent = source?.agent;
  const session = agent?.session ?? source?.session;
  return String(session?.id ?? session?.sessionId ?? agent?.sessionId ?? source?.sessionId ?? '').trim();
}

/**
 * 这是不是**子代理**会话。
 *
 * 判据用会话头的 `delegationDepth`：dsh-subagent 创建子会话时把父的深度 +1 写进
 * 会话 meta（见 @deepseek-ai/dsh-subagent 的 `delegationDepthOf()` 与子会话 header），
 * 所以 `> 0` 就一定是被 spawn 出来的子代理，主会话恒为 0。
 * 为什么不用「有没有 parentSessionId」之类的字段：depth 是宿主自己维护的单调下限，
 * 比任何派生字段都稳；拿不到时按 0 处理（宁可多注入一份，也不无故掐掉主会话的人设）。
 * @param {any} source assembly（含 agent/session）
 * @returns {boolean}
 */
export function isSubagentSession(source) {
  const session = source?.agent?.session ?? source?.session;
  const depth = Number(session?.header?.delegationDepth ?? 0);
  return Number.isFinite(depth) && depth > 0;
}

/** 兼容显式配置的记忆长度上限；默认 0 表示保留全文。 */
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

/** 空白文件不占提示段；有内容时保留原文，包括 Markdown 的换行与尾部空格。 */
function present(text) {
  const value = String(text ?? '');
  return value.trim() ? value : '';
}

/**
 * 「路径约定」小节：说清 `~` 到底指哪个文件夹、以及当前会话在哪个目录。
 *
 * why 每轮现算、不写死也不缓存：数据根能在「全局设置」里随时切换（切换后整个 store 会重建）、
 * 角色由「会话绑定 → 回落 active」决定、cwd 跟着会话走 —— 任何一项写死，
 * 模型都会照着一个过期的绝对路径去读文件然后报错。
 * why 把 `~` 定义成「角色自己的文件夹」：角色卡里写的是 `~\avatar` / `~\gallery`，
 * 字面看着像用户主目录，实际指的是该角色的资源目录 `<数据根>/<角色id>`。
 * @param {{root?:string, personaId?:string, cwd?:string|null}} input 全部来自运行时
 * @returns {string} 拿不到任何路径时返回空串（宁可不说，也不给错信息）
 */
export function pathNotesText({ root, personaId, cwd } = {}) {
  const base = String(root ?? '');
  const id = String(personaId ?? '');
  const folder = base && id ? join(base, id) : '';
  // 拿不到角色文件夹就整段不注入：半句话（只有 cwd）对模型没价值，还平白多占字符。
  if (!folder) return '';
  const lines = [];
  if (cwd) lines.push('- 你当前所在的文件夹：`' + String(cwd) + '`');
  lines.push('- `~` 指你自己的角色文件夹：`' + folder + '`');
  lines.push('- 遇到像 `~\\xxx` 这样的写法，按上面的约定换算成 `' + join(folder, 'xxx') + '` 再访问，不要猜别的目录。');
  return '# 路径约定\n\n' + lines.join('\n');
}

/** 确定这次读取使用的角色，保留显式选择的虚拟空白卡。 */
export function effectivePersona(store, source) {
  return store.sessionPersonaCardSync(sessionIdFrom(source)) ?? store.readActivePersonaSync();
}

/**
 * 创建同步提示词读取器；getStore 让切换数据目录后的下一轮立即读取新目录。
 * 文件每轮读取，内容不变时注入字节自然相同，不需要另存提示词缓存。
 */
export function createPromptReader({ getStore, config, getCwd, logger }) {
  function selected(source) {
    // 子代理默认整段不注入：它们是拿去干活（写代码/查资料）的，带人设只是噪音。
    // 关掉开关（injectIntoSubagents=true）就恢复成和主会话一样的行为。
    if (config.injectIntoSubagents !== true && isSubagentSession(source)) return null;
    const store = getStore();
    const persona = effectivePersona(store, source);
    return store.isPersonaNone(persona.id) ? null : { store, persona };
  }

  function safe(label, read) {
    return (source) => {
      try {
        return read(source);
      } catch (error) {
        logger?.warn?.('[my-memory] %s读取失败：%s', label, String(error?.message ?? error));
        return '';
      }
    };
  }

  function personaBody(persona) {
    const body = String(persona.body ?? '');
    const cap = Math.floor(Number(config.personaBudget) || 0);
    return present(cap > 0 && body.length > cap ? body.slice(0, cap) + '…' : body);
  }

  function memoryBody(store, persona) {
    return present(retainEnds(store.personaMemoryTextSync(persona.id), config.globalBudget));
  }

  const promptRaw = safe('全局提示词', (source) => {
    const current = selected(source);
    return current ? present(current.store.agentPromptTextSync()) : '';
  });

  const personaRaw = safe('角色设定', (source) => {
    const current = selected(source);
    return current ? personaBody(current.persona) : '';
  });

  /**
   * 路径约定：单独成段（而不是拼进角色卡），这样卡片正文保持「原样注入」，
   * 面板/文件与提示词里看到的是同一份字节。
   * 每轮都从**当前** store 取数据根 —— 切过数据目录后 store 已换成新实例。
   */
  const pathsText = safe('路径约定', (source) => {
    const current = selected(source);
    if (!current) return '';
    let cwd = null;
    try {
      cwd = getCwd(source);
    } catch {
      cwd = null;
    }
    return pathNotesText({
      root: current.store.paths?.root,
      personaId: current.persona.id,
      cwd,
    });
  });

  const memoryRaw = safe('角色记忆', (source) => {
    const current = selected(source);
    return current ? memoryBody(current.store, current.persona) : '';
  });

  const contextText = safe('记忆', (source) => {
    const current = selected(source);
    if (!current) return '';
    const parts = [memoryBody(current.store, current.persona)];
    // 项目局部记忆保留现有开关和格式，独立于这次整理的三份角色文档。
    try {
      const cwd = getCwd(source);
      if (cwd && current.store.projectMemoryEnabledSync(cwd)) {
        const text = present(retainEnds(current.store.projectMemoryTextSync(cwd), config.projectBudget));
        if (text) {
          const name = String(cwd).replace(/[/\\]+$/, '').split(/[/\\]+/).pop() || cwd;
          parts.push('# 项目记忆 · ' + name + '\n\n' + text);
        }
      }
    } catch (error) {
      logger?.warn?.('[my-memory] 项目记忆读取失败：%s', String(error?.message ?? error));
    }
    return parts.filter(Boolean).join('\n\n');
  });

  return {
    agentText: promptRaw,
    personaText: personaRaw,
    pathsText,
    contextText,
    promptRaw,
    personaRaw,
    memoryRaw,
  };
}
