export class ConfirmationLetterService {
  /**
   * @description: 询证函条件查询
   * @param params 查询参数
   * @returns 返回确认函列表
   */
  static async getConfirmationRequestList(payload: Record<string, any>) {
    return await http.wechat.post('/api/task/getConfirmationRequestList', payload, {
      showLoading: false,
    });
  }

  /**
   * @description: 获取逾期取证列表
   * @param {*} params
   */
  static async exceedTimeLimitTask(params: { pageNum: number; pageSize: number }) {
    return await http.wechat.get('/api/task/exceedTimeLimitTask', { params, showLoading: false });
  }

  /**
   * @description: 更新询证函状态
   * @param {*} params
   */
  static async updateConfirmationRequestStatue(params: any) {
    return await http.wechat.get('/api/task/updateConfirmationRequestStatue', { params });
  }

  /**
   * @description: 加载询证函图片
   * @param params 下载参数
   * @returns 返回图片URL列表
   */
  static async downloadConfirmationRequestPictures(payload: Record<string, any>) {
    return await http.wechat.post('/api/task/downloadConfirmationRequestPictures', payload);
  }

  /**
   * @description: 查询业务员发起过的询证函
   * @param params 查询参数
   * @returns 返回发起的询证函列表
   */
  static async initiatedConfirmationRequest(payload: Record<string, any>) {
    return await http.wechat.get('/api/task/initiatedConfirmationRequest', {
      params: payload,
      showLoading: false,
    });
  }

  /**
   * @description: 财务处理发起过的询证函
   * @param {*} params
   */
  static async handleConfirmationRequest(ccrId: number, params: { replyRemark: string }) {
    return await http.wechat.putGet(`/api/task/handleConfirmationRequest/${ccrId}`, { params });
  }
}
