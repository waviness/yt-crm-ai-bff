/**
 * 缺货解锁服务类
 * 提供缺货解锁相关的所有API接口
 */
import http from '@/utils/http';

export class OutOfStockService {
  /**
   * 缺货解锁等查询列表
   * @param payload 查询参数
   * @returns 返回缺货解锁列表
   */
  static async queryOutOfStockInfo(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/salesManage/getOutOfStockList', payload, {
      showLoading: false,
    });
    return response.data;
  }

  /**
   * 缺货解锁等查询详情
   * @param payload 查询参数
   * @returns 返回缺货解锁详情
   */
  static async queryOutOfStockDetail(payload: Record<string, any>) {
    const response = await http.wechat.get('/api/salesManage/getOutOfStockDetail', {
      params: payload,
    });
    return response.data;
  }

  /**
   * 缺货、两票制 采购提交功能
   * @param payload 提交参数
   * @returns 返回提交结果
   */
  static async outOfStocksubmit(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/salesManage/outOfStockSubmit', payload);
    return response.data;
  }

  /**
   * 价格限销｜库存下限｜紧俏药品 批量解锁
   * @param payload 批量解锁参数
   * @returns 返回批量解锁结果
   */
  static async batchUnlockOrder(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/salesManage/batchUnlockOrder', payload);
    return response.data;
  }

  /**
   * 提交禁限销意见
   * @param payload 提交参数
   * @returns 返回提交结果
   */
  static async submitLimitSaleAdvice(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/salesManage/submitLimitSaleAdvice', payload);
    return response.data;
  }

  /**
   * 判断是否缺票
   * @param payload 查询参数
   * @returns 返回判断结果
   */
  static async checkTicket(payload: Record<string, any>) {
    const response = await http.wechat.get('/api/salesManage/checkTicket', {
      params: payload,
    });
    return response.data;
  }

  /**
   * 业务员激活
   * @param payload 激活参数
   * @returns 返回激活结果
   */
  static async salerActive(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/salesManage/salerActive', payload);
    return response;
  }

  /**
   * 再次激活
   * @param payload 激活参数
   * @returns 返回激活结果
   */
  static async secondActive(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/salesManage/secondActive', payload);
    return response;
  }

  /**
   * 查看批号
   * @param payload 查询参数
   * @returns 返回批号列表
   */
  static async getInventoryByLot(payload: Record<string, any>) {
    const response = await http.wechat.get('/api/salesManage/getInventoryByLot', {
      params: payload,
    });
    return response.data;
  }

  /**
   * 获取各种锁控类型待处理数量
   * @param payload 查询参数
   * @returns 返回待处理数量
   */
  static async getPendingNum(payload: Record<string, any>) {
    const response = await http.wechat.get('/api/salesManage/getPendingNum', {
      params: payload,
      showLoading: false,
    });
    return response.data;
  }

  /**
   * 查询所有的客户营运分类
   * @param payload 查询参数
   * @returns 返回客户营运分类列表
   */
  static async getOperatingCustomerStatus(payload: Record<string, any>) {
    const response = await http.wechat.get('/api/salesManage/getOperatingCustomerStatus', {
      params: payload,
      showLoading: false,
    });
    return response.data;
  }

  /**
   * 查询货品储备明细
   * @param payload 查询参数
   * @returns 返回货品储备明细列表
   */
  static async getGoodsReserveList(payload: Record<string, any>) {
    const response = await http.wechat.get('/api/salesManage/getGoodsReserveList', {
      params: payload,
    });
    return response.data;
  }
}
