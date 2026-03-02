// 简单的防抖函数
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

export function useProject() {
  const keyword = ref('');
  const searchValue = ref('');

  // 防抖搜索
  const onSearch = debounce(() => {
    keyword.value = searchValue.value;
    onRefresh();
  }, 500);

  const fetchData = async (params: { pageNum: number; pageSize: number }) => {
    const response = await SzymProjectService.getSzymProjectMng({
      dataBelongEntry: 41,
      projectType: '',
      keyword: keyword.value,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
    });

    return {
      list: response.list || [],
      hasNextPage: response.hasNextPage || false,
      total: response.total || 0,
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
  } = usePagination(
    {
      pageSize: 10,
      initialPage: 1,
      toolBarHeight: 60, // 调整为与实际搜索栏高度匹配
    },
    fetchData
  );

  return {
    keyword,
    searchValue,
    onSearch,
    list,
    refreshing,
    loadmoreConfig,
    pullRefreshHeight,
    onRefresh,
    onLoadMore,
    calcPullRefreshHeight,
  };
}
