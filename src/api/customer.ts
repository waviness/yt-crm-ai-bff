import http from '@/utils/http';

/**
 * @description 客户服务
 */
export class CustomerService {
  /**
   * @description: 查询客户单位信息
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async queryCustomInfoList(params: Record<string, any>): Promise<any> {
    const response = await http.web.post('/api/custom/query', params, { showLoading: false });
    return response.data;
  }

  /**
   * @description: 编辑客户单位信息
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async updateCustomInfo(params: Record<string, any>): Promise<any> {
    const response = await http.web.post('/api/custom/update', params);
    return response.data;
  }

  /**
   * @description: 批量编辑客户单位信息
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async updateCustomInfoList(params: Record<string, any>): Promise<any> {
    const response = await http.web.post('/api/custom/updateList', params);
    return response.data;
  }

  /**
   * @description: 查询分享列表
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async queryShareList(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/custom/queryShareList', params);
    return response.data;
  }

  /**
   * @description: 查询可分享用户
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async queryShareCust(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/custom/queryShareCust', params);
    return response.data;
  }

  /**
   * @description: 分享客户单位信息
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async share(params: Record<string, any>): Promise<any> {
    const response = await http.web.post('/api/custom/share', params);
    return response.data;
  }

  /**
   * @description: 修改分享
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async updateShare(params: Record<string, any>): Promise<any> {
    const response = await http.web.post('/api/custom/updateShare', params);
    return response.data;
  }

  /**
   * @description: 取消分享客户单位信息
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async delectShare(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/custom/delectShare', params);
    return response.data;
  }

  /**
   * @description: 是否允许修改科室角色
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async isAllowUpdateOrgRole(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/custom/isAllowUpdateOrgRole', params);
    return response.data;
  }

  /**
   * @description: 是否允许添加人员
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async isAllowAddPerson(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/custom/isAllowAddPerson', params);
    return response.data;
  }

  /**
   * @description: 查询人员列表
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async queryPersonList(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/custom/queryPersonList', params);
    return response.data;
  }

  /**
   * @description: 查询人员信息
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async queryPerson(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/custom/queryPerson', params);
    return response.data;
  }

  /**
   * @description: 新增人员信息
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async addPerson(params: Record<string, any>): Promise<any> {
    const response = await http.web.post('/api/custom/addPerson', params);
    return response.data;
  }

  /**
   * @description: 修改人员信息
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async updatePerson(params: Record<string, any>): Promise<any> {
    const response = await http.web.post('/api/custom/updatePerson', params);
    return response.data;
  }

  /**
   * @description: 删除人员信息
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async delectPerson(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/custom/delectPerson', params);
    return response.data;
  }

  /**
   * @description: 转职
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async personTransfer(params: Record<string, any>): Promise<any> {
    const response = await http.web.post('/api/custom/personTransfer', params);
    return response.data;
  }

  /**
   * @description: 查询pm4客户列表
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async queryPM4CustList(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/custom/queryPM4CustList', params);
    return response.data;
  }

  /**
   * @description: 查询客户科室角色列表
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async queryOrgRoleList(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/custom/queryOrgRoleList', params);
    return response.data;
  }

  /**
   * @description: 查询分享人员列表
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async querySharePersonList(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/custom/querySharePersonList', params);
    return response.data;
  }

  /**
   * @description: 查询人员可分享用户
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async queryPersonShareUser(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/custom/queryPersonShareUser', params);
    return response.data;
  }

  /**
   * @description: 分享人员信息
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async sharePerson(params: Record<string, any>): Promise<any> {
    const response = await http.web.post('/api/custom/sharePerson', params);
    return response.data;
  }

  /**
   * @description: 修改分享人员
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async updateSharePerson(params: Record<string, any>): Promise<any> {
    const response = await http.web.post('/api/custom/updateSharePerson', params);
    return response.data;
  }

  /**
   * @description: 取消分享人员信息
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async delectSharePerson(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/custom/delectSharePerson', params);
    return response.data;
  }

  /**
   * @description: 客情资料库 - 查询客户信息
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async queryCustViewInfo(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/customView/queryCust', params);
    return response.data;
  }

  /**
   * @description: 客情资料库 - 查询客情事件数据统计
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async queryCustEventCount(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/customView/queryCustEventCount', params);
    return response.data;
  }

  /**
   * @description: 客情资料库 - 查询标签
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async queryLabel(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/customView/queryLabel', params);
    return response.data;
  }

  /**
   * @description: 查询客户列表
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async queryCustList(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/customView/queryCustList', params);
    return response.data;
  }

  /**
   * @description: 客情资料库 - 查询客情事件
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async queryCustEvent(params: Record<string, any>): Promise<any> {
    const response = await http.web.post('/api/customView/queryCustEvent', params);
    return response.data;
  }

  /**
   * @description: 客情资料库 - 查询人员列表
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async queryViewPersonList(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/customView/queryPersonList', params);
    return response.data;
  }

  /**
   * @description: 客情资料库 - 查询人员详情
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async queryPersonDetail(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/customView/queryPersonDetail', params);
    return response.data;
  }

  /**
   * @description: 客情资料库 - 查询客户排名
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async queryCustRank(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/customView/queryCustRank', params);
    return response.data;
  }

  /**
   * @description: 重点/项目客户 - 查询客户列表
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async queryGridCustList(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/custGrid/queryCust', params);
    return response.data;
  }

  /**
   * @description: 重点/项目客户 - 领导查询
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async queryByLeader(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/custGrid/queryByLeader', params);
    return response.data;
  }

  /**
   * @description: 重点/项目客户 - 业务查询
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async queryBusiness(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/custGrid/queryBusiness', params);
    return response.data;
  }

  /**
   * @description: 重点/项目客户 - 话题查询
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async queryTopic(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/custGrid/queryTopic', params);
    return response.data;
  }

  /**
   * @description: 重点/项目客户 - 查询计划列表
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async queryPlanListByPage(params: Record<string, any>): Promise<any> {
    const response = await http.web.post('/api/custGrid/queryPlanListByPage', params);
    return response.data;
  }

  /**
   * @description: 重点/项目客户 - 添加计划
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async addPlan(params: Record<string, any>): Promise<any> {
    const response = await http.web.post('/api/custGrid/addPlan', params);
    return response.data;
  }

  /**
   * @description: 重点/项目客户 - 修改计划
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async modifyPlan(params: Record<string, any>): Promise<any> {
    const response = await http.web.post('/api/custGrid/modifyPlan', params);
    return response.data;
  }

  /**
   * @description: 重点/项目客户 - 删除计划
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async delPlan(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/custGrid/delPlan', params);
    return response.data;
  }

  /**
   * @description: 重点/项目客户 - 查询目标列表
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async queryTargetListByPage(params: Record<string, any>): Promise<any> {
    const response = await http.web.post('/api/custGrid/queryTargetListByPage', params);
    return response.data;
  }

  /**
   * @description: 重点/项目客户 - 添加目标
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async addTarget(params: Record<string, any>): Promise<any> {
    const response = await http.web.post('/api/custGrid/addTarget', params);
    return response.data;
  }

  /**
   * @description: 重点/项目客户 - 修改目标
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async modifyTarget(params: Record<string, any>): Promise<any> {
    const response = await http.web.post('/api/custGrid/modifyTarget', params);
    return response.data;
  }

  /**
   * @description: 重点/项目客户 - 删除目标
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async delTarget(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/custGrid/delTarget', params);
    return response.data;
  }

  /**
   * @description: 重点/项目客户 - 查询人员
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async queryGridPerson(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/custGrid/queryPerson', params);
    return response.data;
  }

  /**
   * @description: 重点/项目客户 - 推送网格管理消息
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async pushGridMsg(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/custGrid/pushGridMsg', params);
    return response.data;
  }

  /**
   * @description: 重点/项目客户 - 查询推送的网格管理消息
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async queryPushGridMsg(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/custGrid/queryPushGridMsg', params);
    return response.data;
  }

  /**
   * @description: 重点/项目客户 - 增长查询
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async queryIncrease(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/custGrid/queryIncrease', params);
    return response.data;
  }

  /**
   * @description: 重点/项目客户 - 查询客户业务员品种
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async queryGoods(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/custGrid/queryGoods', params);
    return response.data;
  }

  /**
   * @description: 重点/项目客户 - 查询网络层级品种列表
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async queryGridGoodsListByPage(params: Record<string, any>): Promise<any> {
    const response = await http.web.post('/api/custGrid/queryGridGoodsListByPage', params);
    return response.data;
  }

  /**
   * @description: 重点/项目客户 - 添加网络层级品种
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async addGridGoods(params: Record<string, any>): Promise<any> {
    const response = await http.web.post('/api/custGrid/addGridGoods', params);
    return response.data;
  }

  /**
   * @description: 重点/项目客户 - 删除网络层级品种
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async delGridGoods(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/custGrid/delGridGoods', params);
    return response.data;
  }

  /**
   * @description: 领导驾驶舱 - 查询"营运二级分类"第二种分类下排名前10的客户
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async queryTopTenCustomers(params: Record<string, any>): Promise<any> {
    const response = await http.web.post('/api/cockpit/queryTopTenCustomers', params);
    return response.data;
  }

  /**
   * @description: 领导驾驶舱 - 查询最新客情
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async getUserVisit(params: Record<string, any>): Promise<any> {
    const response = await http.web.post('/api/cockpit/getUserVisit', params);
    return response.data;
  }

  /**
   * @description: 领导驾驶舱 - 查询客户列表
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async cockpitQueryCustList(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/cockpit/queryCustList', params);
    return response.data;
  }

  /**
   * @description: 领导驾驶舱 - 查询客情事件数据统计
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async cockpitQueryCustEventCount(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/cockpit/queryCustEventCount', params);
    return response.data;
  }

  /**
   * @description: 领导驾驶舱 - 查询人员列表
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async cockpitQueryPersonList(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/cockpit/queryPersonList', params);
    return response.data;
  }

  /**
   * @description: 领导驾驶舱 - 查询客情事件
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async cockpitQueryCustEvent(params: Record<string, any>): Promise<any> {
    const response = await http.web.post('/api/cockpit/queryCustEvent', params);
    return response.data;
  }

  /**
   * @description: 领导驾驶舱 - 查询客情信息
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async queryCustView(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/cockpit/queryCustView', params);
    return response.data;
  }

  /**
   * @description: 领导驾驶舱 - 查询首页增速
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async queryHomeRate(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/cockpit/queryHomeRate', params);
    return response.data;
  }

  /**
   * @description: 领导驾驶舱 - 查询增速榜单
   * @param {Record<string, any>} params 请求参数
   * @returns {Promise<any>}
   */
  static async queryGrowthRate(params: Record<string, any>): Promise<any> {
    const response = await http.web.formDataPost('/api/cockpit/queryGrowthRate', params);
    return response.data;
  }
}
