/**
 * 更新日志服务类
 */
export class LogUpdateService {
  /**
   * 标记更新日志为已读
   * @param payload 更新日志参数
   * @returns 返回标记已读的响应结果
   */
  static async updateRead(payload: { type: number }) {
    const response = await http.web.post('/api/updateLog/updateRead', payload);
    return response.data;
  }

  /**
   * 获取更新日志文档列表
   * @param payload 查询参数
   * @returns 返回更新日志列表
   */
  static async updateLogGetDoc(payload: {
    type: number;
    flag: number;
    pageNum: number;
    pageSize: number;
  }) {
    const response = await http.web.post('/api/updateLog/getDoc', payload, {
      showLoading: false,
    });
    return response.data;
  }
}
