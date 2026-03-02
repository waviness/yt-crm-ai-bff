<template>
  <view>
    <app-watermark />
    <up-sticky style="top: 0">
      <customer-follow-filter-pop
        :labelTreeList="labelTreeList"
        :filterActive="filterActive"
        @confirm="onFilterConfirm"
      />
    </up-sticky>

    <!-- 直接使用 scroll-view，不用 app-pull-refresh -->
    <scroll-view scroll-y :style="{ height: pullRefreshHeight + 'px' }" @scrolltolower="onLoadMore">
      <view class="px-10">
        <customer-follow-list
          v-for="(item, index) in list"
          :key="item.suvId"
          :item="item"
          @click="toDetail(item, index)"
        />
        <app-empty v-if="!loading && !list.length" class="py-7" description="暂无数据" />

        <!-- 加载更多提示 -->
        <view v-if="loading" style="text-align: center; padding: 20rpx">
          <text>加载中...</text>
        </view>
        <view v-else-if="!hasMore" style="text-align: center; padding: 20rpx; color: #999">
          <text>没有更多了</text>
        </view>
      </view>
    </scroll-view>

    <!-- 新增按钮：从拜访记录进入时不显示 -->
    <app-fix-btn v-if="!userId" text="客情新增" @click="toAdd" />
  </view>
</template>

<script setup lang="ts">
import customerFollowFilterPop from './components/customer-follow-filter-pop.vue';
import customerFollowList from './components/customer-follow-list.vue';
import { useCustomerFollow } from './composables/use-customer-follow';

const appStore = useAppStore();

const {
  filterShow,
  filterActive,
  rowIndex,
  userId,
  labelTreeList,
  customTypeList,
  list,
  loading,
  refreshing,
  loadmoreConfig,
  pullRefreshHeight,
  hasMore,
  initPermission,
  initDictData,
  initRouteParams,
  fetchList,
  onRefresh,
  onLoadMore,
  onFilterConfirm,
  toDetail,
  toAdd,
  calcPullRefreshHeight,
} = useCustomerFollow();

// 暴露到全局用于调试
(window as any).__DEBUG_LIST__ = list;

// 生命周期
onLoad((options: any) => {
  // 初始化路由参数
  initRouteParams(options);
});

onMounted(async () => {
  console.log('=== index.vue onMounted 开始 ===');
  initPermission();
  await initDictData();
  calcPullRefreshHeight();
  onRefresh();
});

onShow(() => {
  // 从详情页返回时，如果有操作，刷新列表
  if (rowIndex.value !== -1 && appStore.hadDoneOnDetail) {
    onRefresh();
    rowIndex.value = -1;
    appStore.setHadDoneOnDetail(false);
  }
});
</script>

<style lang="scss" scoped>
.debug-info {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.px-10 {
  padding: 0 20rpx;
}
</style>
