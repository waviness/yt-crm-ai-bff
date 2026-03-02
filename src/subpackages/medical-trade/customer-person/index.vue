<template>
  <view>
    <app-watermark />
    <up-sticky style="top: 0">
      <customer-person-filter-pop
        v-model:filterShow="filterShow"
        :filterActive="filterActive"
        :formData="formData"
        :relOptions="relOptions"
        :customTypeList="customTypeList"
        @confirm="onFilterConfirm"
        @reset="onFilterReset"
      />
    </up-sticky>
    <app-pull-refresh
      :refreshing="refreshing"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <view class="pa-2">
        <customer-person-list
          v-for="(item, index) in list"
          :key="item.szymCustomerId"
          :item="item"
          @click="toDetail(item, index)"
        />
      </view>
    </app-pull-refresh>
  </view>
</template>

<script lang="ts" setup>
import customerPersonFilterPop from './components/customer-person-filter-pop.vue';
import customerPersonList from './components/customer-person-list.vue';
import { useCustomerPerson } from './composables/use-customer-person';
import type { CustomerPersonFilterData, CustomerPersonItem } from './types';

const appStore = useAppStore();

const {
  filterShow,
  filterActive,
  rowIndex,
  relOptions,
  customTypeList,
  formData,
  list,
  refreshing,
  loadmoreConfig,
  pullRefreshHeight,
  onRefresh,
  onLoadMore,
  calcPullRefreshHeight,
  removeRow,
  permissInit,
  initDictData,
} = useCustomerPerson();

// 筛选确认
const onFilterConfirm = (data: CustomerPersonFilterData) => {
  formData.value = data;
  filterShow.value = false;
  onRefresh();
};

// 重置筛选
const onFilterReset = () => {
  formData.value = {
    custom: '',
    sourceType: '',
    customerType: '',
    relStatus: '',
  };
  filterShow.value = false;
  onRefresh();
};

// 跳转详情
const toDetail = (item: CustomerPersonItem, index: number) => {
  rowIndex.value = index;
  appStore.setDetailObj(item);
  appStore.setHadDoneOnDetail(false);
  router.push('/subpackages/medical-trade/customer-person/detail');
};

onShow(() => {
  // 从详情页返回时，如果有操作，刷新列表
  if (rowIndex.value !== -1 && appStore.hadDoneOnDetail) {
    onRefresh();
    rowIndex.value = -1;
    appStore.setHadDoneOnDetail(false);
  }
});

onMounted(async () => {
  permissInit();
  await initDictData();
  calcPullRefreshHeight();
  onRefresh();
});
</script>

<style lang="scss" scoped></style>
