/**
 * 应收管理相关类型定义
 */

// 应收管理标签页类型
export type ReceivableTabType = 0 | 1 | 2; // 0-预收预警, 1-逾期预警, 2-逾期原因填报

// 应收管理数据类型
export type ReceivableDataType = 1 | 2 | 3 | 4; // 1-逾期且预收超期未处理, 2-逾期且有预收未处理, 3-有预收未处理, 4-其他

// 预收预警信息
export interface AdvanceWarningInfo {
  id: string;
  customId: string;
  customName: string;
  entryId: string;
  saleId: string;
  saleName: string;
  type: ReceivableDataType;
  overdueAmount: number;
  unMixedMoney: number;
  maxDay: number;
  accountList?: AccountInfo[];
  remark?: string;
  remarkList?: RemarkInfo[];
}

// 逾期预警信息
export interface OverdueWarningInfo {
  id: string;
  customId: string;
  customName: string;
  entryId: string;
  saleId: string;
  saleName: string;
  type: ReceivableDataType;
  receivable: number;
  overdueAmount: number;
  overdueDay: number;
  advanceAmount?: number; // 预收未处理
  creditAmount?: number; // 剩余信额
  creditStatus?: number; // 信保状态 0-A, 1-B, 2-C, 3-D, 4-E
  accountList?: AccountInfo[];
  remark?: string;
  remarkList?: RemarkInfo[];
}

// 逾期数据信息
export interface OverdueDataInfo {
  id: string;
  customId: string;
  customName: string;
  entryId: string;
  saleId: string;
  saleName: string;
  type: ReceivableDataType;
  receivable?: number;
  overdueAmount: number;
  overdueDay?: number;
  maxDay?: number; // 最长逾期天数
  advanceAmount?: number; // 预收未处理
  creditAmount?: number; // 剩余信额
  creditStatus?: number; // 信保状态 0-A, 1-B, 2-C, 3-D, 4-E
  creditDays?: number; // 信用天数
  reason?: string;
  reasonList?: ReasonInfo[];
}

// 账户信息
export interface AccountInfo {
  id: string;
  paymentDate?: string;
  amount: number;
  unMixedMoney?: number;
  remark?: string;
}

// 反馈信息
export interface RemarkInfo {
  id: string;
  content: string;
  createTime: string;
  createUser: string;
}

// 原因信息
export interface ReasonInfo {
  id: string;
  name: string;
  code: string;
}

// 查询参数
export interface ReceivableQueryParams {
  keywords?: string;
  active: ReceivableTabType;
  page: number;
  pageSize: number;
}

// 详情查询参数
export interface ReceivableDetailParams {
  id: string;
  active: ReceivableTabType;
}

// 反馈参数
export interface ReceivableRemarkParams {
  id: string;
  content: string;
  active: ReceivableTabType;
}

// 原因参数
export interface ReceivableReasonParams {
  id: string;
  reasonId: string;
  active: ReceivableTabType;
}

// 统计信息
export interface ReceivableCountInfo {
  ingCount: number; // 预收预警进行中数量
  taskNum: number; // 逾期预警进行中数量
}
