项目管理 - 准入 - 详情 - 查看药事会信息列表
<script setup lang="ts">
import type { ProductObj } from './types';
import type { GetYaoShiHuiListParams } from '@/api/project/types';

// 使用 store
const appStore = useAppStore();
const userStore = useUserStore();
const projectStore = useProjectStore();

// 响应式数据
const productObj = computed(() => projectStore.productDetail);
// 使用分页 composable
const {
  list,
  refreshing,
  loadmoreConfig,
  pullRefreshHeight,
  calcPullRefreshHeight,
  onRefresh,
  onLoadMore,
  fetchData,
} = usePagination(
  {
    pageSize: 10,
    initialPage: 1,
    toolBarHeight: 40,
  },
  async params => {
    const res = await ProjectService.getYaoShiHuiList({
      date: productObj.value.date,
      customerId: productObj.value.data.customerId,
      productId: productObj.value.data.productId,
      projectId: productObj.value.data.projectId,
      capId: productObj.value.data.capId,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
    } as GetYaoShiHuiListParams);

    return {
      list: res.list,
      hasNextPage: res.hasNextPage,
      total: res.total,
    };
  }
);

// 格式化时间
const formatScheduleTime = (date: string) => {
  return date?.split(' ')[0] || '-';
};

// 跳转到详情
const toYaoshihuiDetail = (item: any) => {
  if (item.creId === userStore.userInfor.userId) {
    appStore.setHadDoneOnDetail(false);
    router.push(RouteMap.projectMedicBoardDetail, item);
  }
};

onLoad(() => {
  calcPullRefreshHeight();
  // 刷新数据
  onRefresh();
});

onShow(() => {
  if (appStore.hadDoneOnDetail) {
    onRefresh();
  }
});
</script>

<template>
  <view>
    <app-watermark> </app-watermark>
    <view class="text-sm p-10">药事会信息列表</view>
    <app-pull-refresh
      :refreshing="refreshing"
      :showLoadmore="true"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <view>
        <view
          v-for="(item, idx) in list"
          :key="idx"
          class="mb-2"
          @click.capture="toYaoshihuiDetail(item)"
        >
          <app-cell title="创建时间" :value="item.credate" valueClass="color-black-2" />
          <app-cell
            title="创建人"
            :value="`${item.creId}/${item.creName}`"
            valueClass="color-black-2"
          />
          <app-cell
            title="药事会类型"
            :value="
              item.medicBoardType === 3
                ? '其他'
                : item.medicBoardType === 1
                  ? '新药会'
                  : item.medicBoardType === 2
                    ? '国谈会'
                    : '-'
            "
            valueClass="color-black-2"
          />
          <app-cell
            v-if="item.medicBoardType === 3"
            title="药事会类型备注"
            :value="item.medicBoardTypeMemo"
            valueClass="color-black-2"
          />
          <app-cell
            title="计划开会日期"
            :value="item.scheduleMeetingTime ? formatScheduleTime(item.scheduleMeetingTime) : '-'"
            valueClass="color-black-2"
          />
          <app-cell title="备注" :value="item.medicBoardMemo || '-'" valueClass="color-black-2" />
        </view>
      </view>
    </app-pull-refresh>
  </view>
</template>
