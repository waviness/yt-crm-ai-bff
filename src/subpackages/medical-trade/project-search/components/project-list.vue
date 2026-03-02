<template>
  <view class="card pa-3 mb-2 rd-md" bg="white" @click="toDetail">
    <view class="flex justify-between items-center mb-2">
      <text class="text-12">{{ item.projectName }}</text>
      <view class="tag-primary">{{ item.projectTypeName }}</view>
    </view>
    <view class="flex justify-between items-center mb-2">
      <text class="text-12">已关联品种</text>
      <text class="font-bold color-main text-16">{{ item.projectGoodsResList?.length || 0 }}</text>
    </view>
    <view class="flex justify-between items-center">
      <text class="text-12">业务员数</text>
      <text class="font-bold color-success text-16">{{
        item.projectUserResList?.length || 0
      }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { ProjectItem } from '../types';

interface Props {
  item: ProjectItem;
}

const props = defineProps<Props>();
const emit = defineEmits(['toDetail']);

const toDetail = () => {
  emit('toDetail');
};
</script>

<style lang="scss" scoped>
.card {
  box-shadow: 0 2rpx 12rpx 2rpx rgb(209 207 207 / 30%);
}

.tag-primary {
  padding: 6rpx 16rpx;
  border-radius: 4rpx;
  background: rgb(34 113 245 / 10%);
  color: #2271f5;
  font-size: 24rpx;
  line-height: 1;
}

.color-success {
  color: #19be6b;
}
</style>
