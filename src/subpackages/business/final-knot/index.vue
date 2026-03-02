<template>
  <view>
    <app-watermark> </app-watermark>
    <up-sticky style="top: 0">
      <final-knot-filter-pop
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
        <final-knot-list
          v-for="(item, index) in list"
          :key="item.zdId"
          :item="item"
          @toDetail="toDetail(item, index)"
        />
      </view>
    </app-pull-refresh>
    <fix-btn text="新增" />
  </view>
</template>

<script lang="ts" setup>
import finalKnotFilterPop from './components/final-knot-filter-pop.vue';
import finalKnotList from './components/final-knot-list.vue';
import { useFinalKnot } from './composables/use-final-knot';
import type { FinalKnotFilterData, FinalKnotItem } from './types';
const appStore = useAppStore();
const {
  filterShow,
  statusList,
  activeTab,
  formData,
  isJustSelf,
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
} = useFinalKnot();
const onFilterConfirm = (data: FinalKnotFilterData) => {
  formData.value = data;
  filterShow.value = false;
  onRefresh();
};
const onhandleActiveChange = ({ index }: { index: number }) => {
  activeTab.value = index;
  onRefresh();
};
const toDetail = (item: FinalKnotItem, index: number) => {
  rowIndex.value = index;
  const params = {
    zdId: item.zdId,
    selectType: isJustSelf.value ? 0 : 3,
    statusDtl: activeTab.value,
  };
  router.push('/subpackages/business/final-knot/detail', params);
};
onShow(() => {
  if (rowIndex.value !== -1 && appStore.hadDoneOnDetail) {
    removeRow(rowIndex.value);
    rowIndex.value = -1;
    appStore.setHadDoneOnDetail(false);
  }
});
onMounted(() => {
  permissInit();
  calcPullRefreshHeight();
  onRefresh();
});
</script>

<style lang="scss" scoped></style>
