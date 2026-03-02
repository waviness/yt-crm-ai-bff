/**
 * 应收管理服务
 * 提供预收预警、逾期预警、逾期数据等相关API
 */
export class ReceivableService {
  /**
   * 查询预收预警列表
   * @param params 查询参数
   * @returns Promise<any> 预收预警列表数据
   */
  static async queryAdvanceList(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/receive/queryAdvanceList', params, {
      showLoading: false,
    });
    return response.data;
  }

  /**
   * 查询预收预警详情
   * @param params 查询参数
   * @returns Promise<any> 预收预警详情数据
   */
  static async queryAdvanceDetail(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/receive/queryAdvanceDetail', params);
    return response.data;
  }

  /**
   * 添加预收反馈
   * @param params 反馈参数
   * @returns Promise<any> 添加结果
   */
  static async addAdvanceRemark(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/receive/addAdvanceRemark', params);
    return response.data;
  }

  /**
   * 查看预收反馈
   * @param params 查询参数
   * @returns Promise<any> 反馈数据
   */
  static async queryAdvanceRemark(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/receive/queryAdvanceRemark', params);
    return response.data;
  }

  /**
   * 查询逾期预警列表
   * @param params 查询参数
   * @returns Promise<any> 逾期预警列表数据
   */
  static async queryOverdueWarnList(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/receive/queryOverdueWarnList', params, {
      showLoading: false,
    });
    return response.data;
  }

  /**
   * 查询逾期预警详情
   * @param params 查询参数
   * @returns Promise<any> 逾期预警详情数据
   */
  static async queryOverdueWarnDetail(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/receive/queryOverdueWarnDetail', params);
    return response.data;
  }

  /**
   * 查询逾期列表
   * @param params 查询参数
   * @returns Promise<any> 逾期列表数据
   */
  static async queryOverdueDataList(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/receive/queryOverdueDataList', params, {
      showLoading: false,
    });
    return response.data;
  }

  /**
   * 查询逾期详情
   * @param params 查询参数
   * @returns Promise<any> 逾期详情数据
   */
  static async queryOverdueDataDetail(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/receive/queryOverdueDataDetail', params);
    return response.data;
  }

  /**
   * 添加逾期反馈
   * @param params 反馈参数
   * @returns Promise<any> 添加结果
   */
  static async addOverdueRemark(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/receive/addOverdueRemark', params);
    return response.data;
  }

  /**
   * 查看逾期反馈
   * @param params 查询参数
   * @returns Promise<any> 反馈数据
   */
  static async queryOverdueRemark(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/receive/queryOverdueRemark', params);
    return response.data;
  }

  /**
   * 查询预收预警进行中数量
   * @param params 查询参数
   * @returns Promise<any> 数量数据
   */
  static async queryAdvanceCount(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/receive/queryAdvanceCount', params);
    return response.data;
  }

  /**
   * 统计应收助手进行中数据
   * @param params 查询参数
   * @returns Promise<any> 统计数据
   */
  static async queryCount(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/receive/queryCount', params, {
      showLoading: false,
    });
    return response.data;
  }
}
