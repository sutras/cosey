import {
  Comment,
  Fragment,
  Text,
  computed,
  defineComponent,
  h,
  isVNode,
  ref,
  type CSSProperties,
  type VNode,
  type VNodeChild,
} from 'vue';
import {
  descriptionsEmits,
  descriptionsProps,
  descriptionsSlots,
  type DescriptionsBreakpoint,
  type DescriptionsColumn,
  type DescriptionsItemData,
} from './descriptions.api';
import DescriptionsItem from './descriptions-item';
import { Icon } from '../icon';
import { createBem } from '../../utils';
import { useResizeObserver } from '../../hooks';
import { ElTooltip } from 'element-plus';

const BREAKPOINTS: [DescriptionsBreakpoint, number][] = [
  ['xs', 0],
  ['sm', 576],
  ['md', 768],
  ['lg', 992],
  ['xl', 1200],
  ['xxl', 1600],
];

const DEFAULT_COLUMN: Record<DescriptionsBreakpoint, number> = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 3,
  xl: 3,
  xxl: 3,
};

const ITEM_NAME = 'CoDescriptionsItem';

interface InternalItem {
  key: PropertyKey;
  label?: VNodeChild;
  tooltip?: string;
  content?: VNodeChild;
  span: number;
  labelStyle?: CSSProperties;
  contentStyle?: CSSProperties;
  class?: any;
  style?: any;
}

const isFilled = (value: unknown) => value !== undefined && value !== null && value !== '';

const toSpan = (span: unknown) => {
  const value = Number(span);

  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
};

/**
 * 子项内容可能在 children 上（`<co-descriptions-item>值</...>`），
 * 也可能在默认插槽里，两种都摊平成 VNode 交给单元格渲染。
 */
const readChildren = (children: unknown): VNodeChild => {
  if (children === undefined || children === null) {
    return undefined;
  }

  if (typeof children === 'function') {
    return (children as () => VNodeChild)();
  }

  if (typeof children !== 'object') {
    return children as VNodeChild;
  }

  if (isVNode(children) || Array.isArray(children)) {
    return children as VNodeChild;
  }

  const defaultSlot = (children as Record<string, unknown>).default;

  return typeof defaultSlot === 'function' ? (defaultSlot as () => VNodeChild)() : undefined;
};

const collectChildren = (nodes: VNodeChild): InternalItem[] => {
  const items: InternalItem[] = [];

  const walk = (node: VNodeChild) => {
    if (node === undefined || node === null || typeof node === 'boolean') {
      return;
    }

    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    if (typeof node === 'string' || typeof node === 'number') {
      if (String(node).trim()) {
        items.push({ key: items.length, content: node, span: 1 });
      }

      return;
    }

    const vnode = node as VNode;

    if (vnode.type === Fragment) {
      walk(vnode.children as VNodeChild);
      return;
    }

    if (vnode.type === Comment) {
      return;
    }

    if (vnode.type === Text) {
      if (String(vnode.children ?? '').trim()) {
        items.push({ key: items.length, content: vnode, span: 1 });
      }

      return;
    }

    const isItem = vnode.type === DescriptionsItem || (vnode.type as any)?.name === ITEM_NAME;

    // 不是子项的节点（比如一段自定义结构）整体当作内容，不被拆解
    if (!isItem) {
      items.push({ key: vnode.key ?? items.length, content: vnode, span: 1 });
      return;
    }

    const itemProps = (vnode.props ?? {}) as Record<string, any>;

    items.push({
      key: vnode.key ?? items.length,
      label: itemProps.label,
      tooltip: itemProps.tooltip,
      content: readChildren(vnode.children),
      span: toSpan(itemProps.span),
      labelStyle: itemProps.labelStyle,
      contentStyle: itemProps.contentStyle,
      class: itemProps.class,
      style: itemProps.style,
    });
  };

  walk(nodes);

  return items;
};

