// 收款认领相关类型定义

// 筛选条件接口
export interface CollectionClaimFilterData {
  accdocid?: string; // 核算单号
  custom?: string; // 客户
  entry?: string; // 核算单元
  ordercustomname?: string; // 订单客户名称
  usestatusList: string[]; // 使用状态列表，默认值: ['1', '2', '3']
  advancePayFlag: string; // 预付款标志，默认值: '1'
}

// 收款认领列表项接口
export interface CollectionClaimListItem {
  accdocid: string; // 核算单号
  createtime: string; // 创建时间
  customid?: string; // 客户ID
  customname?: string; // 客户名称
  entryid: string; // 核算单元ID
  entryname: string; // 核算单元名称
  contactid?: string; // 分支机构ID
  contactman?: string; // 联系人
  ordercustomname: string; // 对方户名
  total: string; // 总金额
  accmoney: string; // 已认领金额
  notaccmoney: string; // 未认领金额
  presalerid: string; // 销售ID
  presalername: string; // 销售名称
  description?: string; // 备注
  uploadstatus?: string; // 上传状态
  usestatus: string; // 使用状态
  collectionid?: number; // 收款认领ID
}

// 收款认领图片附件接口
export interface CollectionClaimImage {
  attachmenttype: number; // 附件类型
  collectionid: number; // 收款认领ID
  collectionimgid: number; // 图片ID
  createtime: string; // 创建时间
  fileName: string; // 文件名
  imglink: string; // 图片链接
}
