import { Editor } from 'slate-vue3/core';
import { toggleBlockAttr } from '../utils';

declare module 'slate-vue3/core' {
  interface BaseEditor {
    formatAlign: (value: string) => void;
  }
}

export type FormatAlign = 'start' | 'end' | 'left' | 'center' | 'right' | 'justify';

function formatAlign(editor: Editor, value: string) {
  toggleBlockAttr(editor, 'align', value);
}

export function withAlign(editor: Editor) {
  editor.formatAlign = (value) => {
    formatAlign(editor, value);
  };

  return editor;
}
