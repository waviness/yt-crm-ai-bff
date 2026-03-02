/**
 * 客情分析推送报告相关类型定义
 */

// 业务员活动数据
export interface SalespersonActivity {
  name: string;
  visitCount: number;
}

// 概况数据
export interface Overview {
  totalVisits: number;
  mainUnits: string[] | Array<{ unit?: string; name?: string }>;
  salespersonActivity: SalespersonActivity[] | Record<string, number>;
  summary?: string;
}

// 事件项
export interface Event {
  userName: string;
  visitTime: string;
  keyInfo: string;
  fullRemark: string;
  cuvId?: string;
}

// 重点事件
export interface KeyEvent {
  unit: string;
  events: Event[];
}

// 推荐项
export interface RecommendationItem {
  description: string;
  cuvIds: string[];
  type?: string;
}

// 推荐数据
export interface Recommendations {
  urgentFollowUp: RecommendationItem[];
  leadershipAttention: RecommendationItem[];
  potentialRisksOpportunities: RecommendationItem[];
}

// 仪表盘数据
export interface DashboardData {
  overview: Overview;
  keyEvents: KeyEvent[];
  recommendations: Recommendations;
}

// 拜访记录详情
export interface VisitDetail {
  address: string;
  visitUserName: string;
  visitUserPosition: string;
  companyName: string;
  companyType?: string;
  visitTime: string;
  remark: string;
  creName: string;
  taskType?: string;
  crmLabelRemarkDtoList?: Array<{
    labelName: string;
    remark: string;
  }>;
}
