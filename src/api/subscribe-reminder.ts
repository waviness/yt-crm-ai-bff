/**
 * 订阅提醒服务类
 * 提供订阅提醒相关的所有API接口
 */

export class SubscribeReminderService {
  /**
   * 获取可订阅品种List
   * @param payload 查询参数
   * @returns 返回可订阅品种列表
   */
  static async getCanSubGoodsList(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/SubscribeArrive/getCanSubGoodsList', payload, {
      showLoading: false,
    });
    return response.data;
  }

  /**
   * 获取订阅到货/到票List
   * @param payload 查询参数
   * @returns 返回订阅到货/到票列表
   */
  static async getSubscribeArriveList(payload: Record<string, any>) {
    const response = await http.wechat.post(
      '/api/SubscribeArrive/getSubscribeArriveList',
      payload,
      {
        showLoading: false,
      }
    );
    return response.data;
  }

  /**
   * 激活订阅
   * @param payload 激活参数
   * @returns 返回激活结果
   */
  static async activeSubscribe(payload: Record<string, any>) {
    const response = await http.wechat.get('/api/SubscribeArrive/activeSubscribe', {
      params: payload,
    });
    return response.data;
  }

  /**
   * 取消订阅
   * @param payload 取消参数
   * @returns 返回取消结果
   */
  static async unsubscribe(payload: Record<string, any>) {
    const response = await http.wechat.get('/api/SubscribeArrive/unsubscribe', {
      params: payload,
    });
    return response.data;
  }

  /**
   * 订阅到货/到票提醒
   * @param payload 订阅参数
   * @returns 返回订阅结果
   */
  static async subscribeArrive(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/SubscribeArrive/subscribeArrive', payload);
    return response.data;
  }
}
