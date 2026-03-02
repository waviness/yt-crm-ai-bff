<script setup lang="ts">
defineOptions(SHARED_STYLE_OPTIONS);

interface IProps {
  data: any;
}

defineProps<IProps>();
</script>

<template>
  <view class="bg-white pa-2">
    <app-infor-item title="细单ID" :content="data.salesDtlId" class="mt-2" />
    <app-infor-item title="订单时间" :content="data.orderTime" class="mt-2" />
    <app-infor-item title="核算单元" :content="`${data.entryId}/${data.entryName}`" class="mt-2" />
    <app-infor-item title="客户" :content="`${data.customId}/${data.customName}`" class="mt-2" />
    <app-infor-item
      title="分支机构"
      :content="
        data.contactId == null || data.contactName == null
          ? '-'
          : `${data.contactId}/${data.contactName}`
      "
      class="mt-2"
    />
    <app-infor-item title="品种" :content="`${data.goodsId}/${data.goodsName}`" class="mt-2" />
    <app-infor-item
      title="批号ID/批号"
      :content="data.lotId == null || data.lotNo == null ? '-' : `${data.lotId}/${data.lotNo}`"
      class="mt-2"
    />
    <app-infor-item title="规格" :content="data.goodsType" class="mt-2" />
    <app-infor-item title="厂家" :content="`${data.factoryId}/${data.factoryName}`" class="mt-2" />
    <app-infor-item title="数量" :content="data.goodsQty" class="mt-2" />
    <view class="flex justify-between items-center mt-2 mb-2">
      <view class="color-gray-4">采购员</view>
      <view class="px-2 bg-main-1 color-main tag-blue rounded-2">
        {{ data.supplyer }}
      </view>
    </view>
  </view>
</template>

<style scoped>
.tag-blue {
  display: inline-block;
  padding: 4rpx 12rpx;
  font-size: 24rpx;
  color: #2271f5;
  background: #e8f3ff;
  border-radius: 4rpx;
}
</style>
