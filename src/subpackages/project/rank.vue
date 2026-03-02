<!-- 项目管理 - 准入管理 - 排名 -->
<script setup lang="ts">
import RankItem from './components/rank-item.vue';
import { useProjectRank } from './composables/use-project-rank';

const appStore = useAppStore();

// 使用业务逻辑 composable
const {
  isMessage,
  date,
  projectShow,
  searchParams,
  total,
  listTypeText,
  listType,
  currentProjectObj,
  currentProductObj,
  currentOrgObj,
  currentDeptObj,
  activeId,
  orgList,
  orgActiveId,
  orgActiveIndex,
  projectText,
  list,
  orgShow,
  loading,
  proLoading,
  projectList,
  activeIndex,
  keywords,
  handleSearchProject,
  handleSortClick,
  toDetail,
  initPage,
  handleProChangeShow,
  handleConfirm,
  handleOrgChangeShow,
  handleConfirmOrg,
  goBack,
} = useProjectRank();

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

// 页面加载时初始化
onLoad((options: any) => {
  initPage(options);
});
</script>

<template>
  <view class="pb-100">
    <app-watermark> </app-watermark>
    <!-- 项目筛选区域 -->
    <view class="p-10 bg-white">
      <view
        :class="[
          'filter-border h-80 flex justify-between items-center text-14 px-10',
          projectText ? 'bg-main-3 border-main-3 text-white' : '',
        ]"
        @click="handleProChangeShow"
      >
        <view class="text-14">{{ projectText || '项目/产品筛选' }}</view>
        <up-icon class="ml-7 text-14" :name="projectShow ? 'arrow-up' : 'arrow-down'" />
      </view>
    </view>

    <!-- 统计信息 -->
    <view class="px-10 py-2">
      <view class="rounded-20rpx bg-white flex items-center p-4">
        <app-icon
          name="zhanbitu_chart-proportion"
          size="34rpx"
          :color="appStore.theme.color.primary"
        />
        <view class="flex-1 mx-2 text-14 text-gray-500">准入池总数</view>
        <view class="text-20 font-bold">{{
          Math.round(parseFloat(total.toString()) * 100) / 100
        }}</view>
      </view>

      <!-- 排名列表 -->
      <view class="mt-2 rounded-20rpx bg-white pb-4">
        <view class="flex ml-4 py-3">
          <app-th-item class="flex-6" :title="listTypeText[listType]" />
          <app-th-item class="flex-4 ml-2" title="准入池" />
          <app-th-item
            class="flex-5 ml-2"
            title="已准入"
            :sort="searchParams.finish"
            @click="handleSortClick(1)"
            sortShow
          />
          <app-th-item
            class="flex-4 ml-2"
            title="准入率"
            :sort="searchParams.rate"
            @click="handleSortClick(2)"
            sortShow
          />
        </view>
        <rank-item
          v-for="(item, idx) in list"
          :key="idx"
          :data="item"
          :gray="idx % 2 === 0"
          @click="toDetail(item)"
        />
        <app-empty v-show="!loading && !list.length" class="py-7" description="暂无数据" />
      </view>
    </view>

    <!-- 项目选择弹窗 -->
    <up-popup
      :show="projectShow"
      round="16"
      position="bottom"
      closeable
      @close="projectShow = false"
    >
      <view class="text-center py-4 text-16 font-bold">项目/产品筛选</view>
      <app-search
        v-model="keywords"
        placeholder="搜索"
        @search="handleSearchProject"
        @clear="handleSearchProject"
      />
      <app-cate-select
        :items="projectList"
        v-model:activeIndex="activeIndex"
        v-model:activeId="activeId"
      />
      <view class="px-4 py-2">
        <up-button type="primary" shape="circle" @click="handleConfirm">确认</up-button>
      </view>
    </up-popup>

    <!-- 组织选择弹窗 -->
    <up-popup :show="orgShow" round="16" position="bottom" closeable @close="orgShow = false">
      <view class="text-center py-4 text-16 font-bold">中心部门切换</view>
      <app-cate-select
        :items="orgList"
        v-model:activeIndex="orgActiveIndex"
        v-model:activeId="orgActiveId"
      />
      <view class="px-4 py-2">
        <up-button type="primary" shape="circle" @click="handleConfirmOrg"> 确认 </up-button>
      </view>
    </up-popup>

    <!-- 底部按钮 -->
    <app-bottom-actions>
      <view class="w-full flex justify-center">
        <up-button
          v-if="listType === 2 || listType === 3"
          class="m-0"
          :color="appStore.theme.color.main"
          :customStyle="customStyle"
          @click="handleOrgChangeShow"
        >
          {{ listType === 2 ? currentOrgObj.text : `${currentOrgObj.text}/${currentDeptObj.text}` }}
        </up-button>
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
