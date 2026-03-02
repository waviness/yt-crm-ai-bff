/**
 * 资金列表相关逻辑
 */
import type { FundingFilterData, DepartmentInfo, FundingFormData } from '../types';

export const useFundingList = () => {
  const appStore = useAppStore();

  const formData = ref<FundingFilterData>({
    deptId: '',
    deptName: '',
    year: '',
    month: '',
  });

  const deptList = ref<DepartmentInfo[]>([]);

  /**
   * 获取资金数据
   */
  const fetchFundData = async () => {
    const { deptId, year, month } = formData.value;
    const params = {
      deptId,
      year: year || new Date().getFullYear(),
      month,
    };
    const response = await FundingService.queryFundForm(params);
    return {
      list: response,
      hasNextPage: false,
      total: response.length,
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
    },
    fetchFundData
  );

  /**
   * 获取部门列表
   */
  const getDeptList = async () => {
    const res = await FundingService.queryFundDept({});
    deptList.value = res;
  };

  /**
   * 处理筛选条件变化
   */
  const handleFilterChange = (filterVal: FundingFilterData) => {
    formData.value = filterVal;
    onRefresh();
  };

  /**
   * 跳转到详情页
   */
  const toDetail = (data: FundingFormData, year: string | number, month: string | number) => {
    appStore.setHadDoneOnDetail(false);
    router.push(RouteMap.fundingDetail, {
      cffId: data.cffId,
      year,
      month,
    });
  };

  return {
    formData,
    deptList,
    list,
    refreshing,
    loadmoreConfig,
    pullRefreshHeight,
    getDeptList,
    handleFilterChange,
    toDetail,
    onRefresh,
    onLoadMore,
    calcPullRefreshHeight,
  };
};
