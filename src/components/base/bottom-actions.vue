<!--
  底部操作按钮容器组件
  用于管理底部按钮的布局和定位，支持不同数量的按钮
  
  使用示例：
  - 单个按钮：<app-bottom-actions :count="1"><app-action-btn text="确认" /></app-bottom-actions>
  - 两个按钮：<app-bottom-actions :count="2"><app-action-btn text="取消" /><app-action-btn text="确认" /></app-bottom-actions>
  - 三个按钮：<app-bottom-actions :count="3"><app-action-btn text="取消" /><app-action-btn text="保存" /><app-action-btn text="提交" /></app-bottom-actions>
  - 非固定定位：<app-bottom-actions :count="2" :fixed="false">...</app-bottom-actions>
  
  Props:
  - count: 按钮数量 (1 | 2 | 3)，影响间距布局
  - fixed: 是否固定定位，默认 true
  
  Slots:
  - default: 按钮内容
-->
<script setup lang="ts">
interface IProps {
  /** 按钮数量，影响布局 */
  count?: 1 | 2 | 3;
  /** 是否固定定位 */
  fixed?: boolean;
}

withDefaults(defineProps<IProps>(), {
  count: 2,
  fixed: true,
});

defineSlots<{
  default(): any;
}>();
</script>

<template>
  <view
    :class="[
      'bottom-actions',
      {
        fixed: fixed,
        'flex gap-3': count === 2,
        'flex gap-2': count === 3,
        'flex-1': count === 1,
      },
    ]"
  >
    <slot />
  </view>
</template>

<style lang="scss" scoped>
.bottom-actions.fixed {
  position: fixed;
  bottom: calc(env(safe-area-inset-bottom) + 120rpx);
  left: 0;
  right: 0;
  padding: 0 32rpx;
  z-index: 10;
}
</style>
