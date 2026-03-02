// 筛选数据接口
export interface SalesReturnFilterData {
  confirmTime?: string; // 收货日期，格式：YYYY-MM-DD
  contactKeyword?: string; // 分支机构关键字
  customerKeyword?: string; // 客户关键字
}

// 列表项接口
export interface SalesReturnItem {
  redocId: string; // 收货总单ID
  entryId: string; // 核算单元ID
  entryName: string; // 核算单元名称
  custId: string; // 客户ID
  custName: string; // 客户名称
  contactId?: string; // 分支机构ID
  contactName?: string; // 分支机构名称
  receiptDate: string; // 收货日期
}

// 详情数据接口
export interface SalesReturnDetail {
  entryId: string; // 核算单元ID
  entryName: string; // 核算单元名称
  redocId: string; // 收货总单ID
  fetchId: string; // 销退申请总单ID
  custId: string; // 客户ID
  custName: string; // 客户名称
  contactId?: string; // 分支机构ID
  contactName?: string; // 分支机构名称
  receiptDate: string; // 收货日期
  goodsId: string; // 货品ID
  goodsName: string; // 货品名称
  goodsType: string; // 规格
  factoryName: string; // 厂家
  oldGoodsQty: number; // 订单总数量
  rggoodsQty: number; // 验收总数量
  lotNo: string; // 批号
  goodsStatus: string; // 货品状态
  rgunitPrice?: number; // 收货单价
  oldunitPrice?: number; // 销售原单单价
  aftdicPrc?: number; // 销售单折后单价
  realPrice?: number; // 入库单价（已处理时使用）
  priceType?: number; // 价格类型（已处理时使用）
}

// 价格选择项接口
export interface PriceOption {
  label: string; // 显示标签
  type: number; // 价格类型 1-收货单价 2-销售原单单价 3-销售单折后单价
  value: number; // 价格值
}

// PM4身份接口
export interface IdentityInfo {
  userId: string; // 用户ID
  userCode: string; // 用户编码
  userName: string; // 用户名称
  entryId: string; // 核算单元ID
  entryName: string; // 核算单元名称
  deptId: string; // 部门ID
}
