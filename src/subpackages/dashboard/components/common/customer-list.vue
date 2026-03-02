<template>
  <view class="bg-white pb-3 mb-4 rd-2">
    <view class="white-block pb-3 mb-4" v-if="dataList.length == 0 && !filterParams.loading">
      <app-empty class="py-7" description="暂无数据" />
    </view>
    <up-loading-icon
      class="py-6"
      v-if="filterParams.loading && !dataList.length"
      text="加载中"
      mode="circle"
      textSize="18"
      color="rgb(53 97 242)"
    ></up-loading-icon>
    <!-- 数据列表 -->
    <detailList
      v-for="data in dataList"
      :key="data.id"
      :data="data"
      :name="`${data.id}/${data.name}`"
      :show-drxs="true"
      :isClick="isClick"
      :perShow="false"
      :per="10"
      :salesTabValue="salesTabValue"
      @click="toDetail(data)"
    />

    <!-- 分页器 -->
    <view v-if="dataList.length > 0" class="pa-4 bg-white">
      <up-pagination
        :current-page="filterParams.currentPage"
        :page-size="filterParams.pageSize"
        :total="filterParams.total"
        layout="prev, pager, next"
        @current-change="handleCurrentChange"
      />
    </view>
    <!-- 高级操作 -->
    <app-bottom-actions>
      <view class="w-full flex justify-center">
        <app-action-btn
          customClass="px-3"
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
      :flitershow="flitershow"
    ></filterSub>
  </view>
</template>

<script setup lang="ts">
import type { EntryObj, StagingFilter, CommonDataItem, CommonFilterParams } from '../../types';
import filterSub from '../base/fliter-sub.vue';
import { useFilterCommon } from '../../composables/common/use-filter-common';
const {
  filterOpen,
  fliterClose,
  fliterRefresh,
  filterSure,
  flitershow,
  salesTabValue,
  orderList,
  filterParams,
} = useFilterCommon('list-customer');
import { useListCommon } from '../../composables/common/use-list-common';
import detailList from '../base/detail-list.vue';
const { dataList, fetchData, createDefaultDataMapper, createDefaultDataMapperByCustomerDepart } =
  useListCommon(filterParams);
const dashboardStore = useDashboardStore();
const fliterRefreshClick = () => {
  fliterRefresh();
  init();
};
// 筛选条件变化
const filterSureClick = async (val: StagingFilter) => {
  filterSure(val);
  init();
};
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
  isClick: {
    type: Boolean,
    default: true,
  },
  customerTabName: {
    type: String,
    default: '',
  },
});

// --- Emits ---
const emit = defineEmits(['update']); // 如果需要和父组件通信

const dataInit = async () => {
  dataList.value = []; // 清空旧数据
  let params: any;
  switch (props.typeVal) {
    case 'personRelate':
      params = {
        selectDate: dashboardStore.dateTime,
        userId: props.entryObj.userId,
        custom: filterParams.keyword,
        orderColumn: filterParams.orderColumn,
        orderType: filterParams.orderType,
        pageNum: filterParams.currentPage,
        pageSize: filterParams.pageSize,
      };
      await fetchData(
        params,
        DashboardService.getDataUserCustomerSalesList,
        createDefaultDataMapper()
      );
      break;
    case 'departmentRelate':
      params = {
        deptId: props.entryObj.deptId,
        date: dashboardStore.dateTime,
        customerKeyword: filterParams.keyword,
        orderColumn: filterParams.orderColumn,
        orderType: filterParams.orderType,
        pageNum: filterParams.currentPage,
        pageSize: filterParams.pageSize,
      };
      await fetchData(
        params,
        DashboardService.customerGetDeptDetailList,
        createDefaultDataMapper()
      );
      break;
    case 'goodsDepartmentRelate':
      params = {
        date: dashboardStore.dateTime,
        orderColumn: filterParams.orderColumn,
        orderType: filterParams.orderType,
        customerKeyword: filterParams.keyword,
        deptId: props.entryObj.deptId,
        goodsId: props.entryObj.goodsId,
        pageNum: filterParams.currentPage,
        pageSize: filterParams.pageSize,
        type: props.customerTabName === '新增客户' ? 2 : 1,
      };
      await fetchData(
        params,
        DashboardService.getDifferentCustomerDetailList,
        createDefaultDataMapper()
      );

      break;
    case 'personGoodsRelate':
      if (props.customerTabName === '全客户') {
        params = {
          selectDate: dashboardStore.dateTime,
          custom: filterParams.keyword,
          orderColumn: filterParams.orderColumn,
          orderType: filterParams.orderType,
          userId: props.entryObj.userId,
          goodsId: props.entryObj.goodsId,
          pageNum: filterParams.currentPage,
          pageSize: filterParams.pageSize,
        };
        await fetchData(
          params,
          DashboardService.getUserGdCustomSalesList,
          createDefaultDataMapper()
        );
      }
      if (props.customerTabName === '新增客户') {
        params = {
          selectDate: dashboardStore.dateTime,
          customerKeyword: filterParams.keyword,
          orderColumn: filterParams.orderColumn,
          orderType: filterParams.orderType,
          userId: props.entryObj.userId,
          goodsId: props.entryObj.goodsId,
          pageNum: filterParams.currentPage,
          pageSize: filterParams.pageSize,
        };
        await fetchData(
          params,
          DashboardService.getFixGoodsNewCustomerSalesList,
          createDefaultDataMapper()
        );
      }
      break;
  }
};

// 分页变化
const handleCurrentChange = (val: number) => {
  filterParams.currentPage = val;
  dataInit();
};

// 跳转详情
const toDetail = (data: CommonDataItem) => {
  if (!props.isClick) return;
  const path = '/subpackages/dashboard/sales-line-rise-detail';
  let query = {};
  console.log('props.typeVal', props.typeVal);
  switch (props.typeVal) {
    case 'departmentRelate':
      query = {
        deptLevel: 6, // 下一层详情
        deptId: props.entryObj.deptId,
        deptName: props.entryObj.deptName,
        customerId: data.id,
        customerName: data.name,
        isInner: 1,
      };
      router.push(path, query);
      break;
    case 'personRelate':
      query = {
        deptLevel: 6, // 下一层详情
        deptId: props.entryObj.deptId,
        deptName: props.entryObj.deptName,
        userId: props.entryObj.userId,
        userName: props.entryObj.userName,
        customerId: data.id,
        customerName: data.name,
        isInner: 1,
      };
      router.push(path, query);
      break;
  }
};
// 初始化数据
const init = async () => {
  handleCurrentChange(1);
};
onMounted(() => {
  init();
});
</script>

<style lang="scss">
.up-popup-header {
  height: 40px;
  line-height: 40px;
}
</style>
