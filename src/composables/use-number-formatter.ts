import { formatNumber } from '@/utils/number';
import type { FormatterOptions } from '@/types/formatters';
import { NumberFormatType } from '@/types/formatters';

/**
 * 数值格式化 Composable
 * @returns 提供了一系列预设好的格式化函数
 * formatCurrency 格式化为带单位的金额 (智能判断元/万元/亿元)
 * formatPercentage 格式化为百分比
 * formatTenThousand  格式化为万元，默认加千位分隔符
 * formatRaw 格式化原始数字，仅加千位分隔符
 */
export function useFormatter() {
  /**
   * 通用的格式化函数
   */
  const format = (value: number | string | null | undefined, options: FormatterOptions) => {
    return formatNumber(value, options);
  };

  /**
   * 格式化原始数字，仅加千位分隔符
   */
  const formatRaw = (
    value: number | string | null | undefined,
    options: {
      digits?: number;
      placeholder?: string;
    } = {}
  ) => {
    const { digits = 1, placeholder = '--' } = options;
    return formatNumber(value, { type: NumberFormatType.RAW, digits, placeholder });
  }; /**
   * 格式化为百分比
   */
  const formatPercentage = (
    value: number | string | null | undefined,
    options: {
      digits?: number; // 小数位数
      placeholder?: string; // 占位符
      showPercentage?: boolean; // 是否显示百分号 ，默认为 true
      showPlusSign?: boolean; // 是否显示正号，默认为 true
    } = {}
  ) => {
    const { digits = 1, placeholder = '--', showPercentage = true } = options;
    return formatNumber(value, {
      type: NumberFormatType.PERCENTAGE,
      digits,
      placeholder,
      showPercentage,
      showPlusSign: options.showPlusSign ?? true,
    });
  };
  /**
   * 格式化为带单位的金额 (智能判断元/万元/亿元)
   */
  const formatCurrency = (
    value: number | string | null | undefined,
    options: {
      digits?: number;
      placeholder?: string;
      needUnit?: boolean; // 是否需要单位，默认为 true
    } = {}
  ) => {
    const { digits = 1, placeholder = '--', needUnit = true } = options;
    return formatNumber(value, { type: NumberFormatType.CURRENCY, digits, placeholder, needUnit });
  };
  /**
   * 格式化为万元
   * @param value 数值
   * @param digits 小数位数
   * @param useSeparator 是否使用千位分隔符，默认为 true
   * @param placeholder 占位符
   */
  const formatTenThousand = (
    value: number | string | null | undefined,
    options: {
      digits?: number;
      useSeparator?: boolean;
      placeholder?: string;
      showPlusSign?: boolean; // 是否显示正号，默认为 true 是不加 和formatPercentage相反
    } = {}
  ) => {
    const { digits = 1, useSeparator = true, placeholder = '--', showPlusSign = true } = options;
    return formatNumber(value, {
      type: NumberFormatType.TEN_THOUSAND_YUAN,
      digits,
      placeholder,
      showPlusSign: showPlusSign ?? true,
      useThousandSeparator: useSeparator,
    });
  };
  return {
    format,
    formatCurrency,
    formatPercentage,
    formatTenThousand,
    formatRaw,
  };
}
