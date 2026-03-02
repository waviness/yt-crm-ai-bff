<script setup lang="ts">
import { useWxLockHandleDetail } from './composables/use-wx-lock-detail';

defineOptions(SHARED_STYLE_OPTIONS);

const recordid = ref('');

const { detailObj, loading, getDetail, getNameByStatus, getSendFlagText, goBack, getQtyLabel } =
  useWxLockHandleDetail(recordid);

onLoad((options: any) => {
  recordid.value = options.recordid;
  getDetail();
});
</script>

<template>
  <view class="pb-20">
    <app-watermark></app-watermark>
    <view class="pa-2">处理意见</view>
    <view>
      <app-cell
        title="处理编号"
        :value="detailObj.recordid"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
      <app-cell
        :title="getQtyLabel(detailObj.conType)"
        :value="detailObj.predictQty"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
      <app-cell
        title="创建时间"
        :value="detailObj.credate"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
      <app-cell
        title="处理状态"
        :value="getNameByStatus(detailObj.usestatus)"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
      <app-cell
        title="反馈时间"
        :value="detailObj.feedbacktime || '-'"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
      <app-cell
        title="备注"
        :value="detailObj.remark || '-'"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
      <app-cell
        title="终止时间"
        :value="detailObj.endtime || '-'"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
      <app-cell
        title="发送标记"
        :value="getSendFlagText(detailObj.sendflag)"
        title-class="color-gray-5"
        :value-class="detailObj.sendflag === 0 ? 'color-danger' : 'color-success'"
        border
      />
      <app-cell
        title="预计到货时间"
        :value="detailObj.prearrivetime || '-'"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
    </view>
    <view class="flex justify-center mt-14">
      <up-button
        type="primary"
        shape="circle"
        customStyle="width: auto; padding: 0 40rpx;"
        @click="goBack"
        >返回详情</up-button
      >
    </view>
  </view>
</template>

<style scoped></style>
