/**
 * prismjs 语言包的**唯一**声明处。
 *
 * 语言包（`prismjs/components/*`）不是模块，而是直接向全局 `Prism` 注册的脚本，
 * 所以 `./prism` 必须排在它们前面（ESM 按声明顺序求值，细节见该文件）。同一个模块内
 * 顺序由语言规范保证，不依赖外层打包器怎么排 chunk。
 *
 * 使用方（highlight / editor）统一 `import { prism } from '.../prism-langs'` 即可拿到
 * 「实例 + 全部语言」，不要各自再维护一份语言包清单（曾经因此漏掉 prism-python）。
 */
import { prism } from './prism';

// 样式
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-sass';
import 'prismjs/components/prism-less';

// JS / TS
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';

// 数据 / 文本
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-json5';
import 'prismjs/components/prism-markdown';

// shell / 服务端
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-nginx';

// 模板类：markup-templating 是 php 的前置
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-php';

// 其它
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-python';

export { prism };
