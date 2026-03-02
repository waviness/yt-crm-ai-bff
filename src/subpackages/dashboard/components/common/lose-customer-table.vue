<template>
  <view class="pb-100">
    <!-- 顶部统计数据 -->
    <topStatistics :title="'下降客户销售额'" :totalObj="totalObj"></topStatistics>
    <tableStatistics
      :title="'客户'"
      :filterParams="filterParams"
      :dataList="dataList"
      @update:page="handleTableChange"
    ></tableStatistics>
    <!-- 高级操作 -->
    <app-bottom-actions>
      <view class="w-full flex justify-center">
        <app-action-btn
          class="px-3"
          icon="shaixuanfilter1"
          type="plain"
          :multi="false"
          @click="filterOpen"
          text="高级操作"
      /></view>
    </app-bottom-actions>
    <filterSub
      @click:sureClick="filterSureClick"
      @close:fliterClose="fliterClose"
      @click:refresh="fliterRefreshClick"
      :orderList="orderList"
      :filterList="customerFilterList"
      :flitershow="flitershow"
    ></filterSub>
  </view>
</template>

<script setup lang="ts">
import type { EntryObj, StagingFilter } from '../../types';
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
  customerFilterList,
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
      ['personRelate', 'goodsPersonRelate', 'departmentRelate', 'goodsDepartmentRelate'].includes(
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
      };
      if (!type)
        fetchLostData(DashboardService.getUserCustomerSalesLostTotal, {
          selectDate: dashboardStore.dateTime,
          userId: props.entryObj.userId,
        });
      fetchLostDetailData(DashboardService.getUserCustomerSalesLost, params);
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
      };
      if (!type)
        fetchLostData(DashboardService.queryLostCust, {
          date: dashboardStore.dateTime,
          deptId: props.entryObj.deptId,
        });
      fetchLostDetailData(DashboardService.queryLostCustDetail, params);
      break;
    case 'goodsDepartmentRelate':
      params = {
        selectedDate: dashboardStore.dateTime,
        deptId: props.entryObj.deptId,
        goodsId: props.entryObj.goodsId,
        filterCondition: filterParams.selectType,
        customerKeyword: filterParams.keyword,
        pageNum: filterParams.currentPage,
        pageSize: 5,
        orderColumn: filterParams.orderColumn,
        orderType: filterParams.orderType,
      };
      if (!type)
        fetchLostData(DashboardService.getDescentCustomerStat, {
          date: dashboardStore.dateTime,
          deptId: props.entryObj.deptId,
          goodsId: props.entryObj.goodsId,
        });
      fetchLostDetailData(DashboardService.getDescentCustomerDetailList, params);
      break;

    case 'personGoodsRelate':
      params = {
        selectDate: dashboardStore.dateTime,
        custom: filterParams.keyword,
        selectType: filterParams.selectType,
        orderColumn: filterParams.orderColumn,
        orderType: filterParams.orderType,
        deptId: props.entryObj.deptId,
        userId: props.entryObj.userId,
        filterCondition: filterParams.selectType,
        pageNum: filterParams.currentPage,
        pageSize: 5,
      };
      if (!type)
        fetchLostData(DashboardService.getUserGdCustomSalesLostTotal, {
          selectDate: dashboardStore.dateTime,
          userId: props.entryObj.userId,
          goodsId: props.entryObj.goodsId,
        });
      fetchLostDetailData(DashboardService.getUserGDCustomerSalesLost, params);
      break;
  }
};
const handleTableChange = (val: number, type?: string) => {
  filterParams.currentPage = val;
  dataInit(type);
};

// 初始化数据
const init = async (type?: string) => {
  handleTableChange(1, type);
};
onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
.table-div {
  height: calc(100% - 101px);
  overflow-y: scroll;
}

.table-body {
  overflow-x: scroll;

  .table-line {
    width: fit-content;
  }

  .table-div-1,
  .table-div-2,
  .table-div-3,
  .table-div-4,
  .table-div-5 {
    flex-shrink: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    margin-right: 33px;
  }

  .table-div-1 {
    padding-left: 32rpx;
    width: 270rpx;
  }

  .table-div-2,
  .table-div-3,
  .table-div-4 {
    width: 140rpx;
    text-align: right;
  }

  .table-div-5 {
    width: 340rpx;
  }

  .table-div-6 {
    width: 330rpx;
    margin-right: 0;
    white-space: nowrap;
  }

  .table-content {
    width: 1356rpx;
    height: calc(100% - 88rpx);
  }
}
</style>
