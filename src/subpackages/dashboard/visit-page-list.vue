<template>
  <view>
    <app-watermark> </app-watermark>
    <up-sticky offset-top="0" :custom-nav-height="0">
      <visitListFilterPop @confirm="filterConfirm" :filterObj="filterObj" />
    </up-sticky>
    <app-pull-refresh
      :refreshing="refreshing"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <view class="pa-2">
        <view
          class="bg-white p-2 mb-2 rounded"
          v-for="(item, index) in list"
          :key="index"
          @click="cardClick(item)"
        >
          <visitCard :needbg="true" :visit-obj="item" />
        </view>
        <app-empty v-show="!refreshing && !list.length" class="py-7" description="暂无数据" />
      </view>
    </app-pull-refresh>
  </view>
</template>

<script lang="ts" setup>
import visitListFilterPop from './components/base/visit-list-filter-pop.vue';
import visitCard from './components/common/visit-card.vue';
const dashboardStore = useDashboardStore();
const filterObj = reactive({
  startTime: '',
  endTime: '',
  labelId: '',
  deptId: '',
  userIdList: [],
  labelText: '',
  labelIdList: [],
  customerKeyword: '',
  visitType: '',
});
// 使用分页组合式API
const pagination = usePagination(
  {
    pageSize: 8,
    initialPage: 1,
    toolBarHeight: 70,
  },
  async params => {
    const data = await CustomerFollowService.chashujuGetUserVisitWx({
      startTime: filterObj.startTime,
      endTime: filterObj.endTime,
      depId: filterObj.deptId,
      userIdList: filterObj.userIdList,
      labelIdList: filterObj.labelIdList,
      companyIdOrName: filterObj.customerKeyword,
      userIdOrName: '',
      taskType: filterObj.visitType,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
    });
    const list = data.list || [];
    return {
      list: list,
      hasNextPage: data.hasNextPage,
      total: data.total,
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
const cardClick = (item: any) => {
  // emit('cardClick', item);
  dashboardStore.setVisitDetail(item);
  uni.navigateTo({
    url: '/subpackages/dashboard/visit-page-list-detail',
  });
};
const filterConfirm = (filterVal: any) => {
  filterObj.startTime = filterVal.startTime;
  filterObj.endTime = filterVal.endTime;
  filterObj.labelIdList = filterVal.labelIdList;
  filterObj.customerKeyword = filterVal.customerKeyword;
  filterObj.userIdList = filterVal.userIdList;
  filterObj.visitType = filterVal.visitType;
  onRefresh();
};
// 页面加载
onMounted(async () => {
  filterObj.startTime = dashboardStore.visitFilterParams.startTime;
  filterObj.endTime = dashboardStore.visitFilterParams.endTime;
  filterObj.labelId = dashboardStore.visitFilterParams.labelId;
  filterObj.labelText = dashboardStore.visitFilterParams.labelText;
  filterObj.labelIdList = dashboardStore.visitFilterParams.labelIdList;
  filterObj.userIdList = dashboardStore.visitFilterParams.userIdList;
  filterObj.customerKeyword = dashboardStore.visitFilterParams.companyIdOrName;
  await calcPullRefreshHeight();
  onRefresh();
});
</script>

<style lang="scss" scoped></style>
