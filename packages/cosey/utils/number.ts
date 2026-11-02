/**
 * 限定数值范围
 */
export function minmax(n: number, min: number, max: number): number {
  return n < min ? min : n > max ? max : n;
}

export interface FormatCurrencyOptions {
  /** 小数位数，默认 2 */
  precision?: number;
  /** 币种符号的语言，默认 `zh-CN`：人民币是 `¥`，美元是 `US$` */
  locale?: string;
}

/**
 * `Intl.NumberFormat` 的构造比复用贵得多（实测单次约 20µs vs 0.3µs），
 * 而表格一次渲染就是几十个单元格，所以按参数缓存实例 —— Intl 实例不可变，共享是安全的。
 */
const currencyFormatters = new Map<string, Intl.NumberFormat>();

/**
 * 实际只会用到「几个币种 × 几个精度 × 一两种语言」。
 * 超过这个数说明调用方在传各种 `locale` 试参数，那就别让 key 空间无限膨胀。
 */
const CURRENCY_FORMATTER_LIMIT = 16;

function getCurrencyFormatter(
  currency: string,
  precision: number,
  locale: string,
): Intl.NumberFormat {
  const key = `${locale}|${currency}|${precision}`;
  const cached = currencyFormatters.get(key);

  if (cached) {
    return cached;
  }

  if (currencyFormatters.size >= CURRENCY_FORMATTER_LIMIT) {
    currencyFormatters.clear();
  }

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });

  currencyFormatters.set(key, formatter);

  return formatter;
}

/**
 * 金额格式化：带币种符号 + 千分位，固定小数位。
 *
 * ```ts
 * formatCurrency(1280, 'CNY'); // ¥1,280.00
 * formatCurrency(99.5, 'USD'); // US$99.50
 * ```
 */
export function formatCurrency(
  value: number,
  currency: 'CNY' | 'USD' | (string & {}),
  { precision = 2, locale = 'zh-CN' }: FormatCurrencyOptions = {},
) {
  return getCurrencyFormatter(currency, precision, locale).format(value);
}
