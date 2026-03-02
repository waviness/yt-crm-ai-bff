import http from '@/utils/http';

export class ScheduleService {
  /**
   * 查询日程安排
   * @param params 查询参数
   * @returns Promise<any> 日程安排数据
   */
  static async getScheduleOfDateList(params: Record<string, any>) {
    const response = await http.web.post('/api/schedule/getScheduleOfDateList', params, {
      showLoading: false,
    });
    return response.data;
  }
  /**
   * 新增日程安排
   * @param params 新增参数
   * @returns Promise<any> 日程安排数据
   */
  static async insertSchedule(params: Record<string, any>) {
    const response = await http.web.post('/api/schedule/insertSchedule', params, {
      showLoading: false,
    });
    return response.data;
  }
}
