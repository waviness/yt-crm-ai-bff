/**
 * 数据中心服务类
 * 提供数据中心相关的所有API接口
 */
export class DataCenterService {
  /**
   * 获取所选部门任务督办列表
   * @param params 查询参数
   * @returns 返回督办订单列表
   */
  static async getSynergiaOrderList(params: Record<string, any>) {
    const response = await http.bigdata.post('/api/SynergiaOrder/getSynergiaOrderList', params, {
      showLoading: false,
    });
    console.log('response', response.data);
    return response.data.data;
  }

  /**
   * 获取发起的任务督办详情
   * @param params 查询参数
   * @returns 返回督办订单详情
   */
  static async getSendSynergiaOrderDetail(params: Record<string, any>) {
    const response = await http.bigdata.formDataPost(
      '/api/SynergiaOrder/getSendSynergiaOrderDetail',
      params
    );
    return response.data;
  }

  /**
   * 获取收到的任务督办详情
   * @param params 查询参数
   * @returns 返回督办订单详情
   */
  static async getReceiveSynergiaOrderDetail(params: Record<string, any>) {
    const response = await http.bigdata.formDataPost(
      '/api/SynergiaOrder/getReceiveSynergiaOrderDetail',
      params
    );
    return response.data;
  }

  /**
   * 提交督办订单回执
   * @param params 回执参数
   * @returns 返回提交结果
   */
  static async receiptSynergiaOrder(params: Record<string, any>) {
    const response = await http.bigdata.formDataPost(
      '/api/SynergiaOrder/receiptSynergiaOrder',
      params
    );
    return response.data;
  }
}
