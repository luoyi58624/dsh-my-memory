# @local/dsh-my-memory

DeepSeek Harness 插件：**一张角色卡 + 全局记忆（人相关）+ 项目记忆（技术细节）**。

设计目标只有一个：让「她是谁」和「她记得什么」都落在**人可读、人可改的 Markdown 文件**里，
并且每轮注入的内容**字节稳定**（不改写系统提示前缀，不毁 KV 缓存）。

- 零运行时依赖：只用 Node 内置模块 + `@deepseek-ai/schemastery`（Config schema）
- 数据不写进插件源码目录：默认 `~/.dsh/my-memory/`
- 所有写入都是原子写（tmp + rename），追加类操作走「读-改-写」而不是裸 `appendFile`

---

## 1. 装上并启用

插件本身不自带宿主装配，需要在 profile 里登记。**不要手改 profile 源码**，按下面两步即可：

### 1.1 让 profile 能解析到这个包

在 `~/.dsh/profiles/desktop/package.json` 的 `dependencies` 里加一行（本地开发用 `link:`）：

```json
{
  "dependencies": {
    "@local/dsh-my-memory": "link:D:/project/dsh_plugin/dsh-my-memory"
  }
}
```

然后在 `~/.dsh/profiles/desktop/` 里装一次（pnpm 会在 profile 的 `node_modules` 下建软链）：

```bash
cd ~/.dsh/profiles/desktop && pnpm install
```

> 依赖解析注意：`@deepseek-ai/schemastery` 本仓库的 `package.json` 写在 `dependencies` +
> `peerDependencies` 里（`"*"` 宽松范围）。本仓库为了本地 `node --test` 能直接跑，
> 在 `node_modules/@deepseek-ai/schemastery` 放了一个指向 profile 副本的 junction（Windows
> junction，不需要管理员权限；`node_modules/` 已被 .gitignore 忽略）。正式安装由包管理器负责。

### 1.2 把 bundle 插进 profile 的组合

`cordis.patch.yml` 已经写好（只有一行 insert，默认值全在代码的 Config schema 里），
profile 侧只要让 `@local/dsh-my-memory` 作为一个 bundle 被加载即可，例如在
`~/.dsh/profiles/desktop/cordis.patch.yml`（或该 profile 的组合文件）里 insert 这个包名。
加载成功后启动日志会出现：

```
[my-memory] 已启动：dataDir=<...>, api=/my-memory/api
```

### 1.3 验证

- 面板 API：`GET http://127.0.0.1:<端口>/my-memory/api/status`
- 命令：`/memory` 应当输出「全局记忆 N 条 / 项目记忆 M 条 / 数据目录」
- 工具：模型侧应能看到 `memory_remember / memory_recall / memory_forget / memory_list`

---

## 2. 配置

全部字段都有默认值，**`cordis.patch.yml` 里不需要写 config**。要覆盖时写在组合条目的 `config` 下：

| 字段 | 默认 | 说明 |
| --- | --- | --- |
| `enabled` | `true` | 总开关；`false` 时不注册任何段/工具/命令/路由 |
| `dataDir` | `''` | 空 = `~/.dsh/my-memory/`；可指向任意目录 |
| `personaOrder` | `1.1` | 角色卡段序 |
| `order` | `1.2` | 记忆段序（全局 + 项目索引） |
| `personaBudget` | `800` | 角色卡注入上限（字）；`0` = 不限 |
| `globalBudget` | `1200` | 全局记忆注入上限（字，保留头尾）；`0` = 不限 |
| `projectBudget` | `800` | 项目索引注入上限（字，保留头尾）；`0` = 不限 |
| `apiPrefix` | `/my-memory/api` | 面板 HTTP 前缀 |
| `personaName` | `助手` | 没设置过角色卡时的默认名字（正文默认 `我是 助手。`） |
| `recallLimit` | `8` | `memory_recall` 不传 limit 时的条数 |

