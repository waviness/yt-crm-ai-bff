<script setup lang="ts">
import { useContractList } from './composables/use-contract-list';
import ContractItem from './components/contract-item.vue';
import FilterPop from './components/filter-pop.vue';

defineOptions(SHARED_STYLE_OPTIONS);

const {
  list,
  loading,
  finished,
  refreshing,
  error,
  formData,
  onFilterChange,
  onRefresh,
  getDataList,
  toDetail,
  init,
} = useContractList();

// 生命周期
onMounted(() => {
  init();
});

// 下拉刷新
const handleRefresh = () => {
  onRefresh();
  getDataList();
};

// 上拉加载更多
const handleLoadMore = () => {
  getDataList();
};
</script>

<template>
  <view class="pb-50">
    <app-watermark></app-watermark>

    <!-- 筛选条件 -->
    <up-sticky style="top: 0">
      <filter-pop :formData="formData" @confirm="onFilterChange" />
    </up-sticky>

    <!-- 列表 -->
    <view class="p-10">
      <scroll-view
        class="h-[calc(100vh-50px)]"
        scroll-y
        enable-flex
        @scrolltolower="handleLoadMore"
        @scrolltoupper="handleRefresh"
      >
        <app-empty v-if="!loading && !list.length" description="暂无数据" />

        <contract-item
          class="mb-2"
          v-for="(item, idx) in list"
          :key="idx"
          :data="item"
          @click="toDetail(item)"
        />

        <up-loadmore
          v-if="loading || !finished"
          :status="loading ? 'loading' : finished ? 'nomore' : 'loadmore'"
        />
      </scroll-view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.leader {
  padding: 20px;

  &-title {
    font-size: 14px;
  }

  &-select {
    margin-top: 15px;
  }
}
</style>
