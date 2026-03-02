/**
 * VBP 相关 API 服务
 * 提供 VBP 业务相关的所有接口调用
 */

export class VbpService {
  /**
   * 查询业务员列表
   * @param params 查询参数
   * @returns 业务员列表
   */
  static async queryPm4Sales(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/vbp/queryPm4Sales', params);
    return response.data;
  }

  /**
   * 查询医院政策列表
   * @param params 查询参数
   * @returns 医院政策列表
   */
  static async queryHospitalPolicyList(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/vbp/queryHospitalPolicyList', params);
    return response.data;
  }

  /**
   * 查询医院政策详情
   * @param params 查询参数
   * @returns 医院政策详情
   */
  static async queryHospitalPolicyDetail(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/vbp/queryHospitalPolicyDetail', params);
    return response.data;
  }

  /**
   * 查询供应商医院列表
   * @param params 查询参数
   * @returns 供应商医院列表
   */
  static async querySupplierHospitalList(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/vbp/querySupplierHospitalList', params);
    return response.data;
  }

  /**
   * 查询非中标品种
   * @param params 查询参数
   * @returns 非中标品种列表
   */
  static async queryUnVBPGoods(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/vbp/queryUnVBPGoods', params);
    return response.data;
  }

  /**
   * 查询VBP品种详情
   * @param params 查询参数
   * @returns VBP品种详情
   */
  static async queryVBPGoodsDetail(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/vbp/queryVBPGoodsDetail', params);
    return response.data;
  }

  /**
   * 查询拜访任务品种详情
   * @param params 查询参数
   * @returns 拜访任务品种详情
   */
  static async queryVisitGoodsDetail(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/vbp/queryVisitGoodsDetail', params);
    return response.data;
  }

  /**
   * 查询拜访任务品种列表
   * @param params 查询参数
   * @returns 拜访任务品种列表
   */
  static async queryVisitGoodsList(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/vbp/queryVisitGoodsList', params);
    return response.data;
  }

  /**
   * 添加医院政策详情
   * @param params 添加参数
   * @returns 添加结果
   */
  static async addHospitalPolicyDetail(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/vbp/addHospitalPolicyDetail', params);
    return response.data;
  }

  /**
   * 添加非中标品种
   * @param params 添加参数
   * @returns 添加结果
   */
  static async addUnVBPGoods(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/vbp/addUnVBPGoods', params);
    return response.data;
  }

  /**
   * 添加非中标品种详情
   * @param params 添加参数
   * @returns 添加结果
   */
  static async addUnVBPGoodsDetail(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/vbp/addUnVBPGoodsDetail', params);
    return response.data;
  }

  /**
   * 添加VBP品种详情
   * @param params 添加参数
   * @returns 添加结果
   */
  static async addVBPGoodsDetail(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/vbp/addVBPGoodsDetail', params);
    return response.data;
  }

  /**
   * 添加拜访任务品种详情
   * @param params 添加参数
   * @returns 添加结果
   */
  static async addVisitGoodsDetail(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/vbp/addVisitGoodsDetail', params);
    return response.data;
  }

  /**
   * 删除非中标品种详情
   * @param params 删除参数
   * @returns 删除结果
   */
  static async deleteUnVBPGoodsDetail(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/vbp/deleteUnVBPGoodsDetail', params);
    return response.data;
  }
}
