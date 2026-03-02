// 筛选条件接口
export interface RefundApproveFilterData {
  goodsKeyword?: string; // 货品关键词（名称或ID）
  customerKeyword?: string; // 客户关键词（名称或ID）
}

// 列表项接口
export interface RefundApproveItem {
  fetchdtlId: string; // 申请细单ID
  fetchId: string; // 申请总单ID
  companyId: string; // 客户ID
  companyName: string; // 客户名称
  entryId: string; // 核算单元ID
  entryName: string; // 核算单元名称
  goodsId: string; // 货品ID
  goodsName: string; // 货品名称
  status: number; // 状态 0-待审批 1-审批通过 2-审批不通过
  [key: string]: any;
}

// 详情接口
export interface RefundApproveDetail {
  fetchdtlId: string; // 申请细单ID
  fetchId: string; // 申请总单ID
  creDate: string; // 业务日期
  companyId: string; // 客户ID
  companyName: string; // 客户名称
  contactId?: string; // 分支机构ID
  contactMan?: string; // 联系人
  goodsId: string; // 货品ID
  goodsName: string; // 货品名称
  prodArea: string; // 产地
  invalidDate: string; // 有效期
  goodsQty: number; // 数量
  totalLine?: number; // 金额
  returnPolicy: string; // 退货政策
  status: number; // 状态 0-待审批 1-通过 2-不通过
  memo?: string; // 备注
  [key: string]: any;
}

// 审批状态枚举
export enum RefundApproveStatus {
  PENDING = 0, // 待审批
  APPROVED = 1, // 审批通过
  REJECTED = 2, // 审批不通过
}
