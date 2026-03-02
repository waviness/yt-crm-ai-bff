import type {
  PurchaseManDataObj,
  SonObjectStatItem,
  GoodsSatisfactionData,
  KaPurveyorData,
  TurnoverData,
} from '../types/purchase';

/**
 * 采购员详情业务逻辑
 */
export function usePurchaseDetail() {
  // ===== 响应式数据 =====
  const personName = ref('');
  const objectId = ref('');
  const activeTab = ref<'1' | '2'>('1'); // 1: 年, 2: 月
  const calendarShow = ref(false);

  // 数据状态
  const purchaseDataObj = ref<Partial<PurchaseManDataObj>>({});
  const sonObjectStatList = ref<SonObjectStatItem[]>([]);
  const goodsSatisfactionData = ref<Partial<GoodsSatisfactionData>>({});
  const purveyorData = ref<Partial<KaPurveyorData>>({});
  const turnoverData = ref<Partial<TurnoverData>>({});

  // 加载状态
  const gsloading = ref(false);
  const kaloading = ref(false);
  const tdloading = ref(false);

  // Store
  const dashboardStore = useDashboardStore();
  const selectedDate = computed(() => dashboardStore.dateTime);

  // ===== 计算属性 =====
  const showItemBox = computed(() => sonObjectStatList.value.length > 0);

  // 数字颜色类名
  const getColor = (value: string | number) => {
    if (!value || value === '--') return '';
    const numValue = String(value).replace(',', '');
    return Number(numValue) > 0 ? 'color-normal' : 'color-never';
  };

  // 数字符号
  const getFH = (value: string | number) => {
    if (!value || value === '--') return '';
    const numValue = String(value).replace(',', '');
    return Number(numValue) > 0 ? '+' : '';
  };

  // 数值格式化
  const getValue = (value: any, precision: number = 1) => {
    if (value === null || value === undefined || value === '') return '--';
    const num = Number(value);
    if (isNaN(num)) return '--';

    if (precision === 1) {
      return (num / 10000).toFixed(1);
    } else if (precision === 2) {
      return num.toFixed(2);
    }
    return num.toFixed(precision);
  };

  // ===== 副作用 =====
  // 监听日期变化并重新加载数据
  watch(
    () => dashboardStore.dateTime,
    newDate => {
      if (newDate !== selectedDate.value) {
        loadAllData();
      }
    }
  );

  // ===== API 调用 =====
  /**
   * 获取个人综合统计数据
   */
  const fetchGeneralStat = async () => {
    const params = {
      selectDate: selectedDate.value,
      objectType: 2, // 2 表示个人维度
      type: Number(activeTab.value),
    };

    try {
      const res = await DashboardService.getGeneralStat(params);

      if (res.code === '200') {
        const allData = res.data;

        // 子对象列表
        sonObjectStatList.value = (res.data.sonObjectStatList || []).map((item: any) => ({
          generalObjectId: item.generalObjectId,
          generalObjectName: item.generalObjectName,
          yearRevenue: getValue(item.revenue, 1),
          yearRevenueOnPercent: getValue(item.revenueOnPercent, 2),
          targetCompletePercent: getValue(item.targetCompletePercent, 2),
          targetGoalDiff: item.targetGoalDiff,
          underLyingGoodsNum: item.underLyingGoodsNum,
          yearInSaleGoodsNum: item.saleGoodsNum,
          yearInSaleGoodsNumOnPercent: getValue(item.saleGoodsNumOnPercent, 2),
        }));

        // 当前对象数据
        purchaseDataObj.value = {
          yearRevenue: getValue(allData.currentObjectStat?.revenue, 1),
          yearRevenueOnPercent: getValue(allData.currentObjectStat?.revenueOnPercent, 2),
          targetCompletePercent: getValue(allData.currentObjectStat?.targetCompletePercent, 2),
          targetGoalDiff: allData.currentObjectStat?.targetGoalDiff,
          yearInSaleGoodsNum: allData.currentObjectStat?.saleGoodsNum,
        };
      }
    } catch (error) {
      console.error('获取综合统计数据失败:', error);
      toast.showError('获取数据失败');
    }
  };

  /**
   * 获取货品满足率
   */
  const fetchGoodsSatisfaction = async () => {
    const params = {
      selectDate: selectedDate.value,
    };

    goodsSatisfactionData.value = {};
    gsloading.value = true;

    try {
      const res = await DashboardService.getGoodsSatisfactionInfo(params);

      if (res.code === '200') {
        goodsSatisfactionData.value = {
          monthGoodsFillRate: getValue(res.data.monthGoodsFillRate, 2),
          monthGoodsFillRateNetIncrease: getValue(res.data.monthGoodsFillRateNetIncrease, 2),
          yearGoodsFillRate: getValue(res.data.yearGoodsFillRate, 2),
          yearGoodsFillRateNetIncrease: getValue(res.data.yearGoodsFillRateNetIncrease, 2),
          targetFillRateDiff: getValue(res.data.targetFillRateDiff, 2),
        };
      }
    } catch (error) {
      console.error('获取货品满足率失败:', error);
    } finally {
      gsloading.value = false;
    }
  };

  /**
   * 获取供应商数据
   */
  const fetchPurveyorStat = async () => {
    const params = {
      selectDate: selectedDate.value,
    };

    purveyorData.value = {};
    kaloading.value = true;

    try {
      const res = await DashboardService.getPurveyorStat(params);

      if (res.code === '200') {
        purveyorData.value = {
          monthSalesAmount: getValue(res.data.monthSalesAmount, 1),
          monthOnPercent: getValue(res.data.monthOnPercent, 2),
          yearSalesAmount: getValue(res.data.yearSalesAmount, 1),
          yearOnPercent: getValue(res.data.yearOnPercent, 2),
          sharePercent: getValue(res.data.sharePercent, 2),
          sharePercentNetIncrease: getValue(res.data.sharePercentDiff, 2),
        };
      }
    } catch (error) {
      console.error('获取供应商数据失败:', error);
    } finally {
      kaloading.value = false;
    }
  };

  /**
   * 获取库存周转数据
   */
  const fetchTurnoverDays = async () => {
    const params = {
      selectDate: selectedDate.value,
    };

    turnoverData.value = {};
    tdloading.value = true;

    try {
      const res = await DashboardService.getTurnoverDaysInfo(params);

      if (res.code === '200') {
        turnoverData.value = {
          monthTurnoverDays: res.data.monthTurnoverDays,
          monthTurnoverDaysNetDiff: res.data.monthTurnoverDaysNetDiff,
          yearTurnoverDays: res.data.yearTurnoverDays,
          yearTurnoverDaysNetDiff: res.data.yearTurnoverDaysNetDiff,
          targetDiffPercent: res.data.targetDiffPercent,
        };
      }
    } catch (error) {
      console.error('获取库存周转数据失败:', error);
    } finally {
      tdloading.value = false;
    }
  };

  /**
   * 加载所有数据
   */
  const loadAllData = async () => {
    try {
      const requests = [
        fetchGeneralStat(),
        fetchPurveyorStat(),
        fetchTurnoverDays(),
        fetchGoodsSatisfaction(),
      ].map(p =>
        p.catch(e => {
          console.error('请求失败:', e);
          return null;
        })
      );

      await Promise.allSettled(requests);
    } catch (error) {
      console.error('全局错误捕获:', error);
    }
  };

  // ===== 事件处理 =====
  /**
   * 切换 Tab
   */
  const handleTabChange = async () => {
    uni.showLoading({ title: '加载中...', mask: true });
    try {
      await fetchGeneralStat();
    } catch (e) {
      console.error(e);
    } finally {
      uni.hideLoading();
    }
  };

  /**
   * 选择日期
   */
  const handleDateSelect = async (date: Date) => {
    calendarShow.value = false;
    dashboardStore.setDateTime(time.format(date, time.FORMATS.ISO_DATE));
    await loadAllData();
  };

  /**
   * 打开日历
   */
  const handleCalendarClick = () => {
    calendarShow.value = true;
  };

  return {
    // 数据
    personName,
    objectId,
    activeTab,
    calendarShow,
    purchaseDataObj,
    sonObjectStatList,
    goodsSatisfactionData,
    purveyorData,
    turnoverData,
    selectedDate,

    // 加载状态
    gsloading,
    kaloading,
    tdloading,

    // 计算属性
    showItemBox,

    // 方法
    getColor,
    getFH,
    loadAllData,
    handleTabChange,
    handleDateSelect,
    handleCalendarClick,
  };
}
