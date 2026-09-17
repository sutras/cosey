import { computed } from 'vue';
import { useEditor } from '../pm/context';

export function useBlockValueActive(key: string, value: string) {
  const editor = useEditor();

  return computed(() => {
    void editor.version.value;

    if (key === 'align') {
      return editor.isAlignActive(value as never);
    }

    return false;
  });
}
