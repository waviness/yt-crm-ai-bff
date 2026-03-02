<script setup lang="ts">
interface IProps {
  title?: string;
  value?: string;
  color?: string;
}

withDefaults(defineProps<IProps>(), {
  title: '',
  value: '',
  color: 'color-black-2',
});
</script>

<template>
  <view class="flex items-center slh">
    <view class="w-96 color-gray-4">{{ title }}</view>
    <view :class="['ml-4 flex-1 slh', color]">{{ value }}</view>
  </view>
</template>
