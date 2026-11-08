# @local/dsh-my-memory

DSH 的 Markdown 记忆插件。当前主流程只处理三份文档：

| 文件 | 内容 | 作用范围 |
| --- | --- | --- |
| `<数据根>/AGENT.md` | 全局提示词 | 所有真实角色 |
| `<数据根>/<角色 id>/agent.md` | 角色名字、设定正文 | 当前角色 |
| `<数据根>/<角色 id>/MEMORY.md` | 日常聊天的长期记忆原文 | 当前角色 |

不做自动摘要、向量检索或自动提炼。面板编辑文件，聊天时读取文件；`/remember` 只负责追加用户明确要求记住的内容。

## 数据布局

默认数据根是 `~/.dsh/dsh-my-memory/`，可以在「全局设置」中更换。

```text
<数据根>/
  AGENT.md
  baby/
    agent.md
    MEMORY.md
  cat/
    agent.md
    MEMORY.md
  state/
    personas.json
    sessions.json
    projects.json
```

- 角色目录名就是角色 id；显示名字与目录名可以分别修改。
- `state/personas.json` 保存默认角色，`state/sessions.json` 保存会话绑定。
- 角色记忆文件不存在时，读取返回空内容，不自动创建；首次保存或 `/remember` 时创建。
- 全局提示词缺失时使用内置默认值，初始化时创建文件；显式保存空字符串表示不注入。
- 角色卡的 frontmatter 保存 `name / created / updated`，其后的正文才是注入内容；正文换行和 Markdown 行末双空格按原样保留。
- 虚拟「空白」角色没有目录和记忆文件，选中它会关闭本插件对该会话的全部提示词注入。

角色目录改名会一起移动角色卡、记忆及该目录内其它文件，并同步更新默认角色和会话绑定。删除角色后，相关绑定会解除，后续会话回落到默认角色。

## 提示词如何拼接

每轮先确定角色：**会话绑定优先，没有有效绑定才使用全局默认角色**。

然后依次读取：

1. 全局 `AGENT.md` 正文。
2. 当前角色 `agent.md` 的设定正文。
3. 当前角色 `MEMORY.md` 正文。

三段直接使用文件内容，不添加「你现在扮演……」等介绍句。默认不裁剪角色和记忆，空白段省略；正文里的花括号不会被当成变量插值。

默认段序根据 DSH 的 `HARNESS_IDENTITY` 位置向前安排三段，确保全局提示词在前，然后是角色设定和记忆。旧宿主没有顺序查询方法时使用 `-1003 / -1002 / -1001`。显式配置的其它段序仍然生效。

文件很小，每轮直接读取，不使用文件修改时间作为内容是否变化的依据。外部编辑文件后下一轮即可读取新内容；相同内容产生相同注入字节。

### 聊天预设

`@local/dsh-my-memory/preset-solo` 在所选聊天预设中注册一个 `complete` 提示段，只拼接全局提示词、角色设定和角色长期记忆三份原文；同时抑制宿主运行时上下文，并通过工具白名单默认保留 IM 工具。普通模式仍使用前述三段正常注入；两种模式共用同一套文档读取规则。

## 编辑与同步

角色设定和角色记忆失焦时自动保存；全局提示词可点击保存，离开编辑页或切换目录时也会先完成保存。

三类文档共用同一套规则：

- 成功读取文件路径、正文和内容版本之前，不允许编辑或保存。
- 保存期间继续输入，旧保存回包不会覆盖新草稿，新内容会顺序补存。
- 刷新、重新聚焦或外部修改不会直接丢弃尚未保存的草稿。
- 保存带 `baseRev`；磁盘内容已经变化时返回 `409`，保留草稿并提供对比、使用磁盘版本或明确覆盖。
- 保存还带 `expectedPath`；角色目录或数据根变化后，旧编辑器不能把内容写进另一个文件，强制覆盖也不能绕过这项检查。
- 切角色、切标签或关闭面板前等待保存；保存失败或存在冲突时保留当前编辑页。
- 切换数据根前先处理当前草稿，成功后重新读取新目录的文件。
- 文件写入使用同目录临时文件和 rename；插件内部对同一文件的读、版本比较和写入串行执行。读取权限错误、写入失败和回读不一致都会返回错误，不当成空文件或保存成功。

目录切换只选择新的数据根，不搬迁旧内容。新目录初始化和指针写入成功后，运行中的存储实例才切换过去。每个 HTTP 请求固定使用开始处理时的数据根，避免一次请求跨目录读写。

## 命令

| 命令 | 行为 |
| --- | --- |
| `/remember <内容>` | 追加到当前会话角色的 `MEMORY.md`，会话绑定优先。 |
| `/memory` | 显示当前角色、记忆字符数和文件位置。 |
| `/persona <目录名或名字>` | 切换全局默认角色；无参数时列出角色。已有会话的显式绑定保持生效。 |

`/remember` 不再根据技术关键词猜测保存位置，也不写旧的根目录 `MEMORY.md`。空白角色不能追加记忆。

## 主要 HTTP 接口

