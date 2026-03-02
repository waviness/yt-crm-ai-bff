/**
 * 项目管理排名页面业务逻辑 Composable
 *
 * 管理排名页面的所有业务逻辑，包括：
 * - 项目/产品筛选
 * - 组织架构选择
 * - 排名数据获取和排序
 * - 页面状态管理
 */

import type { OrgInfo } from '../types';

export function useProjectRank() {
  // 响应式数据
  const isMessage = ref(false);
  const date = ref('');
  const projectShow = ref(false);
  const searchParams = ref({
    finish: 1, // 0无排序 1降序 2升序
    rate: 0,
  });
  const total = ref(0);
  const listTypeText = ref(['', '组织名称', '部门名称', '业务员名称']);
  const listType = ref(1); // 1组织 2部门 3人员
  const currentProjectObj = ref<any>({
    projectId: '',
    text: '全部',
  });
  const currentProductObj = ref<any>({});
  const currentOrgObj = ref<OrgInfo>({} as OrgInfo);
  const currentDeptObj = ref<any>({});
  const proLoading = ref(false);
  const projectList = ref<any[]>([]);
  const activeId = ref<number | string>('');
  const activeIndex = ref(0);
  const orgList = ref<any[]>([]);
  const orgActiveId = ref<number | string>('');
  const orgActiveIndex = ref(0);
  const keywords = ref('');
  const projectText = ref('');
  const list = ref<any[]>([]);
  const orgShow = ref(false);
  const loading = ref(false);
  const error = ref(false);

  // 计算属性
  const hasData = computed(() => list.value && list.value.length > 0);
  const isLoading = computed(() => loading.value);

  /**
   * 搜索项目
   */
  const handleSearchProject = async () => {
    proLoading.value = true;
    const res = await ProjectService.getProjectProductList({
      date: date.value,
      key: keywords.value,
    });

    projectList.value = res.map((item: any) => ({
      ...item,
      text: item.projectName,
      children: [
        { id: `${item.projectId}-1`, text: '不限' },
        ...item.productVOList.map((pro: any) => ({
          id: pro.productId,
          text: pro.productName,
        })),
      ],
    }));

    if (!keywords.value) {
      projectList.value.unshift({
        projectId: '',
        text: '全部',
        children: [{ id: '', text: '不限' }],
      });
    }

    // 设置当前选中项
    const currentIndex = projectList.value.findIndex(
      (item: any) => item.projectId === currentProjectObj.value.projectId
    );
    activeIndex.value = currentIndex >= 0 ? currentIndex : 0;
    proLoading.value = false;
  };

  /**
   * 获取组织列表
   */
  const getOrgList = async () => {
    const res = await ProjectService.queryDataDeptByType({ date: date.value });

    orgList.value = res.deptTreeList[0].deptVO.map((org: any) => ({
      id: org.deptId,
      text: org.deptName,
      children: [
        { id: `${org.deptId}-1`, text: '中心本级' },
        ...org.deptVO.map(({ deptId, deptName }: any) => ({
          id: deptId,
          text: deptName,
        })),
      ],
    }));

    orgList.value.unshift({
      id: '',
      text: '公司整体',
      children: [{ id: '', text: '不限' }],
    });

    // 根据权限级别设置默认选中
    if (res.leaderLevel === 1) {
      // 药品事业部管理人员
      orgActiveIndex.value = 0;
      orgActiveId.value = '';
      listType.value = 1;
      currentOrgObj.value = orgList.value[0];
    } else if (res.leaderLevel === 2) {
      // 中心管理人员
      const centerIndex = orgList.value.findIndex((item: any) => item.id === res.crmGroup.depId);
      if (centerIndex >= 0) {
        orgActiveIndex.value = centerIndex;
        orgActiveId.value = `${orgList.value[centerIndex].id}-1`;
        currentOrgObj.value = orgList.value[centerIndex];
      }
      listType.value = 2;
    } else {
      // 部门管理人员
      const parentIndex = orgList.value.findIndex((item: any) => item.id === res.crmGroup.parentId);
      if (parentIndex >= 0) {
        orgActiveIndex.value = parentIndex;
        currentOrgObj.value = orgList.value[parentIndex];

        const deptIndex = orgList.value[parentIndex].children.findIndex(
          (dept: any) => dept.id === res.crmGroup.depId
        );
        if (deptIndex >= 0) {
          orgActiveId.value = orgList.value[parentIndex].children[deptIndex].id;
          currentDeptObj.value = orgList.value[parentIndex].children[deptIndex];
        }
      }
      listType.value = 3;
    }
    await getRankList();
  };

  /**
   * 获取排名数据
   */
  const getRankList = async () => {
    const { finish, rate } = searchParams.value;
    const params = {
      date: date.value,
      projectId: currentProjectObj.value.projectId || '',
      productId: activeId.value.toString().includes('-1') ? '' : String(activeId.value),
      orderColumn: finish ? 'accessNum' : rate ? 'accessRate' : '',
      orderType: finish === 2 || rate === 2 ? 1 : 0,
    };

    loading.value = true;
    let res;
    if (listType.value === 1) {
      res = await ProjectService.getAccessProjectRankCenter(params);
    } else if (listType.value === 2) {
      res = await ProjectService.getAccessProjectRankDept({
        ...params,
        centerId: String(currentOrgObj.value.id),
      });
    } else {
      res = await ProjectService.getAccessProjectRankSaler({
        ...params,
        centerId: String(currentOrgObj.value.id),
        crmDeptId: String(currentDeptObj.value.id),
      });
    }

    total.value = res.goalNum;
    list.value = res.accessProductDocNumVOS.map((item: any) => ({
      ...item,
      id: listType.value === 1 ? item.centerId : listType.value === 2 ? item.deptId : item.salerId,
      text:
        listType.value === 1
          ? item.centerName
          : listType.value === 2
            ? item.deptName
            : item.salerName,
    }));
  };

  /**
   * 排序点击处理
   */
  const handleSortClick = (type: number) => {
    if (type === 1) {
      searchParams.value.finish = searchParams.value.finish === 1 ? 2 : 1;
      searchParams.value.rate = 0;
    } else if (type === 2) {
      searchParams.value.rate = searchParams.value.rate === 1 ? 2 : 1;
      searchParams.value.finish = 0;
    }
    getRankList();
  };

  /**
   * 跳转到详情（切换列表类型）
   */
  const toDetail = (item: any) => {
    if (listType.value === 1) {
      listType.value = 2;
      currentOrgObj.value = item;
      getRankList();
    } else if (listType.value === 2) {
      listType.value = 3;
      currentDeptObj.value = item;
      getRankList();
    }
  };

  /**
   * 显示项目选择弹窗
   */
  const handleProChangeShow = () => {
    const currentIndex = projectList.value.findIndex(
      (item: any) => item.projectId === currentProjectObj.value.projectId
    );
    activeIndex.value = currentIndex >= 0 ? currentIndex : 0;
    activeId.value = currentProductObj.value.id || '';
    projectShow.value = true;
  };

  /**
   * 确认项目选择
   */
  const handleConfirm = () => {
    if (activeIndex.value === -1) {
      uni.showToast({ title: '请选择项目/产品', icon: 'none' });
      return;
    }

    const hasSelectedProduct = projectList.value[activeIndex.value].children.some(
      (product: any) => product.id === activeId.value
    );

    if (!hasSelectedProduct) {
      uni.showToast({ title: '请选择产品', icon: 'none' });
      return;
    }

    if (activeId.value === currentProductObj.value.id) {
      projectShow.value = false;
      return;
    }

    const selectedProduct = projectList.value[activeIndex.value].children.find(
      (item: any) => item.id === activeId.value
    );

    if (activeId.value) {
      projectText.value = `${projectList.value[activeIndex.value].text}/${selectedProduct.text}`;
    } else {
      projectText.value = '';
    }

    currentProjectObj.value = projectList.value[activeIndex.value];
    currentProductObj.value = selectedProduct;
    projectShow.value = false;
    getRankList();
  };

  /**
   * 显示组织选择弹窗
   */
  const handleOrgChangeShow = () => {
    const currentIndex = orgList.value.findIndex((item: any) => item.id === currentOrgObj.value.id);
    orgActiveIndex.value = currentIndex >= 0 ? currentIndex : 0;
    orgActiveId.value = currentDeptObj.value.id || `${currentOrgObj.value.id}-1`;
    orgShow.value = true;
  };

  /**
   * 确认组织选择
   */
  const handleConfirmOrg = () => {
    const hasSelectedDept = orgList.value[orgActiveIndex.value].children.some(
      (dept: any) => dept.id === orgActiveId.value
    );

    if (!hasSelectedDept) {
      uni.showToast({ title: '请选择中心/部门', icon: 'none' });
      return;
    }

    if (orgActiveId.value === currentDeptObj.value.id) {
      orgShow.value = false;
      return;
    }

    currentOrgObj.value = orgList.value[orgActiveIndex.value];
    currentDeptObj.value = orgList.value[orgActiveIndex.value].children.find(
      (item: any) => item.id === orgActiveId.value
    );

    listType.value = orgActiveId.value ? (orgActiveId.value.toString().includes('-1') ? 2 : 3) : 1;

    orgShow.value = false;
    getRankList();
  };

  /**
   * 返回首页
   */
  const goBack = () => {
    router.redirect(RouteMap.projectEntry, { messageType: 1 });
  };

  /**
   * 初始化页面
   */
  const initPage = async (options: any) => {
    isMessage.value = options.isMessage || false;

    date.value = options.date;

    await Promise.all([handleSearchProject(), getOrgList()]);
  };

  // 占位方法（保持接口兼容性）
  const handleProjectSelect = () => {};
  const handleProductSelect = () => {};
  const handleOrgSelect = () => {};
  const handleDeptSelect = () => {};
  const handleListTypeChange = () => {};
  const setActiveProject = () => {};

  return {
    // 响应式数据
    isMessage,
    date,
    projectShow,
    searchParams,
    total,
    listTypeText,
    listType,
    currentProjectObj,
    currentProductObj,
    currentOrgObj,
    currentDeptObj,
    activeId,
    orgList,
    orgActiveId,
    orgActiveIndex,
    projectText,
    list,
    orgShow,
    loading,
    error,

    // 计算属性
    hasData,
    isLoading,

    // 项目搜索相关
    proLoading,
    projectList,
    activeIndex,
    keywords,
    setActiveProject,

    // 方法
    handleSearchProject,
    getOrgList,
    getRankList,
    handleProjectSelect,
    handleProductSelect,
    handleOrgSelect,
    handleDeptSelect,
    handleListTypeChange,
    handleSortClick,
    toDetail,
    initPage,
    handleProChangeShow,
    handleConfirm,
    handleOrgChangeShow,
    handleConfirmOrg,
    goBack,
  };
}
