# @qiun/ucharts 在 uni-app 项目中的使用指南

# 项目中使用方式二

## 一、安装状态检查

通过检查你的 `package.json` 文件，发现 `@qiun/ucharts` 已经安装（版本：2.5.0-20230101），因此不需要重新安装。

```json
"@qiun/ucharts": "2.5.0-20230101"
```

## 二、使用方式

在 uni-app 项目中，使用 `@qiun/ucharts` 有两种主要方式：

### 方式一：直接使用 API（基础方式）

适用于需要高度自定义图表的场景。

#### 1. 创建组件

```vue
<template>
  <view class="chart-container">
    <canvas
      id="my-chart"
      canvas-id="my-chart"
      :style="{ width: chartWidth + 'px', height: chartHeight + 'px' }"
      @touchstart="touchStart"
      @touchmove="touchMove"
      @touchend="touchEnd"
    ></canvas>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import uCharts from '@qiun/ucharts';

const chart = ref<uCharts | null>(null);
const chartWidth = ref(375);
const chartHeight = ref(200);

// 图表数据
const chartData = {
  categories: ['2020-01', '2020-02', '2020-03', '2020-04', '2020-05'],
  series: [{ name: '销量', data: [15, 20, 45, 37, 4], color: '#1890FF' }],
};

// 图表配置
const opts = {
  width: chartWidth.value,
  height: chartHeight.value,
  dataLabel: true,
  dataPointShape: true,
  extra: {
    line: {
      type: 'straight',
      width: 2,
    },
  },
};

// 初始化图表
onMounted(() => {
  nextTick(() => {
    // 获取容器尺寸
    uni
      .createSelectorQuery()
      .select('.chart-container')
      .boundingClientRect(res => {
        chartWidth.value = res.width;
        chartHeight.value = res.height;
        opts.width = chartWidth.value;
        opts.height = chartHeight.value;

        // 初始化图表
        chart.value = new uCharts({
          $this: this,
          canvasId: 'my-chart',
          type: 'line',
          legend: true,
          categories: chartData.categories,
          series: chartData.series,
          ...opts,
        });
      })
      .exec();
  });
});

// 触摸事件处理
const touchStart = (e: any) => {
  chart.value?.touchStart(e);
};

const touchMove = (e: any) => {
  chart.value?.touchMove(e);
};

const touchEnd = (e: any) => {
  chart.value?.touchEnd(e);
};
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 200px;
  padding: 20rpx;
  box-sizing: border-box;
}
</style>
```

### 方式二：使用 qiun-data-charts 组件（推荐）

通过 uni_modules 安装 `qiun-data-charts` 组件，使用更简单、便捷。

#### 1. 安装组件

```bash
# 通过 HBuilderX 安装（推荐）
# 在 HBuilderX 中，点击「工具」->「插件安装」->「uni_modules」-> 搜索「qiun-data-charts」并安装

# 或通过 npm 安装
npm install @qiun/ucharts-uniapp
```

#### 2. 配置 easycom（自动导入）

在 `pages.json` 中添加 easycom 配置，使组件可以自动导入：

```json
"easycom": {
  "autoscan": true,
  "custom": {
    "^qiun-data-charts": "@/uni_modules/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.vue"
  }
}
```

#### 3. 使用组件

