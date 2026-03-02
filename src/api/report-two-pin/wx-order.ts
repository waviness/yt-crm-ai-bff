export class WxOrderService {
  /**
   * @description: 查询订单总单
   * @param {*} payload
   */
  static async getOrderDoc(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/orderNew/getOrderDoc', payload, {
      showLoading: false,
    });
    return response.data;
  }

  /**
   * @description: 查询订单细单
   * @param {*} params
   */
  static async getOrderDtl(payload: Record<string, any>) {
    const response = await http.wechat.formDataPost('/api/orderNew/getOrderDtl', payload);
    return response.data;
  }
}
