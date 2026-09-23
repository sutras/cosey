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
  基线有 10 条既有报错：4 条在 `components/editor/formats/*.tsx`、`permissions-upsert.vue` 1 条、
  `users/user-upsert.vue` 5 条）与 `vue-tsc -p docs/tsconfig.json`（docs 有独立 tsconfig，
  `vitepress build` 不做类型检查，所以 docs 里的示例坏了也不会被 CI 拦住）。
