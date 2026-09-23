import type { ExtractPropTypes, ExtractPublicPropTypes, PropType, SlotsType } from 'vue';

// 语言包注册集中在 utils/prism-langs，顺序要求见该文件的说明
import { prism } from '../../utils/prism-langs';

export { prism as Prism };

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
