/**
 * 项目管理常量定义
 */

// 排序类型常量
export const SORT_TYPES = {
  NONE: 0,
  DESC: 1,
  ASC: 2,
} as const;

// 状态类型常量
export const STATUS_TYPES = {
  NONE: 0,
  IN_PROGRESS: 1,
  COMPLETED: 2,
  NOT_ATTENDED: 3,
} as const;

// 药事会类型常量
export const MEDIC_BOARD_TYPES = {
  NEW_DRUG: 1,
  NATIONAL_NEGOTIATION: 2,
  OTHER: 3,
} as const;

// 权限级别常量
export const LEADER_LEVELS = {
  SALESMAN: 0,
  COMPANY_MANAGER: 1,
  SUBSIDIARY_MANAGER: 2,
} as const;

// 列表类型常量
export const LIST_TYPES = {
  ORGANIZATION: 1,
  DEPARTMENT: 2,
  PERSONNEL: 3,
} as const;

// 项目类型常量
export const PROJECT_TYPES = {
  ACCESS: 1,
  DEEP_ANALYSIS: 2,
} as const;

// 类型标签常量
export const TYPE_VALUES = {
  SALES_PROGRESS: 1,
  COVERAGE: 2,
} as const;

// 状态文本映射
export const STATUS_TEXT_MAP = {
  [STATUS_TYPES.NONE]: '',
  [STATUS_TYPES.IN_PROGRESS]: '进行中',
  [STATUS_TYPES.COMPLETED]: '已完成',
  [STATUS_TYPES.NOT_ATTENDED]: '未上会',
} as const;

// 药事会类型文本映射
export const MEDIC_BOARD_TYPE_TEXT_MAP = {
  [MEDIC_BOARD_TYPES.NEW_DRUG]: '新药会',
  [MEDIC_BOARD_TYPES.NATIONAL_NEGOTIATION]: '国谈会',
  [MEDIC_BOARD_TYPES.OTHER]: '其他',
} as const;

// 权限级别文本映射
export const LEADER_LEVEL_TEXT_MAP = {
  [LEADER_LEVELS.SALESMAN]: '业务员',
  [LEADER_LEVELS.COMPANY_MANAGER]: '公司项目管理人员',
  [LEADER_LEVELS.SUBSIDIARY_MANAGER]: '子公司项目管理人员',
} as const;

// 列表类型文本映射
export const LIST_TYPE_TEXT_MAP = {
  [LIST_TYPES.ORGANIZATION]: '组织名称',
  [LIST_TYPES.DEPARTMENT]: '部门名称',
  [LIST_TYPES.PERSONNEL]: '业务员名称',
} as const;

// 项目类型文本映射
export const PROJECT_TYPE_TEXT_MAP = {
  [PROJECT_TYPES.ACCESS]: '准入管理',
  [PROJECT_TYPES.DEEP_ANALYSIS]: '深分进度',
} as const;

// 类型标签文本映射
export const TYPE_VALUE_TEXT_MAP = {
  [TYPE_VALUES.SALES_PROGRESS]: '销售进度',
  [TYPE_VALUES.COVERAGE]: '网点覆盖',
} as const;

// 状态颜色映射
export const STATUS_COLOR_MAP = {
  [STATUS_TYPES.NONE]: '#969799',
  [STATUS_TYPES.IN_PROGRESS]: '#ED7B2F',
  [STATUS_TYPES.COMPLETED]: '#00A870',
  [STATUS_TYPES.NOT_ATTENDED]: '#EE0A24',
} as const;

// 状态图标映射
export const STATUS_ICON_MAP = {
  [STATUS_TYPES.NONE]: 'circle',
  [STATUS_TYPES.IN_PROGRESS]: 'checked',
  [STATUS_TYPES.COMPLETED]: 'checked',
  [STATUS_TYPES.NOT_ATTENDED]: 'warning',
} as const;
