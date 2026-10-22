import {
  formatToDate,
  formatToDateTime,
  toArray,
  isEmpty,
  isString,
  getVNodeText,
} from '../../../utils';
import {
  ElMessage,
  ElSwitch,
  ElTag,
  ElLink,
  type LinkProps,
  type SwitchProps,
  type TableColumnCtx,
} from 'element-plus';
import { get } from 'lodash-es';
import { type TableColumnProps } from './table-column.api';
import { type LongTextProps, LongText } from '../../long-text';
import { type MediaCardProps, MediaCard } from '../../media-card';
import { type MediaCardGroupProps, MediaCardGroup } from '../../media-card-group';
import { defineComponent, ref, watch } from 'vue';
import { type Translator } from '../../../hooks';

interface RendererOptions {
  cellValue: any;
  row: any;
  column: TableColumnCtx<any>;
  index: number;
}

export type RendererType =
  | 'text'
  | 'date'
  | 'datetime'
  | 'media'
  | {
      type: 'media';
      props?: MediaCardProps;
    }
  | 'mediagroup'
  | {
      type: 'mediagroup';
      props?: MediaCardGroupProps;
    }
  | 'tag'
  | {
      type: 'tag';
      path?: string | string[];
      props?: LongTextProps;
    }
  | 'longtext'
  | {
      type: 'longtext';
      props?: LongTextProps;
    }
  | 'switch'
  | {
      type: 'switch';
      props?: Partial<SwitchProps>;
      api?: (value: any, row: any) => Promise<any>;
    }
  | {
      type: 'click';
      props?: Partial<LinkProps>;
      format?: TableColumnProps['format'];
      onClick?: (params: {
        row: any;
        value: any;
        index: number;
        column: TableColumnCtx<any>;
      }) => void;
    };

type GetObjectRendererType<T extends RendererType> = T extends object
  ? T
  : { type: T } extends RendererType
    ? RendererType extends { type: T }
      ? RendererType
      : never
    : {
        type: T;
      };

export const mapRendererColumnProps: Record<string, TableColumnProps> = {
  media: {
    minWidth: 104,
    className: 'is-media',
  },
  mediagroup: {
    minWidth: 104,
    className: 'is-media',
  },
  tag: {
    className: 'is-tag',
  },
};

const AsyncSwitch = defineComponent({
  props: {
    value: [String, Number, Boolean],
    props: Object,
    api: Function,
    row: Object,
    t: Function,
  },
  setup(props) {
    const loading = ref(false);
    const value = ref(props.value);

    // 表格重新加载后行数据会换新，本地状态要跟上
    watch(
      () => props.value,
      (val) => {
        value.value = val;
      },
    );

    return () => (
      <ElSwitch
        {...props.props}
        model-value={value.value}
        loading={loading.value}
        validateEvent={false}
        onChange={async (val) => {
          if (loading.value) {
            return;
          }
          loading.value = true;

          try {
            await props.api?.(val, props.row);
            value.value = val;
            ElMessage.success(props.t?.('co.common.editSuccess'));
          } catch {
            void 0;
          } finally {
            loading.value = false;
          }
        }}
      />
    );
  },
});

/**
 * 可组合其他组件进行渲染
 */
export function renderer<T extends RendererType>(
  { cellValue, row, index, column }: RendererOptions,
  type: RendererType = 'text',
  t: Translator,
) {
  if (isEmpty(cellValue)) {
    return '';
  }

  const obj = (isString(type) ? { type } : type) as GetObjectRendererType<T>;

  switch (obj.type) {
    case 'text':
      return cellValue;
    case 'datetime':
      return formatToDateTime(cellValue);
    case 'date':
      return formatToDate(cellValue);
    case 'media':
      return cellValue ? <MediaCard src={cellValue} {...obj.props} /> : '';
    case 'mediagroup':
      return cellValue ? <MediaCardGroup srcset={cellValue} {...obj.props} /> : '';
    case 'tag': {
      const value = isEmpty(cellValue) ? [] : toArray(cellValue);

      return (
        <div
          style={{
            display: 'inline-flex',
            flexWrap: 'wrap',
            gap: '4px',
          }}
        >
          {value.map((item: any) => (
            <ElTag type="primary" size="small" {...obj.props}>
              {obj.path ? get(item, obj.path) : item}
            </ElTag>
          ))}
        </div>
      );
    }
    case 'longtext':
      return <LongText text={cellValue} {...obj.props} />;
    case 'switch': {
      return <AsyncSwitch value={cellValue} props={obj.props} api={obj.api} row={row} t={t} />;
    }
    case 'click':
      return (
        <ElLink
          type="primary"
          underline="never"
          style="font-weight: normal; word-break: break-all;"
          {...obj.props}
          onClick={() => obj.onClick?.({ row, value: cellValue, index, column })}
        >
          {obj.format ? obj.format(cellValue, row, column, index) : cellValue}
        </ElLink>
      );
  }
}

/**
 * 导出表格数据时使用的渲染器，只需要获取文本数据
 */
export function exportRenderer<T extends RendererType>(
  row: any,
  column: TableColumnProps,
  cellValue: any,
  index: number,
) {
  if (column.formatter) {
    return getVNodeText(column.formatter(row, column as TableColumnCtx<any>, cellValue, index));
  }

  if (column.format) {
    return getVNodeText(column.format(cellValue, row, column as TableColumnCtx<any>, index));
  }

  if (isEmpty(cellValue)) {
    return '';
  }

  const type = column.renderer || 'text';

  const obj = (isString(type) ? { type } : type) as GetObjectRendererType<T>;

  switch (obj.type) {
    case 'text':
    case 'media':
    case 'longtext':
    case 'switch':
    case 'click':
      return cellValue;
    case 'mediagroup':
      return JSON.stringify(cellValue);
    case 'datetime':
      return formatToDateTime(cellValue);
    case 'date':
      return formatToDate(cellValue);
    case 'tag': {
      const value = isEmpty(cellValue) ? [] : toArray(cellValue);

      return value.map((item: any) => (obj.path ? get(item, obj.path) : item)).join(', ');
    }
  }
}
