<template>
  <view class="card">
    <view class="card-header text-14 color-gray-4 px-3" @click="jumpToInnovation">
      <view class="flex items-center">
        <app-icon name="chuangxinpinzhong" size="14" color="#969799" />
        <text class="pl-2">创新品种看板</text>
      </view>
      <up-icon name="arrow-right" size="14" />
    </view>

    <view class="card-content position-relative px-4 pb-4">
      <up-loading-icon v-show="loading" type="circle" color="#3561F2" class="block-loading" />
      <!-- 中间部分：销售额和增长率 -->
      <view v-if="!loading" class="summary">
        <view class="total-sales">{{ totalSales }}万元</view>
        <view class="summary-info">
          <text class="left-text">近三年上市新药</text>
          <text class="right-text positive">{{ growthRate }}</text>
        </view>
      </view>

      <view class="chart-and-data" v-if="!loading">
        <!-- 左侧环形图 -->
        <view class="chart-container">
          <!-- 使用 qiun-data-charts 替代 echarts -->
          <qiun-data-charts
            type="ring"
            :chartData="ringChartData"
            :opts="chartOpts"
            class="pie-chart"
          />
        </view>

        <!-- 右侧年份数据 -->
        <view class="data-list">
          <view class="data-item" v-for="(item, index) in chartData" :key="index">
            <view class="data-label">
              <view :style="{ backgroundColor: item.color }" class="dot"></view>
              <text>{{ item.year }}年新药</text>
            </view>
            <view class="data-value">
              <text>{{ item.sales }}万元</text>
              <text>{{ item.growthRateDisplay }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import qiunDataCharts from '@/subpackages/dashboard/uni_modules/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.vue';
const { formatTenThousand } = useFormatter();
const dashboardStore = useDashboardStore();

interface IProps {
  entryObj: {
    deptId: string;
    deptName: string;
    [key: string]: any;
  };
}

const props = defineProps<IProps>();

const totalSales = ref('--');
const growthRate = ref('--');
const chartData = ref<Array<any>>([]);
const loading = ref(false);
const colors = ['#f56c6c', '#f7ba2a', '#3561f2', '#67c23a', '#909399'];

// 环形图数据
// 显式为环形图数据建模，避免 series 推断为 never[]
interface RingDataItem {
  name: string;
  value: number;
}
interface RingSeries {
  data: RingDataItem[];
}
interface RingChartData {
  categories: string[];
  series: RingSeries[];
}

const ringChartData = ref<RingChartData>({
  categories: [],
  series: [],
});

// 图表配置
const chartOpts = ref({
  padding: [0, 0, 0, 0],
  legend: {
    show: false,
  },
  dataLabel: false, // 关闭数据标签
  extra: {
    ring: {
      ringWidth: 35, // 环形宽度，调整这个值可以控制环的粗细
      offsetAngle: 0, // 起始角度
      labelWidth: 15,
      border: false,
      centerText: {
        text: '', // 不显示中心文字
        fontSize: 0,
      },
    },
  },
});

const fetchData = async () => {
  try {
    loading.value = true;
    const params = {
      selectedDate: dashboardStore.dateTime,
      deptId: props.entryObj.deptId,
      timeDimFlag: 1,
    };
    console.log('[InnovationCard] fetchData start, params:', params);
    const res = await DashboardService.getDeptNewSaleGoodsStat(params);
    console.log('[InnovationCard] fetchData res:', res);

    if (res.code === '200' && res.data && res.data.length >= 2) {
      // 第一个元素是总数据（yearNum为0）
      const totalData = res.data[0];
      if (totalData) {
        totalSales.value = formatTenThousand(totalData.salesAmount);

        if (totalData.periodComparePercent != null && !isNaN(totalData.periodComparePercent)) {
          const p = Number(totalData.periodComparePercent) * 100;
          growthRate.value = `${p > 0 ? '+' : ''}${p.toFixed(1)}%`;
        } else {
          growthRate.value = '--';
        }
      }

      // 第二个元素是年份数据数组，取前3个
      const yearDataArray = res.data[1];
      if (Array.isArray(yearDataArray)) {
        const recentThreeYears = yearDataArray.slice(0, 3);

        // 格式化年份数据
        chartData.value = recentThreeYears.map((item: any, index: number) => {
          const rawSales = Number(item.salesAmount) || 0;
          const percentNum =
            item.periodComparePercent != null && !isNaN(item.periodComparePercent)
              ? Number(item.periodComparePercent) * 100
              : null;
          const growthDisplay =
            percentNum != null ? `${percentNum > 0 ? '+' : ''}${percentNum.toFixed(1)}%` : '--';

          return {
            year: item.yearNum,
            sales: formatTenThousand(item.salesAmount),
            growthRate: percentNum,
            growthRateDisplay: growthDisplay,
            color: colors[index] || colors[0],
            value: rawSales,
          };
        });

        // 准备环形图数据 - 按u-charts要求的格式
        ringChartData.value = {
          categories: [], // 保持结构一致
          series: [
            {
              data: chartData.value.map(item => ({
                name: `${item.year}年`,
                value: item.value as number, // item.value 已是 number，这里确保类型一致
              })),
            },
          ],
        };

        // 设置图表颜色
        chartOpts.value.color = chartData.value.map(item => item.color);
      }
    }
  } catch (error) {
    console.error('获取数据失败:', error);
  } finally {
    // 保证 loading 在异常或早期返回时也会被清除
    loading.value = false;
  }
};

const jumpToInnovation = () => {
  uni.navigateTo({
    url:
      '/subpackages/dashboard/innovation-page?deptId=' +
      (props.entryObj?.deptId || '') +
      '&deptName=' +
      (props.entryObj?.deptName || '') +
      '&titleName=创新品种',
  });
};

onMounted(() => {
  fetchData();
});
</script>

<style lang="scss" scoped>
.card {
  margin-top: 10px;
  border-radius: 30px;
  border: 1px solid #e7e7e7;
}

.card-header {
  padding: 15px;
  border-bottom: 1px solid #ebedf0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  min-height: 60px;
  display: flex;
  flex-direction: column;
  padding: 10px 15px;
}

.block-loading {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.summary {
  margin-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.total-sales {
  font-size: 28px;
  font-weight: bold;
}

.summary-info {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #666;
  margin: 5px 0 10px;
}

.summary-info .left-text {
  color: #666;
}

.summary-info .right-text {
  font-weight: bold;
}

.summary-info .positive {
  color: #2271f5;
}

.chart-and-data {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pie-chart {
  width: 160px;
  height: 160px;
}

.data-list {
  flex: 1;
}

.data-item {
  margin-bottom: 12px;
}

.data-label {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

.data-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: #2271f5;
}
</style>
