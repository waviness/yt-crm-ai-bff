<script setup lang="ts">
interface IProps {
  description?: string;
  size?: string;
}

withDefaults(defineProps<IProps>(), { size: '324rpx' });
</script>

<template>
  <view class="flex flex-col items-center">
    <app-icon name="shoujiquesheng" :size="size" multi />
    <view class="text-14 color-gray-7">{{ description }}</view>
  </view>
</template>
