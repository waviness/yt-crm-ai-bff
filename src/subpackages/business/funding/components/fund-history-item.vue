<script setup lang="ts">
import type { FundingHistoryData } from '../types';

interface IProps {
  data: FundingHistoryData;
}

const props = defineProps<IProps>();

// 计算修改前合计
const oldTotal = computed(() => {
  return calculateTotal(props.data.oldDhAmount, props.data.oldChAmount);
});

// 计算修改后合计
const newTotal = computed(() => {
  return calculateTotal(props.data.dhAmount, props.data.chAmount);
});
</script>

<template>
  <view>
    <view class="mx-4 my-2">{{ data.creTime }}</view>
    <view>
      <app-cell
        title="修改人"
        :value="`${data.creId}/${data.creName}`"
        value-class="color-black-2"
        border
      />
      <app-cell title="修改原因" :value="data.reason" value-class="color-black-2" />
    </view>
    <view class="color-gray-4 mx-4 my-2">修改前</view>
    <view>
      <app-cell title="电汇(万元)" :value="data.oldDhAmount" value-class="color-black-2" border />
      <app-cell title="承兑(万元)" :value="data.oldChAmount" value-class="color-black-2" border />
      <app-cell title="合计(万元)" :value="oldTotal" value-class="color-black-2" />
    </view>
    <view class="color-gray-4 mx-4 my-2">修改后</view>
    <view>
      <app-cell title="电汇(万元)" :value="data.dhAmount" value-class="color-black-2" border />
      <app-cell title="承兑(万元)" :value="data.chAmount" value-class="color-main" border />
      <app-cell title="合计(万元)" :value="newTotal" value-class="color-main" />
    </view>
  </view>
</template>
