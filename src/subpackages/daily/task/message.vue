<!-- 任务/审批 -->
<script setup lang="ts">
import { TaskService } from '@/api/task';
import router from '@/utils/router';
import { RouteMap } from '@/config/route';
import { decodeObjectValues } from '@/utils/url';
import cache from '@/utils/cache';

const appStore = useAppStore();

// 路由参数
const csoId = ref<string>('');
const userId = ref<string>('');
const synergiaType = ref<string>('0');
const loading = ref(false);

/**
 * 获取详情并跳转
 */
const getDetail = async () => {
  loading.value = true;
  const res = await TaskService.queryWxMsg({
    csoId: csoId.value,
    userId: userId.value,
  });
  const synergiaTypeFlag = +synergiaType.value === 1;
  if (res.useStatus === 1 && !synergiaTypeFlag) {
    loading.value = true;
    const statusRes = await TaskService.modifyReceiveStatus({ csodId: res.csodId });
    loading.value = false;
    res.useStatus = 2;
  }
  // 设置详情信息到 store
  appStore.setDetailObj({ type: 2, csoId: csoId.value });
  // 缓存任务详情信息
  cache.set('taskDetailInfo', { type: 2, csoId: csoId.value });
  // 跳转到任务详情页
  router.redirect(RouteMap.taskDetail, {
    userId: userId.value,
    isMsg: '1',
    synergiaType: synergiaTypeFlag ? '1' : '0',
  });
  loading.value = false;
};

// 页面加载
onLoad((opts: any) => {
  const decodedOpts = decodeObjectValues(opts);
  csoId.value = decodedOpts.csoId || '';
  userId.value = decodedOpts.userId || '';
  synergiaType.value = decodedOpts.synergiaType || '0';
  getDetail();
});
</script>

<template>
  <view>
    <up-loading-page :loading="loading" loading-text="加载中..." font-size="24rpx" />
  </view>
</template>
