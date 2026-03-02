// 搜索参数
export interface FirstAidOrderFilterData {
  starttime: string; // 开始时间
  endtime: string; // 结束时间
  goodsid: string; //货品ID
  goodsname: string; // 货品名称
  customerid: string; // 客户ID
  customname: string; // 客户名称
}
// 急救补单列表参数
export interface FirstAidOrderOrderItem {
  addtime: string; // 添加时间
  entryid: number; // 核算单元ID
  entryname: string; // 核算单元名称
  erpcustomid: number; // 客户ID
  erpcustomename: string; // 客户名称
  erpid: string; // ERPvID
  tym: string; // 品种
  gg: string; // 规格
  scqy: string; // 产地
  erp_cgsl: number; // 合同数量
  cgjg: number; // 合同价格
  ddmxbh?: string; // 订单明细编号
  ddbh?: string; // 订单编号
}

// 急救补单详情查看参数
export interface FirstAidOrderDetailData {
  customid: number | string; // 客户ID
  goodsid: number | string; // 货品ID
  goodsqty: number | string; // 货品数量
  entryId: number | string; // 核算单元ID
}
// 急救补单详情列表参数
export interface FirstAidOrderOrderDetailListObj {
  printtime: string; // 开票日期
  salesdtlid: string; // 销售细单ID
  goodsqty: number; // 货品数量
  unitprice: number; // 销售价格
  invno: string; // 发票号
  storagename: string; // 保管帐
  dtlmemo?: string; // 备注(送货地址)
}
