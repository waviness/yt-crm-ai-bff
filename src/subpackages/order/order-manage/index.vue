<script setup lang="ts">
/**
 * 订单管理页面
 * 支持当日订单、历史订单、可激活订单的查看和管理
 */

import OrderItem from './components/order-item.vue';
import OrderFilterPopup from './components/order-filter-popup.vue';
import { useOrderManage } from './composables/use-order-manage';
import time from '@/utils/time';
import type { CustomerOrderInfo } from './types';

const tabList = [{ name: '当日订单' }, { name: '历史订单' }, { name: '可激活订单' }];

// 使用业务逻辑composable
const {
  show,
  showSort,
  isJustSelf,
  tabActiveIndex,
  timeType,
  timeList,
  filterObj,
  sortParams,
  sortColumns,
  needQueryAll,
  needQueryAllEntrys,
  needQueryAllDept,
  getOtherClass,
  getMinData,
  getMaxData,
  showPopup,
  handleTabChange,
  changeTime,
  refreshFilter,
  handleFilter,
  onConfirm,
  handleSort,
  handleSortCancel,
  closePopup,
  fetchOrderList,
  toggleJustSelf,
  initPermissions,
} = useOrderManage();

// 使用简化分页
const { list, totalNum, paginationLoading, resetAndFetchData, loadMore } =
  useSimplePagination<CustomerOrderInfo>(10);

// 处理刷新
const onRefresh = () => {
  resetAndFetchData(fetchOrderList);
};

// 处理标签页切换
const handleTabChangeWrapper = ({ index }: { index: number }) => {
  handleTabChange({ index });
  onRefresh();
};

// 处理时间切换
const changeTimeWrapper = (index: number) => {
  const needRefresh = changeTime(index as any);
  if (index === 4) {
    // 自定义时间选择，打开日历
    calendarRef.value?.open();
  } else if (needRefresh) {
    onRefresh();
  }
};

// 处理筛选确认
const handleFilterWrapper = (filterData: any) => {
  // 更新筛选对象
  filterObj.value = { ...filterData };
  const needRefresh = handleFilter();
  if (needRefresh) {
    onRefresh();
  }
};

// 日历引用
const calendarRef = ref<any>(null);

// 处理时间确认
const onConfirmWrapper = (value: any) => {
  // app-calendar 可能返回多种格式，需要统一处理
  let dateArray: Date[] = [];

  if (value?.range?.before && value?.range?.after) {
    // 对象格式：{ range: { before: string, after: string } }
    dateArray = [new Date(value.range.before), new Date(value.range.after)];
  } else if (Array.isArray(value)) {
    // 数组格式：可能是字符串数组或 Date 数组
    dateArray = value.map((d: string | Date) => {
      if (typeof d === 'string') {
        return new Date(d);
      }
      return d;
    });
  } else {
    // 其他格式，尝试转换
    console.warn('未知的日期格式:', value);
    return;
  }

  onConfirm(dateArray);
  onRefresh();
};

// 处理排序确认
const handleSortWrapper = (e: { value: string[]; indexs?: number[] }) => {
  // up-picker 返回的 value 是文本数组，indexs 是索引数组
  const labels = e.value || [];
  // 如果没有 indexs，根据文本值在 sortColumns 中查找索引
  let indexes: number[] = [];
  if (e.indexs && e.indexs.length > 0) {
    indexes = e.indexs;
  } else {
    // 根据文本值查找索引
    const { sortColumns } = useOrderManage();
    indexes = labels.map((label, colIndex) => {
      const column = sortColumns.value[colIndex];
      const index = column.indexOf(label);
      return index >= 0 ? index : 0;
    });
  }
  handleSort(labels, indexes);
  onRefresh();
};

// 处理排序取消
const handleSortCancelWrapper = () => {
  handleSortCancel();
  onRefresh();
};

// 处理显示范围切换
const justSelfClick = () => {
  toggleJustSelf();
  onRefresh();
};

