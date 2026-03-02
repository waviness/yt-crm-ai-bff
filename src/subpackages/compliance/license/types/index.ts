/**
 * Lock 模块类型定义
 * 包含证照、委托书相关的所有类型定义
 */

/**
 * 证照类型枚举
 */
export enum LicenseType {
  /** 企业证照 */
  ENTERPRISE_LICENSE = 0,
  /** 客户/供应商法人委托书 */
  ATTORNEY_LETTER = 1,
}

/**
 * 列表类型枚举
 */
export enum ListType {
  /** 延期列表 */
  EXTENSION = 1,
  /** 审批列表 */
  APPROVAL = 2,
}

/**
 * 状态类型枚举
 */
export enum StatusType {
  /** 临期/待处理 */
  PENDING = 0,
  /** 审批中 */
  IN_APPROVAL = 1,
  /** 已审批 */
  APPROVED = 2,
}

/**
 * 审批状态枚举
 */
export enum ApprovalStatus {
  /** 审批中 */
  IN_PROGRESS = 1,
  /** 审批通过 */
  APPROVED = 3,
  /** 审批未通过 */
  REJECTED = 4,
}

/**
 * 消息类型枚举
 */
export enum MessageType {
  /** 过期消息通知 */
  EXPIRE_NOTIFICATION = 1,
  /** 复签通知 */
  RESIGN_NOTIFICATION = 2,
}

/**
 * 单位类型枚举
 */
export enum CompanyType {
  /** 供应商 */
  SUPPLIER = 1,
  /** 客户 */
  CUSTOMER = 2,
}

/**
 * 基础证照信息
 */
export interface BaseLicenseInfo {
  /** 证照ID */
  licenseId?: string;
  /** 证照名称 */
  licenseName?: string;
  /** 核算单元ID */
  entryId?: string;
  /** 核算单元名称 */
  entryName?: string;
  /** 公司ID */
  companyId?: string;
  /** 公司名称 */
  companyName?: string;
  /** 有效期开始日期 */
  validOnDate?: string;
  /** 有效期结束日期 */
  validEndDate?: string;
  /** 剩余天数 */
  expireLeftDay: number;
}

/**
 * 委托书信息
 */
export interface AttorneyLetterInfo {
  /** 序列ID */
  seqId?: string;
  /** 委托人ID */
  agentId?: string;
  /** 委托人姓名 */
  agentName?: string;
  /** 委托人状态 */
  agentStatusString?: string;
  /** 公司类型 */
  companyType?: CompanyType;
  /** 有效期从 */
  dateFrom?: string;
  /** 有效期至 */
  dateTo?: string;
  /** 原到期日期 */
  oldDateTo?: string;
}

/**
 * 申请相关信息
 */
export interface ApplicationInfo {
  /** 申请人ID */
  applyManId?: string;
  /** 申请人姓名 */
  applyManName?: string;
  /** 申请日期 */
  applyDate?: string;
  /** CRM申请人ID */
  crmApplyManId?: string;
  /** CRM申请人姓名 */
  crmApplyManName?: string;
  /** 审批状态 */
  approveStatus?: ApprovalStatus;
}

/**
 * 延期相关信息
 */
export interface ExtensionInfo {
  /** 延期至日期 */
  delayToDate?: string;
  /** 延期日期 */
  delayDate?: string;
  /** 延期原因 */
  delayReason?: string;
  /** 申请备注 */
  applyMemo?: string;
  /** 审批原因 */
  approveRemark?: string;
  /** 审批备注 */
  approveMemo?: string;
  /** 附件列表 */
  imageList?: string[];
}

/**
 * 复签相关信息
 */
export interface ResignInfo {
  /** 解锁次数 */
  unLockTimes?: number;
  /** 复签状态 */
  reApproveStatus?: ApprovalStatus;
  /** 经理复签记录ID */
  cmrId?: string;
  /** 延期申请ID */
  delayApplyId?: string;
  /** 审批ID */
  approveId?: string;
}

/**
 * 人员信息
 */
export interface PersonInfo {
  /** 业务员列表 */
  salerNameList?: string[];
  /** 采购员列表 */
  purchaserNameList?: string[];
}

/**
 * 完整的证照数据
 */
export interface LicenseData
  extends BaseLicenseInfo,
    AttorneyLetterInfo,
    ApplicationInfo,
    ExtensionInfo,
    ResignInfo,
    PersonInfo {
  /** 按钮显示状态 */
  buttonShow?: boolean;
}

