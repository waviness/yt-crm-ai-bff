<script setup lang="ts">
/**
 * 更新日志卡片组件
 * 展示更新日志列表，支持下拉刷新和上拉加载更多
 */

interface Props {
  /** 是否在弹窗中使用，true 时使用 70vh 高度，false 时使用整个窗口高度 */
  isModal?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isModal: false,
});

/**
 * 更新日志详情项
 */
interface CrmUpdateLogDtl {
  title: string;
  content: string;
}

/**
 * 更新日志项
 */
interface LogDataItem {
  docTime: string;
  crmUpdateLogDtlVOList: CrmUpdateLogDtl[];
}

/**
 * 获取更新日志列表
 */
const fetchLogList = async (params: { pageNum: number; pageSize: number }) => {
  const res = await LogUpdateService.updateLogGetDoc({
    type: 2,
    flag: 1,
    pageNum: params.pageNum,
    pageSize: params.pageSize,
  });
  return {
    list: res.list || [],
    total: res.total || 0,
    hasNextPage: res.hasNextPage || false,
  };
};

// 使用分页功能
const pagination = usePagination<LogDataItem>(
  {
    pageSize: 10,
    initialPage: 1,
    toolBarHeight: 0,
  },
  fetchLogList
);

const {
  list: dataList,
  refreshing,
  loadmoreConfig,
  pullRefreshHeight,
  onRefresh,
  onLoadMore,
  calcPullRefreshHeight,
} = pagination;

/**
 * 页面初始化
 */
onMounted(() => {
  const windowInfo = uni.getWindowInfo();
  if (props.isModal) {
    // 在弹窗中使用时，使用弹窗内容区域的高度（70vh）
    // 避免误触发下拉刷新
    pullRefreshHeight.value = `${windowInfo.windowHeight * 0.7}px`;
  } else {
    // 在普通页面中使用时，使用整个窗口高度
    calcPullRefreshHeight();
  }
  onRefresh();
});
</script>

<template>
  <view class="py-10">
    <app-empty
      class="mt-6 bg-white"
      v-if="!refreshing && !dataList.length"
      description="暂无数据"
    />
    <app-pull-refresh
      class="px-10"
      :refreshing="refreshing"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <view class="pb-4">
        <view
          class="bg-white rounded-[3px] p-[10px] mb-[15px]"
          v-for="(data, index) in dataList"
          :key="'data' + index"
        >
          <view class="flex items-center pb-1">
            <text class="font-bold text-14">{{ data.docTime }}</text>
            <view
              v-show="index === 0"
              class="w-[34px] h-[16px] leading-[16px] ml-1 rounded-[3px] color-white bg-main-3 text-center text-12"
            >
              NEW
            </view>
          </view>
          <view
            class="text-12"
            v-for="(crmUpdateLog, crmUpdateLogIndex) in data.crmUpdateLogDtlVOList"
            :key="'crmUpdateLog' + crmUpdateLogIndex"
          >
            <view class="pb-1 color-gray-4">
              <text class="color-main">{{ crmUpdateLog.title }}</text>
              <text class="pl-2">{{ crmUpdateLog.content }}</text>
            </view>
          </view>
        </view>
      </view>
    </app-pull-refresh>
  </view>
</template>
