<template>
  <view class="card">
    <view class="card-header text-14 color-gray-4 px-3" @click="jumpToJc">
      <view class="flex items-center">
        <app-icon name="jicai" size="14" color="#969799" />
        <text class="pl-2">集采看板</text>
      </view>
      <up-icon name="arrow-right" size="14" />
    </view>
    <view class="card-content">
      <up-loading-icon v-show="loading" type="circle" color="#3561F2" class="block-loading" />
      <!-- 占比进度条 -->
      <view class="progress-group" v-if="!loading">
        <view class="progress-bar">
          <view class="progress-segment winning" :style="{ flex: bidPercent }"></view>
          <view class="progress-segment non-winning" :style="{ flex: noBidPercent }"></view>
        </view>
        <view class="progress-labels">
          <view class="label"><view class="dot winning"></view> 中标品种</view>
          <view class="label"><view class="dot non-winning"></view> 备选和未中选品种</view>
        </view>
      </view>

      <!-- 集采看板数据 -->
      <view class="summary" v-if="!loading">
        <view class="text-14">集采看板</view>
        <view class="total-sales">{{ totalSales }}万元</view>
        <view class="total-sales">{{ growthRate > 0 ? '+' : '' }}{{ growthRate }}%</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
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

const loading = ref(false);
const totalSales = ref('');
const growthRate = ref(0);
const bidPercent = ref(0);
const noBidPercent = ref(0);

const getJcTotal = async () => {
  loading.value = true;
  try {
    const params = {
      date: dashboardStore.dateTime,
      deptId: props.entryObj.deptId || '',
      flag: 1,
    };
    const res = await DashboardService.queryJcDataBar(params);
    if (res.data) {
      loading.value = false;
      totalSales.value = formatTenThousand(res.data.sale);
      bidPercent.value = ((res.data.bidSale / res.data.sale) * 100).toFixed(2);
      noBidPercent.value = ((res.data.noBidSale / res.data.sale) * 100).toFixed(2);
      growthRate.value = (res.data.saleTb * 100).toFixed(2);
    }
  } catch (error) {
    console.error('获取集采数据失败:', error);
  } finally {
    loading.value = false;
  }
};

const jumpToJc = () => {
  router.push('/subpackages/dashboard/jicai-page', {
    deptId: props.entryObj.deptId,
    deptName: props.entryObj.deptName,
    titleName: '集采看板',
  });
};

onMounted(() => {
  getJcTotal();
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
  position: relative;
  min-height: 30px;
}

.block-loading {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.progress-group {
  padding: 16px;
}

.progress-bar {
  display: flex;
  height: 26px;
  background-color: #f5f5f7;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-segment {
  height: 100%;
}

.progress-segment.winning {
  background-color: #b5c7ff; /* 中标品种颜色 */
}

.progress-segment.non-winning {
  background-color: #3561f2; /* 备选和未中选品种颜色 */
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #969799;
}

.label {
  display: flex;
  align-items: center;
}

.label .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 4px;
}

.label .dot.winning {
  background-color: #b5c7ff; /* 中标品种颜色 */
}

.label .dot.non-winning {
  background-color: #3561f2; /* 备选和未中选品种颜色 */
}

.summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  font-size: 16px;
  background: #f5f5f7;
  border-radius: 16px;
  margin: 0 16px 16px;
}

.total-sales {
  font-size: 14px;
  font-weight: bold;
  color: #3561f2;
}
</style>
