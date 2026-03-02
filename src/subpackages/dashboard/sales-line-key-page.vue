<template>
  <view>
    <app-watermark> </app-watermark>
    <up-sticky style="background-color: white; top: 0">
      <keyPageFilterPop :entryObj="entryObj" @confirm="filterConfirm" />
      <view class="px-10 pb-2 font-bold text-14">
        <text class="pr-1">{{ entryObj.deptName }}</text>
        <text
          >销售额波动（ <text>{{ +entryObj.key === 1 ? '客户' : '品种' }} </text>维度）{{
            dashboardStore.dateTime
          }}
        </text>
      </view>
      <app-tabs :list="tabsList" :current="activeTab" @change="tabActiveChange" />
      <keyPageCard :totaLVal="totaLVal" :activeTab="activeTab" :itemType="+entryObj.key" />
      <view class="pb-2"></view>
    </up-sticky>

    <app-pull-refresh
      :refreshing="refreshing"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <keyPageItem
        :dataList="list"
        :itemType="+entryObj.key"
        :yearMounthValue="timeDimNumber"
        @toDetail="toDetail"
        :lineShow="true"
      />
      <app-empty v-show="!refreshing && !list.length" class="py-7" description="暂无数据" />
    </app-pull-refresh>
    <app-tab-btn
      textColor="info"
      @update:modelValue="timeDimChange"
      :modelValue="timeDimNumber"
      :options="[
        { label: '月', value: 0 },
        { label: '年', value: 1 },
      ]"
    />
  </view>
</template>

<script lang="ts" setup>
import keyPageFilterPop from './components/base/key-page-filter-pop.vue';
import keyPageItem from './components/base/key-page-item.vue';
import keyPageCard from './components/base/key-page-card-total.vue';
import type { EntryObj } from './types/key-page';
const dashboardStore = useDashboardStore();
const entryObj = ref<EntryObj>({
  key: '',
  deptId: '',
  deptName: '',
});
import { useSalesKeyPage } from './composables/use-sales-line-key-page';
const {
  tabsList,
  activeTab,
  loading,
  totaLVal,
  filterVal,
  timeDimNumber,
  updateFilterVal,
  fetchGetSalesStat,
  fetchGetdataList,
  onhandleActiveChange,
  toDetail,
} = useSalesKeyPage(entryObj);
// 使用分页组合式API
const pagination = usePagination(
  {
    pageSize: 10,
    initialPage: 1,
    toolBarHeight: 235,
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
const timeDimChange = (value: number) => {
  timeDimNumber.value = value;
  onRefresh();
};
const filterConfirm = (val: any) => {
  updateFilterVal(val);
  onRefresh();
};
const init = () => {
  calcPullRefreshHeight();
  fetchGetSalesStat();
  onRefresh();
};
onMounted(() => {
  init();
});
// 页面加载
onLoad(options => {
  const decodedOpts = options ? decodeObjectValues(options) : {};
  if (decodedOpts) {
    entryObj.value.deptId = decodedOpts.deptId;
    entryObj.value.deptName = decodedOpts.deptName;
    entryObj.value.key = decodedOpts.key;
  }
});
</script>

<style lang="scss" scoped></style>
