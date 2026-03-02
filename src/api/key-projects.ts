/**
 * 重点项目相关API
 */
import http from '@/utils/http';

export class KeyProjectsService {
  /**
   * 查询网格客户列表
   * @param params
   */
  static async queryGridCustList(params: any) {
    const response = await http.web.formDataPost('/api/custGrid/queryCust', params);
    return response;
  }

  /**
   * 根据领导查询
   * @param params
   */
  static async queryByLeader(params: any) {
    const response = await http.web.formDataPost('/api/custGrid/queryByLeader', params);
    return response;
  }

  /**
   * 查询业务信息
   * @param params
   */
  static async queryBusiness(params: any) {
    const response = await http.web.formDataPost('/api/custGrid/queryBusiness', params);
    return response;
  }

  /**
   * 查询增速
   * @param params
   */
  static async queryIncrease(params: any) {
    const response = await http.web.formDataPost('/api/custGrid/queryIncrease', params);
    return response;
  }

  /**
   * 查询话题列表
   * @param params
   */
  static async queryTopic(params: any) {
    const response = await http.web.formDataPost('/api/custGrid/queryTopic', params);
    return response;
  }

  /**
   * 发送网格消息
   * @param params
   */
  static async pushGridMsg(params: any) {
    const response = await http.web.formDataPost('/api/custGrid/pushGridMsg', params);
    return response;
  }

  /**
   * 查询GR计划列表
   * @param params
   */
  static async queryPlanListByPage(params: any) {
    const response = await http.web.post('/api/custGrid/queryPlanListByPage', params);
    return response;
  }

  /**
   * 查询目标任务列表
   * @param params
   */
  static async queryTargetListByPage(params: any) {
    const response = await http.web.post('/api/custGrid/queryTargetListByPage', params);
    return response;
  }

  /**
   * 查询目标品种列表
   * @param params
   */
  static async queryGridGoodsListByPage(params: any) {
    const response = await http.web.post('/api/custGrid/queryGridGoodsListByPage', params);
    return response;
  }

  /**
   * 新增GR计划
   * @param params
   */
  static async addPlan(params: any) {
    const response = await http.web.post('/api/custGrid/addPlan', { params });
    return response;
  }

  /**
   * 修改GR计划
   * @param params
   */
  static async modifyPlan(params: any) {
    const response = await http.web.post('/api/custGrid/modifyPlan', { params });
    return response;
  }

  /**
   * 删除GR计划
   * @param params
   */
  static async delPlan(params: any) {
    const response = await http.web.formDataPost('/api/custGrid/delPlan', params);
    return response;
  }

  /**
   * 新增目标任务
   * @param params
   */
  static async addTarget(params: any) {
    const response = await http.web.post('/api/custGrid/addTarget', { params });
    return response;
  }

  /**
   * 修改目标任务
   * @param params
   */
  static async modifyTarget(params: any) {
    const response = await http.web.post('/api/custGrid/modifyTarget', { params });
    return response;
  }

  /**
   * 删除目标任务
   * @param params
   */
  static async delTarget(params: any) {
    const response = await http.web.formDataPost('/api/custGrid/delTarget', params);
    return response;
  }

  /**
   * 新增目标品种
   * @param params
   */
  static async addGridGoods(params: any) {
    const response = await http.web.post('/api/custGrid/addGridGoods', { params });
    return response;
  }

  /**
   * 删除目标品种
   * @param params
   */
  static async delGridGoods(params: any) {
    const response = await http.web.formDataPost('/api/custGrid/delGridGoods', params);
    return response;
  }

  /**
   * 查询网格人员
   * @param params
   */
  static async queryGridPerson(params: any) {
    const response = await http.web.formDataPost('/api/custGrid/queryGridPerson', params);
    return response;
  }

  /**
   * 查询货品
   * @param params
   */
  static async queryGoods(params: any) {
    const response = await http.web.formDataPost('/api/custGrid/queryGoods', params);
    return response;
  }
}
