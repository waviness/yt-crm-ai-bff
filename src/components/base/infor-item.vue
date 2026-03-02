<script setup lang="ts">
interface IProps {
  title?: string;
  content?: number | string;
  contentClass?: string;
  titleWidth?: number;
  hasCopy?: boolean;
}

withDefaults(defineProps<IProps>(), {
  hasCopy: false,
});
</script>

<template>
  <view class="flex justify-between items-baseline">
    <view class="color-gray-4" :style="titleWidth ? `width: ${titleWidth}px` : ''">
      {{ title }}
    </view>
    <view class="flex-1 text-right flex justify-end items-center">
      <view :class="contentClass">{{ content }}</view>
      <up-copy v-if="hasCopy" :content="String(content)">
        <app-icon name="fuzhi" class="color-main ml-1" />
      </up-copy>
    </view>
    <slot></slot>
  </view>
</template>
