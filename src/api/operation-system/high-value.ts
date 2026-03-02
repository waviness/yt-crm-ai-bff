/**
 * 高值品种推送相关 API 服务
 * 提供高值品种推送业务相关的所有接口调用
 */

export class HighValueService {
  /**
   * 获取高值品种推送List-wx
   * @param params 查询参数
   * @returns 高值品种推送列表
   */
  static async getToSalerListWx(params: Record<string, any>) {
    const response = await http.wechat.post('/api/WxHighvalue/getToSalerListWx', params);
    return response.data;
  }
  /**
   * 采购获取高值品种推送List-wx
   * @param params 查询参数
   * @returns 高值品种推送列表
   */
  static async getToSalerListSupplyerWx(params: Record<string, any>) {
    const response = await http.wechat.post('/api/WxHighvalue/getToSalerListSupplyerWx', params);
    return response.data;
  }
  /**
   * 获取高值品种推送详情-wx
   * @param params 查询参数
   * @returns 高值品种推送详情
   */
  static async getToSalerDetailWx(params: Record<string, any>) {
    const response = await http.wechat.get('/api/WxHighvalue/getToSalerDetail', {
      params: params,
    });
    return response.data;
  }
  /**
   * 更改细单状态为已确认
   * @param params 查询参数
   * @returns 高值品种推送详情
   */
  static async feedback(params: Record<string, any>) {
    const response = await http.wechat.post('/api/WxHighvalue/feedback', params);
    return response.data;
  }
}
