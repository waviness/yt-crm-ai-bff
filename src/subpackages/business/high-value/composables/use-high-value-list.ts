import { ref, reactive, computed } from 'vue';
import { usePagination } from '@/composables/use-pagination';
import { hasPermission } from '@/utils/permission';

/**
 * 高值列表 Composable
 * 高值信息和高值货品共用的列表逻辑
 */
export function useHighValueList(type: 'info' | 'goods') {
  const filterShow = ref(false);
  const statusList = reactive([{ name: '未处理' }, { name: '已处理' }]);
  const activeTab = ref(0);
  const isJustSelf = ref(false);
  const rowIndex = ref(-1);

  const formData = ref({
    goodsKeyword: '',
    customerKeyword: '',
    entryKeyword: '',
    userNames: '',
  });

  const userIdLists = ref<string[]>([]);

  // 权限相关（仅高值信息需要）
  const needQueryAll = ref(false);
  const needQueryAllEntrys = ref(false);
  const needQueryAllDept = ref(false);

  // 计算是否显示"显示与我相关"按钮
  const showRelatedButton = computed(() => {
    return (
      type === 'info' && (needQueryAll.value || needQueryAllEntrys.value || needQueryAllDept.value)
    );
  });

  /**
   * 检查权限
   */
  const checkPermissions = () => {
    if (type === 'info') {
      needQueryAll.value = hasPermission('orderintegrateWx-query-all');
      needQueryAllEntrys.value = hasPermission('orderintegrateWx-query-entry');
      needQueryAllDept.value = hasPermission('orderintegrateWx-query-dept');
    }
  };

  const fetchData = async (params: { pageNum: number; pageSize: number }) => {
    const requestParams: any = {
      customerKeyword: formData.value.customerKeyword,
      entryKeyword: formData.value.entryKeyword,
      goodsKeyword: formData.value.goodsKeyword,
      feedbackStatus: activeTab.value,
      selectType: isJustSelf.value ? 0 : 3,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
    };

    if (formData.value.userNames && userIdLists.value.length > 0) {
      requestParams.userIdList = userIdLists.value;
    }

    let res;
    if (type === 'goods') {
      res = await HighValueService.getToSalerListWx(requestParams);
    } else {
      res = await HighValueService.getToSalerListSupplyerWx(requestParams);
    }

    return {
      list: res.list || [],
      hasNextPage: res.hasNextPage || false,
      total: res.total || 0,
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
      toolBarHeight: 110,
    },
    fetchData
  );

  const onFilterConfirm = (data: typeof formData.value, userIdListsParam?: string[]) => {
    formData.value = data;
    if (userIdListsParam) {
      userIdLists.value = userIdListsParam;
    }
    filterShow.value = false;
    onRefresh();
  };

  const onhandleActiveChange = ({ index }: { index: number }) => {
    activeTab.value = index;
    onRefresh();
  };

  const showDetail = (item: any) => {
    const statusDtl = activeTab.value;
    router.push(RouteMap.highValueDetail, {
      chgtsId: item.chgtsId,
      statusDtl,
      type,
    });
  };

  /**
   * 切换"显示与我相关/显示全部"
   */
  const justSelfClick = () => {
    isJustSelf.value = !isJustSelf.value;
    // 切换时清空人员选择
    formData.value.userNames = '';
    userIdLists.value = [];
    onRefresh();
  };

  return {
    filterShow,
    statusList,
    activeTab,
    formData,
    userIdLists,
    isJustSelf,
    needQueryAll,
    needQueryAllEntrys,
    needQueryAllDept,
    showRelatedButton,
    list,
    refreshing,
    loadmoreConfig,
    pullRefreshHeight,
    onRefresh,
    onLoadMore,
    calcPullRefreshHeight,
    removeRow,
    onFilterConfirm,
    onhandleActiveChange,
    showDetail,
    checkPermissions,
    justSelfClick,
  };
}
