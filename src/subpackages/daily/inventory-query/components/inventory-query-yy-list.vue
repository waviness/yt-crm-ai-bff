<template>
  <view class="card mb-2">
    <view class="pa-2 bg-white">
      <view class="flex justify-between mt-2">
        <app-infor-item
          class="flex-3"
          title="核算单元"
          v-if="item.entryId"
          :content="item.entryId + '/' + item.entryName?.split('/')[0]"
        />
        <app-infor-item class="flex-2 ml-1" title="平台id">
          <view :key="index" v-for="(erpGoods, index) in item.erpGoodsIdList">
            <text class="color-main">{{ erpGoods }}</text>
            <text v-if="item.erpGoodsIdList.length - 1 > index">,</text>
          </view>
          <view v-if="!item.erpGoodsIdList?.length">暂未维护</view>
        </app-infor-item>
      </view>
      <app-infor-item class="mt-2" title="品种">
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
            (item.prodArea ||
              '主档信息暂未维护' +
                '  包装：' +
                item.packSize +
                item.goodsUnit +
                '/' +
                item.packName) +
            '  可销库存：' +
            (item.goodsQuantity || '0') +
            '  平台id：' +
            (item.erpGoodsIdList && item.erpGoodsIdList.length
              ? item.erpGoodsIdList.join(',')
              : '暂未维护')
          "
        >
          <view id="copy_custsetinfor" class="copy-btn">复制</view>
        </up-copy>
      </app-infor-item>
      <view class="flex justify-between mt-2">
        <app-infor-item
          :titleWidth="50"
          class="flex-1"
          title="通用名"
          :content="item.currencyName || '-'"
        />
        <app-infor-item :titleWidth="40" class="flex-1 ml-1" title="规格">
          <view>{{ item.goodsType }}</view>
        </app-infor-item>
      </view>

      <view class="flex justify-between mt-2">
        <app-infor-item class="flex-3" title="产地">
          <view>{{ item.prodArea || '主档信息暂未维护' }}</view>
        </app-infor-item>
        <app-infor-item
          class="flex-2 mx-2"
          title="销项税"
          :content="item.salestaxrate || '系统未维护'"
        />
        <app-infor-item class="flex-2" title="采购员" :content="item.buyerName" />
      </view>
      <view class="flex justify-between mt-2">
        <app-infor-item class="flex-1" :titleWidth="70" title="两票制货源">
          <span :class="item.twoInvoiceFlag ? 'color-normal' : 'color-never'">{{
            item.twoInvoiceFlag ? '是' : '否'
          }}</span>
        </app-infor-item>
        <app-infor-item class="flex-1 ml-1" :titleWidth="70" title="是否有库存">
          <span :class="item.stockFlag ? 'color-normal' : 'color-never'">{{
            item.stockFlag ? '是' : '否'
          }}</span>
        </app-infor-item>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { InventoryQueryItem } from '../types';
interface IProps {
  item: InventoryQueryItem;
}
defineProps<IProps>();
</script>

<style lang="scss" scoped>
.card {
  background: #f9f9f9;
  box-shadow: 0px 1px 6px 1px rgba(209, 207, 207, 0.3);
}
.tag-default {
  display: inline-block;
  padding: 4px;
  font-size: 12px;
  line-height: 14px;
  color: #333;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-right: 4px;
}
.copy-btn {
  margin-left: 4px;
  padding: 4px 8px;
  background-color: #2271f5;
  color: #fff;
  border-radius: 4px;
}
</style>
