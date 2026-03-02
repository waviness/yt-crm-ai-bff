/**
 * 数值格式化类型枚举
 */
export enum NumberFormatType {
  /** 原始数值，仅添加千位分隔符 */
  RAW = 'RAW',
  /** 转换为百分比 */
  PERCENTAGE = 'PERCENTAGE',
  /** 智能转换为带单位的金额（元, 万元, 亿元） */
  CURRENCY = 'CURRENCY',
  /** 转换为万元 */
  TEN_THOUSAND_YUAN = 'TEN_THOUSAND_YUAN',
}

/**
 * 格式化选项接口
 */
export interface FormatterOptions {
  /** 格式化类型 */
  type: NumberFormatType;
  /** 保留小数位数 */
  digits?: number;
  /** 是否需要单位 (仅在 type 为 CURRENCY 时有效) */
  needUnit?: boolean;
  /** 无数据时的默认显示文本 */
  placeholder?: string;
  /** 千位分隔符，默认为 ',' */
  thousandSeparator?: string;
  /** 是否添加千位分隔符 (仅在 type 为 TEN_THOUSAND_YUAN 或 RAW 时有效) */
  useThousandSeparator?: boolean;
  showPercentage?: boolean; // 添加这个选项，用于控制是否显示百分号
  showPlusSign?: boolean; // 添加这个选项，用于控制是否显示“+”
}
