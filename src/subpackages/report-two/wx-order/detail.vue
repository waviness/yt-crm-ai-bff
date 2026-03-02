<template>
  <view>
    <app-watermark> </app-watermark>
    <view class="pa-2 font-bold">细单列表</view>
    <view class="pa-2">
      <order-dtl-list
        :orderType="orderType"
        v-for="(item, index) in detailList"
        :key="'order-detail' + index"
        :item="item"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import orderDtlList from '../components/base/order-dtl-list.vue';
const detailList = ref<any[]>([]);
const orderType = ref<string>('');
const fetchDetail = async (codDocId: string) => {
  const data = await WxOrderService.getOrderDtl({
    codDocId,
  });
  detailList.value = data || [];
};
onLoad(options => {
  const { codDocId, orderType: orderTypeFromOptions } = options as any;
  orderType.value = orderTypeFromOptions + '';
  fetchDetail(codDocId);
});
</script>

<style lang="scss" scoped></style>
