<template>
  <view class="card pa-3 mb-2 rd-md" bg="white" @click="toDetail">
    <app-infor-item class="mb-2" title="客户" :content="`${item.companyId}/${item.companyName}`" />
    <app-infor-item class="mb-2" title="核算单元" :content="`${item.entryId}/${item.entryName}`" />
    <app-infor-item title="货品" :content="`${item.goodsId}/${item.goodsName}`" />
  </view>
</template>

<script lang="ts" setup>
import type { RefundApproveItem } from '../types';

interface Props {
  item: RefundApproveItem;
}

const props = defineProps<Props>();
const emit = defineEmits(['toDetail']);

// 查看详情
const toDetail = () => {
  emit('toDetail');
};
</script>

<style lang="scss" scoped>
.card {
  box-shadow: 0 1px 6px 1px rgb(209 207 207 / 30%);
}
</style>
