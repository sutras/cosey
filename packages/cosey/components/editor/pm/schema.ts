import {
  Schema,
  type DOMOutputSpec,
  type MarkSpec,
  type Node as PMNode,
  type NodeSpec,
} from 'prosemirror-model';
import type { FormatAlign } from '../types';

export const INDENT_DELTA = 40;

export interface TextStyleAttrs {
  fontFamily?: string | null;
  fontSize?: string | null;
  color?: string | null;
  background?: string | null;
}

export interface BlockStyleAttrs {
  align?: FormatAlign | null;
  indent?: number | null;
}

export function getLanguageByClass(cls: string) {
  return cls.match(/language-([^ ]+)/)?.[1] || 'text';
}

function parseStyle(dom: HTMLElement): Record<string, string> {
  const style = dom.getAttribute('style');
  const result: Record<string, string> = {};
  if (!style) return result;

  style.split(';').forEach((part) => {
    const [key, ...rest] = part.split(':');
    if (key && rest.length) {
      result[key.trim()] = rest.join(':').trim();
    }
  });

  return result;
}

function stringifyStyle(style: Record<string, string | number | null | undefined>) {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(style)) {
    if (value !== null && value !== undefined && value !== '') {
      parts.push(`${key}:${value}`);
    }
  }
  return parts.join(';');
}

function getBlockAttrs(dom: HTMLElement): BlockStyleAttrs {
  const style = parseStyle(dom);
  const attrs: BlockStyleAttrs = { align: null, indent: 0 };

  const paddingLeft = parseFloat(style['padding-left'] || '0');
  if (paddingLeft) {
    attrs.indent = Math.round(paddingLeft / INDENT_DELTA);
  }

  const textAlign = style['text-align'] as FormatAlign | undefined;
  if (textAlign && textAlign !== 'start' && textAlign !== 'left') {
    attrs.align = textAlign;
  }

  return attrs;
}

function blockToDOM(
  type: string,
  node: { attrs: BlockStyleAttrs },
): [string, Record<string, string>, number] | [string, number] {
  const style = stringifyStyle({
    'padding-left': node.attrs.indent ? `${node.attrs.indent * INDENT_DELTA}px` : null,
    'text-align': node.attrs.align || null,
  });

  return style ? [type, { style }, 0] : [type, 0];
}

function getTextStyleAttrs(dom: HTMLElement): TextStyleAttrs | false {
  const style = dom.style;
  const attrs: TextStyleAttrs = {
    fontFamily: style.fontFamily || null,
    fontSize: style.fontSize || null,
    color: style.color || null,
    background: style.background || style.backgroundColor || null,
  };

  if (!attrs.fontFamily && !attrs.fontSize && !attrs.color && !attrs.background) {
    return false;
  }

  return attrs;
}

function textStyleToDOM(node: { attrs: TextStyleAttrs }): DOMOutputSpec {
  const style = stringifyStyle({
    'font-family': node.attrs.fontFamily,
    'font-size': node.attrs.fontSize,
    color: node.attrs.color,
    background: node.attrs.background,
  });

  return ['span', style ? { style } : {}, 0];
}

const blockStyleAttrs = {
  align: { default: null },
  indent: { default: 0 },
};

export type CellVerticalAlign = 'top' | 'middle' | 'bottom';

export type CellAttrs = {
  colspan: number;
  rowspan: number;
  colwidth: number[] | null;
  background: string | null;
  color: string | null;
  verticalAlign: CellVerticalAlign | null;
};

const cellAttrs = {
  colspan: { default: 1 },
  rowspan: { default: 1 },
  colwidth: { default: null },
  background: { default: null },
  color: { default: null },
  verticalAlign: { default: null },
};

// 编辑器值是 HTML 字符串，单元格的合并范围/列宽/底色/字色/垂直对齐必须能随 HTML 往返，
// 否则每次 setContent 都会丢掉表格结构（合并单元格会散开、拖过的列宽会复位）。
function parseColwidth(value: string | null): number[] | null {
  if (!value) return null;

  const widths = value.split(',').map((width) => Number(width.trim()));
  return widths.every((width) => Number.isFinite(width)) ? widths : null;
}

