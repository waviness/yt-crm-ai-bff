import type { CommonFilterParams, StagingFilter } from '../../types';
export function useFilterCommon(type: 'list-customer' | 'list-goods' | 'table' = 'table') {
  const salesTabValue = ref(1); // 1 销售额 2 销售数量
  const typeArr = type.split('-');
  // 筛选条件
  let filterParams = reactive<CommonFilterParams>({
    keyword: '',
    orderColumn: typeArr[0] === 'list' ? 'currentYearMoney' : 'thirtyDaysReduce1st',
    orderType: 0,
    orderMethod: 1,
    orderRule: 1,
    currentPage: 1,
    pageSize: 10,
    total: 0,
    loading: false,
    finish: false,
    filterIndex: 0,
    selectType: 0,
  });

  let orderList: any = ref([]);

  const orderListInit = () => {
    orderList.value = [
      {
        label: `近30天${salesTabValue.value === 1 ? '销售额' : '销售数量'}下降降序`,
        value: 'thirtyDaysReduce1st',
        orderType: 0,
        orderMethod: 1,
        orderRule: 1,
      },
      {
        label: `近30天${salesTabValue.value === 1 ? '销售额' : '销售数量'}下降升序`,
        value: 'thirtyDaysReduce1st',
        orderType: 1,
        orderMethod: 1,
        orderRule: 2,
      },
      {
        label: '最后销售时间降序',
        value: 'lastSaleTime',
        orderType: 0,
        orderMethod: 2,
        orderRule: 1,
      },
      {
        label: `最后销售时间升序`,
        value: 'lastSaleTime',
        orderType: 1,
        orderMethod: 2,
        orderRule: 2,
      },
    ];
    if (typeArr[0] === 'list') {
      orderList.value = [
        {
          label: `本年累计${salesTabValue.value === 1 ? '销售额' : '销售数量'}降序`,
          value: 'currentYearMoney',
          orderType: 0,
          orderMethod: 1,
          orderRule: 1,
        },
        {
          label: `本年累计${salesTabValue.value === 1 ? '销售额' : '销售数量'}升序`,
          value: 'currentYearMoney',
          orderType: 1,
          orderMethod: 1,
          orderRule: 2,
        },
        {
          label: `本月${salesTabValue.value === 1 ? '销售额' : '销售数量'}降序`,
          value: 'currentMonthMoney',
          orderType: 0,
          orderMethod: 2,
          orderRule: 1,
        },
        {
          label: `本月${salesTabValue.value === 1 ? '销售额' : '销售数量'}升序`,
          value: 'currentMonthMoney',
          orderType: 1,
          orderMethod: 2,
          orderRule: 2,
        },
      ];
      if (typeArr[1] === 'goods') {
        orderList.value.concat([
          {
            label: `当日${salesTabValue.value === 1 ? '销售额' : '销售数量'}降序`,
            value: 'currentDayMoney',
            orderType: 0,
            orderMethod: 3,
            orderRule: 1,
          },
          {
            label: `当日${salesTabValue.value === 1 ? '销售额' : '销售数量'}升序`,
            value: 'currentDayMoney',
            orderType: 1,
            orderMethod: 3,
            orderRule: 2,
          },
        ]);
      }
    }
  };
  orderListInit();
  // 筛选列表
  const goodsFilterList = ref([
    { label: '连续三个月下降品种', selectType: 1 },
    { label: '丢失品种', selectType: 2 },
  ]);
  // 筛选列表
  const customerFilterList = ref([
    { label: '连续三个月下降客户', selectType: 1 },
    { label: '丢失客户', selectType: 2 },
  ]);
  const flitershow = ref(false);
  const filterOpen = () => {
    orderListInit();
    flitershow.value = true;
  };
  const fliterClose = () => {
    flitershow.value = false;
  };
  const fliterRefresh = () => {
    filterParams.keyword = '';
    filterParams.filterIndex = 0;
    filterParams.orderType = 0;
    filterParams.orderMethod = 1;
    filterParams.orderRule = 1;
    filterParams.selectType = 0;
    if (typeArr[0] === 'list') {
      filterParams.orderColumn = 'currentYearMoney';
    } else {
      filterParams.orderColumn = 'thirtyDaysReduce1st';
    }
    flitershow.value = false;
    console.log('val', filterParams);
  };
  // 筛选条件变化
  /**
   * 处理筛选确认操作
   * @param val - 包含筛选参数的对象，包含筛选索引、选择类型和关键字等信息
   */
  /**
   * 处理筛选确认的函数
   * @param val - 包含筛选参数的对象，类型为StagingFilter
   */
  const filterSure = (val: StagingFilter) => {
    console.log('val', val); // 打印传入的筛选参数
    const obj = orderList.value[val.filterIndex]; // 根据筛选索引获取对应的订单列表对象
    console.log('obj', obj);
    filterParams.orderColumn = obj.value;
    filterParams.orderType = obj.orderType;
    filterParams.orderMethod = obj.orderMethod;
    filterParams.orderRule = obj.orderRule;
    filterParams.filterIndex = val.filterIndex;
    filterParams.selectType = val.selectType;
    filterParams.keyword = val.keyword;
    console.log('val1', filterParams);
    flitershow.value = false;
  };
  return {
    salesTabValue,
    filterParams,
    orderList,
    goodsFilterList,
    customerFilterList,
    flitershow,
    filterOpen,
    fliterClose,
    fliterRefresh,
    filterSure,
  };
}
