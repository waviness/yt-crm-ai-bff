<script setup lang="ts">
import NextWatermark from '@/uni_modules/next-watermark/components/next-watermark/next-watermark.vue';

defineOptions(SHARED_STYLE_OPTIONS);

const userStore = useUserStore();

interface IProps {
  watermark?: string;
  fontSize?: number;
  column?: number;
  margin?: number;
  opacity?: number;
  zIndex?: number;
}

const props = withDefaults(defineProps<IProps>(), {
  fontSize: 18,
  column: 2,
  margin: 175,
  opacity: 0.1,
  zIndex: 300,
});

// 计算最终水印文本（优先使用 props，其次使用 store，最后使用默认值）
const finalWatermark = computed(() => {
  return props.watermark || userStore.watermark || '登录失效';
});
</script>

<template>
  <next-watermark
    :watermark="finalWatermark"
    :fontSize="fontSize"
    :column="column"
    :margin="margin"
    :opacity="opacity"
  />
</template>

<style scoped>
:deep(.next-watermark-box) {
  z-index: v-bind(zIndex) !important;
  top: 0 !important;
}
</style>
