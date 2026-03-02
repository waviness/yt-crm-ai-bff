<!-- VBP - 客户详情 -->
<script setup lang="ts">
import { useVbpProjectList } from './composables/use-vbp-project-list';

const { current, list, typeList, handleActiveChange, toDetail, init, onPageShow, formatDate } =
  useVbpProjectList();

const appStore = useAppStore();

onLoad(() => {
  init();
});

onShow(() => {
  onPageShow();
});
</script>

<template>
  <view class="pb-100">
    <app-watermark> </app-watermark>
    <up-sticky style="top: 0">
      <view class="px-10 py-2 text-14 bg-white">
        {{ appStore.detailObj.customId }}/{{ appStore.detailObj.customName }}
      </view>
      <app-tabs :current="current" :list="typeList" @change="handleActiveChange" />
    </up-sticky>
    <up-cell
      v-for="(item, idx) in list"
      :key="idx"
      class="block bg-white mt-2"
      center
      is-link
      @click="() => toDetail(item)"
    >
      <template #title>
        <view class="text-14 color-black-2">{{ item.goodsName }}</view>
      </template>
      <template #label>
        <view class="text-12 color-gray-4 mt-1"
          >生成时间：{{ formatDate(item.creDate || '') }}</view
        >
        <view v-if="item.modifyDate" class="mt-1 text-12 color-gray-4">
          处理时间：{{ formatDate(item.modifyDate || '') }}
        </view>
      </template>
      <template v-if="item.isFinish" #value>
        <up-tag v-if="!current" type="primary" size="mini">已完成</up-tag>
        <up-tag v-else type="success" size="mini">已填报</up-tag>
      </template>
    </up-cell>
  </view>
</template>
