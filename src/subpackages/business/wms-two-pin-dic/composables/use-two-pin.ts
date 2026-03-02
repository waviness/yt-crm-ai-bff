import type { TwoPinFilterData } from '../types';

export function useTwoPin() {
  const filterShow = ref(false);
  const statusList = reactive([{ name: '未处理' }, { name: '已处理' }]);
  const activeTab = ref(0);
  const rowIndex = ref(-1);

  // 筛选表单数据
  const formData = ref<TwoPinFilterData>({
    goodsNameOrId: '',
    entryId: '',
    entryName: '',
  });

  // 获取列表数据
  const fetchData = async (params: { pageNum: number; pageSize: number }) => {
    const response = await TwoPinService.getGoodsResellPcqs({
      entryId: formData.value.entryId,
      entryName: formData.value.entryName,
      goodsNameOrId: formData.value.goodsNameOrId,
      pqcsFlag: activeTab.value,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
    });
    return {
      list: response.data?.list || [],
      hasNextPage: response.data.hasNextPage || false,
      total: response.data?.total || 0,
    };
  };

  // 使用分页hook
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

  return {
    filterShow,
    statusList,
    activeTab,
    formData,
    rowIndex,
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
