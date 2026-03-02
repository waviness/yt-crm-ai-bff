/**
 * 客情拜访筛选条件
 */
export interface CustomerFollowFilterData {
  dateValue: string[]; // 日期范围
  followType: string; // 拜访类型
  unitObj: string; // 单位ID
  unitPerson: string; // 单位人员
  labelIdList: string[]; // 事件分类ID列表
  sourceType: string; // 来源类型
  relStatus: string; // 关联状态
}

/**
 * 客情拜访列表项
 */
export interface CustomerFollowItem {
  suvId: string;
  customerName: string;
  relCustomerId?: string;
  relCustomerName?: string;
  sourceType: number; // 0: 拓展客户, 1: 业务系统内客户
  customerTypeName?: string;
  createTime: string;
  visitUserName: string;
  szymLabelRemarkDOResList: any[];
}

/**
 * 客情事件
 */
export interface CustomerLabel {
  slrId?: string;
  suvId?: string;
  keyList: string[]; // 关联项目ID列表
  keyCheckDetail: any[]; // 关联项目详情
  keyString?: string; // 关联项目名称字符串
  remarkChangeIdValue: string; // 事件分类ID
  remarkChangeNameValue: string; // 事件分类名称
  fileList: any[]; // 附件列表
}

/**
 * 职员信息
 */
export interface StaffMember {
  userId: string;
  userName: string;
  phoneNum?: string;
  positionName?: string;
  remarkValueList: CustomerLabel[];
}

/**
 * 选项类型
 */
export interface OptionItem {
  value: string | number;
  name: string;
}

/**
 * 关联选项
 */
export interface RelOption extends OptionItem {
  value: string; // 格式: "sourceType-relStatus" 如 "0-1"
}
