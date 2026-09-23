import { computed, defineComponent, type Component, type PropType } from 'vue';
import Select from '../ui/select';
import { getCssVar } from '../../../utils';
import { useLocale } from '../../../hooks';
import { useEditor } from '../pm/context';
import { HEADING_TYPES, type HeadingParagraphType } from '../types';

export default defineComponent({
  name: 'CoEditorFormatHeading',
  props: {
    label: { type: String },
    icon: { type: [Object, Function] as PropType<Component> },
    buttonWidth: { type: String, default: '116px' },
  },
  setup(props) {
    const { t } = useLocale();

    const list = computed(() => {
      const headingList = HEADING_TYPES.map((item, i) => {
        const n = (i + 1) as 1 | 2 | 3 | 4 | 5 | 6;
        return {
          label: `${t('co.editor.leading')} ${n}`,
          value: item,
          style: {
            fontSize: getCssVar('font-size-heading-' + n),
            lineHeight: getCssVar('line-height-heading-' + n),
            fontWeight: getCssVar('font-weight-strong'),
          },
        };
      });

      return [
        {
          label: t('co.editor.mainBody'),
          value: 'paragraph',
          style: {
            lineHeight: getCssVar('line-height'),
            fontSize: getCssVar('font-size-base'),
          },
        },
        ...headingList,
      ];
    });

    const editor = useEditor();

    const activeType = computed(() => {
      void editor.version.value;
      return editor.getActiveHeadingType();
    });

    const onChange = (value: HeadingParagraphType) => {
      editor.formatHeading(value);
    };

    return () => {
      return (
        <Select
          v-model={activeType.value}
          list={list.value}
          button-width={props.buttonWidth}
          label={props.label}
          icon={props.icon}
          onChange={onChange}
        ></Select>
      );
    };
  },
});
