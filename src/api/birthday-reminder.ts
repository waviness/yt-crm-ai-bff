/**
 * 生日提醒服务类
 */
import http from '@/utils/http';

export class BirthdayService {
  /**
   * 获取生日列表
   * @param payload 获取生日列表的参数对象
   * @returns 获取生日列表的响应结果
   */
  static async queryBirth(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/birthday/queryBirth', payload);
    return response;
  }

  /**
   * 批量添加附加至人员接口
   * @param payload 批量添加附加至人员的参数对象
   * @returns 批量添加附加至人员的响应结果
   */
  static async addUser(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/birthday/addUser', payload);
    return response.data;
  }

  /**
   * 查询被提醒人的总单
   * @param payload 查询被提醒人的总单的参数对象
   * @returns 查询被提醒人的总单的响应结果
   */
  static async queryBirthByUserNum(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/birthday/queryBirthByUserNum', payload);
    return response;
  }

  /**
   * 批量删除附加至人员及供应商
   * @param payload 批量删除附加至人员及供应商的参数对象
   * @returns 批量删除附加至人员及供应商的响应结果
   */
  static async updateUser(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/birthday/updateUser', payload);
    return response.data;
  }

  /**
   * 查询附加推送人点开后的人员
   * @param payload 查询附加推送人点开后的人员的参数对象
   * @returns 查询附加推送人点开后的人员的响应结果
   */
  static async queryBirthByUser(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/birthday/queryBirthByUser', payload);
    return response.data;
  }
}
