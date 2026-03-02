<template>
  <view class="innovation-card" @tap="handleClick">
    <view class="card-header">
      <view class="year-name">{{ dataItem.year }}年新药</view>
      <u-icon name="arrow-right" size="16" color="#dcdcdc"></u-icon>
    </view>

    <view class="card-body">
      <view class="sale-num">{{ dataItem.sales }}万元</view>
      <view class="right-content">
        <app-icon :name="numericGrowth < 0 ? 'rise-red' : 'fall-green'" multi></app-icon>
        <text class="change-value" :class="numericGrowth > 0 ? 'positive' : 'negative'">
          {{ displayGrowth === '--' ? displayGrowth : displayGrowth + '%' }}
        </text>
      </view>
    </view>

    <!-- 进度条 -->
    <view class="progress-bar">
      <view class="progress-inner" :style="{ width: dataItem.progress + '%' }"></view>
    </view>
  </view>
</template>

<script lang="ts" setup>
interface DataItem {
  year: string | number;
  sales: string;
  // growthRate: 展示字符串 (例如 '+12.3%')
  growthRate: string;
  // growthRateNum: 可选的数值形式，例如 12.3 (表示百分比数值，不带 %)，优先使用此字段做数值判断/计算
  growthRateNum?: number | null;
  progress: string;
}

interface Props {
  dataItem: DataItem;
}

const props = defineProps<Props>();
const emit = defineEmits(['detail-click']);

import { computed } from 'vue';

// 计算安全的数值型同比：优先使用 growthRateNum（已是 0..100 区间的数值），
// 否则尝试从 growthRate 格式化字符串中解析数字（去掉 % 和 + 号），失败则返回 0
const numericGrowth = computed(() => {
  const d: any = props.dataItem as any;
  if (d.growthRateNum !== undefined && d.growthRateNum !== null && !isNaN(d.growthRateNum)) {
    return Number(d.growthRateNum);
  }
  const s = d.growthRate || '';
  // 去掉百分号、加号、逗号和空格
  const cleaned = String(s).replace(/[%+,\s]/g, '');
  const n = Number(cleaned);
  return isNaN(n) ? 0 : n;
});

// 保留一位小数的展示值（返回字符串：'--' 或 数字字符串），使用 numericGrowth 作为来源
const displayGrowth = computed(() => {
  const n = numericGrowth.value;
  if (n === null || n === undefined || isNaN(n)) return '--';
  // 保证显示为一位小数
  try {
    return Math.abs(Number(n)).toFixed(1);
  } catch (e) {
    return '--';
  }
});

const handleClick = () => {
  emit('detail-click', props.dataItem);
};
</script>

<style lang="scss" scoped>
.innovation-card {
  background: #fff;
  border-radius: 30px;
  border: 1px solid #c8c9cc;
  margin-bottom: 16rpx;
  padding: 20rpx 32rpx;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.year-name {
  font-size: 28rpx;
  color: #969799;
}

.card-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.sale-num {
  font-size: 56rpx;
  font-weight: bold;
  color: #333;
}

.right-content {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.change-value {
  font-size: 32rpx;
  font-weight: bold;
}

.change-value.positive {
  color: #00a870;
}

.change-value.negative {
  color: #f56c6c;
}

.progress-bar {
  height: 16rpx;
  background-color: #ebedf0;
  border-radius: 8rpx;
  overflow: hidden;
}

.progress-inner {
  height: 100%;
  background-color: #3561f2;
  border-radius: 8rpx;
  transition: width 0.3s ease;
}
</style>
