<template>
  <view class="card" @click="toDetail">
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
          <!-- <up-button name="fuzhi" size="mini" type="primary" text="复制"></up-button> -->
          <!-- <app-icon name="fuzhi" class="color-main-2 ml-1" /> -->
        </up-copy>
      </app-infor-item>

      <view class="flex justify-between mt-2">
        <app-infor-item class="flex-3" title="规格" :content="item.goodsType" />
        <app-infor-item class="flex-2 ml-1" title="产地">
          <view>{{ item.prodArea || '主档信息暂未维护' }}</view>
        </app-infor-item>
      </view>
      <view class="flex justify-between mt-2">
        <app-infor-item
          class="flex-3"
          title="储备计划数量"
          :content="item.reservePlanQuantity || '0'"
        />
        <app-infor-item class="flex-2 mx-2" title="销项税" :content="item.salestaxrate || '0'" />
        <app-infor-item class="flex-2" title="采购员" :content="item.buyerName" />
      </view>

      <view class="flex justify-between mt-2">
        <app-infor-item contentClass="pl-2" title="可销库存" :content="item.goodsQuantity || '0'" />
        <app-infor-item contentClass="pl-2" class="ml-1" title="最小开票数量">
          <view>{{ item.minSaleQuantity || '0' }}</view>
        </app-infor-item>
      </view>

      <view class="flex justify-between mt-2">
        <app-infor-item
          contentClass="pl-2"
          title="跟标医院限价"
          :content="item.hospitalLimitPrice || '-'"
        />
        <view>
          <view class="tag-default"
            >{{
              item.coldFlag === 0 || item.coldFlag === null ? '非' : item.coldFlag === 1 ? '' : ''
            }}冷链</view
          >
          <view
            class="tag-default"
            v-for="(global, globalIndex) in item.globalGoodsTagList"
            :key="globalIndex"
            >{{ global }}</view
          >
        </view>
      </view>
    </view>
    <view class="py-2 flex flex-row justify-end">
      <up-button
        @click.stop="searchLimit"
        :customStyle="{ width: '120px', margin: '0px 5px' }"
        size="small"
        type="primary"
        shape="circle"
        text="查看可销库存下限"
      ></up-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { InventoryQueryItem } from '../types';
interface IProps {
  item: InventoryQueryItem;
}
const props = defineProps<IProps>();

const emit = defineEmits(['toDetail', 'searchLimit']);

const toDetail = async (e: any) => {
  let event: any = e || window.event;
  let target: any = event ? event?.target || event.srcElement : {};
  if (target && target.id === 'copy_custsetinfor') {
    return;
  }

  emit('toDetail');
};
const searchLimit = () => {
  emit('searchLimit');
};
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
