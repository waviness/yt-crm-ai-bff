import { usePagination } from '@/composables/use-pagination';
import { useAppStore } from '@/store/app';

/**
 * 客户订单审核页面组合式API
 * 提供客户订单审核页面的所有业务逻辑和数据管理
 */
export function useCustomerOrderApprove() {
  const appStore = useAppStore();

  // Tab 列表配置
  const tabList = [{ name: '未审核' }, { name: '已审核' }];

  // 当前激活的 Tab 索引
  const active = ref(0);

  // 筛选表单数据
  const formData = ref({
    startDate: '',
    endDate: '',
    customIdOrName: '',
    goodsIdOrName: '',
  });

  /**
   * 获取客户订单审核列表数据
   * @param {Object} pagination - 分页参数
   * @param {number} pagination.pageNum - 当前页码
   * @param {number} pagination.pageSize - 每页数量
   * @returns {Promise<Object>} 包含列表数据和是否有下一页的对象
   */
  const fetchOrderList = async (pagination: { pageNum: number; pageSize: number }) => {
    const { startDate, endDate, customIdOrName, goodsIdOrName } = formData.value;

    const params = {
      starttime: startDate ? `${startDate} 00:00:00` : '',
      endtime: endDate ? `${endDate} 23:59:59` : '',
      customIdOrName,
      goodsIdOrName,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      usestatus: active.value,
      orderType: 31,
    };

    try {
      // 动态导入 API，避免循环依赖
      const { getOrderDocSaler } = await import('@/api/customer-order-approve');
      const res = await getOrderDocSaler(params);

      if (res.success) {
        return {
          list: res.data.list || [],
          hasNextPage: res.data.hasNextPage || false,
          total: res.data.total || 0,
        };
      } else {
        return {
          list: [],
          hasNextPage: false,
          total: 0,
        };
      }
    } catch (error) {
      console.error('获取订单列表失败:', error);
      uni.showToast({
        title: '请求失败，请稍后重试',
        icon: 'none',
      });
      return {
        list: [],
        hasNextPage: false,
        total: 0,
      };
    }
  };

  /**
   * 使用分页组合式API
   */
  const pagination = usePagination(
    {
      pageSize: 10,
      initialPage: 1,
      toolBarHeight: 110,
    },
    fetchOrderList
  );

  const {
    list,
    refreshing,
    loadmoreConfig,
    pullRefreshHeight,
    onRefresh,
    onLoadMore,
    calcPullRefreshHeight,
  } = pagination;

  /**
   * 筛选条件变化
   * @param {Object} filterVal - 筛选条件
   */
  const onFilterChange = (filterVal: any) => {
    formData.value = { ...filterVal };
    onRefresh();
  };

  /**
   * Tab 切换事件
   * @param {number} index - 切换到的 Tab 索引
   */
  const handleTabChange = (index: number) => {
    if (active.value !== index) {
      active.value = index;
      onRefresh();
    }
  };

  /**
   * 跳转详情页
   * @param {Object} data - 订单数据
   */
  const toDetail = (data: any) => {
    appStore.setHadDoneOnDetail(false);
    const {
      status,
      invoiceid,
      entryid,
      entryname,
      customeid,
      customename,
      contactid,
      contactname,
      totolprice,
    } = data;

    uni.navigateTo({
      url: `/subpackages/order/customer-order-approve/detail?status=${status}&invoiceid=${invoiceid}&entryid=${entryid}&entryname=${entryname}&customeid=${customeid}&customename=${customename}&contactid=${contactid}&contactname=${contactname}&totolprice=${totolprice}`,
    });
  };

  /**
   * 初始化方法
   * 设置默认时间范围为最近30天
   */
  const init = () => {
    // 设置默认时间范围为最近30天
    const endDate = time.format(new Date(), time.FORMATS.ISO_DATE);
    const startDate = time.format(time.add(new Date(endDate), -30, 'day'), time.FORMATS.ISO_DATE);

    formData.value = {
      startDate,
      endDate,
      customIdOrName: '',
      goodsIdOrName: '',
    };
  };

  return {
    formData,
    tabList,
    active,
    list,
    refreshing,
    loadmoreConfig,
    pullRefreshHeight,
    onFilterChange,
    handleTabChange,
    onRefresh,
    onLoadMore,
    toDetail,
    init,
    calcPullRefreshHeight,
  };
}
