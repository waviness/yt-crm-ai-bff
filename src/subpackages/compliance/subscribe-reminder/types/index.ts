/**
 * 订阅提醒服务相关类型定义
 */

// 可订阅品种
export interface SubscribableGoods {
  goodsId: string | number;
  goodsName: string;
  goodsCode?: string;
  specification?: string;
  manufacturer?: string;
  entryId: string | number;
  entryName: string;
  zxFactoryName?: string;
  goodsType?: string;
  subGoodsType: number;
  sublnvnoType: number;
  subGoodsId?: string | number;
  subinvnoId?: string | number;
  subGoodsNum?: number;
  subInvnoNum?: number;
}

export interface SubscribableGoodsParams {
  pageNum?: number;
  pageSize?: number;
  goodsKeyword?: string;
}

// 订阅到货/到票信息
export interface SubscribeArriveInfo {
  subId: string | number;
  goodsId: string | number;
  goodsName: string;
  goodsCode?: string;
  entryId: string | number;
  entryName: string;
  subType: number;
  subDate: string;
  lastSendTime?: string;
  sendFlag: number;
  sendFlagName: string;
  invNo?: string;
}

export interface SubscribeArriveListParams {
  pageNum?: number;
  pageSize?: number;
  subType: number;
  goodsId?: string | number;
  goodsName?: string;
  sendFlag?: number;
}

// 订阅操作参数（统一参数接口）
export interface SubscribeOperationParams {
  subId?: string | number;
  entryId?: string | number;
  goodsId?: string | number;
  subType?: number;
}

// 筛选条件
export interface SubscribeFilterData {
  goodsId: string;
  goodsName: string;
  sendFlag: number;
}

// 搜索参数
export interface SubscribeSearchParams {
  goodsKeyword: string;
  subType: number;
}
