<script setup lang="ts">
/**
 * 更新日志页面
 * 展示更新日志列表，支持标记已读
 */
// 响应式数据
const phoneUpdateLogStatus = ref<string>('');

/**
 * 标记更新日志为已读
 */
const updateRead = async () => {
  await LogUpdateService.updateRead({ type: 2 });
  cache.set('phoneUpdateLogStatus', '1');
  phoneUpdateLogStatus.value = cache.get('phoneUpdateLogStatus') || '';
  showSuccess('标记成功');
};

/**
 * 返回上一页
 */
const cancelClick = () => {
  router.back();
};

/**
 * 确认标记已读
 */
const upLogConfirm = () => {
  if (+phoneUpdateLogStatus.value === 0) {
    updateRead();
  }
};

/**
 * 页面初始化
 */
onMounted(() => {
  phoneUpdateLogStatus.value = cache.get('phoneUpdateLogStatus') ?? '';
});
</script>

<template>
  <view>
    <biz-log-card />

    <!-- 底部操作按钮 -->
    <app-bottom-actions :count="phoneUpdateLogStatus === 0 || phoneUpdateLogStatus === '0' ? 2 : 1">
      <app-action-btn class="flex-1" text="返回" @click="cancelClick" />
      <app-action-btn
        v-if="phoneUpdateLogStatus === 0 || phoneUpdateLogStatus === '0'"
        class="flex-1"
        text="确定"
        type="primary"
        @click="upLogConfirm"
      />
    </app-bottom-actions>
  </view>
</template>
