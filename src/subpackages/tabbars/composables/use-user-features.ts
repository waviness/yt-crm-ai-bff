/**
 * 用户功能模块 Composable
 * 封装用户页面的各种功能逻辑：意见反馈、打卡记录等
 */

export interface SuggestionItem {
  credate: string;
  suggestionid: string;
  advicemsg: string;
  creId: string;
  creName: string;
}

export interface ClickInItem {
  credate: string;
  cciId: string;
  address: string;
  longitude: string;
  latitude: string;
  creName: string;
}

export interface UserMenuItem {
  keyword: string;
  pmsName: string;
  icon: string;
}

/**
 * 使用意见反馈功能
 */
export function useSuggestionFeature() {
  const suggestionShow = ref(false);
  const suggestMsg = ref('');
  const suggestMsgShow = ref(false);

  /**
   * 提交意见反馈
   */
  const commitSuggestion = async () => {
    if (!suggestMsg.value) {
      showError('请输入内容');
      return;
    }

    const params = {
      advicemsg: suggestMsg.value,
    };
    await UserService.insertSuggestion(params);
    suggestionShow.value = false;
    suggestMsg.value = '';
    showSuccess('提交成功');
  };

  /**
   * 获取意见反馈列表
   */
  const fetchSuggestionList = async (params: { pageNum: number; pageSize: number }) => {
    const response = await UserService.querySuggestion(params);
    return {
      list: response.list,
      hasNextPage: response.hasNextPage,
      total: response.total,
    };
  };

  /**
   * 打开意见反馈弹框
   */
  const openSuggestionModal = () => {
    suggestionShow.value = true;
  };

  /**
   * 打开意见反馈列表
   */
  const openSuggestionList = () => {
    suggestMsgShow.value = true;
  };

  return {
    // 状态
    suggestionShow,
    suggestMsg,
    suggestMsgShow,

    // 方法
    commitSuggestion,
    fetchSuggestionList,
    openSuggestionModal,
    openSuggestionList,
  };
}

/**
 * 使用打卡记录功能
 */
