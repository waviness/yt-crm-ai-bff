/**
 * 通用分页逻辑 Composable
 * 提供统一的分页功能，支持下拉刷新、上拉加载更多
 * 适用于列表页面的分页需求
 */

import type { PaginationResult } from '@/types/common';

/**
 * 分页配置接口
 * 定义分页组件的配置选项
 */
export interface PaginationConfig {
  /** 每页显示条数 */
  pageSize?: number;
  /** 初始页码 */
  initialPage?: number;
  /** 加载更多配置 */
  loadmoreConfig?: {
    status: 'loadmore' | 'loading' | 'nomore';
    loadmoreText: string;
    loadingText: string;
    nomoreText: string;
    iconSize: number;
  };
  toolBarHeight?: number;
}

/**
 * 使用分页功能
 * @param config 分页配置
 * @param fetchFunction 数据获取函数
 * @returns 分页相关的状态和方法
 */
export function usePagination<T = any>(
  config: PaginationConfig = {},
  fetchFunction: (params: { pageNum: number; pageSize: number }) => Promise<PaginationResult<T>>
) {
  const {
    pageSize = 10,
    initialPage = 1,
    loadmoreConfig: customLoadmoreConfig,
    toolBarHeight = 62,
  } = config;

  // 状态管理
  const list = ref<T[]>([]);
  const pageNum = ref(initialPage);
  const totalNum = ref(0);
  const refreshing = ref(false);
  const hasNextPage = ref(true);

  // 加载更多配置
  const loadmoreConfig = ref({
    status: 'loadmore' as 'loadmore' | 'loading' | 'nomore',
    loadmoreText: '上拉加载更多',
    loadingText: '努力加载中...',
    nomoreText: '我们是有底线的',
    marginTop: 20,
    iconSize: 18,
    ...customLoadmoreConfig,
  });

  const pullRefreshHeight = ref('');

  /**
   * 获取数据列表
   */
  const fetchData = async () => {
    const result = await fetchFunction({
      pageNum: pageNum.value,
      pageSize,
    });

    if (pageNum.value === 1) {
      list.value = result.list as T[];
    } else {
      list.value = [...(list.value as T[]), ...(result.list as T[])];
    }

    // 更新状态
    loadmoreConfig.value.status = result.hasNextPage ? 'loadmore' : 'nomore';
    hasNextPage.value = result.hasNextPage;
    if (result.total !== undefined) {
      totalNum.value = result.total;
    }
  };

  /**
   * 刷新数据
   */
  const onRefresh = async () => {
    try {
      list.value = [];
      refreshing.value = true; // 开启刷新状态（显示刷新动画）
      pageNum.value = initialPage;
      hasNextPage.value = true; // 重置"有更多数据"状态
      await fetchData();
    } catch (err) {
      console.error('下拉刷新失败：', err);
    } finally {
      refreshing.value = false; // 关闭刷新状态（隐藏动画）
    }
  };

  /**
   * 加载更多数据
   */
  const onLoadMore = async () => {
    console.log('onLoadMore', refreshing.value, loadmoreConfig.value.status, hasNextPage.value);
    if (refreshing.value || loadmoreConfig.value.status === 'loading' || !hasNextPage.value) {
      return;
    }

    try {
      loadmoreConfig.value.status = 'loading'; // 切换为"加载中"状态
      pageNum.value++;
      await fetchData();
    } catch (err) {
      console.error('上拉加载失败：', err);
      pageNum.value -= 1; // 加载失败：页码回退
      loadmoreConfig.value.status = 'loadmore'; // 恢复"可加载"状态
      throw err;
    }
  };

  /**
   * 重置分页状态
   */
  const reset = () => {
    list.value = [];
    pageNum.value = initialPage;
    totalNum.value = 0;
    refreshing.value = false;
    loadmoreConfig.value.status = 'loadmore';
  };

  const calcPullRefreshHeight = () => {
    // 使用新的 API 替代废弃的 getSystemInfoSync
    const windowInfo = uni.getWindowInfo();
    pullRefreshHeight.value = `${windowInfo.windowHeight - toolBarHeight}px`;
  };

  /**
   * 从列表中移除指定索引的元素
   * @param index - 要移除的元素的索引位置
   */
  const removeRow = (index: number) => {
    if (index >= 0 && index < list.value.length) {
      list.value.splice(index, 1);
    }
  };

  const changeRowValue = <K extends keyof T>(index: number, changeKey: K, newValue: T[K]) => {
    if (index >= 0 && index < list.value.length) {
      const item = list.value[index] as T;
      item[changeKey] = newValue;
    }
  };
  return {
    // 状态
    list: readonly(list),
    pageNum: readonly(pageNum),
    totalNum: readonly(totalNum),
    refreshing: readonly(refreshing),
    loadmoreConfig: readonly(loadmoreConfig),
    pullRefreshHeight,

    // 方法
    fetchData,
    onRefresh,
    onLoadMore,
    reset,
    calcPullRefreshHeight,
    removeRow,
    changeRowValue,
  };
}

