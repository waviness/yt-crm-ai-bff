export interface FinalKnotFilterData {
  startTime?: string; // 开始时间，格式：YYYY-MM-DD
  endTime?: string; // 结束时间，格式：YYYY-MM-DD
  time?: string; // 时间范围，格式：YYYY-MM-DD至YYYY-MM-DD
  goodsId?: string; // 货品ID
  goodsName?: string; // 货品名称
  supplyId?: string; // 供应商ID（注意：组件中有拼写错误）
  supplyName?: string; // 供应商名称
}

// 卡片详情信息接口
export interface FinalKnotItem {
  zdId: string; // 总单编号
  credate: string; // 创建日期
  supplyId: string; // 供应商ID
  supplyName: string; // 供应商名称
  factoryname?: string; // 生产厂家（可选）
  goodsId: string; // 货品ID
  goodsName: string; // 货品名称
  goodsType: string; // 规格
  entryId: string; // 核算单元ID
  entryName: string; // 核算单元名称
}
