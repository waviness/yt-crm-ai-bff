<template>
  <view>
    <app-watermark> </app-watermark>
    <salesHeader
      @update:dateTime="dateChangeInit"
      @update:search="searchChange"
      :searchShowFlag="true"
      :deptNameShowFlag="true"
      :entryObj="entryObj"
    />
    <up-action-sheet
      :actions="orderList"
      @close="orderTypeFlag = false"
      @select="orderSelectChange"
      :cancelText="'取消'"
      :show="orderTypeFlag"
    ></up-action-sheet>
    <app-pull-refresh
      :refreshing="refreshing"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <view class="px-10 pt-10">
        <brandCard
          v-for="(item, index) in list"
          @isExpClick="isExpClick(item, index)"
          @toDetail="toDetail(item)"
          :index="index"
          :cardItem="item"
        ></brandCard>
        <app-empty v-show="!refreshing && !list.length" class="py-7" description="暂无数据" />
      </view>
    </app-pull-refresh>
    <!-- 高级操作 -->
    <app-fix-btn @click="orderTypeFlag = true" text="排序方式" />
  </view>
</template>

<script setup lang="ts">
import type { EntryObj } from './types';
import salesHeader from './components/base/header.vue';
import brandCard from './components/base/brand-card.vue';
import { useBrandCollectionPage } from './composables/use-brand-collection-page';
const entryObj = ref<EntryObj>({
  deptId: '',
  deptName: '',
  titleName: '',
  deptLevel: '',
});
const {
  orderList,
  orderTypeFlag,
  orderSelect,
  dateChange,
  orderListInit,
  fetchGetStatListByDept,
  _getAllListByBrand,
} = useBrandCollectionPage(entryObj.value);

const orderSelectChange = ({ value }: { value: string }) => {
  orderSelect({ value });
  onRefresh();
};
const searchWord = ref('');
const searchChange = (value: string) => {
  searchWord.value = value;
  onRefresh();
};
// 使用分页组合式API
const pagination = usePagination(
  {
    pageSize: 8,
    initialPage: 1,
    toolBarHeight: 138,
  },
  pagePrams => {
    return fetchGetStatListByDept(pagePrams, searchWord.value);
  }
);
const {
  list,
  refreshing,
  loadmoreConfig,
  pullRefreshHeight,
  onRefresh,
  onLoadMore,
  calcPullRefreshHeight,
  changeRowValue,
} = pagination;
const isExpClick = async (item: any, index: number) => {
  changeRowValue(index, 'isExp', !item.isExp);
  if (item.top3GoodsStatList && item.top3GoodsStatList.length) return;
  await _getAllListByBrand(item).then((list: any) => {
    changeRowValue(index, 'top3GoodsStatList', list);
  });
};
const toDetail = (item: any) => {
  router.push(
    '/subpackages/dashboard/brand-collection-page-detail?deptId=' +
      entryObj.value.deptId +
      '&deptName=' +
      entryObj.value.deptName +
      '&brandName=' +
      item.brandName +
      '&brandId=' +
      item.brandId +
      '&key=1'
  );
};
const dateChangeInit = (date: any) => {
  dateChange(date);
  lastDateTime.value = dashboardStore.dateTime; // 更新记录
  orderListInit();
  onRefresh();
};
const dashboardStore = useDashboardStore();
const lastDateTime = ref(''); // 初始化为空字符串
// 监听日期变化时刷新数据
watch(
  () => dashboardStore.dateTime,
  newDateTime => {
    if (newDateTime !== lastDateTime.value) {
      initData();
    }
  }
);
const initData = async () => {
  lastDateTime.value = dashboardStore.dateTime; // 更新记录
  orderListInit();
  await calcPullRefreshHeight();
  onRefresh();
};
// 页面加载
onLoad(options => {
  const decodedOpts = options ? decodeObjectValues(options) : {};
  if (decodedOpts) {
    entryObj.value.deptLevel = decodedOpts.deptLevel;
    entryObj.value.deptId = decodedOpts.deptId;
    entryObj.value.deptName = decodedOpts.deptName;
    entryObj.value.titleName = '品牌集合';
    initData();
  }
});
</script>

<style lang="sass" scoped></style>
