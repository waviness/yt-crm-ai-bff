export class CollectionClaimService {
  /**
   * @description: 查询认领通知接口
   * @param {*} params
   */
  static async getAllFinalPaymentOrderItem(params: any) {
    return await http.wechat.post('/api/crmCollectionClaim/getCollectionClaim', params, {
      showLoading: false,
    });
  }
  /**
   * @description: 查询附件
   * @param {*} params
   */
  static async getCollectionClaimUrl(params: any) {
    return await http.wechat.post('/api/crmCollectionClaim/getCollectionClaimUrl', params);
  }
}
