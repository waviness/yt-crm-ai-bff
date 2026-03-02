export const useProjectStore = defineStore(
  'project',
  () => {
    const projectLeaderLevel = ref<number | null>(null);
    const projectParams = ref({
      projectId: '',
      projectName: '',
      selectMonth: '',
      resList: [] as any[],
      orgOriginList: [] as any[],
      orgList: [] as any[],
      columns: [] as any[],
      yearMonthData: [] as any[],
    });
    const currentTab = ref<'access' | 'ex'>('access');

    // 待处理的 tab 切换（用于从详情页返回后自动切换）
    const pendingTabSwitch = ref<'access' | 'ex' | null>(null);

    // 产品详情数据
    const productDetail = ref<{
      data: {
        capId: string;
        customerId: string;
        productId: string;
        projectId: string;
      };
      date: string;
    }>({
      data: {
        capId: '',
        customerId: '',
        productId: '',
        projectId: '',
      },
      date: '',
    });

    const setProjectLeaderLevel = (leaderLevel: number | null) => {
      projectLeaderLevel.value = leaderLevel;
    };

    const setProjectParams = (params: any) => {
      projectParams.value = { ...projectParams.value, ...params };
    };

    const setCurrentTab = (tab: 'access' | 'ex') => {
      currentTab.value = tab;
    };

    const setProductDetail = (product: any) => {
      productDetail.value = product;
    };

    const setPendingTabSwitch = (tab: 'access' | 'ex' | null) => {
      pendingTabSwitch.value = tab;
    };

    // 计算属性：根据权限级别决定显示的tabs
    const tabConfig = computed(() => {
      const leaderLevel = projectLeaderLevel.value;

      if (leaderLevel === null || leaderLevel === 0) {
        // 业务员：只显示准入管理
        const config = {
          active: 0,
          list: [{ name: '准入管理' }],
          showTabs: true,
        };
        return config;
      } else if (leaderLevel === 1) {
        // 公司项目管理人员：显示两个tab
        const config = {
          active: currentTab.value === 'access' ? 0 : 1,
          list: [{ name: '准入管理' }, { name: '深分进度' }],
          showTabs: true,
        };
        return config;
      } else {
        // 子公司项目管理人员：只显示深分进度
        const config = {
          active: 0,
          list: [{ name: '深分进度' }],
          showTabs: true,
        };
        return config;
      }
    });

    return {
      projectLeaderLevel,
      projectParams,
      currentTab,
      pendingTabSwitch,
      productDetail,
      tabConfig,
      setProjectLeaderLevel,
      setProjectParams,
      setCurrentTab,
      setPendingTabSwitch,
      setProductDetail,
    };
  },
  {
    persist: {},
  }
);
