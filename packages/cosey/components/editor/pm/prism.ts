import Prism from 'prismjs';
import 'prismjs';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-sass';
import 'prismjs/components/prism-less';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-python';
import { type Node as PMNode } from 'prosemirror-model';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { schema } from './schema';

const prismPluginKey = new PluginKey('editor-prism');

interface FlatToken {
  content: string;
  types: string[];
}

function flattenTokens(tokens: Array<Prism.Token | string>): FlatToken[] {
  const result: FlatToken[] = [];
  const stack: Array<{ types: string[] }> = [{ types: [] }];

  const walk = (items: Array<Prism.Token | string>) => {
    for (const token of items) {
      if (typeof token === 'string') {
        result.push({ content: token, types: [...stack[stack.length - 1].types] });
      } else {
        const types = [...stack[stack.length - 1].types];
        if (token.type) types.push(token.type);
        if (token.alias) {
          const aliases = Array.isArray(token.alias) ? token.alias : [token.alias];
          types.push(...aliases);
        }

        if (typeof token.content === 'string') {
          result.push({ content: token.content, types });
        } else {
          stack.push({ types });
          walk(token.content as Array<Prism.Token | string>);
          stack.pop();
        }
      }
    }
  };

  walk(tokens);
  return result;
}

function getDecorations(doc: PMNode): DecorationSet {
  const decorations: Decoration[] = [];

  doc.descendants((node, pos) => {
    if (node.type !== schema.nodes.code_block) return;

    const language = node.attrs.language as string;
    const grammar = Prism.languages[language];
    if (!grammar) return;

    const text = node.textContent;
    const tokens = Prism.tokenize(text, grammar);

    let offset = 0;
    for (const token of flattenTokens(tokens)) {
      const from = pos + 1 + offset;
      const to = from + token.content.length;
      offset += token.content.length;

      if (!token.content) continue;

      decorations.push(Decoration.inline(from, to, { class: ['token', ...token.types].join(' ') }));
    }
  });

  return DecorationSet.create(doc, decorations);
}

export const prismPlugin = new Plugin({
  key: prismPluginKey,
  state: {
    init(_, { doc }) {
      return getDecorations(doc);
    },
    apply(tr, old) {
      return tr.docChanged ? getDecorations(tr.doc) : old;
    },
  },
  props: {
    decorations(state) {
      return this.getState(state);
    },
  },
});
