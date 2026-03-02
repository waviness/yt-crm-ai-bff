<template>
  <view style="height: 100vh">
    <app-watermark></app-watermark>
    <up-sticky style="background-color: white; top: 0">
      <filter-pop :form-data="formData" @confirm="onFilterChange" />
      <app-tabs
        :current="active"
        :list="tabList"
        @change="({ index }: { index: number }) => handleTabChange(index)"
      />
    </up-sticky>

    <app-pull-refresh
      :refreshing="refreshing"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <view class="px-2 pt-2">
        <approve-item
          v-for="(item, index) in list"
          :key="item.invoiceid + index"
          :data="item"
          @click="toDetail(item)"
        />
        <app-empty v-show="!list.length && !refreshing" class="py-7" description="暂无数据" />
      </view>
    </app-pull-refresh>
  </view>
</template>

<script lang="ts" setup>
import { onActivated } from 'vue';
import approveItem from './components/approve-item.vue';
import filterPop from './components/filter-pop.vue';
import { useCustomerOrderApprove } from './composables/use-customer-order-approve';
import { useAppStore } from '@/store/app';

const appStore = useAppStore();

// 使用业务逻辑
const {
  formData,
  tabList,
  active,
  list,
  refreshing,
  loadmoreConfig,
  pullRefreshHeight,
  onFilterChange,
  handleTabChange,
  onRefresh,
  onLoadMore,
  toDetail,
  init,
  calcPullRefreshHeight,
} = useCustomerOrderApprove();

// 页面激活时刷新
onActivated(() => {
  if (appStore.hadDoneOnDetail) {
    onRefresh();
    appStore.setHadDoneOnDetail(false);
  }
});

// 页面初始化
onLoad(async () => {
  init();
  await calcPullRefreshHeight();
  onRefresh();
});
</script>

<style lang="scss" scoped></style>
