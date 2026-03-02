<script setup lang="ts">
/**
 * 冲差管理列表页面
 * 支持未处理、已处理、已审核三种状态的冲差总单管理
 */

import ImpulseFilterPop from './components/impulse-filter-pop.vue';
import ImpulseItem from './components/impulse-item.vue';
import FileItem from './components/file-item.vue';
import { useImpulseList } from './composables/use-impulse-list';

const appStore = useAppStore();

// 使用业务逻辑composable
const {
  active,
  fileShow,
  curFiles,
  formData,
  fetchImpulseList,
  handleFilterChange: handleFilterChangeBase,
  handleActiveChange: handleActiveChangeBase,
  toDetail,
  download,
  _downloadFile,
} = useImpulseList();

const tabList = ref([
  {
    name: '未处理',
    value: 0,
  },
  {
    name: '已处理',
    value: 1,
  },
  {
    name: '已审核',
    value: 2,
  },
]);

// 使用分页 composable（在页面中使用）
const {
  list,
  totalNum: total,
  paginationLoading,
  resetAndFetchData,
  loadMore,
} = useSimplePagination<any>(10);

// 筛选条件变化
const handleFilterChange = (filterVal: any) => {
  handleFilterChangeBase(filterVal, () => resetAndFetchData(fetchImpulseList));
};

// 标签页切换
const handleActiveChange = ({ index }: { index: number }) => {
  active.value = index;
  handleActiveChangeBase(() => resetAndFetchData(fetchImpulseList));
};

// 页面初始化
onMounted(() => {
  resetAndFetchData(fetchImpulseList);
});

onShow(() => {
  if (appStore.hadDoneOnDetail) {
    resetAndFetchData(fetchImpulseList);
    appStore.setHadDoneOnDetail(false);
  }
});

// 上拉加载更多
onReachBottom(() => {
  loadMore(fetchImpulseList);
});
</script>

<template>
  <view class="pb-100">
    <app-watermark> </app-watermark>
    <up-sticky style="top: 0">
      <impulse-filter-pop :formData="formData" @confirm="handleFilterChange" />
      <app-tabs v-model="active" :list="tabList" @change="handleActiveChange"></app-tabs>
    </up-sticky>
    <view class="px-10 pt-10">
      <view v-if="paginationLoading || list.length">
        <ImpulseItem
          class="block mb-2"
          v-for="(item, idx) in list"
          :key="idx"
          :active="active"
          :data="item"
          @click="toDetail(item)"
          @download="download"
        />
        <up-loadmore
          v-if="paginationLoading || list.length < total"
          :status="paginationLoading ? 'loading' : 'loadmore'"
        />
      </view>
      <app-empty
        v-else-if="!paginationLoading && !list.length"
        description="暂无数据"
        class="py-7"
      />
    </view>
    <up-popup :show="fileShow" style="width: 80%">
      <FileItem v-for="item in curFiles" :key="item.index" :data="item" @download="_downloadFile" />
    </up-popup>
  </view>
</template>
