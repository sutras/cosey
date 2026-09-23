# 项目长期笔记

## 文档站点（docs/）

- 文档源文件在 `docs/markdown/**`，站点是 VitePress，`rewrites` 把 `markdown/` 前缀去掉
  （所以 `docs/markdown/components/icon.md` 对应 URL `/components/icon`）。
- 组件示例放 `docs/examples/<组件>/*.vue`，用 `::: demo` + 路径引用（如 `icon/basic`）。
  `docs/.vitepress/theme/index.ts` 用 `import.meta.glob` 自动注册成全局组件 `examples-icon-basic`，
  新增示例文件不需要手动注册；示例里也可以相对导入同级文件（如 `form-dialog/use-outer-upsert.vue`）。
- 文档站依赖：`pnpm` 在本机 PATH 里没有，要跑构建/开发直接调本地 bin：
  - 构建：`NODE_ENV=production ./node_modules/.bin/vitepress build docs`
  - 开发：`NODE_ENV=development ./node_modules/.bin/vitepress dev docs --port 5176`
    （5174 常被 Tiny 自己开的 dev 占用，端口会自动 +1；后台跑要用 run_in_background，用 `&` 会被回收）
- 构建产物 `docs/.vitepress/dist`、`cache` 均已 gitignore，且页面是客户端渲染，
  校验内容要在 `dist/assets/components_*.md.*.js` 里 grep，而不是 HTML。
- 写文档注意：
  - 仓库统一用 prettier（`npx prettier --write <file>`）。
  - 代码块语言写 `tsx`/`vue` 时 prettier 会格式化：块里同时有 import 和裸 JSX 表达式会被补分号，
    跟文档其它片段风格不一致 —— 需要「导入」和「用法」分开两个代码块（参照 icon.md 的 iconify 小节）。
  - 简介里的小节标题与「代码演示」里的小节标题是两套命名，不要强行对齐。

## 组件文档写作约定

- 「继承 element-plus 的 X Attributes」这类外链跳转，Tiny 更希望改成本地明确声明（属性/类型/默认值照源码写全）。
- 组件文档的「简介」只写用户用得上的信息：定位、使用前提、可感知的行为与注意事项。
  底层实现（依赖哪个引擎/库的内部细节、序列化格式、DOM 属性名等）一律不写 —— Tiny 的原话是
  「内部细节不必让用户知道，这对用户使用此组件没有帮助」。整体保持简短，向 form.md / table.md
  那种 1–3 句的风格看齐。
- 演示（`docs/examples/**`）要尽量用真实依赖，不要用自造占位组件糊弄。

## 图标体系

- `richtext-icons`（v0.3.0，npm 已发布，161 个 `RtiPascalCase` 组件）是 `packages/cosey` 的
  dependencies + peerDependencies；库内组件一直在用，标准写法是：
  ```tsx
  <Icon>
    <RtiClose />
  </Icon>
  ```
  （`Icon` 只提供 `1em` 容器 + 字号，`Rti*` 组件自身宽高 1em、颜色 currentColor、stroke 1.5 随尺寸缩放。）
- 另一条路径是 `Icon` 的 `name`：`ep:*`（iconify）、`svg:*`（`src/assets/icons` 下 vite-plugin-svg-icons
  打的 sprite）、`fa fa-*`（字体图标）；`@cosey/icons` 是内置的 `co:*` iconify 图标集。
- `docs/package.json` 里已有 `richtext-icons` 依赖声明（此前 lockfile 有、package.json 缺，已补齐）。

## utils/excel 导出模块

- 分层：`WorkBook / WorkSheet / Cell` 中间层 + 5 个 serializer（xlsx / xml / html / csv / txt）。
  `cell.colIndex / rowIndex` 必须在 `aoa2sheet` 里回填（只有表头 Cell 由 `columns2aoa` 自带），
  否则 xlsx 序列化出的单元格引用会退化成非法的 `r="0"`。
- `encodeCol` 是 26 进制「双射」计数（第 26 列是 Z），不是普通取模；改它必须过一遍
  「与 `decodeCol` 互为逆运算」的往返断言。
- 数字格只在 `typeof value === 'number'` 时才写。按「长得像数字」判断字符串会毁掉
  前导零（`0012` → 12）和 18/19 位长数字（Excel 只留 15 位有效数字）。
- 回归测试：`pnpm test:excel`（= `tsx ./packages/cosey/utils/excel/excel.test.ts`，自包含断言，
  不依赖 vitest）。构建脚本 `scripts/utils/build.ts` 已排除 `**/*.test.*` 与 `**/__tests__/`，
  所以测试文件可以直接放在模块旁边。
