/**
 * 周报服务类
 * 提供周报相关的所有API接口
 */
export class WeeklyService {
  /**
   * 获取周报详情集合信息
   * @param params 查询参数
   * @returns 返回周报详情集合
   */
  static async getReportDtl(params: Record<string, any>) {
    const response = await http.web.post('/api/WeeklyReport/getReportDtl', params);
    return response.data;
  }

  /**
   * 从随访记录和标签备注生成周报
   * @param params 生成参数
   * @returns 返回生成结果
   */
  static async generateReport(params: Record<string, any>) {
    const response = await http.web.post('/api/WeeklyReport/generateReport', params);
    return response.data;
  }

  /**
   * 新增或修改周报细单信息
   * @param params 周报细单参数
   * @returns 返回操作结果
   */
  static async insOrUpdReport(params: Record<string, any>) {
    const response = await http.web.post('/api/WeeklyReport/insOrUpdReport', params);
    return response.data;
  }

  /**
   * 删除周报细单信息
   * @param params 删除参数
   * @returns 返回删除结果
   */
  static async dltReport(params: Record<string, any>) {
    const response = await http.web.post('/api/WeeklyReport/dltReport', params);
    return response.data;
  }

  /**
   * 提交本周周报信息到上级领导
   * @param params 提交参数
   * @returns 返回提交结果
   */
  static async submitReport(params: Record<string, any>) {
    const response = await http.web.post('/api/WeeklyReport/submitReport', params);
    return response.data;
  }

  /**
   * 获取人员各个部门的上级领导信息
   * @param params 查询参数
   * @returns 返回上级领导信息
   */
  static async getLeader(params: Record<string, any>) {
    const response = await http.web.post('/api/UserDep/getLeader', params);
    return response.data;
  }
}
