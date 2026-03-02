/**
 * 话题列表 Composable
 * 按页面轻复用原则，仅用于 list.vue
 */
export function useTopicList() {
  // 列表数据
  const dataList = ref<any[]>([]);
  const totalNum = ref(0);
  const loading = ref(false);
  const finished = ref(false);
  const refreshing = ref(false);
  const page = ref(1);

  /**
   * 查询话题列表
   */
  const queryTopicList = async (params: {
    startTime: string;
    endTime: string;
    labelId?: string;
    selectType?: number;
  }) => {
    if (page.value === 1) {
      dataList.value = [];
    }

    loading.value = true;

    const requestParams = {
      startTime: `${params.startTime} 00:00:00`,
      endTime: `${params.endTime} 23:59:59`,
      labelId: params.LABEL_ID || '',
      pageNum: page.value,
      pageSize: 10,
      selectType: params.selectType || 0,
    };

    try {
      const res = await TopicService.getTopicList(requestParams);

      loading.value = false;
      dataList.value = dataList.value.concat(res.list);
      totalNum.value = res.total;

      if (!res.hasNextPage) {
        finished.value = true;
      } else {
        page.value++;
      }
    } catch (error) {
      loading.value = false;
      console.error('获取话题列表失败:', error);
    }
  };

  /**
   * 下拉刷新
   */
  const onRefresh = () => {
    finished.value = false;
    loading.value = true;
    page.value = 1;
  };

  /**
   * 上拉加载
   */
  const onLoad = async (params: any) => {
    if (refreshing.value) {
      page.value = 1;
      dataList.value = [];
      refreshing.value = false;
    }
    await queryTopicList(params);
  };

  /**
   * 重置列表状态
   */
  const resetList = () => {
    dataList.value = [];
    page.value = 1;
    finished.value = false;
    loading.value = false;
    refreshing.value = false;
  };

  return {
    dataList,
    totalNum,
    loading,
    finished,
    refreshing,
    page,
    queryTopicList,
    onRefresh,
    onLoad,
    resetList,
  };
}
