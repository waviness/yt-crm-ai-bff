/**
 * 合同列表 Composable
 * 按页面轻复用原则，仅用于 index.vue
 */
import { RouteMap } from '@/config/route';

export function useContractList() {
  // 分页相关
  const page = ref(1);
  const pageSize = ref(10);
  const list = ref<any[]>([]);
  const loading = ref(false);
  const finished = ref(false);
  const refreshing = ref(false);
  const error = ref(false);

  // 筛选条件
  const formData = ref({
    custom: '',
    goods: '',
    start: time.format(new Date(), time.FORMATS.ISO_DATE),
    end: time.format(new Date(), time.FORMATS.ISO_DATE),
  });

  /**
   * 筛选条件变化
   */
  const onFilterChange = (filterVal: any) => {
    formData.value = filterVal;
    onRefresh();
  };

  /**
   * 下拉刷新
   */
  const onRefresh = () => {
    finished.value = false;
    list.value = [];
    page.value = 1;
    error.value = false;
    getDataList();
  };

  /**
   * 获取列表数据
   */
  const getDataList = async () => {
    if (loading.value || finished.value) return;

    loading.value = true;

    const { goods, custom, start, end } = formData.value;
    const params = {
      pageNum: page.value,
      pageSize: pageSize.value,
      custom,
      goods,
      start,
      end,
    };

    try {
      const res = await ContractService.queryContractList(params);

      const newList = res?.list || [];

      list.value = page.value === 1 ? newList : [...list.value, ...newList];

      if (!res?.hasNextPage) {
        finished.value = true;
      } else {
        page.value++;
      }
      error.value = false;
    } catch (err) {
      error.value = true;
      console.error('获取合同列表失败:', err);
    } finally {
      loading.value = false;
      refreshing.value = false;
    }
  };

  /**
   * 跳转到细单详情
   */
  const toDetail = (item: any) => {
    router.push(RouteMap.contractDetail, {
      conId: item.conId,
    });
  };

  /**
   * 初始化
   */
  const init = () => {
    const today = new Date();
    formData.value.start = time.format(today, time.FORMATS.ISO_DATE);
    formData.value.end = time.format(today, time.FORMATS.ISO_DATE);
    list.value = [];
    // 初始化时加载数据
    getDataList();
  };

  return {
    // 数据
    page,
    pageSize,
    list,
    loading,
    finished,
    refreshing,
    error,
    formData,
    // 方法
    onFilterChange,
    onRefresh,
    getDataList,
    toDetail,
    init,
  };
}
