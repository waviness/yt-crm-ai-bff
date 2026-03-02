<template>
  <view class="event-item flex-1">
    <view class="flex items-center mb-1">
      <up-icon :name="icon" :color="color" size="40rpx"></up-icon>
      <text class="ml-2 text-12 color-gray-5">{{ label }}</text>
    </view>
    <text class="event-value font-bold text-18" :style="{ color }">{{ value }}</text>
  </view>
</template>

<script lang="ts" setup>
interface Props {
  icon: string;
  color: string;
  label: string;
  value: number;
}

defineProps<Props>();
</script>

<style lang="scss" scoped>
.event-item {
  display: flex;
  flex-direction: column;
}

.event-value {
  margin-left: 54rpx;
}
</style>
