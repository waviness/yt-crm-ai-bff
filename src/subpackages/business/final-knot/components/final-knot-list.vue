<template>
  <view class="card pa-2 mb-2 rd-md flex flex-col" bg="white" @click="toDetail">
    <view class="flex justify-between mb-2">
      <text class="font-bold">#{{ item.zdId }}</text>
      <text>{{ item.credate?.substring(0, 10) }}</text>
    </view>
    <app-infor-item class="mb-2" title="供应商" :content="`${item.supplyId}/${item.supplyName}`" />
    <app-infor-item class="mb-2" title="生成产家" :content="`${item.factoryname}`" />
    <app-infor-item class="mb-2" title="品种" :content="`${item.goodsId}/${item.goodsName}`" />
    <app-infor-item class="mb-2" title="规格">
      <text class="color-main">{{ item.goodsType }}</text>
    </app-infor-item>
    <app-infor-item class="mb-2" title="核算单元" :content="`${item.entryName}`" />
  </view>
</template>

<script lang="ts" setup>
import type { FinalKnotItem } from '../types';

interface Props {
  item: FinalKnotItem;
}

const props = defineProps<Props>();
const emit = defineEmits(['toDetail']);

// // 获取状态显示文本
// const getStatusText = (status: FinalKnotStatus): string => {
//   switch (status) {
//     case FinalKnotStatus.PENDING:
//       return '待处理'
//     case FinalKnotStatus.IN_PROGRESS:
//       return '处理中'
//     case FinalKnotStatus.COMPLETED:
//       return '已完成'
//     case FinalKnotStatus.CANCELLED:
//       return '已取消'
//     default:
//       return '未知'
//   }
// }

// 查看详情
const toDetail = () => {
  emit('toDetail');
};
</script>

<style lang="scss" scoped>
.card {
  box-shadow: 0 1px 6px 1px rgb(209 207 207 / 30%);
}
</style>
