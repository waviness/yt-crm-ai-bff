<script setup lang="ts">
import { useHighValueList } from '../composables/use-high-value-list';
import CardDetail from '../components/card-detail.vue';
import HighValueFilterPop from '../components/high-value-filter-pop.vue';

defineOptions(SHARED_STYLE_OPTIONS);

const {
  filterShow,
  statusList,
  activeTab,
  formData,
  userIdLists,
  list,
  refreshing,
  loadmoreConfig,
  pullRefreshHeight,
  onRefresh,
  onLoadMore,
  calcPullRefreshHeight,
  removeRow,
  onFilterConfirm,
  onhandleActiveChange,
  showDetail,
  showRelatedButton,
  checkPermissions,
  isJustSelf,
  justSelfClick,
} = useHighValueList('info');

onMounted(() => {
  checkPermissions(); // 检查权限
  calcPullRefreshHeight();
  onRefresh();
});

onShow(() => {
  checkPermissions(); // 检查权限
  const appStore = useAppStore();
  if (appStore.hadDoneOnDetail) {
    onRefresh();
    appStore.setHadDoneOnDetail(false);
  }
});
</script>

<template>
  <view>
    <app-watermark></app-watermark>
    <up-sticky style="top: 0">
      <high-value-filter-pop
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
        <card-detail
          v-for="(item, index) in list"
          :key="index"
          :info="item"
          @click="showDetail(item)"
        />
        <app-empty v-if="!refreshing && !list.length" description="暂无数据" />
      </view>
    </app-pull-refresh>
    <!-- 底部按钮：显示与我相关/显示全部 -->
    <app-bottom-actions v-if="showRelatedButton">
      <app-action-btn
        class="shadow-btn w-240 mx-auto"
        type="primary"
        :text="isJustSelf ? '显示全部' : '显示与我相关'"
        @click="justSelfClick"
      />
    </app-bottom-actions>
  </view>
</template>
