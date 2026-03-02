/**
 * 订阅提醒列表页面业务逻辑
 * 管理搜索、筛选和分页相关逻辑
 */
export const useSubscribeReminderList = () => {
  // 响应式数据
  const searchParams = ref({
    goodsKeyword: '',
    subType: 1, // 1-到货提醒, 2-到票提醒
  });

  const filterData = ref({
    goodsId: '',
    goodsName: '',
    sendFlag: 0, // 0-全部, 1-已发送, 2-未发送
  });

  const originalFilter = ref({
    goodsId: '',
    goodsName: '',
    sendFlag: 0,
  });

  const showFilterPopup = ref(false);

  // 计算属性
  const isFiltered = computed(() => {
    return !!(filterData.value.goodsId || filterData.value.goodsName || filterData.value.sendFlag);
  });

  const timeTitle = computed(() => {
    return searchParams.value.subType === 1 ? '到货时间' : '到票时间';
  });

  const isSearchMode = computed(() => {
    return !!searchParams.value.goodsKeyword;
  });

  // 获取订阅到货/到票列表数据
  const fetchSubscribeArriveList = async (params: { pageNum: number; pageSize: number }) => {
    console.log('fetchSubscribeArriveList', filterData.value);
    const requestParams = {
      subType: searchParams.value.subType,
      goodsId: filterData.value.goodsId,
      goodsName: filterData.value.goodsName,
      sendFlag: filterData.value.sendFlag || '',
      pageNum: params.pageNum,
      pageSize: params.pageSize,
    };

    const response = await SubscribeReminderService.getSubscribeArriveList(requestParams);
    return {
      list: response.list || [],
      hasNextPage: response.hasNextPage || false,
      total: response.total || 0,
    };
  };

  // 获取可订阅品种列表数据
  const fetchSubscribableGoodsList = async (params: { pageNum: number; pageSize: number }) => {
    console.log('fetchSubscribableGoodsList', filterData.value);
    const requestParams = {
      goodsKeyword: searchParams.value.goodsKeyword,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
    };

    const response = await SubscribeReminderService.getCanSubGoodsList(requestParams);
    return {
      list: response.list || [],
      hasNextPage: response.hasNextPage || false,
      total: response.total || 0,
    };
  };

  // 筛选相关方法
  const showFilter = () => {
    originalFilter.value = { ...filterData.value };
    showFilterPopup.value = true;
  };

  const confirmFilter = (newFilterData: any) => {
    // 检查筛选条件是否有变化
    const hasChanged =
      newFilterData.goodsId !== originalFilter.value.goodsId ||
      newFilterData.goodsName !== originalFilter.value.goodsName ||
      newFilterData.sendFlag !== originalFilter.value.sendFlag;

    if (hasChanged) {
      filterData.value = { ...newFilterData };
      console.log('filterData', filterData.value);
    }

    return hasChanged;
  };

  return {
    // 响应式数据
    searchParams,
    filterData,
    showFilterPopup,

    // 计算属性
    isFiltered,
    timeTitle,
    isSearchMode,

    // 数据获取方法
    fetchSubscribeArriveList,
    fetchSubscribableGoodsList,

    // 筛选方法
    showFilter,
    confirmFilter,
  };
};
