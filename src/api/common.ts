/**
 * 通用服务类
 * 提供通用功能相关的所有API接口
 */

export class CommonService {
  /**
   * 获取标签树
   * @param payload 查询参数
   * @returns 返回标签树数据
   */
  static async getLabelTree(payload: Record<string, any>) {
    const response = await http.web.formDataPost('/api/UserVisit/getLabelTree', payload);
    return response.data;
  }

  /**
   * 获取部门树结构
   * @param payload 查询参数
   * @returns 返回部门树数据
   */
  static async getDepTree(payload: Record<string, any>) {
    const response = await http.web.get('/api/Dep/getDepTree', { params: payload });
    return response.data;
  }

  /**
   * 根据标签ID + 部门id 获取人员信息
   * 这样的话渲染出已经选择过的人员 已选人员不做选择
   * @param payload 查询参数
   * @returns 返回人员信息列表
   */
  static async getUserByParams(payload: Record<string, any>) {
    const response = await http.web.post('/api/WebAppUser/getUserByParams', payload);
    return response.data;
  }

  /**
   * 手机号查询用户
   * @param payload 查询参数
   * @returns 返回用户信息
   */
  static async queryCrmUser(payload: Record<string, any>) {
    const response = await http.web.get('/api/WebAppUser/queryCrmUser', { params: payload });
    return response.data;
  }

  /**
   * 查询数据字典
   * @param payload 查询参数
   * @returns 返回数据字典
   */
  static async getDictionaries(payload: Record<string, any>) {
    const response = await http.web.post('/api/dictionary/getDictionaries', payload);
    return response.data;
  }

  /**
   * 获取微信签名
   * @param payload 签名参数
   * @returns 返回签名信息
   */
  static async getSign(payload: Record<string, any>) {
    const response = await http.wechat.formDataPost('/api/jsSign/getSign', payload, {
      showLoading: false,
    });
    return response.data;
  }

  /**
   * 新增打卡
   * @param payload 打卡参数
   * @returns 返回打卡结果
   */
  static async insCrmClockIn(payload: Record<string, any>) {
    const response = await http.web.post('/api/UserVisit/insCrmClockIn', payload);
    return response.data;
  }

  /**
   * 查询核算单元
   * @returns 返回核算单元信息
   */
  static async queryEntryid() {
    const response = await http.wechat.post('/api/secondSell/queryEntryid', {
      showLoading: true,
    });
    return response.data;
  }

  /**
   * 查询业务员的客户
   * @param payload 查询参数
   * @returns 返回客户列表
   */
  static async getSalesmanCustom(payload: Record<string, any>) {
    const response = await http.wechat.post('/api/secondSell/getCustom', payload, {
      showLoading: false,
    });
    return response.data;
  }

  /**
   * 记录点击次数
   * @param payload 点击记录参数
   * catalogType: 1, 1 CDP 2 CRM 605 查数据
   * catalogTypeName: 'CDP', 对应名称 数据中台 crm 首页 等等
   * deviceType: 1, // 1手机端 2 web端 3 手机端调试 4 web端调试
   * menuId: '', // 菜单的id
   * menuName: '', // 菜单的名称
   * menuOperation: '',
   * operationType: 0  操作类型 0--首页展开 1--筛选( 时间筛选，条件筛选，部门/人员等筛选)，2-tab 切换，3--功能操作(任务督办、新增等等操作)4--列表点击
   * @returns 返回记录结果
   */
  static async crmUserClick(payload: Record<string, any>) {
    const response = await http.web.post('/api/CrmUserClick/insert', payload, {
      showLoading: false,
    });
    return response.data;
  }

  /**
   * 分页查询当前登陆人名下的全部品种
   * @param payload 查询参数
   * @returns 返回品种列表
   */
  static async getAuthorizedList(payload: Record<string, any>) {
    const response = await http.wechat.get('/api/crmGoods/getAuthorizedList', {
      params: payload,
      showLoading: false,
    });
    return response.data;
  }

  /**
   * 查询未上传的两票制订单
   * @param payload 查询参数
   * @returns 返回订单列表
   */
  static async queryInvoiceSubList(payload: Record<string, any>) {
    const response = await http.web.formDataPost(
      '/api/invoiceSubscribe/queryInvoiceSubList',
      payload,
      {
        showLoading: false,
      }
    );
    return response.data;
  }
}
