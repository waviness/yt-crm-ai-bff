<script setup lang="ts">
interface IProps {
  /** 是否显示loading */
  show?: boolean;
  /** loading文本 */
  text?: string;
  /** 文本大小 */
  textSize?: string | number;
  /** 背景色，默认透明灰色 */
  bgColor?: string;
  /** loading图标模式 */
  mode?: 'circle' | 'spinner' | 'semicircle';
  /** z-index层级 */
  zIndex?: number;
}

withDefaults(defineProps<IProps>(), {
  show: false,
  text: '加载中...',
  textSize: 14,
  bgColor: 'bg-gray-100',
  mode: 'circle',
  zIndex: 20,
});
</script>

<template>
  <view
    v-if="show"
    :class="['absolute inset-0 flex items-center justify-center', bgColor]"
    :style="{ zIndex }"
  >
    <up-loading-icon :mode="mode" :text="text" :textSize="textSize" />
  </view>
</template>
