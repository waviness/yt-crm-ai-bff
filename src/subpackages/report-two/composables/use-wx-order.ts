import type { OrderFilterParams } from '../types/index';

export function useWxOrder(orderType: string) {
  const formData = ref<OrderFilterParams>({
    orderType: '',
    customId: '',
    customName: '',
    codDocId: '',
    endTime: '',
    startTime: '',
  });
  const fetchData = async (params: { pageNum: number; pageSize: number }) => {
    const response = await WxOrderService.getOrderDoc({
      orderType: orderType ? orderType : formData.value.orderType,
      customId: formData.value.customId,
      customName: formData.value.customName,
      codDocId: formData.value.codDocId,
      endtime: formData.value.endTime ? formData.value.endTime + ' 23:59:59' : '',
      starttime: formData.value.startTime ? formData.value.startTime + ' 00:00:00' : '',
      pageNum: params.pageNum,
      pageSize: params.pageSize,
    });
    return {
      list: response.list || [],
      hasNextPage: response.hasNextPage || false,
      total: response.total || 0,
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
      toolBarHeight: 110,
    },
    fetchData
  );
  // 筛选弹窗显示状态
  const filterShow = ref(false);
  const onFilterConfirm = (filterVal: OrderFilterParams) => {
    formData.value = { ...filterVal };
    filterShow.value = false;
    calcPullRefreshHeight();
    onRefresh();
  };

  return {
    filterShow,
    formData,
    list,
    refreshing,
    loadmoreConfig,
    pullRefreshHeight,
    onRefresh,
    onLoadMore,
    calcPullRefreshHeight,
    removeRow,
    onFilterConfirm,
  };
}
