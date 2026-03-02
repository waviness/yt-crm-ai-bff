import dayjs from 'dayjs';
import type { VisitStatistics, VisitRecordItem } from '../types';

/**
 * 拜访记录业务逻辑
 */
export function useVisitRecord() {
  // 日期范围
  const dateRange = ref<Date[]>([dayjs().subtract(29, 'day').toDate(), new Date()]);

  // 统计数据
  const statistics = ref<VisitStatistics>({
    visitCstmNum: 0,
    assistVisitCstmNum: 0,
    receiveCstmNum: 0,
  });

  // 获取统计数据
  const getStatistics = async () => {
    try {
      const response = await SzymUserVisitService.getSzymUserVisitStat({
        userIdList: [],
        startTime: dayjs(dateRange.value[0]).format('YYYY-MM-DD') + ' 00:00:00',
        endTime: dayjs(dateRange.value[1]).format('YYYY-MM-DD') + ' 23:59:59',
      });
      statistics.value = {
        visitCstmNum: response.visitCstmNum || 0,
        assistVisitCstmNum: response.assistVisitCstmNum || 0,
        receiveCstmNum: response.receiveCstmNum || 0,
      };
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  // 获取列表数据
  const fetchData = async (params: { pageNum: number; pageSize: number }) => {
    try {
      const response = await SzymUserVisitService.getSzymUserProjectVisit({
        userIdList: [],
        startTime: dayjs(dateRange.value[0]).format('YYYY-MM-DD') + ' 00:00:00',
        endTime: dayjs(dateRange.value[1]).format('YYYY-MM-DD') + ' 23:59:59',
        pageNum: params.pageNum,
        pageSize: params.pageSize,
      });
      return {
        list: response.list || [],
        hasNextPage: response.hasNextPage || false,
        total: response.total || 0,
      };
    } catch (error) {
      console.error('获取拜访记录失败:', error);
      return {
        list: [],
        hasNextPage: false,
        total: 0,
      };
    }
  };

  // 使用分页
  const {
    list,
    refreshing,
    loadmoreConfig,
    pullRefreshHeight,
    onRefresh,
    onLoadMore,
    calcPullRefreshHeight,
  } = usePagination<VisitRecordItem>(
    {
      pageSize: 8,
      initialPage: 1,
      toolBarHeight: 50,
    },
    fetchData
  );

  // 点击列表项
  const handleItemClick = (item: VisitRecordItem) => {
    router.push('/subpackages/medical-trade/customer-follow/index', {
      userId: item.userId,
      projectId: item.projectId,
    });
  };

  // 初始化数据
  const initData = async () => {
    await getStatistics();
    await onRefresh();
  };

  return {
    dateRange,
    statistics,
    list,
    refreshing,
    loadmoreConfig,
    pullRefreshHeight,
    onRefresh,
    onLoadMore,
    calcPullRefreshHeight,
    handleItemClick,
    initData,
    getStatistics,
  };
}
