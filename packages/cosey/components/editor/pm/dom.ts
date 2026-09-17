import { DOMParser, DOMSerializer, type Node as PMNode } from 'prosemirror-model';
import { schema } from './schema';

const domParser = DOMParser.fromSchema(schema);
const domSerializer = DOMSerializer.fromSchema(schema);

export function parseHTML(html: string): PMNode {
  const container = document.createElement('div');
  container.innerHTML = html;
  return domParser.parse(container);
}

export function serializeDoc(doc: PMNode): string {
  const fragment = domSerializer.serializeFragment(doc.content);
  const wrapper = document.createElement('div');
  wrapper.appendChild(fragment);
  return wrapper.innerHTML;
}
