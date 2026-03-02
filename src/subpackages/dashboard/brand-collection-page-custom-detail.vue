<template>
  <view class="bg-white">
    <app-watermark> </app-watermark>
    <salesHeader
      @update:dateTime="dateChange"
      :searchShowFlag="false"
      :deptNameShowFlag="true"
      :entryObj="entryObj"
    >
    </salesHeader>
    <app-pull-refresh
      :refreshing="refreshing"
      :showLoadmore="true"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <commonCard :loading="loading" :salesDataObj="salesDataObj" />
      <detailList
        v-for="(data, index) in list"
        :key="index"
        :isClick="false"
        :data="data"
        :name="data.name"
        :per="data.progress"
        :showDrxs="false"
        :perShow="true"
        :salesTabValue="salesTabValue"
      ></detailList>
    </app-pull-refresh>
  </view>
</template>

<script lang="ts" setup>
import type { EntryObj } from './types';
import salesHeader from './components/base/header.vue';
import commonCard from './components/base/common-card.vue';
import detailList from './components/base/detail-list.vue';
const { formatPercentage, formatTenThousand } = useFormatter();
const dashboardStore = useDashboardStore();
const entryObj = ref<EntryObj>({
  deptId: '',
  deptName: '',
  brandId: '',
  brandName: '',
});
const getEntryObj = (entry: EntryObj) => {
  entryObj.value = entry;
  entryObj.value.deptName = entry.deptName + '/' + entry.brandName;
  entryObj.value.titleName = entry.customerName;
};
const salesDataObj = reactive({
  currentMonthMoney: '0',
  lyCurrentMonthMoney: '0',
  monthPercentage: '0',
  currentYearMoney: '0',
  lyCurrentYearMoney: '0',
  yearPercentage: '0',
});
const loading = ref(false);
const sortField = ref(1);
const sortOrder = ref(2);
const salesTabValue = ref(1);
const transformSalesmanData = (element: any) => ({
  id: element.goodsId,
  name: element.goodsName,
  // todaySales: element.dayAmount,
  byxs: element.monthAmount,
  ytb: element.monthOnPercent,
  qnzy: element.entireOnMonthAmount,
  bnlj: element.yearAmount,
  ntb: element.yearOnPercent,
  qnljy: element.accuOnYearAmount,
  progress: element.progress || 0,
});

// 使用分页组合式API
const pagination = usePagination(
  {
    pageSize: 10,
    initialPage: 1,
    toolBarHeight: 90,
  },
  async params => {
    const res = await DashboardService.getStatListByDeptAndBrandAndFormAndCustomer({
      brandId: entryObj.value.brandId,
      businessForm: entryObj.value.businessForm,
      customerId: entryObj.value.customerId,
      date: dashboardStore.dateTime,
      deptId: entryObj.value.deptId,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
      sortField: sortField.value,
      sortOrder: sortOrder.value,
      showType: salesTabValue.value, // 1 销售额 2 销售数量
    });
    return {
      list: res.data.list.map((val: any) => transformSalesmanData(val)),
      hasNextPage: res.data.hasNextPage,
      total: res.data.total,
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
const fetchGetStatList = async (pagination: { pageNum: number; pageSize: number }) => {
  loading.value = true;
  const response = await DashboardService.getStatList({
    date: dashboardStore.dateTime,
    deptId: entryObj.value.deptId,
    brandId: entryObj.value.brandId,
    goodsId: entryObj.value.goodsId,
    businessForm: entryObj.value.businessForm,
    area: '',
    city: '',
    province: '',
    customerKeyword: entryObj.value.customerId,
    pageSize: pagination.pageSize,
    pageNum: pagination.pageNum,
    sortField: 1,
    sortOrder: 2,
  });
  loading.value = false;
  const val = response.data.list[0] || {};
  salesDataObj.currentMonthMoney = formatTenThousand(val.monthAmount);
  salesDataObj.lyCurrentMonthMoney = formatTenThousand(val.monthOnAmount);
  salesDataObj.monthPercentage = formatPercentage(val.monthOnPercent);
  salesDataObj.currentYearMoney = formatTenThousand(val.yearAmount);
  salesDataObj.lyCurrentYearMoney = formatTenThousand(val.yearOnAmount);
  salesDataObj.yearPercentage = formatPercentage(val.yearOnPercent);
};
const dateChange = ({ fulldate }: { fulldate: string }) => {
  dashboardStore.setDateTime(time.format(new Date(fulldate), 'yyyy-MM-dd'));
  initData();
};
const initData = async () => {
  fetchGetStatList({ pageNum: 1, pageSize: 1 });
  await calcPullRefreshHeight();
  onRefresh();
};
// 页面加载
onLoad(options => {
  const decodedOpts = options ? decodeObjectValues(options) : {};
  if (decodedOpts) {
    getEntryObj(decodedOpts as EntryObj);
    initData();
  }
});
</script>

<style lang="sass" scoped></style>
