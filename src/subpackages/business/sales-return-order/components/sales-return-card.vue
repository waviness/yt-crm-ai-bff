<template>
  <view class="card pa-2 mb-2 rd-md bg-white" @click="emit('click')">
    <view class="tag-primary mb-2"> {{ item.entryId }}/{{ item.entryName }} </view>
    <app-infor-item class="mb-2" title="客户" :content="`${item.custId}/${item.custName}`" />
    <app-infor-item
      class="mb-2"
      title="分支机构"
      :content="item.contactId ? `${item.contactId}/${item.contactName}` : '--'"
    />
    <app-infor-item title="收货日期" :content="item.receiptDate" />
  </view>
</template>

<script lang="ts" setup>
import type { SalesReturnItem } from '../types';

interface Props {
  item: SalesReturnItem;
}

const props = defineProps<Props>();
const emit = defineEmits(['click']);
</script>

<style lang="scss" scoped>
.card {
  box-shadow: 0 2rpx 12rpx 2rpx rgb(209 207 207 / 30%);
}

.tag-primary {
  background: rgba(#2271f5, 0.1);
  border-radius: 4rpx;
  color: #2271f5;
  padding: 10rpx;
  display: inline-block;
  font-size: 24rpx;
}
</style>
