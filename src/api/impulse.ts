/**
 * 冲差管理服务
 * 提供冲差总单、细单查询、图片上传、确认提交等相关API
 */
export class ImpulseService {
  /**
   * 查询冲差总单
   * @param params 查询参数
   * @returns Promise<any> 冲差总单数据
   */
  static async queryGoodsCC(params: any) {
    const response = await http.web.post('/api/goodsCC/query', params, { showLoading: false });
    return response.data;
  }

  /**
   * 查询冲差细单
   * @param params 查询参数
   * @returns Promise<any> 冲差细单数据
   */
  static async queryCCDtl(params: any) {
    const response = await http.web.formDataPost('/api/goodsCC/queryCCDtl', params);
    return response.data;
  }

  /**
   * 冲差细单图片上传
   * @param params 上传参数
   * @returns Promise<any> 上传结果
   */
  static async updateCCFile(params: any) {
    const response = await http.web.post('/api/goodsCC/updateFile', params, { showLoading: false });
    return response.data;
  }

  /**
   * 细单确认
   * @param params 确认参数
   * @returns Promise<any> 确认结果
   */
  static async submitGoodsCC(params: any) {
    const response = await http.web.formDataPost('/api/goodsCC/submit', params);
    return response.data;
  }

  /**
   * 查询冲差未处理数量
   * @param params 查询参数
   * @returns Promise<any> 未处理数量
   */
  static async queryCCCount(params: any) {
    const response = await http.web.formDataPost('/api/goodsCC/queryCount', params, {
      showLoading: false,
    });
    return response.data;
  }
}
