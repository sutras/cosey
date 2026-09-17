import { computed } from 'vue';
import { useEditor } from '../pm/context';

export function useMarkActive(mark: string) {
  const editor = useEditor();

  return computed(() => {
    void editor.version.value;
    return editor.isMarkActive(mark);
  });
}
