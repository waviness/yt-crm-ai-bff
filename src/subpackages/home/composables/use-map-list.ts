export function useMapList() {
  // const pages = getCurrentPages();
  // const currentPage = pages[pages.length - 1];
  const routeQuery = ref({
    start: '',
    end: '',
    user: '',
  });
  // console.log('-----currentPage-----', (currentPage as any).options);
  // console.log('-----routeQuery-----', routeQuery);
  const filterObj = ref({
    startTime: '',
    endTime: '',
    user: '',
    keyword: '',
  });
  /**
   * 处理筛选变化
   * @param filterVal 筛选值
   */
  const handleFilterChange = (filterVal: any) => {
    filterObj.value = { ...filterObj.value, ...filterVal };
    onRefresh();
  };
  /**
   * 处理筛选重置
   */
  const handleFilterReset = () => {
    filterObj.value = {
      startTime: routeQuery.value.start || '',
      endTime: routeQuery.value.end || '',
      user: routeQuery.value.user || '',
      keyword: '',
    };
  };
  /**
   * 查询微信客情打卡列表
   * @param params 查询参数
   * @returns 返回客情打卡列表信息
   */
  const fetchVisitMapPage = async (params: Record<string, any>) => {
    const response = await CustomerSituationMapService.queryVisitMapPage({
      ...params,
      end: filterObj.value.endTime,
      start: filterObj.value.startTime,
      user: filterObj.value.user,
      keyword: filterObj.value.keyword,
    });
    return {
      list: response.data.list || [],
      hasNextPage: response.data.hasNextPage || false,
      total: response.data.total || 0,
    };
  };
  /**
   * 使用分页组合式API
   */
  const pagination = usePagination(
    {
      pageSize: 10,
      initialPage: 1,
      toolBarHeight: 70,
    },
    fetchVisitMapPage
  );
  const {
    list,
    refreshing,
    loadmoreConfig,
    pullRefreshHeight,
    onRefresh,
    onLoadMore,
    calcPullRefreshHeight,
  } = pagination;
  const appStore = useAppStore();
  const itemIndex = ref(-1);
  const itemClick = (item: any, index: number) => {
    itemIndex.value = index;
    appStore.setDetailObj(item);
    uni.navigateTo({
      url: '/subpackages/home/map-detail',
    });
  };

  const likeClick = (item: any) => {
    // 点赞逻辑
    showModal({
      title: '',
      content: `是否确认对该条打卡信息${item.isStar ? '取消' : ''}点赞`,
      confirmColor: '#2271F5',
      success: res => {
        if (res.confirm) {
          CustomerSituationMapService.visitMapStar({
            cciId: item.cciId,
            operate: item.isStar ? 2 : 1,
          })
            .then((res: any) => {
              if (+res.code === 200) {
                item.isStar = !item.isStar;
                item.starNum = item.isStar ? item.starNum + 1 : item.starNum - 1;
                showSuccess(res.msg || '操作成功');
              } else {
                showError(res.msg || '操作失败，请稍后重试');
              }
            })
            .catch(() => {
              showError('操作失败，请稍后重试');
            });
        } else {
          showError('操作已取消');
        }
      },
    });
  };
  return {
    routeQuery,
    // 分页列表
    list,
    refreshing,
    loadmoreConfig,
    pullRefreshHeight,
    onRefresh,
    onLoadMore,
    calcPullRefreshHeight,

    filterObj,
    handleFilterChange,
    handleFilterReset,
    itemClick,
    likeClick,
  };
}
