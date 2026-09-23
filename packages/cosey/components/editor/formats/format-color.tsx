import { defineComponent, ref } from 'vue';
import ButtonSplit from '../ui/button-split';
import ColorPicker from '../ui/color-picker';
import { useLocale } from '../../../hooks';
import { useEditor } from '../pm/context';

export default defineComponent({
  name: 'CoEditorFormatColor',
  setup() {
    const editor = useEditor();
    const { t } = useLocale();

    const visible = ref(false);

    const current = ref('#000');

    const select = (color?: string) => {
      editor.formatColor(color);
    };

    const onChevronClick = () => {
      visible.value = !visible.value;
    };

    const onBtnClick = () => {
      select(current.value);
    };

    const onSelect = (color: string) => {
      current.value = color;
      select(color);
    };

    const onClear = () => {
      select();
    };

    return () => {
      return (
        <ColorPicker v-model:visible={visible.value} onSelect={onSelect} onClear={onClear}>
          <ButtonSplit
            chevronActive={visible.value}
            title={t('co.editor.textColor')}
            onClick={onBtnClick}
            onChevron-click={onChevronClick}
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              <g fill-rule="evenodd">
                <path fill={current.value} d="M3 18h18v3H3z"></path>
                <path
                  fill="currentColor"
                  d="M8.7 16h-.8a.5.5 0 0 1-.5-.6l2.7-9c.1-.3.3-.4.5-.4h2.8c.2 0 .4.1.5.4l2.7 9a.5.5 0 0 1-.5.6h-.8a.5.5 0 0 1-.4-.4l-.7-2.2c0-.3-.3-.4-.5-.4h-3.4c-.2 0-.4.1-.5.4l-.7 2.2c0 .3-.2.4-.4.4Zm2.6-7.6-.6 2a.5.5 0 0 0 .5.6h1.6a.5.5 0 0 0 .5-.6l-.6-2c0-.3-.3-.4-.5-.4h-.4c-.2 0-.4.1-.5.4Z"
                ></path>
              </g>
            </svg>
          </ButtonSplit>
        </ColorPicker>
      );
    };
  },
});