```vue
<template>
  <view class="container">
    <!-- 柱状图 -->
    <qiun-data-charts
      type="bar"
      :canvas2d="true"
      :chartData="barData"
      :opts="barOpts"
      :width="chartWidth"
      :height="chartHeight"
    />

    <!-- 折线图 -->
    <qiun-data-charts
      type="line"
      :canvas2d="true"
      :chartData="lineData"
      :opts="lineOpts"
      :width="chartWidth"
      :height="chartHeight"
    />

    <!-- 仪表盘 -->
    <qiun-data-charts
      type="arcbar"
      :canvas2d="true"
      :chartData="gaugeData"
      :opts="gaugeOpts"
      :width="chartWidth"
      :height="chartHeight"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const chartWidth = ref(375);
const chartHeight = ref(200);

// 柱状图数据和配置
const barData = {
  categories: ['1月', '2月', '3月', '4月', '5月'],
  series: [
    { name: '销量', data: [120, 200, 150, 80, 70] },
    { name: '利润', data: [60, 90, 75, 40, 35] },
  ],
};

const barOpts = {
  color: ['#1890FF', '#91CB74'],
  padding: [15, 15, 0, 15],
  xAxis: {
    disableGrid: false,
    axisLine: false,
  },
  yAxis: {},
  extra: {
    bar: {
      type: 'group',
      width: 30,
      barBorderCircle: true,
    },
  },
};

// 折线图数据和配置
const lineData = {
  categories: ['1月', '2月', '3月', '4月', '5月'],
  series: [
    { name: '销量', data: [120, 200, 150, 80, 70] },
    { name: '利润', data: [60, 90, 75, 40, 35] },
  ],
};

const lineOpts = {
  color: ['#1890FF', '#91CB74'],
  padding: [15, 15, 0, 15],
  xAxis: {
    disableGrid: false,
    axisLine: false,
  },
  yAxis: {},
  extra: {
    line: {
      type: 'straight',
      width: 2,
    },
  },
};

// 仪表盘数据和配置
const currentValue = -15.8;
const normalizedValue = (currentValue + 100) / 2;

const gaugeData = {
  categories: [''],
  series: [{ name: '数值', data: [normalizedValue] }],
};

const gaugeOpts = {
  color: ['#ff4444', '#ff9900', '#00cc66', '#3366ff'],
  title: { show: false },
  dataLabel: { show: true, text: `${currentValue}%` },
  extra: {
    arcbar: {
      type: 'solid',
      width: 20,
      backgroundColor: '#E8E8E8',
      startAngle: 180,
      endAngle: 360,
      colorSection: [
        { start: 0, end: 25, color: '#ff4444' }, // -100~-50
        { start: 25, end: 50, color: '#ff9900' }, // -50~0
        { start: 50, end: 75, color: '#00cc66' }, // 0~50
        { start: 75, end: 100, color: '#3366ff' }, // 50~100
      ],
    },
  },
};

// 获取容器尺寸
onMounted(() => {
  uni
    .createSelectorQuery()
    .select('.container')
    .boundingClientRect(res => {
      chartWidth.value = res.width;
      chartHeight.value = res.height / 3; // 为三个图表分配高度
    })
    .exec();
});
</script>

<style scoped>
.container {
  width: 100%;
  height: 600px;
  padding: 20rpx;
  box-sizing: border-box;
  background-color: #fff;
}
</style>
```

## 三、多端兼容注意事项

1. **Canvas 2D 支持**：
   - 在小程序中使用 `:canvas2d="true"` 开启 Canvas 2D 接口，支持同层渲染且性能更佳
   - H5 端自动支持 Canvas 2D

2. **尺寸计算**：
   - 使用 `uni.createSelectorQuery` 动态获取容器尺寸，确保在不同设备上正确显示
   - 避免使用固定像素值，推荐使用 rpx 或百分比

3. **数据格式**：
   - 确保数据格式符合 uCharts 要求
   - 对于特殊图表（如仪表盘），需要进行数据归一化处理

4. **样式适配**：
   - 使用 uni-app 的条件编译处理不同平台的样式差异
   - 注意小程序和 H5 在 Canvas 样式上的差异

## 四、常见问题解决

1. **图表不显示**：
   - 检查容器尺寸是否正确
   - 确保 Canvas 2D 配置正确
   - 检查数据格式是否符合要求

2. **小程序编译错误**：
   - 确保 easycom 配置正确
   - 检查组件是否正确安装
   - 重启开发工具和编译服务

3. **颜色或样式问题**：
   - 检查颜色数组配置
   - 确保 extra 配置正确
   - 参考官方文档调整样式参数

## 五、官方文档

- [@qiun/ucharts 官方文档](https://gitee.com/uCharts/uCharts)
- [qiun-data-charts 组件文档](https://gitee.com/uCharts/qiun-data-charts)

以上就是在 uni-app 项目中使用 @qiun/ucharts 的完整指南，你可以根据自己的需求选择合适的使用方式。
