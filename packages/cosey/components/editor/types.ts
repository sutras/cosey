import { Descendant, BaseEditor, BaseRange } from 'slate-vue3/core';
import type { DOMEditor } from 'slate-vue3/dom';
import { type FormatAlign } from './plugins/align';

export type ListType = 'numbered-list' | 'bulleted-list';
export type NestedListType = 'nested-numbered-list' | 'nested-bulleted-list';

export const HEADING_TYPES = [
  'heading-one',
  'heading-two',
  'heading-three',
  'heading-four',
  'heading-five',
  'heading-six',
] as const;

export const HEADING_WITH_PARA_TYPES = ['paragraph', ...HEADING_TYPES] as const;

export type HeadingParagraphType = (typeof HEADING_WITH_PARA_TYPES)[number];

export type HeadingType = (typeof HEADING_TYPES)[number];

export const NORMAL_BLOCK_TYPES = [...HEADING_WITH_PARA_TYPES, 'block-quote'] as const;

export type NormalBlockType = (typeof NORMAL_BLOCK_TYPES)[number];

export const mapElementTypeTagName: Record<string, string> = {
  paragraph: 'p',
  'heading-one': 'h1',
  'heading-two': 'h2',
  'heading-three': 'h3',
  'heading-four': 'h4',
  'heading-five': 'h5',
  'heading-six': 'h6',
  'block-quote': 'blockquote',
  'bulleted-list': 'ul',
  'numbered-list': 'ol',
  'list-item': 'li',
  'nested-bulleted-list': 'ul',
  'nested-numbered-list': 'ol',
  'nested-list-item': 'li',
  'code-block': 'pre',
  table: 'table',
  'table-head': 'thead',
  'table-body': 'tbody',
  'table-row': 'tr',
  'table-cell': 'td',
  formula: 'math',
};

export const tagToElementTypeMap = {
  P: 'paragraph',
  BLOCKQUOTE: 'block-quote',
  H1: 'heading-one',
  H2: 'heading-two',
  H3: 'heading-three',
  H4: 'heading-four',
  H5: 'heading-five',
  H6: 'heading-six',
  UL: 'bulleted-list',
  OL: 'numbered-list',
  LI: 'list-item',
  PRE: 'code-block',
  TABLE: 'table',
  THEAD: 'table-head',
  TBODY: 'table-body',
  TR: 'table-row',
  TD: 'table-cell',
  TH: 'table-cell',
};

export type ParagraphElement = {
  type: 'paragraph';
  children: Descendant[];
  align?: FormatAlign;
  indent?: number;
};

export type HeadingOneElement = {
  type: 'heading-one';
  children: Descendant[];
  align?: FormatAlign;
  indent?: number;
};

export type HeadingTwoElement = {
  type: 'heading-two';
  children: Descendant[];
  align?: FormatAlign;
  indent?: number;
};

export type HeadingThreeElement = {
  type: 'heading-three';
  children: Descendant[];
  align?: FormatAlign;
  indent?: number;
};

export type HeadingFourElement = {
  type: 'heading-four';
  children: Descendant[];
  align?: FormatAlign;
  indent?: number;
};

export type HeadingFiveElement = {
  type: 'heading-five';
  children: Descendant[];
  align?: FormatAlign;
  indent?: number;
};

export type HeadingSixElement = {
  type: 'heading-six';
  children: Descendant[];
  align?: FormatAlign;
  indent?: number;
};

export type BlockQuoteElement = {
  type: 'block-quote';
  children: Descendant[];
  align?: FormatAlign;
  indent?: number;
};

export type BulletedListElement = {
  type: 'bulleted-list';
  children: ListItemElement[];
};

export type NumberedListElement = {
  type: 'numbered-list';
  children: ListItemElement[];
};

export type ListItemElement = {
  type: 'list-item';
  listType: 'bulleted-list' | 'numbered-list';
  children: Descendant[];
  level: number;
};

export type NestedBulletedListElement = {
  type: 'nested-bulleted-list';
  children: NestedListItemElement[];
  parent: NestedListItemElement | null;
};

export type NestedNumberedListElement = {
  type: 'nested-numbered-list';
  children: NestedListItemElement[];
  parent: NestedListItemElement | null;
};

export type NestedListItemElement = {
  type: 'nested-list-item';
  children: Descendant[];
  parent: NestedBulletedListElement | NestedNumberedListElement | null;
};

// table element

export type TableElement = {
  type: 'table';
  children: Descendant[];
};

export type TableHeadElement = {
  type: 'table-head';
  children: Descendant[];
};

export type TableBodyElement = {
  type: 'table-body';
  children: Descendant[];
};

export type TableRowElement = {
  type: 'table-row';
  children: Descendant[];
};

export type TableCellElement = {
  type: 'table-cell';
  children: Descendant[];
};

// inline element

export type ImageElement = {
  type: 'image';
  url: string;
  width?: string | number;
  height?: string | number;
  file?: File;
  children: EmptyText[];
};

export type VideoElement = {
  type: 'video';
  url: string;
  width?: string | number;
  height?: string | number;
  children: EmptyText[];
};

export type LinkElement = {
  type: 'link';
  url: string;
  target: string;
  children: Descendant[];
};

export type FormulaElement = {
  type: 'formula';
  formula: string;
  children: EmptyText[];
};

// code

export type CodeBlockElement = {
  type: 'code-block';
  language: string;
  children: Descendant[];
};

export type CodeLineElement = {
  type: 'code-line';
  children: Descendant[];
};

export type HeadingElement =
  | HeadingOneElement
  | HeadingTwoElement
  | HeadingThreeElement
  | HeadingFourElement
  | HeadingFiveElement
  | HeadingSixElement;

export type CustomElement =
  | ParagraphElement
  | HeadingOneElement
  | HeadingTwoElement
  | HeadingThreeElement
  | HeadingFourElement
  | HeadingFiveElement
  | HeadingSixElement
  | BlockQuoteElement
  | BulletedListElement
  | NumberedListElement
  | ListItemElement
  | NestedBulletedListElement
  | NestedNumberedListElement
  | NestedListItemElement
  | ImageElement
  | VideoElement
  | LinkElement
  | FormulaElement
  | TableElement
  | TableHeadElement
  | TableBodyElement
  | TableRowElement
  | TableCellElement
  | CodeBlockElement
  | CodeLineElement;

export type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  superscript?: boolean;
  subscript?: boolean;
  font?: string;
  size?: string;
  color?: string;
  background?: string;
};

export type EmptyText = {
  text: string;
} & CustomText;

export type CustomEditor = BaseEditor & DOMEditor;

declare module 'slate-vue3/core' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText | EmptyText;
    Range: BaseRange & {
      [key: string]: unknown;
    };
  }
}
