/**
 * 客户随访服务类
 * 提供客户随访相关的所有API接口
 */
export class CustomerFollowService {
  /**
   * 获取随访记录信息
   * @param params 查询参数
   * @returns 返回随访记录信息
   */
  static async getUserVisit(params: Record<string, any>) {
    const response = await http.web.post('/api/UserVisit/getUserVisit', params, {
      showLoading: false,
    });
    return response.data;
  }

  /**
   * 新增用户随访记录
   * @param params 新增参数
   * @returns 返回新增结果
   */
  static async insVisit(params: Record<string, any>) {
    const response = await http.web.post('/api/UserVisit/insVisit', params);
    return response.data;
  }

  /**
   * 新增或修改标签备注信息
   * @param params 标签备注参数
   * @returns 返回操作结果
   */
  static async insOrUpdRemark(params: Record<string, any>) {
    const response = await http.web.post('/api/UserVisit/insOrUpdRemark', params);
    return response.data;
  }

  /**
   * 新增或修改批注信息
   * @param params 批注参数
   * @returns 返回操作结果
   */
  static async insOrUpdComment(params: Record<string, any>) {
    const response = await http.web.post('/api/UserVisit/insOrUpdComment', params);
    return response.data;
  }

  /**
   * 获取当前人员关联的客户类型情况
   * @param params 查询参数
   * @returns 返回客户类型列表
   */
  static async getCompanyTypeList(params: Record<string, any>) {
    const response = await http.web.post('/api/UserVisit/getCompanyTypeList', params);
    return response.data;
  }

  /**
   * 提升用户随访记录星标值
   * @param params 星标参数
   * @returns 返回操作结果
   */
  static async raiseStarLevel(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/UserVisit/raiseStarLevel', params);
    return response.data;
  }

  /**
   * 根据用户查询客户列表
   * @param params 查询参数
   * @returns 返回客户列表
   */
  static async queryCustListByUserId(params: Record<string, any>) {
    const response = await http.web.post('/api/custom/queryCustListByUserId', params, {
      showLoading: false,
    });
    return response.data;
  }

  /**
   * 根据客户查询人员列表
   * @param params 查询参数
   * @returns 返回人员列表
   */
  static async queryPersonByCustId(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/custom/queryPersonByCustId', params);
    return response.data;
  }

  /**
   * 获取标签树
   * @param params 查询参数
   * @returns 返回标签树数据
   */
  static async getLabelTree(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/UserVisit/getLabelTree', params);
    return response.data;
  }

  /**
   * 查看客情分析总览
   * @param params 查询参数
   * @returns 返回客情分析数据
   */
  static async getVisitSummry(params: Record<string, any>) {
    const response = await http.web.post('/api/UserVisit/getVisitSummry', params);
    return response.data;
  }

  /**
   * 获取打卡信息
   * @param params 查询参数
   * @returns 返回打卡信息
   */
  static async getCrmClockIn(params: Record<string, any>) {
    const response = await http.web.post('/api/UserVisit/getCrmClockIn', params);
    return response.data;
  }

  /**
   * 随访记录关联打卡信息
   * @param params 关联参数
   * @returns 返回关联结果
   */
  static async relateClockIn(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/UserVisit/relateClockIn', params);
    return response.data;
  }

  /**
   * 随访记录-查询供应商和职员
   * @param params 查询参数
   * @returns 返回供应商和职员列表
   */
  static async queryProviderForVisit(params: Record<string, any>) {
    const response = await http.web.post('/api/crmProvider/queryProviderForVisit', params);
    return response.data;
  }

  /**
   * 随访记录-查政府机构
   * @param params 查询参数
   * @returns 返回政府机构列表
   */
  static async queryGovernmentForVisit(params: Record<string, any>) {
    const response = await http.web.post('/api/crmGovernment/queryGovernmentForVisit', params);
    return response.data;
  }

  /**
   * 随访记录-查政府和人员信息
   * @param params 查询参数
   * @returns 返回政府和人员信息
   */
  static async queryGovernmentUserMsgForVisit(params: Record<string, any>) {
    const response = await http.web.post(
      '/api/crmGovernment/queryGovernmentUserMsgForVisit',
      params
    );
    return response.data;
  }

  /**
   * 查询拜访记录 - 查数据使用
   * @param params 查询参数
   * @returns 返回拜访记录
   */
  static async chashujuGetUserVisitWx(params: Record<string, any>) {
    const response = await http.web.post('/api/UserVisit/getUserVisitWx', params, {
      showLoading: false,
    });
    return response.data;
  }

  /**
   * 查询拜访记录 中间层界面- 查数据使用
   * @param params 查询参数
   * @returns 返回拜访记录列表
   */
  static async chashujuGetUserListVisitWx(params: Record<string, any>) {
    const response = await http.web.post('/api/UserVisit/getUserListVisitWx', params);
    return response.data;
  }

  /**
   * 查询智能拜访推荐
   * @param params 查询参数
   * @returns 返回拜访推荐列表
   */
  static async getUvaiRcmdPlan(params: Record<string, any>) {
    const response = await http.web.post('/api/UvaiRcmd/getUvaiRcmdPlan', params, {
      showLoading: false,
    });
    return response.data;
  }

  /**
   * 更改智能拜访推荐
   * @param params 更新参数
   * @returns 返回操作结果
   */
  static async updUvaiRcmdPlan(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/UvaiRcmd/updUvaiRcmdPlan', params);
    return response.data;
  }

  /**
   * 根据智能拜访推荐查询品种分析
   * @param params 查询参数
   * @returns 返回品种分析数据
   */
  static async getUvaiGoodsAnalyze(params: Record<string, any>) {
    const response = await http.web.get(
      '/api/UvaiRcmd/getUvaiGoodsAnalyze',
      { params },
      {
        showLoading: false,
      }
    );
    return response.data;
  }

  /**
   * 根据智能拜访推荐查询市场分析
   * @param params 查询参数
   * @returns 返回市场分析数据
   */
  static async getUvaiMarketAnalyze(params: Record<string, any>) {
    const response = await http.web.get(
      '/api/UvaiRcmd/getUvaiMarketAnalyze',
      { params },
      {
        showLoading: false,
      }
    );
    return response.data;
  }

  /**
   * 查询客户核算单元信息
   * @param params 查询参数
   * @returns 返回核算单元列表
   */
  static async getCustomerEntryList(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/UvaiRcmd/getCustomerEntryList', params);
    return response.data;
  }

  /**
   * 获取拜访记录AI分析结果
   * @param params 查询参数
   * @returns 返回AI分析结果
   */
  static async getUvaiResult(params: Record<string, any>) {
    const response = await http.web.get('/api/UserVisit/getUvaiResult', { params });
    return response;
  }

  /**
   * 根据ID查询拜访记录
   * @param params 查询参数
   * @returns 返回拜访记录列表
   */
  static async getUserVisitListByCuvId(params: Record<string, any>) {
    const response = await http.web.get('/api/UserVisit/getUserVisitListByCuvId', { params });
    return response;
  }
}
