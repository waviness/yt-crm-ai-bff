<script setup lang="ts">
/**
 * 订阅提醒管理页面
 * 支持订阅到货/到票提醒的查看和管理
 */

import CardDetail from './components/card-detail.vue';
import SubFilterPop from './components/sub-filter-pop.vue';
import { useSubscribeReminderList } from './composables/use-subscribe-reminder-list';
import { SubscribeReminderService } from '@/api/subscribe-reminder';

// 定义操作类型枚举
enum ActionType {
  UNSUBSCRIBE = 1,
  ACTIVATE_SUBSCRIBE = 2,
  SUBSCRIBE_ARRIVE = 3,
  SUBSCRIBE_INVOICE = 4,
  ACTIVATE_ARRIVE = 5,
  ACTIVATE_INVOICE = 6,
}

// 定义卡片点击事件参数接口
interface CardClickParams {
  type: ActionType;
  info: any;
}

// 使用业务逻辑composable
const {
  searchParams,
  filterData,
  showFilterPopup,
  isFiltered,
  timeTitle,
  isSearchMode,
  fetchSubscribeArriveList,
  fetchSubscribableGoodsList,
  showFilter,
  confirmFilter,
} = useSubscribeReminderList();

const tabList = ref([
  { name: '到货提醒', id: 1 },
  { name: '到票提醒', id: 2 },
]);
const current = ref(0);

// 使用简化分页组合式API
const { list, totalNum, paginationLoading, resetAndFetchData, loadMore } = useSimplePagination(10);

// 获取数据的函数
const fetchData = async ({ pageNum, pageSize }: { pageNum: number; pageSize: number }) => {
  const fetchFunction = isSearchMode.value ? fetchSubscribableGoodsList : fetchSubscribeArriveList;
  const res = await fetchFunction({ pageNum, pageSize });
  return { list: res.list, total: res.total };
};

// 处理搜索输入变化
const handleSearchInput = () => {
  console.log('handleSearchInput');
  console.log(searchParams.value);
  resetAndFetchData(fetchData);
};

// 处理标签页切换
const handleTabChangeWrapper = (index: number) => {
  current.value = index;
  const subType = tabList.value[index].id;
  searchParams.value.subType = subType;
  resetAndFetchData(fetchData);
};

// 处理卡片点击事件
const handleCardClick = async ({ type, info }: CardClickParams) => {
  try {
    const actionMap: Record<ActionType, () => Promise<void>> = {
      [ActionType.UNSUBSCRIBE]: () => unsubscribe(info),
      [ActionType.ACTIVATE_SUBSCRIBE]: () => activateSubscribe(info.subId),
      [ActionType.SUBSCRIBE_ARRIVE]: () => subscribeArrive(info, 1),
      [ActionType.SUBSCRIBE_INVOICE]: () => subscribeArrive(info, 2),
      [ActionType.ACTIVATE_ARRIVE]: () => activateSubscribe(info.subGoodsId),
      [ActionType.ACTIVATE_INVOICE]: () => activateSubscribe(info.subInvnoId),
    };

    await actionMap[type]();
  } catch (error) {
    console.error('操作失败:', error);
  }
};

// 取消订阅
const unsubscribe = async (info: any): Promise<void> => {
  await SubscribeReminderService.unsubscribe({ subId: info.subId });
  showSuccess('删除订阅成功');
  resetAndFetchData(fetchData);
};

// 激活订阅
const activateSubscribe = async (id: any): Promise<void> => {
  await SubscribeReminderService.activeSubscribe({ subId: id });
  showSuccess('激活订阅成功');
  resetAndFetchData(fetchData);
};

// 订阅到货/到票提醒
const subscribeArrive = async (info: any, type: number): Promise<void> => {
  await SubscribeReminderService.subscribeArrive({
    entryId: info.entryId,
    goodsId: info.goodsId,
    subType: type,
  });

  const message = type === 1 ? '订阅到货提醒成功' : '订阅到票提醒成功';
  showSuccess(message);
  resetAndFetchData(fetchData);
};

// 确认筛选
const confirmFilterWrapper = (filterData: any) => {
  const hasChanged = confirmFilter(filterData);
  if (hasChanged) {
    resetAndFetchData(fetchData);
  }
};

onMounted(() => {
  resetAndFetchData(fetchData);
});

onReachBottom(() => {
  loadMore(fetchData);
});
</script>

<template>
  <view class="pb-40">
    <app-watermark> </app-watermark>
    <up-sticky style="top: 0">
      <!-- 搜索区域 -->
      <app-search
        v-model="searchParams.goodsKeyword"
        placeholder="搜索货品添加"
        clearable
        @input="handleSearchInput"
      />

      <!-- 标签页 -->
      <app-tabs
        :current="current"
        :list="tabList"
        @change="({ index }: { index: number }) => handleTabChangeWrapper(index)"
        v-show="!searchParams.goodsKeyword"
      />
    </up-sticky>

    <!-- 列表区域 -->
    <view class="overflow-x-hidden overflow-y-auto p-10">
      <app-empty
        class="mt-6 bg-white"
        v-if="!paginationLoading && !list.length"
        description="暂无数据"
      />

      <view v-for="(item, index) in list" :key="index" class="mb-10">
        <card-detail
          :info="item"
          :isSearch="isSearchMode"
          :timeTitle="timeTitle"
          @handleClick="handleCardClick"
        />
      </view>

      <up-loadmore
        v-if="paginationLoading || list.length < totalNum"
        :status="paginationLoading ? 'loading' : 'loadmore'"
      />
    </view>

    <sub-filter-pop
      v-model:filterShow="showFilterPopup"
      :filterVal="filterData"
      @confirm="confirmFilterWrapper"
    />

    <!-- 筛选按钮 -->
    <app-bottom-actions :count="1" v-show="!searchParams.goodsKeyword">
      <up-button
        shape="circle"
        type="primary"
        :plain="!isFiltered"
        size="normal"
        @click="showFilter"
      >
        <view class="flex items-center">
          <app-icon name="shaixuan_filterdefuben" size="30rpx" />
          <view class="ml-2">高级筛选</view>
        </view>
      </up-button>
    </app-bottom-actions>
  </view>
</template>

<style lang="scss" scoped>
.search-div {
  background: #f7f8fa;
  height: 32px;
  line-height: 32px;
  padding: 0 8px;
}
</style>
