import { ref, computed } from 'vue';
import type { CustomerFollowItem } from '../types';

export const useCustomerFollow = () => {
  const appStore = useAppStore();
  // 状态
  const filterShow = ref(false);
  const filterActive = ref(false);
  const selectType = ref<number | string>(0);
  const rowIndex = ref(-1);
  // 从路由获取参数（从拜访记录进入时传递）
  const userId = ref<number>(0);
  const projectId = ref<number>(0);

  // 字典数据
  const labelTreeList = ref<any[]>([]);
  const customTypeList = ref<any[]>([]);

  // 列表数据
  const list = ref<CustomerFollowItem[]>([]);
  const loading = ref(false);
  const refreshing = ref(false);
  const page = ref(1);
  const pageSize = ref(10);
  const total = ref(0);
  const hasMore = ref(true);
  const pullRefreshHeight = ref(0);

  // 筛选条件
  const filterData = ref({
    startTime: '',
    endTime: '',
    szymCustomerId: '',
    visitUserId: '',
    remarkId: '',
    taskType: '',
    sourceType: '',
    relStatus: '',
  });

  // 加载更多配置
  const loadmoreConfig = computed(() => ({
    status: loading.value ? 'loading' : hasMore.value ? 'loadmore' : 'nomore',
    contentText: {
      contentdown: '上拉加载更多',
      contentrefresh: '正在加载...',
      contentnomore: '没有更多了',
    },
  }));

  /**
   * 获取权限类型
   */
  const initPermission = () => {
    // 从缓存中获取 webCRMPermissions，与 Vue2 项目保持一致
    const permissions = cache.get('webCRMPermissions') || [];
    console.log('initPermission - webCRMPermissions:', permissions);
    const hasPermission = permissions.some(
      (item: string) =>
        item === 'szymVisit-query-all' ||
        item === 'szymVisit-query-entry' ||
        item === 'szymVisit-query-dept'
    );
    console.log('hasPermission:', hasPermission);
    selectType.value = hasPermission ? '' : 0;
    console.log('selectType:', selectType.value);
  };

  /**
   * 获取字典数据
   */
  const initDictData = async () => {
    try {
      // 获取事件分类
      const labelRes = await CommonService.getDictionaries({
        full: true,
        pageNum: 1,
        pageSize: 100000,
        usestatus: 1,
        typeId: 73,
      });
      if (labelRes.list) {
        labelTreeList.value = labelRes.list.map((ele: any) => ({
          value: ele.DIC_SELECT_ID,
          name: ele.DIC_SELECT_NAME,
        }));
      }

      // 获取客户类型
      const typeRes = await CommonService.getDictionaries({
        full: true,
        pageNum: 1,
        pageSize: 100000,
        usestatus: 1,
        typeId: 67,
      });
      if (typeRes.data?.list) {
        customTypeList.value = typeRes.data.list.map((ele: any) => ({
          value: ele.DIC_SELECT_ID,
          name: ele.DIC_SELECT_NAME,
        }));
      }
    } catch (error) {
      console.error('获取字典数据失败', error);
    }
  };

  /**
   * 获取列表数据（从拜访记录进入时调用）
   */
  const fetchListByUserProject = async () => {
    if (loading.value) return;
    loading.value = true;

    try {
      const params = {
        selectType: 3, // 固定为3
        userId: userId.value,
        projectId: projectId.value,
        userIdList: [],
        labelIdList: filterData.value.remarkId ? [filterData.value.remarkId] : [],
        startTime: filterData.value.startTime ? `${filterData.value.startTime} 00:00:00` : '',
        endTime: filterData.value.endTime ? `${filterData.value.endTime} 23:59:59` : '',
        taskType: filterData.value.taskType,
        szymCustomerId: filterData.value.szymCustomerId,
        keyword: filterData.value.visitUserId,
        sourceType: filterData.value.sourceType,
        relStatus: filterData.value.relStatus,
      };

      const res = await SzymUserVisitService.getSzymUserVisiByUserProject(params);

      if (res) {
        list.value = res.data || [];
        // 从拜访记录进入时，不支持分页，直接显示全部数据
        total.value = list.value.length;
        hasMore.value = false;
      } else {
        console.error('API响应异常:', res);
        uni.showToast({ title: res?.msg || '获取列表失败', icon: 'none' });
      }
    } catch (error) {
      console.error('获取列表失败', error);
      uni.showToast({ title: '获取列表失败', icon: 'none' });
    } finally {
      loading.value = false;
      refreshing.value = false;
    }
  };

  /**
   * 获取列表数据（从菜单直接进入时调用）
   */
  const fetchList = async () => {
    if (loading.value) return;
    loading.value = true;

    try {
      const params = {
        selectType: selectType.value,
        userIdList: [],
        labelIdList: filterData.value.remarkId ? [filterData.value.remarkId] : [],
        startTime: filterData.value.startTime ? `${filterData.value.startTime} 00:00:00` : '',
        endTime: filterData.value.endTime ? `${filterData.value.endTime} 23:59:59` : '',
        taskType: filterData.value.taskType,
        szymCustomerId: filterData.value.szymCustomerId,
        keyword: filterData.value.visitUserId,
        sourceType: filterData.value.sourceType,
        relStatus: filterData.value.relStatus,
        pageNum: page.value,
        pageSize: pageSize.value,
        dataBelongEntry: 41,
      };

      const res = await SzymUserVisitService.getSzymUserVisit(params);

      if (res) {
        const newList = res.list || [];

        if (page.value === 1) {
          list.value = newList;
        } else {
          list.value = [...list.value, ...newList];
        }

        total.value = res.total || 0;
        hasMore.value = res.hasNextPage || false;
      } else {
        console.error('API响应异常:', res);
        uni.showToast({ title: res?.msg || '获取列表失败', icon: 'none' });
      }
    } catch (error) {
      console.error('获取列表失败', error);
      uni.showToast({ title: '获取列表失败', icon: 'none' });
    } finally {
      loading.value = false;
      refreshing.value = false;
    }
  };

  /**
   * 下拉刷新
   */
  const onRefresh = () => {
    console.log('onRefresh - userId:', userId.value, 'projectId:', projectId.value);
    page.value = 1;
    hasMore.value = true;
    refreshing.value = true;
    // 根据是否有userId和projectId参数决定调用哪个接口
    if (userId.value && projectId.value) {
      console.log('调用 fetchListByUserProject');
      fetchListByUserProject();
    } else {
      console.log('调用 fetchList');
      fetchList();
    }
  };

  /**
   * 上拉加载更多
   */
  const onLoadMore = () => {
    // 从拜访记录进入时不支持加载更多
    if (userId.value && projectId.value) return;

    if (!hasMore.value || loading.value) return;
    page.value++;
    fetchList();
  };

  /**
   * 筛选确认
   */
  const onFilterConfirm = (data: any) => {
    console.log('onFilterConfirm - data:', data);
    filterData.value = data;

    // 判断是否有筛选条件
    const hasFilter =
      data.startTime ||
      data.endTime ||
      data.taskType ||
      data.szymCustomerId ||
      data.visitUserId ||
      data.remarkId ||
      data.sourceType ||
      data.relStatus;

    filterActive.value = !!hasFilter;
    filterShow.value = false;
    onRefresh();
  };

  /**
   * 跳转详情
   */
  const toDetail = (item: CustomerFollowItem, index: number) => {
    rowIndex.value = index;
    appStore.setDetailObj(item);
    appStore.setHadDoneOnDetail(false);
    // 传递userId参数到详情页，用于控制是否显示编辑按钮
    const query: any = {};
    if (userId.value && projectId.value) {
      query.userId = userId.value;
      query.projectId = projectId.value;
    }
    router.push('/subpackages/medical-trade/customer-follow/detail', query);
  };

  /**
   * 跳转新增页面
   */
  const toAdd = () => {
    router.push('/subpackages/medical-trade/customer-follow/add');
  };

  /**
   * 计算下拉刷新高度
   */
  const calcPullRefreshHeight = () => {
    setTimeout(() => {
      const query = uni.createSelectorQuery();
      query.select('.filter-wrapper').boundingClientRect();
      query.exec(res => {
        console.log('calcPullRefreshHeight - res:', res);
        if (res && res[0]) {
          const filterHeight = res[0].height || 0;
          console.log('filterHeight:', filterHeight);
          // 获取系统信息
          const systemInfo = uni.getSystemInfoSync();
          const windowHeight = systemInfo.windowHeight;
          console.log('windowHeight:', windowHeight);
          // 计算可用高度 = 窗口高度 - 筛选框高度
          pullRefreshHeight.value = windowHeight - filterHeight;
          console.log('pullRefreshHeight:', pullRefreshHeight.value);
        } else {
          // 如果获取失败，使用默认值
          const systemInfo = uni.getSystemInfoSync();
          pullRefreshHeight.value = systemInfo.windowHeight - 100; // 100 为估计的筛选框高度
          console.log('pullRefreshHeight (fallback):', pullRefreshHeight.value);
        }
      });
    }, 300); // 延迟 300ms 等待 DOM 渲染
  };

  /**
   * 初始化路由参数
   */
  const initRouteParams = (params: any) => {
    console.log('initRouteParams - 接收到的params:', params);
    userId.value = Number(params?.userId) || 0;
    projectId.value = Number(params?.projectId) || 0;
    console.log('initRouteParams - 设置后 userId:', userId.value, 'projectId:', projectId.value);
  };

  return {
    filterShow,
    filterActive,
    selectType,
    rowIndex,
    userId,
    projectId,
    labelTreeList,
    customTypeList,
    list,
    loading,
    refreshing,
    loadmoreConfig,
    pullRefreshHeight,
    filterData,
    hasMore,
    initPermission,
    initDictData,
    initRouteParams,
    fetchList,
    fetchListByUserProject,
    onRefresh,
    onLoadMore,
    onFilterConfirm,
    toDetail,
    toAdd,
    calcPullRefreshHeight,
  };
};
