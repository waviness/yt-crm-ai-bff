import type { StatisticsData } from '../types';

export function useProjectGoods() {
  const userStore = useUserStore();
  const projectStore = useProjectStore();

  // 使用 store 中的共享数据
  const resList = computed(() => projectStore.projectParams.resList);
  const selectMonth = computed(() => projectStore.projectParams.selectMonth);
  const columns = computed(() => projectStore.projectParams.columns);
  const yearMonthData = computed(() => projectStore.projectParams.yearMonthData);
  const orgOriginList = computed(() => projectStore.projectParams.orgOriginList);
  const orgList = computed(() => projectStore.projectParams.orgList);

  // 直接使用 store 中的 leaderLevel
  const leaderLevel = computed(() => projectStore.projectLeaderLevel || 0);

  // 业务数据
  const projectId = computed(() => projectStore.projectParams.projectId);
  const projectName = computed(() => projectStore.projectParams.projectName);
  const data = ref({} as StatisticsData);
  const searchGoodsParams = ref({
    key: '',
    status: 0, // 0全部 1未准入 2已准入
  });
  const list = ref<any[]>([]);
  const loading = ref(false);

  /**
   * 获取统计数据
   */
  const getData = async () => {
    const params: any = {
      date: selectMonth.value.replace('.', '-'),
      userIdList: !leaderLevel.value
        ? [userStore.userInfor.userId]
        : (resList.value[2] || [])
            .filter(({ userId }: any) => userId !== -1)
            .map(({ userId }: any) => userId),
      projectId: projectId.value,
    };
    if (leaderLevel.value) {
      params.centerId = resList.value[0].id === 1 ? '' : resList.value[0].id;
      params.crmDeptId = resList.value[1].id.toString().includes('-1') ? '' : resList.value[1].id;
    }
    const res = await ProjectService.getAccessProjectDocNum(params);
    data.value = res;
  };

  /**
   * 获取商品列表
   */
  const getGoodsList = async () => {
    list.value = [];
    loading.value = true;

    const { key, status } = searchGoodsParams.value;
    const params: any = {
      date: selectMonth.value.replace('.', '-'),
      userIdList: !leaderLevel.value
        ? [userStore.userInfor.userId]
        : (resList.value[2] || [])
            .filter(({ userId }: any) => userId !== -1)
            .map(({ userId }: any) => userId),
      projectId: projectId.value,
      key,
      accessFlag: status === 0 ? '' : status > 0 ? status - 1 : '',
    };
    if (leaderLevel.value) {
      params.centerId = resList.value[0].id === 1 ? '' : resList.value[0].id;
      params.crmDeptId = resList.value[1].id.toString().includes('-1') ? '' : resList.value[1].id;
    }
    const res = await ProjectService.getAccessProjectProduc(params);
    loading.value = false;
    list.value = res;
  };

  /**
   * 月份变化处理
   */
  const handleMonthChange = (value: string) => {
    projectStore.setProjectParams({
      selectMonth: value,
    });
    getData();
    getGoodsList();
  };

  /**
   * 用户变化处理
   */
  const handleUserChange = (res: any) => {
    projectStore.setProjectParams({
      resList: [...res],
    });
    getData();
    getGoodsList();
  };

  /**
   * Tab切换处理
   */
  const onTabChange = () => {
    router.back();
  };

  /**
   * 跳转到详情
   */
  const toDetail = (data: any) => {
    // 设置产品详情到 store
    projectStore.setProductDetail({ data, date: selectMonth.value.replace('.', '-') });
    router.push(RouteMap.projectDetail);
  };

  /**
   * 跳转到政策
   */
  const toPolicy = () => {
    router.push(RouteMap.projectPolicy, {
      type: 1,
      date: selectMonth.value.replace('.', '-'),
      projectId: projectId.value,
      projectName: projectName.value,
    });
  };

  /**
   * 页面加载处理
   */
  const handlePageLoad = async () => {
    await getData();
    await getGoodsList();
  };

  return {
    // 业务数据
    projectName,
    data,
    searchGoodsParams,
    list,
    loading,

    // 共享数据
    resList,
    selectMonth,
    orgOriginList,
    orgList,
    leaderLevel,
    columns,
    yearMonthData,

    // 方法
    getData,
    getGoodsList,
    handleMonthChange,
    handleUserChange,
    onTabChange,
    toDetail,
    toPolicy,
    handlePageLoad,
  };
}
