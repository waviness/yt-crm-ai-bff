// 库存查询列表项接口
export interface InventoryQueryItem {
  entryId: string; // 核算单元ID
  entryName: string; // 核算单元名称
  erpGoodsIdList: string[]; // 平台ID列表
  goodsId: string; // 货品ID
  goodsName: string; // 货品名称
  goodsType: string; // 货品规格
  currencyName?: string; // 货币名称
  prodArea?: string; // 产地
  packSize?: string; // 包装规格
  goodsUnit?: string; // 单位
  packName?: string; // 包装名称
  reservePlanQuantity?: string; // 储备计划数量
  salestaxrate?: string; // 销项税
  buyerName?: string; // 采购员
  goodsQuantity?: string; // 可销库存
  minSaleQuantity?: string; // 最小开票数量
  hospitalLimitPrice?: string; // 跟标医院限价
  coldFlag?: number | null; // 冷链标志 (0: 非冷链, 1: 冷链)
  globalGoodsTagList: string[]; // 全局货品标签列表
  goodsReminder?: boolean; // 是否订阅到货提醒
  ticketReminder?: boolean; // 是否订阅开票提醒
  twoInvoiceFlag?: boolean; // 是否两票制货源
  stockFlag?: boolean; // 是否有库存
}
// 库存下限查询结果项接口
export interface InventoryQueryLowerLimitItem {
  customType: number; // 自定义类型标识
  ddlName: string; // 下拉列表名称
  forbidsqty: number; // 禁止数量
}

// 库存查询详情项接口
export interface InventoryQueryDetailItem {
  lotNo: string; // 批号
  storageName: string; // 仓库名称
  goodsId: string; // 货品ID
  currencyName?: string; // 货币名称
  goodsName: string; // 货品名称
  goodsType: string; // 货品规格
  prodArea?: string; // 产地
  packSize?: string; // 包装规格
  goodsUnit?: string; // 单位
  packName?: string; // 包装名称
  goodsQuantity?: string; // 库存数量
  goodsStatus?: string; // 货品状态
  invoiceFlag?: number; // 两票制标志 (0: 非两票制, 1: 两票制, 2: 发票未到, 3: 无两票制库存)
  invoiceGoodsNum?: string; // 两票制库存数量
  invalidDate?: string; // 有效期至
  buyerName?: string; // 采购员
}
