import { computed, defineComponent, type PropType } from 'vue';
import { Icon } from '../../icon';
import Button from '../button';
import { useLocale } from '../../../hooks';
import { useEditor } from '../pm/context';
import { RtiRedo, RtiUndo } from 'richtext-icons';

export type HistoryDirection = 'undo' | 'redo';

/**
 * 撤销/重做。历史栈由 pm/plugins.ts 的 history() 维护，键盘侧已绑 Mod-z / Mod-y，
 * 这里只是把同一批命令暴露成按钮 —— 按钮的禁用态直接问命令本身，不另存一份状态。
 */
export default defineComponent({
  name: 'CoEditorFormatHistory',
  props: {
    direction: { type: String as PropType<HistoryDirection>, required: true },
    label: { type: String },
  },
  setup(props) {
    const editor = useEditor();
    const { t } = useLocale();

    const disabled = computed(() => {
      void editor.version.value;
      return props.direction === 'undo' ? !editor.canUndo() : !editor.canRedo();
    });

    const onClick = () => {
      if (props.direction === 'undo') {
        editor.undo();
      } else {
        editor.redo();
      }
    };

    return () => {
      return (
        <Button
          disabled={disabled.value}
          label={props.label}
          title={props.label ?? t(props.direction === 'undo' ? 'co.editor.undo' : 'co.editor.redo')}
          onClick={onClick}
        >
          <Icon>{props.direction === 'undo' ? <RtiUndo /> : <RtiRedo />}</Icon>
        </Button>
      );
    };
  },
});
