<template>
  <view>
    <up-sticky style="background-color: white; top: 0">
      <!-- 搜索框 (仅逾期账款显示) -->
      <view v-if="+entryObj.tabType === 0" class="px-10 py-2">
        <u-search
          v-model="keyword"
          placeholder="请输入客户单位名称|ID"
          :show-action="false"
          :clearable="true"
          @search="onRefresh"
          @clear="onRefresh"
        />
      </view>

      <!-- 筛选按钮 (仅长账龄显示) -->
      <overdueFilterPop v-if="+entryObj.tabType === 1" @confirm="onFilterConfirm" />

      <!-- 标题 -->
      <view class="px-10 pb-2 font-bold text-14 mb-1 mt-1">
        <text>{{
          +entryObj.active === 2 ? '应收账款' : +entryObj.tabType === 0 ? '逾期账款' : '长账龄'
        }}</text>
        <text>{{ entryObj.date }}</text>
      </view>

      <!-- Tab切换 (仅在level 0-1时显示) -->
      <up-tabs
        v-if="(+entryObj.level === 0 || +entryObj.level === 1) && +entryObj.active === 1"
        :list="tabsList"
        :active="activeTab"
        @change="tabActiveChange"
      />
    </up-sticky>

    <!-- 列表 -->
    <app-pull-refresh
      :refreshing="refreshing"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <!-- 统计卡片 -->
      <overdueCard :totaLVal="totaLVal" :entryObj="entryObj" :isSalesLine="true" />
      <!-- 移除多余的间距 -->
      <view class="mb-2"></view>
      <overdueDetailItem
        :dataList="list"
        :activeType="+entryObj.active"
        :tabType="+entryObj.tabType"
        @toDetail="toDetail"
      />
      <app-empty v-if="!loading && !list.length" class="mt-6" />
    </app-pull-refresh>

    <!-- 排序按钮 -->
    <!-- <view class="sort-btn" @click="sortShow = true">排序方式</view> -->

    <!-- 排序弹窗 -->
    <u-action-sheet
      v-model="sortShow"
      :actions="sortActions"
      :cancel-btn="true"
      @select="handleSortSelect"
    />
  </view>
</template>

<script lang="ts" setup>
import overdueCard from './components/base/overdue-card-total.vue';
import overdueDetailItem from './components/base/overdue-detail-item.vue';
import overdueFilterPop from './components/base/overdue-filter-pop.vue';
import type { EntryObj } from './types/overdue-page';

const entryObj = ref<EntryObj>({
  active: '',
  tabType: '',
  deptId: '',
  deptName: '',
  date: '',
  level: '',
});

const keyword = ref('');
const sortShow = ref(false);

import { useOverdueDetailPage } from './composables/use-overdue-detail-page';
const {
  tabsList,
  activeTab,
  loading,
  totaLVal,
  sortActions,
  fetchGetOverdueStat,
  fetchGetdataList,
  onhandleActiveChange,
  toDetail,
  updateKeyword,
  updateFilterParams,
  updateSortParams,
} = useOverdueDetailPage(entryObj);

// 使用分页组合式API
const pagination = usePagination(
  {
    pageSize: 20,
    initialPage: 1,
    toolBarHeight: 80,
  },
  fetchGetdataList
);

const {
  list,
  refreshing,
  loadmoreConfig,
  pullRefreshHeight,
  onRefresh,
  onLoadMore,
  calcPullRefreshHeight,
} = pagination;

// Tab切换
const tabActiveChange = ({ index }: { index: number }) => {
  onhandleActiveChange(index);
  init();
};

const onFilterConfirm = (params: any) => {
  updateFilterParams(params);
  onRefresh();
};

// 排序选择
const handleSortSelect = (item: any) => {
  updateSortParams(item.value);
  onRefresh();
};

// 监听搜索关键词
watch(keyword, val => {
  updateKeyword(val);
});

const init = () => {
  calcPullRefreshHeight();
  fetchGetOverdueStat();
  onRefresh();
};

onMounted(() => {
  init();
});

// 页面加载
onLoad(options => {
  console.log('页面参数:', options);
  if (options) {
    entryObj.value.deptId = options.id;
    entryObj.value.deptName = options.name;
    entryObj.value.active = options.active;
    entryObj.value.tabType = options.tabType || '0';
    // 为date字段添加默认值，使用当前日期
    entryObj.value.date = options.date || new Date().toLocaleDateString('zh-CN');
    entryObj.value.level = options.level || '';
  }
});
</script>

<style lang="scss" scoped>
.sort-btn {
  width: 88px;
  height: 40px;
  background: #2271f5;
  box-shadow: 0 0 6px 3px rgb(209 207 207 / 50%);
  border-radius: 42px;
  position: fixed;
  bottom: 36px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  z-index: 100;
}

::v-deep .u-tabs {
  width: 100%;

  .u-tabs__wrapper__nav {
    width: 100%;

    .u-tabs__wrapper__nav__item {
      flex: 1; // 平均分布
    }
  }
}
</style>
