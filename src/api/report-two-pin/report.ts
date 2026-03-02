export class ReportService {
  /**
   * @description: 查询货品
   * @param {*} payload
   */
  static async getGoodsDoc(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/crmGoods/getGoodsDoc', payload, {
      showLoading: false,
    });
    return response;
  }
  /**
   * @description: 查询货品细单
   * @param {*} payload
   */
  static async getGoodsDtl(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/crmGoods/getGoodsDtl', payload);
    return response;
  }
}
