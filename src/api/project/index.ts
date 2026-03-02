/**
 * 项目管理服务类
 * 提供项目管理相关的所有API接口
 */

import type {
  GetLeaderLevelParams,
  GetProjectManageDateParams,
  QueryDataDeptByTypeParams,
  GetAccessProjectProducParams,
  GetAccessProjectProductDtlParams,
  GetYaoShiHuiParams,
  GetYaoShiHuiListParams,
  UpdateStatusParams,
  GetAccessProductPolicyParams,
  GetDeepProjectPolicyParams,
  GetProductsParams,
  BaseProjectParams,
  BaseProjectWithOrgParams,
} from './types';

export class ProjectService {
  /**
   * 获取当前人员LeaderLevel
   * @param payload 查询参数
   * @returns 返回LeaderLevel信息
   */
  static async getLeaderLevel(payload: GetLeaderLevelParams) {
    const response = await http.web.post('/api/projectManage/getLeaderLevel', payload);
    return response.data;
  }

  /**
   * 查询历史导入日期
   * @param payload 查询参数
   * @returns 返回历史导入日期列表
   */
  static async getProjectManageDate(payload: GetProjectManageDateParams) {
    const response = await http.web.formDataPost('/api/projectManage/getDate', payload);
    return response.data;
  }

  /**
   * 查询用户拥有的权限（部门和人员）
   * @param payload 查询参数
   * @returns 返回权限信息
   */
  static async queryDataDeptByType(payload: QueryDataDeptByTypeParams) {
    const response = await http.web.formDataPost('/api/projectManage/queryDataDeptByType', payload);
    return response.data;
  }

  /**
   * 查询准入项目总单数量
   * @param payload 查询参数
   * @returns 返回项目总单数量
   */
  static async getAccessProjectDocNum(payload: BaseProjectWithOrgParams) {
    const response = await http.web.formDataPost(
      '/api/projectManage/getAccessProjectDocNum',
      payload
    );
    return response.data;
  }

  /**
   * 查询准入项目总单排序
   * @param payload 查询参数
   * @returns 返回项目总单排序列表
   */
  static async getAccessProjectDoc(payload: BaseProjectWithOrgParams) {
    const response = await http.web.formDataPost(
      '/api/projectManage/getAccessProjectDoc',
      payload,
      {
        showLoading: false,
      }
    );
    return response.data;
  }

  /**
   * 查询准入项目产品
   * @param payload 查询参数
   * @returns 返回项目产品列表
   */
  static async getAccessProjectProduc(payload: GetAccessProjectProducParams) {
    const response = await http.web.formDataPost(
      '/api/projectManage/getAccessProjectProduc',
      payload,
      {
        showLoading: false,
      }
    );
    return response.data;
  }

  /**
   * 查询准入项目产品明细
   * @param payload 查询参数
   * @returns 返回项目产品明细列表
   */
  static async getAccessProjectProductDtl(payload: GetAccessProjectProductDtlParams) {
    const response = await http.web.formDataPost(
      '/api/projectManage/getAccessProjectProductDtl',
      payload,
      {
        showLoading: false,
      }
    );
    return response.data;
  }

  /**
   * 查询药事会信息
   * @param payload 查询参数
   * @returns 返回药事会信息
   */
  static async getYaoShiHui(payload: GetYaoShiHuiParams) {
    const response = await http.web.formDataPost('/api/projectManage/getYaoShiHui', payload);
    return response.data;
  }

  /**
   * 查询药事会信息列表
   * @param payload 查询参数
   * @returns 返回药事会信息列表
   */
  static async getYaoShiHuiList(payload: GetYaoShiHuiListParams) {
    const response = await http.web.formDataPost('/api/projectManage/getYaoShiHuiList', payload, {
      showLoading: false,
    });
    return response.data;
  }

  /**
   * 编辑当前状态
   * @param payload 更新参数
   * @returns 返回更新结果
   */
  static async updateStatus(payload: UpdateStatusParams) {
    const response = await http.web.post('/api/projectManage/updateStatus', payload);
    return response.data;
  }

  /**
   * 查询项目、产品筛选List
   * @param payload 查询参数
   * @returns 返回筛选列表
   */
  static async getProjectProductList(payload: BaseProjectParams) {
    const response = await http.web.formDataPost(
      '/api/projectManage/getProjectProductList',
      payload,
      {
        showLoading: false,
      }
    );
    return response.data;
  }

