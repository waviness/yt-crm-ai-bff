<script setup lang="ts">
/**
 * 订单列表页面
 * 显示特定客户的订单详情列表
 */

import OrderItem from './components/order-item.vue';
import OrderListFilterPopup from './components/order-list-filter-popup.vue';
import { useOrderList } from './composables/use-order-list';
import type { OrderDetailInfo } from './types';

const tabList = [{ name: '未完成订单' }, { name: '正常订单' }];

// 使用业务逻辑composable
const {
  show,
  isJustSelf,
  tabActiveIndex,
  cardType,
  customer,
  timeList,
  userIdLists,
  filterObj,
  needQueryAll,
  needQueryAllEntrys,
  needQueryAllDept,
  managementOpflagForSaler,
  managementOpflagForPurchaser,
  getOtherClass,
  showPopup,
  refreshFilter,
  handleFilter,
  closePopup,
  fetchOrderList,
  toggleJustSelf,
  initPermissions,
  initPageData,
} = useOrderList();

// 使用简化分页
const { list, totalNum, paginationLoading, resetAndFetchData, loadMore } =
  useSimplePagination<OrderDetailInfo>(10);

// 处理刷新
const onRefresh = () => {
  resetAndFetchData(fetchOrderList);
};

// 处理标签页切换
const handleTabChange = ({ index }: { index: number }) => {
  tabActiveIndex.value = index;
  onRefresh();
};

// 处理筛选确认
const handleFilterWrapper = (filterData: any, userIdListsData?: string[]) => {
  // 更新筛选对象
  filterObj.value = { ...filterData };
  // 更新 userIdLists（如果传入）
  if (userIdListsData) {
    userIdLists.value = userIdListsData;
  }
  const needRefresh = handleFilter();
  if (needRefresh) {
    onRefresh();
  }
};

// 处理显示范围切换
const justSelfClick = () => {
  toggleJustSelf();
  onRefresh();
};

onLoad((opts: any) => {
  initPermissions();

  const needRefresh = initPageData(opts);
  if (needRefresh) {
    onRefresh();
  }
});

onReachBottom(() => {
  loadMore(fetchOrderList);
});
</script>

<template>
  <view class="pb-50">
    <app-watermark> </app-watermark>
    <up-sticky style="top: 0">
      <order-list-filter-popup
        v-model:filterShow="show"
        :filterValue="filterObj"
        :customerId="customer.customerId"
        @confirm="handleFilterWrapper"
        @reset="refreshFilter"
        @close="closePopup"
      />
      <order-item
        :info="customer"
        :cardType="1"
        :fatherType="parseInt(cardType.toString())"
        :isAll="tabActiveIndex == 1"
      />
      <app-tabs
        :current="tabActiveIndex"
        :list="tabList"
        @change="handleTabChange"
        v-show="cardType != 2"
      />
    </up-sticky>
    <view class="pt-2">
      <order-item
        v-for="(item, index) in list"
        :key="index"
        :info="item"
        :cardType="parseInt(cardType.toString()) + 2"
        :isAll="tabActiveIndex == 1"
        :managementOpflagForSaler="managementOpflagForSaler"
        :managementOpflagForPurchaser="managementOpflagForPurchaser"
        :querySelfFlag="
          !needQueryAll && !needQueryAllEntrys && !needQueryAllDept ? 1 : isJustSelf ? 1 : 2
        "
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
    <app-bottom-actions v-if="needQueryAll || needQueryAllEntrys || needQueryAllDept" :count="1">
      <app-action-btn
        :text="isJustSelf ? '显示全部' : '显示与我相关'"
        type="plain"
        class="block w-250 shadow-btn mx-auto"
        @click="justSelfClick"
      />
    </app-bottom-actions>
  </view>
</template>
