<template>
  <view class="bg-white pb-3 mb-4 rd-2">
    <view class="white-block pb-3 mb-4" v-if="isEmptyState">
      <app-empty class="py-7" description="暂无数据" />
    </view>
    <up-loading-icon
      class="py-6"
      v-if="isLoading"
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
      :perShow="false"
      :isClick="isClick"
      :salesTabValue="salesTabValue"
      @click="toDetail(data)"
    />

    <!-- 分页器 -->
    <view v-if="hasData" class="pa-4 bg-white">
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
        />
        <app-tab-btn
          textColor="info"
          class="ml-2"
          :fixed="false"
          height="42px"
          @update:modelValue="handleSalesTabChange"
          :modelValue="salesTabValue"
          :options="SALES_TAB_OPTIONS"
        ></app-tab-btn>
      </view>
    </app-bottom-actions>

    <filterSub
      @click:sureClick="handleFilterConfirm"
      @close:fliterClose="fliterClose"
      @click:refresh="handleFilterRefresh"
      :orderList="orderList"
      :flitershow="flitershow"
    ></filterSub>
  </view>
</template>

<script setup lang="ts">
import type { EntryObj, StagingFilter, CommonDataItem, CommonFilterParams } from '../../types';
import filterSub from '../base/fliter-sub.vue';
import { useFilterCommon } from '../../composables/common/use-filter-common';
import { useListCommon } from '../../composables/common/use-list-common';
import detailList from '../base/detail-list.vue';
// 类型定义
interface SalesTabOption {
  label: string;
  value: number;
}
// 常量定义
const SALES_TAB_OPTIONS: SalesTabOption[] = [
  { label: '销售额', value: 1 },
  { label: '销售数量', value: 2 },
];
const dashboardStore = useDashboardStore();
const {
  filterOpen,
  fliterClose,
  fliterRefresh,
  filterSure,
  flitershow,
  salesTabValue,
  orderList,
  filterParams,
} = useFilterCommon('list-goods');
const { dataList, fetchData, createDefaultDataMapper, createDefaultDataMapperByCustomerDepart } =
  useListCommon(filterParams);

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
  isClick: {
    type: Boolean,
    default: true,
  },
  goodsTabName: {
    type: String,
    default: '',
  },
});
// --- Emits ---
const emit = defineEmits(['update']); // 如果需要和父组件通信
// 计算属性
const isEmptyState = computed(() => dataList.value.length === 0 && !filterParams.loading);
const isLoading = computed(() => filterParams.loading && !dataList.value.length);
const hasData = computed(() => dataList.value.length > 0);
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
      await fetchData(params, DashboardService.getDataUserGoodSalesList, createDefaultDataMapper());
      break;
    case 'departmentRelate':
      params = {
        deptId: props.entryObj.deptId,
        date: dashboardStore.dateTime,
        goodsKeyword: filterParams.keyword,
        orderColumn: filterParams.orderColumn,
        orderType: filterParams.orderType,
        pageNum: filterParams.currentPage,
        pageSize: filterParams.pageSize,
        showType: salesTabValue.value,
      };
      console.log('params', params);
      await fetchData(params, DashboardService.goodsGetDeptDetailList, createDefaultDataMapper());
      break;
    case 'customDepartmentRelate':
      if (props.goodsTabName === '全品种') {
        params = {
          deptId: props.entryObj.deptId,
          customerId: props.entryObj.customerId,
          selectedDate: dashboardStore.dateTime,
          goodsKeyword: filterParams.keyword,
          orderMethod: filterParams.orderMethod,
          orderRule: filterParams.orderRule,
          pageNum: filterParams.currentPage,
          pageSize: filterParams.pageSize,
          showType: salesTabValue.value,
        };
        await fetchData(
          params,
          DashboardService.getFullGoods,
          createDefaultDataMapperByCustomerDepart()
        );
      }
      if (props.goodsTabName === '新增品种') {
        params = {
          deptId: props.entryObj.deptId,
          customerId: props.entryObj.customerId,
          date: dashboardStore.dateTime,
          goodsKeyword: filterParams.keyword,
          orderMethod: filterParams.orderMethod,
          orderRule: filterParams.orderRule,
          pageNum: filterParams.currentPage,
          pageSize: filterParams.pageSize,
          showType: salesTabValue.value,
        };
        await fetchData(
          params,
          DashboardService.getNewGoodsDetailList,
          createDefaultDataMapperByCustomerDepart()
        );
      }
      break;
    case 'personCustomerRelate':
      if (props.goodsTabName === '全品种') {
        params = {
          selectDate: dashboardStore.dateTime,
          userId: props.entryObj.userId,
          customerId: props.entryObj.customerId,
          goods: filterParams.keyword,
          orderColumn: filterParams.orderColumn,
          orderType: filterParams.orderType,
          pageNum: filterParams.currentPage,
          pageSize: filterParams.pageSize,
          showType: salesTabValue.value,
        };
        await fetchData(
          params,
          DashboardService.getaUserCustomerSalesList,
          createDefaultDataMapperByCustomerDepart()
        );
      }
      if (props.goodsTabName === '新增品种') {
        params = {
          selectDate: dashboardStore.dateTime,
          userId: props.entryObj.userId,
          customerId: props.entryObj.customerId,
          goodsKeyword: filterParams.keyword,
          orderColumn: filterParams.orderColumn,
          orderType: filterParams.orderType,
          pageNum: filterParams.currentPage,
          pageSize: filterParams.pageSize,
          showType: salesTabValue.value,
        };
        await fetchData(
          params,
          DashboardService.getFixCustomerNewGoodSalesList,
          createDefaultDataMapperByCustomerDepart()
        );
      }

      break;
  }
};
// 跳转详情
const toDetail = (data: CommonDataItem) => {
  if (!props.isClick) return;
  const path = '/subpackages/dashboard/sales-line-rise-detail';
  let query: Record<string, any> = {};
  switch (props.typeVal) {
    case 'departmentRelate':
      query = {
        deptLevel: 6,
        deptId: props.entryObj.deptId,
        deptName: props.entryObj.deptName,
        goodsId: data.id,
        goodsName: data.name,
        isInner: 1,
      };

      break;
    case 'personRelate':
      query = {
        deptLevel: 6,
        deptId: props.entryObj.deptId,
        deptName: props.entryObj.deptName,
        userId: props.entryObj.userId,
        userName: props.entryObj.userName,
        goodsId: data.id,
        goodsName: data.name,
        isInner: 1,
      };
      break;
  }
  router.push(path, query);
};

// 分页变化
const handleCurrentChange = (page: number) => {
  filterParams.currentPage = page;
  dataInit();
};
const handleSalesTabChange = (val: number) => {
  salesTabValue.value = val;
  dataInit();
};

const handleFilterRefresh = async () => {
  fliterRefresh();
  await dataInit();
};
// 筛选条件变化
const handleFilterConfirm = async (val: StagingFilter) => {
  filterSure(val);
  await dataInit();
};

const init = async () => {
  filterParams.currentPage = 1; // 重置页码
  await dataInit();
};
onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped></style>
