<template>
  <view class="bg-white pb-100">
    <salesHeader :entryObj="entryObj" @update:dateTime="dateChange" />
    <dailySales
      @visitClick="visitClick"
      :loading="loading"
      :currentDayMoney="salesDataObj.currentDayMoney"
      :objName="entryObj.objName"
      :visitNumber="visitNumber"
      :visitFlag="!entryObj.goodsId"
    />
    <commonCard :loading="loading" :salesDataObj="salesDataObj" />
    <salesCommonTabIndex
      :isClick="isClick"
      :entryObj="entryObj"
      :refreshData="refreshData"
      :tabType="getTabType"
    />
    <!-- @visitClick="visitClick" -->
  </view>
</template>

<script lang="ts" setup>
import type { EntryObj } from '../types';
import { useSalesmanIndex } from '../composables/use-sales-line-detail';
import salesHeader from './base/header.vue';
import dailySales from './base/daily-sales.vue';
import commonCard from './base/common-card.vue';
import salesCommonTabIndex from './business/sales-common-tab-index.vue';
interface IProps {
  entryObj: EntryObj;
  isClick: boolean;
}
const props = defineProps<IProps>();
const {
  fetchGetDataUserSalesDetail,
  fetchGetDeptCustomerDailySale, // 客户相关
  fetchGetDeptCustomerSaleStat, // 客户相关
  fetchUserVisitData, // 拜访相关
  fetchGetDeptSaleStat, // 品种相关
  fetchGetDataUserCustomerSalesOne, // 人员点击获取当日一条数据
  fetchGetDataUserGoodSalesOne,
  loading,
  salesDataObj,
  visitNumber,
} = useSalesmanIndex(props.entryObj);
const dashboardStore = useDashboardStore();
const emit = defineEmits(['dateChange']);
const dateChange = ({ fulldate }: { fulldate: string }) => {
  dashboardStore.setDateTime(time.format(new Date(fulldate), 'yyyy-MM-dd'));
};
const refreshData = ref(true);
const getTabType = computed(() => {
  if (+props.entryObj.deptLevel! === 5) {
    return 'personRelate';
  }
  if (+props.entryObj.deptLevel! === 6) {
    if (props.entryObj.customerId && !props.entryObj.userId) {
      return 'customDepartmentRelate';
    }
    if (props.entryObj.goodsId && !props.entryObj.userId) {
      return 'goodsDepartmentRelate';
    }
    if (props.entryObj.customerId && props.entryObj.userId) {
      return 'personCustomerRelate';
    }
    if (props.entryObj.goodsId && props.entryObj.userId) {
      return 'personGoodsRelate';
    }
  }
  return 'departmentRelate';
});
const currentTime = dashboardStore.dateTime + ' 23:59:59'; // 获取当前时间
const before30Time =
  time.format(time.add(new Date(currentTime), -30, 'day'), time.FORMATS.ISO_DATE) + ' 00:00:00';
const initData = async () => {
  const params = {
    // 使用 dayjs 计算开始时间（当前时间往前推29天）
    startTime: before30Time,
    // 使用 dayjs 格式化结束时间（当前时间）
    endTime: currentTime,
    // 分页信息
    pageNum: 1,
    pageSize: 1,
  };
  if (+props.entryObj.deptLevel! === 5 || +props.entryObj.deptLevel! === 6) {
    fetchUserVisitData({
      ...params, // 用户ID列表，从 entryObj 中获取
      userIdList: props.entryObj.userId ? [+props.entryObj.userId] : undefined,
      companyId: props.entryObj.customerId || undefined,
      depId: props.entryObj.deptId && !props.entryObj.userId ? props.entryObj.deptId : undefined,
    });
  }
  if (+props.entryObj.deptLevel! === 5) {
    fetchGetDataUserSalesDetail();
  }
  if (+props.entryObj.deptLevel! === 6) {
    if (props.entryObj.customerId && !props.entryObj.userId) {
      fetchGetDeptCustomerDailySale();
      fetchGetDeptCustomerSaleStat();
    }
    if (props.entryObj.customerId && props.entryObj.userId) {
      fetchGetDataUserCustomerSalesOne();
    }
    if (props.entryObj.goodsId && !props.entryObj.userId) {
      fetchGetDeptSaleStat();
    }
    if (props.entryObj.goodsId && props.entryObj.userId) {
      fetchGetDataUserGoodSalesOne();
    }
  }
};
const visitClick = () => {
  console.log('visitClick', props.entryObj);
  if (props.entryObj.userId) {
    // 点击事件处理
    dashboardStore.setVisitFilterParams({
      companyIdOrName: props.entryObj.customerId,
      userIdOrName: '',
      labelId: '',
      labelText: '',
      labelIdList: [],
      taskType: '',
      deptId: props.entryObj.deptId,
      userIdList: [+props.entryObj.userId],
      endTime: currentTime,
      startTime: before30Time,
    });
    uni.navigateTo({
      url: '/subpackages/dashboard/visit-page-list',
    });
  } else
    router.push(
      '/subpackages/dashboard/visit-page-total?deptId=' +
        props.entryObj.deptId +
        '&deptName=' +
        props.entryObj.deptName +
        '&customerId=' +
        props.entryObj.customerId +
        '&customerName=' +
        props.entryObj.customerName
    );
};
const lastDateTime = ref(''); // 初始化为空字符串
// 监听日期变化时刷新数据
watch(
  () => dashboardStore.dateTime,
  newDateTime => {
    if (newDateTime !== lastDateTime.value) {
      initData();
      refreshData.value = false; // 刷新页面
      nextTick(() => {
        refreshData.value = true;
      });
    }
  }
);
onMounted(() => {
  initData();
});
</script>

<style lang="sass" scoped></style>
