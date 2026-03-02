<template>
  <view class="card pa-2 mb-2 rd-md flex flex-col bg-white" @click="toDetail">
    <view class="flex justify-between mb-2">
      <text class="font-bold">#{{ item.recheckId }}</text>
      <text class="color-gray-4">{{ item.creDate }}</text>
    </view>
    <view class="flex justify-between mb-2">
      <text class="color-main font-bold">{{ getComeFromText }}</text>
      <text class="text-12 color-gray-5">核算单元 {{ item.entryId }}</text>
    </view>
    <app-infor-item class="mb-2" title="货品信息" :content="`${item.goodsId}/${item.goodsName}`" />
    <app-infor-item class="mb-2" title="厂家" :content="item.factoryName" />
    <!-- 🔥 修复这里：不要重复 title，直接用 slot -->
    <app-infor-item class="mb-2" title="内容">
      <text>{{ item.memo }}</text>
    </app-infor-item>
    <view class="flex justify-end pt-2" v-if="selectType === 0 && buttonShow">
      <up-button
        text="立即处理"
        type="primary"
        size="small"
        shape="circle"
        :customStyle="{ width: '160rpx', height: '56rpx' }"
        @click.stop="toDetail"
      ></up-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { QualityReviewItem } from '../types';

interface Props {
  item: QualityReviewItem;
  selectType: number;
  buttonShow: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['toDetail']);

const getComeFromText = computed(() => {
  const { comeFrom } = props.item;
  return comeFrom === 10
    ? '入库收货'
    : comeFrom === 13
      ? '销退验收'
      : comeFrom === 12
        ? '销退收货'
        : '';
});

const toDetail = () => {
  emit('toDetail');
};
</script>

<style lang="scss" scoped>
.card {
  box-shadow: 0 1px 6px 1px rgb(209 207 207 / 30%);
}
</style>
