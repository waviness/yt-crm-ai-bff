<template>
  <view class="customer-card-warp">
    <view
      class="customer-card-warp-header flex flex-justify-between text-14 color-gray-4 px-3"
      @click="customerTrendClick"
    >
      <view class="flex items-center">
        <app-icon name="kehuqushi" size="14" color="#969799" />
        <text class="pl-2">客户趋势看板</text>
      </view>
      <up-icon name="arrow-right" size="14" />
    </view>
    <view class="customer-card-warp-content px-4 pb-4 position-relative">
      <up-loading-icon v-if="loading" />
      <view class="customer-card-warp-content_card pt-10">
        <view class="pb-3">
          <view
            class="customer-card-warp-content_progress"
            v-for="(data, index) in dataList"
            :key="'customer' + index"
          >
            <up-line-progress
              class="mb-1"
              :percentage="data.progress"
              :activeColor="getProgressColor(index)"
              :inactiveColor="'rgba(100,101,102,0.4)'"
              :showText="false"
              height="32"
            />
            <text class="text">{{ data.progress }}%</text>
          </view>
        </view>
        <view class="flex-2 flex flex-col color-gray-5">
          <view
            class="flex flex-justify-between items-center pb-10"
            v-for="(data, index) in dataList"
            :key="'customerlist' + index"
          >
            <view class="text-14 flex items-center">
              <view class="circle" :class="'circle-' + (index + 1)" />
              <text>{{ data.customerOpClassName }}（{{ data.progress }}%）</text>
            </view>
            <view>{{ data.salesAmount }} (万元)</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { EntryObj } from '../../types';
const { formatPercentage, formatTenThousand } = useFormatter();
interface IProps {
  entryObj: EntryObj;
}
const props = defineProps<IProps>();
const emit = defineEmits(['brandClick']);
const loading = ref(false);
const dataList = ref<any[]>([]);
const dashboardStore = useDashboardStore();
const getProgressColor = (index: number) => {
  if (index === 0) return '#002A7C';
  if (index === 1) return '#0052D9';
  return '#B5C7FF';
};
const _getCustomerCategorySales = async () => {
  loading.value = true;
  try {
    const params = {
      deptId: props.entryObj.deptId,
      orderColumn: 'salesAmount',
      orderType: '0',
      selectDate: dashboardStore.dateTime,
      timeDimFlag: 1,
    };
    const res = await DashboardService.getCustomerCategorySales(params);
    const totalValueArr: number[] = res.data.slice(0, 3).map((item: any) => item.salesAmount);
    dataList.value = res.data.slice(0, 3).map((val: any) => ({
      salesAmount: formatTenThousand(val.salesAmount),
      progress: Number(
        arithmetic.multiply(+arithmetic.divide(val.salesAmount, arithmetic.sum(totalValueArr)), 100)
      ).toFixed(1),
      periodComparePercent: formatPercentage(val.periodComparePercent),
      periodCompareNetIncrease: formatTenThousand(val.periodCompareNetIncrease),
      customerOpClassName: val.customerOpClassName,
      customerOpClassId: val.customerOpClassId,
    }));
  } catch (error) {
    console.error('获取客户分类销售数据失败:', error);
    uni.showToast({
      title: '获取数据失败',
      icon: 'none',
    });
  } finally {
    loading.value = false;
  }
};

const customerTrendClick = () => {
  router.push(
    '/subpackages/dashboard/customer-trend-page?deptId=' +
      props.entryObj.deptId +
      '&deptName=' +
      props.entryObj.deptName +
      '&deptLevel=' +
      props.entryObj.deptLevel
  );
};

onMounted(() => {
  _getCustomerCategorySales();
});
</script>
<style lang="scss">
.customer-card-warp {
  border-radius: 30px;
  border: 1px solid #e7e7e7;

  &-header {
    padding: 15px;
    margin-bottom: 10px;
    border-bottom: 1px solid #ebedf0;
  }

  &-content {
    &_progress {
      position: relative;

      .text {
        font-size: 16px;
        position: absolute;
        right: 15px;
        top: 6px;
        font-weight: 600;
      }
    }

    &_card {
      height: 220px;

      .circle {
        width: 6px;
        height: 6px;
        display: inline-block;
        border-radius: 3px;
        margin-right: 4px;

        &-1 {
          background: #002a7c;
        }

        &-2 {
          background: #0052d9;
        }

        &-3 {
          background: #b5c7ff;
        }
      }
    }
  }
}
</style>
