export class CustomerSituationMapService {
  /**
   * 查询微信客情地图点
   * @param params 查询参数
   * @returns 返回客情地图点信息
   */
  static async queryVisitMapList(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/visitMap/queryVisitMapList', params);
    return response;
  }
  /**
   * 查询人员列表
   * @param params 查询参数
   * @returns 返回人员列表信息
   */
  static async queryUser(params: Record<string, any>) {
    const response = await http.web.post('/api/visitMap/queryUser', params);
    return response;
  }
  /**
   * 查询微信客情打卡列表
   * @param params 查询参数
   * @returns 返回客情打卡列表信息
   */
  static async queryVisitMapPage(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/visitMap/queryVisitMapPage', params, {
      showLoading: false,
    });
    return response;
  }
  /**
   * 点赞
   * @param params 查询参数
   * @returns 返回点赞结果
   */
  static async visitMapStar(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/visitMap/star', params);
    return response;
  }

  // 查询点赞列表
  static async visitMapQueryStar(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/visitMap/queryStar', params);
    return response;
  }
  // 查询拜访列表
  static async visitMapQueryVisit(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/visitMap/queryVisit', params, {
      showLoading: false,
    });
    return response;
  }
}
