export class ShopCartService {
  /**
   * @description: 修改购物车数量 -- 二销
   * @param {*} params
   */
  static async updateCartsQty(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/cart/updateCartsQty', payload);
    return response;
  }
  /**
   * @description: 修改购物车数量 -- 报货单
   * @param {*} params
   */
  static async updateCartsQtySaler(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/cart/updateCartsQtySaler', payload);
    return response;
  }

  /**
   * @description: 删除购物车
   * @param {*} params
   */
  static async delCart(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/cart/delCart', payload);
    return response;
  }

  /**
   * @description: 查询购物车 -- 二销
   * @param {*} params
   */
  static async queryCart(payload: Record<string, any>) {
    const response = await http.wechat.formDataPost('/api/cart/queryCart', payload);
    return response;
  }
  /**
   * @description: 下单前预校验 - 二销
   * @param {*} params
   */
  static async preCreateInvoice(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/order/preCreateInvoice', payload);
    return response;
  }

  /**
   * @description: 生成订单 -- 二销
   * @param {*} params
   */
  static async createInvoice(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/orderNew/createInvoice', payload);
    return response;
  }
  /**
   * @description: 添加购物车 -- 二销
   * @param {*} params
   */
  static async addCart(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/cart/addCart', payload);
    return response;
  }
  /**
   * @description: 添加购物车 -- 报货单
   * @param {*} params
   */
  static async addCartSaler(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/cart/addCartSaler', payload);
    return response;
  }
  /**
   * @description: 查询购物车 -- 报货单
   * @param {*} params
   */
  static async queryCartSaler(payload: Record<string, any>) {
    const response = await http.wechat.formDataPost('/api/cart/queryCartSaler', payload);
    return response;
  }
  /**
   * @description: 下单前预校验 - 报货单
   * @param {*} params
   */
  static async preCreateInvoiceSaler(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/order/preCreateInvoiceSaler', payload);
    return response;
  }
  /**
   * @description: 生成订单 -- 报货单
   * @param {*} params
   */
  static async createInvoiceSaler(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/orderNew/createInvoiceSaler', payload);
    return response;
  }

  /**
   * @description: 查询物流中心
   * @param {*} params
   */
  static async getWmsCenter(payload: Record<string, any>) {
    return await http.wechat.formDataPost('/api/order/getWmsCenter', payload);
  }
}
