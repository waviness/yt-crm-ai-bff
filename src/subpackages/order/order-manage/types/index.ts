/**
 * 订单管理相关类型定义
 */

// 筛选条件
export interface OrderFilterData {
  goodsId: string;
  goodsName: string;
  customerId: string;
  customerName: string;
  entryKeyword?: string;
  time?: string;
}

// 排序参数
export interface OrderSortParams {
  orderAmountSort: number | null;
  orderCountSort: number | null;
  orderSortType: number;
  orderText: string;
}

// 排序选项
export interface SortColumn {
  values: string[];
  defaultIndex: number;
}

// 客户订单信息
export interface CustomerOrderInfo {
  customerId: string;
  customerName: string;
  orderCount: number;
  orderAmount: number;
  unFinishedOrderCount: number;
  unFinishedOrderAmount: number;
  [key: string]: any;
}

// 订单列表查询参数
export interface OrderListParams {
  customerName?: string;
  entryKeyword?: string;
  goodsId?: string;
  goodsName?: string;
  customerId?: string;
  orderType: number; // 0-当日订单, 1-历史订单, 2-可激活订单
  selectType: number; // 0-与我相关, 3-全部
  startTime?: string;
  endTime?: string;
  orderAmountSort?: number | null;
  orderCountSort?: number | null;
  orderSortType: number;
  pageNum: number;
  pageSize: number;
}

// 时间类型
export type TimeType = 0 | 1 | 2 | 3 | 4; // 0-未选择, 1-三日内, 2-五日内, 3-七日内, 4-自定义

// 标签页类型
export type TabType = 0 | 1 | 2; // 0-当日订单, 1-历史订单, 2-可激活订单

// 订单列表筛选条件
export interface OrderListFilterData {
  goodsId: string;
  goodsName: string;
  time: string;
  conType: string | null;
  userNames: string;
  entryId: string;
  entryName: string;
  subArriveType: string;
  subArriveName: string;
  contactIdList: string[];
  contactString: string;
  entryKeyword?: string;
}

// 订单详情信息
export interface OrderDetailInfo {
  condtlId: string;
  goodsId: string;
  goodsName: string;
  goodsType: string;
  entryId: string;
  entryName: string;
  contactId?: string;
  contactName?: string;
  purchaserId?: string;
  purchaserName?: string;
  supplyerName?: string;
  goodsQty: number;
  accstQty?: number;
  credate: string;
  docMemo?: string;
  zxErrormsg?: string;
  goodsReminder?: boolean;
  ticketReminder?: boolean;
  [key: string]: any;
}

// 客户信息
export interface CustomerInfo {
  customerId: string;
  customerName: string;
  [key: string]: any;
}

// 分支机构信息
export interface ContactInfo {
  contactId: string;
  contactName: string;
  [key: string]: any;
}

// 核算单元信息
export interface EntryInfo {
  entryid: string;
  entryname: string;
  [key: string]: any;
}

// 订阅状态选项
export interface StatusOption {
  label: string;
  value: string;
}

// 订单详情列表查询参数
export interface OrderDetailListParams {
  dtlUsestatus: number;
  customerId: string;
  goodsName?: string;
  contactIdList?: string[];
  entryKeyword?: string;
  goodsId?: string;
  conType?: number | null;
  userIdList?: string[];
  subArriveType?: string;
  entryId?: string;
  orderType: number;
  selectType: number;
  startTime?: string;
  endTime?: string;
  pageNum: number;
  pageSize: number;
}

// 卡片类型
export type CardType = 0 | 1 | 2 | 3 | 4; // 0-客户汇总, 1-客户详情, 2-未完成订单, 3-正常订单, 4-可激活订单

// 锁控记录信息
export interface LockRecordInfo {
  conType: number;
  statusFlag: number;
  activate: number;
  credate: string;
  [key: string]: any;
}
