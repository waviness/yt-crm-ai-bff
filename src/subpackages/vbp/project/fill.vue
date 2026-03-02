<!-- VBP - 拜访计划 -->
<script setup lang="ts">
import { useVbpProjectFill } from './composables/use-vbp-project-fill';

const {
  goodsName,
  selectedlist,
  notSelectedlist,
  finishShow,
  finishActions,
  policyShow,
  policyActions,
  curIndex,
  handleClickFinish,
  handleFinishConfirm,
  handleClickPolicy,
  handlePolicyConfirm,
  submit,
  submitNotSelect,
  init,
} = useVbpProjectFill();

onLoad(opts => {
  init(opts);
});
</script>

<template>
  <view class="pb-100">
    <app-watermark> </app-watermark>
    <view class="px-4 pt-2 color-gray-4 text-14">中选品种</view>
    <up-form v-for="(item, idx) in selectedlist" :key="idx" class="bg-white mt-2">
      <app-form-item label="品种名称">
        <view class="w-full text-right">
          {{ item.goodsName }}
        </view>
      </app-form-item>
      <app-form-item label="厂家">
        <view class="w-full text-right">
          {{ item.factoryName }}
        </view>
      </app-form-item>
      <app-form-item label="规格">
        <view class="w-full text-right">
          {{ item.goodsType }}
        </view>
      </app-form-item>
      <app-form-item label="年签约量">
        <view class="w-full text-right">
          {{ item.yearTarget }}
        </view>
      </app-form-item>
      <app-form-item label="中选品种完成情况">
        <view class="w-full text-right">
          <view
            v-if="!item.visitUseStatus"
            :class="`${item.bidGoods ? 'color-black-2' : 'color-gray-4'}`"
            @click="handleClickFinish(item, idx)"
            >{{ item.bidGoodsName || '点击选择中选完成情况' }}</view
          >
          <view v-else-if="item.bidGoods === 1" class="color-success">能完成</view>
          <view v-else-if="item.bidGoods === 2" class="color-danger">不能完成</view>
        </view>
      </app-form-item>
      <app-form-item label="品种政策">
        <view
          :class="`w-full text-right ${item.goodsPolicy ? 'color-black-2' : 'color-gray-4'}`"
          @click="handleClickPolicy(item, idx)"
          >{{ item.goodsPolicyName || '点击选择品种政策' }}</view
        >
      </app-form-item>
      <app-form-item label="完成量" :borderBottom="false">
        <up-input
          v-if="!item.visitUseStatus"
          v-model="item.complete"
          type="digit"
          placeholder="点击输入完成量"
          input-align="right"
          fontSize="28rpx"
          border="none"
        />
        <view v-else class="w-full text-right">
          {{ !isNaN(item.complete) ? item.complete : '--' }}
        </view>
      </app-form-item>
      <view v-if="!item.visitUseStatus" class="d-flex justify-space-between mx-4 py-2">
        <up-button type="primary" shape="circle" @click="() => submit(idx)">提交</up-button>
      </view>
    </up-form>
    <view class="px-4 pt-2 color-gray-4 text-14">非中选品种</view>
    <view v-if="notSelectedlist.length">
      <up-form v-for="(item, idx) in notSelectedlist" :key="idx" class="bg-white mt-2">
        <app-form-item label="品种名称">
          <view class="w-full text-right">
            {{ item.goodsName }}
          </view>
        </app-form-item>
        <app-form-item label="厂家">
          <view class="w-full text-right">
            {{ item.factoryName }}
          </view>
        </app-form-item>
        <app-form-item label="规格">
          <view class="w-full text-right">
            {{ item.goodsType }}
          </view>
        </app-form-item>
        <app-form-item label="计划量">
          <view class="w-full text-right">
            {{ item.yearTarget }}
          </view>
        </app-form-item>
        <app-form-item label="完成量" :borderBottom="false">
          <up-input
            v-if="!item.visitUseStatus"
            v-model="item.complete"
            placeholder="点击输入完成量"
            input-align="right"
            fontSize="28rpx"
            border="none"
          />
          <view v-else class="w-full text-right">
            {{ item.complete || '--' }}
          </view>
        </app-form-item>
        <view v-if="!item.visitUseStatus" class="d-flex justify-space-between mx-4 py-2">
          <up-button type="primary" shape="circle" @click="() => submitNotSelect(idx)"
            >提交</up-button
          >
        </view>
      </up-form>
    </view>
    <app-empty v-else description="暂无数据" class="bg-white mt-2 py-14"></app-empty>
    <app-action-sheet
      v-model:show="finishShow"
      :actions="finishActions"
      cancel-text="取消"
      description="中选品种完成情况"
      @select="handleFinishConfirm"
    />
    <app-action-sheet
      v-model:show="policyShow"
      :actions="policyActions"
      cancel-text="取消"
      description="品种政策"
      @select="handlePolicyConfirm"
    />
  </view>
</template>

<style lang="scss" scoped>
:deep(.up-input__label) {
  width: 120px;
}
</style>
