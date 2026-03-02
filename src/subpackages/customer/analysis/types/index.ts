// 客户信息接口
export interface CustomerInfo {
  custId: string; // 客户ID
  custName: string; // 客户名称
  className?: string; // 分类名称
  isProfit?: number; // 经营性质 1-政府办 2-非政府办营利 3-非政府办非营利
  yearSalesVolumeName?: string; // 年药品销售规模
  shareholderCompose?: string; // 股东成分
  scienceLineName?: string; // 学术专线
  saleManList?: SaleMan[]; // 业务员列表
  [key: string]: any;
}

// 业务员接口
export interface SaleMan {
  userId: string; // 用户ID
  userName: string; // 用户名
  orgName?: string; // 机构名称
}

// 客情事件统计接口
export interface EventCount {
  custEventCount: number; // 累计客勤事件/次
  legWorkCount: number; // 累计外勤拜访/次
  followCount: number; // 累计客户随访/次
  assistCount: number; // 累计客户协防/次
}

// 相关人员接口
export interface PersonInfo {
  cueId: string; // 人员ID
  userId: string; // 用户ID
  userName: string; // 人员姓名
  phoneNum?: string; // 手机号
  position?: string; // 职务
  warmthNum?: number; // 热力值 1-一般客情 2-需进阶客情 3-未接触客情
  birthday?: string; // 生日
  politicalStatus?: number; // 是否党员 1-是
  hobby?: string; // 兴趣
  saleName?: string; // 资料贡献人
  saleId?: string; // 业务员ID
  [key: string]: any;
}

// 机构类型接口
export interface OrgType {
  DIC_SELECT_ID: string; // 类型ID
  DIC_SELECT_NAME: string; // 类型名称
  CHILD_LIST?: any[];
}

// 排行榜客户接口
export interface RankCustomer {
  custId: number; // 客户ID
  custName: string; // 客户名称
  orgType: string; // 机构类型
  city: string; // 城市
  monthRank2?: number; // 月排名
  growthRank2?: number; // 增长排名
  orgTypeNum2?: number; // 类型总数
  [key: string]: any;
}

// 标签树接口
export interface LabelTreeItem {
  id: number; // 标签ID
  text: string; // 标签名称
  children?: LabelTreeChild[];
}

export interface LabelTreeChild {
  id: number; // 子标签ID
  text: string; // 子标签名称
}

// 客情事件接口
export interface CustomerEvent {
  eventId: string; // 事件ID
  eventType: string; // 事件类型
  eventTime: string; // 事件时间
  eventContent: string; // 事件内容
  userName?: string; // 操作人
  [key: string]: any;
}

// 热力值枚举
export enum WarmthLevel {
  NORMAL = 1, // 一般客情
  ADVANCED = 2, // 需进阶客情
  NEVER = 3, // 未接触客情
}
