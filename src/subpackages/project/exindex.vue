<!-- 项目管理 - 深分进度 -->
<script setup lang="ts">
import { useProjectCommon } from './composables/use-project-common';
import BaseBlock from './components/base-block.vue';
import ProjectExItem from './components/ex-item.vue';
import TypeTab from './components/type-tab.vue';
import type { StatisticsData, SearchParams } from './types';
import { useProjectSearchUnified } from './composables/use-project-search-unified';

const projectStore = useProjectStore();

// 使用公共逻辑 composable
const { columns, yearMonthData, orgOriginList, orgList, resList, selectMonth, initData } =
  useProjectCommon(true);

const { searchDepts } = useProjectSearchUnified();

// 业务数据
const typeValue = ref(1);
const data = ref({} as StatisticsData);
const searchParams = ref<SearchParams>({
  key: '',
  finishnum: 1, // 0无排序 1降序 2升序
  ratenum: 0,
});

// 定义搜索占位符
const placeholder = ref('搜索');

// 获取统计数据
const getData = async () => {
  const params = {
    date: selectMonth.value.replace('.', '-'),
    centerId: resList.value[0]?.id === 1 ? '' : resList.value[0]?.id,
    crmDeptId: resList.value[1]?.id?.toString().includes('-1') ? '' : resList.value[1]?.id,
  };

  const res = await ProjectService.getDeepProjectDocNum(params);
  data.value = res;
};

// 使用简化分页
const { list, totalNum, paginationLoading, resetAndFetchData, loadMore } = useSimplePagination(10);

// 数据获取方法
const fetchData = async ({ pageNum, pageSize }: { pageNum: number; pageSize: number }) => {
  const { key, finishnum, ratenum } = searchParams.value;
  const params = {
    date: selectMonth.value.replace('.', '-'),
    centerId: resList.value[0]?.id === 1 ? '' : resList.value[0]?.id,
    crmDeptId: resList.value[1]?.id?.toString().includes('-1') ? '' : resList.value[1]?.id,
    flag: typeValue.value,
    key,
    orderColumn: finishnum ? 'targetCompleted' : ratenum ? 'completeRate' : '',
    orderType: finishnum === 2 || ratenum === 2 ? 1 : 0,
    pageNum,
    pageSize,
  };

  const res = await ProjectService.getDeepProjectDoc(params);
  res.list.forEach((item: any) => {
    item.name = item.projectName;
  });
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
  const { finishnum, ratenum } = searchParams.value;

  // 重置所有排序
  searchParams.value.finishnum = 0;
  searchParams.value.ratenum = 0;

  // 设置当前排序
  if (type === 1) {
    searchParams.value.finishnum = finishnum === 1 ? 2 : 1;
  } else if (type === 2) {
    searchParams.value.ratenum = ratenum === 1 ? 2 : 1;
  }
  resetAndFetchData(fetchData);
};

const handleTypeChange = (type: number) => {
  typeValue.value = type;
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

  router.push(RouteMap.projectExGoods);
};

const toRank = () => {
  router.push(RouteMap.projectExRank, { date: selectMonth.value.replace('.', '-') });
};

// 搜索方法
const handleDeptSearch = (keyword: string) => {
  searchDepts(orgOriginList.value, orgList, keyword);
};

const handleSearch = () => {
  resetAndFetchData(fetchData);
};

// 排序点击处理
const onSortClick = (type: number) => {
  handleSortClick(type);
};

onReachBottom(() => {
  loadMore(fetchData);
});

// 页面加载时处理路由逻辑
onLoad(async () => {
  projectStore.setCurrentTab('ex');
  await initData();
  await Promise.all([getData(), resetAndFetchData(fetchData)]);
});

// 页面显示时检测是否需要自动切换
onShow(() => {
  const pendingSwitch = projectStore.pendingTabSwitch;
  if (pendingSwitch && pendingSwitch !== 'ex') {
    // 清除标记
    projectStore.setPendingTabSwitch(null);
    router.redirect(RouteMap.project);
  }
});
</script>

<template>
  <view class="pb-100">
    <app-watermark> </app-watermark>
    <base-block
      :leaderLevel="projectStore.projectLeaderLevel || 0"
      :data="data"
      :selectMonth="selectMonth"
      :columns="columns"
      :yearMonthData="yearMonthData"
      :orgList="orgList"
      :resList="resList"
      variant="ex"
      :showUserSelect="false"
      @monthChange="handleMonthChange"
      @search="handleDeptSearch"
      @userChange="handleUserChange"
    >
      <view class="flex items-center">
        <app-search
          class="flex-1"
          v-model="searchParams.key"
          :placeholder="placeholder"
          @search="handleSearch"
          @clear="handleSearch"
        />
        <type-tab :type="typeValue" @typeChange="handleTypeChange" />
      </view>
      <view class="overflow-x-auto">
        <view class="flex" style="min-width: 511px; height: 44px">
          <app-th-item style="width: 16%; min-width: 75px" class="ex-item-left" title="项目名称" />
          <app-th-item class="ml-2" style="width: 16%; min-width: 78px" title="指标口径" />
          <app-th-item class="ml-2" style="width: 16%; min-width: 78px" title="口径类型" />
          <app-th-item
            class="ml-2"
            style="width: 15%; min-width: 60px"
            :title="typeValue === 1 ? '指标' : '覆盖'"
          />
          <app-th-item
            class="ml-2"
            style="width: 20%; min-width: 102px"
            :title="typeValue === 1 ? '完成指标' : '已覆盖'"
            :sort="searchParams.finishnum"
            @click="onSortClick(1)"
            :sortShow="true"
          />
          <app-th-item
            class="ml-2"
            style="width: 17%; min-width: 78px"
            :title="typeValue === 1 ? '完成率' : '覆盖率'"
            :sort="searchParams.ratenum"
            @click="onSortClick(2)"
            :sortShow="true"
          />
        </view>
        <view v-if="paginationLoading || list.length" style="min-width: 527px">
          <project-ex-item
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
      </view>
    </base-block>
    <app-fix-btn text="点击查看排名" :fontSize="12" bold @click="toRank" />
  </view>
</template>

<style lang="scss" scoped>
:deep(.up-search) {
  border-radius: 10px;
}

.ex-item-left {
  position: sticky;
  left: 0;
  padding-left: 16px;
  background: #fff;
}
</style>
