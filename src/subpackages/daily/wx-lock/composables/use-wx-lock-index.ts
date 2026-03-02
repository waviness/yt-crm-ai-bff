/**
 * 微信锁控首页 Composable
 * 按页面轻复用原则，仅用于 index.vue
 */
export function useWxLockIndex() {
  // 筛选条件
  const formData = ref({
    startDate: time.format(time.add(new Date(), -4, 'day'), time.FORMATS.ISO_DATE),
    endDate: time.format(new Date(), time.FORMATS.ISO_DATE),
    entryId: '',
    customerKeyword: '',
    goodsKeyword: '',
    conType: '',
    taskid: '',
    condtlid: '',
    salesmanId: '',
    purchaserId: '',
    accessType: '',
    handleType: '',
  });

  // 核算单元列表
  const entryList = ref<any[]>([]);

  /**
   * 获取核算单元列表
   */
  const getEntryList = async () => {
    try {
      const res = await WxLockService.getEntrys({});
      entryList.value = [{ entryid: '', entryname: '全部' }, ...res];
    } catch (error) {
      console.error('获取核算单元列表失败:', error);
    }
  };

  /**
   * 筛选条件变化
   */
  const onFilterChange = (filterVal: any) => {
    formData.value = filterVal;
    onRefresh();
  };

  /**
   * 加载数据列表
   */
  const fetchData = async (params: { pageNum: number; pageSize: number }) => {
    const {
      startDate,
      endDate,
      entryId,
      customerKeyword,
      goodsKeyword,
      conType,
      taskid,
      condtlid,
      salesmanId,
      purchaserId,
      accessType,
      handleType,
    } = formData.value;

    const requestParams = {
      startDate: `${startDate} 00:00:00`,
      endDate: `${endDate} 23:59:59`,
      entryId,
      customerKeyword,
      goodsKeyword,
      conType,
      taskid,
      condtlid,
      salesmanId,
      purchaserId,
      accessType,
      handleType,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
    };

    const res = await WxLockService.getLockDoc(requestParams);
    return {
      list: res.list || [],
      hasNextPage: res.hasNextPage || false,
      total: res.total || 0,
    };
  };

  const {
    list,
    refreshing,
    loadmoreConfig,
    pullRefreshHeight,
    onRefresh,
    onLoadMore,
    calcPullRefreshHeight,
  } = usePagination(
    {
      pageSize: 10,
      initialPage: 1,
      toolBarHeight: 60,
    },
    fetchData
  );

  /**
   * 跳转到详情页
   */
  const toDetail = (data: any) => {
    router.push(RouteMap.wxLockDetail, { taskid: data.taskid });
  };

  return {
    // 数据
    list,
    refreshing,
    loadmoreConfig,
    pullRefreshHeight,
    formData,
    entryList,
    // 方法
    getEntryList,
    onFilterChange,
    onRefresh,
    onLoadMore,
    calcPullRefreshHeight,
    toDetail,
  };
}
