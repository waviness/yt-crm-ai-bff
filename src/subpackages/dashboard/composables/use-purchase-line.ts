import type {
  PurchaseEntryObj,
  PurchaseDataObj,
  SonObjectStatItem,
  GoodsSatisfactionData,
  KaPurveyorData,
  SaleLockData,
  TurnoverData,
  AuthDeptSales,
  GeneralStatParams,
} from '../types/purchase';
import { useFormatter } from '@/composables/use-number-formatter';

/**
 * 采购线业务逻辑
 */
export function usePurchaseLine() {
  // ===== Store =====
  const dashboardStore = useDashboardStore();
  const selectedDate = computed(() => dashboardStore.dateTime);

  // ===== 响应式数据 =====
  const entryObj = ref<PurchaseEntryObj>({
    deptId: '',
    deptName: '',
    titleName: '',
    deptLevel: '',
  });

  const currentDept = ref<AuthDeptSales | null>(null);
  const activeTab = ref<'1' | '2'>('1'); // 1: 年, 2: 月
  const calendarShow = ref(false);
  const showPopup = ref(false);

  // 数据状态
  const purchaseDataObj = ref<Partial<PurchaseDataObj>>({});
  const sonObjectStatList = ref<SonObjectStatItem[]>([]);
  const goodsSatisfactionData = ref<Partial<GoodsSatisfactionData>>({});
  const kaPurveyorData = ref<Partial<KaPurveyorData>>({});
  const saleLockData = ref<Partial<SaleLockData>>({});
  const turnoverData = ref<Partial<TurnoverData>>({});
  const authDeptSales = ref<AuthDeptSales[]>([]);

  // 加载状态
  const pdloading = ref(false);
  const gsloading = ref(false);
  const kaloading = ref(false);
  const tdloading = ref(false);
  const lockloading = ref(false);

  // ===== 常量配置 =====
  const phmlArray = [998, 968, 999, 992, 993, 990, 994, 995, 996, 997];
  const medicSubCompany = ['中成药', '国产一部', '国产二部', '进口合资'];
  const medicAllCompany = ['英特药业', '中成药', '国产一部', '国产二部', '进口合资'];

  // ===== 计算属性 =====
  // 是否显示部门数据 tabs (英特药业特殊处理)
  const showDepartData = computed(() => currentDept.value?.deptName === '英特药业');

  // 是否显示平衡毛利
  const showBalanceGross = computed(
    () => currentDept.value && phmlArray.includes(Number(currentDept.value.deptId))
  );

  // 是否显示采购数据卡片 (战略/非战略)
  const showPurchaseData = computed(
    () =>
      currentDept.value &&
      (medicSubCompany.includes(currentDept.value.deptName) ||
        currentDept.value.deptName === '英特药业')
  );

  // 是否显示子对象列表1 (带战略/非战略详情)
  const showItemBox = computed(
    () =>
      sonObjectStatList.value.length > 0 &&
      currentDept.value &&
      medicSubCompany.includes(currentDept.value.deptName)
  );

  // 是否显示子对象列表2 (简单版)
  const showItemBox2 = computed(
    () =>
      sonObjectStatList.value.length > 0 &&
      currentDept.value &&
      !medicAllCompany.includes(currentDept.value.deptName)
  );

  // 是否显示数据趋势
  const showTrend = computed(() => true);

  // ===== 辅助函数 =====
  /**
   * 数字颜色类名
   */
  const getColor = (value: string | number) => {
    if (!value || value === '--') return '';
    const numValue = String(value).replace(',', '');
    return Number(numValue) > 0 ? 'color-normal' : 'color-never';
  };

  /**
   * 数字符号
   */
  const getFH = (value: string | number) => {
    if (!value || value === '--') return '';
    const numValue = String(value).replace(',', '');
    return Number(numValue) > 0 ? '+' : '';
  };

  /**
   * 数值格式化
   */
  const { formatTenThousand, formatPercentage } = useFormatter();

  // ===== API 调用 =====
  /**
   * 获取综合统计数据
   */
  const fetchGeneralStat = async (deptId: string | number) => {
    const params: GeneralStatParams = {
      objectId: deptId,
      selectDate: selectedDate.value,
      objectType: 1,
      type: Number(activeTab.value),
    };

    pdloading.value = true;
    sonObjectStatList.value = [];
    purchaseDataObj.value = {};

    try {
      // 调用实际的 API
      const res = await DashboardService.getGeneralStat(params);

      if (res.code === '200') {
        const allData = res.data;

        // 处理子对象列表
        sonObjectStatList.value = (res.data.sonObjectStatList || []).map((item: any) => ({
          generalObjectId: item.generalObjectId,
          generalObjectName: item.generalObjectName,
          yearRevenue: formatTenThousand(item.revenue, { digits: 1 }),
          yearRevenueOnPercent: formatPercentage(item.revenueOnPercent, { digits: 1 }),
          zcAmount: formatTenThousand(item.zcAmount, { digits: 1 }),
          zcPercent: formatPercentage(item.zcPercent, { digits: 1 }),
          zcProgress: formatPercentage(item.zcProgress, { digits: 1 }),
          fzcAmount: formatTenThousand(item.fzcAmount, { digits: 1 }),
          fzcPercent: formatPercentage(item.fzcPercent, { digits: 1 }),
          fzcProgress: formatPercentage(item.fzcProgress, { digits: 1 }),
          underLyingGoodsNum: item.underLyingGoodsNum,
          yearInSaleGoodsNum: item.saleGoodsNum,
          yearInSaleGoodsNumOnPercent: formatPercentage(item.saleGoodsNumOnPercent, { digits: 2 }),
        }));

        // 处理当前对象数据
        purchaseDataObj.value = {
          yearRevenue: formatTenThousand(allData.currentObjectStat?.revenue, { digits: 1 }),
          yearRevenueOnPercent: formatPercentage(allData.currentObjectStat?.revenueOnPercent, {
            digits: 2,
          }),
          zcAmount: formatTenThousand(allData.currentObjectStat?.zcAmount, { digits: 1 }),
          zcPercent: formatPercentage(allData.currentObjectStat?.zcPercent, { digits: 2 }),
          zcProgress: formatPercentage(allData.currentObjectStat?.zcProgress, { digits: 2 }),
          fzcAmount: formatTenThousand(allData.currentObjectStat?.fzcAmount, { digits: 1 }),
          fzcPercent: formatPercentage(allData.currentObjectStat?.fzcPercent, { digits: 2 }),
          fzcProgress: formatPercentage(allData.currentObjectStat?.fzcProgress, { digits: 2 }),
          yearInSaleGoodsNum: allData.currentObjectStat?.saleGoodsNum || '--',
          yearInSaleGoodsNumOnPercent: formatPercentage(
            allData.currentObjectStat?.saleGoodsNumOnPercent,
            { digits: 2 }
          ),
          targetCompletePercent: formatPercentage(
            allData.currentObjectStat?.targetCompletePercent,
            { digits: 2 }
          ),
          targetGoalDiff: allData.currentObjectStat?.targetGoalDiff || '--',
        };
      }
    } catch (error) {
      console.error('获取综合统计数据失败:', error);
      toast.showError('获取数据失败');
    } finally {
      pdloading.value = false;
    }
  };

  /**
   * 获取货品满足率
   */
  const fetchGoodsSatisfaction = async (deptId: string | number) => {
    const params = {
      deptId,
      selectDate: selectedDate.value,
    };

    goodsSatisfactionData.value = {};
    gsloading.value = true;

    try {
      const res = await DashboardService.getGoodsSatisfactionInfo(params);

      if (res.code === '200') {
        goodsSatisfactionData.value = {
          monthGoodsFillRate: formatPercentage(res.data.monthGoodsFillRate, { digits: 2 }),
          monthGoodsFillRateNetIncrease: formatPercentage(res.data.monthGoodsFillRateNetIncrease, {
            digits: 2,
          }),
          yearGoodsFillRate: formatPercentage(res.data.yearGoodsFillRate, { digits: 2 }),
          yearGoodsFillRateNetIncrease: formatPercentage(res.data.yearGoodsFillRateNetIncrease, {
            digits: 2,
          }),
          targetFillRateDiff: formatPercentage(res.data.targetFillRateDiff, { digits: 2 }),
        };
      }
    } catch (error) {
      console.error('获取货品满足率失败:', error);
    } finally {
      gsloading.value = false;
    }
  };

  /**
   * 获取KA供应商数据
   */
  const fetchKaPurveyor = async (deptId: string | number) => {
    const params = {
      deptId,
      selectDate: selectedDate.value,
    };

    kaPurveyorData.value = {};
    kaloading.value = true;

    try {
      const res = await DashboardService.getKaPurveyorStat(params);

      if (res.code === '200') {
        kaPurveyorData.value = {
          monthSalesAmount: formatTenThousand(res.data.monthSalesAmount, { digits: 1 }),
          monthOnPercent: formatPercentage(res.data.monthOnPercent, { digits: 2 }),
          yearSalesAmount: formatTenThousand(res.data.yearSalesAmount, { digits: 1 }),
          yearOnPercent: formatPercentage(res.data.yearOnPercent, { digits: 2 }),
          sharePercent: formatPercentage(res.data.sharePercent, { digits: 2 }),
          sharePercentNetIncrease: formatPercentage(res.data.sharePercentNetIncrease, {
            digits: 2,
          }),
        };
      }
    } catch (error) {
      console.error('获取KA供应商数据失败:', error);
    } finally {
      kaloading.value = false;
    }
  };

  /**
   * 获取锁控数据
   */
  const fetchSaleLock = async (deptId: string | number) => {
    const params = {
      deptId,
      objectType: 1,
      selectDate: selectedDate.value,
    };

    saleLockData.value = {};
    lockloading.value = true;

    try {
      const res = await DashboardService.getSaleLockStat(params);

      if (res.code === '200') {
        saleLockData.value = {
          lockGoodsNum: res.data.lockGoodsNum || '--',
          saleLockNum: res.data.saleLockNum || '--',
          averageUnlockCost: res.data.averageUnlockCost || '--',
          unlockOrderNum: res.data.unlockOrderNum || '--',
        };
      }
    } catch (error) {
      console.error('获取锁控数据失败:', error);
    } finally {
      lockloading.value = false;
    }
  };

  /**
   * 获取库存周转数据
   */
  const fetchTurnover = async (deptId: string | number) => {
    const params = {
      deptId,
      selectDate: selectedDate.value,
    };

    turnoverData.value = {};
    tdloading.value = true;

    try {
      const res = await DashboardService.getTurnoverDaysInfo(params);

      if (res.code === '200') {
        turnoverData.value = {
          monthTurnoverDays: res.data.monthTurnoverDays || '--',
          monthTurnoverDaysNetDiff: res.data.monthTurnoverDaysNetDiff || '--',
          yearTurnoverDays: res.data.yearTurnoverDays || '--',
          yearTurnoverDaysNetDiff: res.data.yearTurnoverDaysNetDiff || '--',
          targetDiffPercent: res.data.targetDiffPercent || '--',
        };
      }
    } catch (error) {
      console.error('获取库存周转数据失败:', error);
    } finally {
      tdloading.value = false;
    }
  };

  /**
   * 获取权限部门列表
   */
  const fetchAuthDeptSales = async () => {
    const params = {
      selectDate: selectedDate.value,
      deptFlag: 1,
      full: true,
      deptid: '',
    };

    try {
      const res = await DashboardService.getAuthDeptSales(params);

      if (res.code === '200' && res.data?.resultList) {
        authDeptSales.value = res.data.resultList.map((item: any) => ({
          deptId: item.DEPT_ID,
          deptName: item.DEPT_NAME,
          authFlag: item.AUTH_FLAG,
          sonDeptSalesDTOList: (item.SON_DEPT_LIST || []).map((son: any) => ({
            deptId: son.DEPT_ID,
            deptName: son.DEPT_NAME,
            authFlag: son.AUTH_FLAG,
          })),
          isExpanded: false,
        }));
      }
    } catch (error) {
      console.error('获取权限部门列表失败:', error);
    }
  };

  /**
   * 加载所有数据
   * @param skipDeptList - 是否跳过设置默认部门（当已有部门时设为false）
   * @param skipFlag - 是否需要重新获取部门列表
   * @param routeParams - 路由参数，用于设置初始部门
   */
  const loadAllData = async (
    skipDeptList: boolean = true,
    skipFlag: boolean = false,
    routeParams?: { deptId?: string; deptName?: string }
  ) => {
    try {
      // 加载部门列表
      if (skipFlag) {
        await fetchAuthDeptSales();
      }

      // 处理路由参数 - 优先使用路由传递的部门信息
      if (routeParams?.deptId && routeParams?.deptName) {
        currentDept.value = {
          deptId: routeParams.deptId,
          deptName: routeParams.deptName,
          authFlag: true,
          sonDeptSalesDTOList: [],
          isExpanded: false,
        };
        entryObj.value = {
          ...entryObj.value,
          deptName: routeParams.deptName,
          deptId: routeParams.deptId,
        };
      }
      // 设置默认部门（仅当没有路由参数且需要设置默认部门时）
      else if (skipDeptList && authDeptSales.value.length > 0) {
        const firstDept = authDeptSales.value[0];
        currentDept.value = firstDept.authFlag
          ? firstDept
          : firstDept.sonDeptSalesDTOList.find(item => item.authFlag) || firstDept;

        entryObj.value = {
          ...entryObj.value,
          deptName: currentDept.value.deptName,
          deptId: String(currentDept.value.deptId),
        };
      }

      // 并行加载数据
      const deptId = currentDept.value?.deptId;
      if (deptId) {
        await Promise.allSettled([
          fetchGeneralStat(deptId),
          fetchSaleLock(deptId),
          fetchGoodsSatisfaction(deptId),
          fetchKaPurveyor(deptId),
          fetchTurnover(deptId),
        ]);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.showError('数据加载失败');
    }
  };

  // ===== 事件处理 =====
  /**
   * 切换 Tab (年/月)
   */
  const handleTabChange = async (name: '1' | '2') => {
    activeTab.value = name;
    await loadAllData(false, false);
  };

  /**
   * 选择日期
   */
  const handleDateSelect = async (date: Date) => {
    calendarShow.value = false;
    dashboardStore.setDateTime(time.format(date, time.FORMATS.ISO_DATE));
    await loadAllData(false, false);
  };

  /**
   * 选择部门
   */
  const handleDeptSelect = async (dept: AuthDeptSales) => {
    showPopup.value = false;
    currentDept.value = dept;
    entryObj.value = {
      ...entryObj.value,
      deptName: dept.deptName,
      deptId: String(dept.deptId),
    };
    await loadAllData(false, true);
  };

  /**
   * 点击子部门卡片,跳转到详情
   */
  const handleDeptCardClick = (item: SonObjectStatItem) => {
    router.push(RouteMap.purchaseLineRise, {
      deptId: String(item.generalObjectId),
      deptName: item.generalObjectName,
      isInner: '1',
    });
  };

  return {
    // 数据
    entryObj,
    currentDept,
    activeTab,
    calendarShow,
    showPopup,
    purchaseDataObj,
    sonObjectStatList,
    goodsSatisfactionData,
    kaPurveyorData,
    saleLockData,
    turnoverData,
    authDeptSales,
    selectedDate,

    // 加载状态
    pdloading,
    gsloading,
    kaloading,
    tdloading,
    lockloading,

    // 计算属性
    showDepartData,
    showBalanceGross,
    showPurchaseData,
    showItemBox,
    showItemBox2,
    showTrend,

    // 方法
    getColor,
    getFH,
    loadAllData,
    handleTabChange,
    handleDateSelect,
    handleDeptSelect,
    handleDeptCardClick,
  };
}
