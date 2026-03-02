/**
 * 数据中心相关接口
 */
export class DashboardService {
  /**
   * @description: 查询用户拥有的权限
   * 1 事业部 2销售中心 3部门 4子部门
   * @param {*} params
   */
  static async queryDataDeptByType(type: string) {
    return await http.web.post(
      '/api/Dep/queryDataDeptByType?type=' + type,
      {},
      { showLoading: false }
    );
  }

  /**
   * @description: 销售基本情况速览
   * @param {*} payload
   */
  static async getQuickOverview(payload: Record<string, any>) {
    return await http.bigdata.post(
      '/api/dataOverall/getQuickOverview',
      {
        ...payload,
      },
      { showLoading: false }
    );
  }

  /**
   * @description: 月累计销售堆积图
   * @param {*} params
   */
  static async getMonthCumulativeMoney(params: any) {
    return await http.bigdata.get('/api/dataOverall/getMonthCumulativeMoney', {
      params: params,
      showLoading: false,
    });
  }
  /**
   * @description: 品牌销售统计
   * @param {*} params
   */
  static async getDeptTotalStat(params: any) {
    return await http.bigdata.get('/api/brand/getDeptTotalStat', {
      params: params,
      showLoading: false,
    });
  }
  /**
   * @description: 查询品牌维度在部门下统计列表
   * @param {*} params
   */
  static async getStatListByDept(params: any) {
    return await http.bigdata.get('/api/brand/getStatListByDept', {
      params: params,
      showLoading: false,
    });
  }
  /**
   * @description: 查询某品牌下所有品种统计列表
   * @param {*} params
   */
  static async getAllListByBrand(params: any) {
    return await http.bigdata.get('/api/variety/getAllListByBrand', { params, showLoading: false });
  }

  /**
   * @description: 查询客户营运分类销售统计
   * @param {*} params
   */
  static async getCustomerCategorySales(params: any) {
    return await http.bigdata.get('/api/DataCustomerSales/getCustomerCategorySales', {
      params,
      showLoading: false,
    });
  }
  /**
   * @description: 查询部门业务员数据
   * @param {*} params
   */
  static async queryDeptSaleData(params: any) {
    return await http.web.formDataPost('/api/dataCenter/queryDeptSaleData', params, {
      showLoading: false,
    });
  }

  /**
   * @description: 获取个人销售详情
   * @param {*} params
   */
  static async getDataUserSalesDetail(params: any) {
    return await http.bigdata.formDataPost('/api/DataPersonSales/getDataUserSalesDetail', {
      ...params,
      loading: false,
    });
  }

  /**
   * @description: 获取个人客户销售情况List
   * @param {*} params
   */
  static async getDataUserCustomerSalesList(params: any) {
    return http.bigdata.formDataPost('/api/DataPersonSales/getDataUserCustomerSalesList', {
      ...params,
      loading: false,
    });
  }

  /**
   * @description: 部门全客户统计列表
   * @param {*} params
   */
  static async customerGetDeptDetailList(params: any) {
    return await http.bigdata.get('/api/customer/getDeptDetailList', {
      params,
      showLoading: false,
    });
  }

  /**
   * @description: 部门全品种统计列表
   * @param {*} params
   */
  static async goodsGetDeptDetailList(params: any) {
    return await http.bigdata.get('/api/goods/getDeptDetailList', { params, showLoading: false });
  }

  /**
   * @description: 部门流失品种查询-总数
   * @param {*} params
   */
  static async queryLostGoods(params: any) {
    return await http.web.formDataPost('/api/dataCenter/queryLostGoods', params, {
      showLoading: false,
    });
  }

  /**
   * @description: 部门流失品种列表表格查询
   * @param {*} params
   */
  static async queryLostGoodsDetail(params: any) {
    return await http.web.formDataPost('/api/dataCenter/queryLostGoodsDetail', params, {
      showLoading: false,
    });
  }

  /**
   * @description: 部门下降客户查询-总数
   * @param {*} params
   */
  static async queryLostCust(params: any) {
    return await http.web.formDataPost('/api/dataCenter/queryLostCust', params, {
      showLoading: false,
    });
  }

