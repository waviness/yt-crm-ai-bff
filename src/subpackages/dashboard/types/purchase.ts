/**
 * 采购相关类型定义
 */

// 入口对象参数
export interface PurchaseEntryObj {
  deptId: string;
  deptName: string;
  titleName?: string;
  deptLevel?: string;
  userId?: string;
  userName?: string;
}

// 采购数据对象
export interface PurchaseDataObj {
  yearRevenue: string | number; // 年营收实绩
  yearRevenueOnPercent: string | number; // 年同比
  monthRevenue?: string | number; // 月营收实绩
  monthRevenueOnPercent?: string | number; // 月同比
  zcAmount: string | number; // 战略采购金额
  zcPercent: string | number; // 战略采购同比
  zcProgress: string | number; // 战略采购进度
  fzcAmount: string | number; // 非战略采购金额
  fzcPercent: string | number; // 非战略采购同比
  fzcProgress: string | number; // 非战略采购进度
  yearInSaleGoodsNum: string | number; // 在销品规数
  yearInSaleGoodsNumOnPercent: string | number; // 在销品规数同比
  targetCompletePercent: string | number; // 预算完成进度
  targetGoalDiff: string | number; // 目标差距
}

// 子对象统计列表项
export interface SonObjectStatItem {
  generalObjectId: string | number;
  generalObjectName: string;
  yearRevenue: string | number;
  yearRevenueOnPercent: string | number;
  zcAmount: string | number;
  zcPercent: string | number;
  zcProgress: string | number;
  fzcAmount: string | number;
  fzcPercent: string | number;
  fzcProgress: string | number;
  underLyingGoodsNum?: string | number; // 分管品规数
  yearInSaleGoodsNum: string | number;
  yearInSaleGoodsNumOnPercent: string | number;
}

// 货品满足率数据
export interface GoodsSatisfactionData {
  monthGoodsFillRate: string | number; // 本月货品满足率
  monthGoodsFillRateNetIncrease: string | number; // 本月净增
  yearGoodsFillRate: string | number; // 本年货品满足率
  yearGoodsFillRateNetIncrease: string | number; // 本年净增
  targetFillRateDiff: string | number; // 较指标差距
}

// KA供应商数据
export interface KaPurveyorData {
  monthSalesAmount: string | number; // 本月无税收入
  monthOnPercent: string | number; // 本月同比
  yearSalesAmount: string | number; // 本年无税收入
  yearOnPercent: string | number; // 本年同比
  sharePercent: string | number; // 销售占比
  sharePercentNetIncrease: string | number; // 占比净增
}

// 锁控数据
export interface SaleLockData {
  lockGoodsNum: string | number; // 触发锁控品种数
  saleLockNum: string | number; // 触发锁控笔数
  averageUnlockCost: string | number; // 平均锁控时效
  unlockOrderNum: string | number; // 未解锁订单数量
}

// 库存周转数据
export interface TurnoverData {
  monthTurnoverDays: string | number; // 本月库存周转天数
  monthTurnoverDaysNetDiff: string | number; // 本月净差
  yearTurnoverDays: string | number; // 本年库存周转天数
  yearTurnoverDaysNetDiff: string | number; // 本年净差
  targetDiffPercent: string | number; // 较指标差距百分比
}

// 部门权限数据
export interface AuthDeptSales {
  deptId: string | number;
  deptName: string;
  authFlag: boolean;
  sonDeptSalesDTOList: AuthDeptSales[];
  isExpanded?: boolean;
}

// API 请求参数
export interface GeneralStatParams {
  objectId?: string | number;
  selectDate: string;
  objectType: number; // 1: 部门, 2: 个人
  type: number; // 1: 年, 2: 月
}

export interface CommonApiParams {
  deptId?: string | number;
  selectDate: string;
}

// 采购员详情数据 (个人维度)
export interface PurchaseManDataObj {
  yearRevenue: string | number;
  yearRevenueOnPercent: string | number;
  yearInSaleGoodsNum: string | number;
  targetCompletePercent: string | number;
  targetGoalDiff?: string | number;
}
