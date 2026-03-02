<template>
  <view>
    <app-watermark> </app-watermark>
    <up-sticky style="top: 0">
      <two-pin-filter-pop
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
        <two-pin-goods-card
          v-for="(item, index) in list"
          :key="index"
          :item="item"
          @toDetail="toDetail(item, index)"
        />
      </view>
    </app-pull-refresh>
  </view>
</template>

<script lang="ts" setup>
import twoPinFilterPop from './components/two-pin-filter-pop.vue';
import twoPinGoodsCard from './components/two-pin-goods-card.vue';
import { useTwoPin } from './composables/use-two-pin';
import type { TwoPinFilterData, TwoPinGoodsItem } from './types';

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
} = useTwoPin();

// 筛选确认
const onFilterConfirm = (data: TwoPinFilterData) => {
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
const toDetail = (item: TwoPinGoodsItem, index: number) => {
  rowIndex.value = index;
  const params = {
    item: JSON.stringify(item),
    index: activeTab.value,
    isSj: true,
  };
  uni.navigateTo({
    url: `/subpackages/business/wms-two-pin-dic/detail?item=${encodeURIComponent(JSON.stringify(item))}&index=${activeTab.value}&isSj=true`,
  });
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
