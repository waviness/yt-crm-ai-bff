import { ref, computed, type Ref } from 'vue';
import { useFormatter } from '@/composables/use-number-formatter';
import { DashboardService } from '@/api/dashboard';

const { formatRaw } = useFormatter();

export const useOverdueDetailInfo = (active: Ref<string>, detailInfo: Ref<any>) => {
  const detail = ref<any>({});
  const detailList = ref<any[]>([]);
  const loading = ref(false);
  const formatMoneyInt = (value: number | string | null | undefined) =>
    formatRaw(value, { digits: 0 });

  // 类型名称
  const typeName = computed(() => {
    if (+active.value === 2) return '到本月底即将逾期';
    if (+active.value === 1) return '已逾期';
    return '';
  });

  // 类型样式类
  const typeClass = computed(() => {
    if (+active.value === 2) return 'bg-warning';
    if (+active.value === 1) return 'bg-danger';
    return '';
  });

  // 信保状态文本
  const creditStatusText = computed(() => {
    const creditStatusArr = ['A', 'B', 'C', 'D', 'E'];
    return detail.value.creditStatus !== undefined && detail.value.creditStatus !== null
      ? creditStatusArr[detail.value.creditStatus]
      : '-';
  });

  // 最新逾期原因
  const latestOverdueRemark = computed(() => {
    return detail.value.overdueRemark && detail.value.overdueRemark.length
      ? detail.value.overdueRemark[0]
      : { reason: '-', creDate: '-', reasonType: '-' };
  });

  // 获取逾期详情 (active=1)
  const getOverdueDetail = async () => {
    loading.value = true;
    try {
      const codId = detailInfo.value.codId ?? detailInfo.value.customId;
      const res = await DashboardService.queryBigDataOverdueDataDetail({
        codId,
      });

      if (res.success) {
        detail.value = {
          ...res.data.overdueDataVO,
          advanceAmount: formatMoneyInt(res.data.overdueDataVO.advanceAmount),
          receivable: formatMoneyInt(res.data.overdueDataVO.receivable),
          creditAmount: formatMoneyInt(res.data.overdueDataVO.creditAmount),
          overdueAmount: formatMoneyInt(res.data.overdueDataVO.overdueAmount),
        };

        detailList.value = res.data.overdueDataDetailDOList.map((val: any) => ({
          ...val,
          overdueAmount: formatMoneyInt(val.overdueAmount),
        }));

        console.log('逾期详情列表:', detailList.value); // 调试日志
      }
    } catch (error) {
      console.error('获取逾期详情失败:', error);
      uni.showToast({
        title: '数据加载失败',
        icon: 'none',
      });
    } finally {
      loading.value = false;
    }
  };

  // 获取应收详情 (active=2)
  const getReceivableDetail = async () => {
    loading.value = true;
    try {
      // 修复：使用正确的字段名 cowId
      const res = await DashboardService.queryBigDataOverdueWarnDetail({
        cowId: detailInfo.value.cowId,
      });

      if (res.success) {
        detail.value = {
          ...res.data.crmOverdueWarnVO,
          creditAmount: formatMoneyInt(res.data.crmOverdueWarnVO.creditAmount),
          advanceAmount: formatMoneyInt(res.data.crmOverdueWarnVO.advanceAmount),
          receivable: formatMoneyInt(res.data.crmOverdueWarnVO.receivable),
          overdueAmount: formatMoneyInt(res.data.crmOverdueWarnVO.overdueAmount),
        };

        detailList.value = res.data.overdueWarnDetailDOList.map((val: any) => ({
          ...val,
          billAmount: formatMoneyInt(val.billAmount),
        }));

        console.log('应收详情列表:', detailList.value); // 调试日志
      }
    } catch (error) {
      console.error('获取应收详情失败:', error);
      uni.showToast({
        title: '数据加载失败',
        icon: 'none',
      });
    } finally {
      loading.value = false;
    }
  };

  // 获取长账龄列表 (active=3)
  const fetchLongAccountsList = async (params: any) => {
    loading.value = true;
    try {
      let page: number;
      let pageSize: number;

      if (typeof params === 'object' && params !== null) {
        page = params.page || params.pageNum || 1;
        pageSize = params.pageSize || 20;
      } else {
        page = 1;
        pageSize = 20;
      }

      const res = await DashboardService.queryLongAccountsDataDetail({
        pageNum: page,
        pageSize: pageSize,
        customId: detailInfo.value.customId,
        deptId: detailInfo.value.deptId,
        entryId: detailInfo.value.entryId,
      });

      if (res.success) {
        const list = res.data.list.map((val: any) => ({
          ...val,
          receivable: formatMoneyInt(val.receivable),
          receivable12year: formatMoneyInt(val.receivable12year),
          receivable23year: formatMoneyInt(val.receivable23year),
          receivable34year: formatMoneyInt(val.receivable34year),
          receivable45year: formatMoneyInt(val.receivable45year),
          receivable5year: formatMoneyInt(val.receivable5year),
        }));

        // 如果是第一页，更新顶部信息
        if (page === 1 && res.data.parent) {
          detailInfo.value = {
            ...detailInfo.value,
            receivable: formatMoneyInt(res.data.parent.receivable || 0),
            receivable12year: formatMoneyInt(res.data.parent.receivable12year || 0),
            receivable23year: formatMoneyInt(res.data.parent.receivable23year || 0),
            receivable34year: formatMoneyInt(res.data.parent.receivable34year || 0),
            receivable45year: formatMoneyInt(res.data.parent.receivable45year || 0),
            receivable5year: formatMoneyInt(res.data.parent.receivable5year || 0),
          };
        }

        return {
          list: list,
          total: res.data.total || 0,
          hasNextPage: res.data.hasNextPage || false,
        };
      }

      return {
        list: [],
        total: 0,
        hasNextPage: false,
      };
    } catch (error) {
      console.error('获取长账龄列表失败:', error);
      uni.showToast({
        title: '数据加载失败',
        icon: 'none',
      });
      return {
        list: [],
        total: 0,
        hasNextPage: false,
      };
    } finally {
      loading.value = false;
    }
  };

  return {
    detail,
    detailList,
    loading,
    typeName,
    typeClass,
    creditStatusText,
    latestOverdueRemark,
    getOverdueDetail,
    getReceivableDetail,
    fetchLongAccountsList,
  };
};
