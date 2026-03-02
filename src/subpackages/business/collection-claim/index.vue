<template>
  <view>
    <app-watermark> </app-watermark>
    <up-sticky style="top: 0">
      <collection-claim-filter-pop
        v-if="initFalg"
        :outerUsestatusString="usestatusString"
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
        <collection-claim-list
          class="mt-2"
          :activeTab="activeTab"
          v-for="(item, index) in list"
          :key="item.accdocid"
          :item="item"
          @toDetail="toDetail(item, index)"
        />
      </view>
    </app-pull-refresh>
  </view>
</template>
<script lang="ts" setup>
import { useCollectionClaim } from './composables/use-collection-claim';
import collectionClaimList from './components/collection-claim-list.vue';
import collectionClaimFilterPop from './components/collection-claim-filter-pop.vue';
import type { CollectionClaimFilterData, CollectionClaimListItem } from './types';
const appStore = useAppStore();
const {
  statusList,
  activeTab,
  filterShow,
  initFalg,
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
  initPermissions,
  usestatusString,
} = useCollectionClaim();
const onhandleActiveChange = ({ index }: { index: number }) => {
  activeTab.value = index;
  onRefresh();
};
const onFilterConfirm = (data: CollectionClaimFilterData) => {
  formData.value = data;
  filterShow.value = false;
  onRefresh();
};
const toDetail = (item: CollectionClaimListItem, index: number) => {
  appStore.setDetailObj(item);
  rowIndex.value = index;
  uni.navigateTo({
    url: '/subpackages/business/collection-claim/detail',
  });
};
onShow(() => {
  if (rowIndex.value !== -1 && appStore.hadDoneOnDetail) {
    removeRow(rowIndex.value);
    rowIndex.value = -1;
    appStore.setHadDoneOnDetail(false);
  }
});
onMounted(() => {
  initPermissions();
  calcPullRefreshHeight();
  onRefresh();
});
</script>
