<template>
  <view v-for="(data, index) in list" @click="goodsClick(data)" :key="index" class="border-b pb-10">
    <view class="flex justify-between items-center py-10 text-14 text-gray-500">
      <text :class="data.arrowFlag ? 'color-main-3' : ''">{{ data.objId }}/{{ data.objName }}</text>
      <view class="flex">
        <text class="min-w-100px" v-if="data.areaText">地区:{{ data.areaText }}</text>
        <up-icon v-if="data.arrowFlag" name="arrow-right" size="16" />
      </view>
    </view>
    <view class="flex justify-between pb-10">
      <view class="flex-1 flex flex-col">
        <text class="text-14 text-gray-400">
          {{ salesTabValue === 1 ? '销售实绩' : '销售数量' }}
        </text>
        <text class="text-16 text-gray-500 pt-1">{{ data.value }}</text>
      </view>
      <view class="flex-1 flex flex-col">
        <text class="text-14 text-gray-400">较同期净增</text>
        <text class="text-16 pt-1" :class="getColorClass(data.yearNetIncrease)">
          {{ data.yearNetIncrease }}
        </text>
      </view>
      <view class="flex flex-col pl-2">
        <text class="text-14 text-gray-400">同比增幅</text>
        <text class="text-16 pt-1" :class="getColorClass(data.increment)">
          {{ data.increment }}
        </text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { getColorClass } from '@/utils/number';
interface Props {
  list: readonly any[];
  statusActive: number;
  salesTabValue: number;
}

defineProps<Props>();
const emit = defineEmits(['goodsClick']);
const goodsClick = (data: any) => {
  if (!data.arrowFlag) {
    return;
  }
  emit('goodsClick', data);
};
</script>

<style lang="scss" scoped>
.border-b {
  border-bottom: 1px solid #ebedf0;
}
</style>
