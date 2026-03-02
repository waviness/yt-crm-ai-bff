<script setup lang="ts">
import FundItem from './components/fund-item.vue';
import FundFilterPop from './components/fund-filter-pop.vue';
import { useFundingList } from './composables/use-funding-list';

// 使用组合式函数管理列表逻辑
const {
  formData,
  deptList,
  list,
  refreshing,
  loadmoreConfig,
  pullRefreshHeight,
  getDeptList,
  handleFilterChange,
  toDetail,
  onRefresh,
  onLoadMore,
  calcPullRefreshHeight,
} = useFundingList();

onMounted(() => {
  calcPullRefreshHeight();
  onRefresh();
  getDeptList();
});

onShow(() => {
  const appStore = useAppStore();
  if (appStore.hadDoneOnDetail) {
    onRefresh();
  }
});
</script>

<!-- 资金填报 -->
<template>
  <view>
    <app-watermark> </app-watermark>
    <up-sticky style="top: 0">
      <fund-filter-pop :formData="formData" :deptList="deptList" @confirm="handleFilterChange" />
    </up-sticky>
    <app-pull-refresh
      :refreshing="refreshing"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <view v-for="(item, idx) in list" :key="idx">
        <view class="my-2 mx-4 color-gray-4">{{ item.dataMonth }}月</view>
        <fund-item
          class="block mb-2"
          v-for="(data, idx2) in item.fundFormList"
          :key="idx2"
          :data="data"
          @click="toDetail(data, item.dataYear, item.dataMonth)"
        />
      </view>
    </app-pull-refresh>
  </view>
</template>
