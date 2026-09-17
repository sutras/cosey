import { ref, watch } from 'vue';
import { useEditor } from '../pm/context';

export function useMarkValue(mark: string, initial: boolean | number | string = '') {
  const editor = useEditor();

  const current = ref(initial as string);

  watch(
    () => editor.version.value,
    () => {
      current.value = editor.getTextStyleValue(mark);
    },
  );

  return current;
}