  /**
   * @description: 部门下降客户详情表格查询
   * @param {*} params
   */
  static async queryLostCustDetail(params: any) {
    return await http.web.formDataPost('/api/dataCenter/queryLostCustDetail', params, {
      showLoading: false,
    });
  }
  /**
   * @description: 获取个人流失客户List
   * @param {*} params
   */
  static async getUserCustomerSalesLost(params: any) {
    return await http.bigdata.formDataPost(
      '/api/DataPersonSales/getUserCustomerSalesLost',
      params,
      {
        showLoading: false,
      }
    );
  }

  /**
   * @description: 获取个人品种销售情况List
   * @param {*} params
   */
  static async getDataUserGoodSalesList(params: any) {
    return await http.bigdata.formDataPost(
      '/api/DataPersonSales/getDataUserGoodSalesList',
      params,
      { showLoading: false }
    );
  }

  /**
   * @description: 获取个人流失客户总额
   * @param {*} params
   */
  static async getUserCustomerSalesLostTotal(params: any) {
    return await http.bigdata.formDataPost(
      '/api/DataPersonSales/getUserCustomerSalesLostTotal',
      params,
      { showLoading: false }
    );
  }

  /**
   * @description: 获取个人流失品种总额
   * @param {*} params
   */
  static async getUserGoodSalesLostTotal(params: any) {
    return await http.bigdata.formDataPost(
      '/api/DataPersonSales/getUserGoodSalesLostTotal',
      params,
      { showLoading: false }
    );
  }

  /**
   * @description: 获取个人流失品种List
   * @param {*} params
   */
  static async getUserGoodSalesLost(params: any) {
    return await http.bigdata.formDataPost('/api/DataPersonSales/getUserGoodSalesLost', params, {
      showLoading: false,
    });
  }

  /**
   * @description: 查询部门客户当日无税销售额
   * @param {*} params
   */
  static async getDailySale(params: any) {
    return await http.bigdata.get('/api/deptCustomer/getDailySale', { params });
  }

  /**
   * @description: 查询部门客户当日销售统计情况
   * @param {*} params
   */
  static async getSaleStat(params: any) {
    return await http.bigdata.get('/api/deptCustomer/getSaleStat', { params });
  }

  /**
   * @description: 部门特定客户相关业务员详情列表
   * @param {*} params
   */
  static async getRelatedSalesmanDetailList(params: any) {
    return await http.bigdata.get('/api/customer/getRelatedSalesmanDetailList', {
      params,
      showLoading: false,
    });
  }

  /**
   * @description: 查询部门客户截止当日所有发生销售品种的统计情况
   * @param {*} params
   */
  static async getFullGoods(params: any) {
    return await http.bigdata.get('/api/deptCustomer/getFullGoods', { params, showLoading: false });
  }

  /**
   * @description: 部门特定客户新增品种详情列表
   * @param {*} params
   */
  static async getNewGoodsDetailList(params: any) {
    return await http.bigdata.get('/api/customer/getNewGoodsDetailList', {
      params,
      showLoading: false,
    });
  }

  /**
   * @description: 获取部门客户流失品种
   * @param {*} params
   */
  static async getDescentGoods(params: any) {
    return await http.bigdata.get('/api/deptCustomer/getDescentGoods', {
      params,
      showLoading: false,
    });
  }
  /**
   * @description: 获取流失品种销售汇总统计
   * @param {*} params
   */
  static async getDescentGoodsStat(params: any) {
    return await http.bigdata.get('/api/deptCustomer/getDescentGoodsStat', {
      params,
      showLoading: false,
    });
  }

  /**
   * @description: 部门某个品种统计
   * @param {*} params
   */
  static async getDeptSaleStat(params: any) {
    return await http.bigdata.get('/api/goods/getDeptSaleStat', { params });
  }

  /**
   * @description: 部门特定品种全客户或新增客户详情列表
   * @param {*} params
   */
  static async getDifferentCustomerDetailList(params: any) {
    return await http.bigdata.get('/api/goods/getDifferentCustomerDetailList', {
      params,
      showLoading: false,
    });
  }

