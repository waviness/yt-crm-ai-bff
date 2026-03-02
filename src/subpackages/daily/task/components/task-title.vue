<script setup lang="ts">
interface IProps {
  title?: string;
}

withDefaults(defineProps<IProps>(), {
  title: '',
});
</script>

<template>
  <view class="px-10 py-2 flex items-center justify-between">
    <view class="flex items-center color-gray-4">
      <view class="w-5 h-20 bg-main-3 mr-12rpx"></view>
      <text>{{ title }}</text>
    </view>
    <slot />
  </view>
</template>
