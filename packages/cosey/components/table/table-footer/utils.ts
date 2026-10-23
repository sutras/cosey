import { type TableColumnCtx } from 'element-plus/es/components/index.mjs';
import { type DefaultRow } from 'element-plus/es/components/table/src/table/defaults.mjs';
import { flatMap } from 'lodash-es';
import { unref } from 'vue';

function getColSpan<T extends DefaultRow>(colSpan: number, column: TableColumnCtx<T>) {
  return colSpan + column.colSpan;
}

function getCurrentColumns<T extends DefaultRow>(column: TableColumnCtx<T>): TableColumnCtx<T>[] {
  if (column.children) {
    return flatMap(column.children, getCurrentColumns);
  } else {
    return [column];
  }
}

export const isFixedColumn = <T extends DefaultRow>(
  index: number,
  fixed: string | boolean,
  store: any,
  realColumns?: TableColumnCtx<T>[],
) => {
  let start = 0;
  let after = index;
  const columns = unref(store.states.columns);
  if (realColumns) {
    // fixed column supported in grouped header
    const curColumns = getCurrentColumns(realColumns[index]);
    const preColumns = columns.slice(0, columns.indexOf(curColumns[0]));

    start = preColumns.reduce(getColSpan, 0);
    after = start + curColumns.reduce(getColSpan, 0) - 1;
  } else {
    start = index;
  }
  let fixedLayout;
  switch (fixed) {
    case 'left':
      if (after < unref(store.states.fixedLeafColumnsLength)) {
        fixedLayout = 'left';
      }
      break;
    case 'right':
      if (start >= columns.length - unref(store.states.rightFixedLeafColumnsLength)) {
        fixedLayout = 'right';
      }
      break;
    default:
      if (after < unref(store.states.fixedLeafColumnsLength)) {
        fixedLayout = 'left';
      } else if (start >= columns.length - unref(store.states.rightFixedLeafColumnsLength)) {
        fixedLayout = 'right';
      }
  }
  return fixedLayout
    ? {
        direction: fixedLayout,
        start,
        after,
      }
    : {};
};

export const getFixedColumnsClass = <T extends DefaultRow>(
  namespace: string,
  index: number,
  fixed: string | boolean,
  store: any,
  realColumns?: TableColumnCtx<T>[],
  offset = 0,
) => {
  const classes: string[] = [];
  const { direction, start, after } = isFixedColumn(index, fixed, store, realColumns);
  if (direction) {
    const isLeft = direction === 'left';
    classes.push(`${namespace}-fixed-column--${direction}`);
    if (isLeft && after! + offset === unref(store.states.fixedLeafColumnsLength) - 1) {
      classes.push('is-last-column');
    } else if (
      !isLeft &&
      start! - offset ===
        unref(store.states.columns).length - unref(store.states.rightFixedLeafColumnsLength)
    ) {
      classes.push('is-first-column');
    }
  }
  return classes;
};

function getOffset<T extends DefaultRow>(offset: number, column: TableColumnCtx<T>) {
  return (
    offset +
    (column.realWidth === null || Number.isNaN(column.realWidth!)
      ? Number(column.width!)
      : column.realWidth!)
  );
}

export const getFixedColumnOffset = <T extends DefaultRow>(
  index: number,
  fixed: string | boolean,
  store: any,
  realColumns?: TableColumnCtx<T>[],
) => {
  const { direction, start = 0, after = 0 } = isFixedColumn(index, fixed, store, realColumns);
  if (!direction) {
    return;
  }
  const styles: any = {};
  const isLeft = direction === 'left';
  const columns = unref(store.states.columns);
  if (isLeft) {
    styles.left = columns.slice(0, start).reduce(getOffset, 0);
  } else {
    styles.right = columns
      .slice(after + 1)
      .reverse()
      .reduce(getOffset, 0);
  }
  return styles;
};

export const ensurePosition = (style: any, key: string) => {
  if (!style) return;
  if (!Number.isNaN(style[key])) {
    style[key] = `${style[key]}px`;
  }
};

export function defaultSummaryMethod(
  columns: TableColumnCtx<DefaultRow>[],
  data: any[],
  sumText?: string,
  summaryProperties?: string[],
  transformSummary?: (sums: any[]) => any[],
) {
  const sums: any[] = [];
  // 首列可能是勾选 / 拖拽手柄这类没有 property 的系统列：合计文案要落在第一个真实数据列上，
  // 系统列自己留空，否则整行的合计会错位一格
  const labelIndex = columns.findIndex((column) => !!column.property);
  columns.forEach((column, index) => {
    if (index === labelIndex) {
      sums[index] = sumText;
      return;
    }
    if (!column.property) {
      sums[index] = '';
      return;
    }
    if (summaryProperties && !summaryProperties.includes(column.property)) {
      sums[index] = '';
      return;
    }
    const values = data.map((item) => Number(item[column.property]));
    const precisions: number[] = [];
    let notNumber = true;
    values.forEach((value) => {
      if (!Number.isNaN(+value)) {
        notNumber = false;
        const decimal = `${value}`.split('.')[1];
        precisions.push(decimal ? decimal.length : 0);
      }
    });
    const precision = Math.max.apply(null, precisions);
    if (!notNumber) {
      sums[index] = values.reduce((prev, curr) => {
        const value = Number(curr);
        if (!Number.isNaN(+value)) {
          return Number.parseFloat((prev + curr).toFixed(Math.min(precision, 20)));
        } else {
          return prev;
        }
      }, 0);
    } else {
      sums[index] = '';
    }
  });
  return transformSummary ? transformSummary(sums) : sums;
}
