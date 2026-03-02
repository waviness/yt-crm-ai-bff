<template>
  <view class="card pa-2 mb-2" @click="toDetail">
    <view class="flex justify-between">
      <view class="text-14">批号：{{ item.lotNo }}</view>
      <view>{{ item.storageName }}</view>
    </view>
    <view class="flex mt-2 justify-between">
      <app-infor-item>
        <view>{{ item.goodsId + '/' + item.goodsName }}</view>
        <up-copy
          :content="
            item.goodsId +
              '/' +
              item.goodsName +
              '/' +
              item.goodsType +
              '\n' +
              '产地：' +
              item.prodArea ||
            '主档信息暂未维护' +
              '  包装：' +
              item.packSize +
              item.goodsUnit +
              '/' +
              item.packName +
              '  库存：' +
              (item.goodsQuantity || '0')
          "
        >
          <view id="copy_custsetinfor" class="copy-btn">复制</view>
        </up-copy>
      </app-infor-item>
      <up-tag :text="item.goodsStatus" borderColor="transparent" plainFill plain> </up-tag>
    </view>
    <view class="flex justify-between mt-2">
      <view>{{ item.goodsType }}</view>
      <view>{{ item.prodArea || '主档信息暂未维护' }}</view>
    </view>
    <view class="flex mt-2">
      <app-infor-item
        class="flex-1"
        title="两票制"
        :content="
          item.invoiceFlag == 1
            ? '两票制'
            : item.invoiceFlag == 2
              ? '发票未到'
              : item.invoiceFlag == 3
                ? '无两票制库存'
                : item.invoiceFlag == 0
                  ? '非两票制'
                  : ''
        "
      />
      <app-infor-item class="flex-1 ml-2" title="两票制库存" :content="item.invoiceGoodsNum || 0" />
    </view>
    <view class="flex mt-2">
      <app-infor-item class="flex-1" title="库存" :content="item.goodsQuantity" />
      <app-infor-item
        class="flex-1 ml-2"
        title="包装"
        :content="item.packSize || '' + item?.goodsUnit + '/' + item?.packName"
      />
    </view>
    <view class="flex mt-2">
      <app-infor-item
        class="flex-1"
        title="有效期至"
        :content="item.invalidDate && item.invalidDate.substring(0, 11)"
      />
      <app-infor-item class="flex-1 ml-2" title="采购员" :content="item.buyerName" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { InventoryQueryDetailItem } from '../types';
interface IProps {
  item: InventoryQueryDetailItem;
}
const props = defineProps<IProps>();
const emit = defineEmits(['toDetail']);
const toDetail = async (e: any) => {
  let event: any = e || window.event;
  let target: any = event ? event?.target || event.srcElement : {};
  if (target && target.id === 'copy_custsetinfor') {
    return;
  }
  emit('toDetail');
};
</script>

<style lang="scss" scoped>
.card {
  background: #f9f9f9;
  border-radius: 4px;
  box-shadow: 0px 1px 6px 1px rgba(209, 207, 207, 0.3);
}
.copy-btn {
  margin-left: 4px;
  padding: 4px 8px;
  background-color: #2271f5;
  color: #fff;
  border-radius: 4px;
}
</style>
