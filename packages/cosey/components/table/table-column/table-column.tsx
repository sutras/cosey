import { computed, defineComponent, h } from 'vue';
import { type TableColumnProps, type TableColumnSlots, tableColumnProps } from './table-column.api';
import { isFunction, isPlainObject, isString, createBem } from '../../../utils';
import { mapRendererColumnProps, renderer } from './renderer';
import { ElTableColumn, ElTooltip } from 'element-plus';
import classNames from 'classnames';

import { useLocale } from '../../../hooks';
import { Icon } from '../../icon';
import { TableAction } from '../../table-action';
import { Field } from '../../field';
import { getCssVar } from '../../../utils';
import { RtiHelp } from 'richtext-icons';

/** 只在本组件内部使用、不能透传给 ElTableColumn 的属性 */
const INTERNAL_PROP_KEYS = ['editable'];

const TableColumn = defineComponent({
  // 使用和ep一样的组件名
  // 是为了在多级表头中瞒骗ep以便和其他 ElTableColumn 一样添加到其子组件列表
  name: 'ElTableColumn',
  inheritAttrs: false,

  props: tableColumnProps,

  emits: {
    'cell-change': (payload: { row: any; prop: string; value: any; index: number }) =>
      payload.index >= 0,
  },

  setup(props: TableColumnProps, { emit }) {
    const bem = createBem('table-column');

    const { t } = useLocale();

    const mergedProps = computed<TableColumnProps>(() => {
      const obj: TableColumnProps = {};
      const cls = [props.className, bem.b()];

      for (const [key, value] of Object.entries(props)) {
        if (value !== undefined && !INTERNAL_PROP_KEYS.includes(key)) {
          (obj as any)[key] = value;
        }
      }

      if (!obj.formatter) {
        if (obj.format) {
          obj.formatter = (row, column, cellValue, index) => {
            return obj.format!(cellValue, row, column, index);
          };
        } else {
          obj.formatter = (row, column, cellValue, index) => {
            return renderer({ cellValue, row, column, index }, obj.renderer, t);
          };

          const renderType = typeof obj.renderer === 'object' ? obj.renderer.type : obj.renderer!;

          const renderProps = mapRendererColumnProps[renderType as string];

          if (renderProps) {
            cls.push(renderProps.className);
            if (renderProps.minWidth && !obj.minWidth) {
              obj.minWidth = renderProps.minWidth;
            }
          }
        }
      }

      obj.className = classNames(cls);

      return obj;
    });

    const slots = computed(() => {
      const result: TableColumnSlots = {};
      const slots = mergedProps.value.slots;
      if (isString(slots)) {
        result.default = props.internalSlot?.[slots];
      } else if (isPlainObject(slots)) {
        for (const [key, value] of Object.entries(slots)) {
          result[key as keyof TableColumnSlots] = isString(value)
            ? props.internalSlot?.[value]
            : value;
        }
      } else if (isFunction(slots)) {
        result.default = slots;
      }
      return result;
    });

    /**
     * `actions` 声明的操作按钮，渲染成 `co-table-action`。
     * 返回 `undefined` 表示该列没有用 `actions`，交回给 `slots` 处理。
     */
    const renderActions = computed(() => {
      const { actions, divider } = mergedProps.value;

      if (!actions) {
        return undefined;
      }

      return (slotProps: { row: any; $index: number }) => {
        // element-plus 会先用 `{ row: {}, $index: -1 }` 调一次默认插槽来收集嵌套列，
        // 那一次不渲染内容：免得把假 row 交给 `actions` 工厂（尤其别让它抛错）
        if (slotProps.$index < 0) {
          return [];
        }

        return [
          <TableAction
            actions={isFunction(actions) ? actions(slotProps.row, slotProps.$index) : actions}
            divider={divider}
          />,
        ];
      };
    });

    /**
     * 行内编辑：把单元格渲染成 `co-field`。
     * 返回 `undefined` 表示该列没有开启编辑，交回给 `actions` / `slots`。
     */
    const renderEditable = (slotProps: { row: any; $index: number }) => {
      // 注意读 `props` 而不是 `mergedProps`：`editable` 在 INTERNAL_PROP_KEYS 里，
      // 不会透传给 ElTableColumn，所以 mergedProps 上永远没有它
      const { editable } = props;

      if (!editable) {
        return undefined;
      }

      // element-plus 收集嵌套列时会用 `{ row: {}, $index: -1 }` 调一次默认插槽
      if (slotProps.$index < 0) {
        return [];
      }

      const prop = (mergedProps.value.prop || mergedProps.value.property) as string;
      const config = typeof editable === 'object' ? editable : {};
      const stopPropagation = config.stopPropagation !== false;

      return [
        <span
          class={bem.e('editable')}
          onClick={stopPropagation ? (event: MouseEvent) => event.stopPropagation() : undefined}
        >
          {h(Field as any, {
            type: config.type ?? 'input',
            componentProps: {
              ...config.props,
              modelValue: prop ? slotProps.row[prop] : undefined,
              'onUpdate:modelValue': (value: any) => {
                if (prop) {
                  slotProps.row[prop] = value;
                }

                config.onChange?.(value, slotProps.row, slotProps.$index);

                emit('cell-change', {
                  row: slotProps.row,
                  prop,
                  value,
                  index: slotProps.$index,
                });
              },
            },
          })}
        </span>,
      ];
    };

    const renderLabel = () => <span class={bem.e('label')}>{mergedProps.value.label}</span>;
    const renderTooltip = () => (
      <>
        <ElTooltip content={mergedProps.value.tooltip} placement="top">
          <Icon style={{ marginInlineStart: getCssVar('margin-xxs') }}>
            <RtiHelp />
          </Icon>
        </ElTooltip>
      </>
    );

    return () =>
      mergedProps.value.hidden ? null : (
        <ElTableColumn
          {...mergedProps.value}
          v-slots={{
            ...slots.value,
            header:
              slots.value.header && mergedProps.value.tooltip
                ? (...args: any[]) => {
                    return [slots.value.header!(...(args as [any])), renderTooltip()];
                  }
                : slots.value.header ||
                  (mergedProps.value.tooltip ? () => [renderLabel(), renderTooltip()] : undefined),
            default: (slotProps: any) =>
              mergedProps.value.columns
                ? mergedProps.value.columns.map((column) => <TableColumn {...column} />)
                : (renderEditable(slotProps) ??
                  renderActions.value?.(slotProps) ??
                  slots.value.default?.(slotProps)),
          }}
        />
      );
  },
});

export default TableColumn;