  /**
   * 查询准入-排名-按中心
   * @param payload 查询参数
   * @returns 返回按中心排名列表
   */
  static async getAccessProjectRankCenter(payload: BaseProjectWithOrgParams) {
    const response = await http.web.formDataPost(
      '/api/projectManage/getAccessProjectRankCenter',
      payload,
      {
        showLoading: false,
      }
    );
    return response.data;
  }

  /**
   * 查询准入-排名-按部门
   * @param payload 查询参数
   * @returns 返回按部门排名列表
   */
  static async getAccessProjectRankDept(payload: BaseProjectWithOrgParams) {
    const response = await http.web.formDataPost(
      '/api/projectManage/getAccessProjectRankDept',
      payload,
      {
        showLoading: false,
      }
    );
    return response.data;
  }

  /**
   * 查询准入-排名-按业务员
   * @param payload 查询参数
   * @returns 返回按业务员排名列表
   */
  static async getAccessProjectRankSaler(payload: BaseProjectWithOrgParams) {
    const response = await http.web.formDataPost(
      '/api/projectManage/getAccessProjectRankSaler',
      payload,
      {
        showLoading: false,
      }
    );
    return response.data;
  }

  /**
   * 查询准入项目产品政策
   * @param payload 查询参数
   * @returns 返回产品政策信息
   */
  static async getAccessProductPolicy(payload: GetAccessProductPolicyParams) {
    const response = await http.web.formDataPost(
      '/api/projectManage/getAccessProductPolicy',
      payload
    );
    return response.data;
  }

  /**
   * 查询深分项目总单数量
   * @param payload 查询参数
   * @returns 返回深分项目总单数量
   */
  static async getDeepProjectDocNum(payload: BaseProjectWithOrgParams) {
    const response = await http.web.formDataPost(
      '/api/projectManage/getDeepProjectDocNum',
      payload
    );
    return response.data;
  }

  /**
   * 查询深分项目总单列表-项目
   * @param payload 查询参数
   * @returns 返回深分项目总单列表
   */
  static async getDeepProjectDoc(payload: BaseProjectWithOrgParams) {
    const response = await http.web.formDataPost('/api/projectManage/getDeepProjectDoc', payload, {
      showLoading: false,
    });
    return response.data;
  }

  /**
   * 查询深分项目总单列表-部门
   * @param payload 查询参数
   * @returns 返回深分项目部门列表
   */
  static async getDeepProjectDocDept(payload: BaseProjectWithOrgParams) {
    const response = await http.web.formDataPost(
      '/api/projectManage/getDeepProjectDocDept',
      payload,
      {
        showLoading: false,
      }
    );
    return response.data;
  }

  /**
   * 查询深分项目筛选框
   * @param payload 查询参数
   * @returns 返回深分项目筛选选项
   */
  static async getDeepProjectSelect(payload: BaseProjectParams) {
    const response = await http.web.formDataPost(
      '/api/projectManage/getDeepProjectSelect',
      payload
    );
    return response.data;
  }

  /**
   * 查询深分项目排序-中心
   * @param payload 查询参数
   * @returns 返回深分项目按中心排序列表
   */
  static async getDeepProjectRankCenter(payload: BaseProjectWithOrgParams) {
    const response = await http.web.formDataPost(
      '/api/projectManage/getDeepProjectRankCenter',
      payload
    );
    return response.data;
  }

  /**
   * 查询深分项目排序-部门
   * @param payload 查询参数
   * @returns 返回深分项目按部门排序列表
   */
  static async getDeepProjectRankDept(payload: BaseProjectWithOrgParams) {
    const response = await http.web.formDataPost(
      '/api/projectManage/getDeepProjectRankDept',
      payload
    );
    return response.data;
  }

  /**
   * 查询深分项目政策
   * @param payload 查询参数
   * @returns 返回深分项目政策信息
   */
  static async getDeepProjectPolicy(payload: GetDeepProjectPolicyParams) {
    const response = await http.web.formDataPost(
      '/api/projectManage/getDeepProjectPolicy',
      payload,
      {
        showLoading: false,
      }
    );
    return response.data;
  }

  /**
   * 查询准入项目的产品池
   * @param payload 查询参数
   * @returns 返回产品池列表
   */
  static async getProducts(payload: GetProductsParams) {
    const response = await http.web.formDataPost('/api/projectManage/getProducts', payload, {
      showLoading: false,
    });
    return response.data;
  }
}