/**
 * 筛选表单选项
 */
export interface FilterOption {
  /** 显示名称 */
  name: string;
  /** 选项值 */
  value: string | number;
  /** 是否禁用 */
  disabled?: boolean;
  /** 子选项 */
  children?: FilterOption[];
}

/**
 * 筛选表单数据
 */
export interface FilterFormData {
  /** 公司关键词 */
  companyKeyWord: string;
  /** 证照关键词 */
  licenseKeyWord: string;
  /** 核算单元ID */
  queryEntryId: string;
  /** 过期状态 */
  expireStatus: FilterOption;
  /** 有效期开始日期 */
  validEndDateBegin: string;
  /** 有效期结束日期 */
  validEndDateTerminate: string;
  /** 公司类型 */
  companyType: FilterOption;
}

/**
 * 部门经理信息
 */
export interface ManagerInfo {
  /** 用户ID */
  value: string;
  /** 用户名 */
  name: string;
  /** 电话号码 */
  phone: string;
}

/**
 * 延期申请参数
 */
export interface ExtensionApplicationParams extends BaseLicenseInfo, AttorneyLetterInfo {
  /** 延期至日期 */
  delayTo: string;
  /** 延期原因 */
  delayReason: string;
  /** 解锁次数 */
  unLockTimes: number;
  /** 附件文件列表 */
  imageFiles: string[];
}

/**
 * 审批参数
 */
export interface ApprovalParams extends BaseLicenseInfo, AttorneyLetterInfo {
  /** 审批状态 */
  approveStatus: ApprovalStatus;
  /** 审批原因/备注 */
  approveReason?: string;
  /** 审批备注 */
  approveMemo?: string;
  /** 延期至日期 */
  delayTo?: string;
  /** 审批ID */
  approveId?: string;
  /** 延期申请ID */
  delayApplyId?: string;
}

/**
 * 经理复签参数
 */
export interface ManagerResignParams {
  /** 复签记录ID */
  cmrId: string;
  /** 复签状态 */
  reApproveStatus: ApprovalStatus;
  /** 证照ID */
  licenseId?: string;
  /** 委托书ID */
  letterId?: string;
  /** 延期申请ID */
  delayApplyId?: string;
}

/**
 * 选择经理参数
 */
export interface ChooseManagerParams extends FormData {
  /** 延期至日期 */
  delayTo: string;
  /** 延期原因 */
  delayReason: string;
  /** 核算单元ID */
  entryId: string;
  /** 解锁次数 */
  unLockTimes: number;
  /** 复签经理ID */
  resignManagerId: string;
  /** 复签经理电话 */
  resignManagerPhoneNumber: string;
}

/**
 * 页面状态配置
 */
export interface PageConfig {
  /** 消息类型 */
  msgType: MessageType | '';
  /** 列表类型 */
  listType: ListType;
  /** 证照类型 */
  licenseType: LicenseType;
  /** 状态类型 */
  statusType: StatusType;
}

/**
 * 加载状态
 */
export interface LoadingStates {
  /** 发布加载中 */
  publishLoading: boolean;
  /** 提交加载中 */
  submitLoading: boolean;
  /** 提交加载中2 */
  submitLoading2: boolean;
}

/**
 * 弹窗显示状态
 */
export interface PopupStates {
  /** 选择经理弹窗 */
  chooseShow: boolean;
  /** 操作选择弹窗 */
  actionShow: boolean;
}

export interface LicenseConfig {
  /** 证照类型：0-证照，1-律师函 */
  licenseType: LicenseType;
  /** 当前标签页索引 */
  current: number;
  /** 审批状态：3-通过，4-未通过 */
  agreeActive: number;
  /** 证照状态：1-待处理，2-所有 */
  licenseStatus: number;
}

export interface ExtensionFormData {
  delayTo: string;
  delayReason: string;
  entryId: string;
  unLockTimes: number;
  companyId: string;
  companyName: string;
  expireLeftDay: number;
  imageUrls: string[];
  // 许可证特有字段
  licenseId?: string;
  licenseName?: string;
  validOnDate?: string;
  validEndDate?: string;
  // 委托书特有字段
  seqId?: string;
  agentId?: string;
  dateFrom?: string;
  oldDateTo?: string;
  [key: string]: string | number | string[] | undefined;
}

export interface ApprovalFormData {
  entryId: string;
  companyId: string;
  companyName: string;
  approveStatus: string;
  expireLeftDay: number;
  [key: string]: string | number;
}
