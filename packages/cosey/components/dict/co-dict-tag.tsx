import { computed, defineComponent } from 'vue';
import { ElTag } from 'element-plus';
import { coDictTagProps, coDictTagSlots } from './co-dict-tag.api';
import { type DictItem, useDict } from '../../dict';
import { useLocale } from '../../hooks';
import { translateMessage } from '../../locale';
import { createBem } from '../../utils';

export default defineComponent({
  name: 'CoDictTag',
  props: coDictTagProps,
  slots: coDictTagSlots,
  setup(props, { slots }) {
    const bem = createBem('dict-tag');

    const { t } = useLocale();

    const { items, getItem } = useDict(() => props.dict, { immediate: !!props.dict });

    const source = computed<DictItem[]>(() => props.options ?? items.value);

    const item = computed(() => {
      const list = source.value;

      if (!list.length) {
        return getItem(props.value);
      }

      return (
        list.find((node) => node.value === props.value) ??
        list.find((node) => String(node.value) === String(props.value))
      );
    });

    const label = computed(() => {
      const current = item.value;

      if (current) {
        if (!current.labelKey) {
          return current.label ?? String(current.value);
        }

        // 先查应用自己的 i18n 词条，再退回框架内置的 co.* 词条
        return translateMessage(current.labelKey) ?? t(current.labelKey);
      }

      if (props.fallback !== undefined) {
        return props.fallback;
      }

      return props.value === null || props.value === undefined || props.value === ''
        ? ''
        : String(props.value);
    });

    return () => {
      if (label.value === '') {
        return null;
      }

      const tagType = props.type ?? item.value?.color;

      return (
        <ElTag
          class={bem.b()}
          type={tagType as any}
          size={props.size}
          effect={props.effect}
          disable-transitions
        >
          {slots.default?.({ label: label.value, item: item.value }) ?? label.value}
        </ElTag>
      );
    };
  },
});