- 验证这类「前端生成文件」的通用套路（本仓库没有 vitest，用 tsx 直接跑）：
  桩掉 `document.createElement` / `URL.createObjectURL` 抓 Blob → 落盘 → 再用独立读取器严格校验。
  xlsx 建议双读数：openpyxl（严格，非法就报错）+ python-calamine（宽容），
  已装在本机 venv `/Users/tiny/.workbuddy/binaries/python/envs/default`。
- 列定义的唯一来源是 `pruneColumns()`（`index.ts`，已导出）：表头 `columns2aoa` 与数据行 `flatColumns`
  必须吃同一棵修剪后的树。它会丢掉非对象项（`false`/`null`/`undefined`）并递归丢弃「子列被剔光」的组 ——
  组件 `table-export.transformColumns` 在子列全被取消勾选时就会产出 `{ label, columns: [] }`。
- csv / txt 的值要过 `escapeFormula()`（`= + - @ \t \r` 开头前置单引号；纯数字形态放过，
  免得正常负数变文本）。`aoa2csv` 的引号判定用 `value.includes(FS) || /["\n\r]/`，
  别再回到 `new RegExp(\`[${FS}"\n]\`)`拼字符类（FS 传`]` 会直接 SyntaxError）。
- 三个明确的错误契约（别改回静默）：缺 `worksheet`/`worksheets`、`data` 缺对应 sheet 名、
  `bookType` 非法 —— 统一由 `getBookFormat()` 抛错。

## utils/file 下载相关

- `downloadAttachment(response, { filename })` 接受 `AxiosResponse | Response`，是 `async` 的：
  axios 那条路完全同步，`Response` 那条路要 `await response.blob()`，所以签名统一为 Promise。
- 读响应头走 `getHeader()`：headers 上有 `get` 就调 `.get()`（Headers / AxiosHeaders 都不区分大小写），
  否则按 key 直接取。**别退回 `headers['content-type']` 裸索引**：`new AxiosHeaders().set('Content-Type', x)`
  的 own key 保留原始大小写，裸索引会取不到（真实响应是小写才碰巧能取到）。
- 文件名解析走公开的 `getDispositionFilename(contentDisposition)`（`file.ts`，随 `export * from './file'`
  全局可用）：先 `filename*=`（RFC 5987，`UTF-8''%E4%B8%AD...`），再 `filename="..."`，按 `;` 截断，
  `decodeURIComponent` 包 try/catch（`100%.pdf` 这类非法转义不能抛）；入参允许 `null`/`undefined`，
  解析不到返回 `''`。旧的 `split('filename=')[1]` 写法在只有 `filename*=` 时会崩，且会把后面的段一起当文件名。

## 工具使用坑（踩过）

- 同一个文件不要在同一条消息里发多个 Edit：并发写会互相覆盖，出现「报了成功但改动丢了」。
  要改同一文件的多处，就串行分次调用；改完用 grep 复核落盘结果。
- 校验 BOM 不能看 `Blob.text()` 的首字符 —— `text()` 按 UTF-8 解码时会吞掉 BOM，必须看字节。
- 修完 bug 要**反证测试有效**：临时把修复点短路回旧行为跑一遍，确认新断言真的会红，再改回来。
  序列化 / 列定义这类测试特别容易变成恒真断言。
- Edit 的 `old_string` 里若含长注释分隔线（`/* ----- */`），减号个数数不准就别硬凑：
  改用 python 脚本按锚点插入（`s.index(anchor)` → `s.rindex('\n', 0, i) + 1`），比猜个数可靠。
  插入含 `\r\n` 这类转义的代码块时，python 那边要用 raw 三引号 `r'''...'''`。
- 想核实「某个 npm 库内部是怎么实现/约定某件事」时，别只信文档：把包装进隔离的 node workspace
  （`/Users/tiny/.workbuddy/binaries/node/workspace`，`npm install <pkg>`），
  ① grep 源码找实现函数，② 写个探针脚本真的生成一次产物再解包看字节。
  注意 ESM 不认 `NODE_PATH`，探针脚本要放在 workspace 目录里直接跑，
  且 workspace 缺的依赖（如 jszip）要另装。
- 临时的 tsx 验证脚本要放在**仓库内**（如仓库根的 `tmp-xxx.ts`，跑完删）：放 `/tmp` 会因为不在
  `"type": "module"` 作用域下被当 CJS（top-level await 直接报错），且 `mime` 这类非根依赖只有在
  `packages/cosey/**` 里才解析得到。
