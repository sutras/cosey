# 项目长期笔记

> 细节见 `.workbuddy/memory/YYYY-MM-DD.md` 日记。本文件只留长期有效的不变量。

## 构建 / 类型检查 / 包解析

- `vue-tsc -b` 才是真检查（`build` = `vue-tsc -b && vite build`）。**不带参数 = 空转**（根 tsconfig 是
  solution 式，exit 0 零输出）；`-b` 不能跟 `-p`（TS5072），要指定就写路径。仓库无 CI，
  pre-commit 只跑 lint-staged 不查类型 → `build` 是唯一类型关卡。
- `packages/cosey` 的 main/module 都是 `index.ts`，`docs/node_modules/cosey` 软链过去 → 文档站直接吃源码，
  改 packages 不用重建 `lib-dist`。`pnpm` 不在 PATH，一律调本地 bin。

## 文档站与文档写作

- 源文件 `docs/markdown/**`（`rewrites` 去掉 `markdown/` 前缀）；示例 `docs/examples/<组件>/*.vue` 由
  `theme/index.ts` 的 `import.meta.glob` 自动注册（`examples-editor-basic`），`: ::: demo` 里写 `editor/basic`。
- 构建 `NODE_ENV=production ./node_modules/.bin/vitepress build docs`；
  开发 `NODE_ENV=development ./node_modules/.bin/vitepress dev docs --port 5176`（后台跑用 run*in_background）。
  页面是客户端渲染 → 校验内容要在 `dist/assets/components*_.md._.js` 里 grep，不是 HTML。
- 统一 prettier；代码块写 `tsx`/`vue` 时会被补分号，既有 import 又有裸 JSX 会被格式化得与别处不一致
  → 「导入」「用法」分两个代码块（见 icon.md 的 iconify 小节）。
- 不写「继承 element-plus 的 X Attributes」外链，本地写全（属性/类型/默认值照源码）。
- 简介只写用户用得上的：定位、前提、可感知行为与注意事项；**底层实现一律不写**（引擎内部细节、序列化格式、
  DOM 属性名），1–3 句，对齐 form.md / table.md。演示用真实依赖，别自造占位组件。

## 图标

`richtext-icons`（npm 已发布，161 个 `RtiPascalCase`）是 packages/cosey 的 dependencies + peerDependencies，
标准写法 `<Icon><RtiClose /></Icon>`。`Icon` 的 `name` 另一条路：`ep:*`、`svg:*`（sprite）、`fa fa-*`。

## editor 目录分层（依赖只能向下）

`editor.tsx`（只做接线：props/emits、facade 装配、view 生命周期、渲染）→
`containers/`（toolbar / float-format-toolbar / block-menu）→
`formats/`（20 个功能按钮，与 `tools.ts` 的 key 一一对应）+ `tool-renderers.tsx` →
`ui/`（button\* / picker / select / color-picker，不认识编辑器语义）→
`contents/`（nodeView；`base/` 放 resize / upload / widget-popover）→ `pm/`（内核）。
`hooks/` 与 `tools.ts`、`node-views.ts`（nodeView 注册表）横跨各层。

- 粘贴/拖拽在 `hooks/useImageDrop.ts`；v-model 在 `hooks/useEditorValue.ts`，其初始灌值由调用方经
  `syncFromProps()` 在 **`facade.view` 就绪后**触发（灌值是事务）—— 别改回 `watch(..., { immediate: true })`。
- 组件实例的 `emit` 是**交叉重载签名**，传给 hook 要写成同形重载接口，不能写成联合参数的单签名函数。
- `pm/editor.ts` 是 facade（70 个方法共享同一个 view/state）：**行数大 ≠ 耦合，别按域拆**，
  拆了只是把 `this` 换成 `ctx`。只有 class 外的游离函数该搬（upload 缓存 → `pm/upload-cache.ts`，
  表格构造 → `pm/table-utils.ts`）。
- 移动文件后脚本重算 import 的两个坑：仓库是**无扩展名**风格（别补 `.ts`）；映射表要按「旧路径 → 新路径」
  查（拿新路径去查会漏掉「未移动文件引用已移动目标」）。

## editor：功能（features）与工具按钮（toolbar）

- `mode` = 展示形态（`static` / `float`）；`toolbar` = 固定工具栏按钮布局（`,` 分隔按钮、`|` 分隔按钮组）；
  `features` = 编辑器能用的功能。**`features` 与按钮共用 `tools.ts` 的同一套 31 个 key**，
  工具栏是两者的交集 —— 不要再引入「组 → 按钮」映射或第二份清单。
