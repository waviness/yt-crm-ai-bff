/**
 * 订单管理服务类
 * 提供订单管理相关的所有API接口
 */

export class OrderManageService {
  /**
   * 获取有订单的客户List以及订单信息
   * @param payload 查询参数
   * @returns 返回客户订单信息列表
   */
  static async customerOrderInfoList(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/OrderIntegrate/customerOrderInfoList', payload, {
      showLoading: false,
    });
    return response.data;
  }

  /**
   * 获取客户的所有订单
   * @param payload 查询参数
   * @returns 返回客户订单列表
   */
  static async getCstmOrderList(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/OrderIntegrate/getCstmOrderList', payload, {
      showLoading: false,
    });
    return response.data;
  }

  /**
   * 获取客户无锁控订单详情
   * @param payload 查询参数
   * @returns 返回订单详情
   */
  static async getCstmOrderDetail(payload: Record<string, any>) {
    const response = await http.wechat.get('/api/OrderIntegrate/getCstmOrderDetail', {
      params: payload,
      showLoading: false,
    });
    return response.data;
  }

  /**
   * 根据客户ID获取该客户的所有分支机构
   * @param payload 查询参数
   * @returns 返回分支机构列表
   */
  static async getConcatByCstmId(payload: Record<string, any>) {
    const response = await http.wechat.get('/api/OrderIntegrate/getConcatByCstmId', {
      params: payload,
      showLoading: false,
    });
    return response.data;
  }
}
