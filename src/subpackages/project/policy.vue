<!-- 项目管理 - 准入 - 详情 - 修改状态 -->
<script setup lang="ts">
import type { ProjectDetail } from './types';

const appStore = useAppStore();

const selectedDate = ref('');
const policyType = ref(0);
const currentProjectId = ref('');
const currentProjectName = ref('');
const keywords = ref('');
const detail = ref<ProjectDetail[]>([]);
const deepDetail = ref({});

// 获取准入政策
const getAccessPolicy = async () => {
  detail.value = [];
  const res = await ProjectService.getAccessProductPolicy({
    date: selectedDate.value,
    projectId: currentProjectId.value,
    key: keywords.value,
  });
  detail.value = res;
};

// 获取深分政策
const getDeepPolicy = async () => {
  deepDetail.value = {};
  const res = await ProjectService.getDeepProjectPolicy({
    date: selectedDate.value,
    projectId: currentProjectId.value,
  });
  deepDetail.value = res;
};

// 返回
const goBack = () => {
  router.back();
};

onLoad((opts: any) => {
  const decodedOpts = decodeObjectValues(opts);
  // type 1准入 2深分
  const { type, date, projectId, projectName } = decodedOpts;
  policyType.value = +type;
  selectedDate.value = date;
  currentProjectId.value = projectId;
  currentProjectName.value = projectName;
  // 从路由参数获取数据
  if (policyType.value === 1) {
    getAccessPolicy();
  } else if (policyType.value === 2) {
    getDeepPolicy();
  }
});
</script>

<template>
  <view class="pb-100">
    <app-watermark> </app-watermark>
    <view v-if="policyType === 1" class="bg-white px-3 py-10">
      <up-search
        key="project-policy-search-input"
        v-model="keywords"
        clearable
        shape="square"
        bgColor="#f7f8fa"
        :showAction="false"
        placeholder="产品名称"
        confirm-type="search"
        @search="getAccessPolicy"
      />
    </view>
    <view class="px-10 py-2">
      <view class="bg-white p-4 flex items-center rounded-20rpx">
        <app-icon
          name="zhanbitu_chart-proportion"
          size="36rpx"
          :color="appStore.theme.color.primary"
        />
        <view class="flex-1 mx-2 text-sm">项目名称</view>
        <view class="text-14 font-bold">{{ currentProjectName }}</view>
      </view>
      <template v-if="policyType === 1">
        <view
          v-for="(item, idx) in detail"
          :key="idx"
          class="bg-white mt-2 p-10 text-sm rounded-20rpx"
        >
          <view class="font-bold">{{ item.productName }}</view>
          <view class="color-gray-5 mt-1">{{ item.productPolicy || '无' }}</view>
        </view>
      </template>
      <view v-else-if="policyType === 2" class="bg-white mt-2 p-10 text-sm rounded-20rpx">
        <view class="font-bold">深分政策</view>
        <view class="color-gray-5 mt-1">{{ deepDetail.productPolicy || '无' }}</view>
      </view>
    </view>
    <app-fix-btn text="返回项目管理" :fontSize="12" bold @click="goBack" />
  </view>
</template>
