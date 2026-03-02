/**
 * 微信锁控服务类
 * 提供微信锁控相关的所有API接口
 */

export class WxLockService {
  /**
   * 查询微信锁控列表
   * @param payload 查询参数
   * @returns 返回微信锁控列表
   */
  static async getLockDoc(payload: Record<string, any>) {
    const response = await http.web.post('/api/crmLockReport/getLockDoc', payload, {
      showLoading: false,
    });
    return response.data;
  }
  /**
   * 查询核算单元列表
   * @param payload 查询参数
   * @returns 返回核算单元列表
   */
  static async getEntrys(payload: Record<string, any>) {
    const response = await http.web.formDataPost('/api/crmLockReport/getEntrys', payload, {
      showLoading: false,
    });
    return response.data;
  }
  /**
   * 查询核算单元列表
   * @param payload 查询参数
   * @returns 返回核算单元列表
   */
  static async getLockDtl(payload: Record<string, any>) {
    const response = await http.web.formDataPost('/api/crmLockReport/getLockDtl', payload, {
      showLoading: false,
    });
    return response.data;
  }
  /**
   * 查询锁控处理意见
   * @param payload 查询参数
   * @returns 返回锁控处理意见
   */
  static async getLockRecord(payload: Record<string, any>) {
    const response = await http.web.formDataPost('/api/crmLockReport/getLockRecord', payload, {
      showLoading: false,
    });
    return response.data;
  }
}
