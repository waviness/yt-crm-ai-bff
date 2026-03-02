/**
 * 基础信息
 */
export interface EntryObj {
  /** 页面类型: 1-逾期账款/长账龄, 2-应收账款 */
  active: string | number;
  /** tab类型: 0-逾期账款, 1-长账龄 */
  tabType: string | number;
  /** 部门 ID */
  deptId: number | string;
  /** 部门名称 */
  deptName: string;
  /** 日期 */
  date: string;
  /** 层级 */
  level: string | number;
}

/**
 * 筛选信息
 */
export interface FilterVal {
  keyword: string;
  orderType?: number | string;
  orderColumn?: string;
  orderField?: number | string;
  orderRule?: number | string;
  orderTypeText?: string;
}

/**
 * 统计数据
 */
export interface TotalVal {
  /** 逾期金额 */
  overdueAmount?: string;
  /** 总金额 */
  amount?: string;
  /** 本月应收金额 */
  thisAmount?: string;
  /** 同比 */
  periodComparePercent?: string;
  /** 环比 */
  monthComparePercent?: string;
}

/**
 * 列表项数据（部门维度）
 */
export interface OverdueItem {
  /** 部门ID */
  deptId: string | number;
  /** 部门名称 */
  deptName: string;
  /** 逾期金额 */
  overdueAmount?: string;
  /** 金额 */
  amount?: string;
  /** 本月金额 */
  thisAmount?: string;
  /** 百分比 */
  percent?: number;
  /** 原始值（用于计算） */
  _rawValue?: number;
  _rawValue2?: number;
}

/**
 * 详情列表项数据（客户/核算单元维度）
 */
export interface OverdueDetailItem {
  codId?: string | number;
  customId: string | number;
  customName: string;
  entryId?: string | number;
  entryName?: string;
  deptName?: string;
  deptId?: string | number;
  receivable?: string | number;
  receivable12year?: string | number;
  receivable23year?: string | number;
  receivable34year?: string | number;
  receivable45year?: string | number;
  receivable5year?: string | number;
  // 其他可能的字段
  saleId?: string | number;
  saleName?: string;
  overdueAmount?: string | number;
  advanceAmount?: string | number;
  thisReceivable?: string | number;
  cowId?: string | number;
  maxDay?: number;
}
