<template>
  <view
    class="customer-follow-card"
    @click="handleClick"
    style="
      background: white;
      margin-bottom: 20rpx;
      padding: 20rpx;
      border-radius: 10rpx;
      box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
    "
  >
    <view style="display: flex; margin-top: 20rpx">
      <view style="flex: 5; display: flex; flex-direction: column">
        <text style="font-size: 28rpx; font-weight: bold">{{
          item.customerName?.split('/')[0] || '无客户名'
        }}</text>
        <text v-if="item.relCustomerId" style="color: #666; margin-top: 10rpx">
          已关联至{{ item.relCustomerId }}/{{ item.relCustomerName }}
        </text>
        <text v-else style="color: #999; margin-top: 10rpx">暂未关联至业务系统内客户</text>
      </view>

      <view style="flex: 3; display: flex; flex-direction: column; align-items: flex-end">
        <text style="margin-bottom: 10rpx">{{ item.createTime }}</text>
        <view
          v-if="item.sourceType === 0 || item.sourceType === 1"
          style="margin-bottom: 10rpx; padding: 5rpx 15rpx; border-radius: 5rpx; font-size: 24rpx"
          :style="{
            color: item.sourceType === 0 ? '#2271f5' : '#333',
            background: item.sourceType === 0 ? 'rgba(34, 113, 245, 0.1)' : '#f5f5f5',
          }"
        >
          {{ item.sourceType === 0 ? '拓展客户' : '业务系统内客户' }}
        </view>
        <view
          v-if="item.customerTypeName"
          style="
            padding: 5rpx 15rpx;
            border-radius: 5rpx;
            font-size: 24rpx;
            color: #2271f5;
            background: rgba(34, 113, 245, 0.1);
          "
        >
          {{ item.customerTypeName }}
        </view>
      </view>
    </view>

    <view style="margin-top: 20rpx">
      <text style="font-size: 28rpx; padding: 10rpx 0">{{ item.visitUserName }}</text>
      <view
        v-if="item.szymLabelRemarkDOResList && item.szymLabelRemarkDOResList.length"
        style="
          padding: 20rpx;
          background: #f5f6f9;
          display: flex;
          justify-content: space-between;
          border-radius: 5rpx;
          margin-top: 10rpx;
        "
      >
        <text>已维护客情事件</text>
        <text style="font-weight: bold; color: #2271f5; font-size: 32rpx">{{
          item.szymLabelRemarkDOResList.length
        }}</text>
      </view>
      <view
        v-else
        style="
          color: #999;
          background: #f5f6f9;
          padding: 20rpx;
          border-radius: 5rpx;
          margin-top: 10rpx;
        "
      >
        暂无客情事件
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { CustomerFollowItem } from '../types';

interface Props {
  item: CustomerFollowItem;
}

interface Emits {
  (e: 'click'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const handleClick = () => {
  emit('click');
};
</script>

<style lang="scss" scoped>
.customer-follow-card {
  // 使用内联样式，这里只做备用
}
</style>
