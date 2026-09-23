import { computed, defineComponent, h, type Component, type PropType, ref } from 'vue';
import { Icon } from '../../icon';
import Picker from './picker';
import ButtonSelect from './button-select';
import SelectList, { type SelectListItem } from './select-list';

export default defineComponent({
  name: 'CoEditorSelect',
  props: {
    list: { type: Array as PropType<SelectListItem[]>, required: true },
    modelValue: { type: null },
    buttonWidth: { type: String },
    /** 固定文字标签：传入时按钮显示该文字而非当前选中值（用于上下文菜单项） */
    label: { type: String },
    /** 可选图标：显示在文字标签前（用于上下文菜单项） */
    icon: { type: [Object, Function] as PropType<Component> },
  },
  emits: {
    'update:modelValue': (value: any) => !!value || true,
    change: (value: any) => !!value || true,
  },
  setup(props, { emit }) {
    const visible = ref(false);

    const displayedLabel = computed(() => {
      return props.list.find((item) => item.value === props.modelValue)?.label || props.modelValue;
    });

    const onSelect = (item: SelectListItem) => {
      emit('update:modelValue', item.value);
      emit('change', item.value);
      visible.value = false;
    };

    const onClick = () => {
      visible.value = !visible.value;
    };

    return () => {
      return (
        <Picker
          v-model:visible={visible.value}
          max-height="300px"
          v-slots={{
            default: () => (
              <ButtonSelect width={props.buttonWidth} onClick={onClick}>
                {{
                  prefix: () => (props.icon ? <Icon>{h(props.icon)}</Icon> : null),
                  default: () => props.label ?? displayedLabel.value,
                }}
              </ButtonSelect>
            ),
            content: () => (
              <SelectList list={props.list} selectedValue={props.modelValue} onSelect={onSelect} />
            ),
          }}
        />
      );
    };
  },
});
