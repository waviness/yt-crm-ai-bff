/**
 * 客户单位相关常量定义
 */

// 婚姻状况选项
export const MARITAL_OPTIONS = [
  { value: 0, name: '未婚' },
  { value: 1, name: '已婚' },
] as const;

// 学历选项
export const EDUCATION_OPTIONS = [
  { value: 1, name: '本科' },
  { value: 2, name: '专科' },
  { value: 3, name: '中专' },
  { value: 4, name: '博士' },
  { value: 5, name: '硕士' },
  { value: 6, name: '高中及以下' },
] as const;

// 政治面貌选项
export const POLITICAL_OPTIONS = [
  { value: 0, name: '群众' },
  { value: 1, name: '党员' },
  { value: 2, name: '团员' },
  { value: 3, name: '少数党' },
] as const;

// 状态完整选项
export const STATUS_FULL_OPTIONS = [
  { value: 0, name: '正式' },
  { value: 2, name: '退休/离职' },
  { value: 3, name: '转职' },
  { value: 4, name: '由转职来' },
] as const;

// 药事会成员选项
export const MEDICAL_MEMBER_OPTIONS = [
  { value: 1, name: '是' },
  { value: 0, name: '否' },
] as const;

// 热力值选项
export const WARMTH_NUM_OPTIONS = [
  { value: 1, name: '一般客情' },
  { value: 2, name: '需要进阶的客情' },
  { value: 3, name: '从未接触的客情' },
] as const;
