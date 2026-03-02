<template>
  <view class="bg-white">
    <app-watermark> </app-watermark>
    <salesHeader
      @update:dateTime="dateChange"
      :searchShowFlag="false"
      :deptNameShowFlag="true"
      :onDateChangeFlag="true"
      :entryObj="entryObj"
    />
    <app-pull-refresh
      :refreshing="refreshing"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <view class="big-card">
        <customerTrendCard :borderFlag="true" :noArrowFlag="true" :dataItem="detailObj" />
        <view
          class="card-wrap px-4 py-10"
          :class="cstmCtgryIndex === list.length - 1 ? '' : 'border-bottom'"
          v-for="(cstmCtgry, cstmCtgryIndex) in list"
          :key="'goods' + cstmCtgryIndex"
        >
          <up-line-progress
            class="mb-1"
            :percentage="cstmCtgry.progress"
            activeColor="#3561F2"
            :inactiveColor="'rgba(100,101,102,0.4)'"
            :showText="false"
            height="12"
          />
          <view class="flex justify-between align-center text-14 py-10">
            <text class="flex-3 slh">{{ cstmCtgry.deptId }}/{{ cstmCtgry.deptName }}</text>
            <text class="color-main-3 flex-2 pl-1">{{ cstmCtgry.salesAmount }}万元</text>
            <text class="flex-1 text-right" :class="getColorClass(cstmCtgry.periodComparePercent)">
              {{ cstmCtgry.periodComparePercent }}
            </text>
          </view>
        </view>
      </view>
    </app-pull-refresh>
  </view>
</template>

<script lang="ts" setup>
import type { EntryObj } from './types';
import salesHeader from './components/base/header.vue';
import customerTrendCard from './components/common/customer-trend-card.vue';
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
const {
  formatTenThousand, // 格式化为万元，且加千分位
  formatPercentage,
} = useFormatter();
const dashboardStore = useDashboardStore();
const detailObj: DataItem = dashboardStore.customerTrendDetail.value as DataItem;
const entryObj = ref<EntryObj>({
  deptId: '',
  deptName: '',
  titleName: '',
  deptLevel: '',
});
const dateChange = ({ fulldate }: { fulldate: string }) => {
  dashboardStore.setDateTime(time.format(new Date(fulldate), 'yyyy-MM-dd'));
  onRefresh();
};
// 使用分页组合式API
const pagination = usePagination(
  {
    pageSize: 8,
    initialPage: 1,
    loadmoreConfig: {
      nomoreText: '',
      status: 'loadmore',
      loadmoreText: '上拉加载更多',
      loadingText: '努力加载中...',
      iconSize: 18,
    },
    toolBarHeight: 82,
  },

  async params => {
    const res = await DashboardService.getCstmCtgryDeptSales({
      selectDate: dashboardStore.dateTime,
      deptId: entryObj.value.deptId,
      orderColumn: 'salesAmount',
      orderType: 0,
      customerOpClassId: detailObj.customerOpClassId,
      deptSalesFlag: 1,
      timeDimFlag: 1,
      pageSize: params.pageSize,
      pageNum: params.pageNum,
    });
    const totalValueArr: any = [];
    res.data.map((val: any) => {
      totalValueArr.push(val.salesAmount);
    });
    const cstmCtgryDeptSalesResList = res.data.map((cstmCtgry: any) => {
      return {
        salesAmount: formatTenThousand(cstmCtgry.salesAmount),
        periodComparePercent: formatPercentage(cstmCtgry.periodComparePercent),
        periodCompareNetIncrease: formatTenThousand(cstmCtgry.periodCompareNetIncrease),
        deptName: cstmCtgry.deptName,
        deptId: cstmCtgry.deptId,
        progress: Number(
          arithmetic.multiply(
            arithmetic.divide(Number(cstmCtgry.salesAmount), arithmetic.sum(totalValueArr)),
            100
          )
        ).toFixed(1),
      };
    });
    return {
      list: cstmCtgryDeptSalesResList,
      hasNextPage: false,
      total: 0,
    };
  }
);
const {
  list,
  refreshing,
  loadmoreConfig,
  pullRefreshHeight,
  onRefresh,
  onLoadMore,
  calcPullRefreshHeight,
} = pagination;
// 页面加载
onLoad(async options => {
  const decodedOpts = options ? decodeObjectValues(options) : {};
  if (decodedOpts) {
    entryObj.value.deptLevel = decodedOpts.deptLevel;
    entryObj.value.deptId = decodedOpts.deptId;
    entryObj.value.deptName = decodedOpts.deptName;
    entryObj.value.titleName = '客户趋势详情';
    await calcPullRefreshHeight();
    onRefresh();
  }
});
</script>

<style lang="scss" scoped>
.big-card {
  margin: 10px;
  border: 1px solid #ebedf0;
  border-radius: 30rpx;
}

.border-bottom {
  border-bottom: 1px solid #ebedf0;
}
</style>
