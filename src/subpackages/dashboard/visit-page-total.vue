<template>
  <view class="bg-white">
    <app-watermark> </app-watermark>
    <up-sticky offset-top="0" :custom-nav-height="0">
      <visitTotalFilterPop @confirm="handleFilterConfirm" :filterObj="filterObj" />
      <view class="text-14 px-2 pb-3 bg-white color-main">
        {{ dateRange }} (共{{ totalDays }}天)
      </view>
      <view class="text-14 px-2 pb-3 bg-white">
        {{ entryObj.customerId }}/{{ entryObj.customerName }}
      </view>
    </up-sticky>
    <app-pull-refresh
      :refreshing="refreshing"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <view class="px-2 py-2">
        <view
          class="card mb-2"
          v-for="(data, index) in list"
          :key="data.userId"
          @click="handleItemClick(data)"
        >
          <view class="card-header text-16 flex items-center justify-between">
            <view class="flex items-center">
              <view class="card-header_block" :class="data.flag == 0 ? 'h-34' : 'h-16'"></view>
              <view class="user-info-column">
                <view class="color-main-3 pl-1">{{ data.userName }}</view>
                <view v-if="data.flag == 0" class="remove-tip pl-1 text-xs">{{
                  '客户业务员关系已解除'
                }}</view>
              </view>
            </view>
            <view>
              时间范围内总拜访 <text class="color-main-3">{{ data.totalNum }}次</text>
            </view>
          </view>
          <view class="card-content flex">
            <view class="echarts-warp" :id="'echarts-warp' + index" :prop="data.chartData"></view>
            <view class="flex-2 flex justify-between pl-4 pt-4">
              <view>
                <view class="flex items-center">
                  <text class="cicle cicle-1"></text>
                  <text class="pl-2">拜访</text>
                </view>
                <view class="pl-4 pt-1 color-main-3">{{ data.num1 }}</view>
              </view>
              <view>
                <view class="flex items-center">
                  <text class="cicle cicle-2"></text>
                  <text class="pl-2">协访</text>
                </view>
                <view class="pl-4 pt-1 color-main-3">{{ data.num2 }}</view>
              </view>
              <view>
                <view class="flex items-center">
                  <text class="cicle cicle-3"></text>
                  <text class="pl-2">接待</text>
                </view>
                <view class="pl-4 pt-1 color-main-3">{{ data.num3 }}</view>
              </view>
            </view>
          </view>
        </view>
        <app-empty v-show="isEmptyState" class="py-7" description="暂无数据" />
      </view>
    </app-pull-refresh>
  </view>
</template>

<script setup lang="ts">
import visitTotalFilterPop from './components/base/visit-total-filter-pop.vue';
import type { EntryObj } from './types';
const dashboardStore = useDashboardStore();
const entryObj = ref<EntryObj>({
  deptId: '',
  deptName: '',
  customerId: '',
  customerName: '',
});
const filterObj = reactive({
  startTime: '',
  endTime: '',
  labelId: '',
  labelText: '',
  labelIdList: [],
  visitKeyword: '',
});
const totalDays = ref(0);
const dateRange = computed(() => {
  return filterObj.startTime + '至' + filterObj.endTime;
});

const isEmptyState = computed(() => {
  return !(loadmoreConfig.value.status === 'loadmore') && !list.value.length;
});
const handleItemClick = (data: any) => {
  // 点击事件处理
  dashboardStore.setVisitFilterParams({
    companyIdOrName: entryObj.value.customerId,
    userIdOrName: '',
    labelId: filterObj.labelId,
    labelText: filterObj.labelText,
    labelIdList: filterObj.labelIdList,
    taskType: '',
    deptId: entryObj.value.deptId,
    userIdList: [data.userId],
    startTime: filterObj.startTime,
    endTime: filterObj.endTime,
  });
  uni.navigateTo({
    url: '/subpackages/dashboard/visit-page-list',
  });
};
const handleFilterConfirm = (filterVal: any) => {
  filterObj.labelId = filterVal.labelId;
  filterObj.labelText = filterVal.labelText;
  filterObj.labelIdList = filterVal.labelIdList;
  filterObj.visitKeyword = filterVal.visitKeyword;
  filterObj.startTime = filterVal.startTime;
  filterObj.endTime = filterVal.endTime;
  onRefresh();
};
// 使用分页组合式API
const pagination = usePagination(
  {
    pageSize: 8,
    initialPage: 1,
    toolBarHeight: 140,
  },
  async () => {
    const data = await CustomerFollowService.chashujuGetUserListVisitWx({
      companyId: entryObj.value.customerId,
      startTime: filterObj.startTime,
      endTime: filterObj.endTime,
      depId: entryObj.value.deptId,
      labelIdList: filterObj.labelIdList,
      visitKeyword: filterObj.visitKeyword,
    });
    console.log('data', data);
    const list = data.map((val: any, index: number) => {
      val.crmUserVisitNumListDtos.filter((crmUserVisit: any) => {
        val['num' + crmUserVisit.taskType] = crmUserVisit.num;
      });

      return {
        ...val,
      };
    });
    return {
      list: list,
      hasNextPage: data.hasNextPage || false,
      total: data.total || 0,
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
    Object.assign(entryObj.value, decodedOpts);
    const endTime = dashboardStore.dateTime;
    const startTime = time.format(time.add(new Date(endTime), -30, 'day'), time.FORMATS.ISO_DATE);
    Object.assign(filterObj, {
      endTime,
      startTime,
    });
    totalDays.value = time.getDateRange(startTime, endTime).length;
    await calcPullRefreshHeight();
    onRefresh();
  }
});
</script>

<style lang="scss" scoped>
.card {
  height: 120px;
  border-radius: 30px;
  border: 1px solid #e7e7e7;

  &-header {
    height: 50px;
    padding: 0 16px 0 20px;
    border-bottom: 1px solid #ebedf0;

    &_block {
      width: 6px;
      background: #3561f2;
      border-radius: 3px;
    }
  }

  &-content {
    height: 70px;
    padding: 0 16px 0 20px;

    .echarts-warp {
      width: 70px;
      height: 70px;
    }

    .cicle {
      width: 6px;
      height: 6px;
      border-radius: 3px;

      &-1 {
        background: #4970f3;
      }

      &-2 {
        background: #ffa500;
      }

      &-3 {
        background: #ff4d4d;
      }
    }
  }
}
</style>
