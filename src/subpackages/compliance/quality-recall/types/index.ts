// 筛选条件接口
export interface QualityRecallFilterData {
  startTime?: string; // 开始时间，格式：YYYY-MM-DD
  endTime?: string; // 结束时间，格式：YYYY-MM-DD
  time?: string; // 时间范围显示文本
  customId?: string; // 客户ID
  customName?: string; // 客户名称
  goodsKey?: string; // 药品关键字
}

// 列表项接口
export interface QualityRecallItem {
  recDtlId: string; // 召回详情ID
  recDocId: string; // 召回文档ID
  cgrId: string; // CGR ID
  creDate: string; // 创建日期
  customId: string; // 客户ID
  customName: string; // 客户名称
  entryId: string; // 核算单元ID
  goodsId: string; // 货品ID
  goodsName: string; // 货品名称
  goodsType: string; // 规格
  goodsUnit: string; // 单位
  recLevel: number; // 召回级别：1-一级，2-二级，3-三级
  deadline: string; // 召回截至日期
  toDeadlineDays?: number; // 距离截至日期天数
}

// 详情接口
export interface QualityRecallDetail extends QualityRecallItem {
  entryName: string; // 核算单元名称
  factoryName: string; // 厂家名称
  lotNoStr: string; // 批号字符串（逗号分隔）
  expectQty?: number; // 拟召回数量
  imageUrlList?: Array<{ url: string }>; // 已上传图片列表
}
