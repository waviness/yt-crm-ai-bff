/**
 * 两票制消息推送首页 Composable
 * 按页面轻复用原则,仅用于 index.vue
 */
export function useTwoVoteReminderIndex() {
  // 筛选条件
  const formData = ref({
    start: time.format(time.add(new Date(), -30, 'day'), time.FORMATS.ISO_DATE),
    end: time.format(new Date(), time.FORMATS.ISO_DATE),
    crmId: '',
    entryId: '',
    custom: '',
    dtlId: '', // 细单ID
    goods: '',
  });

  // 核算单元列表
  const entryList = ref<any[]>([]);

  // 订单总数
  const totalCount = ref(0);

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
    const { start, end, entryId, custom, crmId, dtlId, goods } = formData.value;

    const requestParams = {
      start,
      end,
      entryId,
      custom,
      crmId,
      dtlId,
      goods,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
    };

    const res = await CommonService.queryInvoiceSubList(requestParams);

    // 更新总数
    totalCount.value = res.total || 0;

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

  return {
    // 数据
    list,
    refreshing,
    loadmoreConfig,
    pullRefreshHeight,
    formData,
    entryList,
    totalCount,
    // 方法
    getEntryList,
    onFilterChange,
    onRefresh,
    onLoadMore,
    calcPullRefreshHeight,
  };
}
