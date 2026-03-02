import type { CustomerPersonFilterData, CustomerPersonItem, OptionItem } from '../types';

export function useCustomerPerson() {
  const appStore = useAppStore();

  const filterShow = ref(false);
  const filterActive = ref(false);
  const selectType = ref(0);
  const rowIndex = ref(-1);

  // 关联选项
  const relOptions = reactive([
    { name: '拓展客户-已关联', value: '0-1' },
    { name: '拓展客户-暂未关联', value: '0-0' },
    { name: '业务系统内客户', value: '1' },
  ]);

  // 字典数据
  const customTypeList = ref<OptionItem[]>([]); // 客户类型

  // 筛选条件
  const formData = ref<CustomerPersonFilterData>({
    custom: '',
    sourceType: '',
    customerType: '',
    relStatus: '',
  });

  // 权限初始化
  const permissInit = () => {
    const permissions = useUserStore().permissions;
    const hasQueryAll = permissions.some(
      (item: any) =>
        item === 'szymCustomer-query-all' ||
        item === 'szymCustomer-query-entry' ||
        item === 'szymCustomer-query-dept'
    );
    selectType.value = hasQueryAll ? '' : 0;
  };

  // 获取字典列表
  const getDictList = async (typeId: number) => {
    const res = await CommonService.getDictionaries({
      full: true,
      pageNum: 1,
      pageSize: 100000,
      usestatus: 1,
      typeId,
    });
    return res.list.map((ele: any) => ({
      value: ele.DIC_SELECT_ID,
      name: ele.DIC_SELECT_NAME,
    }));
  };

  // 初始化字典数据
  const initDictData = async () => {
    if (!customTypeList.value.length) {
      customTypeList.value = await getDictList(67); // 客户类型
    }
  };

  // 获取数据
  const fetchData = async (params: { pageNum: number; pageSize: number }) => {
    const response = await SzymCustomerService.getSzymCustomerMng({
      selectType: selectType.value,
      userIdList: [],
      sourceType: formData.value.sourceType,
      customerType: formData.value.customerType,
      relStatus: formData.value.relStatus,
      keyword: formData.value.custom,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
      hideloading: true,
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
    removeRow,
  } = usePagination(
    {
      pageSize: 20,
      initialPage: 1,
      toolBarHeight: 50,
    },
    fetchData
  );

  // 检查是否有筛选条件
  watchEffect(() => {
    const { custom, sourceType, customerType, relStatus } = formData.value;
    filterActive.value = !!(custom || sourceType || customerType || relStatus);
  });

  return {
    filterShow,
    filterActive,
    selectType,
    rowIndex,
    relOptions,
    customTypeList,
    formData,
    list,
    refreshing,
    loadmoreConfig,
    pullRefreshHeight,
    onRefresh,
    onLoadMore,
    calcPullRefreshHeight,
    removeRow,
    permissInit,
    initDictData,
  };
}
