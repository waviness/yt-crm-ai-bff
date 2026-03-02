<template>
  <view class="card pa-2 mb-2 rd-md flex flex-col bg-white" @click="toDetail">
    <view class="flex justify-between mb-2">
      <text>#{{ item.recDtlId }}</text>
      <text class="color-gray-4">{{ item.creDate && item.creDate.substring(0, 10) }}</text>
    </view>
    <view class="flex justify-between mb-2">
      <text>{{ item.customId }}/{{ item.customName.split('/')[0] }}</text>
      <text class="text-12 color-gray-5">核算单元 {{ item.entryId }}</text>
    </view>
    <view class="flex justify-between mb-2">
      <text class="color-gray-5">{{ item.goodsId }}/{{ item.goodsName }}</text>
      <text class="color-main font-bold">{{ getRecLevelText }}</text>
    </view>
    <view class="mb-2">
      <text class="color-main">{{ item.goodsType }}/{{ item.goodsUnit }}</text>
    </view>
    <view class="flex justify-between mb-2">
      <text class="text-12"
        >召回截至日期：{{ item.deadline && item.deadline.substring(0, 16) }}</text
      >
      <view v-if="item.toDeadlineDays && selectType === 0">
        <view :class="getDeadlineClass">
          {{ getDeadlineText }}
        </view>
      </view>
    </view>
    <view class="flex justify-end pt-2" v-if="selectType === 0 && buttonShow">
      <up-button
        text="立即处理"
        type="primary"
        size="small"
        shape="circle"
        :customStyle="{ width: '160rpx', height: '56rpx' }"
        @click.stop="toDetail"
      ></up-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { QualityRecallItem } from '../types';

interface Props {
  item: QualityRecallItem;
  selectType: number;
  buttonShow: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['toDetail']);

const getRecLevelText = computed(() => {
  const { recLevel } = props.item;
  return recLevel === 3 ? '三级' : recLevel === 2 ? '二级' : recLevel === 1 ? '一级' : '';
});

const getDeadlineClass = computed(() => {
  if (!props.item.toDeadlineDays) return '';
  return props.item.toDeadlineDays < 0 ? 'tag-red' : 'tag-green';
});

const getDeadlineText = computed(() => {
  if (!props.item.toDeadlineDays) return '';
  const days = Math.abs(props.item.toDeadlineDays);
  return props.item.toDeadlineDays < 0 ? `已过期${days}天` : `距到期还剩${days}天`;
});

const toDetail = () => {
  emit('toDetail');
};
</script>

<style lang="scss" scoped>
.card {
  box-shadow: 0 1px 6px 1px rgb(209 207 207 / 30%);
}

.tag-green {
  display: inline-block;
  padding: 4rpx 12rpx;
  font-size: 24rpx;
  color: #00a870;
  background: rgb(0 168 112 / 10%);
  border-radius: 4rpx;
}

.tag-red {
  display: inline-block;
  padding: 4rpx 12rpx;
  font-size: 24rpx;
  color: #e34d59;
  background: rgb(227 77 89 / 10%);
  border-radius: 4rpx;
}
</style>
