import type { BaseSalesData, EntryObj } from '../types';
const {
  formatTenThousand, // 格式化为万元，且加千分位
  formatPercentage,
} = useFormatter();
const dashboardStore = useDashboardStore();
export function useSalesmanIndex(entryObj: EntryObj) {
  let salesDataObj = reactive<BaseSalesData>({
    currentDayMoney: '',
    currentMonthMoney: '',
    currentYearMoney: '',
    lyCurrentMonthMoney: '',
    lyCurrentYearMoney: '',
    monthPercentage: '',
    yearPercentage: '',
  }); // 销售数据对象
  const visitNumber = ref(0); // 访问量
  const loading = ref(false); // 加载状态
  /**
   * 获取获取个人销售详情
   */
  const fetchGetDataUserSalesDetail = async () => {
    loading.value = true;
    const params = {
      selectDate: dashboardStore.dateTime,
      userId: entryObj.userId,
    };
    const response = await DashboardService.getDataUserSalesDetail(params);
    loading.value = false;
    if (+response.code == 200 && response.data) {
      salesDataObj.currentDayMoney = formatTenThousand(response.data.currentDayMoney);
      salesDataObj.currentMonthMoney = formatTenThousand(response.data.currentMonthMoney);
      salesDataObj.lyCurrentMonthMoney = formatTenThousand(response.data.lyCurrentMonthMoney);
      salesDataObj.monthPercentage = formatPercentage(response.data.monthPercentage);
      salesDataObj.currentYearMoney = formatTenThousand(response.data.currentYearMoney);
      salesDataObj.lyCurrentYearMoney = formatTenThousand(response.data.lyCurrentYearMoney);
      salesDataObj.yearPercentage = formatPercentage(response.data.yearPercentage);
    }
  };
  // 获取部门客户当日销售情况
  const fetchGetDeptCustomerDailySale = async () => {
    let params: any = {
      customerId: entryObj.customerId,
      deptId: entryObj.deptId,
      selectedDate: dashboardStore.dateTime,
    };
    let response: any = await DashboardService.getDailySale(params);
    if (+response.code == 200) {
      salesDataObj.currentDayMoney = formatTenThousand(response.data);
    } else {
      salesDataObj.currentDayMoney = '0';
    }
  };
  // 获取部门客户销售情况
  const fetchGetDeptCustomerSaleStat = async () => {
    let params: any = {
      customerId: entryObj.customerId,
      deptId: entryObj.deptId,
      selectedDate: dashboardStore.dateTime,
    };
    let response: any = await DashboardService.getSaleStat(params);
    if (+response.code == 200) {
      salesDataObj.currentMonthMoney = formatTenThousand(response.data.monthSalesAmount);
      salesDataObj.lyCurrentMonthMoney = formatTenThousand(response.data.monthOnMonthSalesAmount);
      salesDataObj.monthPercentage = formatPercentage(response.data.monthOnMonthPercent);
      salesDataObj.currentYearMoney = formatTenThousand(response.data.yearSalesAmount);
      salesDataObj.lyCurrentYearMoney = formatTenThousand(response.data.yearOnYearSalesAmount);
      salesDataObj.yearPercentage = formatPercentage(response.data.yearOnYearPercent);
    }
  };
  /**
   * 获取用户拜访数据的异步函数
   * 该函数用于获取指定用户在最近30天内的拜访总次数
   */
  const fetchUserVisitData = async (params: any) => {
    try {
      // 2. 调用 API 服务，假设服务名为 CustomerFollowService.getUserVisitWx
      const data = await CustomerFollowService.chashujuGetUserVisitWx(params);
      // 3. 处理 API 响应
      // 假设响应结构与原代码一致，即 res.data.total 包含总拜访次数
      if (data) {
        // 更新响应式变量 visitNumber 的值
        visitNumber.value = data.total;
      } else {
        // 可以选择在 API 返回非成功状态时进行错误处理或重置数据
        visitNumber.value = 0; // 失败时重置为0
      }
    } catch (error) {
      // 4. 捕获网络或其他错误
      console.error('请求用户拜访数据时发生错误:', error);
      visitNumber.value = 0; // 发生错误时重置为0
    }
  };

  // 获取部门某个品种统计
  const fetchGetDeptSaleStat = async () => {
    let params: any = {
      date: dashboardStore.dateTime,
      deptId: entryObj.deptId,
      goodsId: entryObj.goodsId,
    };
    let response: any = await DashboardService.getDeptSaleStat(params);
    if (+response.code == 200) {
      salesDataObj.currentDayMoney = formatTenThousand(response.data.currentDayMoney, {
        digits: 1,
      });
      salesDataObj.currentMonthMoney = formatTenThousand(response.data.currentMonthMoney, {
        digits: 1,
      });
      salesDataObj.lyCurrentMonthMoney = formatTenThousand(response.data.lyCurrentMonthMoney, {
        digits: 1,
      });
      salesDataObj.monthPercentage = formatPercentage(response.data.monthPercentage);
      salesDataObj.currentYearMoney = formatTenThousand(response.data.currentYearMoney, {
        digits: 1,
      });
      salesDataObj.lyCurrentYearMoney = formatTenThousand(response.data.lyCurrentYearMoney, {
        digits: 1,
      });
      salesDataObj.yearPercentage = formatPercentage(response.data.yearPercentage);
    }
  };
  // 获取个人某个品种统计的一条 用来获取上半部分数据
  const fetchGetDataUserCustomerSalesOne = async () => {
    let params: any = {
      selectDate: dashboardStore.dateTime,
      userId: entryObj.userId,
      custom: entryObj.customerId,
      pageNum: 1,
      pageSize: 1,
    };
    let res: any = await DashboardService.getDataUserCustomerSalesList(params);
    if (res.code == 200 && res.data && res.data.list && res.data.list.length > 0) {
      let response = res.data.list[0];
      salesDataObj.currentDayMoney = formatTenThousand(response.currentDayMoney, {
        digits: 1,
      });
      salesDataObj.currentMonthMoney = formatTenThousand(response.currentMonthMoney, {
        digits: 1,
      });
      salesDataObj.lyCurrentMonthMoney = formatTenThousand(response.lyCurrentMonthMoney, {
        digits: 1,
      });
      salesDataObj.monthPercentage = formatPercentage(response.monthPercentage);
      salesDataObj.currentYearMoney = formatTenThousand(response.currentYearMoney, {
        digits: 1,
      });
      salesDataObj.lyCurrentYearMoney = formatTenThousand(response.lyCurrentYearMoney, {
        digits: 1,
      });
      salesDataObj.yearPercentage = formatPercentage(response.yearPercentage);
    }
  };
  // 获取个人某个客户统计的一条 用来获取上半部分数据
  const fetchGetDataUserGoodSalesOne = async () => {
    let params: any = {
      selectDate: dashboardStore.dateTime,
      userId: entryObj.userId,
      goods: entryObj.goodsId,
      pageNum: 1,
      pageSize: 1,
    };
    let res: any = await DashboardService.getDataUserGoodSalesList(params);
    if (res.code == 200 && res.data && res.data.list && res.data.list.length > 0) {
      let response = res.data.list[0];
      salesDataObj.currentDayMoney = formatTenThousand(response.currentDayMoney, {
        digits: 1,
      });
      salesDataObj.currentMonthMoney = formatTenThousand(response.currentMonthMoney, {
        digits: 1,
      });
      salesDataObj.lyCurrentMonthMoney = formatTenThousand(response.lyCurrentMonthMoney, {
        digits: 1,
      });
      salesDataObj.monthPercentage = formatPercentage(response.monthPercentage);
      salesDataObj.currentYearMoney = formatTenThousand(response.currentYearMoney, {
        digits: 1,
      });
      salesDataObj.lyCurrentYearMoney = formatTenThousand(response.lyCurrentYearMoney, {
        digits: 1,
      });
      salesDataObj.yearPercentage = formatPercentage(response.yearPercentage);
      console.log('fetchGetDataUserCustomerSalesOne', response);
      console.log('fetchGetDataUserCustomerSalesOne', salesDataObj);
    }
  };
  return {
    salesDataObj,
    visitNumber,
    loading,
    fetchUserVisitData, // 将新函数也返回出去
    fetchGetDataUserSalesDetail,
    fetchGetDeptCustomerDailySale,
    fetchGetDeptCustomerSaleStat,
    fetchGetDeptSaleStat,
    fetchGetDataUserCustomerSalesOne,
    fetchGetDataUserGoodSalesOne,
  };
}
