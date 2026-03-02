import type { EntryObj } from '../types';
const { formatPercentage, formatTenThousand } = useFormatter();
const dashboardStore = useDashboardStore();

export function useBrandCollectionPage(entryObj: EntryObj) {
  const orderTypeFlag = ref(false);
  const sortField = ref(1);
  const sortOrder = ref(2);
  const orderList = ref();
  const orderSelect = ({ value }: { value: string }) => {
    console.log(value);
    const [field, order] = value.split('-');
    sortField.value = Number(field);
    sortOrder.value = Number(order);
    orderTypeFlag.value = false;
    orderListInit();
  };
  const orderListInit = () => {
    orderList.value = [
      {
        name: '销售实绩正序',
        value: '1-1',
        color: sortField.value === 1 && sortOrder.value === 1 ? '#2271F5' : '#000000',
      },
      {
        name: '销售实绩倒序',
        value: '1-2',
        color: sortField.value === 1 && sortOrder.value === 2 ? '#2271F5' : '#000000',
      },
      {
        name: '同比增幅正序',
        value: '3-1',
        color: sortField.value === 3 && sortOrder.value === 1 ? '#2271F5' : '#000000',
      },
      {
        name: '同比增幅倒序',
        value: '3-2',
        color: sortField.value === 3 && sortOrder.value === 2 ? '#2271F5' : '#000000',
      },
    ];
  };

  const fetchGetStatListByDept = async (
    pagination: { pageNum: number; pageSize: number },
    keyword: string
  ) => {
    const response = await DashboardService.getStatListByDept({
      date: dashboardStore.dateTime,
      deptId: entryObj.deptId,
      pageFlag: 1,
      queryTop3Flag: 0,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      sortField: sortField.value,
      sortOrder: sortOrder.value,
      brandKeyword: keyword,
    });
    if (pagination.pageNum === 1) {
      await Promise.all([
        _getAllListByBrand(response.data.list[0]),
        _getAllListByBrand(response.data.list[1]),
      ]);
    }
    console.log(response, 'response');
    const list = response.data.list.map((val: any, index: number) => {
      console.log(val, 'val');
      return {
        brandId: val.brandId,
        brandName: val.brandName,
        loading: val.loading,
        topNumber: index + 1 + (pagination.pageNum - 1) * 8,
        title: val.brandName,
        top3GoodsStatList: val.top3GoodsStatList,
        value: formatTenThousand(val.yearAmount),
        isExp: pagination.pageNum === 1 && (index === 0 || index === 1),
        increment: formatPercentage(val.yearOnPercent, { showPercentage: false }),
      };
    });
    return {
      list: list,
      hasNextPage: response.data.hasNextPage,
      total: response.data.total,
    };
  };
  const _getAllListByBrand = async (item: any, keyword: string = '') => {
    const response = await DashboardService.getAllListByBrand({
      brandId: item.brandId,
      date: dashboardStore.dateTime,
      deptId: entryObj.deptId,
      pageFlag: 1,
      queryTop3Flag: 1,
      goodsKeyword: keyword,
    });
    const list = response.data.list.map((val: any) => {
      val.totalValueArr = response.data.list
        .map((top3Val: any) => Number(top3Val.yearAmount))
        .filter((num: number) => !isNaN(num));
      return {
        goodsId: val.goodsId,
        goodsName: val.goodsName,
        value: formatTenThousand(val.yearAmount),
        increment: formatPercentage(val.yearOnPercent),
        progress: arithmetic.multiply(
          arithmetic.divide(Number(val.yearAmount), arithmetic.sum(val.totalValueArr)),
          100
        ),
      };
    });
    item.top3GoodsStatList = list;
    return list;
  };
  const dateChange = ({ fulldate }: { fulldate: string }) => {
    dashboardStore.setDateTime(time.format(new Date(fulldate), 'yyyy-MM-dd'));
  };

  return {
    orderTypeFlag,
    orderList,
    sortField,
    sortOrder,
    dateChange,
    orderSelect,
    orderListInit,
    fetchGetStatListByDept,
    _getAllListByBrand,
  };
}
