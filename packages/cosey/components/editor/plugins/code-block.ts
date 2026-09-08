import Prism from 'prismjs';

import { h } from 'vue';
import { type RenderElementProps, toRawWeakMap, useInheritRef } from 'slate-vue3';
import { Editor, Element, Node, NodeEntry, Path, Range, Text } from 'slate-vue3/core';
import { CodeBlockElement, ParagraphElement } from '../types';
import ContentCodeBlock from '../contents/content-code-block';
import { Hotkeys } from './keyboard';
import {
  getRangePosition,
  getSortedRange,
  isNormalBlock,
  isPointAtEndOfElement,
  RangePosition,
} from '../utils';

export const languageOptions = [
  { value: 'text', label: 'PlainText' },
  { value: 'css', label: 'CSS' },
  { value: 'less', label: 'Less' },
  { value: 'scss', label: 'Scss' },
  { value: 'html', label: 'HTML' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'jsx', label: 'JSX' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'tsx', label: 'TSX' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'php', label: 'PHP' },
  { value: 'bash', label: 'Bash' },
  { value: 'java', label: 'Java' },
  { value: 'python', label: 'Python' },
  { value: 'sql', label: 'SQL' },
];

declare module 'slate-vue3/core' {
  interface BaseEditor {
    decorate: (nodeList: Node[]) => Range[];
    formatCodeBlock: () => void;
    isCodeBlockActive: () => boolean;
  }
}

function formatCodeBlock(editor: Editor) {
  if (!editor.selection) return;

  const isActive = editor.isCodeBlockActive();

  if (isActive) {
    editor.unwrapNodes({
      match: isCodeBlock,
      split: true,
    });
    editor.setNodes<ParagraphElement>(
      {
        type: 'paragraph',
      },
      { match: isCodeLine },
    );
  } else {
    editor.wrapNodes(
      { type: 'code-block', language: 'plain', children: [] },
      { match: isNormalBlock },
    );
    editor.setNodes({ type: 'code-line' }, { match: isNormalBlock });
  }
}

type PrismToken = Prism.Token;
type Token = {
  types: string[];
  content: string;
  empty?: boolean;
};

const newlineRe = /\r\n|\r|\n/;

// Empty lines need to contain a single empty token, denoted with { empty: true }
const normalizeEmptyLines = (line: Token[]) => {
  if (line.length === 0) {
    line.push({
      types: ['plain'],
      content: '\n',
      empty: true,
    });
  } else if (line.length === 1 && line[0].content === '') {
    line[0].content = '\n';
    line[0].empty = true;
  }
};

const appendTypes = (types: string[], add: string[] | string): string[] => {
  const typesSize = types.length;
  if (typesSize > 0 && types[typesSize - 1] === add) {
    return types;
  }

  return types.concat(add);
};

const normalizeTokens = (tokens: Array<PrismToken | string>): Token[][] => {
  const typeArrStack: string[][] = [[]];
  const tokenArrStack = [tokens];
  const tokenArrIndexStack = [0];
  const tokenArrSizeStack = [tokens.length];

  let i = 0;
  let stackIndex = 0;
  let currentLine: { types: string[]; content: string }[] = [];

  const acc = [currentLine];

  while (stackIndex > -1) {
    while ((i = tokenArrIndexStack[stackIndex]++) < tokenArrSizeStack[stackIndex]) {
      let content: any;
      let types = typeArrStack[stackIndex];

      const tokenArr = tokenArrStack[stackIndex];
      const token = tokenArr[i];

      // Determine content and append type to types if necessary
      if (typeof token === 'string') {
        types = stackIndex > 0 ? types : ['plain'];
        content = token;
      } else {
        types = appendTypes(types, token.type);
        if (token.alias) {
          types = appendTypes(types, token.alias);
        }

        content = token.content;
      }

      // If token.content is an array, increase the stack depth and repeat this while-loop
      if (typeof content !== 'string') {
        stackIndex++;
        typeArrStack.push(types);
        tokenArrStack.push(content);
        tokenArrIndexStack.push(0);
        tokenArrSizeStack.push(content.length);
        continue;
      }

      // Split by newlines
      const splitByNewlines = content.split(newlineRe);
      const newlineCount = splitByNewlines.length;

      currentLine.push({ types, content: splitByNewlines[0] });

      // Create a new line for each string on a new line
      for (let i = 1; i < newlineCount; i++) {
        normalizeEmptyLines(currentLine);
        acc.push((currentLine = []));
        currentLine.push({ types, content: splitByNewlines[i] });
      }
    }

    // Decreate the stack depth
    stackIndex--;
    typeArrStack.pop();
    tokenArrStack.pop();
    tokenArrIndexStack.pop();
    tokenArrSizeStack.pop();
  }

  normalizeEmptyLines(currentLine);
  return acc;
};

