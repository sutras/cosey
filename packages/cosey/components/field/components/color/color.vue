<script lang="ts">
import { ElColorPicker } from 'element-plus';
import { defineComponent, h, mergeProps, type SlotsType } from 'vue';
import { type FieldColorProps, type FieldColorSlots } from './color';
import { addNullablePlaceholder } from '../../../../utils';

export default defineComponent(
  (props: FieldColorProps, { slots }) => {
    return () => {
      if (props.readonly) {
        return addNullablePlaceholder(props.componentProps?.modelValue);
      }

      return h(
        ElColorPicker,
        mergeProps(
          {
            style: {
              verticalAlign: 'top',
            },
          },
          props.componentProps ?? {},
        ),
        slots,
      );
    };
  },
  {
    name: 'FieldColor',
    inheritAttrs: false,
    props: ['componentProps', 'componentSlots', 'readonly'],
    slots: {} as SlotsType<FieldColorSlots>,
  },
);
</script>
