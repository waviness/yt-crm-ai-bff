<template>
  <view v-if="totalObj.thirtyDaysAmount1st || totalObj.thirtyDaysAmount1st === 0" class="py-2 px-4">
    <text class="color-main text-14">{{ title }}</text>
    <view class="flex justify-between pt-2">
      <view class="flex flex-col">
        <text class="text-14">近30天</text>
        <text class="text-16 font-500">{{ totalObj.thirtyDaysAmount1st }}万</text>
      </view>
      <view class="flex flex-col">
        <text class="text-14">近31-60天</text>
        <text class="text-16 font-500">{{ totalObj.thirtyDaysAmount2nd }}万</text>
      </view>
      <view class="flex flex-col">
        <text class="text-14">近61-90天</text>
        <text class="text-16 font-500">{{ totalObj.thirtyDaysAmount3rd }}万</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { LoseTotalData } from '../../types';
interface IProps {
  totalObj: LoseTotalData;
  title: string;
}
defineProps<IProps>();
</script>

<style lang="scss" scoped></style>
