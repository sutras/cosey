import { escapeHtml, hyphenate, parseStringStyle } from '@vue/shared';
import {
  Descendant,
  Editor,
  Node as SlateNode,
  Text as SlateText,
  Element as SlateElement,
} from 'slate-vue3/core';
import { jsx } from 'slate-vue3/hyperscript';
import { isUndefined, toArray } from '../../../utils';
import {
  type CustomElement,
  type CustomText,
  mapElementTypeTagName,
  tagToElementTypeMap,
} from '../types';
import { INDENT_DELTA } from './render';
import { FormatAlign } from './align';
import { deserializeList } from './list/deserialize';
import { serializeList } from './list/serialize';

type DeserializeResult = Descendant | null | Descendant[];

declare module 'slate-vue3/core' {
  interface BaseEditor {
    serialize: () => string;
    deserialize: (html: string) => Descendant[];
    setContent: (html: string) => void;
    getContent: () => string;
  }
}

type Style = Record<string, string | number | undefined | null>;

function stringifyStyle(styles: Style): string {
  let ret = '';
  for (const key in styles) {
    const value = styles[key];
    if (typeof value === 'number' || value) {
      const normalizedKey = hyphenate(key);
      ret += `${normalizedKey}:${value};`;
    }
  }
  return ret;
}

function getStyleObject(element: Element) {
  const styleStr = element.getAttribute('style');
  return styleStr ? parseStringStyle(styleStr) : {};
}

function serializeElement(tag: string, attrs: [string, any][], children?: string) {
  let sAttrs = attrs
    .filter((item) => item[1])
    .map(([key, value]) => {
      return value === true ? key : `${key}="${value}"`;
    })
    .join(' ');

  sAttrs = sAttrs ? ` ${sAttrs}` : '';

  return `<${tag}${sAttrs}${isUndefined(children) ? ` />` : `>${children || ''}</${tag}>`}`;
}

function getLanguageByClass(cls: string) {
  return cls.match(/language-([^ ]+)/)?.[1] || 'text';
}

function serializeText(node: SlateText) {
  let string = escapeHtml(node.text);
  if (node.bold) {
    string = serializeElement('strong', [], string);
  }
  if (node.italic) {
    string = serializeElement('em', [], string);
  }
  if (node.underline) {
    string = serializeElement('u', [], string);
  }
  if (node.strikethrough) {
    string = serializeElement('s', [], string);
  }
  if (node.code) {
    string = serializeElement('code', [], string);
  }
  if (node.superscript) {
    string = serializeElement('sup', [], string);
  }
  if (node.subscript) {
    string = serializeElement('sub', [], string);
  }

  return serializeElement(
    'span',
    [
      [
        'style',
        stringifyStyle({
          fontFamily: node.font,
          fontSize: node.size,
          color: node.color,
          background: node.background,
        }),
      ],
    ],
    string,
  );
}

