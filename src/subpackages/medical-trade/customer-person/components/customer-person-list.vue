<template>
  <view class="card pa-2 mb-2 rd-md" bg="white">
    <view class="flex justify-between items-start mb-2">
      <view class="font-bold text-14 flex-1">
        <view>{{ item.szymCustomerId }}/</view>
        <view>{{ item.customerName?.split('/')[0] || '' }}</view>
      </view>
      <view class="flex flex-col items-end ml-4">
        <text class="tag-primary-plain mb-2">
          {{ item.sourceType === 0 ? '拓展客户' : '业务系统内客户' }}
        </text>
        <text :class="item.customerTypeName ? 'tag-primary-plain' : 'tag-text-plain'">
          {{ item.customerTypeName || '未维护' }}
        </text>
      </view>
    </view>
    <view class="color-gray-5 pb-2">{{ item.registerAddress }}</view>
    <view class="flex justify-between pb-2">
      <view v-if="item.relCustomerId" class="text-12 color-normal">
        已关联至{{ item.relCustomerId }}/{{ item.relCustomerName || '--' }}
      </view>
      <view v-else class="color-gray-7">暂未关联业务系统内客户</view>
      <view>
        <text>维护人：</text>
        <text>{{ item.operateName }}</text>
      </view>
    </view>
    <view class="flex justify-between pa-2">
      <view>客户人员数</view>
      <view class="font-bold color-main text-16">{{ item.customerStaffNum }}</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { CustomerPersonItem } from '../types';

interface Props {
  item: CustomerPersonItem;
}

defineProps<Props>();
</script>

<style lang="scss" scoped>
.card {
  box-shadow: 0 1px 6px 1px rgb(209 207 207 / 30%);
}
</style>
