<template>
  <view class="bg-white">
    <app-watermark> </app-watermark>
    <salesHeader
      @update:dateTime="dateChange"
      :searchShowFlag="false"
      :deptNameShowFlag="true"
      :entryObj="entryObj"
    />
    <app-pull-refresh
      :refreshing="refreshing"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <view class="px-2" v-for="(data, index) in list" :key="index + 'customerTrendCard'">
        <customerTrendCard @detail-click="detailClick(data)" :dataItem="data" />
      </view>
      <app-empty v-show="!refreshing && !list.length" class="py-7" description="暂无数据" />
    </app-pull-refresh>
  </view>
</template>

<script lang="ts" setup>
import type { EntryObj } from './types';
import salesHeader from './components/base/header.vue';
import customerTrendCard from './components/common/customer-trend-card.vue';
import { DashboardService } from '@/api/dashboard';
const {
  formatTenThousand, // 格式化为万元，且加千分位
  formatPercentage,
} = useFormatter();
const dashboardStore = useDashboardStore();
const entryObj = ref<EntryObj>({
  deptId: '',
  deptName: '',
  titleName: '',
  deptLevel: '',
});
const dateChange = ({ fulldate }: { fulldate: string }) => {
  dashboardStore.setDateTime(time.format(new Date(fulldate), 'yyyy-MM-dd'));
  lastDateTime.value = dashboardStore.dateTime; // 更新记录
  initData();
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
    const res = await DashboardService.getCustomerCategorySales({
      selectDate: dashboardStore.dateTime,
      deptId: entryObj.value.deptId,
      orderColumn: 'salesAmount',
      orderType: 0,
      deptSalesFlag: 1,
      timeDimFlag: 1,
      pageSize: params.pageSize,
      pageNum: params.pageNum,
    });
    const dataListMiddle = res.data.map((val: any) => {
      return {
        ...val,
        lastSalesAmount: val.periodCompareNetIncrease
          ? Number(arithmetic.subtract(val.salesAmount, val.periodCompareNetIncrease)).toFixed(2)
          : null,
      };
    });
    const result = dataListMiddle.reduce(
      (acc: any, curr: any) => {
        const salesAmountValue = curr.salesAmount;
        const lastSalesAmountValue = curr.lastSalesAmount;
        return {
          maxSalesAmount: Math.max(+acc.maxSalesAmount, salesAmountValue),
          maxLastSalesAmount: Math.max(+acc.maxLastSalesAmount, lastSalesAmountValue),
        };
      },
      { maxSalesAmount: -Infinity, maxLastSalesAmount: -Infinity }
    );
    const max = Math.max(result.maxLastSalesAmount, result.maxSalesAmount);

    const list = dataListMiddle.map((val: any) => {
      //   val.cstmCtgryDeptSalesResList?.filter((cstmCtgry: any) => {
      //     if (cstmCtgry.salesAmount) val.totalValueArr.push(Number(cstmCtgry.salesAmount));
      //   });
      return {
        salesAmount: formatTenThousand(val.salesAmount),
        lastSalesAmount: formatTenThousand(val.lastSalesAmount),
        lastProgress: val.lastSalesAmount
          ? val.lastSalesAmount < 0
            ? 0
            : Number(arithmetic.multiply(arithmetic.divide(val.lastSalesAmount, max), 100)).toFixed(
                1
              )
          : null,
        progress: Number(arithmetic.multiply(arithmetic.divide(val.salesAmount, max), 100)).toFixed(
          1
        ),
        periodComparePercent: formatPercentage(val.periodComparePercent),
        periodCompareNetIncrease: formatTenThousand(val.periodCompareNetIncrease),
        customerOpClassName: val.customerOpClassName,
        customerOpClassId: val.customerOpClassId,
        cstmCtgryDeptSalesResList: val.cstmCtgryDeptSalesResList,
      };
    });

    return {
      list: list,
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
const detailClick = (item: any) => {
  dashboardStore.setCustomerTrendDetail(item);
  router.push(
    '/subpackages/dashboard/customer-trend-page-detail?deptId=' +
      entryObj.value.deptId +
      '&deptName=' +
      entryObj.value.deptName
  );
};
// 页面加载
onLoad(options => {
  console.log('页面参数:', options);
  if (options) {
    entryObj.value.deptLevel = options.deptLevel;
    entryObj.value.deptId = options.deptId;
    entryObj.value.deptName = options.deptName;
    entryObj.value.titleName = '客户趋势';
    initData();
  }
});
const initData = async () => {
  lastDateTime.value = dashboardStore.dateTime; // 更新记录
  await calcPullRefreshHeight();
  onRefresh();
};
const lastDateTime = ref(''); // 初始化为空字符串
// 监听日期变化时刷新数据
watch(
  () => dashboardStore.dateTime,
  newDateTime => {
    if (newDateTime !== lastDateTime.value) {
      initData();
    }
  }
);
</script>

<style lang="sass" scoped></style>
