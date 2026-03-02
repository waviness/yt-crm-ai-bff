/**
 * 确认函查询参数类型
 * 用于询证函列表查询时的参数传递
 */
export interface ConfirmationLetterParams {
  startTime?: string; // 查询开始时间，格式：YYYY-MM-DD
  endTime?: string; // 查询结束时间，格式：YYYY-MM-DD
  confirmadocid: string; // 确认函文档ID，必填
  customerId?: string; // 客户ID，可选
  customName?: string; // 客户名称，可选
  type?: string | number; // 确认函类型，可选
  keyWords?: string; // 关键词搜索，可选
  pageNum: number; // 页码，必填
  pageSize: number; // 每页条数，必填
}

/**
 * 下载确认函图片参数类型
 * 用于下载询证函相关图片时的参数传递
 */
export interface DownloadConfirmationRequestPicturesParams {
  confirmadocid?: string; // 确认函文档ID，可选
  entryId?: string; // 条目ID，可选
  customerId?: string; // 客户ID，可选
  settleAccountsMonth?: string; // 结算月份，格式：YYYY-MM，可选
}

/**
 * 发起询证函查询参数类型（融合版本）
 * 用于查询业务员或财务发起的询证函列表
 */
export interface InitiatedConfirmationRequestParams {
  ccrId?: string; // 询证函记录ID，可选
  role?: string | number; // 用户角色，可选（业务员、财务等）
  type?: string | number; // 询证函类型，可选
  startTime?: string; // 查询开始时间，格式：YYYY-MM-DD HH:mm:ss，可选
  endTime?: string; // 查询结束时间，格式：YYYY-MM-DD HH:mm:ss，可选
  customerId?: string; // 客户ID，可选
  customerName?: string; // 客户名称，可选
  contactId?: string; // 联系人ID，可选
  contactName?: string; // 联系人姓名，可选
  entryId?: string; // 条目ID，可选
  entryName?: string; // 条目名称，可选
  pageNum: number; // 页码，必填
  pageSize: number; // 每页条数，必填
}

/**
 * 更新确认函状态参数类型
 * 用于更新询证函处理状态的参数传递
 */
export interface UpConfirmationLetterParams {
  confirmadocid: string; // 确认函文档ID，必填
  statue: number; // 状态值，必填
  index: number; // 索引值，必填
}

/**
 * 确认函筛选数据基础类型
 * 用于确认函列表筛选的基本参数
 */
export interface FilterData {
  startTime: string; // 筛选开始时间，必填
  endTime: string; // 筛选结束时间，必填
  confirmadocid: string; // 确认函文档ID，必填
  customerId: string; // 客户ID，必填
  customName: string; // 客户名称，必填
}

/**
 * 异常确认函筛选数据类型
 * 扩展基础筛选数据，添加异常情况相关字段
 */
export interface AbnormalFilterData {
  startTime: string; // 筛选开始时间，必填
  endTime: string; // 筛选结束时间，必填
  customerId: string; // 客户ID，必填
  customName: string; // 客户名称，必填
  entryId: string; // 条目ID，必填
  entryName: string; // 条目名称，必填
  contactId: string; // 联系人ID，必填
  contactName: string; // 联系人姓名，必填
}

/**
 * 确认函详情对象类型
 * 表示单个确认函的详细信息数据结构
 */
export interface ConfirmationItem {
  confirmadocid: string; // 确认函文档ID
  credate?: string; // 创建日期，格式：YYYY-MM-DD HH:mm:ss，可选
  customid: string; // 客户ID
  customerName?: string; // 客户名称，可选
  entryid: string; // 条目ID
  contactId?: string; // 联系人ID，可选
  contactMan?: string; // 联系人姓名，可选
  total: string | number; // 总金额
  usestate: number; // 使用状态
  validDays: number; // 有效天数
  filledReasonFlag?: boolean; // 已填写原因标识，可选
  filledReasonList?: string[]; // 已填写原因列表，可选
  customsuredate?: string; // 客户确认日期，格式：YYYY-MM-DD，可选
  returnFlag?: number | string; // 退回标识，可选
  usemm?: string; // 使用月份，格式：YYYY-MM，可选
  cremanid?: string; // 创建人ID，可选
  salesPersonName?: string; // 销售员姓名，可选
}
