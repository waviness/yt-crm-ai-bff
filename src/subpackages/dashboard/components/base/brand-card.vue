<template>
  <view class="card mb-2">
    <view class="flex" :class="cardItem.isExp ? 'border-bottom' : ''">
      <!-- @tap="detailClick(cardItem.brandId, cardItem.brandName)" -->
      <view
        class="top-warp flex justify-center"
        :class="[
          index === 0
            ? 'top-warp-bg1'
            : index === 1
              ? 'top-warp-bg2'
              : index === 2
                ? 'top-warp-bg3'
                : 'top-warp-bg4',
          !cardItem.isExp ? 'top-warp-radius' : 'top-warp-radius1',
        ]"
      >
        <text class="text-30">{{ cardItem.topNumber }}</text>
      </view>
      <view class="flex-col flex-2">
        <view class="flex justify-between items-center">
          <view class="pl-10 py-10 pr-4 flex flex-2" @tap.stop="isExpClick">
            <text class="text-14 pr-4">{{ cardItem.brandName }}</text>
            <up-icon :name="cardItem.isExp ? 'arrow-up' : 'arrow-down'"></up-icon>

            <!-- <text class="iconfont" :class="cardItem.isExp ? 'arrow-up' : 'arrow-down'">&#xe601;</text> -->
          </view>
          <view class="px-10 py-10 flex-1" @click="toDetail()">
            <up-icon class="float-right" name="arrow-right"></up-icon>
          </view>
        </view>
        <view class="flex justify-between items-center">
          <text class="font-bold pl-10 text-28">{{ cardItem.value }}万元</text>
          <text class="text-16 pr-10 flex items-center">
            <!-- <text class="iconSvg" :class="cardItem.increment < 0 ? 'rise-red' : 'fall-green'"></text> -->
            <app-icon :name="cardItem.increment < 0 ? 'rise-red' : 'fall-green'" multi></app-icon>
            <text class="pl-1" :class="getColorClass(cardItem.increment)">
              {{ Math.abs(cardItem.increment).toFixed(1) }}%</text
            >
          </text>
        </view>
      </view>
    </view>
    <view class="is-exp-warp positionR" v-if="cardItem.isExp">
      <view v-show="cardItem['loading']" class="block-loading">加载中...</view>
      <view
        class="mx-4 pt-10"
        v-for="(top3Goods, top3GoodsIndex) in cardItem.top3GoodsStatList"
        :key="'goods' + top3GoodsIndex"
      >
        <up-line-progress
          :percentage="top3Goods.progress"
          activeColor="#2271f5"
          :showText="false"
        ></up-line-progress>
        <!-- <view class="progress-bar" :style="{ width: top3Goods.progress + '%' }"></view> -->
        <view class="flex justify-space-between align-center text-14 py-10">
          <text class="flex-3 slh">{{ top3Goods.goodsId }}/{{ top3Goods.goodsName }}</text>
          <text class="color-main-3 flex-2 pl-1">{{ top3Goods.value }}万元</text>
          <text class="flex-1 textAlignR" :class="getColorClass(top3Goods.increment)">
            {{ top3Goods.increment }}</text
          >
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { getColorClass } from '@/utils/number';
// 1. 定义 Props
const props = defineProps({
  cardItem: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});
const emit = defineEmits(['isExpClick', 'toDetail']);
const isExpClick = () => {
  emit('isExpClick');
};
const toDetail = () => {
  emit('toDetail');
};
</script>

<style lang="scss" scoped>
.card {
  border-radius: 30px;
  background-color: white;
  border: 1px solid #e7e7e7;

  .top-warp {
    width: 43px;
    align-items: center;
    color: white;

    &-bg1 {
      background: #003ef5;
    }

    &-bg2 {
      background: #4970f3;
    }

    &-bg3 {
      background: #b5c7ff;
    }

    &-bg4 {
      background: #e7e7e7;
    }

    &-radius {
      border-radius: 30px 0 0 30px;
    }

    &-radius1 {
      border-radius: 30px 0 0;
    }
  }

  .is-exp-warp {
    min-height: 66px;
  }
}

.border-bottom {
  border-bottom: 1px solid #ebedf0;
}

.block-loading {
  text-align: center;
  color: #1989fa;
}
</style>
