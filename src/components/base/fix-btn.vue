<script setup lang="ts">
interface IProps {
  text: string;
  icon?: string;
  fontSize?: number;
  bold?: boolean;
}

withDefaults(defineProps<IProps>(), { bold: false, fontSize: 14 });

defineEmits(['click']);
</script>

<template>
  <view
    :class="`fix-btn flex color-white text-${fontSize} h-80 line-height-10 px-5 rounded-10`"
    @click="$emit('click')"
  >
    <app-icon v-if="icon" :name="icon" class="mr-2" />
    <view :class="bold ? 'font-bold' : ''">{{ text }}</view>
  </view>
</template>

<style lang="scss" scoped>
.fix-btn {
  position: fixed;
  bottom: calc(env(safe-area-inset-bottom) + 120rpx);
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  box-shadow: 0 0 12rpx 5rpx #d1cfcf80;
  background: $u-primary;
}
</style>
