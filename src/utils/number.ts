/**
 * 数值处理工具函数
 */
import Decimal from 'decimal.js';
import type { FormatterOptions } from '@/types/formatters';
import { NumberFormatType } from '@/types/formatters';

/**
 * 格式化数值显示
 * @param value 数值
 * @param unit 单位，默认为'万元'
 * @param precision 精度，默认为2位小数
 * @returns 格式化后的字符串
 */
export const formatValue = (
  value: number | null | undefined,
  unit = '万元',
  precision = 2
): string => {
  if (value === null || value === undefined) return '-';
  return `${Number(value).toFixed(precision)}${unit}`;
};

/**
 * 格式化百分比显示
 * @param value 数值
 * @param precision 精度，默认为2位小数
 * @returns 格式化后的百分比字符串
 */
export const formatPercent = (value: number | null | undefined, precision = 2): string => {
  if (value === null || value === undefined) return '-';
  return `${Number(value).toFixed(precision)}%`;
};

/**
 * 计算总金额
 * @param amount1 第一个金额
 * @param amount2 第二个金额
 * @param precision 精度，默认为6位小数
 * @returns 总金额
 */
export const calculateTotal = (
  amount1: number | string,
  amount2: number | string,
  precision = 6
): number => {
  const num1 = Number(amount1) || 0;
  const num2 = Number(amount2) || 0;
  return Number((num1 + num2).toFixed(precision));
};

/**
 * 计算完成率
 * @param actual 实际值
 * @param target 目标值
 * @param precision 精度，默认为2位小数
 * @returns 完成率百分比
 */
export const calculateCompletionRate = (actual: number, target: number, precision = 2): number => {
  if (!actual || !target) return 0;
  return Number(((actual / target) * 100).toFixed(precision));
};

/**
 * 根据数值获取对应的颜色类名
 * @param value 要判断的值，可以是字符串、数字或undefined
 * @returns 返回对应的颜色类名
 */
export const getColorClass = (value: string | number | undefined): string => {
  // 处理无效值
  if (value === '--' || value === undefined || value === null) {
    return 'color-default';
  }
  // 处理字符串值，去除可能的百分号
  let processedValue = value;
  if (typeof value === 'string') {
    // 去除末尾的百分号和数字分隔符
    processedValue = value.replace(/%$/, '').replace(/,/g, '');
    // 去除可能的加号
    processedValue = processedValue.replace(/^\+/, '');
  }
  // 转换为数字
  const numValue = Number(processedValue);
  // 处理 NaN 情况
  if (isNaN(numValue)) {
    return 'color-default';
  }

  // 根据数值返回对应的颜色类
  return numValue >= 0 ? 'color-success' : 'color-danger';
};

// 默认选项
const DEFAULT_OPTIONS: Required<FormatterOptions> = {
  type: NumberFormatType.RAW,
  digits: 2,
  needUnit: true,
  placeholder: '--',
  thousandSeparator: ',',
  useThousandSeparator: true, // 默认添加千位分隔符
  showPercentage: true, // 默认显示百分比
  showPlusSign: true, // 默认显示 "+"
};

/**
 * 核心格式化函数
 * @param value 要格式化的数值
 * @param options 格式化选项
 * @returns 格式化后的字符串
 */
