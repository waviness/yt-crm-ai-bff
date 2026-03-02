<script setup lang="ts">
import { useTwoVoteReminderIndex } from './composables/use-two-vote-reminder-index';
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
  totalCount,
  getEntryList,
  onFilterChange,
  onRefresh,
  onLoadMore,
  calcPullRefreshHeight,
} = useTwoVoteReminderIndex();

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
    <view class="page-title">
      您有{{ totalCount }}条两票制订单未上传发票
      <text class="date-range">（{{ formData.start }} 至 {{ formData.end }}）</text>
    </view>
    <app-pull-refresh
      :refreshing="refreshing"
      :pullRefreshHeight="pullRefreshHeight"
      :showLoadmore="true"
      :loadmoreProps="loadmoreConfig"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <lock-item v-for="(item, idx) in list" :key="idx" class="reminder-card" :data="item" />
    </app-pull-refresh>
  </view>
</template>

<style scoped>
.page-title {
  padding: 12px 16px;
  font-size: 14px;
  background-color: #fff;
}

.date-range {
  color: #666;
}

.reminder-card {
  margin: 0px 10px 8px 10px;
  border-radius: 10px;
}
</style>
