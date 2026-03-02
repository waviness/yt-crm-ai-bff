<!-- 客户趋势卡片 -->
<template>
  <view
    class="card-2 px-2 mb-2 @click:detailClick(data) v-for(data, index) in dataList :key(index)"
    :class="borderFlag ? 'border-bottom' : 'border-warp'"
  >
    <view class="title flex justify-between px-10 py-10" @click="detailClick(dataItem)">
      <text class="text-18">{{ dataItem.customerOpClassName }}</text>
      <view class="flex items-center">
        <text class="pl-1 text-20" :class="getColorClass(dataItem.periodComparePercent)">
          {{ dataItem.periodComparePercent }}</text
        >
        <up-icon
          v-if="dataItem.cstmCtgryDeptSalesResList && !noArrowFlag"
          class="ml-4"
          size="18"
          name="arrow-right"
          color="#dcdcdc"
        />
      </view>
    </view>
    <view class="flex px-2">
      <view class="flex-2 flex flex-col justify-between py-2">
        <view class="progress-warp relative mb-1">
          <view class="text text-12 py-1">销售实绩：{{ dataItem.salesAmount }}万元</view>
          <view class="progress" :style="`width:${dataItem.progress || 0}%;`"></view>
        </view>
        <view class="progress-warp relative">
          <view class="text text-12 py-1"
            >去年同期销售实绩：{{ dataItem.lastSalesAmount || 0 }}万元</view
          >
          <view
            class="progress progress-last"
            :style="`width:${dataItem.lastProgress || 0}%;`"
          ></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { getColorClass } from '@/utils/number';

// 定义数据类型
interface DataItem {
  customerOpClassId: string | number;
  customerOpClassName: string;
  periodComparePercent: number;
  salesAmount: number;
  progress: number;
  lastSalesAmount: number;
  lastProgress: number;
  cstmCtgryDeptSalesResList?: any[];
}

// 定义 props
const props = defineProps<{
  dataItem: DataItem;
  borderFlag?: boolean;
  noArrowFlag?: boolean;
}>();
const emit = defineEmits(['detailClick']);
// 点击详情事件
const detailClick = (data: DataItem) => {
  if (!data.cstmCtgryDeptSalesResList) return;
  emit('detailClick');
};
</script>

<style lang="scss" scoped>
.border-warp {
  border: 1px solid #e7e7e7;
}

.border-bottom {
  border-bottom: 1px solid #ebedf0;
}

.card-2 {
  border-radius: 30rpx;
  background-color: #fff;

  .title {
    font-weight: 600;
    border-bottom: 1px solid #dcdcdc;
  }

  .progress-warp {
    height: 30px;
    background-color: #c8c9cc;
    border-radius: 30px;
    overflow: hidden;
    position: relative;

    .progress {
      height: 30px;
      border-radius: 30px;
      background-color: #0052d9;
      transition: width 0.3s ease;
    }

    .progress-last {
      background-color: #1989fa;
    }

    .text {
      color: white;
      position: absolute;
      left: 10px;
      z-index: 1;
      text-shadow: 0 1px 2px rgb(0 0 0 / 20%);
    }
  }
}
</style>
