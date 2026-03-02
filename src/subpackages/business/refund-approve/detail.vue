<template>
  <view>
    <app-watermark></app-watermark>
    <view class="pa-2">多仓销退查询详情</view>
    <view class="content pb-10">
      <up-form class="bg-white">
        <app-form-item class="text-14 mt-1" label="业务日期">
          <text class="float-right">{{ detailObj.creDate }}</text>
        </app-form-item>
        <view class="flex items-center px-4 py-3" style="border-bottom: 1px solid #ebedf0">
          <view class="flex-1 flex items-center justify-between pr-2">
            <text class="color-gray-5 text-14">申请总单ID</text>
            <text class="text-14">{{ detailObj.fetchId }}</text>
          </view>
          <view class="divider-vertical"></view>
          <view class="flex-1 flex items-center justify-between pl-2">
            <text class="color-gray-5 text-14">申请细单ID</text>
            <text class="text-14">{{ detailObj.fetchdtlId }}</text>
          </view>
        </view>
        <app-form-item class="text-14" label="客户">
          <text class="float-right">{{ detailObj.companyId }}/{{ detailObj.companyName }}</text>
        </app-form-item>
        <app-form-item class="text-14" label="分支机构">
          <text class="float-right">
            {{ detailObj.contactId || '--' }}/{{ detailObj.contactMan || '--' }}
          </text>
        </app-form-item>
        <app-form-item class="text-14" label="货品">
          <text class="float-right">{{ detailObj.goodsId }}/{{ detailObj.goodsName }}</text>
        </app-form-item>
        <app-form-item class="text-14" label="产地">
          <text class="float-right">{{ detailObj.prodArea }}</text>
        </app-form-item>
        <app-form-item class="text-14" label="有效期">
          <text class="float-right">{{ detailObj.invalidDate }}</text>
        </app-form-item>
        <view class="flex items-center px-4 py-3" style="border-bottom: 1px solid #ebedf0">
          <view class="flex-1 flex items-center justify-between pr-2">
            <text class="color-gray-5 text-14">数量</text>
            <text class="text-14">{{ detailObj.goodsQty }}</text>
          </view>
          <view class="divider-vertical"></view>
          <view class="flex-1 flex items-center justify-between pl-2">
            <text class="color-gray-5 text-14">金额</text>
            <text class="text-14">{{ detailObj.totalLine || '--' }}</text>
          </view>
        </view>
        <app-form-item class="text-14" label="退货政策">
          <text class="float-right color-red">{{ detailObj.returnPolicy }}</text>
        </app-form-item>

        <!-- 已审批状态显示 -->
        <template v-if="detailObj?.status !== undefined && +detailObj.status !== 0">
          <app-form-item class="text-14" label="是否通过">
            <text
              class="float-right text-14"
              :class="detailObj?.status === 1 ? 'color-green' : 'color-red'"
            >
              {{ detailObj?.status === 1 ? '通过' : '不通过' }}
            </text>
          </app-form-item>
          <app-form-item class="text-14" label="备注">
            <text class="float-right">{{ detailObj?.memo || '--' }}</text>
          </app-form-item>
        </template>

        <!-- 待审批状态可编辑 -->
        <template v-else>
          <app-form-item class="text-14" label="是否通过">
            <up-radio-group v-model="isAgree" placement="row" class="justify-end">
              <up-radio :name="1" label="通过" activeColor="#2271F5" labelSize="14"></up-radio>
              <up-radio
                :name="2"
                label="不通过"
                activeColor="#2271F5"
                labelSize="14"
                class="ml-4"
              ></up-radio>
            </up-radio-group>
          </app-form-item>
          <app-form-item class="text-14" label="备注">
            <up-input
              v-model="remark"
              placeholder="请输入备注"
              border="none"
              inputAlign="right"
              fontSize="28rpx"
            ></up-input>
          </app-form-item>
        </template>
      </up-form>
    </view>

    <!-- 提交按钮 -->
    <app-fix-btn
      v-if="detailObj?.status === 0"
      text="提交"
      style="width: 80%; max-width: 600rpx"
      class="justify-center"
      @click="submitApproval"
    />
  </view>
</template>

<script lang="ts" setup>
import { useRefundApproveDetail } from './composables/use-refund-approve-detail';

const { detailObj, isAgree, remark, fetchDetail, submitApproval } = useRefundApproveDetail();

onLoad(async options => {
  const { fetchdtlId } = options || {};
  if (fetchdtlId) {
    await fetchDetail(fetchdtlId);
  }
});
</script>

<style lang="scss" scoped>
.content {
  :deep(.u-form-item__body__right__content__slot) {
    width: 100%;
    display: inline-block;
  }
}

.divider-vertical {
  width: 1rpx;
  height: 40rpx;
  background: #ebedf0;
  margin: 0 20rpx;
}
</style>
