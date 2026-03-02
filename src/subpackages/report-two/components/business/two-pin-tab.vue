<template>
  <view>
    <view class="pa-2 bg-white">
      <up-search
        @search="onSearch"
        @clear="onSearch"
        v-model="searchValue"
        shape="round"
      ></up-search>
      <app-tab-btn
        class="mx-2 mt-2"
        :fixed="false"
        :box-shadow="false"
        :border="true"
        width="100%"
        @update:modelValue="salesTabChange"
        :modelValue="salesTabValue"
        :options="[
          { label: '全部', value: '' },
          { label: '近效期', value: '2' },
          { label: '待处理', value: '3' },
        ]"
      ></app-tab-btn>
    </view>
    <view>
      <app-pull-refresh
        :refreshing="refreshing"
        :loadmoreProps="loadmoreConfig"
        :pullRefreshHeight="pullRefreshHeight"
        @refresh="onRefresh"
        @loadmore="onLoadMore"
      >
        <view class="pa-2">
          <two-pin-list
            :isAsCustom="true"
            @click="toDetail(item)"
            v-for="item in list"
            :item="item"
          />
        </view>
      </app-pull-refresh>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useReportTwoStore } from '@/store/report-two';
const reportTwoStore = useReportTwoStore();
import type { Entry } from '../../types/index';
interface Props {
  entryChoose: Entry;
}

const props = defineProps<Props>();

import twoPinList from '../base/two-pin-list.vue';
const searchValue = ref('');
const onSearch = () => {
  onRefresh();
};
const salesTabValue = ref('');
const salesTabChange = (val: string) => {
  salesTabValue.value = val;
  onRefresh();
};
const fetchData = async (params: { pageNum: number; pageSize: number }) => {
  const data = await TwoPinService.getGoodsResell({
    ...params,
    dirType: salesTabValue.value,
    entryId: props.entryChoose.entryid,
    goodsNameOrId: searchValue.value,
  });
  console.log(data);
  return {
    list: (data as any)?.list || [],
    hasNextPage: (data as any)?.hasNextPage || false,
    total: (data as any)?.total || 0,
  };
};
const {
  list,
  refreshing,
  loadmoreConfig,
  pullRefreshHeight,
  onRefresh,
  onLoadMore,
  calcPullRefreshHeight,
} = usePagination(
  {
    pageSize: 10,
    initialPage: 1,
    toolBarHeight: 140,
  },
  fetchData
);
const toDetail = (item: any) => {
  reportTwoStore.setGoodsDetail(item);
  uni.navigateTo({
    url: `/subpackages/report-two/two-pin/goods-detail?type=1`,
  });
};
onMounted(() => {
  calcPullRefreshHeight();
  onRefresh();
});
</script>

<style lang="scss" scoped></style>
