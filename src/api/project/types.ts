/**
 * 项目管理API参数类型定义
 */

// 公共参数组合
export interface BaseProjectParams {
  date: string;
  key?: string;
}

export interface BaseProjectWithOrgParams extends BaseProjectParams {
  centerId?: string;
  crmDeptId?: string;
  userId?: string;
  projectId?: string;
}

// 获取LeaderLevel参数
export interface GetLeaderLevelParams {
  userId?: string;
  deptId?: string;
  centerId?: string;
}

// 获取历史导入日期参数
export interface GetProjectManageDateParams {
  flag: number; // 1-准入项目, 2-深分项目
}

// 查询数据部门类型参数
export interface QueryDataDeptByTypeParams {
  date?: string;
  type?: number; // 1-部门, 2-人员
}

// 获取准入项目产品参数
export interface GetAccessProjectProducParams extends BaseProjectWithOrgParams {
  projectId?: string;
}

// 获取准入项目产品明细参数
export interface GetAccessProjectProductDtlParams {
  capId: string;
}

// 获取药事会信息参数
export interface GetYaoShiHuiParams {
  date: string;
  customerId: string;
  productId: string;
  projectId?: string;
  capId?: string;
}

// 获取药事会信息列表参数
export interface GetYaoShiHuiListParams {
  date: string;
  customerId: string;
  productId: string;
  projectId?: string;
  capId?: string;
  pageNum?: number;
  pageSize?: number;
}

// 更新状态参数
export interface UpdateStatusParams {
  capsId: string;
  status: number;
  remark?: string;
}

// 获取准入项目产品政策参数
export interface GetAccessProductPolicyParams extends BaseProjectParams {
  projectId: string;
}

// 获取深分项目政策参数
export interface GetDeepProjectPolicyParams {
  date: string;
  projectId: string;
}

// 获取产品池参数
export interface GetProductsParams {
  key?: string;
  customerId?: string | number;
}
