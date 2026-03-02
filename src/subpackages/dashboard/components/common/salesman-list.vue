<template>
  <view class="white-block pb-3 mb-4">
    <view v-if="loading" class="flex py-8 justify-center align-center">
      <up-loading-icon
        class="py-6"
        v-if="loading && !salesmanList.length"
        text="加载中"
        mode="circle"
        textSize="18"
        color="rgb(53 97 242)"
      ></up-loading-icon>
    </view>
    <detailList
      v-for="(data, index) in salesmanList"
      :key="index"
      :isClick="isClick"
      :data="data"
      :name="data.name"
      :per="data.progress"
      :showDrxs="true"
      :perShow="true"
      :salesTabValue="props.salesTabValue"
      @click="toDetail(data)"
    ></detailList>
  </view>
</template>

<script setup lang="ts">
import detailList from '../base/detail-list.vue';
import type { EntryObj } from '../../types';
interface Props {
  entryObj: EntryObj;
  isClick?: boolean;
  showDepName?: boolean;
  salesTabValue?: number;
}

const props = withDefaults(defineProps<Props>(), {
  isClick: true,
  showDepName: false,
  salesTabValue: 1,
});
const dashboardStore = useDashboardStore();
const salesmanList = ref<any[]>([]);
const loading = ref(false);
// 数据转换函数
const transformDeptSalesmanData = (element: any) => ({
  id: element.deptId,
  name: element.deptName,
  todaySales: element.dataHomeVO?.dailySales || 0,
  byxs: element.dataHomeVO?.monthSales || 0,
  ytb: element.dataHomeVO?.monthGrowthRate || 0,
  qnzy: element.dataHomeVO?.lastMonthSales || 0,
  bnlj: element.dataHomeVO?.yearSales || 0,
  ntb: element.dataHomeVO?.yearGrowthRate || 0,
  qnljy: element.dataHomeVO?.lastYearSales || 0,
  progress: element.progress || 0,
});

const transformSalesmanData = (element: any) => ({
  id: element.salesmanId,
  name: element.salesmanName,
  mainDeptName: element.mainDeptName,
  todaySales: element.dayAmount,
  byxs: element.monthAmount,
  ytb: element.monthOnPercent,
  qnzy: element.entireOnMonthAmount,
  bnlj: element.yearAmount,
  ntb: element.yearOnPercent,
  qnljy: element.accuOnYearAmount,
  progress: element.progress || 0,
});

// 获取部门人员销售数据
const fetchDeptSaleData = async (params: any) => {
  try {
    loading.value = true;
    salesmanList.value = [];
    const res: any = await DashboardService.queryDeptSaleData(params);
    if (+res.code === 200 && res.data) {
      salesmanList.value = res.data.map(transformDeptSalesmanData);
    }
  } catch (error) {
    console.error('获取部门销售数据失败:', error);
    uni.showToast({
      title: '获取数据失败',
      icon: 'none',
    });
  } finally {
    loading.value = false;
  }
};

// 获取部门客户相关业务员详情列表
const fetchRelatedSalesmanDetailList = async (params: any) => {
  try {
    loading.value = true;
    salesmanList.value = [];
    const res: any = await DashboardService.getRelatedSalesmanDetailList(params);

    if (+res.code === 200 && res.data) {
      salesmanList.value = res.data.list.map(transformSalesmanData);
    }
  } catch (error) {
    console.error('获取业务员数据失败:', error);
    uni.showToast({
      title: '获取数据失败',
      icon: 'none',
    });
  } finally {
    loading.value = false;
  }
};
// 跳转到详情页
const toDetail = (data: any) => {
  if (!props.isClick) return;
  const path = '/subpackages/dashboard/sales-line-rise-detail';
  const query = {
    deptLevel: 5,
    deptId: props.entryObj.deptId,
    deptName: props.entryObj.deptName,
    userId: data.id,
    userName: data.name,
    // customerId: props.entryObj.customerId,
    // customerName: props.entryObj.customerName,
    isInner: 1,
  };
  router.push(path, query);
};

// 初始化数据
const initData = async () => {
  if (!props.entryObj.deptId) return;
  if (props.entryObj.customerId) {
    await fetchRelatedSalesmanDetailList({
      customerId: props.entryObj.customerId,
      deptId: props.entryObj.deptId,
      pageNum: 1,
      pageSize: 3000,
      date: dashboardStore.dateTime,
    });
  } else {
    await fetchDeptSaleData({
      deptId: props.entryObj.deptId,
      date: dashboardStore.dateTime,
    });
  }
};

onMounted(() => {
  initData();
});
</script>

<style lang="scss" scoped>
.white-block {
  background-color: #fff;
  padding-bottom: 60rpx;
  margin-bottom: 80rpx;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 160rpx 0;
}
</style>
