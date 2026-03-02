<!-- 项目管理入口页面 -->
<script setup lang="ts">
const projectStore = useProjectStore();

/**
 * 处理页面跳转逻辑
 * @param finalLevel 权限级别
 * @param options 页面参数
 */
const handleNavigation = (finalLevel: number, options: any) => {
  // 优先处理消息类型跳转
  const messageType = +options.messageType;
  if (messageType) {
    const targetTab = messageType === 2 ? 'ex' : 'access';
    const targetRoute = messageType === 2 ? RouteMap.projectEx : RouteMap.project;

    projectStore.setCurrentTab(targetTab);
    router.redirect(targetRoute);
    return;
  }

  // 根据权限级别决定跳转
  if (finalLevel >= 2) {
    // leaderLevel >= 2: 只显示深分进度，直接跳转
    router.redirect(RouteMap.projectEx);
  } else {
    // leaderLevel = 0 或 1: 跳转到准入管理
    router.redirect(RouteMap.project);
  }
};

// 页面加载时处理权限和跳转
onLoad(async (options: any) => {
  // 埋点统计
  CommonService.crmUserClick({
    catalogType: 504,
    catalogTypeName: '项目管理',
    cucrId: '',
    menuId: '',
    menuName: '',
    menuOperation: '点击项目管理模块进入',
    operationType: 2,
  });

  // 获取权限级别
  const leaderLevelRes = await ProjectService.getLeaderLevel({});
  const hasQueryAllPermission = hasPermission('projectManage-queryAll');
  const finalLevel = hasQueryAllPermission ? 1 : leaderLevelRes;

  // 存储到 store
  projectStore.setProjectLeaderLevel(finalLevel);

  // 处理跳转
  handleNavigation(finalLevel, options);
});
</script>

<template>
  <view>
    <app-watermark> </app-watermark>
    <up-loading-page :loading="true" loading-text="加载中..." font-size="24rpx" />
  </view>
</template>
