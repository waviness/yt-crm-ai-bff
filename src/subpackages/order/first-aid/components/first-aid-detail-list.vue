<template>
  <view>
    <view class="flex flex-items-center flex-justify-between text-12 pb-2">
      <app-infor-item
        class="flex-1"
        title="开票日期"
        :content="`${deatilListItem.printtime.substring(0, 10)}`"
      />
      <app-infor-item
        class="flex-1 pl-2"
        title="销售细单ID"
        :content="`${deatilListItem.salesdtlid}`"
      />
    </view>
    <view class="flex flex-items-center flex-justify-between text-12 pb-2">
      <app-infor-item class="flex-1" title="货品数量" :content="`${deatilListItem.goodsqty}`" />
      <app-infor-item
        class="flex-1 pl-2"
        title="销售价格"
        :content="`${deatilListItem.unitprice}`"
      />
    </view>
    <view class="flex flex-items-center flex-justify-between text-12 pb-2">
      <app-infor-item
        class="flex-1"
        :contentClass="'numberWarp'"
        title="发票号"
        :content="`${deatilListItem.invno}`"
      />
      <app-infor-item
        class="flex-1 pl-2"
        title="保管帐"
        :content="`${deatilListItem.storagename}`"
      />
    </view>
    <app-infor-item
      class="flex-1 pb-2"
      title="备注(送货地址)"
      :content="`${deatilListItem.dtlmemo}`"
    />
  </view>
</template>
<script setup lang="ts">
import type { FirstAidOrderOrderDetailListObj } from '../types/index';
interface listProps {
  deatilListItem: FirstAidOrderOrderDetailListObj;
}
defineProps<listProps>();
</script>
<style scoped lang="scss">
:deep(.numberWarp) {
  word-break: break-all;
}
</style>
