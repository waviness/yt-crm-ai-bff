<script setup lang="ts">
defineOptions(SHARED_STYLE_OPTIONS);

interface IProps {
  icon: string;
  count?: number;
  bottom?: string | number;
}

const props = withDefaults(defineProps<IProps>(), { bottom: '120rpx' });

// 合并计算样式
const computedStyle = computed(() => {
  const bottom = typeChecker.isNumber(props.bottom) ? `${props.bottom}rpx` : props.bottom;
  return { bottom: `calc(env(safe-area-inset-bottom) + ${bottom})` };
});

defineEmits(['click']);
</script>

<template>
  <view
    class="menu-btn bg-white center color-gray-4"
    :style="computedStyle"
    @click="$emit('click')"
  >
    <app-icon :name="icon" color="#969697" :size="32" />
    <view v-show="count" class="menu-btn--badge">
      <up-badge v-show="count" :value="count || 0" max="99" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.menu-btn {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  position: fixed;
  right: 20rpx;
  z-index: 99;
  box-shadow: 0 0 24rpx 10rpx #d1cfcf80;

  &--badge {
    position: absolute;
    left: 52rpx;
    top: -8rpx;
  }
}

:deep(.up-badge--error) {
  background-color: #ee0a24;
}
</style>