  /**
   * @description: 部门特定品种流失客户详情列表
   * @param {*} params
   */
  static async getDescentCustomerDetailList(params: any) {
    return await http.bigdata.get('/api/goods/getDescentCustomerDetailList', {
      params,
      showLoading: false,
    });
  }
  /**
   * @description: 获取部门特定品种流失客户销售汇总统计
   * @param {*} params
   */
  static async getDescentCustomerStat(params: any) {
    return await http.bigdata.get('/api/goods/getDescentCustomerStat', {
      params,
      showLoading: false,
    });
  }
  /**
   * @description: 获取个人客户全品种List
   * @param {*} params
   */
  static async getaUserCustomerSalesList(params: any) {
    return await http.bigdata.formDataPost(
      '/api/DataPersonSales/getaUserCustomerSalesList',
      params,
      { showLoading: false }
    );
  }

  /**
   * @description: 获取个人特定客户新增品种详情列表
   * @param {*} params
   */
  static async getFixCustomerNewGoodSalesList(params: any) {
    return await http.bigdata.formDataPost('/api/person/getFixCustomerNewGoodSalesList', params);
  }

  /**
   * @description: 获取个人客户流失品种总额
   * @param {*} params
   */
  static async getUserCstmGoodSalesLostTotal(params: any) {
    return await http.bigdata.formDataPost(
      '/api/DataPersonSales/getUserCstmGoodSalesLostTotal',
      params
    );
  }

  /**
   * @description: 获取个人客户流失品种List
   * @param {*} params
   */
  static async getUserCstmGoodSalesLost(params: any) {
    return await http.bigdata.formDataPost('/api/DataPersonSales/getUserCstmGoodSalesLost', params);
  }

  /**
   * @description: 获取个人品种全客户List
   * @param {*} params
   */
  static async getUserGdCustomSalesList(params: any) {
    return await http.bigdata.formDataPost('/api/DataPersonSales/getUserGdCustomSalesList', params);
  }

  /**
   * @description: 获取个人特定品种新增客户详情列表
   * @param {*} params
   */
  static async getFixGoodsNewCustomerSalesList(params: any) {
    return await http.bigdata.formDataPost('/api/person/getFixGoodsNewCustomerSalesList', params);
  }

  /**
   * @description: 获取个人品种流失客户总额
   * @param {*} params
   */
  static async getUserGdCustomSalesLostTotal(params: any) {
    return await http.bigdata.formDataPost(
      '/api/DataPersonSales/getUserGdCustomSalesLostTotal',
      params
    );
  }

  /**
   * @description: 获取个人品种流失客户List
   * @param {*} params
   */
  static async getUserGDCustomerSalesLost(params: any) {
    return await http.bigdata.formDataPost(
      '/api/DataPersonSales/getUserGDCustomerSalesLost',
      params
    );
  }

  /**
   * @description: 获取部门重点客户销售情况
   * @param {*} params
   */
  static async getDeptKeyCustomerSalesList(params: any) {
    return await http.bigdata.get('/api/deptSales/getDeptKeyCustomerSalesList', {
      params,
      showLoading: false,
    });
  }

  /**
   * @description: 获取部门重点客户销售统计
   * @param {*} params
   */
  static async getDeptKeyCustomerSalesStat(params: any) {
    return await http.bigdata.get('/api/deptSales/getDeptKeyCustomerSalesStat', {
      params,
    });
  }
  /**
   * @description: 部门重点品种综合统计
   * @param {*} params
   */
  static async deptTotalStat(params: any) {
    return await http.bigdata.get('/api/goods/deptTotalStat', { params });
  }

  /**
   * @description: 部门不同类别品种统计详情列表
   * @param {*} params
   */
  static async getDeptFocusGoodsDetailList(params: any) {
    return await http.bigdata.get('/api/goods/getDeptFocusGoodsDetailList', {
      params,
      showLoading: false,
    });
  }
  /**
   * @description: 部门下某品牌客户业态统计列表
   * @param {*} params
   */
  static async getFormStatListByDeptAndBrand(params: any) {
    return await http.bigdata.get('/api/customer/getFormStatListByDeptAndBrand', { params });
  }

  /**
   * @description: 部门某品牌所有客户统计列表
   * @param {*} params
   */
  static async getStatListByGoods(params: any) {
    return await http.bigdata.get('/api/customer/getStatListByGoods', { params });
  }

