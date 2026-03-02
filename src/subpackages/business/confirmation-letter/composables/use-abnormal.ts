import type { AbnormalFilterData } from '../types';
export function useAbnormal() {
  const role = ref(0);
  // 筛选弹窗显示控制
  const filterShow = ref(false);

  // 筛选表单数据
  const formData = ref<AbnormalFilterData>({
    startTime: '',
    endTime: '',
    customerId: '',
    customName: '',
    entryId: '',
    entryName: '',
    contactId: '',
    contactName: '',
  });

  // 状态列表
  const statusList = reactive([{ name: '未处理' }, { name: '已处理' }]);
  const activeTab = ref(0);

  // 筛选条件变更处理
  const onFilterConfirm = (filterVal: AbnormalFilterData) => {
    filterShow.value = false;
    formData.value = { ...filterVal };
    // TODO: 在这里调用接口刷新列表数据
    console.log('筛选条件:', filterVal);
  };

  // 标签页切换处理
  const onhandleActiveChange = ({ index }: { index: number }) => {
    activeTab.value = index;
    // TODO: 在这里根据标签页刷新列表数据
    onRefresh();
  };
  const fetchData = async (params: { pageNum: number; pageSize: number }) => {
    const response = await ConfirmationLetterService.initiatedConfirmationRequest({
      role: role.value,
      type: activeTab.value,
      startTime: formData.value.startTime ? formData.value.startTime + ' 00:00:00' : '',
      endTime: formData.value.endTime ? formData.value.endTime + ' 23:59:59' : '',
      customerId: formData.value.customerId,
      customerName: formData.value.customName,
      contactId: formData.value.contactId,
      contactName: formData.value.contactName,
      entryId: formData.value.entryId,
      entryName: formData.value.entryName,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
    });
    console.log(response.data.list);
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
      toolBarHeight: 145,
    },
    fetchData
  );
  const listIndex = ref(-1);
  const detailClick = (item: any, index: number) => {
    listIndex.value = index;
    router.push('/subpackages/business/confirmation-letter/abnormal-detail', {
      ccrId: item.ccrId,
      role: role.value,
    });
  };
  return {
    role,
    filterShow,
    formData,
    statusList,
    activeTab,
    list,
    refreshing,
    loadmoreConfig,
    pullRefreshHeight,
    listIndex,
    onRefresh,
    onLoadMore,
    calcPullRefreshHeight,
    removeRow,
    onFilterConfirm,
    onhandleActiveChange,
    detailClick,
  };
}
