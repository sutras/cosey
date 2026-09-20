import { computed, defineComponent } from 'vue';
import Select from './select';
import FontSizeDelta from './format-size-delta';
import { useEditor } from '../pm/context';
import { useLocale } from '../../../hooks';
import { useMarkValue } from '../hooks/useMarkValue';
import { RtiFontSizeDecrease, RtiFontSizeIncrease } from 'richtext-icons';

const sizes = [
  '8px',
  '10px',
  '12px',
  '14px',
  '16px',
  '18px',
  '20px',
  '24px',
  '32px',
  '40px',
  '48px',
  '56px',
  '64px',
  '72px',
];

export default defineComponent({
  name: 'CoEditorFormatSize',
  setup() {
    const { t } = useLocale();

    const list = computed(() => {
      const sizeList = sizes.map((size) => {
        return {
          label: size,
          value: size,
        };
      });
      return [
        {
          label: t('co.editor.defaultFontSize'),
          value: '',
        },
        ...sizeList,
      ];
    });

    const editor = useEditor();

    const current = useMarkValue('size');

    const onChange = (value: string) => {
      editor.formatSize(value);
    };

    const onDeltaChange = (value: string) => {
      current.value = value;
    };

    return () => {
      return (
        <>
          <Select
            v-model={current.value}
            list={list.value}
            button-width="100px"
            onChange={onChange}
          />
          <FontSizeDelta delta={-1} icon={RtiFontSizeDecrease} onChange={onDeltaChange} />
          <FontSizeDelta delta={+1} icon={RtiFontSizeIncrease} onChange={onDeltaChange} />
        </>
      );
    };
  },
});
