import { ref, computed, watch, type Ref } from 'vue';
import type { EntryObj, FilterVal, TotalVal, OverdueItem } from '../types/overdue-page';
import { useFormatter } from '@/composables/use-number-formatter';
import { DashboardService } from '@/api/dashboard';

const { formatPercentage, formatCurrency, formatRaw } = useFormatter();

export const useOverduePage = (entryObj: Ref<EntryObj>) => {
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

  const filterVal = ref<FilterVal>({
    keyword: '',
    orderColumn: '',
    orderRule: '',
  });

  // 更新筛选条件
  const updateFilterVal = (val: FilterVal) => {
    filterVal.value = { ...filterVal.value, ...val };
  };

  // 处理tab切换
  const onhandleActiveChange = (index: number) => {
    activeTab.value = index;
    entryObj.value.tabType = index;
  };

  // 获取统计数据
  const fetchGetOverdueStat = async () => {
    loading.value = true;
    try {
      const { active, tabType, deptId } = entryObj.value;

      if (+active === 1 && +tabType === 0) {
        // 逾期账款统计
        const params = {
          deptId: deptId,
          selectDate: new Date().toISOString().split('T')[0], // 使用标准的ISO日期格式
        };
        // 直接传递params对象，不包装
        const res = await DashboardService.queryBigDataOverdueAmountDetail(params);
        totaLVal.value = {
          overdueAmount: formatRaw(res.data.parent.overdueAmount, { digits: 2 }),
        };
      } else if (+active === 1 && +tabType === 1) {
        // 长账龄统计
        const res = await DashboardService.queryBigDataReceivableDetail({
          deptId: deptId,
          type: 2,
        });
        totaLVal.value = {
          amount: formatRaw(res.data.parent.amount, { digits: 2 }),
        };
      } else if (+active === 2) {
        // 应收账款统计
        const res = await DashboardService.queryBigDataReceivableDetail({
          deptId: deptId,
          type: 1,
        });
        totaLVal.value = {
          amount: formatRaw(res.data.parent.amount, { digits: 2 }),
          thisAmount: formatRaw(res.data.parent.thisAmount, { digits: 2 }),
        };
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      loading.value = false;
    }
  };

  // 获取列表数据
  const fetchGetdataList = async (page: number, pageSize: number) => {
    // 验证并转换page和pageSize参数
    const numPage = typeof page === 'number' ? page : Number(page);
    const numPageSize = typeof pageSize === 'number' ? pageSize : Number(pageSize);

    // 确保转换后的值有效且大于0
    const validPage = !isNaN(numPage) && numPage > 0 ? numPage : 1;
    const validPageSize = !isNaN(numPageSize) && numPageSize > 0 ? numPageSize : 10;

    if (validPage !== page || validPageSize !== pageSize) {
      console.debug('分页参数已调整:', {
        original: { page, pageSize },
        adjusted: { page: validPage, pageSize: validPageSize },
      });
    }

    loading.value = true;
    try {
      const { active, tabType, deptId } = entryObj.value;
      const { keyword, orderColumn, orderRule } = filterVal.value;

      let res: any;
      let dataList: OverdueItem[] = [];

      if (+active === 1 && +tabType === 0) {
        // 逾期账款列表
        const listParams = {
          deptId: deptId,
          selectDate: new Date().toISOString().split('T')[0],
          keyword,
          orderColumn,
          orderRule,
          page: validPage,
          pageSize: validPageSize,
        };
        res = await DashboardService.queryBigDataOverdueAmountDetail(listParams);

        const total = Number(res.data.parent.overdueAmount);
        dataList = res.data.children.map((val: any) => ({
          deptId: val.deptId,
          deptName: val.deptName,
          overdueAmount: formatCurrency(val.overdueAmount),
          _rawValue: val.overdueAmount,
          percent: total > 0 ? (val.overdueAmount / total) * 100 : 0,
        }));
      } else if (+active === 1 && +tabType === 1) {
        // 长账龄列表
        const listParams = {
          deptId: deptId,
          type: 2,
          keyword,
          orderColumn,
          orderRule,
          page: validPage,
          pageSize: validPageSize,
        };
        res = await DashboardService.queryBigDataReceivableDetail(listParams);

        const total = Number(res.data.parent.amount);
        dataList = res.data.children.map((val: any) => ({
          deptId: val.deptId,
          deptName: val.deptName,
          amount: formatCurrency(val.amount),
          _rawValue2: val.amount,
          percent: total > 0 ? (val.amount / total) * 100 : 0,
        }));
      } else if (+active === 2) {
        // 应收账款列表
        const listParams = {
          deptId: deptId,
          type: 1,
          selectDate: new Date().toISOString().split('T')[0],
          keyword,
          orderColumn,
          orderRule,
          page: validPage,
          pageSize: validPageSize,
        };
        res = await DashboardService.queryBigDataReceivableDetail(listParams);

        dataList = res.data.children.map((val: any) => ({
          deptId: val.deptId,
          deptName: val.deptName,
          amount: formatCurrency(val.amount),
          thisAmount: formatCurrency(val.thisAmount),
          percent: val.amount > 0 ? (val.thisAmount / val.amount) * 100 : 0,
        }));
      }

      return {
        list: dataList,
        total: dataList.length,
        hasMore: dataList.length >= validPageSize,
      };
    } catch (error) {
      console.error('获取列表数据失败:', error);
      return {
        list: [],
        total: 0,
        hasMore: false,
      };
    } finally {
      loading.value = false;
    }
  };

  // 跳转详情页
  const toDetail = (item: OverdueItem) => {
    uni.navigateTo({
      url: `/subpackages/dashboard/sales-line-overdue?id=${item.deptId}&name=${item.deptName}&date=${entryObj.value.date}&active=${entryObj.value.active}&tabType=${entryObj.value.tabType}&level=${entryObj.value.level}`,
    });
  };

  return {
    tabsList,
    activeTab,
    loading,
    totaLVal,
    filterVal,
    updateFilterVal,
    fetchGetOverdueStat,
    fetchGetdataList,
    onhandleActiveChange,
    toDetail,
  };
};
