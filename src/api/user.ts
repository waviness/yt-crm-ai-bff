/**
 * 留言建议、用户打卡服务类
 */
export class UserService {
  /**
   * 建议提交接口
   * @param payload 留言建议参数
   * @returns 返回建议提交接口的响应结果
   */
  static async insertSuggestion(payload: Record<string, string>) {
    const response = await http.wechat.post('/api/suggestion/insertSuggestion', payload);
    return response.data;
  }
  /**
   * 建议查询接口
   * @param payload 建议查询参数
   * @returns 返回建议查询接口的响应结果
   */
  static async querySuggestion(payload: Record<string, string | number>) {
    const response = await http.wechat.post('/api/suggestion/querySuggestion', payload, {
      showLoading: false,
    });
    return response.data;
  }

  /**
   * 获取CRM用户打卡信息
   * @param payload 获取CRM用户打卡信息参数
   * @returns 获取CRM用户打卡信息接口的响应结果
   */
  static async getCrmClockIn(payload: Record<string, number | boolean>) {
    const response = await http.web.post('/api/UserVisit/getCrmClockIn', payload, {
      showLoading: false,
    });
    return response.data;
  }
}
