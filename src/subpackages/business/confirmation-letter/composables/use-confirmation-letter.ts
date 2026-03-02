import type { FilterData, UpConfirmationLetterParams } from '../types';

export function useConfirmationLetter() {
  // 筛选弹窗显示控制
  const filterShow = ref(false);
  // 当前激活的标签页索引，默认为0
  const activeTab = ref(0); // 当前激活的标签页索引
  const statusList = reactive([
    { name: '未处理' },
    { name: '进行中' },
    { name: '已完成' },
    { name: '已审核' },
  ]); // 状态tab
  const validNumber = ref(0);
  // 表单数据
  const formData = ref<FilterData>({
    startTime: '',
    endTime: '',
    confirmadocid: '',
    customerId: '',
    customName: '',
  });
  const fetchData = async (params: { pageNum: number; pageSize: number }) => {
    const response = await ConfirmationLetterService.getConfirmationRequestList({
      startTime: formData.value.startTime ? formData.value.startTime : '',
      endTime: formData.value.endTime ? formData.value.endTime : '',
      confirmadocid: formData.value.confirmadocid,
      customerId: formData.value.customerId,
      customName: formData.value.customName,
      type: activeTab.value,
      keyWords: '',
      pageNum: params.pageNum,
      pageSize: params.pageSize,
    });
    console.log(response);
    return {
      list: response.data.list || [],
      hasNextPage: response.data.hasNextPage || false,
      total: response.data.total || 0,
    };
  };
  const fetchExceedTimeLimitTask = async () => {
    const response = await ConfirmationLetterService.exceedTimeLimitTask({
      pageNum: 1,
      pageSize: 1,
    });
    validNumber.value = response.data.total;
  };
  const changeStatus = async (params: UpConfirmationLetterParams) => {
    const response = await ConfirmationLetterService.updateConfirmationRequestStatue(params);
    if (response.code === '200') {
      showSuccess(response.msg);
      removeRow(params.index);
    }
  };
  const rowIndex = ref(-1);
  const toDetail = (index: number) => {
    rowIndex.value = index;
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
  return {
    filterShow,
    activeTab,
    statusList,
    formData,
    validNumber,
    list,
    refreshing,
    loadmoreConfig,
    pullRefreshHeight,
    rowIndex,
    onRefresh,
    onLoadMore,
    calcPullRefreshHeight,
    fetchExceedTimeLimitTask,
    changeStatus,
    toDetail,
    removeRow,
  };
}
