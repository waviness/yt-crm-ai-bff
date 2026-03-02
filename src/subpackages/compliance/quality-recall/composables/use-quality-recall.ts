import { usePagination } from '@/composables/use-pagination';
import type { QualityRecallFilterData } from '../types';

export function useQualityRecall() {
  const userStore = useUserStore();
  const filterShow = ref(false);
  const statusList = reactive([{ name: '未处理' }, { name: '已处理' }]);
  const activeTab = ref(0); // 0-未处理，1-已处理
  const isJustSelf = ref(true);
  const rowIndex = ref(-1);

  // 权限相关
  const needQueryAll = ref(false);
  const needQueryAllEntrys = ref(false);
  const needQueryAllDept = ref(false);

  // 权限初始化
  const permissInit = () => {
    const permissions = userStore.permissions;
    needQueryAll.value = permissions.some((item: any) => item === 'queryQualityAll');
    needQueryAllEntrys.value = permissions.some((item: any) => item === 'queryQuality');
    needQueryAllDept.value = permissions.some((item: any) => item === 'queryQualityAllDept');

    if (!needQueryAll.value && !needQueryAllEntrys.value && !needQueryAllDept.value) {
      isJustSelf.value = true;
    } else {
      isJustSelf.value = false;
    }
  };

  // 筛选条件
  const formData = ref<QualityRecallFilterData>({
    startTime: '',
    endTime: '',
    time: '',
    customId: '',
    customName: '',
    goodsKey: '',
  });

  // 获取数据
  const fetchData = async (params: { pageNum: number; pageSize: number }) => {
    try {
      const response = await QualityService.getGspRecover({
        onlyPersonal: isJustSelf.value,
        pageType: 0,
        selectType: String(activeTab.value + 1),
        customIdList: formData.value.customId ? [formData.value.customId] : [],
        userIdList: [],
        startTime: formData.value.startTime || '',
        endTime: formData.value.endTime || '',
        keyword: formData.value.goodsKey || '',
        pageNum: params.pageNum,
        pageSize: params.pageSize,
      });

      const filteredList = (response.list || []).filter((item: any) => {
        return item.goodsId && item.goodsName && item.customId;
      });

      return {
        list: filteredList,
        hasNextPage: response?.hasNextPage || false,
        total: response?.total || 0,
      };
    } catch (error) {
      console.error('获取质量召回列表失败:', error);
      return {
        list: [],
        hasNextPage: false,
        total: 0,
      };
    }
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
    totalNum,
  } = usePagination(
    {
      pageSize: 8,
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
    needQueryAll,
    needQueryAllEntrys,
    needQueryAllDept,
    list,
    refreshing,
    loadmoreConfig,
    pullRefreshHeight,
    total: totalNum,
    onRefresh,
    onLoadMore,
    calcPullRefreshHeight,
    removeRow,
    permissInit,
  };
}
