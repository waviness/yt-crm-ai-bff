/**
 * 急救补单相关接口
 */
export class FirstaidService {
  /**
   * @description: 急救补单查询
   * @param {*} params
   */
  static async getEmergencyOrderInfo(params: any) {
    return await http.wechat.post('api/emergencyOrder/getEmergencyOrderInfo', {
      ...params,
      showLoading: false,
    });
  }
  /**
   * @description: 急救补单详情
   * @param {*} params
   */
  static async emergencyOrderMatchDetail(params: any) {
    return await http.wechat.post('/api/emergencyOrder/emergencyOrderMatchDetail', params);
  }

  /**
   * @description: 急救补单作废/回退
   * @param {*} params
   */
  static async operationForEmergencyOrder(params: any) {
    return await http.wechat.post('/api/emergencyOrder/operationForEmergencyOrder', params);
  }

  /**
   * @description: 急救补单重置
   * @param {*} params
   */
  static async emergencyOrderMatchReset(params: any) {
    return await http.wechat.post('/api/emergencyOrder/emergencyOrderMatchReset', params);
  }

  /**
   * @description: 急救补单匹配
   * @param {*} params
   */
  static async emergencyOrderMatchSubmit(params: any) {
    return await http.wechat.post('/api/emergencyOrder/emergencyOrderMatchSubmit', params);
  }
}
