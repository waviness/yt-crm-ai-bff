export class varietyFollowService {
  /**
   * @description: 获取集采勾标列表
   * @param {*} params
   */
  static async queryBatchList(params: any) {
    return await http.web.formDataPost('/api/goodsTrack/queryBatchList', params, {
      showLoading: false,
    });
  }

  /**
   * @description: 查询客户填报列表
   * @param {*} params
   */
  static async queryCustomFillList(params: any) {
    return await http.web.formDataPost('/api/goodsTrack/queryCustomFillList', params, {
      showLoading: false,
    });
  }

  /**
   * @description: 查询厂牌填报列表
   * @param {*} params
   */
  static async queryBrandFillList(params: any) {
    return await http.web.formDataPost('/api/goodsTrack/queryBrandFillList', params, {
      showLoading: false,
    });
  }

  /**
   * @description: 查询客户厂牌填报列表
   * @param {*} params
   */
  static async queryCustomBrandFillList(params: any) {
    return await http.web.formDataPost('/api/goodsTrack/queryCustomBrandFillList', params);
  }

  /**
   * @description: 查询厂牌客户填报列表
   * @param {*} params
   */
  static async queryBrandCustomFillList(params: any) {
    return await http.web.formDataPost('/api/goodsTrack/queryBrandCustomFillList', params);
  }

  /**
   * @description: 查询附件列表
   * @param {*} params
   */
  static async queryFileList(params: any) {
    return await http.web.formDataPost('/api/goodsTrack/queryFileList', params);
  }

  /**
   * @description: 查询填报详情
   * @param {*} params
   */
  static async queryFillDetail(params: any) {
    return await http.web.formDataPost('/api/goodsTrack/queryFillDetail', params);
  }

  /**
   * @description: 查询上次填报
   * @param {*} params
   */
  static async queryLastFill(params: any) {
    return await http.web.formDataPost('/api/goodsTrack/queryLastFill', params);
  }

  /**
   * @description: 提交填报
   * @param {*} params
   */
  static async submitFill(params: any) {
    return await http.web.post('/api/goodsTrack/submitFill', params);
  }

  /**
   * @description: 上传附件
   * @param {*} params
   */
  static async uploadFile(params: any) {
    return await http.web.formDataPost('/api/goodsTrack/uploadFile', params);
  }

  /**
   * @description: 一键填报
   * @param {*} params
   */
  static async oneKeyFillAll(params: any) {
    return await http.web.formDataPost('/api/goodsTrack/oneKeyFillAll', params);
  }
}
