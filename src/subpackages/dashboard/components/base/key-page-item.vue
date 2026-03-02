<template>
  <view
    class="bg-white px-4 py-2"
    :class="lineShow ? 'item-line' : ''"
    v-for="(data, index) in dataList"
    :key="index"
    @click="toDetail(data)"
  >
    <view class="color-gray-5 font-500 text-16 flex align-center justify-between">
      <text>{{ data.objId }}/{{ data.objName }}</text>
      <u-icon name="arrow-right" size="16" />
    </view>

    <view class="flex pt-2" :class="itemType === 1 ? '' : 'justify-between'">
      <view :class="itemType === 1 ? 'flex-3' : ''" class="flex flex-col">
        <text class="color-gray-4 text-14"
          >{{ yearMounthValue === 0 ? '月' : '年' }}销售额(万元)</text
        >
        <text class="font-500 color-gray-5 text-16">{{ data.salesAmount }}</text>
      </view>
      <view :class="itemType === 1 ? 'flex-2' : ''" class="flex flex-col">
        <text class="color-gray-4 text-14">{{ yearMounthValue === 0 ? '月' : '年' }}同比</text>
        <text
          class="font-500 color-main-2 text-16"
          :class="getColorClass(data.periodComparePercent)"
        >
          {{ data.periodComparePercent }}
        </text>
      </view>
      <view
        :class="itemType === 1 ? 'flex-2' : ''"
        class="flex flex-col"
        v-if="yearMounthValue === 1"
      >
        <text class="color-gray-4 text-14">年贡献率</text>
        <text class="font-500 color-main text-16">{{ data.salesAmountRatio }}</text>
      </view>
      <view
        :class="itemType === 1 ? 'flex-2' : ''"
        class="flex justify-end"
        v-if="yearMounthValue === 0"
      >
        <view class="flex flex-col" style="width: fit-content">
          <text class="color-gray-4 text-14">月贡献率</text>
          <text class="font-500 color-main text-16">{{ data.salesAmountRatio }}</text>
        </view>
      </view>
      <view class="flex flex-col" v-if="yearMounthValue === 0 && itemType === 2">
        <text class="color-gray-4 text-14">月环比</text>
        <text class="font-500 text-16" :class="getColorClass(data.monthComparePercent)">
          {{ data.monthComparePercent }}
        </text>
      </view>
    </view>

    <view class="flex pt-2" v-if="yearMounthValue === 0 && itemType === 1">
      <view class="flex-3 flex flex-col">
        <text class="color-gray-4 text-14">月环比</text>
        <text class="font-500 text-16" :class="getColorClass(data.monthComparePercent)">
          {{ data.monthComparePercent }}
        </text>
      </view>
      <view class="flex-2 flex flex-col">
        <text class="color-gray-4 text-14">近30天拜访</text>
        <text class="font-500 text-16">{{ data.visitNum }}</text>
      </view>
      <view class="flex-2"></view>
    </view>
  </view>
</template>
<script setup lang="ts">
import { getColorClass } from '@/utils/number';
interface Props {
  dataList: any;
  yearMounthValue: number;
  itemType: number;
  lineShow: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  toDetail: [data: any];
}>();
const toDetail = (data: any) => {
  console.log('data', data);
  emit('toDetail', data);
};
</script>

<style lang="scss" scoped>
.item-line {
  border-bottom: 1px solid #e5e7eb;
}
</style>