const fromData = (data: DescriptionsItemData[]): InternalItem[] =>
  data.map((item, index) => ({
    key: item.key ?? index,
    label: item.label,
    tooltip: item.tooltip,
    content: item.content ?? item.children,
    span: toSpan(item.span),
    labelStyle: item.labelStyle,
    contentStyle: item.contentStyle,
    class: item.class,
    style: item.style,
  }));

/** 按列数把子项切成行；末行不满时把剩余列数并给最后一个子项 */
const buildRows = (items: InternalItem[], column: number) => {
  const rows: InternalItem[][] = [];
  let current: InternalItem[] = [];
  let count = 0;

  for (const item of items) {
    const rest = Math.max(column - count, 1);

    count += item.span;

    if (count >= column) {
      current.push(count > column ? { ...item, span: rest } : item);
      rows.push(current);
      current = [];
      count = 0;
      continue;
    }

    current.push(item);
  }

  if (current.length) {
    rows.push(current);
  }

  return rows.map((row) => {
    const total = row.reduce((sum, item) => sum + item.span, 0);

    if (total >= column) {
      return row;
    }

    const last = row[row.length - 1];

    return [...row.slice(0, -1), { ...last, span: last.span + column - total }];
  });
};

const resolveColumn = (definition: DescriptionsColumn | undefined, width: number) => {
  if (typeof definition === 'number') {
    return Math.max(1, Math.floor(definition));
  }

  const map = definition ?? DEFAULT_COLUMN;

  // 还没测到容器宽度（SSR / 首帧）时按中号屏处理，避免先闪一下单列
  if (!width) {
    return map.md ?? DEFAULT_COLUMN.md;
  }

  let column: number | undefined;

  for (const [breakpoint, minWidth] of BREAKPOINTS) {
    const value = map[breakpoint];

    if (width >= minWidth && value != null) {
      column = value;
    }
  }

  return Math.max(1, Math.floor(column ?? DEFAULT_COLUMN.md));
};

