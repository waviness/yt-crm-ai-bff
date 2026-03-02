<template>
  <view>
    <app-watermark></app-watermark>
    <up-sticky style="top: 0">
      <refund-approve-filter-pop
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
      <view class="pa-2">
        <refund-approve-list
          v-for="(item, index) in list"
          :key="item.fetchdtlId"
          :item="item"
          @toDetail="toDetail(item, index)"
        />
      </view>
    </app-pull-refresh>
  </view>
</template>

<script lang="ts" setup>
import refundApproveFilterPop from './components/refund-approve-filter-pop.vue';
import refundApproveList from './components/refund-approve-list.vue';
import { useRefundApprove } from './composables/use-refund-approve';
import type { RefundApproveFilterData, RefundApproveItem } from './types';

const appStore = useAppStore();

const {
  filterShow,
  statusList,
  activeTab,
  formData,
  rowIndex,
  list,
  refreshing,
  loadmoreConfig,
  pullRefreshHeight,
  onRefresh,
  onLoadMore,
  calcPullRefreshHeight,
  removeRow,
} = useRefundApprove();

// 筛选确认
const onFilterConfirm = (data: RefundApproveFilterData) => {
  formData.value = data;
  filterShow.value = false;
  onRefresh();
};

// Tab切换
const onhandleActiveChange = ({ index }: { index: number }) => {
  activeTab.value = index;
  onRefresh();
};

// 跳转详情
const toDetail = (item: RefundApproveItem, index: number) => {
  rowIndex.value = index;
  const params = {
    fetchdtlId: item.fetchdtlId,
  };
  router.push('/subpackages/business/refund-approve/detail', params);
};

// 页面显示时检查是否需要刷新
onShow(() => {
  if (rowIndex.value !== -1 && appStore.hadDoneOnDetail) {
    removeRow(rowIndex.value);
    rowIndex.value = -1;
    appStore.setHadDoneOnDetail(false);
  }
});

onMounted(() => {
  calcPullRefreshHeight();
  onRefresh();
});
</script>

<style lang="scss" scoped></style>
