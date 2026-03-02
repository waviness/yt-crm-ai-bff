<script setup lang="ts">
interface IProps {
  name: string;
  size?: string | number;
  color?: string;
  fill?: string;
  inheritColor?: boolean;
  customClass?: string;
  customStyle?: Record<string, string>;
  multi?: boolean;
}

const props = withDefaults(defineProps<IProps>(), { size: '1em' });

// 合并计算样式
const computedStyle = computed(() => {
  const size = typeChecker.isNumber(props.size) ? `${props.size}rpx` : props.size;

  return {
    width: size,
    height: size,
    fontSize: size,
    ...(props.color ? { color: props.color } : {}), // 同步设置color便于继承
    ...props.customStyle,
  };
});

const emit = defineEmits<{
  (e: 'click'): void;
}>();
</script>

<template>
  <view
    v-if="multi"
    :class="`ytcrm-phone ytcrm-phone-${name}`"
    :style="computedStyle"
    @click="$emit('click')"
  ></view>
  <view v-else :class="`ytcrm ytcrm-${name}`" :style="computedStyle" @click="$emit('click')"></view>
</template>