export default defineComponent({
  name: 'CoDescriptions',
  props: descriptionsProps,
  slots: descriptionsSlots,
  emits: descriptionsEmits,
  setup(props, { slots }) {
    const bem = createBem('descriptions');

    const rootRef = ref<HTMLElement>();

    /** 容器宽度：列数按它算，放进侧栏、弹窗、窄卡片都能自适应 */
    const containerWidth = ref(0);

    useResizeObserver(rootRef, ({ inlineSize }) => {
      containerWidth.value = inlineSize;
    });

    const size = computed(() => (props.size === 'middle' ? 'medium' : props.size));

    const items = computed(() =>
      props.items?.length ? fromData(props.items) : collectChildren(slots.default?.({})),
    );

    const rows = computed(() =>
      buildRows(items.value, resolveColumn(props.column, containerWidth.value)),
    );

    const hasTitle = computed(() => isFilled(props.title) || !!slots.title);

    const hasTooltip = computed(() => isFilled(props.tooltip));

    const showTitle = computed(() => hasTitle.value || hasTooltip.value);

    const hasExtra = computed(() => isFilled(props.extra) || !!slots.extra);

    const hasHeader = computed(() => showTitle.value || hasExtra.value);

    const labelCellStyle = (item: InternalItem) => ({
      ...props.labelStyle,
      ...item.labelStyle,
    });

    const contentCellStyle = (item: InternalItem) => ({
      ...props.contentStyle,
      ...item.contentStyle,
    });

    const renderTooltip = (content?: string) => {
      if (!isFilled(content)) {
        return null;
      }

      return h(
        ElTooltip,
        { content, placement: 'top' },
        { default: () => h(Icon, { class: bem.e('tooltip'), name: 'bi bi-info-circle' }) },
      );
    };

    const labelText = (item: InternalItem) =>
      h('span', { class: bem.e('item-label-text') }, [item.label, renderTooltip(item.tooltip)]);

    const labelSpan = (item: InternalItem) =>
      h(
        'span',
        {
          class: [bem.e('item-label'), bem.is('no-colon', !props.colon)],
          style: labelCellStyle(item),
        },
        [labelText(item)],
      );

    const contentSpan = (item: InternalItem) =>
      h('span', { class: bem.e('item-content'), style: contentCellStyle(item) }, [item.content]);

    /** 非边框：标签与内容在同一个单元格里横排 */
    const renderItemCell = (item: InternalItem) =>
      h('td', { class: [bem.e('item'), item.class], colspan: item.span, style: item.style }, [
        h('div', { class: bem.e('item-container') }, [
          isFilled(item.label) ? labelSpan(item) : null,
          contentSpan(item),
        ]),
      ]);

    /** 非边框 + 纵向：标签、内容各占一行，单元格里只放其中一个 */
    const renderStackCell = (item: InternalItem, kind: 'label' | 'content') =>
      h(
        kind === 'label' ? 'th' : 'td',
        { class: [bem.e('item'), item.class], colspan: item.span, style: item.style },
        [
          h('div', { class: bem.e('item-container') }, [
            kind === 'label' ? labelSpan(item) : contentSpan(item),
          ]),
        ],
      );

    /** 边框：标签一个 `th`、内容一个 `td`，样式挂在单元格上 */
    const renderBorderedCell = (item: InternalItem, kind: 'label' | 'content', span: number) => {
      const style = kind === 'label' ? labelCellStyle(item) : contentCellStyle(item);

      return h(
        kind === 'label' ? 'th' : 'td',
        {
          class: [bem.e(`item-${kind}`), item.class],
          colspan: span,
          style: { ...item.style, ...style },
        },
        kind === 'label' ? [labelText(item)] : [h('span', null, [item.content])],
      );
    };

    const renderRow = (row: InternalItem[], index: number) => {
      if (props.layout === 'vertical') {
        return [
          h(
            'tr',
            { key: `label-${index}`, class: bem.e('row') },
            row.map((item) =>
              props.bordered
                ? renderBorderedCell(item, 'label', item.span)
                : renderStackCell(item, 'label'),
            ),
          ),
          h(
            'tr',
            { key: `content-${index}`, class: bem.e('row') },
            row.map((item) =>
              props.bordered
                ? renderBorderedCell(item, 'content', item.span)
                : renderStackCell(item, 'content'),
            ),
          ),
        ];
      }

      return h(
        'tr',
        { key: index, class: bem.e('row') },
        props.bordered
          ? row.flatMap((item) => [
              renderBorderedCell(item, 'label', 1),
              renderBorderedCell(item, 'content', item.span * 2 - 1),
            ])
          : row.map((item) => renderItemCell(item)),
      );
    };

    return () => (
      <div
        ref={rootRef}
        class={[
          bem.b(),
          bem.m(size.value),
          bem.is('bordered', props.bordered),
          bem.is('vertical', props.layout === 'vertical'),
          bem.is(`label-${props.labelAlign}`, props.labelAlign !== 'left'),
        ]}
      >
        {hasHeader.value ? (
          <div class={bem.e('header')}>
            {showTitle.value ? (
              <div class={bem.e('title')}>
                {slots.title ? (
                  slots.title({})
                ) : (
                  <span class={bem.e('title-text')}>{props.title}</span>
                )}
                {hasTooltip.value ? renderTooltip(props.tooltip) : null}
              </div>
            ) : null}
            {hasExtra.value ? (
              <div class={bem.e('extra')}>{slots.extra ? slots.extra({}) : props.extra}</div>
            ) : null}
          </div>
        ) : null}

        <div class={bem.e('view')}>
          <table>
            <tbody>{rows.value.flatMap((row, index) => renderRow(row, index))}</tbody>
          </table>
        </div>
      </div>
    );
  },
});
