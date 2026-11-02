import {
  formatCurrency,
  formatToDate,
  formatToDateTime,
  toArray,
  isEmpty,
  isString,
  getVNodeText,
  type FormatCurrencyOptions,
} from '../../../utils';
import {
  ElMessage,
  ElSwitch,
  ElTag,
  ElLink,
  type LinkProps,
  type SwitchProps,
  type TableColumnCtx,
  type TagProps,
} from 'element-plus';
import { get } from 'lodash-es';
import { type TableColumnProps } from './table-column.api';
import { TypographyParagraph, type TypographyParagraphProps } from '../../typography';
import { type MediaCardProps, MediaCard } from '../../media-card';
import { type MediaCardGroupProps, MediaCardGroup } from '../../media-card-group';
import { defineComponent, ref, watch } from 'vue';
import { type Translator } from '../../../hooks';
import {
  isTruthy,
  resolveCellValue,
  resolveOption,
  type RendererBaseOptions,
  type RendererOption,
} from './renderer.resolve';

interface RendererOptions {
  cellValue: any;
  row: any;
  column: TableColumnCtx<any>;
  index: number;
}

/** 对象写法都带上通用选项（`empty` / `fallback`），字符串写法等价于不传 */
type RendererObject<T> = T & RendererBaseOptions;

export type RendererType =
  | 'text'
  /** 只想给 `empty` / `fallback` 时省略 `type`，按 `text` 处理 */
  | RendererObject<{ type?: undefined }>
  | RendererObject<{
      type: 'text';
    }>
  | 'date'
  | RendererObject<{
      type: 'date';
    }>
  | 'datetime'
  | RendererObject<{
      type: 'datetime';
    }>
  | 'usd'
  | RendererObject<{
      type: 'usd';
      /** 值本身是美元，带 `$` 显示 */
      props?: FormatCurrencyOptions;
    }>
  | 'cny'
  | RendererObject<{
      type: 'cny';
      /** 值本身是人民币元，带 `¥` 显示 */
      props?: FormatCurrencyOptions;
    }>
  | 'cent'
  | RendererObject<{
      type: 'cent';
      /** 值是美分，除以 100 后按美元显示 */
      props?: FormatCurrencyOptions;
    }>
  | 'media'
  | RendererObject<{
      type: 'media';
      props?: MediaCardProps;
    }>
  | 'mediagroup'
  | RendererObject<{
      type: 'mediagroup';
      props?: MediaCardGroupProps;
    }>
  | 'tag'
  | RendererObject<{
      type: 'tag';
      /** 每一项是对象时，从里面取哪个字段当文案 */
      path?: string | string[];
      /** 值 → 文案 + 颜色。命中就用 `label` / `tag`，没命中回落原值 */
      options?: readonly RendererOption[];
      props?: Partial<TagProps>;
    }>
  | 'longtext'
  | RendererObject<{
      type: 'longtext';
      props?: Partial<TypographyParagraphProps>;
    }>
  | 'switch'
  | RendererObject<{
      type: 'switch';
      props?: Partial<SwitchProps>;
      api?: (value: any, row: any) => Promise<any>;
    }>
  | 'boolean'
  | RendererObject<{
      type: 'boolean';
      /** 真值文案，默认「是」 */
      trueText?: string;
      /** 假值文案，默认「否」 */
      falseText?: string;
      /** 传了才渲染成标签，不传是纯文字 */
      trueTag?: TagProps['type'];
      falseTag?: TagProps['type'];
    }>
  | RendererObject<{
      type: 'click';
      props?: Partial<LinkProps>;
      format?: TableColumnProps['format'];
      onClick?: (params: {
        row: any;
        value: any;
        index: number;
        column: TableColumnCtx<any>;
      }) => void;
    }>;

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

/** 各币种默认用母语的格式：人民币 `¥1,280.00`、美元 `$1,280.00` */
const CURRENCY_LOCALES = { CNY: 'zh-CN', USD: 'en-US' };

/**
 * 金额：非数字原样吐出，别把 `NaN` 渲染给用户。
 *
 * 千分位和币种符号都交给 `Intl`，和 `co-number-format` 用同一套规则。
 */
function toCurrency(value: any, currency: 'CNY' | 'USD', options?: FormatCurrencyOptions) {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return value;
  }

  return formatCurrency(amount, currency, { locale: CURRENCY_LOCALES[currency], ...options });
}

/**
 * `boolean` 的默认文案：走 `co.common.yes` / `co.common.no`，传了 `trueText` / `falseText` 就以传入的为准。
 *
 * `exportRenderer` 的 `t` 是可选的（Excel 导出链路上可能没有 locale 上下文），所以这里兜底到中文。
 */
