<template>
  <view>
    <up-sticky style="background-color: white; top: 0">
      <view class="px-10 pb-2">
        <up-tabs
          v-if="
            +entryObj.active === 1 &&
            (+entryObj.level === 0 || +entryObj.level === 1 || +entryObj.level === 2)
          "
          :list="tabsList"
          :active="activeTab"
          @change="tabActiveChange"
        />
      </view>
      <overdueCard :totaLVal="totaLVal" :entryObj="entryObj" />
      <view class="pb-2 mb-2"></view>
    </up-sticky>

    <app-pull-refresh
      :refreshing="refreshing"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <overdueItem
        :dataList="list"
        :activeType="+entryObj.active"
        :tabType="+entryObj.tabType"
        @toDetail="toDetail"
        :active="entryObj.active"
        :lineShow="true"
      />
      <app-empty v-if="!loading && !list.length" class="mt-6" />
    </app-pull-refresh>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import overdueItem from './components/base/overdue-list-item.vue';
import overdueCard from './components/base/overdue-card-total.vue';
import type { EntryObj } from './types/overdue-page.ts';
import { usePagination } from '@/composables/use-pagination';
import { useOverduePage } from './composables/use-overdue-page.ts';

// 确保active属性被正确初始化
const entryObj = ref<EntryObj>({
  active: '1', // 默认激活状态为1，确保up-tabs显示
  tabType: '0',
  deptId: '',
  deptName: '',
  date: '',
  level: '1', // 默认级别为1，确保up-tabs显示
});

// 立即检查并确保active有值
if (!entryObj.value.active) {
  entryObj.value.active = '1';
}

const {
  tabsList,
  activeTab,
  loading,
  totaLVal,
  fetchGetOverdueStat,
  fetchGetdataList,
  onhandleActiveChange,
  toDetail,
} = useOverduePage(entryObj);

// 使用分页组合式API
const pagination = usePagination(
  {
    pageSize: 10,
    initialPage: 1,
    toolBarHeight: 145,
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

const tabActiveChange = ({ index }: { index: number }) => {
  onhandleActiveChange(index);
  init();
};

const init = () => {
  calcPullRefreshHeight();
  fetchGetOverdueStat();
  onRefresh();
};

onMounted(() => {
  // 确保active属性始终有值
  if (!entryObj.value.active) {
    entryObj.value.active = '1';
  }
  init();
});

// 页面加载
onLoad(options => {
  console.log('页面参数:', JSON.stringify(options));
  if (options) {
    // 449用于测试
    entryObj.value.deptId = '449';
    console.log('手动设置deptId为449');
    entryObj.value.deptName = options.deptName || options.name || '测试部门';
    // 确保active属性始终有值
    entryObj.value.active =
      options.active && String(options.active).trim() ? String(options.active) : '1';
    entryObj.value.tabType = options.tabType || '0';
    entryObj.value.date = options.date || '';
    entryObj.value.level = options.level || '1';

    // 最后再次确认active属性有值
    if (!entryObj.value.active) {
      entryObj.value.active = '1';
    }

    console.log('更新后的entryObj:', JSON.stringify(entryObj.value));
  }
});
</script>

<style lang="scss" scoped>
::v-deep .u-tabs__wrapper__nav {
  width: 100%;

  .u-tabs__wrapper__nav__item {
    flex: 1;
  }
}
</style>