预算裁剪只做一件事：超出上限时**保留头尾**并在中间插入 `…（中段省略）…`。
为什么不只留头部：记忆是「越新越重要」，只截头部等于永远读不到刚记住的东西。

---

## 3. 数据在哪、长什么样

```
~/.dsh/my-memory/
  persona.md                     角色卡（只有一张，不做多角色）
  MEMORY.md                      全局记忆（单文件，只装通用/人相关内容）
  projects/
    <slug>/MEMORY.md             该项目局部记忆的主索引（一行一条摘要，用于注入）
    <slug>/<entry-id>.md         单条局部记忆全文
```

`slug` = 仓库目录名 + `-` + 仓库根路径 sha1 前 6 位，例如 `dsh-my-memory-3f9a2c`。
目录名部分做过安全化（去掉 `\ / : * ? " < > |`、去尾点空格、截断 64 字）；
Windows 上路径大小写不敏感，所以 slug 里的名字部分也统一小写，避免同一个仓库生出两个项目。

### persona.md

```markdown
---
name: 大肥鱼
updated: 1762146000000
---

（角色设定正文，原样保存、原样注入，不拆小节、不改写）
```

### MEMORY.md（全局）

```markdown
# 全局记忆

## 称呼

- [g_1a2b3c4d] 2026-11-07 主人叫我大肥鱼 | tag: 称呼
```

条目 id（`g_` + 8 位 hex）就在行首，便于精确删除。手写的说明行、注释行都会被忽略而不是让整份文件读不出来。

### projects/&lt;slug&gt;/MEMORY.md（索引）

```markdown
# 项目记忆 · dsh-my-memory

- [p_9f8e7d6c] DSH 插件 Config 用 schemastery，每个字段必须给 default（2026-11-07）
```

索引是**派生数据**：被手动删掉、或被清空时，下次读取会扫描目录里的 `*.md` 自动重建
（忽略 `MEMORY.md` 自己）。真数据永远在每个 `<entry-id>.md` 里。

### projects/&lt;slug&gt;/&lt;entry-id&gt;.md（全文）

```markdown
---
id: p_9f8e7d6c
title: DSH 插件 Config 用 schemastery
created: 1762146000000
tags: ["插件","api"]
---

（正文，可以多行 Markdown）
```

---

## 4. 系统提示注入

注册两个段（`interpolate: false`，`complete` 一个都没有——全局只能有一个 complete 段）：

| 段名 | 段序 | 内容 |
| --- | --- | --- |
| `my-memory:persona` | `personaOrder`（1.1） | 角色卡正文，超预算截断加 `…` |
| `my-memory:context` | `order`（1.2） | 全局记忆全文（头尾裁剪）+ 当前项目索引（头尾裁剪） |

角色卡段形如：

```
# 角色设定

你现在扮演这个角色（角色卡「大肥鱼」）：
<角色卡正文>
```

`text` 传的是**函数**，`dsh-system-prompt` 每次组装都会求值 —— 改文件下一轮就生效。
读文件带 mtime+size 缓存，内容和上次一致时直接返回上一次拼好的同一个字符串，
保证注入字节稳定（否则每轮改写系统提示前缀会让 KV 缓存全废）。
写入路径（工具/命令/HTTP）在成功后仍会 dispose + 重注册一次段，两条路都通。

**为什么必须 `interpolate: false`**：角色卡与记忆正文里的 `{}` 会被当提示词变量插值，
未知变量会让整段组装失败。段里也绝不加 `complete: true`。

当前项目从 `workingDirectory` 服务拿 cwd（`get(session)`），拿不到就退回
`session.header.cwd`，再退回 `defaultDirectory`；全都拿不到时只注入全局部分，不报错。

---

## 5. 工具

名字刻意与 `dsh-soul-md` 错开（它已占用 `memory_append/read/search/rewrite` 与 `soul_*`）。

