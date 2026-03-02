<template>
  <view class="bg-white pa-2 rounded-md mb-2 position-relative" @click="clickItem">
    <view class="flex items-center">
      <!-- #ifdef H5 -->
      <up-image :show-loading="true" :src="item.smallimglink" width="80px" height="80px"></up-image>
      <!-- #endif -->
      <!-- #ifdef MP-WEIXIN -->
      <up-image width="80" height="80" src="/static/images/no-image.png" />
      <!-- #endif -->
      <view class="pl-2 flex flex-col justify-between flex-1">
        <view>
          <up-tag
            borderColor="transparent"
            :text="item.nearlyEffectiveFlag ? '近效期' : '待处理'"
            :type="item.nearlyEffectiveFlag ? 'warning' : 'error'"
            plain
            plainFill
          ></up-tag>
          <up-tag
            borderColor="transparent"
            v-if="item.narcoticId == 262 || item.narcoticId == 263"
            :text="item.narcoticId == 262 ? '麻醉药品' : '第一类精神药品'"
            type="error"
            plain
            plainFill
          ></up-tag>
          <text class="pl-1">{{ item.goodsId }}/{{ item.goodsName }}</text>
        </view>
        <view class="color-gray-7">{{ item.goodstype }}/{{ item.goodsunit }}</view>
        <view class="flex">
          <app-infor-item
            class="flex-1"
            :title="item.nearlyEffectiveFlag ? '近效期' : '待处理' + '批号数：'"
            :content="
              item.nearlyEffectiveFlag ? item.nearlyEffectiveLotNum : item.waiteProcessotNum
            "
          ></app-infor-item>

          <app-infor-item
            class="flex-1 pl-2"
            title="可销库存："
            :content="item.realtotalgoodsqty"
          ></app-infor-item>
        </view>

        <view class="flex" v-if="!isAsCustom">
          <app-infor-item
            v-if="item.price > 0"
            class="flex-1"
            title="单价："
            :content="`￥${item.price}`"
          ></app-infor-item>
          <app-infor-item
            v-if="item.price > 0"
            class="flex-1 pl-2"
            title="总价："
            :content="`￥${(item.mintotalgoodsqty * item.price).toFixed(2)}`"
          ></app-infor-item>
        </view>
        <view v-if="!isAsCustom && (+item.limitFlag === 2 || +item.limitFlag === 3)">
          <view v-if="+item.limitFlag === 2" class="color-danger">当前货品不可销。</view>
          <view v-else class="color-danger">当前货品既有禁销也有限销，请联系采购处理</view>
        </view>
      </view>
    </view>
    <up-tag
      v-if="item.hadsale"
      class="hadsale"
      text="卖过"
      type="success"
      plain
      plainFill
      borderColor="transparent"
    ></up-tag>

    <!--  -->
  </view>
</template>

<script lang="ts" setup>
const props = defineProps({
  item: {
    type: Object,
    default: () => {},
  },
  isAsCustom: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['click']);

const clickItem = () => {
  emit('click');
};
</script>

<style lang="scss" scoped>
.hadsale {
  position: absolute;
  right: 0;
  top: 0;
}
</style>
