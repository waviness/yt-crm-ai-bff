/**
 * 锁详情组合式函数
 * 用于管理锁详情页面的状态和逻辑
 * 包括获取锁详情、提交成功后刷新、初始化权限等功能
 */
import type { DetailObj } from '../types';

export function useLockDetail() {
  const appStore = useAppStore();

  /**
   * 锁详情对象
   */
  const detailObj = ref<DetailObj>({
    taskId: '', // 任务ID
    createTime: '', // 创建时间
    conDtlId: '', // 合同明细ID
    customerId: '', // 客户ID
    customerName: '', // 客户名称
    goodsId: '', // 商品ID
    goodsName: '', // 商品名称
    contractQuantity: '', // 合同数量
    salesmanName: '', // 销售人员名称
    purchaserName: '', // 采购人员名称
    coreHospital: undefined, // 核心医院
    branchId: undefined, // 分支ID
    brandName: undefined, // 品牌名称
    entryId: '', // 核算单元ID
    entryName: '', // 核算单元名称
    conType: 0, // 合同类型
    goodsCurrencyName: undefined, // 商品币种名称
    goodsType: '', // 商品类型
    factoryName: '', // 厂家名称
    lastBuyContractCreateTime: undefined, // 最后一次采购合同创建时间
    isAutoOrder: undefined, // 是否自动下单
    signAddress: undefined, // 签约地址
    operatingCustomerStatus: undefined, // 运营客户状态
    ddlId: undefined, // DDL ID
    ddlName: undefined, // DDL名称
    confirmedQuantity: undefined, // 确认数量
    twoInvoiceLeftQuantity: '', // 两票制剩余数量
    yyStockQuantity: undefined, // 药业库存数量
    totalAvailableStockQuantity: '', // 总可用库存数量
    stockQuantity: undefined, // 库存数量
    reservePlanQuantity: undefined, // 预留计划数量
    reserveDocId: undefined, // 预留文档ID
    examinePrice: '', // 审核价格
    contractPrice: '', // 合同价格
    lastSellPrice: undefined, // 最后一次销售价格
    limitPrice: undefined, // 限价
    zxErrorMessage: undefined, // 错误信息
    memo: undefined, // 备注
    arriveTime: undefined, // 到货时间
    purchaserId: '', // 采购人员ID
  });

  /**
   * 获取锁详情
   */
  const fetchDetail = async (taskId: string) => {
    try {
      const data = await OutOfStockService.queryOutOfStockDetail({ taskId });
      detailObj.value = data;
    } catch (error) {
      console.error('获取锁详情失败:', error);
      showError('获取锁详情失败');
    }
  };

  /**
   * 提交成功后刷新页面
   */
  const submitSuccess = async () => {
    if (detailObj.value.statusFlag === 1) {
      appStore.setHadDoneOnDetail(false);
    } else {
      appStore.setHadDoneOnDetail(true);
    }
    fetchDetail(detailObj.value.taskId);
  };

  /**
   * 销售是否有管理操作权限
   */
  const managementOpflagForSaler = ref(false);

  /**
   * 采购是否有管理操作权限
   */
  const managementOpflagForPurchaser = ref(false);

  /**
   * 是否查询自己的数据（1-是 0-否）
   */
  const querySelfNumber = ref(1);

  /**
   * 初始化权限
   */
  const initPermissions = async () => {
    const permissions = useUserStore().permissions;
    managementOpflagForSaler.value = permissions.some(
      (item: any) => item === 'ManagementPermissionsAllowOperationsForSaler'
    );
    managementOpflagForPurchaser.value = permissions.some(
      (item: string) => item === 'ManagementPermissionsAllowOperationsForPurchaser'
    );
  };
  return {
    /** 锁详情对象 */
    detailObj,
    /** 销售是否有管理操作权限 */
    managementOpflagForSaler,
    /** 采购是否有管理操作权限 */
    managementOpflagForPurchaser,
    /** 是否查询自己的数据（1-是 0-否） */
    querySelfNumber,
    /** 获取锁详情 */
    fetchDetail,
    /** 提交成功后刷新页面 */
    submitSuccess,
    /** 初始化权限 */
    initPermissions,
  };
}
