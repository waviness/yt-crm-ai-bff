// 筛选条件接口
export interface QualityReviewFilterData {
  startTime?: string; // 开始时间，格式：YYYY-MM-DD
  endTime?: string; // 结束时间，格式：YYYY-MM-DD
  time?: string; // 时间范围显示文本
  customId?: string; // 客户ID
  customName?: string; // 客户名称
  goodsKey?: string; // 药品关键字（ID|名称|商品名|客户名称）
}

// 列表项接口
export interface QualityReviewItem {
  recheckId: string; // 复查ID
  creDate: string; // 创建日期
  comeFrom: number; // 来源：10-入库收货，12-销退收货，13-销退验收
  entryId: string; // 核算单元ID
  goodsId: string; // 货品ID
  goodsName: string; // 货品名称
  factoryName: string; // 厂家名称
  memo: string; // 内容备注
}

// 详情接口
export interface QualityReviewDetail extends QualityReviewItem {
  companyId: string; // 客户ID
  companyName: string; // 客户名称
  entryName: string; // 核算单元名称
  goodsType: string; // 规格
  goodsUnit: string; // 单位
  auditFlag?: number; // 货品状态：1-合格，2-不合格，5-拒收
  auditMemo?: string; // 审批原因
}