- 新增功能/按钮的固定步骤：① `tools.ts` 加 key；② `tool-renderers.tsx` 加渲染器（固定工具栏与浮动工具条共用）；
  ③ 加进 `DEFAULT_EDITOR_TOOLBAR`；④ 浮动工具条/块级菜单里的入口按 `editor.hasTool(key)` 过滤；
  ⑤ `editor.md` 的「功能与按钮」表补一行；⑥ 有快捷键的话再进 `EDITOR_TOOL_SHORTCUTS` + `buildKeymap` 的
  `commands` 表（两处都要，缺一就有键没命令）。①②③⑥ 由 `pnpm test:editor` 兜底（测试从源码抽名字，不抄清单）。
- 过滤后**空的分组、空的子菜单一律不渲染**：否则浮动工具条留下空白 ButtonGroup、块级菜单留下空壳子菜单
  （一个可用项都没有时，入口按钮与浮动工具条整体不渲染）。
- **快捷键按 `features` 收敛**：`tools.ts` 的 `EDITOR_TOOL_SHORTCUTS` 是键位**唯一声明处**，`pm/plugins.ts`
  的 `buildKeymap(hasTool)` 按它生成；`buildPlugins()` 收 `(tool) => facade.hasTool(tool)` **取值函数**
  而不是快照（features 变了不用重建 state）。守卫必须**吞掉按键**（返回 `true` 且不 dispatch），不能「放行」：
  `execCommand` 改出的 DOM 会被 PM 的 DOMObserver 解析回文档（实测关掉加粗按 ⌘+B 仍出 `<strong>`）。
  同理**别重建 plugins**（`editProps.plugins` 一变 PM 重建 state，丢历史与光标）。
- **边界**：只有「与工具栏按钮对应」的才进 `EDITOR_TOOL_SHORTCUTS`（undo/redo、bold/italic/underline、
  indent-_）。`baseKeymap`（退格/回车/全选）、`Shift-Enter` 硬换行、`Enter` 拆列表项、表格边缘方向键是编辑基元，
  永远不该被 features 管。`Tab` 双分支（表格换格属 `table`、其余属 `indent-_`），**守卫只能加在缩进那条分支**，
  整键收敛会让「关掉缩进」变成「表格里也不能换格」—— 由测试单独钉住。
- **`defineExpose` 不能直接透传带 ref 的 class 实例**：expose 对象会被 `proxyRefs` 包一层、ref 被解包 →
  `this.editable.value` 变 `undefined`，`if (!this.editable.value) return` 会把所有变更吞掉。
  对外 API 走 `expose.ts` 的 `createEditorExpose(facade)` 逐条手写（顺带挡住 `view` / `dispatch` 等内部成员）。
- `insertText(text)` 用 `tr.insertText(text, from, to)`，会自动继承插入点已有的行内样式。调用前必须判
  `state.selection.$from.parent.inlineContent` —— 整块被选中（如整张表格）时 `replaceRangeWith` 会抛错误。
- `setContent()` 是整体替换文档，旧光标会被映射到**插入内容的末尾**（外部设值后光标停在最后）。

## prismjs（改 highlight / editor 前先看）

- 两层三文件：`utils/prism.ts` 只建全局+导出实例（带 `if (!globalThis.Prism)` 守卫）；`utils/prism-langs.ts`
  是**语言包唯一声明处**，首行先 `import { prism } from './prism'`，末尾再 `export { prism }`；
  `highlight.api.ts` / `editor/pm/prism.ts` 各一行引 `prism-langs`。**绝不裸引核心、别各自维护清单**。
- 必须拆两文件：同模块 import 先于模块体求值，守卫写在模块体里会排在语言包之后
  （实测 `ReferenceError: Prism is not defined`）。顺序由 `pnpm test:prism` 钉住。
- 起因：`prismjs/components/prism-*.js` 不是模块、直接读全局 Prism，打包器摇掉全局挂载就炸。
  另一坑：下拉 `languageOptions` 里有、但清单缺注册 → 静默降级纯文本。另有第三条路径 `pm/schema.ts` 的
  `getLanguageByClass`（粘贴带的 class），所以「注册了但下拉没有」不是冗余，别删。
- `highlight.api.ts` 的 `export { prism as Prism }` 是对外 API，改名按破坏性改动处理。

## utils/excel

- 分层 `WorkBook / WorkSheet / Cell` + 5 个 serializer（xlsx/xml/html/csv/txt）。
- `cell.colIndex / rowIndex` 必须在 `aoa2sheet` 回填（表头 Cell 由 `columns2aoa` 自带），否则 xlsx 的
  `r` 退化成非法 `r="0"`。`encodeCol` 是 26 进制双射（第 26 列 Z），改它要过「与 `decodeCol` 往返」断言。
