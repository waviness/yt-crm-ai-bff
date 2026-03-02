<script setup lang="ts">
import { useHighValueList } from '../composables/use-high-value-list';
import CardDetail from '../components/card-detail.vue';

defineOptions(SHARED_STYLE_OPTIONS);

const {
  list,
  loading,
  finished,
  refreshing,
  tabActiveIndex,
  filterObj,
  hasFilter,
  handleTabChange,
  onRefresh,
  onLoad,
  showPopup,
  refreshFilter,
  handleFilter,
  closePupup,
  showDetail,
} = useHighValueList('info');

// 筛选弹窗显示
const show = ref(false);

// 打开筛选
const openFilter = () => {
  showPopup(show);
};

// 确认筛选
const confirmFilter = () => {
  handleFilter(show);
};

// 关闭筛选
const closeFilter = () => {
  closePupup();
  show.value = false;
};

onMounted(() => {
  onRefresh();
});

onShow(() => {
  // 从详情页返回时刷新
  const appStore = useAppStore();
  if (appStore.hadDoneOnDetail) {
    onRefresh();
    appStore.setHadDoneOnDetail(false);
  }
});
</script>

<template>
  <view class="full-HW relative">
    <app-watermark></app-watermark>

    <!-- 固定的筛选条件 -->
    <view class="absolute top-0 w-full h-116rpx p-10px z-9999">
      <view
        :class="[
          'flex items-center justify-between h-full px-3 text-14 bg-white rounded-20rpx',
          show ? 'color-main' : '',
          hasFilter ? 'bg-main color-white' : '',
        ]"
        @click="openFilter"
      >
        <text>条件筛选</text>
        <up-icon :name="`arrow-${show ? 'up' : 'down'}`" size="32rpx" />
      </view>
    </view>

    <!-- 占位 -->
    <view class="h-116rpx"></view>

    <!-- Tab 切换 -->
    <up-tabs :current="tabActiveIndex" @change="handleTabChange">
      <up-tabs-item title="未处理" :name="0" />
      <up-tabs-item title="已处理" :name="1" />
    </up-tabs>

    <!-- 列表 -->
    <view class="h-[calc(100%-116rpx-88rpx)] px-10px overflow-hidden">
      <app-pull-refresh
        :refreshing="refreshing"
        :showLoadmore="true"
        :loadmoreProps="{ status: loading ? 'loading' : finished ? 'nomore' : 'loadmore' }"
        pullRefreshHeight="100%"
        @refresh="onRefresh"
        @loadmore="onLoad"
      >
        <card-detail
          v-for="(item, index) in list"
          :key="index"
          :info="item"
          @click="showDetail(item)"
        />
        <app-empty v-if="!loading && !list.length" description="暂无数据" />
      </app-pull-refresh>
    </view>

    <!-- 筛选弹窗 -->
    <up-popup :show="show" mode="top" :round="16" @close="closeFilter">
      <view class="bg-white h-116rpx p-10px">
        <view
          class="flex items-center justify-between h-full px-3 text-14 color-main rounded-20rpx"
        >
          <text>条件筛选</text>
          <up-icon name="arrow-up" size="32rpx" />
        </view>
      </view>
      <view class="w-[calc(100%-32px)] h-1px ml-16px mt-2px bg-gray-1"></view>
      <up-form class="px-4">
        <app-form-item label="货品ID｜名称">
          <up-input
            v-model="filterObj.goodsKeyword"
            placeholder="请输入货品ID｜名称"
            input-align="right"
            fontSize="14"
            border="none"
            clearable
          />
        </app-form-item>
        <app-form-item label="客户ID｜名称">
          <up-input
            v-model="filterObj.customerKeyword"
            placeholder="请输入客户ID｜名称"
            input-align="right"
            fontSize="14"
            border="none"
            clearable
          />
        </app-form-item>
        <app-form-item label="核算单元" :borderBottom="false">
          <up-input
            v-model="filterObj.entryKeyword"
            placeholder="点击输入核算单元ID｜名称"
            input-align="right"
            fontSize="14"
            border="none"
            clearable
          />
        </app-form-item>
      </up-form>
      <view class="flex justify-center mt-4 mb-5 px-4">
        <up-button class="flex-1 mr-3" shape="round" @click="refreshFilter">重置</up-button>
        <up-button class="flex-1" shape="round" type="primary" @click="confirmFilter">
          确认
        </up-button>
      </view>
    </up-popup>
  </view>
</template>

<style scoped></style>
