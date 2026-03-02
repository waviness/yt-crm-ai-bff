<template>
  <view class="bg-white px-10">
    <!-- 逾期账款视图 (active=1, tabType=0) -->
    <view
      v-if="+activeType === 1 && +tabType === 0"
      class="list-card"
      v-for="(data, index) in dataList"
      :key="index"
      @click="toDetail(data)"
    >
      <view class="flex justify-between align-center">
        <!-- 左侧：部门名 + 金额 -->
        <view class="flex-1">
          <view class="label py-2 flex align-center">
            <view class="block mt-1"></view>
            <text class="color-gray-5 font-500 text-16 ml-2">{{ data.deptName }}</text>
          </view>
          <view class="color-danger font-500 text-20 mt-1">{{ data.overdueAmount }}</view>
          <view class="color-gray-5 text-14 mt-1 mb-2">逾期金额(截止昨日)</view>
        </view>

        <!-- 中间：环形图 -->
        <view class="flex-1 flex align-center chart-center">
          <view class="circle-chart-wrap">
            <qiun-data-charts
              type="ring"
              :opts="getRingChartOpts(data.percent, '#ea394b')"
              :chartData="getRingChartData(data.percent)"
            />
          </view>
        </view>

        <!-- 右侧：箭头 -->
        <u-icon name="arrow-right" size="18" />
      </view>
    </view>

    <!-- 长账龄视图 (active=1, tabType=1) -->
    <view
      v-if="+activeType === 1 && +tabType === 1"
      class="list-card"
      v-for="(data, index) in dataList"
      :key="index"
      @click="toDetail(data)"
    >
      <view class="flex justify-between align-center">
        <!-- 左侧：部门名 + 金额 -->
        <view class="flex-1">
          <view class="label py-2 flex align-center">
            <view class="block mt-1"></view>
            <text class="color-gray-5 font-500 text-16 ml-2">{{ data.deptName }}</text>
          </view>
          <view class="color-danger font-500 text-20 mt-1">{{ data.amount }}</view>
          <view class="color-gray-4 text-14 mt-1 mb-2">长账龄金额</view>
        </view>

        <!-- 中间：环形图 -->
        <view class="flex-1 flex align-center chart-center">
          <view class="circle-chart-wrap">
            <qiun-data-charts
              type="ring"
              :opts="getRingChartOpts(data.percent, '#ea394b')"
              :chartData="getRingChartData(data.percent)"
            />
          </view>
        </view>

        <!-- 右侧：箭头 -->
        <u-icon name="arrow-right" size="18" />
      </view>
    </view>

    <!-- 应收账款视图 (active=2) -->
    <view
      v-if="+activeType === 2"
      class="list-card"
      v-for="(data, index) in dataList"
      :key="index"
      @click="toDetail(data)"
    >
      <!-- 顶部：部门名 + 箭头 -->
      <view class="flex justify-between align-center py-2">
        <view class="label flex align-center">
          <view class="block mt-1"></view>
          <text class="color-gray-5 font-500 text-16 ml-2">{{ data.deptName }}</text>
        </view>
        <u-icon name="arrow-right" size="18" />
      </view>

      <!-- 底部：进度条 + 数据 -->
      <view class="pb-2 text-16">
        <u-line-progress
          :percentage="data.percent"
          activeColor="#3561F2"
          inactiveColor="#f5f5f5"
          :show-text="false"
          height="26"
          class="mb-1 mt-2 mx-2"
        />
        <view class="flex justify-between mt-2 progress-bottom-row">
          <view class="progress-bottom-item">
            <view class="progress-value-row">
              <text class="dot color-main-3">•</text>
              <text class="progress-bottom-value color-main-3">{{ data.thisAmount }}</text>
            </view>
            <view class="progress-bottom-label color-gray-5">本月应收账款</view>
          </view>
          <view class="progress-bottom-item">
            <view class="progress-value-row">
              <text class="dot gray-dot">•</text>
              <text class="progress-bottom-value color-main-3">{{ data.amount }}</text>
            </view>
            <view class="progress-bottom-label color-gray-5">总应收账款</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { OverdueItem } from '../../types/overdue-page';

import qiunDataCharts from '@/subpackages/dashboard/uni_modules/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.vue';
interface Props {
  dataList: OverdueItem[];
  activeType: number;
  tabType: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  toDetail: [data: OverdueItem];
}>();

const toDetail = (data: OverdueItem) => {
  emit('toDetail', data);
};

// 环形图配置 (ring类型)
const getRingChartOpts = (percent: number, color: string) => {
  return {
    color: [color, '#f5f5f5'],
    padding: [0, 0, 0, 0],
    dataLabel: false,
    title: {
      name: percent.toFixed(1) + '%',
      color: color,
      fontSize: 14,
      fontWeight: 'bold',
    },
    subtitle: {
      name: '',
    },
    legend: {
      show: false,
    },
    extra: {
      ring: {
        ringWidth: 10,
        borderWidth: 0,
        borderColor: '#FFFFFF',
        linearType: 'none',
        activeOpacity: 1,
        activeRadius: 0,
      },
    },
  };
};

// 环形图数据 (ring类型)
const getRingChartData = (percent: number) => {
  return {
    series: [
      {
        name: '占比',
        data: percent / 100,
      },
      {
        name: '其他',
        data: (100 - percent) / 100,
      },
    ],
  };
};

// 保留旧的arcbar配置函数，以防有其他地方使用
const getChartOpts = (percent: number, color: string) => {
  return {
    color: [color],
    padding: [0, 0, 0, 0],
    title: {
      name: percent.toFixed(1) + '%',
      color: color,
      fontSize: 14,
      fontWeight: 'bold',
    },
    subtitle: {
      name: '',
      color: '#666666',
      fontSize: 12,
    },
    extra: {
      arcbar: {
        type: 'default',
        width: 10,
        backgroundColor: '#f5f5f5',
        startAngle: 0.75,
        endAngle: 0.25,
        gap: 2,
      },
    },
  };
};

// 环形图数据
const getChartData = (percent: number) => {
  return {
    series: [
      {
        name: '占比',
        data: percent / 100,
        color: '#ea394b',
      },
    ],
  };
};
</script>

<style lang="scss" scoped>
.list-card {
  border-bottom: 1px solid #ebedf0;
  padding: 4px 0;
}

.block {
  width: 6px;
  height: 16px;
  background: #3561f2;
  border-radius: 3px;
}

.circle-chart-wrap {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  margin-top: 20px;
}

.chart-center {
  justify-content: flex-end;
}

.progress-bottom-row {
  padding: 0 10px;
}

.progress-bottom-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.progress-value-row {
  display: flex;
  align-items: center;
}

.progress-bottom-value {
  font-size: 18px;
  font-weight: 500;
}

.progress-bottom-label {
  font-size: 12px;
  margin-top: 2px;
  margin-left: 18px;
}

.dot {
  font-size: 18px;
  vertical-align: middle;
}

.gray-dot {
  color: #ebebeb;
}
</style>
