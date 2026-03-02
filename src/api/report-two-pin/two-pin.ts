export class TwoPinService {
  /**
   * @description: 【二销目录Tab】查询货品总单
   * @param {*} payload
   */
  static async getGoodsResell(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/secondSell/getGoodsResell', payload, {
      showLoading: false,
    });
    return response;
  }
  /**
   * @description: 查询运输地址
   * @param {*} payload
   */
  static async queryContact(payload: Record<string, any>) {
    const response = await http.wechat.formDataPost('/api/secondSell/queryContact', payload);
    return response;
  }

  /**
   * @description: 【二销目录Tab】查询货品总单
   * @param {*} payload
   */
  static async getGoods(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/secondSell/getGoods', payload, {
      showLoading: false,
    });
    return response;
  }
  /**
   * @description: 查询货品细单 详情界面
   * @param {*} payload
   */
  static async getGoodsDtl(payload: Record<string, any>) {
    return await http.wechat.post('/api/secondSell/getGoodsDtl', payload);
  }

  /**
   * @description: 【二销目录Tab】查询价格（禁限销等）
   * @param {*} payload
   */
  static async getGoodsPrice(payload: Record<string, any>) {
    return await http.wechat.formDataPost('/api/secondSell/getGoodsPrice', payload);
  }

  /**
   * @description: 货品细单-业务员查询图片记录
   * @param {*} payload
   */
  static async getimgs(payload: Record<string, any>) {
    return await http.wechat.post('/api/secondSell/getimgs', payload);
  }

  /**
   * @description: 货品细单-查询常销客户接口
   * @param {*} payload
   */
  static async getCustomersOftenPin(payload: Record<string, any>) {
    return await http.wechat.post('/api/secondSell/getCustomersOftenPin', payload);
  }
  /**
   * @description: 仓管员查询货品总单
   * @param {*} payload
   */
  static async getGoodsResellPcqs(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/secondSell/getGoodsResellPcqs', payload, {
      showLoading: false,
    });
    return response;
  }
  /**
   * @description: 仓管员查询货品细单
   * @param {*} payload
   */
  static async getGoodsDtlPcsq(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/secondSell/getGoodsDtlPcsq', payload, {
      showLoading: false,
    });
    return response;
  }
  /**
   * @description: 【仓管员】--查询图片记录
   * @param {*} payload
   */
  static async getimgsPqsc(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/secondSell/getimgsPqsc', payload, {
      showLoading: false,
    });
    return response;
  }
  /**
   * @description: 【仓管员】--上传图片
   * @param {*} payload
   */
  static async uploadPhotos(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/secondSell/uploadPhotos', payload, {
      showLoading: false,
    });
    return response;
  }
}
