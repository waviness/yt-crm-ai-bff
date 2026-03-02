export class FinalKnotService {
  /**
   * @description: 获取末次结款列表
   * @param {*} params
   */
  static async getAllFinalPaymentOrderItem(params: any) {
    return await http.wechat.post('/api/webFinalPayment/docList', params, { showLoading: false });
  }

  /**
   * @description: 获取末次结款细单列表
   * @param {*} params
   */
  static async getdtlList(params: any) {
    return await http.wechat.post('/api/webFinalPayment/dtlList', params, { showLoading: false });
  }
  /**
   * @description: 更改细单状态为已确认
   * @param {*} params
   */
  static async updateDtl(params: any) {
    return await http.wechat.post('/api/webFinalPayment/updateDtl', {
      ...params,
    });
  }
}
