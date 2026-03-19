import {
  type FormQueryContext,
  formQueryProps,
  formQueryContextSymbol,
  defaultMapSizeColNumber,
  formQuerySlots,
  formQueryEmits,
} from './form-query.api';
import { ElButton, ElForm } from 'element-plus';
import { useFormTemplate, FormItem, FormProps } from '../form';
import { type RowSize, Row } from '../row';
import { Toggle } from '../toggle';
import {
  cloneVNode,
  computed,
  isVNode,
  provide,
  ref,
  Fragment,
  defineComponent,
  type VNodeArrayChildren,
} from 'vue';
import { useTwoWayBinding } from '../../hooks';
import useStyle from './form-query.style';
import { useComponentConfig } from '../config-provider';
import { useLocale } from '../../hooks';
import { Search } from '@element-plus/icons-vue';

export default defineComponent({
  name: 'CoFormQuery',
  props: formQueryProps,
  slots: formQuerySlots,
  emits: formQueryEmits,
  setup(props, { slots, emit, expose: _expose }) {
    const { prefixCls } = useComponentConfig('form-query', props);

    const { hashId } = useStyle(prefixCls);

    const { t } = useLocale();

    // main
    const { elFormProps, expose, reset, submit, submitting } = useFormTemplate<FormProps>(
      props as FormProps,
    );

    const mergedRowProps = computed(() => {
      return Object.assign(
        {
          gutter: 24,
        },
        props.rowProps,
      );
    });

    // collapsed
    const innerCollapsed = useTwoWayBinding(props, emit, 'collapsed');

    const mapSizeColNumber = computed(() => {
      return Object.assign(defaultMapSizeColNumber, props.colProps);
    });
    const rowSize = ref<RowSize>('xs');
    const colNumber = computed(() => 24 / mapSizeColNumber.value[rowSize.value]);
    const rowNumber = ref(1);

    const handleSizeChange = (size: RowSize) => {
      rowSize.value = size;
    };

    const fieldNumber = computed(() => {
      const content = slots.default?.({});
      if (!content) {
        return 0;
      }
      if (content.length === 1 && content[0].type === Fragment) {
        return (content[0].children?.length as number) || 0;
      }
      return content.length || 0;
    });

    const showToggle = computed(() => {
      return (
        props.minFields !== 0 &&
        fieldNumber.value > props.minFields &&
        fieldNumber.value + 1 > colNumber.value
      );
    });

    provide<FormQueryContext>(formQueryContextSymbol, {
      shouldHide(index: number) {
        if (props.minFields === 0 || !innerCollapsed.value) {
          return false;
        }
        if (props.minFields > 0) {
          return index > props.minFields - 1;
        }
        const indexToShow = rowNumber.value * colNumber.value - 2;
        return indexToShow < 0 ? index > 0 : index > indexToShow;
      },
    });

    const mapChildren = () => {
      const content = slots.default?.({}) || [];

      const children =
        content.length === 1 && content[0].type === Fragment
          ? (content[0].children as VNodeArrayChildren)
          : content;

      return children.map((item: any, index: number) => {
        return isVNode(item)
          ? cloneVNode(item, {
              internalIndex: index,
            })
          : item;
      });
    };

    const ButtonsTemplate = () => {
      if (props.hideButtons || (props.hideReset && props.hideSubmit)) {
        return null;
      }

      return (
        <FormItem
          class={`${prefixCls.value}-form-item-buttons`}
          width={props.inline ? 'auto' : undefined}
        >
          <div class={[`${prefixCls.value}-buttons`, { 'is-inline': props.inline }]}>
            {slots.button ? (
              slots.button({ reset, submit, submitting: submitting.value })
            ) : (
              <>
                {!props.hideSubmit && (
                  <ElButton
                    onClick={() => submit()}
                    type="primary"
                    loading={submitting.value}
                    icon={Search}
                  >
                    {t('co.form.search')}
                  </ElButton>
                )}
                {!props.hideReset && (
                  <ElButton onClick={() => reset()}>{t('co.form.reset')}</ElButton>
                )}
              </>
            )}
            {props.grid && showToggle.value && <Toggle v-model={innerCollapsed.value} />}
          </div>
        </FormItem>
      );
    };

    _expose(expose);

    return () => {
      return (
        <ElForm ref="form" {...elFormProps} class={[hashId.value, prefixCls.value]}>
          {props.grid ? (
            <Row {...mergedRowProps.value} onSize-change={handleSizeChange}>
              {mapChildren()}
              <ButtonsTemplate />
            </Row>
          ) : (
            <>
              {slots.default?.({})}
              <ButtonsTemplate />
            </>
          )}
        </ElForm>
      );
    };
  },
});
