import { ref, computed, watch, type Ref } from 'vue';
import type { EntryObj, TotalVal, OverdueDetailItem } from '../types/overdue-page';
import { useFormatter } from '@/composables/use-number-formatter';
import { DashboardService } from '@/api/dashboard';

const { formatCurrency, formatRaw } = useFormatter();

export const useOverdueDetailPage = (entryObj: Ref<EntryObj>) => {
  // tab列表
  const tabsList = ref([{ name: '逾期账款' }, { name: '长账龄' }]);

  const activeTab = ref(0);
  const loading = ref(false);
  const totaLVal = ref<TotalVal>({});

  // 监听entryObj.tabType的变化，同步更新activeTab
  watch(
    () => entryObj.value.tabType,
    val => {
      if (val !== undefined && val !== null && val !== '') {
        activeTab.value = Number(val);
      }
    },
    { immediate: true }
  );

  // 筛选参数
  const keyword = ref('');
  const filterParams = ref({
    entry: '',
    custom: '',
    isInner: 1,
    isNegative: 1,
  });
  const sortParams = ref({
    order: 2, // 1升序 2降序
  });

  // 排序选项
  const sortActions = computed(() => {
    const { active, tabType } = entryObj.value;

    if (+active === 1 && +tabType === 0) {
      return [
        { text: '逾期金额升序', value: { order: 1 } },
        { text: '逾期金额降序', value: { order: 2 } },
      ];
    } else if (+active === 1 && +tabType === 1) {
      return [
        { text: '总金额升序', value: { order: 1 } },
        { text: '总金额降序', value: { order: 2 } },
      ];
    } else if (+active === 2) {
      return [
        { text: '应收金额升序', value: { order: 1 } },
        { text: '应收金额降序', value: { order: 2 } },
      ];
    }

    return [];
  });

  // 更新关键词
  const updateKeyword = (val: string) => {
    keyword.value = val;
  };

  // 更新筛选参数
  const updateFilterParams = (params: any) => {
    filterParams.value = { ...filterParams.value, ...params };
  };

  // 更新排序参数
  const updateSortParams = (params: any) => {
    sortParams.value = { ...sortParams.value, ...params };
  };

  // 处理tab切换
  const onhandleActiveChange = (index: number) => {
    activeTab.value = index;
    entryObj.value.tabType = String(index);
  };

  // 获取统计数据
  const fetchGetOverdueStat = async () => {
    loading.value = true;
    try {
      const { active, tabType, deptId } = entryObj.value;

      if (+active === 1 && +tabType === 0) {
        // 逾期账款统计
        const res = await DashboardService.queryBigDataOverdueAmountDetail({
          deptId: deptId,
          selectDate: new Date().toISOString().split('T')[0],
        });
        totaLVal.value = {
          overdueAmount: formatRaw(res.data.parent.overdueAmount, { digits: 0 }),
        };
      } else if (+active === 1 && +tabType === 1) {
        // 长账龄统计
        const res = await DashboardService.queryBigDataReceivableDetail({
          deptId: deptId,
          type: 2,
        });
        totaLVal.value = {
          amount: formatRaw(res.data.parent.amount, { digits: 0 }),
        };
      } else if (+active === 2) {
        // 应收账款统计
        const res = await DashboardService.queryBigDataReceivableDetail({
          deptId: deptId,
          type: 1,
        });
        totaLVal.value = {
          amount: formatRaw(res.data.parent.amount, { digits: 0 }),
          thisAmount: formatRaw(res.data.parent.thisAmount, { digits: 0 }),
        };
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
      uni.showToast({
        title: '数据加载失败',
        icon: 'none',
      });
    } finally {
      loading.value = false;
    }
  };

  // 获取列表数据
  const fetchGetdataList = async (params: any) => {
    let page = params.page || params.pageNum || 1;
    let pageSize = params.pageSize || 20;

    loading.value = true;
    try {
      const { active, tabType, deptId } = entryObj.value;

      // 构建请求参数
      const baseParams = {
        selectDate: new Date().toISOString().split('T')[0],
        pageNum: page,
        pageSize: pageSize,
        deptId: deptId,
        flag: 0,
        ...sortParams.value,
      };

      let res: any;
      let dataList: OverdueDetailItem[] = [];

      if (+active === 2) {
        // 应收账款列表 - queryBigDataOverdueWarnList
        const params = {
          ...baseParams,
          custom: keyword.value,
          isInner: 1,
          isNegative: 0,
        };
        res = await DashboardService.queryBigDataOverdueWarnList(params);

        dataList = res.data.list.map((val: any) => ({
          saleId: val.saleId,
          saleName: val.saleName,
          customId: val.customId,
          customName: val.customName,
          entryId: val.entryId,
          entryName: val.entryName,
          cowId: val.cowId, // 添加cowId字段
          receivable: formatRaw(val.receivable, { digits: 0 }),
          overdueAmount: formatRaw(val.overdueAmount, { digits: 0 }),
          thisReceivable: val.thisReceivable ? formatRaw(val.thisReceivable, { digits: 0 }) : '--',
          advanceAmount: formatRaw(val.advanceAmount, { digits: 0 }),
        }));
      } else if (+active === 1 && +tabType === 0) {
        // 逾期账款列表 - queryBigDataOverdueDataList
        const params = {
          ...baseParams,
          custom: keyword.value,
          isInner: 1,
          isNegative: 0,
        };
        res = await DashboardService.queryBigDataOverdueDataList(params);

        dataList = res.data.list.map((val: any) => ({
          codId: val.codId,
          saleId: val.saleId,
          saleName: val.saleName,
          customId: val.customId,
          customName: val.customName,
          entryId: val.entryId,
          entryName: val.entryName,
          overdueAmount: formatRaw(val.overdueAmount, { digits: 0 }),
          advanceAmount: formatRaw(val.advanceAmount, { digits: 0 }),
          maxDay: val.maxDay,
        }));
      } else if (+active === 1 && +tabType === 1) {
        // 长账龄列表 - queryLongAccountsDataList
        const params = {
          ...baseParams,
          ...filterParams.value,
        };
        res = await DashboardService.queryLongAccountsDataList(params);

        dataList = res.data.list.map((val: any) => ({
          customId: val.customId,
          customName: val.customName,
          entryId: val.entryId,
          entryName: val.entryName,
          deptName: val.deptName,
          deptId: val.deptId,
          receivable: formatRaw(val.receivable, { digits: 0 }),
          receivable12year: formatRaw(val.receivable12year, { digits: 0 }),
          receivable23year: formatRaw(val.receivable23year, { digits: 0 }),
          receivable34year: formatRaw(val.receivable34year, { digits: 0 }),
          receivable45year: formatRaw(val.receivable45year, { digits: 0 }),
          receivable5year: formatRaw(val.receivable5year, { digits: 0 }),
        }));
      }

      return {
        list: dataList,
        total: res.data.total || dataList.length,
        hasNextPage: res.data.hasNextPage || false,
      };
    } catch (error) {
      console.error('获取列表数据失败:', error);
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

  // 跳转详情页
  const toDetail = (item: OverdueDetailItem) => {
    // 存储到store或使用其他方式传递详情数据
    uni.setStorageSync('overdueDetailInfo', item);

    uni.navigateTo({
      url: `/subpackages/dashboard/sales-line-overdue-detail?active=${entryObj.value.tabType === '0' ? entryObj.value.active : '3'}`,
    });
  };

  return {
    tabsList,
    activeTab,
    loading,
    totaLVal,
    sortActions,
    fetchGetOverdueStat,
    fetchGetdataList,
    onhandleActiveChange,
    toDetail,
    updateKeyword,
    updateFilterParams,
    updateSortParams,
  };
};
