<template>
  <view v-for="item in list" :key="item.cugId" class="mb-2">
    <up-swipe-action>
      <up-swipe-action-item :options="options" @click="(val: any) => handleClick(val, item)">
        <view class="white-block pa-2 rounded">
          <view class="font-bold text-14">
            {{ item.goodsId ? `${item.goodsId}/${item.goodsName}` : '' }}
          </view>
          <view class="flex justify-between items-baseline mt-2">
            <view class="color-gray text-12">加入前6个月销售额</view>
            <view class="font-bold text-14">{{ item.saleBefore || 0 }}</view>
          </view>
          <view class="flex justify-between items-baseline mt-2">
            <view class="color-gray text-12">本年累计销售额</view>
            <view class="font-bold text-14 color-main">{{ item.saleAllYear || 0 }}</view>
          </view>
          <view class="flex justify-between items-baseline mt-2">
            <view class="color-gray text-12">
              加入之日（{{ item.creTime ? formatDate(item.creTime.split(' ')[0]) : '' }}）起销售额
            </view>
            <view class="font-bold text-14 color-main">{{ item.saleNow || 0 }}</view>
          </view>
        </view>
      </up-swipe-action-item>
    </up-swipe-action>
  </view>
</template>

<script lang="ts" setup>
import type { GoodsItem } from '../types';

defineProps<{
  list: GoodsItem[];
}>();

const emit = defineEmits<{
  delete: [type: number, item: GoodsItem];
}>();

const options = [
  {
    text: '删除',
    style: {
      backgroundColor: '#ee0a24',
    },
  },
];

const formatDate = (date: string) => {
  if (!date) return '';
  return `${date.split('-')[0]}年${date.split('-')[1]}月`;
};

const handleClick = ({ index }: { index: number }, item: GoodsItem) => {
  if (index === 0) {
    emit('delete', 3, item);
  }
};
</script>

<style lang="scss" scoped>
.white-block {
  background: #fff;
}
.rounded {
  border-radius: 8px;
}
</style>
