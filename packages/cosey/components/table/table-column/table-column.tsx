import { computed, defineComponent } from 'vue';
import { type TableColumnProps, type TableColumnSlots, tableColumnProps } from './table-column.api';
import { isFunction, isPlainObject, isString, createBem } from '../../../utils';
import { mapRendererColumnProps, renderer } from './renderer';
import { ElTableColumn, ElTooltip } from 'element-plus';
import classNames from 'classnames';

import { useLocale } from '../../../hooks';
import { Icon } from '../../icon';
import { getCssVar } from '../../../utils';

const TableColumn = defineComponent({
  // 使用和ep一样的组件名
  // 是为了在多级表头中瞒骗ep以便和其他 ElTableColumn 一样添加到其子组件列表
  name: 'ElTableColumn',
  inheritAttrs: false,

  props: tableColumnProps,

  setup(props: TableColumnProps) {
    const bem = createBem('table-column');

    const { t } = useLocale();

    const mergedProps = computed<TableColumnProps>(() => {
      const obj: TableColumnProps = {};
      const cls = [props.className, bem.b()];

      for (const [key, value] of Object.entries(props)) {
        if (value !== undefined) {
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

    const renderLabel = () => <span class={bem.e('label')}>{mergedProps.value.label}</span>;

    const renderTooltip = () => (
      <>
        <ElTooltip content={mergedProps.value.tooltip} placement="top">
          <Icon name="co:help" style={{ marginInlineStart: getCssVar('margin-xxs') }} />
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
                : slots.value.default?.(slotProps),
          }}
        />
      );
  },
});

export default TableColumn;
