/**
 * 消息服务类
 */
export class MessageService {
  /**
   * 获取CRM消息列表
   * @param payload 获取CRM消息列表的参数对象
   * @returns 获取CRM消息列表的响应结果
   */
  static async getCrmMessageList(payload: Record<string, string>) {
    const response = await http.web.post('/api/message/getCrmMessageList', payload, {
      showLoading: false,
    });
    return response.data;
  }

  /**
   * 获取未读消息数量
   * @returns 获取未读消息数量的响应结果
   */
  static async getUnReadCount(payload: Record<string, string>) {
    const response = await http.web.formDataPost('/api/message/getUnReadCount', payload);
    return response.data;
  }

  /**
   * 已读消息
   * @returns 返回已读消息请求的响应结果
   */
  static async readMessage(payload: Record<string, string>) {
    const response = await http.web.get('/api/message/readMessage', { params: payload });
    return response.data;
  }
}
