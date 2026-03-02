/**
 * 资金系统相关类型定义
 */

// 基础数据类型
export interface BaseFundingData {
  cffId?: string | number;
  deptId?: string | number;
  deptName: string;
  creTime?: string;
  creId?: string;
  creName?: string;
}

// 资金填报数据
export interface FundingFormData extends BaseFundingData {
  isFill: boolean;
  addFlag: number;
  modifyFlag: number;
  xsAmount: number;
  dhAmount: number;
  chAmount: number;
  oldDhAmount?: number;
  oldChAmount?: number;
  reason?: string;
  total?: number;
}

// 资金报表数据
export interface FundingReportData extends BaseFundingData {
  actualityTotal: number;
  actualityDhAmount: number;
  actualityChAmount: number;
  finish: number;
  csfinish: number;
  total: number;
  dhAmount: number;
  chAmount: number;
  csAmount: number;
  xsAmount: number;
}

// 资金历史记录
export interface FundingHistoryData extends BaseFundingData {
  reason: string;
  oldDhAmount: number;
  oldChAmount: number;
  dhAmount: number;
  chAmount: number;
}

// 部门信息
export interface DepartmentInfo {
  id: string | number;
  deptName: string;
}

// 筛选条件
export interface FundingFilterData {
  deptId: string;
  deptName: string;
  year: string | number;
  month: string | number;
}

// 搜索参数
export interface FundingSearchParams {
  key: string;
  finishnum: number; // 0无排序 1降序 2升序
  csfinishnum: number;
}

// 统计数据
export interface FundingStatsData {
  statDate: string;
  totalAmount: number;
  dhAmount: number;
  ywPercent: number;
  csPercent: number;
  paymentAmount: number;
  chAmount: number;
}

// 状态类型枚举
export enum FundingStatusType {
  INITIAL = 1, // 初次填报
  SECOND = 2, // 再次上报
  REVISE = 3, // 修订上报
  DETAIL = 4, // 详情查看
}
