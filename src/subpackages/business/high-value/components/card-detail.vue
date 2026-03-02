<script setup lang="ts">
defineOptions(SHARED_STYLE_OPTIONS);

interface IProps {
  info: any;
}

defineProps<IProps>();

const emit = defineEmits(['click']);

const onClick = () => {
  emit('click');
};
</script>

<template>
  <view class="bg-white mb-2 px-3 py-4 text-12 rounded-10rpx" @click="onClick">
    <view class="flex items-center justify-between mb-2">
      <view class="px-1 bg-main-1 color-main rounded-1 tag-blue">
        {{ info.entryId }}/{{ info.entryName }}
      </view>
    </view>
    <view class="flex items-center justify-between mb-2">
      <text class="color-gray-5 w-220rpx">客户</text>
      <text class="flex-1 text-right">{{ info.customerId }}/{{ info.customerName }}</text>
    </view>
    <view class="flex items-center justify-between mb-2">
      <text class="color-gray-5 w-220rpx">分支机构</text>
      <text class="flex-1 text-right">{{
        info.contactId ? info.contactId + '/' + info.contactName : '-'
      }}</text>
    </view>
    <view class="flex items-center justify-between mb-2">
      <text class="color-gray-5 w-220rpx">品种</text>
      <text class="flex-1 text-right">{{ info.goodsId }}/{{ info.goodsName }}</text>
    </view>
    <view class="flex items-center justify-between">
      <text class="color-gray-5 w-220rpx">上次销售时间</text>
      <text class="flex-1 text-right">{{ info.lastSaleDate }}</text>
    </view>
  </view>
</template>

<style scoped>
.tag-blue {
  display: inline-block;
  padding: 4rpx 12rpx;
  font-size: 24rpx;
  color: #2271f5;
  background: #e8f3ff;
  border-radius: 4rpx;
}
</style>
