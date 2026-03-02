<script setup lang="ts">
import FundDetailItem from './components/fund-detail-item.vue';
import { useFundingDetail } from './composables/use-funding-detail';
import { useFundingStatus } from './composables/use-funding-status';
import { FundingStatusType } from './types';

// 使用组合式函数管理详情逻辑
const {
  modifyAuth,
  statusType,
  readonly,
  arrow,
  cffId,
  year,
  month,
  detailObj,
  inputObj,
  historyList,
  loading,
  changeArrow,
  onInputChange,
  getHistory,
  getDetail,
  submitData,
} = useFundingDetail();

// 使用组合式函数管理状态逻辑
const { determineStatus, validateForm, handleModifySubmit, handleGoBack } = useFundingStatus();

// 状态类型文本
const statusTypeText = ref(['', '初次填报', '再次上报', '修订上报', '回款填报详情']);

// 处理修改提交
const modifySubmit = () => {
  statusType.value = FundingStatusType.REVISE;
  inputObj.value = {
    xsAmount: null,
    dhAmount: null,
    chAmount: null,
    reason: '',
    total: null,
  };
};

// 处理返回
const goBack = () => {
  if (
    statusType.value === FundingStatusType.INITIAL ||
    statusType.value === FundingStatusType.SECOND
  ) {
    handleGoBack();
  } else {
    statusType.value = FundingStatusType.DETAIL;
  }
};

// 处理提交
const submit = async () => {
  if (!validateForm(inputObj.value, statusType.value)) {
    return;
  }

  try {
    await handleModifySubmit(submitData);
    const appStore = useAppStore();
    appStore.setHadDoneOnDetail(true);

    if (statusType.value === FundingStatusType.INITIAL) {
      handleGoBack();
    } else {
      statusType.value = FundingStatusType.DETAIL;
      await getDetail();
    }
  } catch (error) {
    console.error('提交失败:', error);
  }
};

onLoad((opts: any) => {
  modifyAuth.value = hasPermission('FUND_MODIFY');
  cffId.value = opts.cffId;
  year.value = opts.year;
  month.value = opts.month;
  getDetail();
});
</script>

<template>
  <view class="pb-100">
    <app-watermark> </app-watermark>
    <view class="p-10">
      {{ statusTypeText[statusType] }}
    </view>
    <view v-if="statusType === 1 || statusType === 3" class="">
      <up-form class="bg-white">
        <app-form-item label="部门">
          <view class="w-full text-right">
            {{ detailObj.deptName }}
          </view>
        </app-form-item>
        <app-form-item label="月初上报销售(含税)(万元)" v-if="statusType === 1">
          <up-input
            v-model="inputObj.xsAmount"
            type="number"
            placeholder="点击输入月初上报销售"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          >
          </up-input>
        </app-form-item>
        <app-form-item label="电汇(万元)">
          <up-input
            v-model="inputObj.dhAmount"
            type="number"
            placeholder="点击输入电汇金额"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
            @change="onInputChange"
          >
          </up-input>
        </app-form-item>
        <app-form-item label="承兑(万元)">
          <up-input
            v-model="inputObj.chAmount"
            type="number"
            placeholder="点击输入承兑金额"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
            @change="onInputChange"
          >
          </up-input>
        </app-form-item>
        <app-form-item label="原因" v-if="statusType === 3">
          <up-input
            v-model="inputObj.reason"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
            placeholder="点击输入原因"
          />
        </app-form-item>
      </up-form>
      <app-cell title="合计" :value="inputObj.total" value-class="color-black-2" />
    </view>
    <view v-if="statusType === 2 || statusType === 4" class="">
      <fund-detail-item :data="detailObj" :lastModify="!!historyList.length" :useOld="false" />
      <app-cell
        v-if="historyList.length"
        title="历史记录"
        isLink
        :arrowDirection="arrow"
        class="block mt-3"
        titleClass="color-black-2"
        @click="changeArrow()"
      />
      <view v-show="arrow === 'up'">
        <fund-detail-item
          v-for="(item, idx) in historyList"
          :key="idx"
          :data="item"
          :useOld="true"
        />
      </view>
    </view>
    <view
      v-if="!readonly && (statusType === 1 || statusType === 3)"
      class="mt-14 flex justify-between mx-4"
    >
      <up-button class="flex-1" shape="circle" @click="goBack">取消</up-button>
      <up-button shape="circle" type="primary" class="ml-3 flex-1" @click="submit">提交</up-button>
    </view>
    <view
      v-if="!readonly && statusType === 2 && detailObj.isFill"
      class="mt-14 flex justify-between mx-7"
    >
      <up-button shape="circle" type="primary" class="mx-7 flex-1" @click="statusType = 1"
        >再次上报</up-button
      >
    </view>
    <view
      v-if="!readonly && statusType === 4 && detailObj.isFill"
      class="mt-14 flex justify-between mx-7"
    >
      <up-button shape="circle" type="primary" class="mx-7 flex-1" @click="modifySubmit"
        >修订上报</up-button
      >
    </view>
  </view>
</template>
