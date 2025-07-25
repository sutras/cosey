<script lang="tsx">
import { ElCheckbox, ElCheckboxButton, ElCheckboxGroup } from 'element-plus';
import { defineComponent, computed, h, type SlotsType, mergeProps } from 'vue';
import { type FieldCheckboxGroupProps, type FieldCheckboxGroupSlots } from './checkbox-group';

import { getLabelByValue, addNullablePlaceholder, isNumber } from '../../../../utils';
import Panel from './panel.vue';
import { omit } from 'lodash-es';

export default defineComponent(
  (props: FieldCheckboxGroupProps) => {
    const componentProps = computed(() => props.componentProps || {});
    const checkboxGroupProps = computed(() => {
      return omit(componentProps.value, [
        'options',
        'labelKey',
        'valueKey',
        'type',
        'checkboxWidth',
        'maxHeight',
      ]);
    });

    const convertedOptions = computed(() => {
      return (componentProps.value.options ?? []).map((option) => {
        if (typeof option === 'object') {
          return {
            ...option,
            label: option[(componentProps.value.labelKey as 'label') || 'label'],
            value: option[(componentProps.value.valueKey as 'value') || 'value'],
          };
        }
        return {
          label: option,
          value: option,
        };
      });
    });

    const checkboxType = computed(() => {
      return componentProps.value.type === 'button' ? ElCheckboxButton : ElCheckbox;
    });

    const checkboxWidth = computed(() => {
      const width = componentProps.value.checkboxWidth;
      return isNumber(width) ? width + 'px' : width;
    });

    return () => {
      if (props.readonly) {
        const value = componentProps.value.modelValue;
        return addNullablePlaceholder(value, (val) => {
          const label = getLabelByValue(convertedOptions.value, val);
          return Array.isArray(label) ? label.join(', ') : (label as string);
        });
      }

      const checkboxGroupVnode = h(
        ElCheckboxGroup,
        mergeProps(checkboxGroupProps.value, {
          class: 'flex flex-wrap gap-x-8',
        }),
        () =>
          convertedOptions.value.map((item) =>
            h(
              checkboxType.value,
              mergeProps(
                {
                  ...item,
                  key: item.value as string | number,
                },
                {
                  style: {
                    width: checkboxWidth.value,
                  },
                  class: '!me-0',
                },
              ),
            ),
          ),
      );

      return componentProps.value.indeterminate
        ? h(
            Panel,
            {
              modelValue: checkboxGroupProps.value.modelValue,
              'onUpdate:modelValue': componentProps.value['onUpdate:modelValue'],
              options: convertedOptions.value,
              maxHeight: componentProps.value.maxHeight,
            },
            () => checkboxGroupVnode,
          )
        : checkboxGroupVnode;
    };
  },
  {
    name: 'FieldCheckboxGroup',
    inheritAttrs: false,
    props: ['componentProps', 'componentSlots', 'readonly'],
    slots: {} as SlotsType<FieldCheckboxGroupSlots>,
  },
);
</script>
