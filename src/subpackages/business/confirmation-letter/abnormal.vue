<template>
  <view>
    <app-watermark> </app-watermark>
    <up-sticky style="top: 0">
      <abnormal-filter-pop
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
        <abnormal-list
          @detailClick="detailClick(item, index)"
          class="mb-2"
          v-for="(item, index) in list"
          :key="index"
          :item="item"
        />
        <app-empty v-show="!list.length && !refreshing" class="py-7" description="暂无数据" />
      </view>
    </app-pull-refresh>
  </view>
</template>

<script lang="ts" setup>
import { useAbnormal } from './composables/use-abnormal';
import abnormalList from './components/abnormal-list.vue';
import abnormalFilterPop from './components/abnormal-filter-pop.vue';
// 使用业务逻辑组合式API
const {
  role,
  filterShow,
  statusList,
  activeTab,
  formData,
  list,
  listIndex,
  refreshing,
  loadmoreConfig,
  pullRefreshHeight,
  onRefresh,
  onLoadMore,
  removeRow,
  calcPullRefreshHeight,
  onFilterConfirm,
  onhandleActiveChange,
  detailClick,
} = useAbnormal();
onShow(() => {
  if (listIndex.value !== -1) {
    removeRow(listIndex.value);
    listIndex.value = -1;
  }
});
onLoad(async options => {
  const decodedOpts = options ? decodeObjectValues(options) : {};
  role.value = +(decodedOpts?.role || 0);
  await calcPullRefreshHeight();
  onRefresh();
});
</script>

<style lang="scss" scoped>
.sticky-header {
  background-color: white;
  position: sticky;
  top: 0;
}
</style>
