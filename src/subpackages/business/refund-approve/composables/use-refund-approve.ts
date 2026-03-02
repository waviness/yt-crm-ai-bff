import { RefundApproveService } from '@/api/refund-approve';
import type { RefundApproveFilterData } from '../types';

export function useRefundApprove() {
  const filterShow = ref(false);
  const statusList = reactive([{ name: '待审批' }, { name: '审批通过' }, { name: '审批不通过' }]);
  const activeTab = ref(0);
  const rowIndex = ref(-1);

  // 筛选表单数据
  const formData = ref<RefundApproveFilterData>({
    goodsKeyword: '',
    customerKeyword: '',
  });

  // 获取列表数据
  const fetchData = async (params: { pageNum: number; pageSize: number }) => {
    const response = await RefundApproveService.query({
      status: activeTab.value,
      goodsNameOrId: formData.value.goodsKeyword,
      custNameOrId: formData.value.customerKeyword,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
    });
    return {
      list: response.list || [],
      hasNextPage: response.hasNextPage || false,
      total: response.total || 0,
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