| 工具 | 作用 |
| --- | --- |
| `memory_remember({ text, scope?, title?, tags? })` | 新增一条。`scope`：`auto`（默认）/ `global` / `project`。返回 `{ id, scope, path }` |
| `memory_recall({ query?, scope?, limit? })` | 关键词检索（中文 bigram + 子串，无外部依赖）；不传 `query` 返回最近 N 条 |
| `memory_forget({ id })` | 按 id 删除；`g_` 删全局那一行，`p_` 删文件 + 索引行；找不到明确报错 |
| `memory_list({ scope? })` | 列出 id + 摘要 + 日期（`all` / `global` / `project`） |

### `scope=auto` 的判定（刻意简单、可解释）

1. 当前 cwd 在 git 仓库里（`.git` 是目录或文件都算），**且**
2. 内容「像技术细节」——含代码符号（`foo()`、`=>`、反引号、`{ }`、`.js` 之类扩展名）或技术词
   （报错/配置/参数/依赖/版本/命令/路径/端口/插件/api/git/npm…）

两条都满足 → 项目记忆；否则 → 全局记忆。误判后果很轻（项目记忆也只是本仓库可见，随时能删）。
**语义约束**（也写在工具 description 里）：全局记忆只装「人相关、通用、与具体技术无关」的内容
（称呼、口味、作息、脾气、偏好），技术细节必须进项目记忆，否则会挤爆每轮都注入的全局记忆。

### 命令

- `/remember <内容>` —— 等价 `memory_remember`（auto scope）
- `/memory` —— 一行状态：全局几条、当前项目几条、数据目录

---

## 6. HTTP API（给客户端面板用）

前缀 `config.apiPrefix`（默认 `/my-memory/api`），全部 `no-store`：

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/persona` | `{ name, body, updated }` |
| PUT | `/persona` | 保存 `{ name, body }`，返回保存后的对象 |
| GET | `/memory?scope=global\|project&project=<cwd\|slug>` | 条目列表（`id/scope/summary/text/date/tags`） |
| POST | `/memory` | 新增 `{ text, title?, scope?, project?, tags? }` |
| DELETE | `/memory/:id` | 删除；不存在返回 404 + 明确错误 |
| GET | `/status` | 数据目录、条目数、当前项目 slug |
| GET | `/health` | `{ ok: true, dataDir }` |

路由用宿主原生的 `ctx.webServer.register({ kind: 'prefix', path, handler })`，
handler 直接吃 `(req, res)`（pathname 的 prefix 部分在 handler 里自己裁掉），**不引 express/koa**。

---

## 7. 开发

```bash
node --test test/        # 36 个用例：store / project / 插件接线
```

- `lib/host/index.js` —— 插件入口：Config、注入、段、工具、命令、HTTP
- `lib/host/store.js` —— 存储层：角色卡、全局记忆、项目记忆、索引重建、关键词相关度
- `lib/host/project.js` —— git 仓库识别（向上找 `.git`，目录或 worktree 的指针文件都算）与 slug
- `lib/host/atomic.js` —— 原子写（tmp + rename + Windows EPERM 重试 + 按路径排队）+ 同步 mtime 缓存

### 两个容易踩的坑（都写进代码注释了）

1. **`parameters` 必须自己写成真正的 JSON Schema**。DSH 的
   `parameters: { text: { type, required, description } }` 是 `defineTool` 的 author DSL，
   只有 `defineTool` 会把它编译成 JSON Schema。本插件为零依赖直接 `ctx.tools.register(原对象)`，
   所以参数声明必须是 `{ type: 'object', properties: {...}, required: [...] }`。
   同理 `output.schema` 只能使用 DSH 的 JSON Schema 子集
   （`type / properties / required / additionalProperties / items / enum / const`）。
2. **段文本必须 `interpolate: false`**，且不能出现第二个 `complete: true`。
