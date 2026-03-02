<!-- 项目管理 - 深分进度 - 项目 -->
<script setup lang="ts">
import BaseBlock from './components/base-block.vue';
import ProjectExItem from './components/ex-item.vue';
import TypeTab from './components/type-tab.vue';
import type { TypeValue, StatisticsData, SearchParams } from './types';
import { useProjectSearchUnified } from './composables/use-project-search-unified';

const projectStore = useProjectStore();

// 使用公共逻辑 composable
const { searchDepts } = useProjectSearchUnified();

const resList = computed(() => projectStore.projectParams.resList);
const selectMonth = computed(() => projectStore.projectParams.selectMonth);
const columns = computed(() => projectStore.projectParams.columns);
const yearMonthData = computed(() => projectStore.projectParams.yearMonthData);
const orgOriginList = computed(() => projectStore.projectParams.orgOriginList);
const orgList = computed(() => projectStore.projectParams.orgList);
const projectId = computed(() => projectStore.projectParams.projectId);
const projectName = computed(() => projectStore.projectParams.projectName);
const leaderLevel = computed(() => projectStore.projectLeaderLevel || 0);

const typeValue = ref(1 as TypeValue);
const data = ref({} as StatisticsData);
const searchParams = ref<SearchParams>({
  key: '',
  finishnum: 1, // 0无排序 1降序 2升序
  ratenum: 0,
});
const placeholder = ref('搜索');

// 获取统计数据
const getData = async () => {
  const params = {
    date: selectMonth.value.replace('.', '-'),
    centerId: resList.value[0]?.id === 1 ? '' : resList.value[0]?.id,
    crmDeptId: resList.value[1]?.id?.toString().includes('-1') ? '' : resList.value[1]?.id,
    projectId: projectId.value,
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
    projectId: projectId.value,
    key,
    orderColumn: finishnum ? 'targetCompleted' : ratenum ? 'completeRate' : '',
    orderType: finishnum === 2 || ratenum === 2 ? 1 : 0,
    pageNum,
    pageSize,
  };

  const res = await ProjectService.getDeepProjectDocDept(params);
  res.list.forEach((item: any) => {
    item.name = item.deptName;
  });
  return res;
};

const handleMonthChange = (value: string) => {
  projectStore.projectParams.selectMonth = value;
  getData();
  resetAndFetchData(fetchData);
};

const handleUserChange = (res: any) => {
  projectStore.projectParams.resList = res;
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
  typeValue.value = type as TypeValue;
  getData();
  resetAndFetchData(fetchData);
};

const toPolicy = () => {
  router.push(RouteMap.projectPolicy, {
    type: 2,
    date: selectMonth.value.replace('.', '-'),
    projectId: projectId.value,
    projectName: projectName.value,
  });
};

// 搜索方法
const onDeptSearch = (keyword: string) => {
  searchDepts(orgOriginList.value, orgList, keyword);
};

const handleSearch = () => {
  resetAndFetchData(fetchData);
};

onReachBottom(() => {
  loadMore(fetchData);
});

// 页面加载时处理路由逻辑
onLoad(() => {
  // 设置当前tab
  projectStore.setCurrentTab('ex');

  getData(); // 获取统计数据
  resetAndFetchData(fetchData); // 获取分页数据
});
</script>

<template>
  <view class="pb-100">
    <app-watermark> </app-watermark>
    <base-block
      :leaderLevel="leaderLevel"
      :data="data"
      :title="projectName"
      :selectMonth="selectMonth"
      :columns="columns"
      :yearMonthData="yearMonthData"
      :orgList="orgList"
      :resList="resList"
      variant="ex"
      :showUserSelect="false"
      @monthChange="handleMonthChange"
      @search="onDeptSearch"
      @userChange="handleUserChange"
    >
      <view class="flex items-center">
        <view class="px-3 py-10">
          <up-search
            key="project-exgoods-search-input"
            class="flex-1"
            v-model="searchParams.key"
            :placeholder="placeholder"
            :clearable="true"
            shape="square"
            bgColor="#f7f8fa"
            :showAction="false"
            confirm-type="search"
            @search="handleSearch"
            @clear="handleSearch"
          />
        </view>
        <type-tab :type="typeValue" @typeChange="handleTypeChange" />
      </view>
      <view class="overflow-x-auto">
        <view class="flex" style="min-width: 511px; height: 44px">
          <app-th-item style="width: 16%; min-width: 75px" class="ex-item-left" title="部门名称" />
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
            @click="handleSortClick(1)"
            sortShow
          />
          <app-th-item
            class="ml-2"
            style="width: 17%; min-width: 78px"
            :title="typeValue === 1 ? '完成率' : '覆盖率'"
            :sort="searchParams.ratenum"
            @click="handleSortClick(2)"
            sortShow
          />
        </view>
        <view v-if="paginationLoading || list.length" style="min-width: 527px">
          <project-ex-item
            v-for="(item, idx) in list"
            :key="idx"
            :data="item"
            :gray="idx % 2 === 0"
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
    <app-fix-btn text="点击查看项目品种政策" :fontSize="12" bold @click="toPolicy" />
  </view>
</template>

<style lang="scss" scoped>
.ex-item-left {
  position: sticky;
  left: 0;
  padding-left: 16px;
  background: #fff;
}
</style>
