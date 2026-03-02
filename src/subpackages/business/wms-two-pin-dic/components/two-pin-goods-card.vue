<template>
  <view class="card pa-3 mb-2 rd-md flex" bg="white" @click="toDetail">
    <image class="goods-img rd-md" :src="item.smallimglink" mode="aspectFill" />
    <view class="ml-2 flex flex-col justify-between flex-1 text-12">
      <view class="flex items-center">
        <view
          v-if="!isRouter && (item.nearlyEffectiveFlag || item.waiteProcessFlag)"
          class="status-tag mr-1 flex items-center justify-center"
          :class="item.nearlyEffectiveFlag ? 'status-nearly' : 'status-wait'"
        >
          {{ item.nearlyEffectiveFlag ? '近效期' : '待处理' }}
        </view>
        <text class="font-13 font-bold">{{ item.goodsId }}/{{ item.goodsName }}</text>
      </view>
      <text class="color-gray-7">{{ item.goodstype }}/{{ item.goodsunit }}</text>
      <view class="flex items-center" v-if="!isRouter">
        <text class="color-gray-7">待处理批号数:</text>
        <text class="ml-1">{{ item.waiteProcessotNum || 0 }}</text>
        <text class="ml-4 color-gray-7">可销库存:</text>
        <text class="ml-1">{{ item.nearlyEffectiveLotNum || 0 }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { TwoPinGoodsItem } from '../types';

interface Props {
  item: TwoPinGoodsItem;
  isRouter?: boolean; // 是否在详情页使用
}

const props = withDefaults(defineProps<Props>(), {
  isRouter: false,
});

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

.goods-img {
  width: 160rpx;
  height: 160rpx;
}

.status-tag {
  width: 116rpx;
  height: 42rpx;
  border-radius: 3rpx;
  font-size: 24rpx;
}

.status-nearly {
  color: #ed7b2f;
  background: rgb(237 123 47 / 10%);
}

.status-wait {
  color: #ea394b;
  background: rgb(234 57 75 / 10%);
}
</style>
