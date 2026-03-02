/**
 * VBP 相关常量定义
 */

import type { OptionItem } from '@/types/common';

// ==================== 业务选项常量 ====================

// 中选品种报量政策选项
export const QUANTITY_POLICY_OPTIONS = [
  { id: 1, name: '30%-50%' },
  { id: 2, name: '51%-70%' },
  { id: 3, name: '71%-90%' },
  { id: 4, name: '91%-100%' },
] as const satisfies readonly OptionItem[];

// VBP政策选项
export const VBP_POLICY_OPTIONS = [
  { id: 1, name: '按比例使用' },
  { id: 2, name: '一刀切，达量后放开' },
  { id: 3, name: '一刀切，达量后不放开' },
] as const satisfies readonly OptionItem[];

// VBP决策部门选项
export const VBP_DECISION_DEPT_OPTIONS = [
  { id: 1, name: '书记' },
  { id: 2, name: '分管院长' },
  { id: 3, name: '药剂科主任' },
  { id: 4, name: '药事会讨论' },
] as const satisfies readonly OptionItem[];

// 管理类型选项
export const MANAGEMENT_TYPE_OPTIONS = [
  { id: 1, name: '限门诊' },
  { id: 2, name: '限病区' },
  { id: 3, name: '限老干部特定人员使用' },
  { id: 4, name: '限主任处方' },
] as const satisfies readonly OptionItem[];

// 调整周期选项
export const ADJUSTMENT_CYCLE_OPTIONS = [
  { id: 1, name: '年度调整' },
  { id: 2, name: '季度调整' },
  { id: 3, name: '月度调整' },
] as const satisfies readonly OptionItem[];

// 品种政策选项
export const GOODS_POLICY_OPTIONS = [
  { id: 1, name: '限控' },
  { id: 2, name: '一刀切' },
  { id: 3, name: '中选和非中选共存' },
] as const satisfies readonly OptionItem[];
