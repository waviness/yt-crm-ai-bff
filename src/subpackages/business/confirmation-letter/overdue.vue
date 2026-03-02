<template>
  <view>
    <app-watermark> </app-watermark>
    <view class="pa-2 text-14"> 超期未处理信息列表 </view>
    <app-pull-refresh
      :refreshing="refreshing"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <view class="pa-2">
        <confirm-list
          @changeStatus="
            (val: { confirmadocid: string; statue: number; index: number }) =>
              changeStatus({ ...val, index: index })
          "
          class="block mb-2"
          v-for="(item, index) in list"
          :key="index"
          :item="item"
        />
        <app-empty v-show="!list.length && !refreshing" class="py-7" description="暂无数据" />
      </view>
    </app-pull-refresh>
  </view>
</template>

<script lang="ts" setup>
import confirmList from './components/confirm-list.vue';
import type { UpConfirmationLetterParams } from './types';

// 使用分页组合式API
const pagination = usePagination(
  {
    pageSize: 8,
    initialPage: 1,
  },
  async params => {
    const response = await ConfirmationLetterService.exceedTimeLimitTask({
      pageNum: params.pageNum,
      pageSize: params.pageSize,
    });
    const list = response.data.list || [];
    return {
      list: list,
      hasNextPage: response.data.hasNextPage,
      total: response.data.total,
    };
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
  removeRow,
} = pagination;
const changeStatus = async (params: UpConfirmationLetterParams) => {
  const response = await ConfirmationLetterService.updateConfirmationRequestStatue(params);
  if (response.code === '200') {
    showSuccess(response.msg);
    removeRow(params.index);
  }
};
onMounted(async () => {
  await calcPullRefreshHeight();
  onRefresh();
});
</script>

<style scoped></style>
