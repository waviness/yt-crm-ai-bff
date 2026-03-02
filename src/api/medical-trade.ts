/**
 * 数智医贸客户管理服务
 * 提供客户信息、职员信息、拜访记录等相关API
 */
export class SzymCustomerService {
  /**
   * 查询数智医贸客户
   * @param params 查询参数
   * @returns Promise<any> 客户数据
   */
  static async getSzymCustomerMng(params: any) {
    const response = await http.web.post('/api/SzymCustomerManager/getSzymCustomerMng', params, {
      showLoading: !params.hideloading,
    });
    return response;
  }

  /**
   * 更改数智医贸客户信息
   * @param params 客户信息参数
   * @returns Promise<any> 更新结果
   */
  static async updSzymCustomer(params: any) {
    const response = await http.web.post('/api/SzymCustomerManager/updSzymCustomer', params);
    return response.data;
  }

  /**
   * 查询数智医贸客户修改历史记录
   * @param params 查询参数
   * @returns Promise<any> 历史记录数据
   */
  static async getSzymCustomerHst(params: any) {
    const response = await http.web.formDataPost(
      '/api/SzymCustomerManager/getSzymCustomerHst',
      params
    );
    return response.data;
  }

  /**
   * 查询数智医贸客户职员信息
   * @param params 查询参数
   * @returns Promise<any> 职员信息数据
   */
  static async getSzymCustomerStaff(params: any) {
    const response = await http.web.formDataPost(
      '/api/SzymCustomerManager/getSzymCustomerStaff',
      params,
      {
        showLoading: false,
      }
    );
    return response;
  }

  /**
   * 查询数智医贸客户职员信息修改历史记录
   * @param params 查询参数
   * @returns Promise<any> 职员历史记录数据
   */
  static async getSzymCustomerStaffHst(params: any) {
    const response = await http.web.formDataPost(
      '/api/SzymCustomerManager/getSzymCustomerStaffHst',
      params
    );
    return response.data;
  }

  /**
   * 根据手机号查询人员信息
   * @param params 查询参数
   * @returns Promise<any> 人员信息
   */
  static async getUserByPhoneNum(params: any) {
    const response = await http.web.formDataPost(
      '/api/SzymCustomerManager/getUserByPhoneNum',
      params
    );
    return response.data;
  }

  /**
   * 增改数智医贸客户职员信息
   * @param params 职员信息参数
   * @returns Promise<any> 操作结果
   */
  static async optSzymCustomerStaff(params: any) {
    const response = await http.web.post(
      '/api/SzymCustomerManager/optSzymCustomerStaff?szymCustomerId=' + params.szymCustomerId,
      params
    );
    return response.data;
  }

  /**
   * 删除数智医贸客户职员关系
   * @param params 删除参数
   * @returns Promise<any> 删除结果
   */
  static async dltSzymCustomerStaff(params: any) {
    const response = await http.web.post(
      '/api/SzymCustomerManager/dltSzymCustomerStaff?scStaffId=' + params.scStaffId,
      params
    );
    return response.data;
  }

  /**
   * 根据数智医贸客户查询分支机构
   * @param params 查询参数
   * @returns Promise<any> 分支机构数据
   */
  static async getSzymCustomerContact(params: any) {
    const response = await http.web.formDataPost(
      '/api/SzymCustomer/getSzymCustomerContact',
      params
    );
    return response.data;
  }

  /**
   * 根据数智医贸客户查询运输地址
   * @param params 查询参数
   * @returns Promise<any> 运输地址数据
   */
  static async getSzymCustomerTransport(params: any) {
    const response = await http.web.formDataPost(
      '/api/SzymCustomer/getSzymCustomerTransport',
      params
    );
    return response.data;
  }
}

/**
 * 数智医贸拜访记录服务
 * 提供拜访记录查询、统计、增改等相关API
 */
export class SzymUserVisitService {
  /**
   * 查询数智医贸拜访记录
   * @param params 查询参数
   * @returns Promise<any> 拜访记录数据
   */
  static async getSzymUserVisit(params: any) {
    const response = await http.web.post('/api/SzymUserVisit/getSzymUserVisit', params, {
      showLoading: false,
    });
    return response.data;
  }

  /**
   * 查询数智医贸拜访记录统计
   * @param params 查询参数
   * @returns Promise<any> 统计数据
   */
  static async getSzymUserVisitStat(params: any) {
    const response = await http.web.post('/api/SzymUserVisit/getSzymUserVisitStat', params);
    return response.data;
  }

  /**
   * 查询数智医贸业务员项目拜访记录统计
   * @param params 查询参数
   * @returns Promise<any> 项目拜访统计数据
   */
  static async getSzymUserProjectVisit(params: any) {
    const response = await http.web.post('/api/SzymUserVisit/getSzymUserProjectVisit', params);
    return response.data;
  }

  /**
   * 根据项目id以及人员id查询拜访记录
   * @param params 查询参数
   * @returns Promise<any> 拜访记录数据
   */
  static async getSzymUserVisiByUserProject(params: any) {
    const response = await http.web.post('/api/SzymUserVisit/getSzymUserVisiByUserProject', params);
    return response;
  }

  /**
   * 根据拜访记录id查询拜访记录详情
   * @param params 查询参数
   * @returns Promise<any> 拜访记录详情
   */
  static async getSzymUserVisitBySuvId(params: any) {
    const response = await http.web.formDataPost(
      '/api/SzymUserVisit/getSzymUserVisitBySuvId',
      params
    );
    return response;
  }

  /**
   * 增改数智医贸拜访记录
   * @param params 拜访记录参数
   * @returns Promise<any> 操作结果
   */
  static async optSzymUserVisit(params: any) {
    const response = await http.web.post('/api/SzymUserVisit/optSzymUserVisit', params);
    return response.data;
  }

  /**
   * 增删改数智医贸拜访记录医院照片
   * @param params 照片参数
   * @returns Promise<any> 操作结果
   */
  static async optSzymUserVisitPic(params: any) {
    const response = await http.web.post(
      `/api/SzymUserVisit/optSzymUserVisitPic?suvId=${params.suvId}&deleteFlag=${params.deleteFlag}`,
      params.list
    );
    return response.data;
  }

  /**
   * 增改数智医贸客情事件
   * @param params 客情事件参数
   * @returns Promise<any> 操作结果
   */
  static async optSzymUserVisitLabelRemark(params: any) {
    const response = await http.web.post('/api/SzymUserVisit/optSzymUserVisitLabelRemark', params);
    return response.data;
  }

  /**
   * 增改数智医贸拜访记录打卡信息
   * @param params 打卡信息参数
   * @returns Promise<any> 操作结果
   */
  static async optSzymUserVisitClockIn(params: any) {
    const response = await http.web.post('/api/SzymUserVisit/optSzymUserVisitClockIn', params);
    return response.data;
  }
}

/**
 * 数智医贸项目管理服务
 * 提供项目查询等相关API
 */
export class SzymProjectService {
  /**
   * 查询数智医贸项目
   * @param params 查询参数
   * @returns Promise<any> 项目数据
   */
  static async getSzymProjectMng(params: any) {
    const response = await http.web.post('/api/SzymProjectMng/getSzymProjectMng', params, {
      showLoading: !!params.loading,
    });
    return response;
  }
}
