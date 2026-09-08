import type { ExtractPropTypes, ExtractPublicPropTypes, PropType, SlotsType } from 'vue';

import Prism from 'prismjs';
import 'prismjs';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-sass';
import 'prismjs/components/prism-less';

import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';

import 'prismjs/components/prism-json';
import 'prismjs/components/prism-json5';

import 'prismjs/components/prism-markdown';

import 'prismjs/components/prism-bash';

import 'prismjs/components/prism-nginx';

import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-sql';

export { Prism };

type LangText = 'plain' | 'plaintext' | 'text' | 'txt';
type LangXml = 'markup' | 'html' | 'mathml' | 'svg' | 'xml' | 'ssml' | 'atom' | 'rss';
type LangCss = 'css' | 'less' | 'sass' | 'scss';
type LangJs = 'javascript' | 'js' | 'typescript' | 'ts' | 'jsx' | 'tsx';
type LangJson = 'json' | 'json5';
type LangMd = 'markdown' | 'md';
type LangBash = 'bash' | 'sh' | 'shell';
type LangPython = 'python' | 'py';

type Lang =
  | LangText
  | LangXml
  | LangCss
  | LangJs
  | 'clike'
  | LangJson
  | LangMd
  | LangBash
  | 'nginx'
  | 'php'
  | 'java'
  | 'sql'
  | LangPython;

export const highlightProps = {
  code: {
    type: String,
  },
  lang: {
    type: String as PropType<Lang | (string & {})>,
    default: 'text',
  },
  maxHeight: {
    type: String,
  },
};

export type HighlightProps = ExtractPropTypes<typeof highlightProps>;
export type HighlightPublicProps = ExtractPublicPropTypes<typeof highlightProps>;

export interface HighlightSlots {
  default: {};
}

export const highlightSlots = Object as SlotsType<HighlightSlots>;

export interface HighlightEmits {}

export interface HighlightExpose {}
