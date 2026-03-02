<script setup lang="ts">
import FilterPop from './components/msg-filter-pop.vue';
import FlowCard from './components/flow-card.vue';
import TaskCard from './components/task-card.vue';
import { useMessage } from './composables/use-message';
import { useSimplePagination } from '@/composables/use-pagination';

defineOptions(SHARED_STYLE_OPTIONS);

// 使用业务逻辑 composable
const {
  msgType,
  taskType,
  showTag,
  tagItems,
  activeIds,
  activeIndex,
  activeId,
  flowCount,
  taskCount,
  filterObj,
  tabCurrent,
  tabList,
  fetchMessageList,
  handleLabelNavChange,
  handleLabelSelect,
  handleConfirmTag: handleConfirmTagBase,
  changeTaskType: changeTaskTypeBase,
  handleFilterChange: handleFilterChangeBase,
  handleTabChange: handleTabChangeBase,
  toFlowDetail,
  toDetail,
  toPublish,
  getUnread,
  readAll: readAllBase,
  initTagItems,
  init: initBase,
} = useMessage();

// 使用分页 composable（在页面中使用）
const { list, totalNum, paginationLoading, resetAndFetchData, loadMore } =
  useSimplePagination<any>(10);

// 包装业务方法，在调用后刷新数据
const handleConfirmTag = () => {
  handleConfirmTagBase();
  resetAndFetchData(fetchMessageList);
};

const changeTaskType = (type: number) => {
  changeTaskTypeBase(type);
  resetAndFetchData(fetchMessageList);
};

const handleFilterChange = (filterVal: any) => {
  handleFilterChangeBase(filterVal);
  resetAndFetchData(fetchMessageList);
};

const handleTabChange = ({ index }: { index: number }) => {
  handleTabChangeBase({ index });
  resetAndFetchData(fetchMessageList);
};

const readAll = async () => {
  await readAllBase();
  resetAndFetchData(fetchMessageList);
};

const init = () => {
  initBase();
  resetAndFetchData(fetchMessageList);
};

// 生命周期
onMounted(() => {
  initTagItems();
  init();
  getUnread();
});

// 页面激活时刷新
onShow(() => {
  if (useAppStore().hadDoneOnDetail) {
    resetAndFetchData(fetchMessageList);
  }
});

// 上拉加载更多
onReachBottom(() => {
  loadMore(fetchMessageList);
});
</script>

<template>
  <view class="pb-50">
    <app-watermark />
    <up-sticky style="top: 0">
      <filter-pop
        :formData="filterObj"
        :type="msgType"
        :taskType="taskType"
        @confirm="handleFilterChange"
      />
      <app-tabs :current="tabCurrent" :list="tabList" @change="handleTabChange" />
    </up-sticky>
    <view class="px-10 pt-10">
      <view v-for="(data, index) in list" :key="index" class="mb-10">
        <view class="color-gray-5 text-center mb-10">{{ data.sendTime }}</view>
        <flow-card
          v-if="msgType === 2"
          class="mb-10"
          :data="data"
          @handleClick="toFlowDetail(data)"
        />
        <task-card
          v-else
          class="mb-10"
          :taskType="taskType"
          :data="data"
          @handleClick="toDetail(data)"
        />
      </view>
      <app-empty v-show="!paginationLoading && !list.length" class="py-7" description="暂无数据" />
      <up-loadmore
        v-if="paginationLoading || list.length < totalNum"
        :status="paginationLoading ? 'loading' : list.length >= totalNum ? 'nomore' : 'loadmore'"
      />
    </view>

    <!-- 工作流标签筛选按钮 -->
    <app-bottom-actions v-show="msgType === 2" :count="1">
      <app-action-btn
        class="w-200 mx-auto"
        type="primary"
        text="标签筛选"
        @click="showTag = true"
      />
    </app-bottom-actions>

    <!-- 通用任务类型切换 -->
    <app-bottom-actions v-show="msgType === 1" :count="1">
      <view
        class="flex mx-auto w-352rpx h-64rpx text-28rpx bg-white rounded-32rpx text-center leading-64rpx overflow-hidden shadow-[0_0_12rpx_4rpx_rgb(209_207_207/50%)]"
      >
        <view
          :class="[
            'flex-1 transition-all-300',
            taskType === 2 ? 'bg-[#3561f2] text-white rounded-32rpx' : '',
          ]"
          @click="changeTaskType(2)"
        >
          我收到的
        </view>
        <view
          :class="[
            'flex-1 transition-all-300',
            taskType === 1 ? 'bg-[#3561f2] text-white rounded-32rpx' : '',
          ]"
          @click="changeTaskType(1)"
        >
          我发出的
        </view>
      </view>
    </app-bottom-actions>

    <!-- 全部标记已读按钮 -->
    <app-fly-btn icon="a-qingchu_clear1" :bottom="256" @click="readAll" />

    <!-- 发布任务按钮 -->
    <app-fly-btn v-show="msgType === 1" icon="plus" :bottom="152" @click="toPublish" />

    <!-- 标签筛选弹窗 -->
    <up-popup :show="showTag" mode="bottom" :round="16" closeable @close="showTag = false">
      <view class="">
        <view class="text-16 font-bold text-center pt-4 pb-2">标签筛选</view>
        <app-cate-select
          v-model:activeIndex="activeIndex"
          v-model:activeId="activeId"
          :activeIds="activeIds"
          :items="tagItems"
          height="600rpx"
          @update:activeIndex="handleLabelNavChange"
          @update:activeId="handleLabelSelect"
        />
        <view class="p-4">
          <app-action-btn type="primary" text="确认" block @click="handleConfirmTag" />
        </view>
      </view>
    </up-popup>
  </view>
</template>
