<template>
  <view class="pb-100">
    <!-- 顶部统计数据 -->
    <topStatistics :title="'流失品种销售额'" :totalObj="totalObj"></topStatistics>

    <tableStatistics
      :title="'品种'"
      :salesTabValue="salesTabValue"
      :filterParams="filterParams"
      :dataList="dataList"
      @update:page="handleTableChange"
    ></tableStatistics>
    <app-bottom-actions>
      <view class="w-full flex justify-center">
        <app-action-btn
          class="px-3"
          icon="shaixuanfilter1"
          type="plain"
          :multi="false"
          @click="filterOpen"
          text="高级操作"
        />
        <app-tab-btn
          textColor="info"
          class="ml-2"
          :fixed="false"
          height="42px"
          @update:modelValue="salesTabChange"
          :modelValue="salesTabValue"
          :options="[
            { label: '销售额', value: 1 },
            { label: '销售数量', value: 2 },
          ]"
        ></app-tab-btn>
      </view>
    </app-bottom-actions>
    <filterSub
      @click:sureClick="filterSureClick"
      @close:fliterClose="fliterClose"
      @click:refresh="fliterRefreshClick"
      :orderList="orderList"
      :filterList="goodsFilterList"
      :flitershow="flitershow"
    ></filterSub>
  </view>
</template>

<script setup lang="ts">
import type {
  EntryObj,
  CommonFilterParams,
  LoseTotalData,
  LoseTableData,
  StagingFilter,
} from '../../types';

import topStatistics from '../base/top-statistics.vue';
import tableStatistics from '../base/table-statistics.vue';
import filterSub from '../base/fliter-sub.vue';
import { useLoseTable } from '../../composables/common/use-lose-table';
import { useFilterCommon } from '../../composables/common/use-filter-common';
const {
  filterOpen,
  fliterClose,
  fliterRefresh,
  filterSure,
  flitershow,
  salesTabValue,
  orderList,
  goodsFilterList,
  filterParams,
} = useFilterCommon();
const { totalObj, dataList, fetchLostData, fetchLostDetailData } = useLoseTable(
  salesTabValue,
  filterParams
);
const dashboardStore = useDashboardStore();
// --- Props ---
const props = defineProps({
  entryObj: {
    type: Object as PropType<EntryObj>,
    required: true,
  },
  isFooterShow: {
    type: Boolean,
    default: true,
  },
  typeVal: {
    type: String,
    default: 'personRelate',
    validator: (value: string) =>
      ['personRelate', 'goodsPersonRelate', 'departmentRelate', 'customDepartmentRelate'].includes(
        value
      ),
  },
});

const fliterRefreshClick = () => {
  fliterRefresh();
  init('fliter');
};
// 筛选条件变化
const filterSureClick = (val: StagingFilter) => {
  filterSure(val);
  init('fliter');
};
const dataInit = async (type?: string) => {
  dataList.value = []; // 清空旧数据
  let params: any;
  switch (props.typeVal) {
    case 'personRelate':
      params = {
        selectDate: dashboardStore.dateTime,
        userId: props.entryObj.userId,
        goods: filterParams.keyword,
        pageNum: filterParams.currentPage,
        pageSize: 5,
        selectType: filterParams.selectType,
        orderColumn: filterParams.orderColumn,
        orderType: filterParams.orderType,
        showType: salesTabValue.value,
      };

      if (!type && salesTabValue.value === 1)
        fetchLostData(DashboardService.getUserGoodSalesLostTotal, {
          selectDate: dashboardStore.dateTime,
          userId: props.entryObj.userId,
        });
      fetchLostDetailData(DashboardService.getUserGoodSalesLost, params);
      break;
    case 'departmentRelate':
      params = {
        date: dashboardStore.dateTime,
        deptId: props.entryObj.deptId,
        goods: filterParams.keyword,
        pageNum: filterParams.currentPage,
        pageSize: 5,
        selectType: filterParams.selectType,
        orderColumn: filterParams.orderColumn,
        orderType: filterParams.orderType,
        showType: salesTabValue.value,
      };
      if (!type && salesTabValue.value === 1)
        fetchLostData(DashboardService.queryLostGoods, {
          date: dashboardStore.dateTime,
          deptId: props.entryObj.deptId,
        });
      fetchLostDetailData(DashboardService.queryLostGoodsDetail, params);
      break;
    case 'customDepartmentRelate':
      console.log('filterParams', filterParams);
      params = {
        selectedDate: dashboardStore.dateTime,
        customerId: props.entryObj.customerId,
        deptId: props.entryObj.deptId,
        goods: filterParams.keyword,
        pageNum: filterParams.currentPage,
        pageSize: 5,
        selectType: filterParams.selectType,
        orderMethod: filterParams.orderMethod,
        orderRule: filterParams.orderRule,
        showType: salesTabValue.value,
      };
      if (!type && salesTabValue.value === 1)
        fetchLostData(DashboardService.getDescentGoodsStat, {
          selectedDate: dashboardStore.dateTime,
          customerId: props.entryObj.customerId,
          deptId: props.entryObj.deptId,
        });
      fetchLostDetailData(DashboardService.getDescentGoods, params);
      break;
    case 'personCustomerRelate':
      params = {
        selectDate: dashboardStore.dateTime,
        goods: filterParams.keyword,
        customerId: props.entryObj.customerId,
        userId: props.entryObj.userId,
        pageNum: filterParams.currentPage,
        pageSize: 5,
        selectType: filterParams.selectType,
        orderColumn: filterParams.orderColumn,
        orderType: filterParams.orderType,
      };
      if (!type && salesTabValue.value === 1)
        fetchLostData(DashboardService.getUserCstmGoodSalesLostTotal, {
          selectDate: dashboardStore.dateTime,
          userId: props.entryObj.userId,
          customerId: props.entryObj.customerId,
        });
      fetchLostDetailData(DashboardService.getUserCstmGoodSalesLost, params);
      break;
  }
};
const handleTableChange = (val: number, type?: string) => {
  filterParams.currentPage = val;
  dataInit(type);
};
const salesTabChange = (val: number) => {
  salesTabValue.value = val;
  dataInit();
};
// 初始化数据
const init = async (type?: string) => {
  handleTableChange(1, type);
};
onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped></style>
