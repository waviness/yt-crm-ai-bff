<!-- 项目管理 - 深分进度 - 排名 -->
<script setup lang="ts">
import TypeTab from './components/type-tab.vue';
import ExRankItem from './components/exrank-item.vue';
import { useProjectExRank } from './composables/use-project-ex-rank';

const appStore = useAppStore();

const customStyle = computed(() => {
  return {
    'font-size': '12px',
    'border-radius': '42px',
    'box-shadow': '0 0 6px 3px rgba(209, 207, 207, 0.5)',
    'font-weight': 'bold',
    padding: '0 20px',
    width: 'auto',
  };
});

// 使用业务逻辑 composable
const {
  // 响应式数据
  isMessage,
  date,
  projectShow,
  searchParams,
  total,
  typeValue,
  listTypeText,
  listType,
  currentProObj,
  currentOrgObj,
  orgList,
  orgActiveIndex,
  projectText,
  list,
  orgShow,
  loading,
  error,

  // 计算属性
  hasData,
  isLoading,

  // 项目搜索相关
  proLoading,
  projectList,
  activeIndex,
  keywords,

  // 方法
  handleSearchProject,
  getOrgList,
  getRankList,
  handleProjectSelect,
  handleOrgSelect,
  handleListTypeChange,
  handleTypeChange,
  handleSortClick,
  toDetail,
  handleConfirm,
  handleOrgChangeShow,
  handleConfirmOrg,
  goBack,
  initPage,
} = useProjectExRank();

// 页面加载时初始化
onLoad((options: any) => {
  initPage(options);
});
</script>

<template>
  <view class="pb-100">
    <app-watermark> </app-watermark>
    <view class="p-10 bg-white">
      <view
        :class="[
          'filter-border h-80 flex justify-between items-center text-14 px-10',
          projectText ? 'bg-main-3 border-main-3 text-white' : '',
        ]"
        @click="projectShow = true"
      >
        <view class="text-14">{{ projectText || '项目筛选' }}</view>
        <up-icon class="ml-7 text-14" :name="projectShow ? 'arrow-up' : 'arrow-down'" />
      </view>
    </view>
    <view class="px-10 py-2">
      <view class="flex">
        <view class="flex-1 rounded-20rpx bg-white flex items-center py-4 px-3">
          <app-icon
            name="zhanbitu_chart-proportion"
            size="34rpx"
            :color="appStore.theme.color.primary"
          />
          <view class="flex-1 mx-2 text-14 color-gray-5">深分指标</view>
          <view class="text-20 font-bold">{{ Math.round(total) }}</view>
        </view>
        <view class="ml-2 flex-1 rounded-20rpx bg-white px-2 py-3">
          <type-tab :type="typeValue" @typeChange="handleTypeChange" small />
        </view>
      </view>
      <view class="mt-2 rounded-20rpx bg-white pb-4">
        <view class="flex ml-4 py-3">
          <app-th-item class="flex-6" :title="listTypeText[listType]" />
          <app-th-item
            class="flex-4 ml-2"
            :title="typeValue === 1 ? '完成率' : '覆盖率'"
            :sort="searchParams.rate"
            @click="handleSortClick"
            sortShow
          />
        </view>
        <ex-rank-item
          v-for="(item, idx) in list"
          :key="idx"
          :data="item"
          :gray="idx % 2 === 0"
          @click="toDetail(item)"
        />
        <app-empty v-show="!loading && !list.length" class="py-7" description="暂无数据" />
      </view>
    </view>
    <up-popup
      :show="projectShow"
      round="16"
      position="bottom"
      closeable
      @close="projectShow = false"
    >
      <view class="text-center py-4 text-16 font-bold">项目筛选</view>
      <app-search
        v-model="keywords"
        placeholder="搜索"
        @search="handleSearchProject"
        @clear="handleSearchProject"
      />
      <scroll-view class="px-4 pt-2 pb-4 h-800 w-auto" scroll-y>
        <view
          v-for="(item, idx) in projectList"
          :key="idx"
          class="py-10 flex justify-between items-center text-14"
          @click="activeIndex = idx"
        >
          <view :class="activeIndex === idx ? 'color-main-3' : ''">{{ item.text }}</view>
          <up-icon
            v-if="activeIndex === idx"
            name="checkbox-mark"
            size="36rpx"
            :color="appStore.theme.color.primary"
          />
        </view>
        <app-empty
          v-show="!proLoading && !projectList.length"
          class="py-7"
          description="暂无数据"
        />
      </scroll-view>
      <view class="px-4 py-2">
        <up-button type="primary" shape="circle" @click="handleConfirm">确认</up-button>
      </view>
    </up-popup>
    <up-popup :show="orgShow" round="16" position="bottom" closeable @close="orgShow = false">
      <view class="text-center py-4 text-16 font-bold">中心切换</view>
      <scroll-view class="px-4 pt-2 pb-4 h-800 w-auto" scroll-y>
        <view
          v-for="(item, idx) in orgList"
          :key="idx"
          class="py-10 flex justify-between items-center text-14"
          @click="orgActiveIndex = idx"
        >
          <view :class="orgActiveIndex === idx ? 'color-main-3' : ''">{{ item.name }}</view>
          <up-icon
            v-if="orgActiveIndex === idx"
            name="checkbox-mark"
            size="36rpx"
            :color="appStore.theme.color.primary"
          />
        </view>
      </scroll-view>
      <view class="px-4 py-2">
        <up-button type="primary" shape="circle" @click="handleConfirmOrg">确认</up-button>
      </view>
    </up-popup>
    <app-bottom-actions>
      <view class="w-full flex justify-center">
        <up-button
          v-if="listType === 2"
          class="m-0"
          :color="appStore.theme.color.main"
          :customStyle="customStyle"
          @click="handleOrgChangeShow"
          >{{ currentOrgObj.name }}</up-button
        >
        <up-button
          v-if="isMessage"
          :customStyle="customStyle"
          style="border: 2px solid #2271f5; color: #2271f5"
          class="m-0 ml-4"
          @click="goBack"
        >
          返回首页
        </up-button>
      </view>
    </app-bottom-actions>
  </view>
</template>