function node2Decorations(editor: Editor) {
  const decorationsMap = new toRawWeakMap<Node, Range[]>();
  const blockEntries = editor.nodes({
    at: [],
    mode: 'highest',
    match: isCodeBlock,
  });

  Array.from(blockEntries).forEach(([block, blockPath]: NodeEntry<CodeBlockElement>) => {
    const text = block.children.map((line) => Node.string(line)).join('\n');
    const tokens = Prism.tokenize(text, Prism.languages[block.language]);
    // make tokens flat and grouped by line
    normalizeTokens(tokens).forEach((tokens, index) => {
      const element = block.children[index];

      if (!decorationsMap.has(element)) {
        decorationsMap.set(element, []);
      }

      let start = 0;
      tokens.forEach((token) => {
        const length = token.content.length;
        if (!length) {
          return;
        }
        const end = start + length;
        const path = [...blockPath, index, 0];
        const range: Range = {
          anchor: { path, offset: start },
          focus: { path, offset: end },
          token: true,
          ...Object.fromEntries(token.types.map((type) => [type, true])),
        };
        decorationsMap.get(element).push(range);
        start = end;
      });
    });
  });

  return decorationsMap;
}

function decorate(editor: Editor, nodeList: Node[]) {
  const node = nodeList[0];
  if (isCodeLine(node)) {
    return node2Decorations(editor).get(node) || [];
  }
  return [];
}

function formatIndent(editor: Editor, value: number) {
  const codeLineNodes = Array.from(
    editor.nodes({
      match: isCodeLine,
    }),
  );

  function shouldInsert() {
    const range = getSortedRange(editor.selection!);
    if (codeLineNodes.length === 1) {
      const pos = getRangePosition(editor.range(codeLineNodes[0][1]), range);
      return (
        pos === RangePosition.CONTAIN ||
        pos === RangePosition.AFTER_BEGIN ||
        pos === RangePosition.BEFORE_END
      );
    }
    return false;
  }

  if (codeLineNodes.length > 0) {
    const selection = editor.selection!;

    if (Range.isCollapsed(selection) || shouldInsert()) {
      if (value === 1) {
        Editor.insertText(editor, '  ');
      }
    } else {
      codeLineNodes.forEach(([, path]) => {
        const firstNode = Node.first(editor, path);
        if (Text.isText(firstNode[0])) {
          const text = firstNode[0].text;

          if (value === 1) {
            editor.insertText('  ', {
              at: editor.start(firstNode[1]),
            });
          } else {
            const blankNum = Math.min(text.match(/^ +/)?.[0].length || 0, 2);
            if (blankNum > 0) {
              editor.delete({
                at: {
                  anchor: {
                    path: firstNode[1],
                    offset: 0,
                  },
                  focus: {
                    path: firstNode[1],
                    offset: blankNum,
                  },
                },
              });
            }
          }
        }
      });
    }
  }
}

