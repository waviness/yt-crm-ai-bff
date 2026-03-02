<script setup lang="ts">
/**
 * 基础页面组件
 * 提供页面通用布局，包括水印、底部导航栏和更新日志弹窗
 */

const authStore = useAuthStore();

/**
 * 处理更新日志确认
 * 标记更新日志为已读
 */
const handleUpdateLogConfirm = (): void => {
  authStore.markUpdateLogAsRead();
};
</script>

<template>
  <view class="h-full">
    <app-watermark />

    <slot />

    <app-tabbar />

    <!-- 更新日志模态框 -->
    <up-modal
      :show="authStore.updateLogModal.show"
      title="更新日志"
      confirmText="下次更新前不提示"
      @confirm="handleUpdateLogConfirm"
    >
      <scroll-view scroll-y class="h-[70vh]">
        <biz-log-card :isModal="true" />
      </scroll-view>
    </up-modal>
  </view>
</template>

<style scoped></style>
