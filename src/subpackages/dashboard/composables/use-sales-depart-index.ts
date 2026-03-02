/**
 * 销售端最基本逻辑
 */
import type {
  QuickOverviewParams,
  QuickOverviewApiRawData,
  QuickOverviewSalesData,
  QuickOverviewDepartmentTabItem,
  QtGroupId,
  EntryObj,
} from '../types';
import { SPECIAL_DEPT_IDS } from '../types';
import { transformToDepartmentTabData, transformToSalesData } from './use-sales-depart-utils';
import { arithmetic } from '@/utils/number';
const { formatCurrency } = useFormatter();
const dashboardStore = useDashboardStore();
// 创建默认值的工厂函数
const createDefaultSalesData = (): QuickOverviewSalesData => ({
  cdmoney: '',
  cmcircleOnPercent: '',
  cmmoney: '',
  cmonPercent: '',
  cmperiodIncrease: '',
  cymoney: '',
  cyonPercent: '',
  cyperiodIncrease: '',
  imptCustomerYearOnPercent: '',
  imptGoodsYearOnPercent: '',
  overdueAmount: '',
  receivable: '',
  thisReceivable: '',
  longAccounts: '',
  ndyy: '',
  targetCompletePercent: '',
});

const createDefaultDepartmentItem = () => ({
  cdmoney: '',
  cmcircleOnPercent: '',
  cmmoney: '',
  cmonPercent: '',
  cmperiodIncrease: '',
  cymoney: '',
  cyonPercent: '',
  cyperiodIncrease: '',
  imptCustomerYearOnPercent: '',
  imptGoodsYearOnPercent: '',
  overdueAmount: '',
  receivable: '',
  thisReceivable: '',
  longAccounts: '',
  ndyy: '',
  targetCompletePercent: '',
});
/**
 * 销售部门索引的钩子函数
 * @param entryObj - 入口对象，包含部门级别、ID和名称等信息
 * @param autoFetch - 是否自动获取数据，默认为true
 */
