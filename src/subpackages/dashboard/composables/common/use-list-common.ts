import type { CommonDataItem, CommonFilterParams } from '../../types';
export function useListCommon(filterParams: CommonFilterParams) {
  // 数据映射器，针对不同API返回结构
  const createDefaultDataMapper = (): ((element: any) => CommonDataItem) => (element: any) => ({
    id: element.goodsId || element.customerId,
    name: element.goodsName || element.customerName,
    todaySales: element.currentDayMoney ?? 0,
    byxs: element.currentMonthMoney ?? 0,
    ytb: element.monthPercentage ?? 0,
    qnzy: element.lyAllMonthMoney ?? 0,
    bnlj: element.currentYearMoney ?? 0,
    ntb: element.yearPercentage ?? 0,
    qnljy: element.lyAllYearMonthMoney ?? 0,
  });

  const createDefaultDataMapperByCustomerDepart =
    (): ((element: any) => CommonDataItem) => (element: any) => ({
      id: element.goodsId,
      name: element.goodsName,
      todaySales: element.dailySalesAmount ?? 0,
      byxs: element.monthSalesAmount ?? 0,
      ytb: element.monthOnMonthPercent ?? 0,
      qnzy: element.entireOnMonthSalesAmount ?? 0,
      bnlj: element.yearSalesAmount ?? 0,
      ntb: element.yearOnYearPercent ?? 0,
      qnljy: element.accuOnYearSalesAmount ?? 0,
    });

  const createSpecialDataMapper = (): ((element: any) => CommonDataItem) => (element: any) => ({
    id: element.customerId,
    name: element.customerName,
    todaySales: element.dayAmount ?? 0,
    byxs: element.monthAmount ?? 0,
    ytb: element.monthOnPercent ?? 0,
    qnzy: element.entireOnMonthAmount ?? 0,
    bnlj: element.yearAmount ?? 0,
    ntb: element.yearOnPercent ?? 0,
    qnljy: element.accuOnYearAmount ?? 0,
  });

  // --- Reactive State ---
  const dataList = ref<CommonDataItem[]>([]);
  // 通用数据获取函数，减少重复代码
  const fetchData = async (
    params: any,
    apiCall: (params: any) => Promise<any>,
    dataMapper: (element: any) => CommonDataItem
  ) => {
    filterParams.loading = true;
    try {
      const res = await apiCall(params);
      if (+res?.code === 200 && res.data?.list) {
        dataList.value = res.data.list.map(dataMapper);
        filterParams.total = res.data.total;
        filterParams.finish = dataList.value.length >= filterParams.total;
      } else {
        dataList.value = [];
        filterParams.total = 0;
        filterParams.finish = true;
      }
    } catch (error) {
      uni.showToast({ title: '数据加载失败', icon: 'none' });
      dataList.value = [];
      filterParams.finish = true;
    } finally {
      filterParams.loading = false;
    }
  };
  return {
    dataList,
    fetchData,
    createDefaultDataMapper,
    createSpecialDataMapper,
    createDefaultDataMapperByCustomerDepart,
  };
}