export function formatNumber(
  value: number | string | null | undefined,
  options: FormatterOptions
): string {
  // 处理 null, undefined, 空字符串等无效输入
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return options.placeholder || DEFAULT_OPTIONS.placeholder;
  }

  // 合并用户选项和默认选项
  const finalOptions = { ...DEFAULT_OPTIONS, ...options };
  const { type, digits, thousandSeparator, useThousandSeparator, showPercentage, showPlusSign } =
    finalOptions;

  // 使用 Decimal.js 进行精确计算，避免浮点数精度问题
  const toDecimal = (n: number) => new Decimal(n);

  let result: string;
  switch (type) {
    case NumberFormatType.RAW: // 原始值，仅添加千位分隔符
      result = toDecimal(numValue).toFixed(digits);
      break;

    case NumberFormatType.PERCENTAGE: // 百分比，默认显示百分号
      const percentValue = toDecimal(numValue).times(100);
      result = percentValue.toFixed(digits);
      // 根据选项决定是否添加百分号
      if (showPercentage) {
        result = `${result}%`;
      }
      result = `${showPlusSign && numValue >= 0 ? '+' : ''}${result}`;
      break;

    case NumberFormatType.CURRENCY: // 智能转换为带单位的金额（元, 万元, 亿元）
      // CURRENCY 类型内部有自己的逻辑，我们暂时不动它
      return formatWithUnit(numValue, digits, finalOptions.needUnit, thousandSeparator);

    case NumberFormatType.TEN_THOUSAND_YUAN: // 转换为万元
      const inTenThousand = toDecimal(numValue).div(10000);
      result = inTenThousand.toFixed(digits);
      /**
       * 因为大多数转换成万元都是不需要加上+  所有默认不加 复用参数 相加 传showPlusSign: false即可
       * 使用案例
       * formatTenThousand(response.data.yearNetIncrease, {
       *  showPlusSign: false,
       * })
       * */
      result = `${!showPlusSign && numValue >= 0 ? '+' : ''}${result}`;
      break;

    default: // 其他类型，抛出错误
      const _exhaustiveCheck: never = type;
      return _exhaustiveCheck;
  }

  // 根据 useThousandSeparator 选项决定是否添加千位分隔符
  if (useThousandSeparator) {
    result = result.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
  }

  return result;
}

/**
 * 智能添加单位（元, 万元, 亿元）
 */
export function formatWithUnit(
  value: number,
  digits: number,
  needUnit: boolean,
  separator: string
): string {
  const absValue = Math.abs(value);
  let formattedValue: string;
  let unit: string;

  if (absValue >= 1e8) {
    // 亿
    formattedValue = new Decimal(value).div(1e8).toFixed(digits);
    unit = '亿元';
  } else if (absValue >= 1e4) {
    // 万
    formattedValue = new Decimal(value).div(1e4).toFixed(digits);
    unit = '万元';
  } else {
    formattedValue = new Decimal(value).toFixed(digits);
    unit = '元';
  }

  formattedValue = formattedValue.replace(/\B(?=(\d{3})+(?!\d))/g, separator);

  return needUnit ? `${formattedValue}${unit}` : formattedValue;
}

/**
 * 加减乘除工具函数
 */
export const arithmetic = {
  /**
   * 加法
   * @param a 被加数
   * @param b 加数
   * @returns 结果
   */
  add(a: number | string, b: number | string): number {
    return new Decimal(a).plus(b).toNumber();
  },

  /**
   * 减法
   * @param a 被减数
   * @param b 减数
   * @returns 结果
   */
  subtract(a: number | string, b: number | string): number {
    return new Decimal(a).minus(b).toNumber();
  },

  /**
   * 乘法
   * @param a 被乘数
   * @param b 乘数
   * @returns 结果
   */
  multiply(a: number | string, b: number | string): number {
    return new Decimal(a).times(b).toNumber();
  },

  /**
   * 除法
   * @param a 被除数
   * @param b 除数
   * @returns 结果
   */
  divide(a: number | string, b: number | string): number | string {
    const numB = Number(b);
    if (numB === 0) {
      return '--'; // 避免除以 0 的错误
    }
    return new Decimal(a).div(b).toNumber();
  },

  /**
   * 求和
   * @param numbers 数值数组
   * @returns 总和
   */
  sum(numbers: (number | string)[]): number {
    let sum = new Decimal(0);
    numbers.forEach(num => {
      const converted = Number(num);
      if (isNaN(converted) || !isFinite(converted)) {
        throw new Error(`Invalid number value: ${num}`);
      }
      sum = sum.plus(converted);
    });
    return sum.toNumber();
  },
};
