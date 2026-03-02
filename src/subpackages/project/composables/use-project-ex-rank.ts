/**
 * 深分进度排名页面业务逻辑 Composable
 *
 * @description 管理深分进度排名页面的所有业务逻辑，包括数据获取、搜索、排序等
 */

import type { SearchParams, TypeValue, ListType, ProjectInfo, RankData } from '../types';

export function useProjectExRank() {
  // 项目搜索相关
  const proLoading = ref(false);
  const projectList = ref<any[]>([]);
  const activeIndex = ref(0);
  const keywords = ref('');

  // 状态管理
  const loading = ref(false);
  const error = ref(false);

  // 响应式数据
  const isMessage = ref(false);
  const date = ref('');
  const projectShow = ref(false);
  const searchParams = ref<SearchParams>({
    rate: 1, // 0无排序 1降序 2升序
  });
  const total = ref(0);
  const typeValue = ref(1 as TypeValue);
  const listTypeText = ref(['', '组织名称', '部门名称']);
  const listType = ref(1); // 1组织 2部门
  const currentProObj = ref({
    projectId: '',
    projectName: '全部',
    text: '全部',
  } as ProjectInfo);
  const currentOrgObj = ref({
    projectId: '',
    projectName: '',
    id: '',
    name: '',
  } as any);
  const orgList = ref<any[]>([]);
  const orgActiveIndex = ref(0);
  const projectText = ref('');
  const list = ref<RankData[]>([]);
  const orgShow = ref(false);

  // 计算属性
  const hasData = computed(() => list.value.length > 0);
  const isLoading = computed(() => loading.value || proLoading.value);

  /**
   * 搜索项目
   * @description 根据关键词搜索深分项目列表
   */
  const handleSearchProject = async () => {
    proLoading.value = true;
    const res = await ProjectService.getDeepProjectSelect({
      date: date.value,
      key: keywords.value,
    });
    proLoading.value = false;
    projectList.value = res;
    projectList.value.forEach((item: any) => {
      item.text = item.projectName;
    });
    if (!keywords.value) {
      projectList.value.unshift({
        projectId: '',
        text: '全部',
      });
    }
    let flag = 0;
    for (let i = 0; i < projectList.value.length; i++) {
      if (projectList.value[i].projectId === currentProObj.value.projectId) {
        activeIndex.value = i;
        flag = 1;
        break;
      }
    }
    if (!flag) {
      activeIndex.value = -1;
    }
  };

  /**
   * 获取组织列表
   * @description 获取组织架构数据
   */
  const getOrgList = async () => {
    const res = await ProjectService.queryDataDeptByType({ date: date.value });
    res.deptTreeList[0].deptVO.forEach((org: any) => {
      orgList.value.push({
        id: org.deptId,
        name: org.deptName,
      });
    });
    orgList.value.unshift({
      id: '',
      name: '公司整体',
    });
    if (res.leaderLevel === 1) {
      // 药品事业部管理人员
      orgActiveIndex.value = 0;
      listType.value = 1;
    } else if (res.leaderLevel === 2) {
      // 中心管理人员
      for (let i = 0; i < orgList.value.length; i++) {
        const element = orgList.value[i];
        if (element.id === res.crmGroup.depId) {
          orgActiveIndex.value = i;
          currentOrgObj.value = element;
          break;
        }
      }
      listType.value = 1;
    } else {
      // 部门管理人员
      for (let i = 0; i < orgList.value.length; i++) {
        const element = orgList.value[i];
        if (element.id === res.crmGroup.depId) {
          orgActiveIndex.value = i;
          currentOrgObj.value = element;
          break;
        }
      }
      listType.value = 2;
    }
  };

  /**
   * 获取排名数据
   * @description 根据当前筛选条件获取深分排名数据
   */
  const getRankList = async () => {
    loading.value = true;
    const params = {
      date: date.value,
      flag: typeValue.value,
      projectId: currentProObj.value.projectId || '',
      orderColumn: searchParams.value.rate ? 'completeRate' : '',
      orderType: searchParams.value.rate === 2 ? 1 : 0,
    };

    const res =
      listType.value === 1
        ? await ProjectService.getDeepProjectRankCenter(params)
        : await ProjectService.getDeepProjectRankDept({
            ...params,
            centerId: currentOrgObj.value.id,
          });
    list.value = res.deepProjectNumVOS || [];
    list.value.forEach((item: any) => {
      item.id = listType.value === 1 ? item.centerId : item.deptId;
      item.name = listType.value === 1 ? item.centerName : item.deptName;
    });
    total.value = res.sum;
    loading.value = false;
  };

  /**
   * 项目选择处理
   * @param project 选择的项目
   */
  const handleProjectSelect = (project: ProjectInfo) => {
    currentProObj.value = project;
    projectText.value = project.projectName;
    projectShow.value = false;
    getRankList();
  };

  /**
   * 组织选择处理
   * @param org 选择的组织
   */
  const handleOrgSelect = (org: ProjectInfo) => {
    currentOrgObj.value = org;
    orgActiveIndex.value = orgList.value.findIndex(item => item.id === org.id);
    orgShow.value = false;
    getRankList();
  };

  /**
   * 列表类型切换处理
   * @param type 新的列表类型
   */
  const handleListTypeChange = (type: ListType) => {
    listType.value = type;
    getRankList();
  };

  /**
   * 类型切换处理
   * @param type 新的类型值
   */
  const handleTypeChange = (type: TypeValue) => {
    typeValue.value = type;
    getRankList();
  };

  /**
   * 排序点击处理
   * @description 切换完成率排序状态
   */
  const handleSortClick = () => {
    searchParams.value.rate = searchParams.value.rate === 1 ? 2 : 1;
    getRankList();
  };

  /**
   * 跳转到详情页面
   * @param data 详情数据
   */
  const toDetail = (data: any) => {
    if (listType.value === 1) {
      currentOrgObj.value = data;
      listType.value = 2;
      getRankList();
    }
  };

  /**
   * 确认项目选择
   */
  const handleConfirm = () => {
    if (activeIndex.value === -1) {
      uni.showToast({
        title: '请选择项目',
        icon: 'none',
      });
      return;
    }
    const selectedProject = projectList.value[activeIndex.value];
    projectText.value = selectedProject.projectId ? selectedProject.text : '';
    currentProObj.value = selectedProject;
    projectShow.value = false;
    getRankList();
  };

  /**
   * 显示组织切换弹窗
   */
  const handleOrgChangeShow = () => {
    const currentIndex = orgList.value.findIndex((item: any) => item.id === currentOrgObj.value.id);
    orgActiveIndex.value = currentIndex >= 0 ? currentIndex : 0;
    orgShow.value = true;
  };

  /**
   * 确认组织选择
   */
  const handleConfirmOrg = () => {
    if (orgList.value[orgActiveIndex.value].id === currentOrgObj.value.id) {
      orgShow.value = false;
      return;
    }
    currentOrgObj.value = orgList.value[orgActiveIndex.value];
    listType.value = orgActiveIndex.value === 0 ? 1 : 2;
    orgShow.value = false;
    getRankList();
  };

  /**
   * 返回首页
   */
  const goBack = () => {
    router.redirect(RouteMap.projectEntry, { messageType: 2 });
  };

  /**
   * 页面初始化
   * @description 页面加载时的初始化逻辑
   */
  const initPage = async (options: any) => {
    isMessage.value = options.isMessage || false;

    date.value = options.date;
    // 并行获取数据
    await Promise.all([handleSearchProject(), getOrgList()]);

    // 获取排名数据
    await getRankList();
  };

  return {
    // 响应式数据
    isMessage,
    date,
    projectShow,
    searchParams,
    total,
    typeValue,
    listTypeText,
    listType,
    currentProObj,
    currentOrgObj,
    orgList,
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

    // 方法
    handleSearchProject,
    getOrgList,
    getRankList,
    handleProjectSelect,
    handleOrgSelect,
    handleListTypeChange,
    handleTypeChange,
    handleSortClick,
    toDetail,
    handleConfirm,
    handleOrgChangeShow,
    handleConfirmOrg,
    goBack,
    initPage,
  };
}
