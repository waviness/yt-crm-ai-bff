<script setup lang="ts">
import TaskPiece from './components/task-piece.vue';
import { useTaskSend } from './composables/use-task-send';
import { useSimplePagination } from '@/composables/use-pagination';

const appStore = useAppStore();

// 使用业务逻辑 composable
const {
  taskType,
  taskStatusName,
  keywords,
  statusShow,
  statusOptions,
  sendStatusOptions,
  fetchTaskList,
  changeTaskType: changeTaskTypeBase,
  onSelectStatus: onSelectStatusBase,
  toPublish,
  cancelTask: cancelTaskBase,
  resendTask,
  toDetail,
} = useTaskSend();

// 使用分页 composable（在页面中使用）
const {
  list,
  totalNum: taskNum,
  paginationLoading,
  resetAndFetchData,
  loadMore,
} = useSimplePagination<any>(10);

// 包装业务方法，传入分页方法
const changeTaskType = (type: number) => {
  changeTaskTypeBase(type, () => resetAndFetchData(fetchTaskList));
};

const onSelectStatus = (action: any) => {
  onSelectStatusBase(action, () => resetAndFetchData(fetchTaskList));
};

const cancelTask = (item: any) => {
  cancelTaskBase(item, () => resetAndFetchData(fetchTaskList));
};

// 搜索时刷新数据
const refreshData = () => {
  resetAndFetchData(fetchTaskList);
};

// 页面加载时获取数据
onLoad(() => {
  resetAndFetchData(fetchTaskList);
});

// 页面激活时刷新
onShow(() => {
  if (useAppStore().hadDoneOnDetail) {
    resetAndFetchData(fetchTaskList);
  }
});

// 上拉加载更多
onReachBottom(() => {
  loadMore(fetchTaskList);
});

// 获取滑动操作按钮配置
const getSwipeOptions = (item: any) => {
  const options = [];
  if (+item.useStatus === 1) {
    options.push({
      text: '作废',
      style: {
        backgroundColor: appStore.theme.color.primary,
      },
    });
  } else if (+item.useStatus === 0) {
    options.push({
      text: '再次发起',
      style: {
        backgroundColor: appStore.theme.color.primary,
      },
    });
  } else {
    options.push({
      text: '',
      style: {
        backgroundColor: appStore.theme.color.primary,
      },
    });
  }
  return options;
};

// 处理滑动操作按钮点击
const handleSwipeAction = (item: any) => {
  if (+item.useStatus === 1) {
    cancelTask(item);
  } else if (+item.useStatus === 0) {
    resendTask(item);
  }
};
</script>

<template>
  <view class="pb-50">
    <app-watermark> </app-watermark>
    <up-sticky style="top: 0">
      <app-search
        v-model="keywords"
        clearable
        placeholder="请输入标题|内容|发送人"
        @search="refreshData"
      />
    </up-sticky>
    <view class="flex text-14 py-2 px-10">
      <view
        class="h-80 leading-10 rounded-20rpx text-center flex-1 mr-2"
        :class="taskType === 2 ? 'bg-main-3 color-white' : 'bg-white'"
        @click="changeTaskType(2)"
      >
        我收到的
      </view>
      <view
        class="h-80 leading-10 rounded-20rpx text-center flex-1"
        :class="taskType === 1 ? 'bg-main-3 color-white' : 'bg-white'"
        @click="changeTaskType(1)"
      >
        我发出的
      </view>
    </view>
    <view class="px-10">共{{ taskNum }}条</view>
    <view v-if="paginationLoading || list.length">
      <up-swipe-action v-if="taskType === 1">
        <up-swipe-action-item
          v-for="item in list"
          :key="item.cmsId"
          :options="getSwipeOptions(item)"
          :disabled="!(+item.useStatus === 0 || +item.useStatus === 1)"
          class="mt-2"
          @click="handleSwipeAction(item)"
        >
          <view @click="toDetail(item)">
            <task-piece :data="item" :receipt="false" :showProgress="true" />
          </view>
        </up-swipe-action-item>
      </up-swipe-action>
      <view v-else>
        <view v-for="item in list" :key="item.cmsId" class="mt-2" @click="toDetail(item)">
          <task-piece :data="item" :receipt="true" :showProgress="false" />
        </view>
      </view>
      <up-loadmore
        v-if="paginationLoading || list.length < taskNum"
        :status="paginationLoading ? 'loading' : 'loadmore'"
      />
    </view>
    <app-empty v-else-if="!paginationLoading && !list.length" class="py-7" description="暂无数据" />
    <app-bottom-actions>
      <app-action-btn
        class="flex-1"
        :text="taskStatusName === '全部' ? '状态筛选' : taskStatusName"
        icon="shaixuanfilter1"
        :multi="false"
        type="plain"
        @click="statusShow = true"
      />
      <app-action-btn
        class="flex-1"
        text="新增任务"
        icon="xingzengtask"
        :multi="false"
        type="primary"
        @click="toPublish"
      />
    </app-bottom-actions>
    <app-action-sheet
      v-model:show="statusShow"
      :actions="taskType === 2 ? statusOptions : sendStatusOptions"
      cancel-text="取消"
      description="状态筛选"
      close-on-click-action
      @select="onSelectStatus"
    />
  </view>
</template>

<style lang="scss" scoped>
// 仅保留必要的深度选择器样式（用于第三方组件样式覆盖）
:deep(.footer-btn.up-button) {
  box-shadow: 0 0 6px 3px rgb(209 207 207 / 50%);
  font-weight: bold;
}
</style>
