/**
 * 拜访记录模块类型定义
 */

/**
 * 拜访统计数据
 */
export interface VisitStatistics {
  visitCstmNum: number; // 拜访客户数
  assistVisitCstmNum: number; // 协访客户数
  receiveCstmNum: number; // 接待客户数
}

/**
 * 拜访记录项
 */
export interface VisitRecordItem {
  userId: string; // 用户ID
  userName: string; // 用户名称
  projectId: string; // 项目ID
  projectName: string; // 项目名称
  upVisitNum: number; // 拜访客户数
}

/**
 * 查询参数
 */
export interface VisitRecordParams {
  userIdList: string[];
  startTime: string;
  endTime: string;
  pageNum: number;
  pageSize: number;
}
