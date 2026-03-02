import type { CollectionClaimFilterData } from '../types';
export function useCollectionClaim() {
  const filterShow = ref(false);
  const statusList = reactive([{ name: '未上传' }, { name: '已上传' }]);
  const activeTab = ref(0);
  const initFalg = ref(false);
  const usestatusString = ref('未认领,部分认领等');
  const rowIndex = ref(-1);
  // 初始化筛选条件
  const formData = ref<CollectionClaimFilterData>({
    accdocid: '',
    custom: '',
    entry: '',
    ordercustomname: '',
    usestatusList: ['1', '2', '3'],
    advancePayFlag: '1',
  });
  const fetchData = async (params: { pageNum: number; pageSize: number }) => {
    const response = await CollectionClaimService.getAllFinalPaymentOrderItem({
      accdocid: formData.value.accdocid,
      custom: formData.value.custom,
      entry: formData.value.entry,
      ordercustomname: formData.value.ordercustomname,
      usestatusList: formData.value.usestatusList,
      advancePayFlag: formData.value.advancePayFlag,
      uploadstatus: activeTab.value,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
    });
    return {
      list: response.data.list || [],
      hasNextPage: response.data.hasNextPage || false,
      total: response.data.total || 0,
    };
  };
  const initPermissions = () => {
    const permissions = useUserStore().permissions;
    const leaderFlag = permissions.some((item: any) => item === 'collectionClaimWx-all');
    if (leaderFlag) {
      formData.value.entry = '3';
      formData.value.usestatusList = ['1'];
      usestatusString.value = '未认领';
    }
    initFalg.value = true;
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
    statusList,
    activeTab,
    rowIndex,
    filterShow,
    initFalg,
    formData,
    usestatusString,
    list,
    refreshing,
    loadmoreConfig,
    pullRefreshHeight,
    onRefresh,
    onLoadMore,
    calcPullRefreshHeight,
    removeRow,
    initPermissions,
  };
}