function onKeydown(editor: Editor, event: KeyboardEvent) {
  if (Hotkeys.isSoftBreak(event)) {
    if (
      isPointAtEndOfElement(editor, 'code-block', ([, path]) => {
        editor.insertNodes(
          {
            type: 'paragraph',
            children: [{ text: '' }],
          },
          {
            at: Path.next(path),
          },
        );
        editor.move();
      })
    ) {
      event.preventDefault();
      return true;
    }
  }
}

function isCodeBlock(element: unknown): element is CodeBlockElement {
  return Element.isElementType(element, 'code-block');
}

function isCodeLine(element: unknown): element is CodeBlockElement {
  return Element.isElementType(element, 'code-line');
}

/**
 * code-block 只允许包含 code-line 节点；
 * 其他类型节点会替换为 code-line，后者内容为前者的内容字符串。
 */
function normalizeCodeBlock(editor: Editor, entry: NodeEntry<Node>) {
  const [node, path] = entry;

  if (!isCodeBlock(node)) return;

  const children = Array.from(Node.children(editor, path));

  for (const [childNode, childPath] of children) {
    if (!isCodeLine(childNode)) {
      const text = editor.string(childPath);
      editor.removeNodes({
        at: childPath,
      });
      editor.insertNodes(
        {
          type: 'code-line',
          children: [{ text }],
        },
        {
          at: childPath,
        },
      );

      return true;
    }
  }
}

/**
 * code-line 只允许包含文本节点，其他类型节点会被转换为文本节点;
 * code-line 父节点只能是 code-block，否则转换为 paragraph。
 */
function normalizeCodeLine(editor: Editor, entry: NodeEntry<Node>) {
  const [node, path] = entry;

  if (!isCodeLine(node)) return;

  if (!isCodeBlock(Node.parent(editor, path))) {
    editor.setNodes(
      {
        type: 'paragraph',
      },
      {
        at: path,
      },
    );
    return true;
  }

  const children = Array.from(Node.children(editor, path));

  for (const [childNode, childPath] of children) {
    if (!Text.isText(childNode)) {
      const text = editor.string(childPath);
      editor.removeNodes({
        at: childPath,
      });
      editor.insertNodes(
        {
          text,
        },
        {
          at: childPath,
        },
      );

      return true;
    }
  }
}

function normalizeNode(editor: Editor, entry: NodeEntry<Node>) {
  return normalizeCodeBlock(editor, entry) || normalizeCodeLine(editor, entry);
}

function isCodeBlockActive(editor: Editor) {
  if (!editor.selection) return false;

  const nodes = editor.nodes({
    at: editor.edges(editor.selection)[0],
    match: isCodeBlock,
  });

  return !nodes.next().done;
}

export function withCodeBlock(editor: Editor) {
  const {
    renderElement,
    formatIndent: srcFormatIndent,
    onKeydown: srcOnKeydown,
    normalizeNode: srcNormalizeNode,
  } = editor;

  editor.decorate = (nodeList: Node[]) => {
    return decorate(editor, nodeList);
  };

  editor.formatCodeBlock = () => {
    formatCodeBlock(editor);
  };

  editor.renderElement = (props: RenderElementProps) => {
    const { attributes, children, element } = props;

    if (element.type === 'code-block') {
      return h(
        ContentCodeBlock,
        {
          ...useInheritRef(attributes),
          language: element.language,
        },
        () => children,
      );
    }
    if (element.type === 'code-line') {
      return h('div', { ...attributes, style: { position: 'relative' } }, children);
    }

    return renderElement(props);
  };

  editor.formatIndent = (value: number) => {
    formatIndent(editor, value);
    return srcFormatIndent(value);
  };

  editor.onKeydown = (event: KeyboardEvent) => {
    if (!onKeydown(editor, event)) {
      srcOnKeydown(event);
    }
  };

  editor.normalizeNode = (entry, options) => {
    if (!normalizeNode(editor, entry)) {
      srcNormalizeNode(entry, options);
    }
  };

  editor.isCodeBlockActive = () => {
    return isCodeBlockActive(editor);
  };

  return editor;
}