function getCellAttrs(dom: HTMLElement): CellAttrs {
  const { style } = dom;

  return {
    colspan: Number(dom.getAttribute('colspan')) || 1,
    rowspan: Number(dom.getAttribute('rowspan')) || 1,
    colwidth: parseColwidth(dom.getAttribute('data-colwidth')),
    background: style.backgroundColor || dom.getAttribute('data-background') || null,
    color: style.color || null,
    verticalAlign: (style.verticalAlign as CellVerticalAlign) || null,
  };
}

function cellToDOM(tag: 'td' | 'th') {
  return (node: PMNode): DOMOutputSpec => {
    const { colspan, rowspan, colwidth, background, color, verticalAlign } =
      node.attrs as CellAttrs;

    return [
      tag,
      {
        colspan: colspan > 1 ? String(colspan) : null,
        rowspan: rowspan > 1 ? String(rowspan) : null,
        'data-colwidth': colwidth ? colwidth.join(',') : null,
        style:
          stringifyStyle({
            'background-color': background,
            color,
            'vertical-align': verticalAlign,
          }) || null,
      },
      0,
    ];
  };
}

const nodes: Record<string, NodeSpec> = {
  doc: {
    content: 'block+',
  },

  paragraph: {
    content: 'inline*',
    group: 'block',
    attrs: blockStyleAttrs,
    parseDOM: [{ tag: 'p', getAttrs: getBlockAttrs }],
    toDOM(node) {
      return blockToDOM('p', node);
    },
  },

  heading: {
    content: 'inline*',
    group: 'block',
    attrs: {
      level: { default: 1 },
      ...blockStyleAttrs,
    },
    defining: true,
    parseDOM: [1, 2, 3, 4, 5, 6].map((level) => ({
      tag: `h${level}`,
      attrs: { level },
      getAttrs: (dom: HTMLElement) => ({ level, ...getBlockAttrs(dom) }),
    })),
    toDOM(node) {
      return blockToDOM(`h${node.attrs.level}`, node);
    },
  },

  blockquote: {
    content: 'block+',
    group: 'block',
    attrs: blockStyleAttrs,
    parseDOM: [{ tag: 'blockquote', getAttrs: getBlockAttrs }],
    toDOM(node) {
      return blockToDOM('blockquote', node);
    },
  },

  bullet_list: {
    content: 'list_item+',
    group: 'block',
    parseDOM: [{ tag: 'ul' }],
    toDOM() {
      return ['ul', 0];
    },
  },

  ordered_list: {
    content: 'list_item+',
    group: 'block',
    attrs: { order: { default: 1 } },
    parseDOM: [
      {
        tag: 'ol',
        getAttrs: (dom: HTMLElement) => ({ order: Number(dom.getAttribute('start')) || 1 }),
      },
    ],
    toDOM(node) {
      return ['ol', node.attrs.order === 1 ? {} : { start: node.attrs.order }, 0];
    },
  },

  list_item: {
    content: 'paragraph block*',
    defining: true,
    parseDOM: [{ tag: 'li' }],
    toDOM() {
      return ['li', 0];
    },
  },

  code_block: {
    content: 'text*',
    group: 'block',
    marks: '',
    code: true,
    defining: true,
    attrs: { language: { default: 'text' } },
    parseDOM: [
      {
        tag: 'pre',
        preserveWhitespace: 'full',
        getAttrs: (dom: HTMLElement) => ({ language: getLanguageByClass(dom.className) }),
      },
    ],
    toDOM(node) {
      return ['pre', { class: `language-${node.attrs.language}` }, 0];
    },
  },

  table: {
    content: 'table_row+',
    tableRole: 'table',
    group: 'block',
    isolating: true,
    parseDOM: [{ tag: 'table' }],
    toDOM() {
      return ['table', ['tbody', 0]];
    },
  },

  table_row: {
    content: '(table_cell | table_header)*',
    tableRole: 'row',
    parseDOM: [{ tag: 'tr' }],
    toDOM() {
      return ['tr', 0];
    },
  },

  table_cell: {
    content: 'block+',
    tableRole: 'cell',
    attrs: cellAttrs,
    isolating: true,
    parseDOM: [{ tag: 'td', getAttrs: getCellAttrs }],
    toDOM: cellToDOM('td'),
  },

  table_header: {
    content: 'block+',
    tableRole: 'header_cell',
    attrs: cellAttrs,
    isolating: true,
    parseDOM: [{ tag: 'th', getAttrs: getCellAttrs }],
    toDOM: cellToDOM('th'),
  },

  image: {
    inline: true,
    group: 'inline',
    atom: true,
    attrs: {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: null },
      height: { default: null },
    },
    parseDOM: [
      {
        tag: 'img[src]',
        getAttrs: (dom: HTMLElement) => ({
          src: dom.getAttribute('src'),
          alt: dom.getAttribute('alt'),
          title: dom.getAttribute('title'),
          width: dom.getAttribute('width'),
          height: dom.getAttribute('height'),
        }),
      },
    ],
    toDOM(node) {
      return [
        'img',
        {
          src: node.attrs.src,
          width: node.attrs.width,
          height: node.attrs.height,
        },
      ];
    },
  },

  video: {
    inline: true,
    group: 'inline',
    atom: true,
    attrs: {
      src: { default: null },
      width: { default: null },
      height: { default: null },
    },
    parseDOM: [
      {
        tag: 'video[src]',
        getAttrs: (dom: HTMLElement) => ({
          src: dom.getAttribute('src'),
          width: dom.getAttribute('width'),
          height: dom.getAttribute('height'),
        }),
      },
    ],
    toDOM(node) {
      return [
        'video',
        {
          src: node.attrs.src,
          width: node.attrs.width,
          height: node.attrs.height,
          controls: 'controls',
        },
      ];
    },
  },

  formula: {
    inline: true,
    group: 'inline',
    atom: true,
    attrs: { formula: { default: '' } },
    parseDOM: [
      {
        tag: 'math[data-value]',
        getAttrs: (dom: HTMLElement) => ({
          formula: (dom.getAttribute('data-value') || '').replace(/&quot;/g, '"'),
        }),
      },
    ],
    toDOM(node) {
      return ['math', { 'data-value': node.attrs.formula }];
    },
  },

  hard_break: {
    inline: true,
    group: 'inline',
    selectable: false,
    parseDOM: [{ tag: 'br' }],
    toDOM() {
      return ['br'];
    },
  },

  text: {
    group: 'inline',
  },
};

