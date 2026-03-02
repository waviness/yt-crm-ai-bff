export function useMapDetail() {
  const appStore = useAppStore();
  // State
  const domainUrl = computed(() => appStore.domainUrl);
  const detailObj = computed(() => appStore.detailObj);
  const detailShowObj = reactive<any>({});
  const active = ref(0);
  const isStar = ref(false);
  const starloading = ref(false);
  const starDTOList = ref<any[]>([]);
  const warmthNumOptions = ref(['', '一般客情', '需进阶客情', '未接触客情']);

  // Utility Functions
  const getTaskTypeTag = (taskType: number): any => {
    return taskType === 1 ? 'primary' : taskType === 2 ? 'success' : 'warning';
  };

  const getTaskTypeText = (taskType: number): string => {
    return taskType === 1 ? '个人拜访' : taskType === 2 ? '协访' : taskType === 3 ? '接待' : '';
  };

  const getWarmthTypeTag = (warmthNum: number): any => {
    return warmthNum === 1 ? 'success' : warmthNum === 2 ? 'warning' : 'error';
  };

  const getWarmthColor = (warmthNum: number): string => {
    return warmthNum === 1 ? 'color-success' : warmthNum === 2 ? 'color-warning' : 'color-error';
  };

  const getCompanyTypeText = (companyType: number): string => {
    return companyType === 1
      ? '供应商'
      : companyType === 2
        ? '下游客户'
        : companyType === 3
          ? '政府单位'
          : '';
  };

  const fetchDataList = async (params: { pageNum: number; pageSize: number }) => {
    const res = await CustomerSituationMapService.visitMapQueryVisit({
      cciId: detailShowObj.cciId,
      pageSize: params.pageSize,
      pageNum: params.pageNum,
    });
    return {
      hasNextPage: res.data.hasNextPage || false,
      list: markRaw(res.data.list || []),
      total: res.data.total || 0,
    };
  };

  // Pagination Composable
  const {
    list,
    refreshing,
    loadmoreConfig,
    pullRefreshHeight,
    calcPullRefreshHeight,
    onRefresh,
    onLoadMore,
  } = usePagination(
    {
      pageSize: 10,
      initialPage: 1,
      toolBarHeight: 220,
    },
    fetchDataList
  );

  // API Calls
  const _visitMapQueryStar = async () => {
    starloading.value = true;
    try {
      const res = await CustomerSituationMapService.visitMapQueryStar({
        cciId: detailShowObj.cciId,
      });
      starDTOList.value = markRaw(res.data.starDTOList);
      isStar.value = res.data.isStar;
    } finally {
      starloading.value = false;
    }
  };

  // Event Handlers
  const changeClick = async (index: number) => {
    active.value = index;
    if (index === 0) {
      _visitMapQueryStar();
    } else if (index === 1) {
      await calcPullRefreshHeight();
      onRefresh();
    }
  };

  const opClick = () => {
    showModal({
      title: '',
      content: `是否确认对该条打卡信息${detailShowObj.isStar ? '取消' : ''}点赞`,
      confirmText: '确定',
      confirmColor: '#2271f5',
      success: async res => {
        if (res.confirm) {
          try {
            const response = await CustomerSituationMapService.visitMapStar({
              cciId: detailShowObj.cciId,
              operate: detailShowObj.isStar ? 2 : 1,
            });
            await _visitMapQueryStar();
            if (+response.code === 200) {
              detailShowObj.isStar = !detailShowObj.isStar;
              detailShowObj.starNum = detailShowObj.isStar
                ? detailShowObj.starNum + 1
                : detailShowObj.starNum - 1;
              appStore.setDetailObj(detailShowObj);
              appStore.setHadDoneOnDetail(true);
              uni.showToast({ title: response.msg || '操作成功', icon: 'success' });
            } else {
              uni.showToast({ title: response.msg || '操作失败，请稍后重试', icon: 'none' });
            }
          } catch (err) {
            uni.showToast({ title: '操作失败，请稍后重试', icon: 'none' });
          }
        }
      },
    });
  };
  return {
    domainUrl: domainUrl.value,
    detailObj,
    detailShowObj,
    active,
    isStar,
    starloading,
    starDTOList,
    warmthNumOptions,
    getTaskTypeTag,
    getTaskTypeText,
    getWarmthTypeTag,
    getWarmthColor,
    getCompanyTypeText,
    changeClick,
    opClick,

    list,
    refreshing,
    loadmoreConfig,
    pullRefreshHeight,
    calcPullRefreshHeight,
    onRefresh,
    onLoadMore,
  };
}
