<template>
  <view>
    <app-watermark></app-watermark>
    <up-sticky style="top: 0">
      <quality-review-filter-pop
        v-model:filterShow="filterShow"
        :formData="formData"
        :isJustSelf="isJustSelf"
        :needQueryAll="needQueryAll"
        :needQueryAllEntrys="needQueryAllEntrys"
        @confirm="onFilterConfirm"
        @reset="onFilterReset"
      />
      <app-tabs :list="statusList" :active="activeTab" @change="onhandleActiveChange" />
      <view class="pa-2 bg-white text-12">
        当前{{ activeTab === 0 ? '待处理' : '已处理' }}
        <text class="color-main">{{ total }}</text> 项
      </view>
    </up-sticky>
    <app-pull-refresh
      :refreshing="refreshing"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <view class="pa-2">
        <quality-review-list
          v-for="(item, index) in list"
          :key="item.recheckId"
          :item="item"
          :selectType="activeTab"
          :buttonShow="buttonShow"
          @toDetail="toDetail(item, index)"
        />
      </view>
    </app-pull-refresh>
    <app-fix-btn
      v-if="needQueryAll || needQueryAllEntrys"
      :text="isJustSelf ? '显示全部' : '显示与我相关'"
      @click="toggleJustSelf"
    ></app-fix-btn>
  </view>
</template>

<script lang="ts" setup>
import qualityReviewFilterPop from './components/quality-review-filter-pop.vue';
import qualityReviewList from './components/quality-review-list.vue';
import { useQualityReview } from './composables/use-quality-review';
import type { QualityReviewFilterData, QualityReviewItem } from './types';

const appStore = useAppStore();

const {
  filterShow,
  statusList,
  activeTab,
  formData,
  isJustSelf,
  rowIndex,
  needQueryAll,
  needQueryAllEntrys,
  needQueryAllDept,
  list,
  refreshing,
  loadmoreConfig,
  pullRefreshHeight,
  total,
  onRefresh,
  onLoadMore,
  calcPullRefreshHeight,
  removeRow,
  permissInit,
} = useQualityReview();

// 是否显示按钮
const buttonShow = computed(() => {
  return (!needQueryAll.value && !needQueryAllEntrys.value) || isJustSelf.value;
});

const onFilterConfirm = (data: QualityReviewFilterData) => {
  formData.value = data;
  filterShow.value = false;
  onRefresh();
};

const onFilterReset = () => {
  formData.value = {
    time: '',
    startTime: '',
    endTime: '',
    customId: '',
    customName: '',
    goodsKey: '',
  };
  onRefresh();
};

const onhandleActiveChange = ({ index }: { index: number }) => {
  activeTab.value = index;
  onRefresh();
};

const toDetail = (item: QualityReviewItem, index: number) => {
  rowIndex.value = index;
  router.push('/subpackages/compliance/quality-review/detail', {
    recheckId: item.recheckId,
  });
};

const toggleJustSelf = () => {
  isJustSelf.value = !isJustSelf.value;
  onRefresh();
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

<style scoped></style>
