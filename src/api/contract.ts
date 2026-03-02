/**
 * 合同管理服务类
 * 提供合同管理相关的所有API接口
 */

export class ContractService {
  /**
   * 查询合同列表
   * @param payload 查询参数
   * @returns 返回合同列表
   */
  static async queryContractList(payload: Record<string, any>) {
    const response = await http.web.formDataPost('/api/queryContract/queryContractList', payload, {
      showLoading: false,
    });
    return response.data;
  }

  /**
   * 查询合同细单列表
   * @param payload 查询参数
   * @returns 返回合同细单列表
   */
  static async queryContractDtlList(payload: Record<string, any>) {
    const response = await http.web.formDataPost(
      '/api/queryContract/queryContractDtlList',
      payload
    );
    return response.data;
  }

  /**
   * 查询两票制信息
   * @param payload 查询参数
   * @returns 返回两票制信息
   */
  static async queryApiInformationsByCondtlid(payload: Record<string, any>) {
    const response = await http.web.formDataPost(
      '/api/queryContract/queryApiInformationsByCondtlid',
      payload
    );
    return response;
  }

  /**
   * 查询订单物流信息
   * @param payload 查询参数
   * @returns 返回订单物流信息
   */
  static async queryOrderStatusInfo(payload: Record<string, any>) {
    const response = await http.web.formDataPost(
      '/api/queryContract/queryOrderStatusInfo',
      payload
    );
    return response;
  }

  /**
   * 查询进货发票图片
   * @param payload 查询参数
   * @returns 返回进货发票图片信息
   */
  static async querySuInvkcPic(payload: Record<string, any>) {
    const response = await http.web.formDataPost('/api/queryContract/querySuInvkcPic', payload);
    return response.data;
  }

  /**
   * 查询销售发票
   * @param payload 查询参数
   * @returns 返回销售发票信息
   */
  static async queryLotNumberInfo(payload: Record<string, any>) {
    const response = await http.web.post('/api/queryContract/queryLotNumberInfo', payload);
    return response.data;
  }
}
