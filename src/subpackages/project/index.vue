<!-- 项目管理 - 准入管理 -->
<script setup lang="ts">
import BaseBlock from './components/base-block.vue';
import ProjectItem from './components/project-item.vue';
import { useProjectCommon } from './composables/use-project-common';
import { useProjectSearchUnified } from './composables/use-project-search-unified';
import { SORT_TYPES } from './constants';
import type { StatisticsData, SearchParams } from './types';

const userStore = useUserStore();
const projectStore = useProjectStore();

// 使用公共逻辑获取基础数据
const {
  columns,
  yearMonthData,
  orgOriginList,
  orgList,
  resList,
  selectMonth,
  initData,
  getAccessData,
} = useProjectCommon(false);

// 使用搜索逻辑
const { searchUsers } = useProjectSearchUnified();

// 使用简化分页
const { list, totalNum, paginationLoading, resetAndFetchData, loadMore } = useSimplePagination(10);

// 业务数据
const data = ref({} as StatisticsData);
const searchParams = ref<SearchParams>({
  key: '',
  goodsnum: SORT_TYPES.DESC,
  targetnum: SORT_TYPES.NONE,
  allownum: SORT_TYPES.NONE,
});

// 计算属性
const leaderLevel = computed(() => projectStore.projectLeaderLevel || 0);
const placeholder = ref('搜索');

// 获取统计数据
const getData = async () => {
  const res: any = await getAccessData();
  data.value = res;
};

// 数据获取方法
const fetchData = async ({ pageNum, pageSize }: { pageNum: number; pageSize: number }) => {
  const { key, goodsnum, targetnum, allownum } = searchParams.value;
  const params: any = {
    date: selectMonth.value.replace('.', '-'),
    userIdList: !leaderLevel.value
      ? [userStore.userInfor.userId]
      : resList.value[2]
          .filter(({ userId }: any) => userId !== -1)
          .map(({ userId }: any) => userId),
    key,
    orderColumn: goodsnum ? 'productNum' : targetnum ? 'goalNum' : allownum ? 'accessNum' : '',
    orderType:
      goodsnum === SORT_TYPES.ASC || targetnum === SORT_TYPES.ASC || allownum === SORT_TYPES.ASC
        ? 1
        : 0,
    pageNum,
    pageSize,
  };

  if (leaderLevel.value) {
    params.centerId =
      resList.value[0].id === 1 || resList.value[0].id?.toString().includes('-1')
        ? ''
        : resList.value[0].id;
    params.crmDeptId = resList.value[1].id.toString().includes('-1') ? '' : resList.value[1].id;
  }

  const res = await ProjectService.getAccessProjectDoc(params);
  return res;
};

// 事件处理方法
const handleMonthChange = (value: string) => {
  selectMonth.value = value;
  getData();
  resetAndFetchData(fetchData);
};

const handleUserChange = (res: any) => {
  resList.value = res;
  getData();
  resetAndFetchData(fetchData);
};

const handleSortClick = (type: number) => {
  const { goodsnum, targetnum, allownum } = searchParams.value;

  // 重置所有排序
  searchParams.value.goodsnum = SORT_TYPES.NONE;
  searchParams.value.targetnum = SORT_TYPES.NONE;
  searchParams.value.allownum = SORT_TYPES.NONE;

  // 设置当前排序
  if (type === 1) {
    searchParams.value.goodsnum = goodsnum === SORT_TYPES.DESC ? SORT_TYPES.ASC : SORT_TYPES.DESC;
  } else if (type === 2) {
    searchParams.value.targetnum = targetnum === SORT_TYPES.DESC ? SORT_TYPES.ASC : SORT_TYPES.DESC;
  } else if (type === 3) {
    searchParams.value.allownum = allownum === SORT_TYPES.DESC ? SORT_TYPES.ASC : SORT_TYPES.DESC;
  }
  resetAndFetchData(fetchData);
};

const toProject = (item: any) => {
  // 设置项目信息和共享数据到 store
  projectStore.setProjectParams({
    projectId: item.projectId,
    projectName: item.projectName,
    selectMonth: selectMonth.value,
    resList: resList.value,
    orgOriginList: orgOriginList.value,
    orgList: orgList.value,
    columns: columns.value,
    yearMonthData: yearMonthData.value,
  });

  router.push(RouteMap.projectGoods);
};

const toRank = () => {
  router.push(RouteMap.projectRank, { date: selectMonth.value.replace('.', '-') });
};

// 搜索方法
const handleUserSearch = (keyword: string) => {
  searchUsers(orgOriginList.value, orgList, keyword);
};

const handleSearch = () => {
  resetAndFetchData(fetchData);
};

// 页面加载处理
onLoad(async () => {
  projectStore.setCurrentTab('access');
  await initData();
  await Promise.all([getData(), resetAndFetchData(fetchData)]);
});

// 页面显示时检测是否需要自动切换
onShow(() => {
  const pendingSwitch = projectStore.pendingTabSwitch;
  if (pendingSwitch && pendingSwitch !== 'access') {
    // 清除标记
    projectStore.setPendingTabSwitch(null);
    router.redirect(RouteMap.projectEx);
  }
});

// 上拉加载更多
onReachBottom(() => {
  loadMore(fetchData);
});
</script>

<template>
  <view class="pb-100">
    <app-watermark> </app-watermark>
    <base-block
      :leaderLevel="leaderLevel"
      :data="data"
      :selectMonth="selectMonth"
      :columns="columns"
      :yearMonthData="yearMonthData"
      :orgList="orgList"
      :resList="resList"
      variant="access"
      :showUserSelect="!!leaderLevel"
      @monthChange="handleMonthChange"
      @search="handleUserSearch"
      @userChange="handleUserChange"
    >
      <app-search
        v-model="searchParams.key"
        :placeholder="placeholder"
        @search="handleSearch"
        @clear="handleSearch"
      />
      <view class="flex ml-4 py-3">
        <app-th-item class="flex-1" title="项目名称" />
        <app-th-item
          class="flex-1 ml-2"
          title="产品数量"
          :sort="searchParams.goodsnum"
          @click="handleSortClick(1)"
          sortShow
        />
        <app-th-item
          class="flex-1 ml-2"
          title="目标条目"
          :sort="searchParams.targetnum"
          @click="handleSortClick(2)"
          sortShow
        />
        <app-th-item
          class="flex-1 ml-2"
          title="准入条目"
          :sort="searchParams.allownum"
          @click="handleSortClick(3)"
          sortShow
        />
      </view>
      <view v-if="paginationLoading || list.length">
        <project-item
          v-for="(item, idx) in list"
          :key="idx"
          :data="item"
          :gray="idx % 2 === 0"
          @click="toProject(item)"
        />
        <up-loadmore
          v-if="paginationLoading || list.length < totalNum"
          :status="paginationLoading ? 'loading' : 'loadmore'"
        />
      </view>
      <app-empty
        v-else-if="!paginationLoading && !list.length"
        class="py-7"
        description="暂无数据"
      />
    </base-block>
    <app-fix-btn v-if="!!leaderLevel" text="点击查看排名" :fontSize="12" bold @click="toRank" />
  </view>
</template>