  /**
   * @description: 部门某品牌某业态下所有区域统计列表
   * @param {*} params
   */
  static async getRegionStatList(params: any) {
    return await http.bigdata.get('/api/customer/getRegionStatList', { params });
  }

  /**
   * @description: 部门某品牌某业态下所有客户统计列表
   * @param {*} params
   */
  static async getStatList(params: any) {
    return await http.bigdata.get('/api/customer/getStatList', { params });
  }

  /**
   * @description: 部门某品牌下某客户所有品种统计列表
   * @param {*} params
   */
  static async getStatListByDeptAndBrandAndFormAndCustomer(params: any) {
    return await http.bigdata.get('/api/variety/getStatListByDeptAndBrandAndFormAndCustomer', {
      params,
    });
  }

  /**
   * @description: 部门下某品牌某客户业态动态地区列表
   * @param {*} params
   */
  static async getDynamicRegionList(params: any) {
    return await http.bigdata.get('/api/customer/getDynamicRegionList', { params });
  }

  /**
   * @description: 查询客户营运分类部门销售统计
   * @param {*} params
   */
  static async getCstmCtgryDeptSales(params: any) {
    return await http.bigdata.get('/api/DataCustomerSales/getCstmCtgryDeptSales', { params });
  }

  /**
   * @description: 获取创新品种销售数据
   * @param {*} params
   */
  static async getDeptNewSaleGoodsStat(params: any) {
    return await http.bigdata.get('/api/DataNewsaleGoods/getDeptNewSaleGoodsStatWx', { params });
  }

  /**
   * @description: 获取创新品种销售数据列表
   * @param {*} params
   */
  static async getDeptNewSaleGoodsStatList(params: any) {
    return await http.bigdata.post('/api/DataNewsaleGoods/getDeptNewSaleGoodsStatListWx', params);
  }

  /**
   * @description: 查询集采总数
   * @param {*} params
   */
  static async queryJcDataBar(params: any) {
    return await http.bigdata.formDataPost('/api/jiCai/queryDataBar', params);
  }

  /**
   * @description: 查询集采品种列表
   * @param {*} params
   */
  static async queryJiCaiGoodsList(params: any) {
    return await http.bigdata.formDataPost('/api/jiCai/queryJiCaiGoodsList', params);
  }