function serialize(node: SlateNode): string {
  if (SlateText.isText(node)) {
    return serializeText(node);
  }

  if (Editor.isEditor(node)) {
    return node.children.map((n) => serialize(n)).join('');
  }

  // Custom processing of children
  switch (node.type) {
    case 'image':
      return serializeElement('img', [
        ['src', node.url],
        ['width', node.width],
        ['height', node.height],
      ]);
    case 'video':
      return serializeElement('video', [
        ['src', node.url],
        ['width', node.width],
        ['height', node.height],
        ['controls', true],
      ]);
    case 'code-block':
      return serializeElement(
        'pre',
        [['class', `language-${node.language}`]],
        node.children.map((n) => serialize(n)).join('\n'),
      );
    case 'formula':
      return serializeElement(
        mapElementTypeTagName[node.type],
        [['data-value', node.formula.replace(/"/g, '&quot;')]],
        '',
      );
    case 'bulleted-list':
    case 'numbered-list':
      return serializeList(node, serialize);
  }

  const children = node.children.map((n) => serialize(n)).join('');

  switch (node.type) {
    case 'paragraph':
    case 'block-quote':
    case 'heading-one':
    case 'heading-two':
    case 'heading-three':
    case 'heading-four':
    case 'heading-five':
    case 'heading-six': {
      return serializeElement(
        mapElementTypeTagName[node.type],
        [
          [
            'style',
            stringifyStyle({
              paddingLeft: node.indent ? node.indent * INDENT_DELTA + 'px' : null,
              textAlign: node.align,
            }),
          ],
        ],
        children,
      );
    }
    case 'link':
      return serializeElement(
        'a',
        [
          ['href', node.url],
          ['target', node.target],
        ],
        children,
      );
    case 'nested-bulleted-list':
    case 'nested-numbered-list':
    case 'nested-list-item':
    case 'list-item':
    case 'table':
    case 'table-head':
    case 'table-body':
    case 'table-row':
    case 'table-cell':
      return serializeElement(mapElementTypeTagName[node.type], [], children);
    default:
      return children;
  }
}

function deserialize(node: Node, markAttributes = {}): DeserializeResult {
  if (node.nodeType === Node.TEXT_NODE) {
    if (!node.textContent || /^\s+$/.test(node.textContent)) return null;
    return jsx('text', markAttributes, node.textContent.replace(/\n+/g, ' ').replace(/ +/g, ' '));
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const element = node as Element;
  const tagName = element.tagName;

  switch (tagName) {
    case 'PRE':
      return jsx(
        'element',
        {
          type: 'code-block',
          language: getLanguageByClass(element.getAttribute('class') || ''),
        },
        (element.textContent || '').split('\n').map((text) =>
          jsx(
            'element',
            {
              type: 'code-line',
            },
            [jsx('text', {}, text)],
          ),
        ),
      );

    case 'UL':
    case 'OL':
      return deserializeList(element as HTMLUListElement | HTMLOListElement, deserialize);

    case 'math': {
      const value = element.getAttribute('data-value');
      if (value) {
        return jsx(
          'element',
          {
            type: 'formula',
            formula: value.replace(/&quot;/g, '"'),
          },
          { text: '' },
        );
      } else {
        return null;
      }
    }

    case 'IMG':
      return jsx(
        'element',
        {
          type: 'image',
          url: element.getAttribute('src'),
          width: element.getAttribute('width'),
          height: element.getAttribute('height'),
        },
        { text: '' },
      );

    case 'VIDEO':
      return jsx(
        'element',
        {
          type: 'video',
          url: element.getAttribute('src'),
          width: element.getAttribute('width'),
          height: element.getAttribute('height'),
        },
        { text: '' },
      );
  }

  const nodeAttributes: Omit<CustomText, 'text'> & Omit<CustomElement, 'type' | 'children'> = {
    ...markAttributes,
  };

  switch (tagName) {
    case 'STRONG':
    case 'B':
      nodeAttributes.bold = true;
      break;
    case 'EM':
    case 'I':
      nodeAttributes.italic = true;
      break;
    case 'U':
      nodeAttributes.underline = true;
      break;
    case 'DEL':
    case 'S':
      nodeAttributes.strikethrough = true;
      break;
    case 'CODE':
      nodeAttributes.code = true;
      break;
    case 'SUP':
      nodeAttributes.superscript = true;
      break;
    case 'SUB':
      nodeAttributes.subscript = true;
      break;
  }

  const children = Array.from(element.childNodes)
    .map((node) => deserialize(node, nodeAttributes))
    .flat()
    .filter(Boolean) as Descendant[];

  if (children.length === 0) {
    children.push(jsx('text', nodeAttributes, ''));
  }

  switch (tagName) {
    case 'BODY':
      return jsx('fragment', {}, children);
    case 'P':
    case 'BLOCKQUOTE':
    case 'H1':
    case 'H2':
    case 'H3':
    case 'H4':
    case 'H5':
    case 'H6': {
      const attributes: Record<string, any> = {};
      const style = getStyleObject(element);
      if (style['padding-left']) {
        attributes.indent = parseFloat(style['padding-left'] as string) / INDENT_DELTA;
      }

      const textAlign = style['text-align'];
      if (textAlign && textAlign !== 'start' && textAlign !== 'left') {
        attributes.align = textAlign as FormatAlign;
      }
      return jsx('element', { type: tagToElementTypeMap[tagName], ...attributes }, children);
    }
    case 'LI':
    case 'TABLE':
    case 'THEAD':
    case 'TBODY':
    case 'TR':
    case 'TD':
    case 'TH': {
      return jsx('element', { type: tagToElementTypeMap[tagName] }, children);
    }
    case 'A':
      return jsx(
        'element',
        {
          type: 'link',
          target: element.getAttribute('target'),
          url: element.getAttribute('href'),
        },
        children,
      );
    default:
      return children;
  }
}

function setContent(editor: Editor, html: string) {
  const selection = editor.selection;

  const fragment = editor.deserialize(html);

  editor.select([]);
  editor.delete();
  editor.insertFragment(fragment);

  if (selection) {
    const anchorNode = SlateNode.getIf(editor, selection.anchor.path);
    const focusNode = SlateNode.getIf(editor, selection.focus.path);
    if (anchorNode && focusNode) {
      editor.setSelection(selection);
    }
  }
}

function getContent(editor: Editor) {
  const { children } = editor;
  const isEmpty =
    children.length === 1 && SlateElement.isElement(children[0]) && editor.isEmpty(children[0]);

  return isEmpty ? '' : editor.serialize();
}

export function withSerialize(editor: Editor) {
  editor.serialize = () => {
    return serialize(editor).trim();
  };

  editor.deserialize = (html: string) => {
    const document = new DOMParser().parseFromString(html, 'text/html');
    const deserializedResult = deserialize(document.body);
    return deserializedResult ? toArray(deserializedResult) : [];
  };

  editor.setContent = (html: string) => {
    setContent(editor, html);
  };

  editor.getContent = () => {
    return getContent(editor);
  };

  return editor;
}
