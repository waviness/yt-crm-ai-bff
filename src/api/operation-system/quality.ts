/**
 * 质量审核相关 API 服务
 * 提供质量审核业务相关的所有接口调用
 */

export class QualityService {
  /**
   * 从PM4获取货品召回管理信息
   * @param params 查询参数
   * @returns 货品召回管理信息
   */
  static async getGspRecover(params: Record<string, any>) {
    const response = await http.web.post('/api/GoodsRecover/getGspRecover', params);
    return response.data;
  }
  /**
   * 处理货品召回-拟召回数量和上传图片
   * @param params 查询参数
   * @returns 货品召回管理信息
   */
  static async dealGspRecover(params: Record<string, any>) {
    const response = await http.web.post('/api/GoodsRecover/dealGspRecover', params);
    return response.data;
  }
  /**
   * 获取包含召回信息的客户信息
   * @param params 查询参数
   * @returns 包含召回信息的客户列表
   */
  static async getCustomList(params: Record<string, any>) {
    const response = await http.web.post('/api/GoodsRecover/getCustomList', params);
    return response.data;
  }
  /**
   * 通过 CgrId 获取货品召回详情
   * @param params { CgrId: string | number }
   * @returns 货品召回详情
   */
  static async getGspRecoverDtlByCgrId(params: Record<string, any>) {
    // 假设 http.web 同样支持 formData 格式，若不支持需根据实际底层封装调整
    const response = await http.web.formDataPost(
      '/api/GoodsRecover/getGspRecoverDtlByCgrId',
      params
    );
    return response.data;
  }

  /**
   * 获取货品质量复查信息
   * @param params 查询参数
   * @returns 质量复查列表
   */
  static async getQualityRecheckList(params: Record<string, any>) {
    const response = await http.web.post('/api/GoodsQualityRecheck/getQualityRecheckList', params);
    return response.data;
  }

  /**
   * 获取货品质量复查信息详情
   * @param params 查询参数
   * @returns 质量复查详情
   */
  static async getQualityRecheckDetail(params: Record<string, any>) {
    const response = await http.web.get('/api/GoodsQualityRecheck/getQualityRecheckDetail', {
      params: params,
    });
    return response.data;
  }

  /**
   * 处理货品质量复查信息
   * @param params 处理参数
   * @returns 处理结果
   */
  static async dealQualityRecheck(params: Record<string, any>) {
    const response = await http.web.post('/api/GoodsQualityRecheck/dealQualityRecheck', params);
    return response.data;
  }
}
