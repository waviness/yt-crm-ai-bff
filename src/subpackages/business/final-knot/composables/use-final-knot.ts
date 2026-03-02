import type { FinalKnotFilterData } from '../types';

export function useFinalKnot() {
  const filterShow = ref(false);
  const statusList = reactive([{ name: '未处理' }, { name: '已处理' }]);
  const activeTab = ref(0);
  const isJustSelf = ref(false);
  const rowIndex = ref(-1);
  // 获取权限
  const permissInit = () => {
    const permissions = useUserStore().permissions;
    const needQueryAll = permissions.some((item: any) => item === 'fpQueryAll');
    const needQueryAllEntrys = permissions.some((item: any) => item === 'fpQueryEntry');
    const needQueryAllDept = permissions.some((item: any) => item === 'fpQueryDeptUser');
    if (!needQueryAll && !needQueryAllEntrys && !needQueryAllDept) {
      isJustSelf.value = true;
    } else {
      isJustSelf.value = false;
    }
  };
  const formData = ref<FinalKnotFilterData>({
    startTime: '',
    endTime: '',
    time: '',
    goodsId: '',
    goodsName: '',
    supplyId: '',
    supplyName: '',
  });
  const fetchData = async (params: { pageNum: number; pageSize: number }) => {
    const response = await FinalKnotService.getAllFinalPaymentOrderItem({
      startTime: formData.value.startTime ? formData.value.startTime : null,
      endTime: formData.value.endTime ? formData.value.endTime : null,
      suppplyId: formData.value.supplyId,
      supplyName: formData.value.supplyName,
      goodsId: formData.value.goodsId,
      goodsName: formData.value.goodsName,
      statusDtl: activeTab.value,
      selectType: isJustSelf.value ? 0 : 3,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
    });
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
      toolBarHeight: 110,
    },
    fetchData
  );
  return {
    filterShow,
    statusList,
    activeTab,
    formData,
    isJustSelf,
    rowIndex,
    list,
    refreshing,
    loadmoreConfig,
    pullRefreshHeight,
    onRefresh,
    onLoadMore,
    calcPullRefreshHeight,
    removeRow,
    permissInit,
  };
}
