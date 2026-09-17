import { computed, defineComponent } from 'vue';
import Select from './select';
import { getCssVar } from '../../../utils';
import { useEditor } from '../pm/context';
import { HEADING_TYPES, type HeadingParagraphType } from '../types';

export default defineComponent({
  name: 'CoEditorFormatHeading',
  setup() {
    const list = computed(() => {
      const headingList = HEADING_TYPES.map((item, i) => {
        const n = (i + 1) as 1 | 2 | 3 | 4 | 5 | 6;
        return {
          label: `标题 ${n}`,
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
          label: '正文',
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
          button-width="100px"
          onChange={onChange}
        ></Select>
      );
    };
  },
});
