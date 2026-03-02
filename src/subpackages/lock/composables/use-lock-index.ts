import type { FilterValues, TabConfig } from '../types/index';
/**
 * 锁单页面组合式API
 * 提供锁单页面的所有业务逻辑和数据管理
 */
export function useLockIndex() {
  const goodsId = ref('');
  const statusFlag = ref(0);

  /**
   * 权限常量定义
   * @property {Object} SALES - 业务员权限
   * @property {string} SALES.ALL - 查询所有销售管理权限
   * @property {string} SALES.ENTRIES - 查询核算单元销售管理权限
   * @property {string} SALES.DEPT - 查询部门下属销售管理权限
   * @property {Object} SUPPLY - 采购权限
   * @property {string} SUPPLY.ALL - 查询所有采购管理权限
   * @property {string} SUPPLY.ENTRIES - 查询核算单元采购管理权限
   * @property {string} SUPPLY.DEPT - 查询部门下属采购管理权限
   * @property {string} OP - 管理员操作权限
   */
  const PERMISSIONS = {
    SALES: {
      ALL: 'QueryAllSalesManageForSaler',
      ENTRIES: 'QueryEntriesSalesManageForSaler',
      DEPT: 'QuerySubordinateSalesManageForSaler',
    },
    SUPPLY: {
      ALL: 'QueryAllSalesManageForSupply',
      ENTRIES: 'QueryEntriesSalesManageForSupply',
      DEPT: 'QuerySubordinateSalesManageForSupply',
    },
    OP: 'ManagementPermissionsAllowOperationsForSaler',
  };
  const messageEntry = ref(false); // 是否从消息入口进入
  /**
   * Tab列表配置
   * 不同类型和角色对应的Tab页配置
   */
  const TAB_CONFIG = computed<TabConfig>(() => ({
    0: {
      // 缺货
      1: [
        { name: '未处理', id: 0, disabled: messageEntry.value },
        { name: '已处理', id: 1, disabled: messageEntry.value },
        { name: '已到货', id: 2, disabled: messageEntry.value },
        { name: '已激活', id: 3, disabled: messageEntry.value },
      ],
      2: [
        { name: '未处理', id: 0, disabled: messageEntry.value },
        { name: '已处理', id: 1, disabled: messageEntry.value },
        { name: '已到货', id: 2, disabled: messageEntry.value },
      ],
    },
    2: {
      // 价格
      tabs: [
        { name: '未审核', id: 0 },
        { name: '已通过', id: 1 },
        { name: '未通过', id: 2 },
      ],
    },
    3: {
      // 库存下限
      tabs: [
        { name: '未审核', id: 0 },
        { name: '已通过', id: 1 },
        { name: '未通过', id: 2 },
      ],
    },
    5: {
      // 紧俏药品
      tabs: [
        { name: '未审核', id: 0 },
        { name: '已通过', id: 1 },
        { name: '未通过', id: 2 },
      ],
    },
    6: {
      // 禁限销
      1: [
        { name: '未处理', id: 0 },
        { name: '已处理', id: 1 },
        { name: '已激活', id: 2 },
      ],
      2: [
        { name: '未处理', id: 0 },
        { name: '已处理', id: 1 },
      ],
    },
    7: {
      // 库存状态
      tabs: [
        { name: '未激活', id: 0 },
        { name: '已激活', id: 1 },
      ],
    },
    8: {
      // 近效期
      tabs: [
        { name: '未激活', id: 0 },
        { name: '已激活', id: 1 },
      ],
    },
    4: {
      // 两票制
      1: [
        { name: '未处理', id: 0, disabled: messageEntry.value },
        { name: '已处理', id: 1, disabled: messageEntry.value },
        { name: '已到票', id: 2, disabled: messageEntry.value },
        { name: '已激活', id: 3, disabled: messageEntry.value },
      ],
      2: [
        { name: '未处理', id: 0, disabled: messageEntry.value },
        { name: '已处理', id: 1, disabled: messageEntry.value },
        { name: '已到票', id: 2, disabled: messageEntry.value },
      ],
    },
  }));
  // 响应式数据
  const role = ref<1 | 2>(1); // 角色 1 业务员 2 采购
  const conType = ref(0); // 合同类型
  const tabList = ref<{ name: string; id: number }[]>([]); // Tab列表
  const tabActive = ref(0); // 当前激活的Tab索引
  const needQueryAll = ref(false); // 是否有查询所有权限
  const needQueryAllEntrys = ref(false); // 是否有查询所有核算单元权限
  const needQueryAllDept = ref(false); // 是否有查询所有部门权限
  const managementAllowOperation = ref(false); // 管理员是否能够操作
  const orderByTimeCustomer = ref(0); // 排序方式：0-按时间降序 1-按时间升序 2-按客户ID降序 3-按客户ID升序
  const querySelfNumber = ref(1); // 是否仅查询自己的数据：1-是 2-否
  const selectLabelFlag = ref(false); // 是否处于批量处理模式
  const rowIndex = ref(-1); // 当前选中的行索引
  const showFilter = ref(false); // 是否显示筛选弹窗
  const selectObjList: any = ref([]); // 批量处理选中的单子列表
  const batchPopFlag = ref(false); // 是否显示批量处理弹窗

  /**
   * 排序选项配置
   */
  const orderOptions = [
    {
      name: '按时间降序',
      value: 0,
    },
    {
      name: '按时间升序',
      value: 1,
    },
    {
      name: '按客户ID降序',
      value: 2,
    },
    {
      name: '按客户ID升序',
      value: 3,
    },
  ];
  /**
   * 筛选表单数据
   */
  const formData = ref<FilterValues>({
    startTime: '',
    endTime: '',
    goodsKeyword: '',
    customerKeyword: '',
    operatingCustomerStatus: '',
    coreHospitalType: '',
    coreHospitalName: '',
    entryKeyword: '',
    publicHospitalFlag: '',
    exgoodsIds: [],
    conTypeList: [],
    conTypeText: '',
    isOutOfStockHandle: '',
    overdueFlag: '',
  });

  /**
   * 获取缺货列表数据
   * @param {Object} pagination - 分页参数
   * @param {number} pagination.pageNum - 当前页码
   * @param {number} pagination.pageSize - 每页数量
   * @returns {Promise<Object>} 包含列表数据、是否有下一页和总条数的对象
   */
  const fetchOutOfStockList = async (pagination: { pageNum: number; pageSize: number }) => {
    if (conType.value !== 0 && !conType.value) {
      return {
        list: [],
        hasNextPage: false,
        total: 0,
      };
    }
    // TODO: 获取缺货列表
    const params = {
      conType: conType.value,
      conTypeList:
        +role.value === 2
          ? conType.value === 0 &&
            formData.value.conTypeList &&
            formData.value.conTypeList.length === 0
            ? [0, 7, 8]
            : conType.value === 0 &&
                formData.value.conTypeList &&
                formData.value.conTypeList.length > 0
              ? formData.value.conTypeList
              : [conType.value]
          : [conType.value],
      goodsKeyword: messageEntry.value ? goodsId.value : formData.value.goodsKeyword,
      customerKeyword: formData.value.customerKeyword,
      publicHospitalFlag:
        formData.value.publicHospitalFlag === '' ? null : formData.value.publicHospitalFlag,
      entryKeyword: formData.value.entryKeyword,
      operatingCustomerStatus: formData.value.operatingCustomerStatus,
      startDate:
        !messageEntry.value && formData.value.startTime
          ? formData.value.startTime + ' 00:00:00'
          : '',
      endDate:
        !messageEntry.value && formData.value.endTime ? formData.value.endTime + ' 23:59:59' : '',
      excludeGoodsIdList: formData.value.exgoodsIds,
      identity: role.value, // 身份 1-业务 2-采购,可用值:1,2
      orderByTime: orderByTimeCustomer.value === 0 ? 0 : orderByTimeCustomer.value === 1 ? 1 : null, // 按时间排序 0-降序 1-升序
      orderByCustomer:
        orderByTimeCustomer.value === 2 ? 0 : orderByTimeCustomer.value === 3 ? 1 : null, // 按客户id排序 0-降序 1-升序
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      querySelfFlag: querySelfNumber.value, // 仅查询自己 1-是 2-否
      // 当conType=0或4时,statusFlag=0表示未处理,statusFlag=1表示已处理,statusFlag=2表示已到货,statusFlag=3表示已激活
      // 当conType=2或3或5时,statusFlag=0表示未审核,statusFlag=1表示已通过,statusFlag=2表示未通过
      // 当conType=6时,statusFlag=0表示未处理,statusFlag=1表示已处理,statusFlag=2表示已激活
      // 当conType=7或8时，statusFlag=0表示未激活，statusFlag=1表示已激活
      statusFlag: messageEntry.value ? statusFlag.value : tabActive.value,
      coreHospital: formData.value.coreHospitalType,
      overdueFlag: formData.value.overdueFlag,
      isOutOfStockHandle:
        formData.value.isOutOfStockHandle === '' ? null : formData.value.isOutOfStockHandle,
    };
    try {
      const data = await OutOfStockService.queryOutOfStockInfo(params);
      let list = [];
      if (conType.value === 2 || conType.value === 3 || conType.value === 5) {
        list = data.list.map((item: any) => {
          return {
            ...item,
            agreeNumber: item.contractQuantity,
          };
        });
      } else {
        list = data.list;
      }
      return {
        list,
        hasNextPage: data.hasNextPage,
        total: data.total,
      };
    } catch (error) {
      console.error('获取缺货列表失败:', error);
      return {
        list: [],
        hasNextPage: false,
        total: 0,
      };
    }
  };
  /**
   * 使用分页组合式API
   */
  const pagination = usePagination(
    {
      pageSize: 10,
      initialPage: 1,
      toolBarHeight: 110,
    },
    fetchOutOfStockList
  );
  const {
    list,
    refreshing,
    loadmoreConfig,
    pullRefreshHeight,
    onRefresh,
    onLoadMore,
    calcPullRefreshHeight,
    changeRowValue,
    removeRow,
  } = pagination;
  /**
   * 订阅点击事件
   * @param {1 | 2} type - 订阅类型
   * @param {any} item - 订阅的订单数据
   */
  /**
   * 订阅点击事件
   * @param {1 | 2} type - 订阅类型
   * @param {any} item - 订阅的订单数据
   */
  const subscribeClick = async (type: 1 | 2, item: any) => {
    try {
      await SubscribeReminderService.subscribeArrive({
        entryId: item.entryId,
        goodsId: item.goodsId,
        subType: type,
      });
      const message = type === 1 ? '订阅到货提醒成功' : '订阅到票提醒成功';
      showSuccess(message);
    } catch (error) {
      console.error('订阅失败:', error);
      showError('订阅失败');
    }
  };
  /**
   * 表单验证
   * @param {any[]} data - 待验证的数据
   * @returns {boolean} 验证结果
   */
  const Yz = (data: any) => {
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      if (!element.isAgree) {
        uni.showToast({ title: '解锁意见不能为空', icon: 'fail' });
        return;
      }
      if (element.isAgree === 2) {
        if (element.agreeNumber > element.contractQuantity) {
          uni.showToast({ title: '解锁数量不能超过合同数量', icon: 'fail' });
          return;
        } else if (element.agreeNumber === '') {
          uni.showToast({ title: '解锁数量不能为空', icon: 'fail' });
          return;
        } else if (parseInt(element.agreeNumber) <= 0) {
          uni.showToast({ title: '解锁数量不能小于等于0', icon: 'fail' });
          return;
        }
      }
    }
    return true;
  };
  /**
   * 复选框点击事件
   * @param {number} index - 行索引
   * @param {any} item - 行数据
   */
  const changeCheckClick = (index: number, item: any) => {
    changeRowValue(index, 'checked', !item.checked);
  };
  /**
   * Tab切换事件
   * @param {number} index - 切换到的Tab索引
   */
  const handleActiveChange = (index: number) => {
    tabActive.value = index;
    selectLabelFlag.value = false;
    onRefresh();
  };
  /**
   * 筛选确认事件
   * @param {FilterValues} filterVal - 筛选条件
   */
  const fliterConfirm = (filterVal: FilterValues) => {
    formData.value = { ...filterVal };
    onRefresh();
  };
  /**
   * 详情点击事件
   * @param {any} item - 订单数据
   * @param {number} index - 行索引
   */
  /**
   * 详情点击事件
   * @param {any} item - 订单数据
   * @param {number} index - 行索引
   */
  const detailClick = (item: any, index: number) => {
    rowIndex.value = index;
    uni.navigateTo({
      url: `/subpackages/lock/detail?taskId=${item.taskId}&role=${role.value}`,
    });
  };
  /**
   * 仅查询自己数据切换事件
   */
  const justSelfClick = () => {
    if (querySelfNumber.value === 1) {
      querySelfNumber.value = 2;
    } else {
      querySelfNumber.value = 1;
    }
    onRefresh();
  };
  /**
   * 排序点击事件
   */
  const orderClick = () => {
    showFilter.value = true;
  };
  /**
   * 批量解锁点击事件
   */
  const batchUnlockClick = () => {
    selectLabelFlag.value = !selectLabelFlag.value;
  };
  /**
   * 排序选择事件
   * @param {any} item - 排序选项
   */
  const handleOrderSelect = (item: any) => {
    orderByTimeCustomer.value = item.value;
    onRefresh();
  };
  /**
   * 解锁处理点击事件
   * @param {number} type - 处理类型：-1-不同意 2-同意
   */
  const deblockingClick = async (type: number) => {
    selectObjList.value = [];
    const checkedItems = list.value.filter((item: any) => item.checked);
    const params: any[] = [];
    if (!checkedItems.length) {
      uni.showToast({ title: '请选择要处理的数据', icon: 'fail' });
      return;
    }
    checkedItems.forEach((element: any) => {
      selectObjList.value.push({
        ...element,
      });
      params.push({
        isAgree: type,
        recordId: element.recordId,
        remark: element.remark,
        taskId: element.taskId,
        unlockQuantity: type === 2 ? element.agreeNumber : '',
        adjustPrice: element.contractPrice,
      });
    });
    console.log('params', params);

    const yzReturn = Yz(params);
    if (yzReturn) {
      if (type === -1) {
        uni.showModal({
          title: '提示',
          content: `是否确认不同意已选${selectObjList.value.length}条订单`,
          confirmColor: '#2271f5',
          success: res => {
            if (res.confirm) {
              _batchUnlockOrder(params);
            }
          },
        });
      } else if (type === 2) {
        batchPopFlag.value = true;
      }
    }
  };

  /**
   * 批量同意确定事件
   */
  const batchPopClick = () => {
    let params = [];
    for (let index = 0; index < selectObjList.value.length; index++) {
      const element = selectObjList.value[index];
      params.push({
        isAgree: 2,
        recordId: element.recordId,
        remark: element.remark,
        taskId: element.taskId,
        unlockQuantity: element.agreeNumber,
        adjustPrice: element.contractPrice,
      });
    }
    console.log('params', params);

    _batchUnlockOrder(params);
  };
  /**
   * 批量解锁订单
   * @param {any} params - 解锁参数
   */
  const _batchUnlockOrder = async (params: any) => {
    try {
      const data = await OutOfStockService.batchUnlockOrder(params);
      if (data) {
        showSuccess('解锁成功');
        selectLabelFlag.value = false;
        batchPopFlag.value = false;
        onRefresh();
      } else {
        showError('解锁失败');
      }
    } catch (error) {
      console.error('批量解锁失败:', error);
      showError('解锁失败');
    }
  };
  /**
   * 初始化方法
   * @param {Object} options - 初始化选项
   * @param {1 | 2} options.roleValue - 角色值：1-业务员 2-采购
   * @param {number} options.conTypeValue - 合同类型
   * @param {boolean} options.messageFlag - 是否从消息入口进入
   */
  const init = (options: {
    role: 1 | 2;
    goodsId?: number;
    conType: number;
    statusFlag?: number;
    taskId?: number;
  }) => {
    // 获取权限
    const permissions = useUserStore().permissions;
    role.value = +options.role as 1 | 2;
    conType.value = Number(options.conType);
    // 根据角色设置权限
    if (role.value === 1) {
      needQueryAll.value = permissions.includes(PERMISSIONS.SALES.ALL);
      needQueryAllEntrys.value = permissions.includes(PERMISSIONS.SALES.ENTRIES);
      needQueryAllDept.value = permissions.includes(PERMISSIONS.SALES.DEPT);
    } else if (role.value === 2) {
      needQueryAll.value = permissions.includes(PERMISSIONS.SUPPLY.ALL);
      needQueryAllEntrys.value = permissions.includes(PERMISSIONS.SUPPLY.ENTRIES);
      needQueryAllDept.value = permissions.includes(PERMISSIONS.SUPPLY.DEPT);
    }
    managementAllowOperation.value = permissions.includes(PERMISSIONS.OP);
    // 从路由参数获取值
    messageEntry.value = !!options.taskId;
    tabActive.value = options.statusFlag || 0;
    console.log('statusFlag', statusFlag.value);
    formData.value.goodsKeyword = options.goodsId ? options.goodsId.toString() : '';
    // 根据类型设置tab列表
    const config = TAB_CONFIG.value[conType.value];
    console.log('config', config);
    if (config) {
      if (config.tabs) {
        tabList.value = config.tabs;
      } else {
        // 使用类型断言确保 role.value 是有效的键
        const roleTabs = config[role.value as keyof typeof config];
        if (roleTabs) {
          tabList.value = roleTabs;
        }
      }
    }
  };
  return {
    goodsId,
    statusFlag,
    role,
    conType,
    messageEntry,
    tabList,
    tabActive,
    needQueryAll,
    needQueryAllEntrys,
    needQueryAllDept,
    managementAllowOperation,
    formData,
    selectLabelFlag,
    rowIndex,
    orderByTimeCustomer,
    querySelfNumber,
    showFilter,
    orderOptions, // 排序选项
    selectObjList,
    batchPopFlag,
    list,
    refreshing,
    loadmoreConfig,
    pullRefreshHeight,
    onRefresh,
    onLoadMore,
    calcPullRefreshHeight,
    changeRowValue,
    removeRow,
    init,
    fetchOutOfStockList,
    subscribeClick,
    Yz,
    changeCheckClick,
    handleActiveChange,
    fliterConfirm,
    detailClick,
    justSelfClick,
    orderClick,
    batchUnlockClick,
    handleOrderSelect,
    deblockingClick,
    batchPopClick,
  };
}
