import type { LabelTreeItem, CustomerEvent } from '../types';

export function useCustomerAnalysisList(custId: string, isCabin: boolean, curMan?: any) {
  // 筛选弹窗
  const filterShow = ref(false);

  // 标签树
  const activeId = ref(-1);
  const activeIndex = ref(0);
  const labelTreeList = ref<LabelTreeItem[]>([]);

  // 筛选文本显示
  const filterText = ref('条件筛选');

  // 协防/拜访切换 0-协防 1-拜访
  const flag = ref(0);

  // 类型结果
  const typeResult = computed(() => {
    if (activeIndex.value === 0) {
      return null;
    } else if (activeId.value < 0) {
      // 选择了全部
      const arr = labelTreeList.value[activeIndex.value].children!.map((item: any) => +item.id);
      arr.shift(); // 移除"全部"选项
      return arr;
    } else {
      return [+activeId.value];
    }
  });

  // 获取标签树
  const getLabelTree = async () => {
    try {
      const res = await CommonService.getLabelTree({ type: '1' });

      labelTreeList.value = res.map((item: any, idx: number) => {
        let children: any[] = [];
        if (item.CHILD_LIST?.length) {
          children = item.CHILD_LIST.map((ele: any) => ({
            id: ele.LABEL_ID,
            text: ele.LABEL_NAME,
          }));
        }

        return {
          id: item.LABEL_ID,
          text: item.LABEL_NAME,
          children: [{ id: -idx - 2, text: '全部' }, ...children],
        };
      });

      // 添加"全部"选项到第一位
      labelTreeList.value.unshift({
        id: -1,
        text: '全部',
      });
    } catch (error) {
      console.error('获取标签树失败:', error);
    }
  };

  // 获取列表数据
  const fetchData = async (params: { pageNum: number; pageSize: number }) => {
    const requestParams: any = {
      custId,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
      flag: flag.value,
      type: typeResult.value,
    };

    // 如果是从人员详情进入，添加人员信息
    if (curMan) {
      requestParams.userId = curMan.salerId;
      requestParams.visitUserId = curMan.userId;
    }

    const res = isCabin
      ? await CustomerService.cockpitQueryCustEvent(requestParams)
      : await CustomerService.queryCustEvent(requestParams);

    return {
      list: res?.list || [],
      hasNextPage: res?.hasNextPage || false,
      total: res?.total || 0,
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
  } = usePagination(
    {
      pageSize: 10,
      initialPage: 1,
      toolBarHeight: 60,
    },
    fetchData
  );

  // 重置筛选
  const reset = () => {
    activeId.value = -1;
    activeIndex.value = 0;
    filterText.value = '条件筛选';
    filterShow.value = false;
    onRefresh();
  };

  // 确认筛选
  const onConfirm = () => {
    filterShow.value = false;

    if (activeIndex.value === 0) {
      filterText.value = '条件筛选';
    } else if (activeId.value < 0) {
      filterText.value = `${labelTreeList.value[activeIndex.value].text}/全部`;
    } else {
      const target = labelTreeList.value[activeIndex.value].children!.find(
        (item: any) => +item.id === activeId.value
      );
      filterText.value = `${labelTreeList.value[activeIndex.value].text}/${target?.text}`;
    }

    onRefresh();
  };

  // 切换协防/拜访
  const onFlagChange = () => {
    flag.value = flag.value === 1 ? 0 : 1;
    onRefresh();
  };

  return {
    filterShow,
    activeId,
    activeIndex,
    labelTreeList,
    filterText,
    flag,
    list,
    refreshing,
    loadmoreConfig,
    pullRefreshHeight,
    getLabelTree,
    reset,
    onConfirm,
    onFlagChange,
    onRefresh,
    onLoadMore,
    calcPullRefreshHeight,
  };
}
