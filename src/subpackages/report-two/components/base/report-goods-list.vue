<template>
  <view class="card flex items-center mt-2" @click="clickItem">
    <!-- #ifdef H5 -->
    <up-image
      width="80"
      height="80"
      :src="
        item.smallimglink &&
        item.smallimglink != '`http://pic.drugoogle.com/medicine/75x66/2010070114525558283.jpg`'
          ? item.smallimglink
          : ''
      "
    />
    <!-- #endif -->
    <!-- #ifdef MP-WEIXIN -->
    <up-image width="80" height="80" src="/static/images/no-image.png" />
    <!-- #endif -->
    <view class="pl-2 flex-1">
      <view class="flex flex-wrap">
        <up-tag
          v-if="item.narcoticId == 262"
          class="mr-1 mb-1"
          plain
          plainFill
          borderColor="transparent"
        >
          麻醉药品
        </up-tag>
        <up-tag
          v-if="item.narcoticId == 263"
          class="mr-1 mb-1"
          plain
          plainFill
          borderColor="transparent"
        >
          第一类精神药品
        </up-tag>
        <up-tag
          v-if="item.hadsale"
          type="success"
          borderColor="transparent"
          plain
          plainFill
          class="mr-1 mb-1"
        >
          卖过
        </up-tag>
        <up-tag v-if="item.coldflag" class="mr-1 mb-1" plain plainFill borderColor="transparent">
          冷链
        </up-tag>
        <up-tag
          v-if="item.fsCollection && item.fsCollection.length > 0"
          class="mr-1 mb-1"
          plain
          plainFill
          borderColor="transparent"
        >
          {{ fsCollectionName(item.fsCollection) }}
        </up-tag>
      </view>
      <view class="text-14 font-bold mt-1">{{ item.goodsId }}/{{ item.goodsName }}</view>
      <view class="text-gray-7 mt-1">{{ item.goodstype }}/{{ item.goodsunit }}</view>
      <view class="text-gray-7 mt-1">{{ item.factoryid }}/{{ item.factoryname }}</view>
      <view
        class="flex justify-between mt-1"
        v-if="item.sausestatus && (item.gspusestatus || item.gspusestatus === 0)"
      >
        <text v-if="item.sausestatus !== 1">
          <span class="text-gray-7">销售状态：</span>
          <span :class="item.sausestatus === 1 ? 'text-normal' : 'text-red font-bold'">{{
            item.sausestatus === 1 ? '可销' : '不可销'
          }}</span>
        </text>
        <text v-if="item.gspusestatus !== 1">
          <span class="text-gray-7">质量状态：</span>
          <span :class="item.gspusestatus === 1 ? 'text-normal' : 'text-red font-bold'">
            {{
              item.gspusestatus === 1
                ? '质量可用'
                : item.gspusestatus === 2
                  ? '待首营'
                  : item.gspusestatus === 3
                    ? '质量禁止'
                    : item.gspusestatus === 4
                      ? '首营不通过'
                      : item.gspusestatus === 5
                        ? '未首营'
                        : ''
            }}
          </span>
        </text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { GoodsItem, FsCollectionItem } from '../../types/index';

interface IProps {
  item: GoodsItem;
}

const props = defineProps<IProps>();
const emit = defineEmits(['click']);

const clickItem = () => {
  emit('click');
};
// 根据分类集合获取显示名称
const fsCollectionName = (itemList: FsCollectionItem[]) => {
  if (!itemList || itemList.length === 0) return '';

  if (itemList.every((item: FsCollectionItem) => item.controllevel === 0)) {
    return itemList[0].typename;
  } else {
    for (let index = 0; index < itemList.length; index++) {
      const element = itemList[index];
      if (element.controllevel === 1) {
        return element.typename;
      }
    }
  }
  return '';
};
</script>

<style lang="scss" scoped>
.card {
  background: #fff;
  border-radius: 10px;
  padding: 12px;
}
</style>