- shell 里不要用 `sed` 处理含中文的行（会报 No such file or directory），改用 python 读写。

## hooks/useUpsert（新增/编辑弹框状态机）

- 两个 hook 分工：`useUpsert`（内层，持有 model + 各 Fetch，`defineExpose(expose)` 交控制权）、
  `useOuterUpsert`（外层，只做 `add()/edit(row)/setData()` + `success` 刷新表格）。
- 打开序号 `openSeq`：add / edit 各自自增，**回填与 `nextTick` 里的 `onShown*` 都必须过
  `seq === openSeq` 校验**。这保证「连点两行编辑」「编辑途中切新增」时，先发起的详情不写进后开的表单。
- `pendingFill` + `onSubmit` 的 `await pendingFill`：详情未回填完就点确定，会等回填结束再提交。
  新增回填任务时要照旧用 `task.then(clear, clear)` 包一层，别让 fill 的错误变成 unhandled rejection。
- 详情接口报错 → `console.error` + 关闭弹框（不能留空表单给用户提交）；`loading` 暴露给用户
  绑 `v-loading`（`detailsFetch` / `beforeFill` 期间为 true）。
- 回填范围由 `modelKeys = Object.keys(cloneDeep(model))` 决定：**只有 model 初始声明过的字段**
  会被回填和重置，详情返回的其它字段被 `pick` 丢掉。
- options 支持对象 / ref / getter（`MaybeRefOrGetter`），统一从 `_options.value` 取值；
  内部不要退回 vueuse `toRefs(computed)` 那套（每次读任一 option 都会重跑整个 options 工厂）。
- `formProps.ref` 不是 Form 的 prop：它靠 `v-bind` 展开时 Vue 把 `ref` 当模板 ref，配合
  `useTemplateRef(auid())` 取实例，改 `formProps` 的键时别动它。
- 回归测试：`pnpm test:upsert`（= `tsx ./packages/cosey/hooks/useUpsert.test.ts`）。
  该测试跑在 node 里，需要两个前提：`createApp({}).runWithContext()` 补 inject 上下文
  （否则 `useLocale()` 直接炸），并替换 `ElMessage.success`（它要真实 DOM）。
  反证方式：临时把测试的 import 指向 `git show HEAD:...useUpsert.ts` 的副本，用例应当全红。

## 包解析与类型检查范围

- `packages/cosey` 的 `main`/`module` 都是 `index.ts`，且 `docs/node_modules/cosey` 软链到
  `packages/cosey` → **文档站直接吃源码**，改 packages 下的代码不需要重建 `lib-dist`
  （`lib-dist` 已 gitignore，只在发布/独立消费时用）。
- 类型检查分两套：`vue-tsc -p tsconfig.app.json`（include 只有 `src/ packages/ types/ plugins/`，
  **现已 0 报错**，2026-09-23 修完；此前长期挂着 10 条基线）与 `vue-tsc -p docs/tsconfig.json`
  （docs 有独立 tsconfig，`vitepress build` 不做类型检查，所以 docs 里的示例坏了也不会被 CI 拦住；
  它自带的 24 条报错全在 `docs/node_modules/vitepress/**`，与本仓库代码无关，看结果要
  `grep -v node_modules`）。
- **`vue-tsc` 不带参数 = 空转**：根 `tsconfig.json` 是 solution 式（`"files": []` + `references`），
  不带 `-b` 时 TS 不检查被引用的 project，exit 0 且零输出 —— 曾经的 `build` 脚本就是这样白跑。
  要真检查必须 `-b`（走 references，app + node 两个 project 都查）或显式 `-p <某个 project>`。
- 现在 `"build": "vue-tsc -b && vite build"`。选 `-b` 而不是 `-p tsconfig.app.json` 是因为后者会漏掉
  `tsconfig.node.json` 覆盖的 `vite.config.ts` / `plugins/**` / `scripts/**`（构建发布脚本写错没人拦）。
  耗时实测：`-b` 冷 8.2s / 热 7.4s，`-p tsconfig.app.json` 7.5s（它每次全量，因为 app config 没开
  `incremental`），差别可忽略。想强制全量可加 `--force`（实测 8.08s）。
- `-b` 是独立模式：**不能再跟 `-p`**（`vue-tsc -b -p tsconfig.app.json` → `error TS5072: Unknown
build option '-p'`），要指定就写路径 `vue-tsc -b tsconfig.json`。它的报错是精简格式
  （`file:line:col - error TSxxxx`，不带源码片段），且某个 project 失败时不会写它的 buildinfo。
