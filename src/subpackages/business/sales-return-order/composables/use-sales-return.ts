import type { SalesReturnFilterData, IdentityInfo } from '../types';

export function useSalesReturn() {
  const userStore = useUserStore();

  // PM4账号选择显示
  const showIdentitySelect = ref(true);
  // 筛选弹窗显示
  const filterShow = ref(false);
  // Tab列表
  const statusList = reactive([{ name: '未处理' }, { name: '已处理' }]);
  // 当前Tab索引
  const activeTab = ref(0);
  // 当前选中行索引
  const rowIndex = ref(-1);
  // PM4身份列表
  const identityList = ref<IdentityInfo[]>([]);
  // 当前选中的PM4身份
  const identityObj = ref<IdentityInfo | null>(null);

  // 筛选表单数据
  const formData = ref<SalesReturnFilterData>({
    confirmTime: '',
    contactKeyword: '',
    customerKeyword: '',
  });

  // 权限初始化 - 检查是否有查看全部权限
  const permissInit = async () => {
    const permissions = userStore.permissions;
    const hasQueryAll = permissions.some((item: any) => item === 'salesReturnOrderQueryAll');

    if (hasQueryAll) {
      // 有全局查询权限，直接进入列表页
      showIdentitySelect.value = false;
    } else {
      // 没有全局权限，需要获取PM4账号列表
      await fetchPm4UserList();
    }
  };

  // 获取PM4用户列表
  const fetchPm4UserList = async () => {
    const res = await SalesReturnService.queryPm4User({});
    identityList.value = res || [];

    // 如果只有一个账号，直接选中
    if (identityList.value.length === 1) {
      handleIdentityChange(identityList.value[0]);
    }
  };

  // 切换PM4账号
  const handleIdentityChange = (identity: IdentityInfo) => {
    identityObj.value = identity;
    showIdentitySelect.value = false;
    onRefresh();
  };

  // 获取列表数据
  const fetchData = async (params: { pageNum: number; pageSize: number }) => {
    const requestParams: any = {
      contact: formData.value.contactKeyword,
      cust: formData.value.customerKeyword,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
      receiptdate: formData.value.confirmTime,
      status: activeTab.value + 1, // 1-未处理 2-已处理
    };

    // 如果有选中的PM4账号，添加saleId参数
    if (identityObj.value?.userId) {
      requestParams.saleId = identityObj.value.userId;
    }

    const response = await SalesReturnService.querySaleReturnList(requestParams);

    return {
      list: response.list || [],
      hasNextPage: response.hasNextPage || false,
      total: response.total || 0,
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
    removeRow,
  } = usePagination(
    {
      pageSize: 20,
      initialPage: 1,
      toolBarHeight: 100,
    },
    fetchData
  );

  // 筛选确认
  const onFilterConfirm = (data: SalesReturnFilterData) => {
    formData.value = data;
    filterShow.value = false;
    onRefresh();
  };

  // 重置筛选
  const onFilterReset = () => {
    formData.value = {
      confirmTime: '',
      contactKeyword: '',
      customerKeyword: '',
    };
    filterShow.value = false;
    onRefresh();
  };

  // Tab切换
  const onTabChange = ({ index }: { index: number }) => {
    activeTab.value = index;
    onRefresh();
  };

  // 切换PM4账号显示
  const toggleIdentitySelect = () => {
    showIdentitySelect.value = !showIdentitySelect.value;
  };

  return {
    showIdentitySelect,
    filterShow,
    statusList,
    activeTab,
    formData,
    identityList,
    identityObj,
    rowIndex,
    list,
    refreshing,
    loadmoreConfig,
    pullRefreshHeight,
    onRefresh,
    onLoadMore,
    calcPullRefreshHeight,
    removeRow,
    permissInit,
    handleIdentityChange,
    onFilterConfirm,
    onFilterReset,
    onTabChange,
    toggleIdentitySelect,
  };
}
