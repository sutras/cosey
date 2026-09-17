import { inject, type InjectionKey } from 'vue';
import { EditorFacade } from './editor';

export const editorContextKey = Symbol('editorContext') as InjectionKey<EditorFacade>;

export function useEditor(): EditorFacade {
  const editor = inject(editorContextKey);

  if (!editor) {
    throw new Error('useEditor must be used inside a <CoEditor> component');
  }

  return editor;
}
