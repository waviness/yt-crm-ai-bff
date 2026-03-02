<template>
  <view class="card-warp mx-2 relative bg-white mt-2">
    <view class="flex justify-between py-4 b-b b-gray-2" style="height: 50%">
      <view class="flex-1 flex flex-col pl-2">
        <text class="text-14 c-gray-4">本月累计</text>
        <text class="text-16 pt-2">{{ salesDataObj.currentMonthMoney }}</text>
      </view>
      <view class="flex-1 flex flex-col pl-2">
        <text class="text-14 c-gray-4">去年同期</text>
        <text class="text-16 color-main-3 pt-2">{{ salesDataObj.lyCurrentMonthMoney }}</text>
      </view>
      <view class="flex-1 flex flex-col pl-2">
        <text class="text-14 c-gray-4">同比增幅</text>
        <text class="text-16 pt-2" :class="getColorClass(salesDataObj.monthPercentage)">
          {{ salesDataObj.monthPercentage }}
        </text>
      </view>
    </view>

    <!-- 下半部分：本年数据 -->
    <view class="flex justify-between py-4" style="height: 50%">
      <view class="flex-1 flex flex-col pl-2">
        <text class="text-14 c-gray-4">本年累计</text>
        <text class="text-16 pt-2">{{ salesDataObj.currentYearMoney }}</text>
      </view>
      <view class="flex-1 flex flex-col pl-2">
        <text class="text-14 c-gray-4">去年同期</text>
        <text class="text-16 color-main-3 pt-2">{{ salesDataObj.lyCurrentYearMoney }}</text>
      </view>
      <view class="flex-1 flex flex-col pl-2">
        <text class="text-14 c-gray-4">同比增幅</text>
        <text class="text-16 pt-2" :class="getColorClass(salesDataObj.yearPercentage)">
          {{ salesDataObj.yearPercentage }}
        </text>
      </view>
    </view>
    <up-loading-icon
      class="position-middle"
      v-if="loading"
      color="rgb(53 97 242)"
      mode="semicircle"
    ></up-loading-icon>
  </view>
</template>

<script setup lang="ts">
import { getColorClass } from '@/utils/number';
// 1. 定义 Props
const props = defineProps({
  salesDataObj: {
    type: Object,
    required: true,
    default: () => ({
      currentMonthMoney: '0',
      lyCurrentMonthMoney: '0',
      monthPercentage: 0,
      currentYearMoney: '0',
      lyCurrentYearMoney: '0',
      yearPercentage: 0,
    }),
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="scss">
.card-warp {
  border-radius: 30px;
  border: 1px solid #e7e7e7;

  .flex-1 {
    text-indent: 20px;
  }
}

.position-middle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
