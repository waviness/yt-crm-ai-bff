/**
 * 资金报表主页面逻辑
 */
import orderBy from 'lodash.orderby';
import type { FundingReportData, FundingStatsData, FundingSearchParams } from '../types';

export const useFundingReport = () => {
  const calendarRef = ref();
  const today = ref(time.format(new Date(), time.FORMATS.ISO_DATE));
  const searchDate = ref(time.format(new Date(), time.FORMATS.ISO_DATE));
  const dataLoading = ref(false);

  const fundingData = ref<FundingStatsData>({
    statDate: '',
    totalAmount: 0,
    dhAmount: 0,
    ywPercent: 0,
    csPercent: 0,
    paymentAmount: 0,
    chAmount: 0,
  });

  const searchParams = ref<FundingSearchParams>({
    key: '',
    finishnum: 0,
    csfinishnum: 0,
  });

  const list = ref<FundingReportData[]>([]);
  const loading = ref(false);
  const originData = ref<FundingReportData[]>([]);
  const originData2 = ref<FundingReportData[]>([]);

  const countObj = ref<FundingReportData>({
    deptName: '药业合计',
    xsAmount: 0,
    total: 0,
    dhAmount: 0,
    chAmount: 0,
    csAmount: 0,
    actualityDhAmount: 0,
    actualityChAmount: 0,
    actualityTotal: 0,
    finish: 0,
    csfinish: 0,
  });

  const countObj2 = ref<FundingReportData>({
    deptName: '电商合计',
    xsAmount: 0,
    total: 0,
    dhAmount: 0,
    chAmount: 0,
    csAmount: 0,
    actualityDhAmount: 0,
    actualityChAmount: 0,
    actualityTotal: 0,
    finish: 0,
    csfinish: 0,
  });

  const totalObj = ref<FundingReportData>({
    deptName: '药业电商合计',
    xsAmount: 0,
    total: 0,
    dhAmount: 0,
    chAmount: 0,
    csAmount: 0,
    actualityDhAmount: 0,
    actualityChAmount: 0,
    actualityTotal: 0,
    finish: 0,
    csfinish: 0,
  });

  const searchRes = ref<FundingReportData[]>([]);

  /**
   * 获取报表统计数据
   */
  const getReportStats = async () => {
    dataLoading.value = true;
    const res = await FundingService.queryFundTableBar({ selectDate: searchDate.value });
    fundingData.value = res;
    dataLoading.value = false;
  };

  /**
   * 获取报表列表数据
   */
  const getReportList = async () => {
    loading.value = true;
    const res = await FundingService.queryFundTable({ isHide: 0, selectDate: searchDate.value });
    processReportData(res);
    loading.value = false;
  };

  /**
   * 处理报表数据
   */
  const processReportData = (data: FundingReportData[]) => {
    // 重置合计数据
    resetCountObjects();

    // 处理每个数据项
    data.forEach(item => {
      // 计算完成率
      item.finish = calculateCompletionRate(item.actualityTotal, item.total);
      item.csfinish = calculateCompletionRate(item.actualityTotal, item.csAmount);
      // 根据部门名称分类
      if (item.deptName?.includes('电商')) {
        originData2.value.push(item);
        addToCount(countObj2.value, item);
      } else {
        originData.value.push(item);
        addToCount(countObj.value, item);
      }
    });

    // 计算各合计的完成率
    calculateCountCompletionRates();

    // 计算总合计
    calculateTotalCount();

    // 生成最终列表
    generateFinalList();
  };

  /**
   * 重置合计对象
   */
  const resetCountObjects = () => {
    originData.value = [];
    originData2.value = [];

    Object.assign(countObj.value, {
      deptName: '药业合计',
      xsAmount: 0,
      total: 0,
      dhAmount: 0,
      chAmount: 0,
      csAmount: 0,
      actualityDhAmount: 0,
      actualityChAmount: 0,
      actualityTotal: 0,
      finish: 0,
      csfinish: 0,
    });

    Object.assign(countObj2.value, {
      deptName: '电商合计',
      xsAmount: 0,
      total: 0,
      dhAmount: 0,
      chAmount: 0,
      csAmount: 0,
      actualityDhAmount: 0,
      actualityChAmount: 0,
      actualityTotal: 0,
      finish: 0,
      csfinish: 0,
    });
  };

  /**
   * 累加到合计对象
   */
  const addToCount = (count: FundingReportData, item: FundingReportData) => {
    count.xsAmount += item.xsAmount;
    count.total += item.total;
    count.dhAmount += item.dhAmount;
    count.chAmount += item.chAmount;
    count.csAmount += item.csAmount;
    count.actualityDhAmount += item.actualityDhAmount;
    count.actualityChAmount += item.actualityChAmount;
    count.actualityTotal += item.actualityTotal;
  };

  /**
   * 计算各合计的完成率
   */
  const calculateCountCompletionRates = () => {
    countObj.value.finish = calculateCompletionRate(
      countObj.value.actualityTotal,
      countObj.value.total
    );
    countObj.value.csfinish = calculateCompletionRate(
      countObj.value.actualityTotal,
      countObj.value.csAmount
    );

    countObj2.value.finish = calculateCompletionRate(
      countObj2.value.actualityTotal,
      countObj2.value.total
    );
    countObj2.value.csfinish = calculateCompletionRate(
      countObj2.value.actualityTotal,
      countObj2.value.csAmount
    );
  };

  /**
   * 计算总合计
   */
  const calculateTotalCount = () => {
    Object.assign(totalObj.value, {
      deptName: '药业电商合计',
      xsAmount: (countObj.value.xsAmount * 100 + countObj2.value.xsAmount * 100) / 100,
      total: (countObj.value.total * 100 + countObj2.value.total * 100) / 100,
      dhAmount: (countObj.value.dhAmount * 100 + countObj2.value.dhAmount * 100) / 100,
      chAmount: (countObj.value.chAmount * 100 + countObj2.value.chAmount * 100) / 100,
      csAmount: (countObj.value.csAmount * 100 + countObj2.value.csAmount * 100) / 100,
      actualityDhAmount:
        (countObj.value.actualityDhAmount * 100 + countObj2.value.actualityDhAmount * 100) / 100,
      actualityChAmount:
        (countObj.value.actualityChAmount * 100 + countObj2.value.actualityChAmount * 100) / 100,
      actualityTotal:
        (countObj.value.actualityTotal * 100 + countObj2.value.actualityTotal * 100) / 100,
      finish: 0,
      csfinish: 0,
    });

    totalObj.value.finish = calculateCompletionRate(
      totalObj.value.actualityTotal,
      totalObj.value.total
    );
    totalObj.value.csfinish = calculateCompletionRate(
      totalObj.value.actualityTotal,
      totalObj.value.csAmount
    );
  };

  /**
   * 生成最终列表
   */
  const generateFinalList = () => {
    list.value = [
      ...originData.value,
      { ...countObj.value },
      ...originData2.value,
      { ...countObj2.value },
      { ...totalObj.value },
    ];
  };

  /**
   * 处理搜索
   */
  const handleSearch = (key: string) => {
    searchParams.value.key = key;
    searchParams.value.finishnum = 0;
    searchParams.value.csfinishnum = 0;
    if (searchParams.value.key) {
      list.value = [
        ...originData.value.filter((item: any) => item.deptName.includes(searchParams.value.key)),
        ...originData2.value.filter((item: any) => item.deptName.includes(searchParams.value.key)),
      ];
      searchRes.value = [...list.value];
    } else {
      list.value = [
        ...originData.value,
        { ...countObj.value },
        ...originData2.value,
        { ...countObj2.value },
        { ...totalObj.value },
      ];
    }
  };

  /**
   * 排序处理
   */
  const handleSort = (type: 'finish' | 'csfinish') => {
    if (type === 'finish') {
      searchParams.value.finishnum =
        searchParams.value.finishnum === 1 ? 2 : searchParams.value.finishnum === 2 ? 0 : 1;
      searchParams.value.csfinishnum = 0;
    } else {
      searchParams.value.csfinishnum =
        searchParams.value.csfinishnum === 1 ? 2 : searchParams.value.csfinishnum === 2 ? 0 : 1;
      searchParams.value.finishnum = 0;
    }
    const orderType = searchParams.value.finishnum || searchParams.value.csfinishnum;
    const orderColumn = searchParams.value.finishnum
      ? 'finish'
      : searchParams.value.csfinishnum
        ? 'csfinish'
        : '';

    if (searchParams.value.key) {
      list.value = orderType
        ? orderBy(searchRes.value, [orderColumn], [orderType === 2 ? 'asc' : 'desc'])
        : searchRes.value;
    } else {
      const tempData = orderType
        ? orderBy(originData.value, [orderColumn], [orderType === 2 ? 'asc' : 'desc'])
        : originData.value;
      const tempData2 = orderType
        ? orderBy(originData2.value, [orderColumn], [orderType === 2 ? 'asc' : 'desc'])
        : originData2.value;
      list.value = [
        ...tempData,
        { ...countObj.value },
        ...tempData2,
        { ...countObj2.value },
        { ...totalObj.value },
      ];
    }
  };

  /**
   * 处理日期变化
   */
  const handleDateChange = (val: any) => {
    searchDate.value = val.fulldate;
    searchParams.value.key = '';
    searchParams.value.finishnum = 0;
    searchParams.value.csfinishnum = 0;
    getReportStats();
    getReportList();
  };

  /**
   * 跳转到详情页
   */
  const toDetail = (data: FundingReportData) => {
    router.push(RouteMap.fundingReportDetail, data);
  };

  return {
    calendarRef,
    today,
    searchDate,
    dataLoading,
    fundingData,
    searchParams,
    list,
    loading,
    countObj,
    countObj2,
    totalObj,
    searchRes,
    getReportStats,
    getReportList,
    handleSearch,
    handleSort,
    handleDateChange,
    toDetail,
  };
};
