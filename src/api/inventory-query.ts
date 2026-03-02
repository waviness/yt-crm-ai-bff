export class InventoryQueryService {
  /**
   * @description: 库存查询 - 根据药品信息查询库存
   * @param {*} params
   */
  static async infoList(params: any) {
    return await http.web.get('/api/inventory/infoList', { params, showLoading: false });
  }

  /**
   * @description: 库存查询 - 查询可销库存下限
   * @param {*} params
   */
  static async lowerLimit(params: any) {
    return await http.web.get('/api/inventory/lowerLimit', { params });
  }

  /**
   * @description: 库存查询 - 查询库存列表
   * @param {*} params
   */
  static async inventoryByLot(params: any) {
    return await http.web.get('/api/inventory/byLot', { params });
  }

  /**
   * @description: 库存查询 - 根据药品关键字查询药业库存
   * @param {*} params
   */
  static async yyInfoList(params: any) {
    return await http.web.get('/api/inventory/yyInfoList', { params });
  }

  /**
   * @description: 库存查询 - 查询货品包装信息
   * @param {*} params
   */
  static async getPackageInfo(params: any) {
    return await http.web.get('/api/inventory/getPackageInfo', { params });
  }
}
