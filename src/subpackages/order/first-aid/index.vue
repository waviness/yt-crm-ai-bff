<template>
  <view style="height: 100vh">
    <up-sticky style="background-color: white; top: 0"
      ><first-aid-order-filter-pop
        v-model:filterShow="filterShow"
        :formData="formData"
        @confirm="onFilterConfirm"
      />
      <app-tabs :list="statusList" :active="activeTab" @change="onhandleActiveChange" />
    </up-sticky>
    <app-pull-refresh
      :refreshing="refreshing"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <view class="px-10 pt-10">
        <card
          v-for="(item, index) in list"
          :type="activeTab"
          :key="item.id"
          :orderItem="item"
          @invalid="type => handleInvalid(item, index, type)"
          @reset="handleReset(item, index)"
          @click="toDetail(item)"
        />
        <app-empty v-show="!refreshing && !list.length" class="py-7" description="暂无数据" />
      </view>
    </app-pull-refresh>
  </view>
</template>

<script setup lang="ts">
import Card from './components/first-aid-card.vue';
import firstAidOrderFilterPop from './components/first-aid-filter-pop.vue';
import { useFirstAidOrder } from './composables/use-first-aid';
import type { FirstAidOrderOrderItem } from './types';
// 使用业务逻辑组合式API
const {
  filterShow,
  statusList,
  activeTab,
  formData,
  fetchOrderList,
  handleActiveChange,
  handleFilterChange,
  toDetail,
  fetchOperationForEmergencyOrder,
  fetchEmergencyOrderMatchReset,
} = useFirstAidOrder();
console.log('statusList:', statusList);
// 使用分页组合式API
const pagination = usePagination(
  {
    pageSize: 10,
    initialPage: 1,
    toolBarHeight: 138,
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
  removeRow,
} = pagination;

/**
 * 页面生命周期处理
 */
onMounted(() => {
  calcPullRefreshHeight();
  onRefresh();
});
// 筛选条件变更处理
const onFilterConfirm = (filterVal: any) => {
  filterShow.value = false;
  handleFilterChange(filterVal);
  onRefresh();
};

const onhandleActiveChange = ({ index }: { index: number }) => {
  handleActiveChange({ index });
  onRefresh();
};

// 处理作废/回退
const handleInvalid = (item: FirstAidOrderOrderItem, index: number, type: number) => {
  // 处理作废逻辑
  fetchOperationForEmergencyOrder(item, type).then((res: any) => {
    console.log('作废/回退结果:', res);
    if (res.code === '200') {
      removeRow(index);
    }
  });
};

// 处理重置
const handleReset = (item: FirstAidOrderOrderItem, index: number) => {
  // 处理重置逻辑
  fetchEmergencyOrderMatchReset(item).then((res: any) => {
    if (res.code === '200') {
      removeRow(index);
    }
  });
};
</script>
<style lang="scss" scoped></style>