- 仓库**没有 CI workflow**，`.husky/pre-commit` 只跑 lint-staged（eslint + prettier，不查类型），
  所以 `build` 是唯一的类型检查关卡。

## 浏览器端行为验证（跑真机）

- 起本地站：`NODE_ENV=development ./node_modules/.bin/vite`（`server.port` 配的 8882，被占会自动顺延，
  看输出里的实际端口）。mock 是**浏览器端**的 `@cosey/mock`（Dexie/IndexedDB，首访 `initSeed()` 自动灌种子），
  所以不需要起任何后端服务；登录 `admin / 123456`，验证码随便填（mock 的 `/auth/login` 不校验）。
- 用 agent-browser 驱动（`open snapshot -i click @eN type eval close`）。要数「跳了几次」就在 `eval` 里
  桩掉 `history.pushState/replaceState` 记账，别靠肉眼看 URL；hash 路由下 pushState 一样会调。
- 标签栏选择器：`.el-tabs__item[id="tab-<路由名>"]`（路由名首字母大写，如 `tab-Users`）、
  关闭按钮 `.is-icon-close`；bem 前缀是 `co-`（如 `.co-layout-tabbar__reload`）。
  右键菜单用 `dispatchEvent(new MouseEvent('contextmenu', {bubbles:true, clientX, clientY}))` 触发，
  菜单项用 `agent-browser find text "关闭其他标签页" click` 点。
- 收尾：`agent-browser close`，并记得把后台 vite 任务停掉（否则端口一直占着，下次会顺延）。

## layout-tabbar 的标签页与路由同步（改动前先看）

- 双向同步不变量：`afterEach` 把 `route.name` 写进 `activeTab`，`watch(activeTab)` 反过来跳路由。
  这个回环里 **watch 回调必须保留 `if (name === route.name) return`**，否则每次带 query 的导航后
  都会多跳一次并把 query 丢掉（曾经就是这么坏的）。
- 跳转统一走 `goto(name)`：优先 `router.push(tab.fullPath)`（标签页自己记的完整地址，含 query / params），
  没 `fullPath` 才退回 `router.push({ name })`。
- `LayoutTab.fullPath?: string` 是可选字段：内部所有标签都会填，外部自定义标签页可以不填。
  **同名标签只记最后一次地址**（`/users?id=1` → `/users?id=2` 不会新开标签，只更新 fullPath）。
- 首页标签的 fullPath 用 `router.resolve(routerConfig.homePath).fullPath`；别按 name resolve，
  home 路由无 name 时 setup 阶段会直接抛。

## 类型坑：field 的 options 与 element-plus 撞车（加新字段组件时照抄）

- `field/components/*/xxx.api.ts` 的 `componentProps` 是「EP props 的 Partial + 本组件自己的
  `options`」。如果 EP 自己也声明了 `options`（select、checkbox-group 都有，radio-group 没有），
  两者交叉成 `EPOption[] & FieldXOption[]`，本组件支持的**字符串/数字选项就传不进来**
  （`mock.genders` 这类 `string[]` 会直接报错）。
- 定式：`Partial<Omit<ExtractPropTypes<SelectProps>, 'options'>>`（EP 的 props 定义对象要过
  `ExtractPropTypes`）或 `Partial<Omit<CheckboxGroupProps, 'options'>>`。radio-group 早就是这么写的。
- 排查手法：错误信息里的交叉类型就是「两个来源」的签名，去 `node_modules/element-plus` 里
  grep 对应 `.d.ts` 的 `options` 就能定位。

## prismjs：语言包 + 全局 Prism（改 highlight / editor 前先看）

三个文件、两层结构，别随手动：

- `utils/prism.ts` —— **只建全局、导出实例**：`if (!globalThis.Prism) globalThis.Prism = Prism`（带守卫，
  外部已有全局就沿用它，保证「注册进去的」和「读的」是同一个对象），`export const prism`。不装语言包。
- `utils/prism-langs.ts` —— **语言包的唯一声明处**（16 个）：第一行 `import { prism } from './prism'`，
  之后才是各语言包，末尾 `export { prism }`。使用方只认这个文件。
- `components/highlight/highlight.api.ts`、`components/editor/pm/prism.ts` —— 各一行
  `import { prism } from '.../utils/prism-langs'`，运行时 `prism.xxx`，**绝不再裸引核心、也别各自维护清单**。
