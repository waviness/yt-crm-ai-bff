<template>
  <view>
    <app-watermark></app-watermark>
    <view class="bg-white pa-2">
      <app-infor-item title="核算单元" class="mt-2">
        <up-tag
          :text="`${detailObj.entryid}/${detailObj.entryname}`"
          size="mini"
          plain
          plainFill
          borderColor="transparent"
        ></up-tag>
      </app-infor-item>
      <app-infor-item title="总单ID" :content="detailObj.invoiceid" class="mt-2"></app-infor-item>
      <app-infor-item
        title="客户"
        :content="`${detailObj.customeid}/${detailObj.customename}`"
        class="mt-2"
      ></app-infor-item>

      <app-infor-item
        title="分支机构"
        :content="
          detailObj.contactid && detailObj.contactid !== 'null'
            ? `${detailObj.contactid}/${detailObj.contactname}`
            : '-'
        "
        class="mt-2"
      ></app-infor-item>
      <app-infor-item title="总价格" :content="detailObj.totolprice" class="mt-2"></app-infor-item>
    </view>

    <approve-detail-list :list="list" @change="onChange" />

    <app-bottom-actions v-if="+detailObj.status === 0">
      <app-action-btn class="flex-1" text="审核不通过" type="default" @click="onApprove(2)" />
      <app-action-btn class="flex-1" text="审核通过" type="primary" @click="onApprove(1)" />
    </app-bottom-actions>

    <up-popup v-model:show="approveShow" mode="center" round="16" :closeOnClickOverlay="false">
      <view class="approve-popup pa-6">
        <view class="font-16 text-center">
          <text>是否确定将已选的 </text>
          <text class="color-main-3 font-bold">{{ result.length }}</text>
          <text> 条细单进行</text>
        </view>
        <view class="font-16 text-center mt-2">
          <text :class="['font-bold', approveType === 2 ? 'color-never' : 'color-main-3']">{{
            approveType === 1 ? '审核通过' : approveType === 2 ? '审核不通过' : ''
          }}</text>
          <text>操作</text>
        </view>
        <view class="d-flex justify-center mt-6">
          <up-button type="info" round @click="approveShow = false">取消</up-button>
          <up-button type="primary" round class="ml-3" color="#2271F5" @click="submitApprove"
            >确定</up-button
          >
        </view>
      </view>
    </up-popup>
  </view>
</template>

<script lang="ts" setup>
import ApproveDetailList from './components/approve-detail-list.vue';
import { useCustomerOrderApproveDetail } from './composables/use-customer-order-approve-detail';

const {
  detailObj,
  list,
  approveShow,
  approveType,
  result,
  onChange,
  onApprove,
  submitApprove,
  fetchDetailList,
} = useCustomerOrderApproveDetail();

// 页面加载时获取详情数据
onLoad((options: any) => {
  detailObj.value = { ...options };
  fetchDetailList();
});
</script>

<style lang="scss" scoped></style>
