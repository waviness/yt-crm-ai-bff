/**
 * 销退管理服务
 * 提供销退人员查询、列表查询、详情查询及提交销退点单等相关API
 */
export class SalesReturnService {
  /**
   * 查询pm4人员
   * @param params 查询参数
   * @returns Promise<any> 人员数据
   */
  static async queryPm4User(params: any) {
    const response = await http.web.post('/api/saleReturn/queryPm4User', params);
    return response.data;
  }

  /**
   * 查询销退列表
   * @param params 查询参数
   * @returns Promise<any> 销退列表数据
   */
  static async querySaleReturnList(params: any) {
    // 这里的 true 映射为 showLoading: true
    const response = await http.web.formDataPost('/api/saleReturn/querySaleReturnList', params, {
      showLoading: true,
    });
    return response.data;
  }

  /**
   * 查询销退详情
   * @param params 查询参数
   * @returns Promise<any> 销退详情数据
   */
  static async querySaleReturnDetail(params: any) {
    const response = await http.web.formDataPost('/api/saleReturn/querySaleReturnDetail', params);
    return response.data;
  }

  /**
   * 提交销退点单
   * @param params 提交参数
   * @returns Promise<any> 提交结果
   */
  static async submitSaleReturn(params: any) {
    const response = await http.web.formDataPost('/api/saleReturn/submitSaleReturn', params);
    return response.data;
  }
}