function booleanText(
  obj: { trueText?: string; falseText?: string },
  truthy: boolean,
  t?: Translator,
) {
  return truthy
    ? (obj.trueText ?? t?.('co.common.yes') ?? '是')
    : (obj.falseText ?? t?.('co.common.no') ?? '否');
}

/**
 * 可组合其他组件进行渲染
 */
export function renderer<T extends RendererType>(
  { cellValue, row, index, column }: RendererOptions,
  type: RendererType = 'text',
  t: Translator,
) {
  // 对象写法省了 `type` 时按 text 处理，否则 `switch` 没有分支命中、单元格会一片空白
  const obj = (isString(type) ? { type } : { type: 'text', ...type }) as GetObjectRendererType<T> &
    RendererBaseOptions;

  // 取值与占位是所有 renderer 的公共前置：`fallback` 只在 cellValue 空时才用
  const value = resolveCellValue(row, cellValue, obj);

  if (isEmpty(value)) {
    return obj.empty ?? '';
  }

  switch (obj.type) {
    case 'text':
      return value;
    case 'datetime':
      return formatToDateTime(value);
    case 'date':
      return formatToDate(value);
    case 'usd':
      return toCurrency(value, 'USD', obj.props);
    case 'cny':
      return toCurrency(value, 'CNY', obj.props);
    case 'cent':
      return toCurrency(Number(value) / 100, 'USD', obj.props);
    case 'media':
      return value ? <MediaCard src={value} {...obj.props} /> : '';
    case 'mediagroup':
      return value ? <MediaCardGroup srcset={value} {...obj.props} /> : '';
    case 'tag': {
      const items = toArray(value);

      return (
        <div
          style={{
            display: 'inline-flex',
            flexWrap: 'wrap',
            gap: '4px',
          }}
        >
          {items.map((item: any) => {
            const option = resolveOption(obj.options, item);

            return (
              <ElTag type={option?.tag ?? 'primary'} size="small" {...obj.props}>
                {option?.label ?? (obj.path ? get(item, obj.path) : item)}
              </ElTag>
            );
          })}
        </div>
      );
    }
    case 'boolean': {
      const truthy = isTruthy(value);
      const text = booleanText(obj, truthy, t);
      const tag = truthy ? obj.trueTag : obj.falseTag;

      return tag ? (
        <ElTag type={tag} size="small">
          {text}
        </ElTag>
      ) : (
        text
      );
    }
    case 'longtext':
      // 默认 3 行 + 可展开：单元格里没有 tooltip，得留个看全文的出口
      return (
        <TypographyParagraph text={value} ellipsis={{ rows: 3, expandable: true }} {...obj.props} />
      );
    case 'switch': {
      return <AsyncSwitch value={value} props={obj.props} api={obj.api} row={row} t={t} />;
    }
    case 'click':
      return (
        <ElLink
          type="primary"
          underline="never"
          style="font-weight: normal; word-break: break-all;"
          {...obj.props}
          onClick={() => obj.onClick?.({ row, value, index, column })}
        >
          {obj.format ? obj.format(value, row, column, index) : value}
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
  t?: Translator,
) {
  if (column.formatter) {
    return getVNodeText(column.formatter(row, column as TableColumnCtx<any>, cellValue, index));
  }

  if (column.format) {
    return getVNodeText(column.format(cellValue, row, column as TableColumnCtx<any>, index));
  }

  const type = column.renderer || 'text';

  // 对象写法省了 `type` 时按 text 处理，否则 `switch` 没有分支命中、单元格会一片空白
  const obj = (isString(type) ? { type } : { type: 'text', ...type }) as GetObjectRendererType<T> &
    RendererBaseOptions;

  // 与 `renderer` 用同一套取值规则，否则导出的值和屏幕上的对不上
  const value = resolveCellValue(row, cellValue, obj);

  if (isEmpty(value)) {
    return obj.empty ?? '';
  }

  switch (obj.type) {
    case 'text':
    case 'media':
    case 'longtext':
    case 'switch':
    case 'click':
      return value;
    case 'mediagroup':
      return JSON.stringify(value);
    case 'datetime':
      return formatToDateTime(value);
    case 'date':
      return formatToDate(value);
    case 'usd':
      return toCurrency(value, 'USD', obj.props);
    case 'cny':
      return toCurrency(value, 'CNY', obj.props);
    case 'cent':
      return toCurrency(Number(value) / 100, 'USD', obj.props);
    case 'tag': {
      return toArray(value)
        .map(
          (item: any) =>
            resolveOption(obj.options, item)?.label ?? (obj.path ? get(item, obj.path) : item),
        )
        .join(', ');
    }
    case 'boolean':
      return booleanText(obj, isTruthy(value), t);
  }
}
