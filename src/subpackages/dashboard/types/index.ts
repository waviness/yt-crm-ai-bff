/**
 * 特殊部门 ID 常量
 */
export const SPECIAL_DEPT_IDS = {
  STRATEGIC_PURCHASING_INCLUDED: -999, // 含战略采购
  STRATEGIC_PURCHASING_EXCLUDED: -998, // 不含战略采购
  QT_GROUP: [469, 727, 731, 733, 760, 761], // QT 部门组
} as const;

/**
 * QT 部门组 ID 类型
 */
export type QtGroupId = (typeof SPECIAL_DEPT_IDS.QT_GROUP)[number];

/**
 * 部门基础信息
 */
export interface EntryObj {
  titleName?: string; // 头部的一个名称显示
  objName?: string; // 当日销售下的一个对象名称显示
  /** 部门 ID */
  deptId: number | string;
  /** 部门名称 */
  deptName: string;
  /** 部门级别 */
  deptLevel?: number | string;
  /** 父部门 ID */
  deptParentId?: number | string;
  /** 是否可下钻 */
  drillDownFlag?: boolean;
  customerId?: number | string;
  customerName?: string;
  userId?: number | string;
  userName?: string;
  goodsId?: number | string;
  goodsName?: string;
  brandId?: number | string;
  brandName?: string;
  businessForm?: string;
}
/**
 * 快速概览的请求参数
 */
export interface QuickOverviewParams {
  /** 日期时间，格式为 'YYYY-MM-DD' */
  date: string;
  /** 部门层级 */
  deptLevel: number | string;
  /** 部门 ID */
  deptId: number | string;
  /** 部门名称 */
  deptName: string;
  /** 是否可下钻 */
  drillDownFlag?: boolean;
}

/**
 * 快速概览的 API 原始数据
 */
export interface QuickOverviewApiRawData {
  /** 当日销售金额 */
  cdmoney: number;
  /** 当日销售金额 */
  currentDayMoney: number;
  /** 环比增幅 */
  cmcircleOnPercent: number;
  /** 本月累计销售金额 */
  currentMonthMoney: number;
  /** 月同比增长 */
  currentMonthOnPercent: number;
  /** 月净增 */
  currentMonthPeriodIncrease: number;
  /** 本年累计销售金额 */
  currentYearMoney: number;
  /** 年同比增长 */
  currentYearOnPercent: number;
  /** 年净增 */
  currentYearPeriodIncrease: number;
  /** 重点客户年同比 */
  imptCustomerYearOnPercent: number;
  /** 重点品种年同比 */
  imptGoodsYearOnPercent: number;
  /** 逾期账款 */
  overdueAmount: number;
  /** 应收账款 */
  receivable: number;
  /** 本月应收账款 */
  thisReceivable: number;
  /** 长账龄 */
  longAccounts: number;
  /** 年度预算 */
  revenueTargetAmount: number;
  /** 部门 ID */
  deptId: number | string;
  /** 是否可下钻 */
  drillDownFlag?: boolean;
  /** 子部门列表 */
  childDeptList?: QuickOverviewDepartmentTabItem[];
}

/**
 * 销售数据
 */
export interface QuickOverviewSalesData {
  /** 当前月销售金额 */
  cdmoney: string;
  /** 当前月环比增长百分比 */
  cmcircleOnPercent: string;
  /** 当前月销售金额 */
  cmmoney: string;
  /** 当前月同比增长百分比 */
  cmonPercent: string;
  /** 当前月环比增长金额 */
  cmperiodIncrease: string;
  /** 去年同期销售金额 */
  cymoney: string;
  /** 去年同期同比增长百分比 */
  cyonPercent: string;
  /** 去年同期环比增长金额 */
  cyperiodIncrease: string;
  /** 重点客户同比增长百分比 */
  imptCustomerYearOnPercent: string;
  /** 重点商品同比增长百分比 */
  imptGoodsYearOnPercent: string;
  /** 逾期金额 */
  overdueAmount: string;
  /** 应收金额 */
  receivable: string;
  /** 本期应收金额 */
  thisReceivable: string;
  /** 长账龄金额 */
  longAccounts: string;
  /** 年度营业额 */
  ndyy: string;
  targetCompletePercent?: string;
}

/**
 * 部门标签数据
 */
export interface QuickOverviewDepartmentTabItem extends EntryObj, QuickOverviewSalesData {
  /** 显示名称 */
  showName?: string;
  /** 是否显示标志 */
  isShowFlag?: boolean;
  /** 简短名称 */
  shortName?: string;
  targetCompletePercent?: string;
  hasClick?: boolean; // 新增属性，解决类型错误
}
/**
 * QT 部门数据
 */
export interface QtDepart {
  /** 标题 */
  title: string;
  /** 是否展开 */
  isExp?: boolean;
  /** 部门列表 */
  departList: QuickOverviewDepartmentTabItem[];
}

/** 销售数据的主体信息 (客户/品种/人员) */
export interface BaseSalesData {
  /** 当日销售额 (元) */
  currentDayMoney?: string;
  /** 当月销售额 (元) */
  currentMonthMoney?: string;
  /** 当年销售额 (元) */
  currentYearMoney?: string;
  /** 去年当月销售额 (元) */
  lyCurrentMonthMoney?: string;
  /** 去年当年销售额 (元) */
  lyCurrentYearMoney?: string;
  /** 当月同比增长率 (例如 0.7013 代表 70.13%) */
  monthPercentage?: string;
  /** 当年同比增长率 (例如 0.192 代表 19.2%) */
  yearPercentage?: string;
}

/** 销售数据的主体信息 (客户/品种/人员) */
export interface ShowSalesData {
  /** 当日销售额 (元) */
  todaySales?: string;
  /** 当月销售额 (元) */
  byxs?: string;
  /** 当年销售额 (元) */
  currentYearMoney?: string;
  /** 去年当月销售额 (元) */
  lyCurrentMonthMoney?: string;
  /** 去年当年销售额 (元) */
  lyCurrentYearMoney?: string;
  /** 当月同比增长率 (例如 0.7013 代表 70.13%) */
  monthPercentage?: string;
  /** 当年同比增长率 (例如 0.192 代表 19.2%) */
  yearPercentage?: string;
}

export interface CommonDataItem {
  id: string | number;
  name: string;
  todaySales: number | string;
  byxs: number | string;
  ytb: number | string;
  qnzy: number | string;
  bnlj: number | string;
  ntb: number | string;
  qnljy: number | string;
}

export interface CommonFilterParams {
  keyword: string;
  orderColumn: string;
  orderType: number; // 0: desc, 1: asc
  orderMethod?: number;
  orderRule?: number;
  currentPage: number;
  pageSize: number;
  total: number;
  loading: boolean;
  finish: boolean;
  filterIndex: number;
  selectType: number;
}

// 高级筛选
export interface StagingFilter {
  keyword: string;
  filterIndex: number;
  selectType: number;
  orderType: number;
}

export interface LoseTotalData {
  thirtyDaysAmount1st: number | string;
  thirtyDaysAmount2nd: number | string;
  thirtyDaysAmount3rd: number | string;
}
export interface LoseTableData {
  time: string;
  id: number;
  name: string;
  count1st: number | string;
  count2nd: number | string;
  count3rd: number | string;
}
