const dashboardStore = useDashboardStore();
const { formatRaw, formatTenThousand, formatPercentage } = useFormatter();
export function useSalesKeyPage(entryObj: Ref<any>) {
  console.log('useSalesKeyPage 接收到的参数:', entryObj);
  const timeDimNumber = ref(1); // 1 年 0 月

  let filterVal = reactive({
    keyword: '',
    orderColumn: 'salesAmount',
    orderType: 0,
    orderField: 1,
    orderRule: 2,
    orderTypeText: '销售额倒序',
  });
  const updateFilterVal = (newVal: any) => {
    filterVal = { ...newVal };
    console.log('Updated filterVal:', filterVal);
  };
  const activeTab = ref(0);
  const onhandleActiveChange = (val: string | number) => {
    activeTab.value = Number(val);
  };
  const loading = ref(true);
  const totaLVal = reactive({
    number: '--', // 重点客户数
    salesAmount: '--', // 销售额
    onSalesAmount: '--', // 在销额
    periodComparePercent: '--', // 同比
    periodCompareNetIncrease: '--', // 同比净增
    salesDeclineNum: '--', // 销售下降客户/品种数
    salesTotalNum: '--', // 销售总客户/品种数
  });
  const tabsList = computed(() =>
    +entryObj.value.key === 1
      ? [{ name: '重点客户' }, { name: '全客户' }]
      : [{ name: '重点品种' }, { name: '全品种' }]
  );
  // 获取部门重点客户/品种销售统计
  const fetchGetSalesStat = async () => {
    let params: any;
    let response: any;
    if (+entryObj.value.key === 1) {
      params = {
        selectDate: dashboardStore.dateTime,
        deptId: entryObj.value.deptId,
        tabType: activeTab.value, // 0 重点客户 1 全客户
        timeDimFlag: timeDimNumber.value, // 1 年 0 月
      };
      response = await DashboardService.getDeptKeyCustomerSalesStat(params);
      if (+response.code == 200 && response.data) {
        loading.value = false;
        // totaLVal.number = formatRaw(response.data.increaseSaleGoodsNum);
        // totaLVal.salesAmount = formatTenThousand(response.data.salesAmount);
        // totaLVal.onSalesAmount = formatTenThousand(response.data.onSalesAmount);
        totaLVal.periodComparePercent = formatPercentage(response.data.periodComparePercent);
        totaLVal.periodCompareNetIncrease = formatTenThousand(
          response.data.periodCompareNetIncrease
        );
        totaLVal.salesDeclineNum = formatRaw(response.data.salesDeclineNum, { digits: 0 });
        totaLVal.salesTotalNum = formatRaw(response.data.salesTotalNum, { digits: 0 });
      }
    } else {
      params = {
        date: dashboardStore.dateTime,
        deptId: entryObj.value.deptId,
        type: activeTab.value, // 0 重点品种 1 全品种
      };
      response = await DashboardService.deptTotalStat(params);
      if (+response.code == 200 && response.data) {
        loading.value = false;
        // totaLVal.number = formatRaw(response.data.increaseSaleGoodsNum);
        // totaLVal.salesAmount = formatTenThousand(response.data.salesAmount);
        // totaLVal.onSalesAmount = formatTenThousand(response.data.onSalesAmount);
        totaLVal.periodComparePercent = formatPercentage(response.data.totalYearOnPercent);
        totaLVal.periodCompareNetIncrease = formatTenThousand(response.data.totalNetIncrease);
        totaLVal.salesDeclineNum = formatRaw(response.data.increaseSaleGoodsNum, { digits: 0 });
        totaLVal.salesTotalNum = formatRaw(response.data.totalGoodsNum, { digits: 0 });
      }
    }
  };

  /**
   * 获取数据列表的异步函数
   * @param pagination 分页参数，包含页码和每页大小
   * @returns 返回包含数据列表、是否有下一页和总数的对象
   */
  const fetchGetdataList = async (pagination: { pageNum: number; pageSize: number }) => {
    let response: any;
    let list: any[] = [];
    if (+entryObj.value.key === 1) {
      // 获取部门关键客户销售列表的API请求
      response = await DashboardService.getDeptKeyCustomerSalesList({
        tabType: activeTab.value,
        customerKeyword: filterVal.keyword, // 客户关键词
        selectDate: dashboardStore.dateTime, // 选择的日期
        deptId: entryObj.value.deptId, // 部门ID
        timeDimFlag: timeDimNumber.value, // 1 年 0 月
        orderColumn: filterVal.orderColumn,
        orderType: filterVal.orderType,
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
      });
      list = response.data.list.map((val: any) => {
        return {
          objId: +entryObj.value.key === 2 ? val.goodsId : val.customerId, // 客户ID
          objName: +entryObj.value.key === 2 ? val.goodsName : val.customerName, // 客户名称
          salesAmount: formatTenThousand(val.salesAmount), // 销售额
          periodComparePercent: formatPercentage(val.periodComparePercent), // 同比增幅
          periodCompareNetIncrease: formatTenThousand(val.periodCompareNetIncrease), // 同比增量
          salesAmountRatio: formatPercentage(val.salesAmountRatio, { showPlusSign: false }), //  贡献率
          monthComparePercent: formatPercentage(val.monthComparePercent), // 月环比
          // monthComparePercentAvg: getValue(val.monthComparePercentAvg, 2), // 月环比平均
          visitNum: val.visitNum, // 近三十天拜访记录数量
        };
      });
    }
    if (+entryObj.value.key === 2) {
      response = await DashboardService.getDeptFocusGoodsDetailList({
        type: activeTab.value,
        date: dashboardStore.dateTime, // 选择的日期
        deptId: entryObj.value.deptId, // 部门ID
        flag: timeDimNumber.value, // 1 年 0 月
        orderField: filterVal.orderField,
        orderRule: filterVal.orderRule,
        goodsKeyword: filterVal.keyword, // 客户关键词
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
      });
      list = response.data.list.map((val: any) => {
        return {
          objId: val.goodsId,
          objName: val.goodsName,
          salesAmountRatio: formatPercentage(val.contributePercent, { showPlusSign: false }), // 贡献率
          monthComparePercent: formatPercentage(val.momPercent), // 月环比
          periodComparePercent: formatPercentage(val.onPercent), //  同比
          // recent3MomPercentAverage: getValue(val.recent3MomPercentAverage, 2), // 近三月环比平均
          salesAmount: formatTenThousand(val.saleAmount), // 销售额
        };
      });
    }

    return {
      list: list,
      hasNextPage: response.data.hasNextPage,
      total: response.data.total,
    };
  };

  const toDetail = (item: any) => {
    let query = {};
    const path = '/subpackages/dashboard/sales-line-rise-detail';
    console.log('toDetail item:', item);
    if (+entryObj.value.key === 1) {
      query = {
        deptId: entryObj.value.deptId,
        deptName: entryObj.value.deptName,
        deptLevel: 6,
        customerId: item.objId,
        customerName: item.objName,
        isInner: 1,
      };
    } else if (+entryObj.value.key === 2) {
      query = {
        deptId: entryObj.value.deptId,
        deptName: entryObj.value.deptName,
        goodsId: item.objId,
        goodsName: item.objName,
        deptLevel: 6,
        isInner: 1,
      };
    }
    console.log('toDetail query:', query);
    router.push(path, query);
  };
  return {
    tabsList,
    activeTab,
    loading,
    totaLVal,
    filterVal,
    timeDimNumber,
    updateFilterVal,
    fetchGetSalesStat,
    fetchGetdataList, // 获取列表数据
    onhandleActiveChange,
    toDetail,
  };
}