- **为什么必须拆两个文件**：同一模块内所有 `import` 都在模块体之前求值。若把语言包和核心放一个文件，
  守卫写在模块体里就排在语言包之后，敌意环境下照样炸（实测反证过：语言包在前 → `ReferenceError:
Prism is not defined`）。所以「守卫先于语言包」只能靠**模块间**的顺序来保证。
- 顺序不变量由 `utils/prism-langs.test.ts` 钉住（`pnpm test:prism`，5 条）。它从 `highlight.api.ts`
  的 `Lang*` 类型与 `content-code-block.tsx` 的 `languageOptions` **源码里抽语言名**，再逐个查
  `prism.languages[x]`，所以清单漂移和「别处又裸引核心」都会当场变红。
- 起因与历史事故：`prismjs/components/prism-*.js` **不是模块**，是直接读全局 `Prism` 的脚本；全局只由核心
  `prism.js` 的 UMD 尾巴建立。打包器摇掉全局挂载、或换求值顺序 → 第三方消费时
  `Uncaught ReferenceError: Prism is not defined`。第二起：highlight 的 `Lang` 里写了 `python`/`py`
  但清单里没有 `prism-python`，只引 highlight 的项目里 `<Highlight lang="python">` 静默降级成纯文本
  （组件里是 `Prism.languages[lang] || Prism.languages['text']`，不报错），因为 app 同时用了编辑器才一直没暴露。
- `highlight.api.ts` 的 `export { prism as Prism }` 是对外 API（有消费方在用），改名按破坏性改动处理。
- 语言包**无法被 tree-shake**：prismjs 和 cosey 的 package.json 都没有 `sideEffects` 字段，
  副作用 import 一定保留。所以合并清单没有「本来能省掉」的体积损失，实测多带 python + json5 + nginx
  约 4.1 KB raw / 2.0 KB gzip，且只影响「只引其中一个」的消费方。
- 复现这类「只在打包后才炸」的问题：造一份「敌意核心」——把 `prism.js` 副本里的 `_self.Prism = _;`
  删掉、把末尾的 `module.exports = Prism` 改成 `export default Prism`（否则 Vite 当 ESM 服务时没有
  default 导出），再用 `resolve.alias: [{ find: /^prismjs$/, replacement: stub }]` 指过去。
  **alias 必须用正则精确匹配**：字符串 key 会把 `prismjs/components/*` 一起改掉。
  验证要在一个「不加载 app」的空 HTML 上做，否则应用启动时就已把全局建好了，对照会假绿。
- 注意：esbuild 单 bundle 时会把核心的 `var Prism` 提升为模块作用域变量，语言包的裸引用被就近解析到它，
  **测不出这个问题**；node/tsx 与浏览器里语言包各自是独立模块，才会真实暴露。
- `node_modules/.vite/deps` 是**共享**预打包缓存（消费者项目也读同一份），换配置或修完 bug 后要先删掉
  再验，否则会读到旧 chunk 得到假结论。
- **编辑器的「能选」与「能渲染」是两条独立路径**，加语言时两边都想过：
  - 下拉 = `editor/contents/content-code-block.tsx` 的 `languageOptions`（22–23 行那种 `{ value, label }`）。
  - 渲染 = `prism.languages[language]`，取不到就静默不加装饰（`prismPlugin` 装饰器直接 return）。
  - 第三条：`pm/schema.ts` 的 `getLanguageByClass(dom.className)`（parseDOM 读 `<pre class="language-xxx">`），
    从外部粘一段带 class 的 `<pre>` 进来就会产生**下拉里没有**的 language 值。
  - 所以「注册了但下拉里没有」（如 sass）不是冗余，是粘贴路径的开关，别顺手删；反过来「下拉里有但没注册」
    才是 bug（python 事故）。两者都由 `prism-langs.test.ts` 从源码抽名字来钉。
  - sass 已按 Tiny 的决定加进下拉（他就是产品，不省那几 KB）。

## ContextMenuContent 的 click 必须是 emit

- `content.tsx` 的根 div 把 attrs 展开后又没关 `inheritAttrs`，同时外面还套了一层
  `context-menu-item`。要让 `<ContextMenuContent onClick={...}>` 在 TSX 里类型通过（且在 attrs
  里不会因「显式展开 + 自动透传」被挂两次），做法是像 `contextMenuItemEmits` 一样声明
  `contextMenuContentEmits = { click }`，再在根 div 上 `onClick={(e) => emit('click', e)}`。
