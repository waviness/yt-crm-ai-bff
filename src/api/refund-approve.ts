/**
 * 多仓销售退审批服务
 * 提供多仓销售退审批列表查询、详情查询及订单审批等相关API
 */
export class RefundApproveService {
  /**
   * 查询多仓销售退审批列表
   * @param params 查询参数
   * @returns Promise<any> 审批列表数据
   */
  static async query(params: any) {
    // 这里的 true 映射为 showLoading: true
    const response = await http.wechat.post('/api/crmStoreSellBackApproval/query', params, {
      showLoading: true,
    });
    return response.data;
  }

  /**
   * 查询多仓销售退审批详情
   * @param params 查询参数
   * @returns Promise<any> 审批详情数据
   */
  static async queryOrder(params: any) {
    const response = await http.wechat.formDataPost(
      '/api/crmStoreSellBackApproval/queryOrder',
      params
    );
    return response.data;
  }

  /**
   * 审批多仓销售退货订单
   * @param params 审批操作参数
   * @returns Promise<any> 审批结果
   */
  static async operationForEmergencyOrder(params: any) {
    const response = await http.wechat.formDataPost(
      '/api/crmStoreSellBackApproval/approval',
      params
    );
    return response;
  }
}