  /**
   * @description: 查询集采列表
   * @param {*} params
   */
  static async queryJiCaiList(params: any) {
    return await http.bigdata.formDataPost('/api/jiCai/queryJiCaiList', params);
  }
  /**
   * @description: 查询平衡毛利总数
   * @param {*} params
   */
  static async queryBalanceProfitBar(params: any) {
    return await http.bigdata.formDataPost('/api/balanceProfit/queryBalanceProfitBar', params);
  }
  /**
   * @description: 查询平衡毛利时间
   * @param {*} params
   */
  static async queryBalanceProfitTime(params: any) {
    return await http.bigdata.formDataPost('/api/balanceProfit/queryBalanceProfitTime', params);
  }
  /**
   * @description: 查询集采供应商类型
   * @param {*} params
   */
  static async queryProcureTypeList() {
    return await http.bigdata.formDataPost('/api/goodsFillBoard/queryProcureTypeList');
  }
  /**
   * @description: 平衡毛利供应商
   * @param {*} params
   */
  static async querySupplierList(params: any) {
    return await http.bigdata.formDataPost('/api/balanceProfit/querySupplierList', params);
  }
  /**
   * @description: 平衡毛利货品详情
   * @param {*} params
   */
  static async querySupplierGoodsList(params: any) {
    return await http.bigdata.formDataPost('/api/balanceProfit/querySupplierGoodsList', params);
  }
  /**
   * @description: 平衡毛利货品详情card
   * @param {*} params
   */
  static async querySupplierAll(params: any) {
    return await http.bigdata.formDataPost('/api/balanceProfit/querySupplierAll', params);
  }
  /**
   * @description: 平衡毛利货品详情card
   * @param {*} params
   */
  static async getMonthSales(params: any) {
    return await http.bigdata.get('/api/purchase/board/analysis/monthSales', { params });
  }
  /**
   * @description: 平衡毛利货品详情card
   * @param {*} params
   */
  static async getRecent8weekSales(params: any) {
    return await http.bigdata.get('/api/purchase/board/analysis/recent/8weekSales', { params });
  }
  /**
   * @description: 根据用户权限获得采购数据
   * @param {*} params
   */
  static async getAuthDeptSales(params: any) {
    return await http.bigdata.get('/api/DataDept/getCdpAuthCenterDeptTree', { params });
  }
  /**
   * @description: 指定采购总体数据
   * @param {*} params
   */
  static async getGeneralStat(params: any) {
    return await http.bigdata.get('/api/purchase/board/analysis/generalStat', { params });
  }
  /**
   * @description: 货品满足看板数据
   * @param {*} params
   */
  static async getGoodsSatisfactionInfo(params: any) {
    return await http.bigdata.get('/api/purchase/board/analysis/getGoodsSatisfactionInfo', {
      params,
    });
  }
  /**
   * @description: KA供货商看板数据
   * @param {*} params
   */
  static async getKaPurveyorStat(params: any) {
    return await http.bigdata.get('/api/purchase/board/analysis/getKaPurveyorStat', { params });
  }
  /**
   * @description: 供货商看板数据
   * @param {*} params
   */
  static async getPurveyorStat(params: any) {
    return await http.bigdata.get('/api/purchase/board/analysis/getPurveyorStat', { params });
  }
  /**
   * @description: 锁控看板数据
   * @param {*} params
   */
  static async getSaleLockStat(params: any) {
    return await http.bigdata.get('/api/purchase/board/analysis/getSaleLockStat', { params });
  }
  /**
   * @description: 库存周转数据
   * @param {*} params
   */
  static async getTurnoverDaysInfo(params: any) {
    return await http.bigdata.get('/api/purchase/board/analysis/getTurnoverDaysInfo', { params });
  }
  /**
   * @description: 库存周转数据
   * @param {*} params
   */
  static async queryBigDataOverdueAmountDetail(params: any) {
    return await http.web.formDataPost('/api/receive/queryBigDataOverdueAmountDetail', params);
  }
  /**
   * @description: 查询应收账款总数详情
   * @param {*} params
   */
  static async queryBigDataReceivableDetail(params: any) {
    return await http.web.formDataPost('/api/receive/queryBigDataReceivableDetail', params);
  }
  /**
   * @description: 查询逾期列表
   * @param {*} params
   */
  static async queryBigDataOverdueDataList(params: any) {
    return await http.web.formDataPost('/api/receive/queryBigDataOverdueDataList', params);
  }
  /**
   * @description: 查询逾期细单
   * @param {*} params
   */
  static async queryBigDataOverdueDataDetail(params: any) {
    return await http.web.formDataPost('/api/receive/queryBigDataOverdueDataDetail', params);
  }
  /**
   * @description: 查询应收账款列表
   * @param {*} params
   */
  static async queryBigDataOverdueWarnList(params: any) {
    return await http.web.formDataPost('/api/receive/queryBigDataOverdueWarnList', params);
  }
  /**
   * @description: 查询应收账款细单
   * @param {*} params
   */
  static async queryBigDataOverdueWarnDetail(params: any) {
    return await http.web.formDataPost('/api/receive/queryBigDataOverdueWarnDetail', params);
  }
  /**
   * @description: 查询长账龄细单
   * @param {*} params
   */
  static async queryLongAccountsDataList(params: any) {
    return await http.web.formDataPost('/api/receive/queryLongAccountsDataList', params);
  }
  /**
   * @description: 查询长账龄细单
   * @param {*} params
   */
  static async queryLongAccountsDataDetail(params: any) {
    return await http.web.formDataPost('/api/receive/queryLongAccountsDataDetail', params);
  }
  /**
   * @description: 查询应收账款总数
   * @param {*} params
   */
  static async queryBigDataReceivable(params: any) {
    return await http.web.formDataPost('/api/receive/queryBigDataReceivable', params);
  }

  /**
   * @description: 查询供应商集合统计列表
   * @param {*} params
   */
  static async getPurveyorStatList(params: any) {
    return await http.bigdata.post('/api/purchase/board/supply/getPurveyorStatList', params);
  }
}
