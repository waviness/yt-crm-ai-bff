/**
 * 基础信息
 */
export interface EntryObj {
  key: string; // 页面类型
  /** 部门 ID */
  deptId: number | string;
  /** 部门名称 */
  deptName: string;
}
/**
 * 筛选信息
 */
export interface FilterVal {
  keyword: string;
  orderType?: number | string;
  orderColumn?: string;
  orderField?: number | string;
  orderRule?: number | string;
  orderTypeText?: string;
}
