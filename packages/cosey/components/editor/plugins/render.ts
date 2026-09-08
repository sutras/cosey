import { type CSSProperties, h, VNode } from 'vue';
import { type RenderElementProps, type RenderLeafProps } from 'slate-vue3';
import { Editor } from 'slate-vue3/core';
import { mapElementTypeTagName } from '../types';

export const INDENT_DELTA = 40;

declare module 'slate-vue3/core' {
  interface BaseEditor {
    renderElement: (props: RenderElementProps) => VNode;
    renderLeaf: (props: RenderLeafProps) => VNode;
  }
}

const renderElement = ({ attributes: attrs, children, element }: RenderElementProps) => {
  const attributes = {
    ...attrs,
    style: {
      textAlign: 'align' in element ? element.align : undefined,
      paddingLeft:
        'indent' in element && element.indent ? element.indent * INDENT_DELTA + 'px' : '',
    } as CSSProperties,
  };

  const tagName = mapElementTypeTagName[element.type] || mapElementTypeTagName.paragraph;
  return h(tagName, attributes, children);
};

const renderLeaf = ({ leaf, attributes, children }: RenderLeafProps) => {
  const {
    text,
    bold,
    italic,
    underline,
    strikethrough,
    code,
    superscript,
    subscript,
    font,
    size,
    color,
    background,
    ...rest
  } = leaf;

  const style: CSSProperties = {
    fontWeight: bold ? 'bold' : undefined,
    fontStyle: italic ? 'italic' : undefined,
    borderBottom: underline ? '1px solid black' : undefined,
    textDecoration: strikethrough ? 'line-through' : undefined,
    fontFamily: font ? font : undefined,
    fontSize: size ? size : undefined,
    color: color ? color : undefined,
    background: background ? background : undefined,
  };

  void text;

  return h(
    code ? 'code' : superscript ? 'sup' : subscript ? 'sub' : 'span',
    { ...attributes, style, class: Object.keys(rest).join(' ') },
    children,
  );
};

export function withRender(editor: Editor) {
  editor.renderLeaf = renderLeaf;
  editor.renderElement = renderElement;

  return editor;
}
