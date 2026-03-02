<template>
  <view class="bg-white">
    <app-watermark> </app-watermark>
    <brandDetailHeader
      :pageTypeValue="pageTypeValue"
      :entryObj="entryObj"
      :areaArr="areaArr"
      :areaColumns="areaColumns"
      :areaColumnData="areaColumnData"
      :status-active="statusActive"
      :tabFlag="pageTypeValue === 1"
      :areaFlag="pageTypeValue === 3"
      :brand-header-obj="brandHeaderObj"
      @statusTabClick="statusTabClick"
      @areaConfirm="areaConfirmInit"
      @searchClick="searchClick"
      @update:dateTime="dateChangeInit"
    >
    </brandDetailHeader>
    <app-pull-refresh
      :refreshing="refreshing"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <view class="px-2">
        <view class="card flex my-2 py-1 pl-4 position-relative">
          <view class="salesWarp flex flex-col justify-between w-3/5">
            <text class="text-14 color-gray-4">销售实绩</text>
            <view class="flex flex-col">
              <text class="text-28 font-bold"> {{ brandHeaderObj.value }}万元 </text>
              <text class="text-14 color-blue-2">
                {{ brandHeaderObj.yearNetIncrease }}
              </text>
            </view>
          </view>
          <view class="echarts w-2/5 h-90px position-relative" id="brandEcharts">
            <qiun-data-charts
              v-if="chartsShow"
              type="gauge"
              canvasId="brandChart"
              :opts="brandOpts"
              :chartData="brandChartData"
              width="280"
              height="150"
            />
          </view>
        </view>
        <view class="px-2">
          <!--  @click="" -->
          <brandDetailCommonList
            @goodsClick="goodsClick"
            v-if="statusActive === 0"
            :sales-tab-value="salesTabValue"
            :list="list"
            :status-active="statusActive"
          />
          <brandDetailBusinessCard
            @businessFormClick="businessFormClick"
            v-if="statusActive === 1"
            :status-active="statusActive"
            :list="list"
          />
          <app-empty v-show="!refreshing && !list.length" class="py-7" description="暂无数据" />
        </view>
      </view>
    </app-pull-refresh>
  </view>
</template>

<script lang="ts" setup>
import { useBrandCollectionDetail } from './composables/use-brand-collection-page-detail';
import brandDetailHeader from './components/common/brand-detail-header.vue';
import brandDetailCommonList from './components/common/brand-detail-common-list.vue';
import brandDetailBusinessCard from './components/common/brand-detail-business-card.vue';
import qiunDataCharts from '@/subpackages/dashboard/uni_modules/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.vue';
import type { EntryObj } from './types';
const {
  fetchGetDeptTotalStat,
  getEntryObj,
  fetchGetAllList,
  goodsClick,
  businessFormClick,
  fetchGetAllListByBrandOne,
  fetchGetRegionStatList,
  fetchGetDynamicRegionList,
  entryObj,
  brandHeaderObj,
  statusActive,
  salesTabValue,
  pageTypeValue,
  areaColumns,
  areaColumnData,
  areaArr,
  searchVal,
  areaConfirm,
  dateChange,
  brandOpts,
  brandChartData,
  chartsShow,
} = useBrandCollectionDetail();
// 从页面参数中获取 key 值
const pageOptions = ref<any>({});
const toolBarHeight = ref(132);

// 获取页面参数
const getPageOptions = () => {
  const pages = getCurrentPages();
  const currentPage: any = pages[pages.length - 1];
  if (currentPage && currentPage.options) {
    pageOptions.value = currentPage.options;
    if (pageOptions.value.key) {
      toolBarHeight.value = +pageOptions.value.key === 2 ? 90 : 132;
    }
  }
};
getPageOptions();
// 使用分页组合式API
const pagination = usePagination(
  {
    pageSize: 10,
    initialPage: 1,
    toolBarHeight: toolBarHeight.value,
  },
  fetchGetAllList
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
const statusTabClick = (val: number) => {
  searchVal.value = '';
  statusActive.value = val;
  onRefresh();
};
const areaConfirmInit = (val: any) => {
  areaConfirm(val);
  onRefresh();
};
const dateChangeInit = (val: any) => {
  dateChange(val);
  initData();
};
const searchClick = (val: any) => {
  searchVal.value = val;
  onRefresh();
};
// 添加页面活动状态
let isPageActive = true;
const initData = async () => {
  lastDateTime.value = dashboardStore.dateTime; // 更新记录
  if (pageTypeValue.value === 1) {
    fetchGetDeptTotalStat();
  } else if (pageTypeValue.value === 2) {
    fetchGetAllListByBrandOne();
  } else {
    fetchGetRegionStatList();
    fetchGetDynamicRegionList();
  }
  await calcPullRefreshHeight();
  onRefresh();
};
const dashboardStore = useDashboardStore();
const lastDateTime = ref(''); // 初始化为空字符串
// 监听日期变化时刷新数据
watch(
  () => dashboardStore.dateTime,
  newDateTime => {
    if (isPageActive && newDateTime !== lastDateTime.value) {
      initData();
    }
  }
);

// 页面加载
onLoad(options => {
  const decodedOpts = options ? decodeObjectValues(options) : {};
  if (decodedOpts) {
    pageTypeValue.value = +decodedOpts.key;
    if (pageTypeValue.value === 2) {
      toolBarHeight.value = 90;
    } else {
      toolBarHeight.value = 132;
    }
    getEntryObj(decodedOpts as EntryObj);
    initData();
  }
});

// 监听页面显示/隐藏
onShow(() => {
  // 如果日期有变化，则获取数据
  if (lastDateTime.value !== dashboardStore.dateTime) {
    initData();
  }
});
onHide(() => {
  isPageActive = false;
});
</script>

<style lang="scss" scoped>
.card {
  border-radius: 30px;
  border: 1px solid #e7e7e7;
}

.business-card {
  height: 170px;
  border-radius: 30px;
  border: 1px solid #e7e7e7;
}

.now-year {
  background: #3561f2;
  border-radius: 12px;
}

.before-year {
  background: #b8b8bb;
  border-radius: 12px;
}

.gauge-box {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 200px;
  height: 150px;
  padding: 20px;
}
</style>