- 数字格只在 `typeof value === 'number'` 时写；按「长得像数字」判断会毁前导零和 18/19 位长数字。
- 列定义唯一来源 `pruneColumns()`：表头与数据行必须吃同一棵修剪树；它会丢非对象项并递归丢弃「子列被剔光」的组。
- csv/txt 值过 `escapeFormula()`；`aoa2csv` 引号判定用 `value.includes(FS) || /["\n\r]/`，别拼字符类（FS 传 `]` 会 SyntaxError）。
- 错误契约（别改回静默）：缺 `worksheet(s)`、`data` 缺 sheet 名、`bookType` 非法 → 由 `getBookFormat()` 抛错。
- 测试 `pnpm test:excel`（tsx 跑模块旁的 `excel.test.ts`，自包含断言，构建脚本已排除测试文件）。

## utils/file

- `downloadAttachment(res, { filename })` 接 `AxiosResponse | Response`，是 async（Response 那条要 `await blob()`）。
- 读响应头走 `getHeader()`（有 `get` 就调，大小写不敏感）；**别退回裸索引**，AxiosHeaders 的 own key 保留原始大小写。
- 文件名走 `getDispositionFilename(cd)`：先 `filename*=`（RFC 5987）再 `filename="..."`，按 `;` 截断，
  `decodeURIComponent` 包 try/catch；容忍 null，解析不到返回 `''`。

## hooks/useUpsert

- `useUpsert`（内层，持 model + Fetch，`defineExpose`）+ `useOuterUpsert`（外层，`add/edit/setData` + `success` 刷新）。
- 打开序号 `openSeq`：add/edit 各自自增，**回填与 `nextTick` 的 `onShown*` 都要过 `seq === openSeq` 校验**
  （防「连点两行编辑」「编辑途中切新增」时先发起的详情写进后开的表单）。
- `pendingFill` + `onSubmit` 里 `await pendingFill`；新增回填任务用 `task.then(clear, clear)` 包一层，
  别让它变 unhandled rejection。详情报错 → `console.error` + 关闭弹框，不留空表单。
- 回填范围 = `Object.keys(cloneDeep(model))`，只有初始声明过的字段会被回填/重置。
- options 支持对象/ref/getter，统一从 `_options.value` 取，别退回 vueuse `toRefs(computed)`。
- `formProps.ref` 不是 Form 的 prop：`v-bind` 展开时 Vue 当模板 ref，配合 `useTemplateRef(auid())` 取实例。
- 测试 `pnpm test:upsert`（node 里跑，需 `createApp({}).runWithContext()` 补 inject + 替换 `ElMessage.success`）。

## 其他不变量

- layout-tabbar：`afterEach` 写 `activeTab`、`watch(activeTab)` 反跳路由，回环里
  **必须保留 `if (name === route.name) return`**，否则带 query 的导航会多跳一次并丢 query。
- field 的 `componentProps` 与 EP props 撞 `options` 时（select / checkbox-group）字符串选项传不进 →
  用 `Partial<Omit<ExtractPropTypes<SelectProps>, 'options'>>`。
- `ContextMenuContent` 的 click 必须是 emit，否则「显式展开 attrs」+ 自动透传会挂两次。

## 工具坑

- 同一文件不要在一条消息里发多个 Edit：并发写互相覆盖（报成功但改动丢了）。串行改完 grep 复核。
- 校验 BOM 要看字节，别信 `Blob.text()` 首字符（UTF-8 解码吞 BOM）。
- 修完 bug 要**反证测试有效**：短路回旧行为确认新断言会红，再改回来。
- Edit 的 `old_string` 含长注释分隔线时数不准减号 → 用 python 按锚点插入。
- 核实 npm 库内部实现：装进隔离 workspace（`~/.workbuddy/binaries/node/workspace`），grep 源码 + 探针真跑；
  ESM 不认 `NODE_PATH`，探针要放 workspace 里跑。临时 tsx 脚本要放**仓库内**（`/tmp` 会被当 CJS，
  且 `mime` 这类非根依赖只在 `packages/cosey/**` 下解析得到）。
- shell 里别用 `sed` 处理含中文的行，改用 python。
- 前端生成文件的通用验证：桩 `document.createElement` / `URL.createObjectURL` 抓 Blob → 落盘 → 独立读取器严格校验
  （xlsx 双读数：openpyxl + python-calamine，venv 在 `~/.workbuddy/binaries/python/envs/default`）。

## 浏览器端验证

`NODE_ENV=development ./node_modules/.bin/vite`（8882，被占自动顺延）；mock 是浏览器端 `@cosey/mock`
（Dexie/IndexedDB，首访 `initSeed()` 灌种子），不需要后端；登录 `admin/123456`，验证码随便填。
用 agent-browser 驱动（`open/eval/click/press/get`，`.co-editor` 这类多实例场景先用 eval 打 id 再定位；
异步渲染的 DOM 要 `sleep` 后再读，同一次 eval 里读不到）。数跳转就在 `eval` 里桩掉
`history.pushState/replaceState`。收尾 `agent-browser close` + `pkill -f "vitepress dev docs"`。