const marks: Record<string, MarkSpec> = {
  strong: {
    parseDOM: [
      { tag: 'strong' },
      { tag: 'b', getAttrs: (dom: HTMLElement) => dom.style.fontWeight !== 'normal' && null },
    ],
    toDOM() {
      return ['strong', 0];
    },
  },

  em: {
    parseDOM: [{ tag: 'em' }, { tag: 'i' }],
    toDOM() {
      return ['em', 0];
    },
  },

  underline: {
    parseDOM: [
      { tag: 'u' },
      { style: 'text-decoration=underline' },
      { style: 'text-decoration-line=underline' },
    ],
    toDOM() {
      return ['u', 0];
    },
  },

  strikethrough: {
    parseDOM: [{ tag: 's' }, { tag: 'del' }, { style: 'text-decoration-line=line-through' }],
    toDOM() {
      return ['s', 0];
    },
  },

  code: {
    parseDOM: [{ tag: 'code' }],
    toDOM() {
      return ['code', 0];
    },
  },

  superscript: {
    excludes: 'subscript',
    parseDOM: [{ tag: 'sup' }],
    toDOM() {
      return ['sup', 0];
    },
  },

  subscript: {
    excludes: 'superscript',
    parseDOM: [{ tag: 'sub' }],
    toDOM() {
      return ['sub', 0];
    },
  },

  link: {
    attrs: {
      href: {},
      target: { default: '_blank' },
    },
    inclusive: false,
    parseDOM: [
      {
        tag: 'a[href]',
        getAttrs: (dom: HTMLElement) => ({
          href: dom.getAttribute('href'),
          target: dom.getAttribute('target') || '_blank',
        }),
      },
    ],
    toDOM(node) {
      return ['a', { href: node.attrs.href, target: node.attrs.target }, 0];
    },
  },

  text_style: {
    attrs: {
      fontFamily: { default: null },
      fontSize: { default: null },
      color: { default: null },
      background: { default: null },
    },
    parseDOM: [{ tag: 'span', getAttrs: getTextStyleAttrs }],
    toDOM: textStyleToDOM,
  },
};

export const schema = new Schema({ nodes, marks });

export type EditorSchema = typeof schema;
