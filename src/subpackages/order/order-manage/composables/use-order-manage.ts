/**
 * 订单管理页面业务逻辑
 * 管理筛选、排序、分页等相关逻辑
 */
import type { OrderFilterData, OrderSortParams, TimeType, TabType } from '../types';

export const useOrderManage = () => {
  // 响应式数据
  const show = ref(false);
  const showSort = ref(false);
  const isJustSelf = ref(false);
  const tabActiveIndex = ref<TabType>(0);
  const timeType = ref<TimeType>(0 as TimeType); // 原始代码初始值为 0
  const timeList = ref<Date[]>([]);

  const filterObj = ref<OrderFilterData>({
    goodsId: '',
    goodsName: '',
    customerId: '',
    customerName: '',
    entryKeyword: '',
    time: '',
  });

  const originFilter = ref<OrderFilterData>({
    goodsId: '',
    goodsName: '',
    customerId: '',
    customerName: '',
    entryKeyword: '',
    time: '',
  });

  const sortParams = ref<OrderSortParams>({
    orderAmountSort: null,
    orderCountSort: 0,
    orderSortType: 1,
    orderText: '未完成笔数降序',
  });

  const sortColumns = ref([
    ['总订单金额', '总订单笔数', '未完成笔数', '未完成金额'],
    ['降序', '升序'],
  ]);

  // 权限相关
  const needQueryAll = ref(false);
  const needQueryAllEntrys = ref(false);
  const needQueryAllDept = ref(false);

  // 计算属性
  const getOtherClass = computed(() => {
    if (
      filterObj.value.goodsId ||
      filterObj.value.goodsName ||
      filterObj.value.customerId ||
      filterObj.value.customerName
    ) {
      return 'have-filter';
    }
    return '';
  });

  const getMinData = computed(() => {
    if (tabActiveIndex.value === 1) {
      return new Date(new Date().getTime() - 31 * 24 * 60 * 60 * 1000);
    } else {
      return new Date(new Date().getTime() - 365 * 24 * 60 * 60 * 1000);
    }
  });

  const getMaxData = computed(() => {
    if (tabActiveIndex.value === 1) {
      return new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    } else {
      return new Date();
    }
  });

  // 显示筛选弹窗
  const showPopup = () => {
    originFilter.value = deepClone(filterObj.value);
    show.value = true;
  };

  // 处理标签页切换
  const handleTabChange = ({ index }: { index: number }) => {
    tabActiveIndex.value = index as TabType;
    if (tabActiveIndex.value !== 0) {
      // 切换到历史订单或可激活订单时，自动设置时间范围
      changeTime(1);
    } else {
      // 切换到当日订单时，清空时间范围
      timeList.value = [];
      filterObj.value.time = '';
    }
  };

  // 改变时间范围
  const changeTime = (index: TimeType) => {
    timeType.value = index;
    switch (index) {
      case 1:
        if (tabActiveIndex.value === 1) {
          timeList.value = [
            new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000),
            new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
          ];
        } else {
          timeList.value = [
            new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000),
            new Date(new Date().getTime()),
          ];
        }
        break;
      case 2:
        if (tabActiveIndex.value === 1) {
          timeList.value = [
            new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000),
            new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
          ];
        } else {
          timeList.value = [
            new Date(new Date().getTime() - 4 * 24 * 60 * 60 * 1000),
            new Date(new Date().getTime()),
          ];
        }
        break;
      case 3:
        if (tabActiveIndex.value === 1) {
          timeList.value = [
            new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
            new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
          ];
        } else {
          timeList.value = [
            new Date(new Date().getTime() - 6 * 24 * 60 * 60 * 1000),
            new Date(new Date().getTime()),
          ];
        }
        break;
      case 4:
        // 自定义时间选择，需要打开日历（由组件处理）
        return false;
    }
    if (timeType.value !== 4) {
      // 原始代码中 filterObj.time 只显示日期部分，不包含时间
      filterObj.value.time =
        time.format(timeList.value[0], time.FORMATS.ISO_DATE) +
        ' ~ ' +
        time.format(timeList.value[1], time.FORMATS.ISO_DATE);
      return true; // 需要刷新
    }
    return false;
  };

  // 重置筛选条件
  const refreshFilter = () => {
    filterObj.value.goodsId = '';
    filterObj.value.goodsName = '';
    filterObj.value.customerId = '';
    filterObj.value.customerName = '';
  };

  // 处理筛选确认
  const handleFilter = () => {
    show.value = false;
    if (
      filterObj.value.goodsId === originFilter.value.goodsId &&
      filterObj.value.goodsName === originFilter.value.goodsName &&
      filterObj.value.customerId === originFilter.value.customerId &&
      filterObj.value.customerName === originFilter.value.customerName
    ) {
      return false;
    }
    // 确认筛选后，更新 originFilter，这样关闭时恢复的就是确认后的值
    originFilter.value = deepClone(filterObj.value);
    return true; // 需要刷新
  };

  // 确认时间选择
  const onConfirm = (date: Date[]) => {
    timeList.value = [date[0], date[1]];
    // 原始代码中 filterObj.time 只显示日期部分，不包含时间
    filterObj.value.time =
      time.format(timeList.value[0], time.FORMATS.ISO_DATE) +
      ' ~ ' +
      time.format(timeList.value[1], time.FORMATS.ISO_DATE);
  };

  // 处理排序
  const handleSort = (label: string[], value: number[]) => {
    sortParams.value.orderText = label[0] + ' ' + label[1];
    sortParams.value.orderCountSort = value[1];
    const columns = value[0];
    const type = value[1];

    switch (columns) {
      case 0:
        sortParams.value.orderAmountSort = type;
        sortParams.value.orderCountSort = null;
        sortParams.value.orderSortType = 0;
        break;
      case 1:
        sortParams.value.orderAmountSort = null;
        sortParams.value.orderCountSort = type;
        sortParams.value.orderSortType = 0;
        break;
      case 2:
        sortParams.value.orderAmountSort = null;
        sortParams.value.orderCountSort = type;
        sortParams.value.orderSortType = 1;
        break;
      case 3:
        sortParams.value.orderAmountSort = type;
        sortParams.value.orderCountSort = null;
        sortParams.value.orderSortType = 1;
        break;
    }
    showSort.value = false;
  };

  // 取消排序
  const handleSortCancel = () => {
    sortParams.value.orderAmountSort = null;
    sortParams.value.orderCountSort = null;
    sortParams.value.orderText = '排序方式';
    sortParams.value.orderSortType = 1;
    showSort.value = false;
  };

  // 关闭筛选弹窗
  const closePopup = () => {
    filterObj.value.goodsId = originFilter.value.goodsId;
    filterObj.value.goodsName = originFilter.value.goodsName;
    filterObj.value.customerId = originFilter.value.customerId;
    filterObj.value.customerName = originFilter.value.customerName;
    filterObj.value.entryKeyword = originFilter.value.entryKeyword;
  };

  // 获取订单列表数据
  const fetchOrderList = async (params: { pageNum: number; pageSize: number }) => {
    const requestParams: any = {
      customerName: filterObj.value.customerName || '',
      goodsId: filterObj.value.goodsId || '',
      goodsName: filterObj.value.goodsName || '',
      customerId: filterObj.value.customerId || '',
      orderType: tabActiveIndex.value,
      selectType: isJustSelf.value ? 0 : 3,
      startTime:
        timeList.value.length === 2
          ? time.format(timeList.value[0], time.FORMATS.ISO_DATE) + ' 00:00:00'
          : undefined,
      endTime:
        timeList.value.length === 2
          ? time.format(timeList.value[1], time.FORMATS.ISO_DATE) + ' 23:59:59'
          : undefined,
      orderSortType: sortParams.value.orderSortType,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
    };

    // 只在不为 null 时才添加排序参数
    if (sortParams.value.orderAmountSort !== null) {
      requestParams.orderAmountSort = sortParams.value.orderAmountSort;
    }
    if (sortParams.value.orderCountSort !== null) {
      requestParams.orderCountSort = sortParams.value.orderCountSort;
    }

    const response = await OrderManageService.customerOrderInfoList(requestParams);
    return {
      list: response.list || [],
      hasNextPage: response.hasNextPage || false,
      total: response.total || 0,
    };
  };

  // 切换显示范围
  const toggleJustSelf = () => {
    isJustSelf.value = !isJustSelf.value;
  };

  // 初始化权限
  const initPermissions = () => {
    needQueryAll.value = hasPermission('orderintegrateWx-query-all');
    needQueryAllEntrys.value = hasPermission('orderintegrateWx-query-entry');
    needQueryAllDept.value = hasPermission('orderintegrateWx-query-dept');
  };

  return {
    // 响应式数据
    show,
    showSort,
    isJustSelf,
    tabActiveIndex,
    timeType,
    timeList,
    filterObj,
    sortParams,
    sortColumns,
    needQueryAll,
    needQueryAllEntrys,
    needQueryAllDept,

    // 计算属性
    getOtherClass,
    getMinData,
    getMaxData,

    // 方法
    showPopup,
    handleTabChange,
    changeTime,
    refreshFilter,
    handleFilter,
    onConfirm,
    handleSort,
    handleSortCancel,
    closePopup,
    fetchOrderList,
    toggleJustSelf,
    initPermissions,
  };
};
