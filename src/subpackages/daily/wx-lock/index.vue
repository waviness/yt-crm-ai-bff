<script setup lang="ts">
import { useWxLockIndex } from './composables/use-wx-lock-index';
import LockItem from './components/lock-item.vue';
import FilterPop from './components/filter-pop.vue';

defineOptions(SHARED_STYLE_OPTIONS);

const {
  list,
  refreshing,
  loadmoreConfig,
  pullRefreshHeight,
  formData,
  entryList,
  getEntryList,
  onFilterChange,
  onRefresh,
  onLoadMore,
  calcPullRefreshHeight,
  toDetail,
} = useWxLockIndex();

onMounted(() => {
  calcPullRefreshHeight();
  getEntryList();
  onRefresh();
});
</script>

<template>
  <view class="pb-50">
    <app-watermark></app-watermark>
    <up-sticky style="top: 0">
      <filter-pop :formData="formData" :entryList="entryList" @confirm="onFilterChange" />
    </up-sticky>
    <app-pull-refresh
      :refreshing="refreshing"
      :pullRefreshHeight="pullRefreshHeight"
      :showLoadmore="true"
      :loadmoreProps="loadmoreConfig"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <lock-item
        v-for="(item, idx) in list"
        :key="idx"
        class="mt-2"
        :data="item"
        @click="toDetail(item)"
      />
    </app-pull-refresh>
  </view>
</template>

<style scoped></style>
