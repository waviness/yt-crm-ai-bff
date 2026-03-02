<template>
  <view>
    <app-watermark></app-watermark>

    <!-- PM4账号选择页 -->
    <identity-selection
      v-if="showIdentitySelect"
      :identityList="identityList"
      @change="handleIdentityChange"
    />

    <!-- 主列表页 -->
    <view v-else>
      <up-sticky style="top: 0">
        <sales-return-filter-pop
          v-model:filterShow="filterShow"
          :formData="formData"
          @confirm="onFilterConfirm"
          @reset="onFilterReset"
        />
        <app-tabs :list="statusList" :active="activeTab" @change="onTabChange" />
      </up-sticky>

      <app-pull-refresh
        :refreshing="refreshing"
        :loadmoreProps="loadmoreConfig"
        :pullRefreshHeight="pullRefreshHeight"
        @refresh="onRefresh"
        @loadmore="onLoadMore"
      >
        <view class="pa-2">
          <sales-return-card
            v-for="(item, index) in list"
            :key="item.redocId"
            :item="item"
            @click="toDetail(item, index)"
          />
        </view>
      </app-pull-refresh>

      <!-- PM4账号切换按钮 -->
      <app-bottom-actions v-if="identityObj">
        <view class="flex w-full px-8">
          <app-action-btn
            class="flex-1"
            type="primary"
            :text="`PM4账号切换 当前(${identityObj.userCode || '未选择'})`"
            @click="toggleIdentitySelect"
          />
        </view>
      </app-bottom-actions>
    </view>
  </view>
</template>

<script lang="ts" setup>
import identitySelection from './components/identity-selection.vue';
import salesReturnCard from './components/sales-return-card.vue';
import salesReturnFilterPop from './components/sales-return-filter-pop.vue';
import { useSalesReturn } from './composables/use-sales-return';
import type { SalesReturnItem } from './types';

const appStore = useAppStore();

const {
  showIdentitySelect,
  filterShow,
  statusList,
  activeTab,
  formData,
  identityList,
  identityObj,
  rowIndex,
  list,
  refreshing,
  loadmoreConfig,
  pullRefreshHeight,
  onRefresh,
  onLoadMore,
  calcPullRefreshHeight,
  removeRow,
  permissInit,
  handleIdentityChange,
  onFilterConfirm,
  onFilterReset,
  onTabChange,
  toggleIdentitySelect,
} = useSalesReturn();

// 跳转详情
const toDetail = (item: SalesReturnItem, index: number) => {
  rowIndex.value = index;
  const params = {
    redocId: item.redocId,
    status: activeTab.value + 1, // 1-未处理 2-已处理
  };
  uni.navigateTo({
    url: `/subpackages/business/sales-return-order/detail?redocId=${params.redocId}&status=${params.status}`,
  });
};

// 页面显示时
onShow(() => {
  if (rowIndex.value !== -1 && appStore.hadDoneOnDetail) {
    // 如果在详情页完成了操作，删除对应行
    removeRow(rowIndex.value);
    rowIndex.value = -1;
    appStore.setHadDoneOnDetail(false);
  }
});

onMounted(() => {
  permissInit();
  calcPullRefreshHeight();
});
</script>

<style lang="scss" scoped>
.fixed-bottom-btn {
  position: fixed;
  bottom: 20rpx;
  left: 32rpx;
  right: 32rpx;
  z-index: 100;
}
</style>
