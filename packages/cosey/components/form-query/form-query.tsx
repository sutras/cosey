import {
  type FormQueryContext,
  type FormQueryExpose,
  type FormQueryGroup,
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
import { type RowSize, Row, generateAlgorithms } from '../row';
import { Col } from '../col';
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
  onBeforeUnmount,
  onMounted,
  type VNodeArrayChildren,
  unref,
  useModel,
} from 'vue';
import { cloneDeep } from 'lodash-es';
import { useLocale, useResizeObserver } from '../../hooks';
import { createBem, isObject } from '../../utils';
import { RtiSearch } from 'richtext-icons';

/** 一个分组段：`group` 为空的是「未分组」段，字段照原样铺开 */
interface FormQuerySegment {
  group?: FormQueryGroup;
  index: number;
  items: any[];
}

export default defineComponent({
  name: 'CoFormQuery',
  props: formQueryProps,
  slots: formQuerySlots,
  emits: formQueryEmits,
  setup(props, { slots, expose: _expose }) {
    const bem = createBem('form-query');

    const { t } = useLocale();

    // 窄屏（≤768）下行内条会把每个控件压成内容宽度，退回块级让表单项撑满容器
    const narrowMedia =
      typeof window === 'undefined' ? undefined : window.matchMedia('(max-width: 768px)');

    const isNarrow = ref(narrowMedia?.matches ?? false);

    const onNarrowChange = (event: MediaQueryListEvent) => {
      isNarrow.value = event.matches;
    };

    onMounted(() => narrowMedia?.addEventListener('change', onNarrowChange));

    onBeforeUnmount(() => narrowMedia?.removeEventListener('change', onNarrowChange));

    const innerInline = computed(() => props.inline && !isNarrow.value);

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
      defaultMinWidth: () =>
        !props.grid && innerInline.value && props.width == null ? 200 : undefined,
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

    // 非栅格没有 Row 量宽度，自己观察表单宽度，组名左置才有回落依据
    const rowAlgorithms = generateAlgorithms();

    const formEl = ref<HTMLElement>();

    onMounted(() => {
      formEl.value = elFormRef.value?.$el as HTMLElement | undefined;
    });

    useResizeObserver(formEl, ({ inlineSize }) => {
      if (props.grid) {
        return;
      }

      for (const [size, matched] of rowAlgorithms) {
        if (matched(inlineSize)) {
          rowSize.value = size;
          return;
        }
      }
    });

    // 组名左置要固定占一列，容器太窄（手机尺寸）就退回顶部
    const isLeftLayout = computed(() => props.groupLayout === 'left' && rowSize.value !== 'xs');

    // 标题列宽度走 CSS 变量：默认值写在样式里，这里只负责覆盖
    const groupTitleStyle = computed(() => {
      if (props.groupTitleWidth == null) {
        return undefined;
      }

      const width =
        typeof props.groupTitleWidth === 'number'
          ? `${props.groupTitleWidth}px`
          : props.groupTitleWidth;

      return { '--co-form-query-group-title-width': width };
    });

    // 有分组时按钮挤进最后一组，不分组时仍「紧跟最后一个字段」
    const grouped = computed(() => props.groups.some(isObject));

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

    const isHiddenIndex = (index: number) => {
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
    };

    provide<FormQueryContext>(formQueryContextSymbol, { shouldHide: isHiddenIndex });

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

    /** 字段上标记的分组名（`schemes` 与手写 `co-form-item` 都走这条） */
    const readGroup = (vnode: any): string | undefined => {
      return isVNode(vnode) ? (vnode.props as any)?.group : undefined;
    };

    /**
     * 按 `groups` 的顺序分段：段内保持书写顺序，未标记或名字没声明的进最后一段。
     * 栅格与行内都分段，行内时每组占一块，组名在上或左。
     */
    const buildSegments = (): FormQuerySegment[] => {
      const children = [...schemeNodes(), ...slotChildren()];
      const groups = props.groups.filter(isObject);

      const segments: FormQuerySegment[] = groups.map((group, index) => ({
        group,
        index,
        items: [],
      }));

      // 未分组段没有 `group`，永远不渲染标题
      const ungrouped: FormQuerySegment = { index: -1, items: [] };
      const byName = new Map<string | undefined, FormQuerySegment>(
        segments.map((segment) => [segment.group!.name, segment]),
      );

      children.forEach((child) => {
        const segment = byName.get(readGroup(child)) || ungrouped;

        segment.items.push(child);
      });

      return [...segments, ungrouped].filter((segment) => segment.items.length > 0);
    };

    /** 组标题内容：`group-title` 插槽 > 分组自己的 `render` > `label` */
    const groupTitle = (segment: FormQuerySegment) => {
      if (!segment.group) {
        return null;
      }

      const params = { group: segment.group, index: segment.index };

      if (slots['group-title']) {
        return slots['group-title'](params);
      }

      return segment.group.render ? segment.group.render(params) : segment.group.label;
    };

    /** 渲染顺序即折叠顺序，`internalIndex` 在分段之后重新编号 */
    const renderChildren = () => {
      const nodes: any[] = [];
      let index = 0;

      // 栅格里的字段自带半 gutter 内边距，组内容区要用负边距抵掉，才好和别的字段左右对齐
      const bodyStyle = props.grid
        ? { marginInline: `-${(mergedRowProps.value.gutter ?? 0) / 2}px` }
        : undefined;

      // 行内时字段要继续连排；退出行内（窄屏或没开 inline）就让 body 变回块级，
      // 否则 flex 会把表单项按内容宽度并排，撑不满容器
      const bodyClass = [bem.e('group-body'), bem.is('block', !props.grid && !innerInline.value)];

      const segments = buildSegments().map((segment) => {
        const items = segment.items.map((child: any) => {
          const current = index;

          index += 1;

          return {
            index: current,
            vnode: isVNode(child) ? cloneVNode(child, { internalIndex: current }) : child,
          };
        });

        return {
          ...segment,
          fields: items.map((item) => item.vnode),
          // 整组都被折叠起来时，整块收起，别留一截悬空的组名
          visible: items.some((item) => !isHiddenIndex(item.index)),
        };
      });

      // 按钮挂在最后一个有可见字段的组里，不再单独占一行；
      // 一组都不剩（字段全被折叠）时返回 false，让按钮退回独立一行
      let attachIndex = -1;

      if (grouped.value) {
        segments.forEach((segment, i) => {
          if (segment.visible) {
            attachIndex = i;
          }
        });
      }

      const buttons = attachIndex >= 0 ? ButtonsTemplate(true) : null;

      segments.forEach((segment, i) => {
        const fields = i === attachIndex && buttons ? [...segment.fields, buttons] : segment.fields;
        const title = groupTitle(segment);

        // 没有标题的段（未分组，或分组没给 label / render / 插槽）照原样铺开
        if (title == null || title === '') {
          fields.forEach((field) => nodes.push(field));

          return;
        }

        const left = isLeftLayout.value;
        const wrapperClass = [
          bem.e('group'),
          bem.is('left', left),
          bem.is('empty', !segment.visible),
        ];

        nodes.push(
          props.grid ? (
            <Col span={24} class={wrapperClass}>
              {segment.visible ? (
                <span class={[bem.e('group-title'), bem.is('left', left)]}>{title}</span>
              ) : null}
              <div class={bodyClass} style={bodyStyle}>
                {fields}
              </div>
            </Col>
          ) : (
            <div class={wrapperClass}>
              {segment.visible ? (
                <span class={[bem.e('group-title'), bem.is('left', left)]}>{title}</span>
              ) : null}
              <div class={bodyClass}>{fields}</div>
            </div>
          ),
        );
      });

      return { nodes, attached: !!buttons };
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

    const ButtonsTemplate = (attached: boolean) => {
      if (props.hideButtons || (props.hideReset && props.hideSubmit)) {
        return null;
      }

      const content = (
        <div
          class={[
            bem.e('buttons'),
            bem.is('attached', attached),
            bem.is('inline', !attached && innerInline.value && !grouped.value),
          ]}
        >
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
      );

      // 组内：栅格里的字段自带半 gutter 内边距，按钮也得补上同样的边距，
      // 右边缘才能和同组字段对齐（不能拿 Col 当壳，它的 `span` 默认就是 24）
      if (attached) {
        if (!props.grid) {
          return content;
        }

        const padding = `${(mergedRowProps.value.gutter ?? 0) / 2}px`;

        return (
          <div class={bem.e('buttons-cell')} style={{ paddingInline: padding }}>
            {content}
          </div>
        );
      }

      // 分组但一组都没挂上（字段全被折叠）：退回单独一行，
      // 不用 FormItem，免得被表单的 `width` 约束成窄条
      if (grouped.value) {
        return <div class={bem.e('buttons-row')}>{content}</div>;
      }

      return (
        <FormItem class={bem.e('form-item-buttons')} width={innerInline.value ? 'auto' : undefined}>
          {content}
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
      const { nodes, attached } = renderChildren();

      return (
        <ElForm
          ref="form"
          {...elFormProps}
          inline={innerInline.value}
          model={formModel.value}
          {...{
            onKeydown: handleKeydown,
            onKeyup: handleKeyup,
          }}
          style={groupTitleStyle.value}
          class={[bem.b(), bem.m('inline', innerInline.value)]}
        >
          {props.grid ? (
            <Row {...mergedRowProps.value} onSize-change={handleSizeChange}>
              {nodes}
              {attached ? null : ButtonsTemplate(false)}
            </Row>
          ) : (
            <>
              {nodes}
              {attached ? null : ButtonsTemplate(false)}
            </>
          )}
        </ElForm>
      );
    };
  },
});
