<script setup lang="ts">
interface IProps {
  presentText: string;
  nextText: string;
}

defineProps<IProps>();
</script>

<template>
  <view class="w-520rpx text-center text-12 color-gray-4 line-height-36rpx p-10 mx-auto my-3">
    <view>{{ presentText }}</view>
    <view>{{ nextText }}</view>
  </view>
</template>
