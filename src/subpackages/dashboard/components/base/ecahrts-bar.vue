<template>
  <view class="qiun-box" id="chartBox">
    <!-- 标题 -->
    <view class="chart-title">本年销售堆积图（亿元）</view>
    <!-- 图例（和截图一致） -->
    <view class="chart-legend">
      <view class="legend-item">
        <view class="legend-dot blue"></view>
        <text>2026年</text>
      </view>
      <view class="legend-item">
        <view class="legend-dot green"></view>
        <text>2025年</text>
      </view>
    </view>
    <!-- 秋云图表（核心配置） -->
    <qiun-data-charts
      type="bar"
      canvasId="salesChart"
      :opts="opts"
      :canvas2d="true"
      :chartData="chartData"
      width="750"
      :height="chartHeight"
    />
  </view>
</template>

<script setup lang="ts">
import qiunDataCharts from '@/subpackages/dashboard/uni_modules/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.vue';
const dashboardStore = useDashboardStore();
const props = defineProps({
  currentYearDatalist: {
    type: Array,
    default: () => [],
  },
  lastYearDatalist: {
    type: Array,
    default: () => [],
  },
});
// 图表数据（categories留给组件自动映射Y轴）
const chartData = ref({
  categories: [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ],
  series: [
    {
      name: time.format(new Date(dashboardStore.dateTime), time.FORMATS.YEAR) + '年',
      data: props.currentYearDatalist,
    },
    {
      name: Number(time.format(new Date(dashboardStore.dateTime), time.FORMATS.YEAR)) - 1 + '年',
      data: props.lastYearDatalist,
    },
  ],
});

// 计算动态最大值
const calculateMaxValue = () => {
  const allData = [
    ...(props.currentYearDatalist as number[]),
    ...(props.lastYearDatalist as number[]),
  ].filter(v => typeof v === 'number' && !isNaN(v));

  console.log('所有有效数据:', allData);

  if (allData.length === 0) return 0; // 无数据时返回0

  const max = Math.max(...allData);
  console.log('实际最大值:', max);

  // 简化逻辑:向上取整到最近的整数,并增加20%余量
  const roundedMax = Math.ceil(max);
  const finalMax = roundedMax * 1.2;

  console.log('取整后最大值:', roundedMax);
  console.log('最终最大值(含余量):', finalMax);

  return finalMax;
};

// 核心修复：Y轴配置改为秋云图表要求的格式
const opts = ref({
  color: ['#4080FF', '#2FC25B'],
  padding: [20, 40, 20, 20],
  enableScroll: false,
  legend: { show: false },
  xAxis: {
    type: 'value',
    min: 0,
    max: 35.8, // 初始值,会被动态更新
    disableGrid: true,
    labelCount: 2,
    fontSize: 12,
  },
  yAxis: {
    // 关键：减少Y轴右侧间距，压缩月份区域
    margin: 0,
    disableGrid: false,
    gridType: 'dash',
    gridColor: '#ccc',
    fontSize: 12,
    textStyle: { fontSize: 12 },
  },
  extra: {
    bar: {
      type: 'group',
      width: 25,
      // 点击高亮样式（自定义）
      activeBgColor: '#E6F7FF',
      activeBgOpacity: 0.8,
      activeBorderColor: '#1890FF',
      activeBorderWidth: 1,
      activeBorderRadius: 2,
    },
    tooltip: {
      showBox: true,
      format: (item: any) => `${item.category}\n${item.seriesName} ${item.data}亿元`,
      arrow: true, // 显示提示框箭头
      arrowWidth: 8,
      arrowHeight: 4,
    },
  },
});

// 监听数据变化,动态更新最大值
watch(
  [() => props.currentYearDatalist, () => props.lastYearDatalist],
  () => {
    const maxVal = calculateMaxValue();
    opts.value.xAxis.max = maxVal;
  },
  { immediate: true, deep: true }
);
const chartHeight = ref(0);
// 动态计算容器高度
// 统一获取节点高度（跨端兼容）
const calcChartHeight = () => {
  // uni.createSelectorQuery 是跨端API，H5/小程序都支持
  uni
    .createSelectorQuery()
    .select('#chartBox')
    .boundingClientRect(rect => {
      if (rect && !Array.isArray(rect) && rect.height) {
        // 减去标题+图例的高度（约60px），避免内容截断
        chartHeight.value = rect.height - 120;
      } else {
        // 兜底高度
        chartHeight.value = 500;
      }
    })
    .exec();
};
onMounted(async () => {
  // 页面挂载后计算高度
  await calcChartHeight();
  console.log('chartHeight.value');
  console.log(chartHeight.value);
});
</script>

<style scoped>
.qiun-box {
  width: 100%;
  height: 90%;
  padding: 10px;
  box-sizing: border-box;
  overflow: hidden;
}

/* 标题样式（和截图一致） */
.chart-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

/* 自定义图例（和截图一致） */
.chart-legend {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
  font-size: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.blue {
  background-color: #4080ff;
}

.green {
  background-color: #2fc25b;
}
</style>
