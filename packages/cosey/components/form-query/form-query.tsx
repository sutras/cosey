import {
  type FormQueryContext,
  formQueryProps,
  formQueryContextSymbol,
  defaultMapSizeColNumber,
  formQuerySlots,
  formQueryEmits,
} from './form-query.api';
import { ElButton, ElForm } from 'element-plus';
import {
  useFormTemplate,
  FormItem,
  FormProps,
  locateInvalidContainer,
  useInvalidResponse,
} from '../form';
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
  unref,
  useModel,
} from 'vue';
import { useLocale } from '../../hooks';
import { createBem } from '../../utils';
import { RtiSearch } from 'richtext-icons';

export default defineComponent({
  name: 'CoFormQuery',
  props: formQueryProps,
  slots: formQuerySlots,
  emits: formQueryEmits,
  setup(props, { slots, expose: _expose }) {
    const bem = createBem('form-query');

    const { t } = useLocale();

    // main
    const { elFormProps, elFormRef, formContext, expose, reset, submit, submitting } =
      useFormTemplate<FormProps>(props as FormProps);

    const mergedRowProps = computed(() => {
      return Object.assign(
        {
          gutter: 24,
        },
        props.rowProps,
      );
    });

    // collapsed
    // 用 vue 内置的 `useModel`：父级绑了 `v-model:collapsed` 时受控，
    // 没绑时退回组件内部状态 —— 否则下面「校验失败自动展开」会写不动。
    const innerCollapsed = useModel(props, 'collapsed');

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

    // 收起时被隐藏的字段仍在 el-form 里参与校验（只是 display:none），
    // 报错却完全看不见 → 校验失败时自动展开。
    // 注意要显式传入 formContext：这里是 form-query 自己 provide 的表单上下文，
    // inject 查的是父级组件，拿不到自己 provide 的值。
    useInvalidResponse(
      ({ invalidFields, fields }) => {
        if (!props.switchToInvalid || !innerCollapsed.value) {
          return;
        }

        const isInvalid = locateInvalidContainer(invalidFields, fields, [
          {
            value: true,
            getEl: () => elFormRef.value?.$el as HTMLElement | undefined,
          },
        ]);

        if (isInvalid) {
          innerCollapsed.value = false;
        }
      },
      ['validate'],
      formContext,
    );

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
        <FormItem class={bem.e('form-item-buttons')} width={props.inline ? 'auto' : undefined}>
          <div class={[bem.e('buttons'), bem.is('inline', props.inline)]}>
            {slots.button ? (
              slots.button({ reset, submit, submitting: submitting.value })
            ) : (
              <>
                {!props.hideSubmit && (
                  <ElButton
                    type="primary"
                    {...props.submitProps}
                    loading={submitting.value}
                    icon={RtiSearch}
                    onClick={() => submit()}
                  >
                    {t(props.submitText)}
                  </ElButton>
                )}
                {!props.hideReset && (
                  <ElButton
                    {...props.resetProps}
                    onClick={() =>
                      reset(() => {
                        if (props.resetValues) {
                          const values = props.resetValues();
                          const model = unref(props.model);
                          if (values && model) {
                            Object.assign(model, values);
                          }
                        }
                      })
                    }
                  >
                    {t(props.resetText)}
                  </ElButton>
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
        <ElForm ref="form" {...elFormProps} class={bem.b()}>
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
