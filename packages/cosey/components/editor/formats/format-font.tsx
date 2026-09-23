import { computed, defineComponent } from 'vue';
import Select from '../ui/select';
import { useEditor } from '../pm/context';
import { useLocale } from '../../../hooks';
import { useMarkValue } from '../hooks/useMarkValue';

const fonts = [
  // 中文
  ['Microsoft YaHei', '"Microsoft YaHei"'],
  ['PingFang SC', '"PingFang SC"'],
  ['Hiragino Sans GB', '"Hiragino Sans GB"'],
  ['SimSun', 'SimSun'],
  ['STHeiti', 'STHeiti'],

  // 英文
  ['Andale Mono', '"andale mono", monospace'],
  ['Arial', 'arial, helvetica, sans-serif'],
  ['Arial Black', '"arial black", sans-serif'],
  ['Book Antiqua', '"book antiqua", palatino, serif'],
  ['Comic Sans MS', '"comic sans ms", sans-serif'],
  ['Courier New', '"courier new", courier, monospace'],
  ['Georgia', 'georgia, palatino, serif'],
  ['Helvetica', 'helvetica, arial, sans-serif'],
  ['Impact', 'impact, sans-serif'],
  ['Symbol', 'symbol'],
  ['Tahoma', 'tahoma, arial, helvetica, sans-serif'],
  ['Terminal', 'terminal, monaco, monospace'],
  ['Times New Roman', '"times new roman", times, serif'],
  ['Trebuchet MS', '"trebuchet ms", geneva, sans-serif'],
  ['Verdana', 'verdana, geneva, sans-serif'],
];

export default defineComponent({
  name: 'CoEditorFormatFont',
  setup() {
    const { t } = useLocale();

    const list = computed(() => {
      const sizeList = fonts.map(([label, value]) => {
        return {
          label,
          value,
          style: {
            fontFamily: value,
          },
        };
      });
      return [
        {
          label: t('co.editor.defaultFont'),
          value: '',
        },
        ...sizeList,
      ];
    });

    const editor = useEditor();

    const current = useMarkValue('font');

    const onChange = (value: string) => {
      editor.formatFont(value);
    };

    return () => {
      return (
        <Select
          v-model={current.value}
          list={list.value}
          button-width="100px"
          onChange={onChange}
        />
      );
    };
  },
});