export function useClickInFeature() {
  const clickInShow = ref(false);
  const keywords = ref('');
  const result = ref<string[]>([]);
  const sureResult = ref<string[]>([]);
  const addressSearchValue = ref('');
  const dateRange = ref<Date[]>([]);
  const userListShow = ref(false);
  const userDetailList = ref<any[]>([]);
  const userDetailListLoading = ref(false);
  const userListLoaded = ref(false); // 标记是否已加载过用户列表
  const userListOriginal = ref<any[]>([]); // 保存原始用户列表
  const userListSearchResult = ref<{ keyword: string; list: any[] } | null>(null); // 保存搜索结果
  const userListContentReady = ref(false); // 控制内容延迟渲染

  const departmentStore = useDepartmentStore();

  /**
   * 初始化日期范围（默认最近15天）
   */
  const initDateRange = () => {
    const startTime = time.add(new Date(), -15, 'day');
    const endTime = new Date();
    dateRange.value = [startTime, endTime];
  };

  /**
   * 获取打卡记录列表
   */
  const fetchClickInList = async (params: { pageNum: number; pageSize: number }) => {
    const response = await UserService.getCrmClockIn({
      pageNum: params.pageNum,
      pageSize: params.pageSize,
      detailFlag: false,
      startTime: dateRange.value[0] ? time.format(dateRange.value[0], time.FORMATS.ISO_DATE) : '--',
      endTime: dateRange.value[1] ? time.format(dateRange.value[1], time.FORMATS.ISO_DATE) : '--',
      keyword: addressSearchValue.value,
      type:
        departmentStore.depTreeList && departmentStore.depTreeList.length && sureResult.value.length
          ? 2
          : 1,
      userList: sureResult.value,
    } as any);
    return {
      list: response.list || [],
      hasNextPage: response.hasNextPage ?? false,
      total: response.total || 0,
    };
  };

  /**
   * 打开打卡记录列表
   */
  const openClickInList = () => {
    keywords.value = '';
    result.value = [];
    sureResult.value = [];
    addressSearchValue.value = '';
    if (dateRange.value.length === 0) {
      initDateRange();
    }
    clickInShow.value = true;
  };

  /**
   * 处理搜索输入
   */
  const handleSearchInput = (value: string) => {
    addressSearchValue.value = value;
  };

  /**
   * 日期范围确认
   */
  const calendarConfirm = (val: any) => {
    if (val.range) {
      dateRange.value = [new Date(val.range.before), new Date(val.range.after)];
    } else if (Array.isArray(val)) {
      dateRange.value = val.map((d: any) => new Date(d));
    }
  };

  /**
   * 选择人员（打开人员选择弹窗）
   */
  const chooseUser = async () => {
    // 先标记内容未准备好，显示空白弹窗
    userListContentReady.value = false;
    // 立即显示弹窗，提升响应速度
    userListShow.value = true;

    // 使用 nextTick 确保弹窗动画先执行
    await nextTick();

    // 延迟一小段时间再加载内容，提升打开速度
    setTimeout(async () => {
      // 如果有搜索关键词
      if (keywords.value) {
        // 如果搜索关键词匹配上次的搜索结果，直接使用
        if (userListSearchResult.value?.keyword === keywords.value) {
          userDetailList.value = userListSearchResult.value.list;
          userListContentReady.value = true;
          return;
        }
        // 如果搜索关键词变化了，请求接口
        userDetailList.value = [];
        try {
          await getUserList();
        } finally {
          userListContentReady.value = true;
        }
        return;
      }
      // 如果没有搜索关键词，且已经加载过，则使用缓存的数据
      if (userListLoaded.value) {
        userDetailList.value = userListOriginal.value;
        userListContentReady.value = true;
        return;
      }
      // 否则请求接口
      userDetailList.value = [];
      try {
        await getUserList();
      } finally {
        userListContentReady.value = true;
      }
    }, 50);
  };

  /**
   * 获取人员列表
   */
  const getUserList = async () => {
    userDetailListLoading.value = true;
    try {
      // 如果有部门树，使用部门树获取；否则直接获取所有用户
      let params: any = {
        leaderFlag: false,
        authorizedFlag: true,
      };

      if (keywords.value) {
        // 有搜索关键词时，直接搜索
        params.keyword = keywords.value;
      }
      if (departmentStore.depTreeList && departmentStore.depTreeList.length > 0) {
        // 有部门树时，使用部门树获取
        const depIdList = departmentStore.mapTreeList(departmentStore.depTreeList, [], true);
        params.depIdList = depIdList;
      }

      const res = await CommonService.getUserByParams(params);
      const userList = res || [];
      userDetailList.value = userList;

      // 如果没有搜索关键词，保存原始列表并标记为已加载
      if (!keywords.value) {
        userListOriginal.value = userList;
        userListLoaded.value = true;
      } else {
        // 保存搜索结果
        userListSearchResult.value = {
          keyword: keywords.value,
          list: [...userList],
        };
      }
    } catch (error) {
      console.error('获取人员列表失败:', error);
      userDetailList.value = [];
    } finally {
      userDetailListLoading.value = false;
    }
  };

  /**
   * 人员搜索
   */
  const onUserSearch = async () => {
    // 如果搜索关键词匹配上次的搜索结果，直接使用
    if (userListSearchResult.value?.keyword === keywords.value) {
      userDetailList.value = userListSearchResult.value.list;
      return;
    }
    // 否则请求接口
    userDetailList.value = [];
    await getUserList();
  };

  /**
   * 取消人员选择
   */
  const cancelUserSelect = () => {
    userListShow.value = false;
    result.value = [];
    sureResult.value = [];
    keywords.value = '';
    // 关闭时重置状态
    userListContentReady.value = false;
  };

  /**
   * 确认人员选择
   */
  const confirmUserSelect = () => {
    userListShow.value = false;
    sureResult.value = [...result.value];
  };

  /**
   * 初始化部门树
   */
  const initDepTree = async () => {
    if (!departmentStore.depTreeList || departmentStore.depTreeList.length === 0) {
      await departmentStore.getDepTree({ treeType: 1, authorizedFlag: true });
    }
  };

  return {
    // 状态
    clickInShow,
    keywords,
    result,
    sureResult,
    addressSearchValue,
    dateRange,
    userListShow,
    userDetailList,
    userDetailListLoading,
    userListContentReady,

    // 方法
    fetchClickInList,
    openClickInList,
    handleSearchInput,
    calendarConfirm,
    chooseUser,
    getUserList,
    onUserSearch,
    cancelUserSelect,
    confirmUserSelect,
    initDepTree,
    initDateRange,
  };
}

