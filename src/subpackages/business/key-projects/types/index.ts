/**
 * 重点项目相关类型定义
 */

// 客户基本信息
export interface KeyProjectCustomer {
  custId: string;
  custName: string;
  ccuId?: string;
  communtyId?: string;
  communtyName?: string;
  gridGradeId?: string;
  gridGrade?: string;
  pilotName?: string;
  typeList?: Array<{ type: string[] }>;
  deptList?: DeptItem[];
  leaderVisitTarget?: number;
  personVisitTarget?: number;
}

// 部门信息
export interface DeptItem {
  deptId: string;
  deptName: string;
  userId: string;
  userName: string;
}

// 拜访数据
export interface VisitData {
  personVisit?: any[];
  leaderVisit?: any[];
  personVisitTimes?: number;
  leaderVisitTimes?: number;
}

// 层级数据
export interface GradeData {
  value: number;
  name: string;
}

// 热力值数据
export interface WarmthData {
  normal: number;
  lack: number;
  never: number;
  normalUp: number;
  lackUp: number;
  neverUp: number;
}

// 增速数据
export interface IncreaseData {
  saleMonth: string;
  saleYear: string;
  saleMonthRate: string;
  saleYearRate: string;
  saleLastMonthRate: string;
  unionMonth: string;
  unionYear: string;
  unionMonthRate: string;
  unionYearRate: string;
  unionLastMonthRate: string;
}

// 增速表格行数据
export interface IncreaseTableRow {
  type?: 'target';
  name: string;
  saleValue?: string;
  unionValue?: string;
  targetSaleValue?: string;
  targetUnionValue?: string;
}

// 话题数据
export interface TopicItem {
  smallTagName: string;
  visitTime: string;
  remark: string;
  labelId?: number;
}

// GR列表项
export interface GrItem {
  cupId: string;
  personId: string;
  personName: string;
  position: string;
  content: string;
  topicDetailVO: {
    smallTagName: string;
    visitTime: string;
    remark: string;
  };
}

// 目标任务项
export interface TargetItem {
  cutId: string;
  status: number;
  targetTime: string;
  content: string;
  targetText?: string;
}

// 目标品种项
export interface GoodsItem {
  cugId: string;
  goodsId: string;
  goodsName: string;
  saleBefore: number;
  saleAllYear: number;
  saleNow: number;
  creTime: string;
}

// 标签树节点
export interface LabelTreeNode {
  id: number | string;
  text: string;
  children?: LabelTreeNode[];
}

// 人员信息
export interface PersonInfo {
  userId: string;
  userName: string;
  position: string;
}
