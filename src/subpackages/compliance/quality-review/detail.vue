<template>
  <view>
    <app-watermark></app-watermark>
    <view v-if="reviewDetail" class="pa-2 flex justify-between items-center">
      <text>质量复查详情</text>
      <text class="font-bold">#{{ reviewDetail.recheckId }}</text>
    </view>
    <up-form class="pb-2" v-if="reviewDetail">
      <app-cell title="来源" valueClass="color-main" class="mb-2">
        <text>{{
          reviewDetail.comeFrom === 10 ? '入库收货' : reviewDetail.comeFrom === 13 ? '销退验收' : ''
        }}</text>
      </app-cell>
      <app-cell title="创建日期" class="mb-2">
        <text>{{ reviewDetail.creDate }}</text>
      </app-cell>
      <app-cell title="客户信息" class="mb-2">
        <text>{{ reviewDetail.companyId }}/{{ reviewDetail.companyName }}</text>
      </app-cell>
      <app-cell title="分支机构" class="mb-2">
        <text>{{ reviewDetail.contractId }}/{{ reviewDetail.contractMan }}</text>
      </app-cell>
      <app-cell title="核算单元" class="mb-2">
        <text>{{ reviewDetail.entryId }}/{{ reviewDetail.entryName }}</text>
      </app-cell>
      <app-cell title="货品信息" class="mb-2">
        <text>{{ reviewDetail.goodsId }}/{{ reviewDetail.goodsName }}</text>
      </app-cell>
      <app-cell title="规格" class="mb-2">
        <text>{{ reviewDetail.goodsType }}/{{ reviewDetail.goodsUnit }}</text>
      </app-cell>
      <app-cell title="厂家" class="mb-2">
        <text>{{ reviewDetail.factoryName }}</text>
      </app-cell>
      <app-cell title="内容" class="mb-2">
        <text class="font-bold">{{ reviewDetail.memo }}</text>
      </app-cell>
      <app-cell title="货品状态" class="mb-2" v-if="reviewDetail.auditFlag">
        <text :class="getAuditFlagColor">{{ getAuditFlagText }}</text>
      </app-cell>
      <app-cell title="审批原因" class="mb-2" v-if="reviewDetail.auditFlag">
        <text>{{ reviewDetail.auditMemo || '--' }}</text>
      </app-cell>
    </up-form>
  </view>
</template>

<script lang="ts" setup>
import { useQualityReviewDetail } from './composables/use-quality-review-detail';

const { reviewDetail, loading, fetchDetail, getComeFromText, getAuditFlagText, getAuditFlagColor } =
  useQualityReviewDetail();

onLoad(async options => {
  const { recheckId } = options || {};
  if (recheckId) {
    await fetchDetail(recheckId);
  }
});
</script>

<style scoped></style>
