// 定义筛选值类型
export interface FilterValues {
  startTime: string; // 开始时间
  endTime: string; // 结束时间
  goodsKeyword: string; // 商品关键词
  customerKeyword: string; // 客户关键词
  operatingCustomerStatus?: string; // 运营客户状态
  coreHospitalType?: string; // 核心医院类型
  coreHospitalName?: string; // 核心医院名称
  entryKeyword?: string; // 核算单元关键词
  publicHospitalFlag?: string; // 公立医院标识
  exgoodsIds?: string[]; // 排除商品ID列表
  conTypeList: (number | string)[]; // 合同类型列表
  conTypeText?: string; // 合同类型文本
  isOutOfStockHandle?: string; // 采购是否反馈
  overdueFlag?: string; // 是否超期未到货
}
export type TabConfig = {
  [key: number]: {
    1?: { name: string; id: number; disabled?: boolean }[];
    2?: { name: string; id: number; disabled?: boolean }[];
    tabs?: { name: string; id: number }[];
  };
};

export interface DetailObj {
  taskId: string; // 任务ID
  createTime: string; // 创建时间
  conDtlId: string; // 合同明细ID
  customerId: string; // 客户ID
  customerName: string; // 客户名称
  goodsId: string; // 商品ID
  goodsName: string; // 商品名称
  contractQuantity: string | number; // 合同数量
  salesmanName: string; // 业务员名称
  purchaserId: string; // 采购ID
  purchaserName: string; // 采购名称
  recordId?: string; // 记录ID
  coreHospital?: number; // 核心医院
  branchId?: string; // 分支机构ID
  brandName?: string; // 品牌名称
  entryId: string | number; // 核算单元ID
  entryName: string; // 核算单元名称
  conType: number; // 合同类型
  goodsCurrencyName?: string; // 商品币种名称
  goodsType: string; // 商品类型
  factoryName: string; // 工厂名称
  lastBuyContractCreateTime?: string; // 上次采购合同创建时间
  isAutoOrder?: number; // 是否自动下单
  signAddress?: string; // 签约地址
  operatingCustomerStatus?: string; // 运营客户状态
  ddlId?: string; // DDL ID
  ddlName?: string; // DDL名称
  confirmedQuantity?: string | number; // 确认数量
  twoInvoiceLeftQuantity: string | number; // 两票制剩余数量
  yyStockQuantity?: number; // 医院库存数量
  totalAvailableStockQuantity: string | number; // 总可用库存数量
  stockQuantity?: string | number; // 库存数量
  reservePlanQuantity?: string | number; // 储备计划数量
  reserveDocId?: string; // 储备文档ID
  examinePrice: string | number; // 审核价格
  contractPrice: string | number; // 合同价格
  lastSellPrice?: string | number; // 上次销售价格
  limitPrice?: string | number; // 限价
  zxErrorMessage?: string; // 中兴错误信息
  memo?: string; // 备注
  arriveTime?: string; // 到货时间
  statusFlag?: number; // 状态标识
  activate?: number; // 是否激活
  orderStatus?: number; // 订单状态
  outOfStockType?: number; // 缺货类型
  predictArriveTime?: string; // 预计到货时间
  noCooperateType?: number | string; // 不合作类型
  availableType?: number; // 可用类型
  noStockObjective?: number; // 无库存目标
  shortageReason?: string; // 缺货原因
  approveStatus?: number; // 审批状态
  predictQuantity?: number | string; // 预计数量
  remark?: string; // 备注
  feedbackTime?: string; // 反馈时间
}

export interface ListItem {
  taskId: string; // 任务ID
  coreHospital?: number; // 核心医院
  createTime: string; // 创建时间
  entryId: string; // 核算单元ID
  entryName: string; // 核算单元名称
  customerId: string; // 客户ID
  customerName: string; // 客户名称
  goodsId: string; // 商品ID
  goodsName: string; // 商品名称
  goodsCurrencyName?: string; // 商品币种名称
  goodsType: string; // 商品类型
  totalAvailableStockQuantity: string; // 总可用库存数量
  contractQuantity: string; // 合同数量
  confirmedQuantity?: string; // 确认数量
  signAddress?: string; // 签约地址
  isAutoOrder?: number; // 是否自动下单
  arriveTime?: string; // 到货时间
  goodsReminder?: boolean; // 商品提醒
  ticketReminder?: boolean; // 票据提醒
  checked?: boolean; // 是否选中
  conType?: number; // 合同类型
  feedbackTime?: string; // 反馈时间
}
