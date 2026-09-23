import Prism from 'prismjs';

/**
 * prismjs 的语言包（`prismjs/components/*`）不是模块，而是**直接引用全局变量 `Prism` 的脚本**。
 * 它们能否注册成功，取决于「加载它们时全局 `Prism` 是否已经建立」，而这并不由我们决定：
 * 核心只在自身以脚本形式求值（浏览器里能拿到 `window`）时才挂全局，打包器把核心摇掉、
 * 调整模块求值顺序，或在 SSR / 非 window 环境里执行时，语言包就会抛
 * `Uncaught ReferenceError: Prism is not defined`。
 *
 * 因此这里先显式建立全局。**本文件只负责建全局、导出实例，不注册任何语言包** ——
 * 语言包统一放在 `./prism-langs`，它把本模块排在语言包之前，从而保证注册时全局已经就位。
 * 业务代码要用 prism 时 import `./prism-langs`（实例 + 全部语言），不要直接引本文件。
 */
const prismGlobal = globalThis as typeof globalThis & { Prism?: typeof Prism };

if (!prismGlobal.Prism) {
  prismGlobal.Prism = Prism;
}

/** 语言包实际注册到的实例（外部已有全局时沿用外部的，保证注册与读取是同一个对象） */
export const prism = prismGlobal.Prism ?? Prism;
