import {
  type FormQueryContext,
  type FormQueryExpose,
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
  h,
  isVNode,
  onBeforeMount,
  provide,
  reactive,
  ref,
  Fragment,
  defineComponent,
  type VNodeArrayChildren,
  unref,
  useModel,
} from 'vue';
import { cloneDeep } from 'lodash-es';
import { useLocale } from '../../hooks';
import { createBem, isObject } from '../../utils';
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
    const {
      elFormProps,
      elFormRef,
      formContext,
      expose,
      reset: resetForm,
      submit,
      submitting,
    } = useFormTemplate<FormProps>(props as FormProps, {
      // `schemes` / `submitOnEnter` 是 form-query 自己的属性，不能漏给 el-form
      omittedProps: ['schemes', 'submitOnEnter'] as unknown as (keyof FormProps)[],
      // 非栅格的行内查询条没有列宽约束，字段会被压到 input 的固有宽度，兜一个下限；
      // 显式定了 `width` 就听调用方的，不再兜
      defaultMinWidth: () => (!props.grid && props.inline && props.width == null ? 200 : undefined),
    });

    // model
    // 声明式字段需要一个模型来落值：调用方传了就用调用方的（必须是 reactive），
    // 没传就自己造一个 —— 这也是 `co-form-query` 能直接替掉 `co-table-query` 的关键。
    const innerModel = reactive<Record<string, any>>({});

    const formModel = computed<Record<string, any>>(() => {
      return props.model || innerModel;
    });

    onBeforeMount(() => {
      if (props.model) {
        return;
      }

      props.schemes.forEach((item) => {
        if (!isObject(item) || item.prop === undefined) {
          return;
        }

        innerModel[item.prop as string] = item.modelValue;
      });
    });

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

    // 插槽里的字段
    const slotChildren = () => {
      const content = slots.default?.({}) || [];

      return content.length === 1 && content[0].type === Fragment
        ? (content[0].children as VNodeArrayChildren)
        : content;
    };

    // 声明式字段：与手写 `co-form-item` 走同一条渲染路径，所以折叠/栅格/校验完全一致
    const schemeNodes = () => {
      const model = formModel.value;

      return props.schemes.filter(isObject).map((item) => {
        const { slots: itemSlots, render, ...rest } = item;
        const prop = rest.prop as string;

        if (render) {
          return h(FormItem, rest, {
            ...itemSlots,
            default: () => render({ model }),
          });
        }

        return h(
          FormItem,
          {
            ...rest,
            modelValue: model[prop],
            'onUpdate:modelValue': (value: any) => {
              model[prop] = value;
            },
          },
          itemSlots as any,
        );
      });
    };

    const fieldNumber = computed(() => {
      return props.schemes.filter(isObject).length + slotChildren().length;
    });

    const showToggle = computed(() => {
      if (props.minFields === 0 || fieldNumber.value <= props.minFields) {
        return false;
      }

      // 非栅格没有「列」，收起数量只能由 `minFields` 显式给出
      if (!props.grid) {
        return props.minFields > 0;
      }

      return fieldNumber.value + 1 > colNumber.value;
    });

    provide<FormQueryContext>(formQueryContextSymbol, {
      shouldHide(index: number) {
        if (props.minFields === 0 || !innerCollapsed.value) {
          return false;
        }

        // 非栅格（inline 查询条）没有列的概念，「显示一行」算不出来，
        // 只认正数 `minFields`；默认 -1 时保持不折叠，与加折叠能力之前一致。
        if (!props.grid) {
          return props.minFields > 0 && index > props.minFields - 1;
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
      const children = [...schemeNodes(), ...slotChildren()];

      return children.map((item: any, index: number) => {
        return isVNode(item)
          ? cloneVNode(item, {
              internalIndex: index,
            })
          : item;
      });
    };

    // model api
    const getFieldsValue = () => {
      return cloneDeep(unref(formModel));
    };

    const setFieldsValue = (values: Record<PropertyKey, any>) => {
      Object.assign(unref(formModel), values);
    };

    const getModel = () => unref(formModel);

    const reset: FormQueryExpose['reset'] = (valuesOrCallback) => {
      if (typeof valuesOrCallback === 'function') {
        resetForm(valuesOrCallback as () => void);
        return;
      }

      resetForm(() => {
        if (valuesOrCallback) {
          setFieldsValue(valuesOrCallback);
        }
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
                          const model = unref(formModel);

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
            {showToggle.value && <Toggle v-model={innerCollapsed.value} />}
          </div>
        </FormItem>
      );
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (!props.submitOnEnter || event.key !== 'Enter') {
        return;
      }

      // 拦掉 el-form 的隐式提交
      event.preventDefault();
    };

    const handleKeyup = (event: KeyboardEvent) => {
      if (!props.submitOnEnter || event.key !== 'Enter') {
        return;
      }

      event.preventDefault();
      submit();
    };

    _expose(
      Object.assign({}, expose, {
        reset,
        getFieldsValue,
        setFieldsValue,
        getModel,
      }) as FormQueryExpose,
    );

    return () => {
      return (
        <ElForm
          ref="form"
          {...elFormProps}
          model={formModel.value}
          {...{
            onKeydown: handleKeydown,
            onKeyup: handleKeyup,
          }}
          class={[bem.b(), bem.m('inline', props.inline)]}
        >
          {props.grid ? (
            <Row {...mergedRowProps.value} onSize-change={handleSizeChange}>
              {mapChildren()}
              <ButtonsTemplate />
            </Row>
          ) : (
            <>
              {mapChildren()}
              <ButtonsTemplate />
            </>
          )}
        </ElForm>
      );
    };
  },
});