export function useSalesDepartIndex(entryObj: EntryObj, autoFetch = true) {
  const echartsLoading = ref(false); // echarts 加载状态
  const hasFlag = ref(false); // 是否已经获取过数据
  const statusActive = ref(0); // 当前状态，0：全局看板，1：业务看板
  const TOP_LEVEL_DEPT_ID = '449';
  const salesDataObj = ref<QuickOverviewSalesData>(createDefaultSalesData()); // 销售数据对象
  const ytyyDepartList = ref<QuickOverviewDepartmentTabItem[]>([]);
  const qtDepartList = ref<QuickOverviewDepartmentTabItem[]>([]);
  const departNameTabs = ref<QuickOverviewDepartmentTabItem[]>([]);
  const showPopup = ref(false); // 部门选择弹窗显示状态
  /**
   * 处理月度累计金额数据（示例：将Options API风格代码转换为Composition API）
   */
  const lastYearDatalist = ref<string[]>([]);
  const currentYearDatalist = ref<string[]>([]);
  // 重置所有部门列表
  const resetDepartmentLists = () => {
    ytyyDepartList.value = [];
    qtDepartList.value = [];
    departNameTabs.value = [];
  };

  // 判断是否需要触发后续操作
  const shouldTriggerPostFetch = () =>
    statusActive.value === 1 ||
    (entryObj.deptLevel && +entryObj.deptLevel === 0) ||
    (entryObj.deptLevel && +entryObj.deptLevel === 1 && entryObj.deptId !== TOP_LEVEL_DEPT_ID);

  // 错误处理函数
  const handleError = (error: unknown, message: string) => {
    console.error(error);
    uni.showToast({ title: message, icon: 'none' });
  };

  /**
   * 获取快速概览数据的异步函数
   * @param forceFetch - 是否强制获取数据，默认为false
   */
  const fetchGetQuickOverview = async (forceFetch = false) => {
    console.log('[forceFetch]', forceFetch);
    // 如果不是强制获取且不允许自动获取，则直接返回
    if (!forceFetch && !autoFetch) return;
    echartsLoading.value = true; // 设置加载状态为true
    hasFlag.value = false; // 每次获取数据时重置 hasFlag
    resetDepartmentLists(); // 重置所有部门列表
    // 构建请求参数对象
    const params: QuickOverviewParams = {
      date: dashboardStore.dateTime, // 日期参数
      deptLevel: entryObj.deptLevel ?? -1, // 部门级别，默认为0
      deptId: entryObj.deptId, // 部门ID
      deptName: entryObj.deptName, // 部门名称
    };
    try {
      // 显示加载提示框
      uni.showLoading({
        title: '数据加载中...',
        mask: true,
      });
      // 调用API获取快速概览数据
      const res = await DashboardService.getQuickOverview(params);
      // 获取原始数据并断言为IQuickOverviewApiRawData类型
      const rawData = res.data as QuickOverviewApiRawData;
      if (!rawData) throw new Error('Invalid response data');
      // 1. 处理主销售数据
      salesDataObj.value = transformToSalesData(rawData);
      console.log('[salesDataObj]', salesDataObj.value);
      // 2. 处理子部门列表
      await processChildDepartments(rawData.childDeptList || []);

      // 3. 根据条件触发获取部门详细数据
      // 如果状态激活值为1或者是顶级部门(部门级别为0)，则触发后续操作
      if (shouldTriggerPostFetch()) {
        await triggerPostFetchActions();
      }
    } catch (error) {
      handleError(error, '加载主数据失败');
    } finally {
      // 无论成功或失败，最终都将加载状态设为false
      echartsLoading.value = false;
      uni.hideLoading(); // 隐藏加载提示框
    }
  };

  const createDepartmentItem = (
    commonObj: Omit<EntryObj, 'drillDownFlag'>,
    showName: string,
    drillDownFlag: boolean
  ) => ({
    ...commonObj,
    showName,
    hasClick: Boolean(drillDownFlag),
    ...createDefaultDepartmentItem(),
  });

  // 判断是否显示部门
  const isShowDepartment = (deptLevel: string | number, deptId: string | number) =>
    (Number(deptLevel) === 0 && Number(deptId) === 449) ||
    (Number(deptLevel) === 1 && Number(entryObj.deptId) === 449) ||
    Number(deptLevel) === 2 ||
    Number(deptLevel) === 3;
  /**
   * 处理子部门数据，根据不同的部门ID将部门分类并添加到对应的列表中
   * @param childList - 子部门列表，包含部门ID、层级、名称等信息
   */
  const processChildDepartments = (childList: QuickOverviewDepartmentTabItem[]) => {
    // 遍历子部门列表
    for (const val of childList) {
      // 创建通用对象，包含部门基本信息
      const commonObj: Omit<EntryObj, 'drillDownFlag'> = {
        deptId: val.deptId,
        deptLevel: val.deptLevel,
        deptName: val.deptName,
        deptParentId: val.deptParentId,
      };

      // 判断部门ID是否为"含战略采购"的特殊部门
      if (val.deptId === SPECIAL_DEPT_IDS.STRATEGIC_PURCHASING_INCLUDED) {
        // 添加到ytyyDepartList列表，并设置特定显示名称和其他属性
        ytyyDepartList.value.push(
          createDepartmentItem(
            commonObj,
            '含战略采购',
            (val.drillDownFlag || val.deptLevel === 3) ?? false
          )
        );
      } else if (val.deptId === SPECIAL_DEPT_IDS.STRATEGIC_PURCHASING_EXCLUDED) {
        ytyyDepartList.value.push(
          createDepartmentItem(
            commonObj,
            '不含战略采购',
            +val.deptLevel! === 0 || +val.deptLevel! === 1
              ? (val.drillDownFlag ?? false)
              : +val.deptLevel! === 3 || +val.deptLevel! === 4
          )
        );
      } else if (SPECIAL_DEPT_IDS.QT_GROUP.includes(Number(val.deptId) as QtGroupId)) {
        qtDepartList.value.push(
          createDepartmentItem(
            commonObj,
            val.deptName,
            +val.deptLevel! === 0 || +val.deptLevel! === 1
              ? (val.drillDownFlag ?? false)
              : +val.deptLevel! === 3 || +val.deptLevel! === 4
          )
        );
      } else {
        departNameTabs.value.push({
          ...createDepartmentItem(
            commonObj,
            val.deptName,
            +val.deptLevel! === 0 || +val.deptLevel! === 1 || +val.deptLevel! === 2
              ? (val.drillDownFlag ?? false)
              : +val.deptLevel! === 3 || +val.deptLevel! === 4
          ),
          shortName: val.deptName,
          isShowFlag: isShowDepartment(val.deptLevel!, val.deptId),
        });
      }
    }
  };
  /**
   * 触发获取数据后的后续操作
   */
  const triggerPostFetchActions = async () => {
    await initBusinessDetails();
  };

  /**
   * 初始化业务详情数据 (原 ywInit)
   */
  const initBusinessDetails = async () => {
    if (hasFlag.value) return;
    uni.showLoading({
      title: '数据加载中...',
      mask: true,
    });
    const requests = buildDepartmentRequests();
    try {
      // 使用 Promise.allSettled 确保单个请求失败不影响整体
      const results = await Promise.allSettled(requests.all);
      await handleDepartmentResults(results);
    } catch (error) {
      uni.showToast({ title: '加载业务详情失败', icon: 'none' });
    } finally {
      hasFlag.value = true;
      uni.hideLoading();
    }
  };

  /**
   * 构建所有部门的请求
   */
  const buildDepartmentRequests = () => {
    const baseParams: Omit<QuickOverviewParams, 'deptId' | 'deptName' | 'deptLevel'> = {
      date: dashboardStore.dateTime,
    };

    const createReq = (list: QuickOverviewDepartmentTabItem[]) =>
      list.map(element =>
        DashboardService.getQuickOverview({
          ...baseParams,
          deptLevel: element.deptLevel,
          deptId: element.deptId,
          deptName: element.deptName,
          drillDownFlag: element.drillDownFlag,
        })
      );

    const lists = [
      { name: 'tabs', list: departNameTabs.value },
      { name: 'ytyy', list: ytyyDepartList.value },
      { name: 'qt', list: qtDepartList.value },
    ];
    const requests = lists.reduce(
      (acc, { name, list }) => {
        acc[name] = createReq(list);
        acc.all.push(...acc[name]);
        return acc;
      },
      { all: [] } as Record<string, any[]>
    );
    return requests;
  };

  /**
   * 处理所有部门请求的返回结果
   */
  const handleDepartmentResults = async (
    results: PromiseSettledResult<{ data: QuickOverviewApiRawData }>[]
  ) => {
    const lists = [
      { list: departNameTabs.value, length: departNameTabs.value.length },
      { list: ytyyDepartList.value, length: ytyyDepartList.value.length },
      { list: qtDepartList.value, length: qtDepartList.value.length },
    ];
    let currentOffset = 0;
    for (const { list, length } of lists) {
      for (let i = 0; i < length; i++) {
        const result = results[currentOffset + i];
        if (result.status === 'fulfilled' && result.value.data) {
          const targetObj = list.find(d => d.deptId === result.value.data.deptId);
          if (targetObj) {
            Object.assign(targetObj, transformToDepartmentTabData(result.value.data, arithmetic));
          }
        }
      }
      currentOffset += length;
    }
  };
  const fetchGetMonthCumulativeMoney = async (forceFetch = false) => {
    // 如果不是强制获取且不允许自动获取，则直接返回
    if (!forceFetch && !autoFetch) {
      return;
    }
    const res = await DashboardService.getMonthCumulativeMoney({
      date: dashboardStore.dateTime,
      deptLevel: entryObj.deptLevel,
      deptId: entryObj.deptId,
      deptName: entryObj.deptName,
    });
    const dataValue = res.data.map((val: number) => {
      const newVal = val ? Number(arithmetic.divide(val, 100000000)).toFixed(1) : '';
      return newVal;
    });
    // 处理去年数据（前12个值）
    lastYearDatalist.value = dataValue.slice(0, 12);

    // 处理今年数据（从第13个值开始，不足12个则用空字符串填充）
    currentYearDatalist.value = [];
    for (let index = 0; index < 12; index++) {
      const element = dataValue.slice(12)[index];
      currentYearDatalist.value.push(element || '');
    }
    console.log('currentYearDatalist.value');
    console.log(lastYearDatalist.value);
    console.log(currentYearDatalist.value);
  };

  // --- 返回状态和函数 ---
  return {
    salesDataObj,
    ytyyDepartList,
    qtDepartList,
    departNameTabs,
    echartsLoading,
    statusActive,
    showPopup,
    fetchGetQuickOverview,
    triggerPostFetchActions,
    fetchGetMonthCumulativeMoney,
    lastYearDatalist,
    currentYearDatalist,
  };
}