默认前缀是 `/my-memory/api`，响应均为 `no-store`。

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | `/personas` | 列出角色与默认角色，真实角色包含文件路径和版本。 |
| GET | `/personas/:id` | 读取一张角色卡，返回 `name / body / path / rev`。 |
| PUT | `/personas/:id` | 保存角色卡，接受 `name / body / baseRev / expectedPath / force`。 |
| GET | `/persona/memory?id=<id>` | 读取角色记忆，返回 `personaId / path / text / exists / rev`。 |
| PUT | `/persona/memory` | 保存角色记忆，接受 `personaId / text / baseRev / expectedPath / force`。 |
| GET | `/settings/prompt` | 读取全局提示词，返回 `path / text / exists / rev / defaultText`。 |
| PUT | `/settings/prompt` | 保存全局提示词，接受 `text / baseRev / expectedPath / force`。 |
| GET / POST | `/session/persona` | 查询或修改会话角色绑定。 |
| GET | `/settings` | 当前数据目录与全局提示词路径。 |
| POST | `/settings/dataDir` | 更换数据根，`parent` 会自动补上 `dsh-my-memory` 子目录。 |

角色创建、删除、设为默认、打开目录、重命名和重载接口继续保留。

文档保存必须显式传字符串正文，空字符串表示清空。普通版本冲突返回 `409 + conflict:true` 和磁盘当前内容；文件位置变化返回 `409 + code: DOCUMENT_MOVED`，需要重新读取。省略 `baseRev` 的旧调用仍可保存，但新面板始终传入版本和文件身份。

## 配置

`cordis.patch.yml` 只登记插件，默认值在宿主 Config 中统一定义。

| 字段 | 默认 | 说明 |
| --- | --- | --- |
| `enabled` | `true` | 插件总开关。 |
| `dataDir` | 空 | 未指定时使用数据根指针或默认目录。 |
| `promptOrder` | `-1003` | 全局提示词段序；默认值会跟随宿主身份段的位置。 |
| `personaOrder` | `-1002` | 角色设定段序。 |
| `order` | `-1001` | 记忆段序。 |
| `personaBudget` | `0` | 默认完整注入；显式正数仍可限制角色正文长度。 |
| `globalBudget` | `0` | 为兼容旧配置保留此名称，实际限制角色记忆；默认完整注入。 |
| `projectBudget` | `800` | 旧项目记忆的字符上限。 |
| `apiPrefix` | `/my-memory/api` | HTTP 接口前缀。 |
| `personaName` | `助手` | 首次初始化的默认角色名字。 |
| `rootPointerFile` | 空 | 默认指针 `~/.dsh/my-memory.roots.json`，测试可指定临时文件。 |

`recallLimit` 保留用于旧配置兼容，当前没有向模型注册记忆检索工具。

## 历史数据与项目局部记忆

旧版根目录 `MEMORY.md` 和 `projects/` 数据保留。旧 `/memory`、`/memory/raw` HTTP 接口仍属于兼容层；当前角色面板、提示词注入和 `/remember` 使用角色目录内的记忆文件。

项目局部记忆仍在 `<cwd>/.dsh/MEMORY.md`，开关由 `state/projects.json` 保存。当前这轮整理不扩展它的功能；普通记忆段保留已有的启用行为。

早期 `persona.md` 和 `personas/<id>.md` 的角色卡迁移仍受支持。旧根记忆不会自动复制到每个角色，避免把同一批内容错误分发给不同角色。

## 安装与开发

在 DSH profile 中以本地链接或正常包依赖安装本包，并通过 bundle 启用：

```yaml
- insert:
    - id: my-memory
      name: '@local/dsh-my-memory'
```

项目自身安装实际依赖，不依赖 profile 内部的 `node_modules` 布局，也不从其它项目寻找构建工具。

```bash
npm ci
npm run build
npm run test:memory
```

也可以只运行本次修改涉及的测试文件：

```bash
node --test test/documents.test.mjs
node --test test/document-editor.test.mjs
node --test test/plugin.test.mjs
```

前端修改后需要重新构建 `lib/client/index.js`。宿主模块修改后重启 DSH；只刷新页面不会让已经加载的宿主模块自动变成新版本。

### 代码分工

| 文件 | 职责 |
| --- | --- |
| `lib/host/index.js` | Config、生命周期、命令及非文档路由接线。 |
| `lib/host/prompts.js` | 会话选角和三份正文读取。 |
| `lib/host/document-api.js` | 三类文档的 HTTP 契约与冲突响应。 |
| `lib/host/text-document.js` | 原文、内容版本、目标路径检查和 CAS 保存。 |
| `lib/host/store.js` | 角色目录、会话绑定、默认角色，以及历史存储兼容。 |
| `lib/host/atomic.js` | 文件读写、原子替换和进程内队列。 |
| `lib/client/src/document-editor.js` | 不依赖 React 的草稿、读取和串行保存状态。 |
| `lib/client/src/DocumentEditor.jsx` | React 订阅和公共冲突交互。 |

测试使用临时数据目录，不读取或改写真实角色与记忆。
