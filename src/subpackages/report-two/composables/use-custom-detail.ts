export function useReportCustomDetail(getGoodsParams: any, type: 'report' | 'two-pin' = 'report') {
  const fetchData = async (params: { pageNum: number; pageSize: number }) => {
    const baseParams = typeof getGoodsParams === 'function' ? getGoodsParams() : getGoodsParams;
    const payload = {
      ...baseParams,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
    };
    const response =
      type === 'report'
        ? await ReportService.getGoodsDoc(payload)
        : await TwoPinService.getGoods(payload);
    return {
      list: response.data.list || [],
      hasNextPage: response.data.hasNextPage || false,
      total: response.data.total || 0,
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
    removeRow,
  } = usePagination(
    {
      pageSize: 10,
      initialPage: 1,
      toolBarHeight: 210,
    },
    fetchData
  );
  return {
    list,
    refreshing,
    loadmoreConfig,
    pullRefreshHeight,
    onRefresh,
    onLoadMore,
    calcPullRefreshHeight,
    removeRow,
  };
}
