import { CSSProperties, defineComponent, PropType } from 'vue';
import { isObject, createBem } from '../../../utils';

export interface SelectListItem {
  label: string;
  value: any;
  style?: CSSProperties;
}

export default defineComponent({
  name: 'CoEditorSelectList',
  props: {
    selectedValue: {
      type: null,
    },
    list: {
      type: Array as PropType<SelectListItem[]>,
      required: true,
    },
  },
  emits: {
    select: (item: SelectListItem) => isObject(item),
  },
  setup(props, { emit }) {
    const bem = createBem('editor-select-list');

    const onSelect = (item: SelectListItem) => {
      emit('select', item);
    };

    return () => {
      return (
        <div class={bem.b()}>
          {props.list.map((item) => (
            <div
              key={item.value}
              class={[bem.e('item'), bem.is('active', props.selectedValue === item.value)]}
              style={item.style}
              onClick={() => onSelect(item)}
            >
              {item.label}
            </div>
          ))}
        </div>
      );
    };
  },
});
