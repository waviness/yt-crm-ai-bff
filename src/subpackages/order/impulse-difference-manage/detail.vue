<script setup lang="ts">
/**
 * 冲差管理详情页面
 * 支持冲差细单的查看、图片上传、提交等操作
 */

import ImpulseDetailItem from './components/impulse-detail-item.vue';
import UploadPop from './components/upload-pop.vue';
import { useImpulseDetail } from './composables/use-impulse-detail';
import type { ImpulseStatus } from './types';

const appStore = useAppStore();
// 获取路由参数
const statusType = ref<ImpulseStatus>(1);
const docId = ref<number>(0);

// 使用业务逻辑composable
const {
  loading,
  list,
  submitShow,
  replenishDesc,
  curData,
  imgShow,
  showType,
  imgSubmiting,
  getDetailList,
  onSubmit,
  submitImg,
  submitDesc,
} = useImpulseDetail();

// 状态标题映射
const statusTitle = computed(() => {
  const titles = {
    1: '未处理',
    2: '已处理',
    3: '已审核',
  };
  return titles[statusType.value] || '未处理';
});

// 处理提交说明
const handleSubmitDesc = async () => {
  await submitDesc();
  appStore.setHadDoneOnDetail(true);
  await getDetailList(docId.value, statusType.value);
};

// 处理图片提交
const handleSubmitImg = async (list: any[]) => {
  await submitImg(list);
  appStore.setHadDoneOnDetail(true);
  await getDetailList(docId.value, statusType.value);
};

// 页面初始化
onLoad((opts: any) => {
  const decodedOpts = decodeObjectValues(opts);
  statusType.value = +(decodedOpts.statusType || 1) as ImpulseStatus;
  docId.value = +(decodedOpts.docId || 0);
  getDetailList(docId.value, statusType.value);
});
</script>

<template>
  <view class="pb-100">
    <app-watermark> </app-watermark>
    <view class="px-10 pt-10">{{ statusTitle }}总单详情</view>
    <view v-if="loading || list.length" class="px-10 pt-10">
      <ImpulseDetailItem
        class="block mb-2"
        v-for="(item, idx) in list"
        :key="idx"
        :data="item"
        :status="statusType"
        @submit="onSubmit"
      />
    </view>
    <app-empty v-else description="暂无数据" />
    <UploadPop
      v-if="imgShow"
      :type="showType"
      :data="curData"
      :loading="imgSubmiting"
      @close="imgShow = false"
      @confirm="handleSubmitImg"
    />
    <up-modal
      v-model:show="submitShow"
      title="是否确认提交并添加补充说明"
      showCancelButton
      @close="submitShow = false"
      @confirm="handleSubmitDesc"
    >
      <up-textarea v-model="replenishDesc" placeholder="点击输入补充说明(选填)" />
    </up-modal>
  </view>
</template>