/**
 * 使用用户菜单功能
 */
export function useUserMenu() {
  const userMenu = ref<UserMenuItem[]>([]);
  const suggestionFeature = useSuggestionFeature();
  const clickInFeature = useClickInFeature();
  const phoneUpdateLogStatus = ref<string>('');
  const unWriteQuestionnaire = ref(false);

  /**
   * 处理菜单点击事件
   */
  const handleMenuClick = (item: UserMenuItem) => {
    switch (item.keyword) {
      case 'insertSuggest':
        suggestionFeature.openSuggestionModal();
        break;
      case 'querySuggest':
        suggestionFeature.openSuggestionList();
        break;
      case 'getClickIn':
        clickInFeature.openClickInList();
        clickInFeature.initDepTree();
        break;
      case 'updateLog':
        router.push(RouteMap.log);
        break;
      case 'questionServey':
        router.push(RouteMap.questionnaire);
        break;
      default:
        console.warn('未知的菜单操作:', item.keyword);
        break;
    }
  };

  /**
   * 初始化用户菜单
   * 从 resListTree 中查找 pmsName === '我的' 的菜单，然后取 pmsType === 3 的子菜单
   */
  const initUserMenu = (userInfor: any) => {
    const menuArr = userInfor.resListTree || [];
    userMenu.value = [];
    menuArr.forEach((element: any) => {
      if (element.pmsName === '我的') {
        element.children?.forEach((elementChild: any) => {
          if (elementChild.pmsType === 3) {
            userMenu.value.push(elementChild);
          }
        });
      }
    });
  };

  /**
   * 判断是否有未填写的问卷
   */
  const judgeUnWriteQuestionnaire = async () => {
    const res = await QuestionnaireService.getDocUser({ csDocId: '' });
    unWriteQuestionnaire.value = res.some((item: any) => item.status !== '2');
  };

  /**
   * 初始化更新日志状态
   */
  const initUpdateLogStatus = () => {
    phoneUpdateLogStatus.value = cache.get('phoneUpdateLogStatus') || '';
  };

  /**
   * 检查菜单项是否需要显示红点
   */
  const shouldShowBadge = (item: UserMenuItem): boolean => {
    if (item.keyword === 'updateLog') {
      return +phoneUpdateLogStatus.value !== 1;
    }
    if (item.keyword === 'questionServey') {
      return unWriteQuestionnaire.value;
    }
    return false;
  };

  return {
    // 状态
    userMenu: readonly(userMenu),
    phoneUpdateLogStatus: readonly(phoneUpdateLogStatus),
    unWriteQuestionnaire: readonly(unWriteQuestionnaire),

    // 方法
    handleMenuClick,
    initUserMenu,
    judgeUnWriteQuestionnaire,
    initUpdateLogStatus,
    shouldShowBadge,

    // 功能模块
    suggestionFeature,
    clickInFeature,
  };
}

/**
 * 使用用户信息
 */
export function useUserInfo() {
  const user = ref<{
    userId: string;
    userName: string;
    depName: string;
    headerImg: string;
  }>({
    userId: '',
    userName: '',
    depName: '',
    headerImg: '',
  });

  /**
   * 初始化用户信息
   */
  const initUserInfo = (userInfo: any, domainUrl: string) => {
    const { userId, userName, depName, headImgUrl } = userInfo;
    user.value = {
      userId,
      userName,
      depName,
      headerImg: `${domainUrl}${headImgUrl}`,
    };
  };

  return {
    user: readonly(user),
    initUserInfo,
  };
}