// 显示详情
const showDetail = (item: CustomerOrderInfo) => {
  const data = {
    customer: JSON.stringify(item),
    type: tabActiveIndex.value,
    startTime:
      timeList.value.length === 2 ? time.format(timeList.value[0], time.FORMATS.ISO_DATE) : '',
    endTime:
      timeList.value.length === 2 ? time.format(timeList.value[1], time.FORMATS.ISO_DATE) : '',
    goodsId: filterObj.value.goodsId,
    goodsName: filterObj.value.goodsName,
  };

  router.push(RouteMap.orderManageList, data);
};

onMounted(() => {
  initPermissions();
  onRefresh();
});

onReachBottom(() => {
  loadMore(fetchOrderList);
});
</script>

<template>
  <view class="pb-50">
    <app-watermark> </app-watermark>
    <up-sticky style="top: 0">
      <order-filter-popup
        v-model:filterShow="show"
        :filterValue="filterObj"
        @confirm="handleFilterWrapper"
        @reset="refreshFilter"
        @close="closePopup"
      />
      <app-tabs :current="tabActiveIndex" :list="tabList" @change="handleTabChangeWrapper" />
      <view
        class="flex items-center justify-center bg-light-gray py-2 px-6"
        v-if="tabActiveIndex != 0"
      >
        <up-button
          size="small"
          :type="timeType == 1 ? 'primary' : 'info'"
          shape="circle"
          @click="changeTimeWrapper(1)"
          class="mr-3 px-4"
        >
          三日内
        </up-button>
        <up-button
          size="small"
          :type="timeType == 2 ? 'primary' : 'info'"
          shape="circle"
          @click="changeTimeWrapper(2)"
          class="mr-3 px-4"
        >
          五日内
        </up-button>
        <up-button
          size="small"
          :type="timeType == 3 ? 'primary' : 'info'"
          shape="circle"
          @click="changeTimeWrapper(3)"
          class="px-4 mr-2"
        >
          七日内
        </up-button>
        <up-button
          size="small"
          :type="timeType == 4 ? 'primary' : 'info'"
          shape="circle"
          @click="changeTimeWrapper(4)"
          class="px-4"
        >
          自定义
        </up-button>
      </view>
    </up-sticky>
    <view
      class="overflow-x-hidden overflow-y-scroll"
      :class="[tabActiveIndex != 0 ? 'h-[calc(100%-152px)]' : 'h-[calc(100%-112px)]']"
    >
      <view>
        <order-item
          v-for="(item, index) in list"
          :key="index"
          :info="item"
          :cardType="0"
          @click="showDetail(item)"
        />
        <app-empty
          class="mt-6 bg-white"
          v-if="!paginationLoading && !list.length"
          :description="'暂无数据'"
        ></app-empty>
        <up-loadmore
          v-if="paginationLoading || list.length < totalNum"
          :status="paginationLoading ? 'loading' : list.length >= totalNum ? 'nomore' : 'loadmore'"
        />
      </view>
    </view>
    <app-bottom-actions :count="needQueryAll || needQueryAllEntrys || needQueryAllDept ? 2 : 1">
      <app-action-btn
        class="flex-1 shadow-btn"
        :text="isJustSelf ? '显示全部' : '显示与我相关'"
        type="plain"
        @click="justSelfClick"
        v-if="needQueryAll || needQueryAllEntrys || needQueryAllDept"
      />
      <app-action-btn
        class="flex-1 shadow-btn"
        :text="sortParams.orderText"
        type="primary"
        @click="showSort = true"
      />
    </app-bottom-actions>

    <up-picker
      :show="showSort"
      show-toolbar
      title="排序方式"
      :columns="sortColumns"
      @confirm="handleSortWrapper"
      @cancel="handleSortCancelWrapper"
      @close="handleSortCancelWrapper"
    />

    <app-calendar
      ref="calendarRef"
      mode="range"
      :date="
        timeList.length === 2
          ? [
              time.format(timeList[0], time.FORMATS.ISO_DATE),
              time.format(timeList[1], time.FORMATS.ISO_DATE),
            ]
          : ['', '']
      "
      :startDate="time.format(getMinData, time.FORMATS.ISO_DATE)"
      :endDate="time.format(getMaxData, time.FORMATS.ISO_DATE)"
      @confirm="onConfirmWrapper"
    />
  </view>
</template>