/**
 * 简化的分页功能（不包含下拉刷新）
 *
 * 适用于只需要上拉加载更多的场景，不需要下拉刷新
 *
 * 与 usePagination 的区别：
 * - ✅ 更轻量，不包含下拉刷新相关状态和方法
 * - ✅ API 更简单，专注于基础分页
 * - ✅ 不依赖 pull-refresh 组件
 * - ✅ 自动管理 loading 状态
 * - ✅ 用户手动控制加载时机（不自动 onMounted）
 *
 * @param pageSize 每页显示条数，默认 10
 * @returns 简化的分页相关状态和方法
 *
 * @example
 * ```ts
 * const { list, totalNum, paginationLoading, resetAndFetchData, loadMore } = useSimplePagination(10);
 *
 * const fetchData = async ({ pageNum, pageSize }) => {
 *   const res = await ProjectService.getList({ pageNum, pageSize, ...filters });
 *   return { list: res.list, total: res.total };
 * };
 *
 * // 页面加载时获取数据
 * onLoad(async () => {
 *   await resetAndFetchData(fetchData);
 * });
 *
 * // 上拉加载更多
 * onReachBottom(() => {
 *   loadMore(fetchData);
 * });
 *
 * // 筛选条件变化时重新加载
 * const handleFilterChange = () => {
 *   resetAndFetchData(fetchData);
 * };
 * ```
 */
// 类型定义
type SimpleFetchFunction<T> = (params: {
  pageNum: number;
  pageSize: number;
}) => Promise<{ list: T[]; total: number }>;

export function useSimplePagination<T = any>(pageSize: number = 10) {
  const list = ref<T[]>([]);
  const pageNum = ref(1);
  const totalNum = ref(0);
  const paginationLoading = ref(false);

  /**
   * 获取数据
   */
  const fetchData = async (fetchFunction: SimpleFetchFunction<T>) => {
    paginationLoading.value = true;
    const res = await fetchFunction({
      pageNum: pageNum.value,
      pageSize,
    });

    if (pageNum.value === 1) {
      list.value = (res.list || []) as T[];
    } else {
      list.value = [...list.value, ...(res.list || [])] as T[];
    }
    totalNum.value = res.total || 0;
    paginationLoading.value = false;
  };

  /**
   * 重置并获取数据
   */
  const resetAndFetchData = async (fetchFunction: SimpleFetchFunction<T>) => {
    pageNum.value = 1;
    list.value = [];
    await fetchData(fetchFunction);
  };

  /**
   * 加载更多数据
   */
  const loadMore = async (fetchFunction: SimpleFetchFunction<T>) => {
    if (paginationLoading.value || list.value.length >= totalNum.value) {
      return;
    }
    pageNum.value++;
    await fetchData(fetchFunction);
  };

  return {
    list,
    pageNum,
    totalNum,
    paginationLoading,
    fetchData,
    resetAndFetchData,
    loadMore,
  };
}
