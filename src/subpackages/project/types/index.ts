/**
 * 项目管理模块类型定义
 */

// 基础类型
export interface BaseResponse<T = any> {
  success: boolean;
  data: T;
  msg?: string;
}

// 用户相关类型
export interface UserInfo {
  userId: number;
  userName: string;
  deptId?: number;
  deptName?: string;
}

// 部门相关类型
export interface DeptInfo {
  id: number | string;
  name: string;
  parentId?: number | string;
  crmUserDtoList?: UserInfo[];
}

// 组织相关类型
export interface OrgInfo {
  id: number | string;
  name: string;
  children: DeptInfo[];
}

// 产品对象类型
export interface ProductObj {
  data: {
    capId: string;
    customerId: string;
    productId: string;
    projectId: string;
  };
  date: string;
}

// 项目相关类型
export interface ProjectInfo {
  projectId: string;
  projectName: string;
  productNum?: number;
  goalNum?: number;
  accessNum?: number;
  goalNumInc?: number;
  accessNumInc?: number;
  dotTarget?: number;
  dotNumber?: number;
  dotNumberInc?: number;
  // 兼容性属性
  id?: string | number;
  text?: string;
  children?: ProjectInfo[];
}

// 产品相关类型
export interface ProductInfo {
  productId: string;
  productName: string;
  productPolicy?: string;
  accessFlag?: number;
  ytAccesss?: number;
  memo?: string;
}

// 项目详情类型
export interface ProjectDetail {
  productName: string;
  productPolicy: string;
}

// 项目状态类型
export interface ProjectStatus {
  capsId: string;
  temPurchase: number;
  temPurchApprove: number;
  temPurchRecord: number;
  newGood: number;
  attendMeeting: number;
  haveAttendMeeting: number;
  newGoodRecord: number;
}

// 药事会相关类型
export interface MedicBoardInfo {
  clrId: string;
  cuvId: string;
  labelId: string;
  labelName: string;
  medicBoardType: number;
  medicBoardTypeMemo?: string;
  scheduleMeetingTime: string;
  medicBoardMemo?: string;
  lastScheduleMeetingTime?: string;
  lastMedicBoardType?: number;
  lastMedicBoardTypeMemo?: string;
  creId: number;
  creName: string;
  credate: string;
}

// 搜索参数类型
export interface SearchParams {
  key?: string;
  goodsnum?: number;
  targetnum?: number;
  allownum?: number;
  finishnum?: number;
  ratenum?: number;
  finish?: number;
  rate?: number;
  status?: number;
}

// 列表项类型
export interface ListItem {
  id: string | number;
  name: string;
  text?: string;
  gray?: boolean;
}

// 排序类型
export type SortType = 0 | 1 | 2; // 0无排序 1降序 2升序

// 状态类型
export type StatusType = 0 | 1 | 2 | 3; // 0无 1进行中 2完成 3未上会

// 药事会类型
export type MedicBoardType = 1 | 2 | 3; // 1新药会 2国谈会 3其他

// 权限级别类型
export type LeaderLevel = 0 | 1 | 2; // 0业务员 1公司项目管理人员 2子公司项目管理人员

// 列表类型
export type ListType = 1 | 2 | 3; // 1组织 2部门 3人员

// 项目类型
export type ProjectType = 1 | 2; // 1准入 2深分

// 类型标签类型
export type TypeValue = 1 | 2; // 1销售进度 2网点覆盖

// 月份选择器列类型
export interface MonthColumn {
  text: string;
  children: { text: string }[];
}

// 选择器选项类型
export interface SelectOption {
  id: string | number;
  text: string;
  name?: string;
  children?: SelectOption[];
}

// 表格列配置类型
export interface TableColumn {
  key: string;
  title: string;
  width?: string;
  minWidth?: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

// 统计数据类型
export interface StatisticsData {
  projectNum: number;
  productNum: number;
  goalNum: number;
  accessNum: number;
  goalNumInc: number;
  accessNumInc: number;
  dotTarget?: number;
  dotNumber?: number;
  dotNumberInc?: number;
}

// 排名数据类型
export interface RankData {
  id: string | number;
  name: string;
  text?: string;
  accessNum?: number;
  accessRate?: number;
  completeRate?: number;
  targetCompleted?: number;
  centerId?: string;
  centerName?: string;
  deptId?: string;
  deptName?: string;
  salerId?: string;
  salerName?: string;
}

// 状态块配置类型
export interface StatusBlockConfig {
  text: string;
  status: StatusType;
  clickable?: boolean;
}

// 步骤标题配置类型
export interface StepTitleConfig {
  text: string;
  status: StatusType;
}

// 表单数据类型
export interface FormData {
  yaoshihuiObj: SelectOption;
  medicBoardTypeMemo: string;
  scheduleMeetingTime: string;
  medicBoardMemo: string;
}

// 操作类型
export interface Action {
  id: number;
  name: string;
}
