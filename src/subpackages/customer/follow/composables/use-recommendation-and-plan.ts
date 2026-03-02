import { CustomerFollowService } from '@/api/customer-follow';
import { CommonService } from '@/api/common';
import { RouteMap } from '@/config/route';
/**
 * 拜访推荐和拜访计划 composable
 */
export function useRecommendationAndPlan() {
  const appStore = useAppStore();

  // 状态
  const recommendationList = ref<any[]>([]);
  const planList = ref<any[]>([]);
  const recommendationLoading = ref(false);
  const planLoading = ref(false);
  const showFilter = ref(false);
  const showVisitTypePopup = ref(false);
  const showAccountUnitPopup = ref(false);

  // 拜访类型列表
  const visitTypes = ref([
    { value: 4, text: '已完成拜访' },
    { value: 3, text: '预约拜访' },
    { value: 2, text: '本次不拜访' },
    { value: 1, text: '近30天不再提示' },
  ]);

  // 核算单元选项
  const accountUnitList = ref<string[]>([]);

  // 筛选条件
  const filterObj = ref({
    customer: '',
    accountUnit: '',
    visitType: '',
    visitTypeValue: 0,
  });

  /**
   * 加载拜访推荐数据
   */
  const loadRecommendationData = async () => {
    recommendationLoading.value = true;
    try {
      const params = {
        pageNum: 1,
        pageSize: 99,
        visitPlan: 0, // 0表示初始状态，用于拜访推荐
      };
      const res = await CustomerFollowService.getUvaiRcmdPlan(params);
      if (res && res.list) {
        recommendationList.value = res.list;
      }
    } catch (error) {
      console.error('❌ 获取拜访推荐数据失败:', error);
    } finally {
      recommendationLoading.value = false;
    }
  };

  /**
   * 加载拜访计划数据
   */
  const loadPlanData = async (filterParams: any = {}) => {
    planLoading.value = true;
    try {
      const params = {
        pageNum: 1,
        pageSize: 99,
        visitPlan: filterParams.visitPlan || 3,
        ...filterParams,
      };
      const res = await CustomerFollowService.getUvaiRcmdPlan(params);
      if (res && res.list) {
        planList.value = res.list;
      }
    } catch (error) {
      console.error('❌ 获取拜访计划数据失败:', error);
    } finally {
      planLoading.value = false;
    }
  };

  /**
   * 拜访类型选择确认
   */
  const onVisitTypeConfirm = (e: any) => {
    const { value } = e;
    if (value && value.length > 0) {
      const selected = value[0];
      filterObj.value.visitType = selected.text;
      filterObj.value.visitTypeValue = selected.value;
    }
    showVisitTypePopup.value = false;
  };

  /**
   * 核算单元选择确认
   */
  const onAccountUnitConfirm = (e: any) => {
    const { value } = e;
    if (value && value.length > 0) {
      filterObj.value.accountUnit = value[0];
    }
    showAccountUnitPopup.value = false;
  };

  /**
   * 获取核算单元列表
   */
  const getAccountUnitList = async () => {
    try {
      const res = await CommonService.queryEntryid();
      if (res && res.length > 0) {
        accountUnitList.value = res.map((item: any) => `${item.entryid}/${item.entryname}` || '');
      }
    } catch (error) {
      console.error('获取核算单元列表失败:', error);
    }
  };

  /**
   * 重置筛选条件
   */
  const filterRefresh = () => {
    filterObj.value = {
      customer: '',
      accountUnit: '',
      visitType: '',
      visitTypeValue: 0,
    };
  };

  /**
   * 确定筛选条件
   */
  const handleFilterOk = () => {
    showFilter.value = false;
    const filterParams: any = {
      customerKeyword: filterObj.value.customer || '',
      visitPlan: filterObj.value.visitTypeValue || 0,
      entryId: 0,
    };

    // 从accountUnit中解析出entryId
    if (filterObj.value.accountUnit && filterObj.value.accountUnit.includes('/')) {
      const [entryId] = filterObj.value.accountUnit.split('/');
      filterParams.entryId = parseInt(entryId) || 0;
    }

    // 调用加载数据的方法
    loadPlanData(filterParams);
  };

  /**
   * 跳转到智能拜访详情页
   */
  const goToIntellDetail = (item: any) => {
    console.log('🔗 跳转到智能拜访详情页, 参数:', item);

    // 使用 appStore 存储数据，避免 URL 编码问题
    appStore.setDetailObj(item);

    router.push(RouteMap.intellVisitDetail);
  };

  /**
   * 跳转到拜访容器页面
   */
  const goToAddVisit = (item: any) => {
    console.log('🔗 跳转到拜访容器页面, 参数:', item);

    // 使用 appStore 存储数据
    appStore.setDetailObj({
      ...item,
      objId: item.customerId,
      objName: item.customerName,
      objTypeValue: '2', // 下游客户
    });

    router.push(RouteMap.visitContainer);
  };

  /**
   * 拜访计划条件筛选点击事件
   */
  const filterPlanClick = () => {
    getAccountUnitList();
    showFilter.value = true;
  };

  return {
    recommendationList,
    planList,
    recommendationLoading,
    planLoading,
    showFilter,
    showVisitTypePopup,
    showAccountUnitPopup,
    visitTypes,
    accountUnitList,
    filterObj,
    loadRecommendationData,
    loadPlanData,
    onVisitTypeConfirm,
    onAccountUnitConfirm,
    getAccountUnitList,
    filterRefresh,
    handleFilterOk,
    goToIntellDetail,
    goToAddVisit,
    filterPlanClick,
  };
}
