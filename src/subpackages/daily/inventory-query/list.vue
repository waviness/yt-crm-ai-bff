<template>
  <view>
    <view class="pa-2">库存列表</view>
    <view class="ma-2 pb-100">
      <inventory-query-list-list
        v-for="item in detailDataList"
        @toDetail="toDetail(item)"
        :key="item.goodsId"
        :item="item"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { InventoryQueryDetailItem } from './types';
import inventoryQueryListList from './components/inventory-query-list-list.vue';
const detailDataList = ref<InventoryQueryDetailItem[]>([]);
const appStore = useAppStore();
const toDetail = (item: InventoryQueryDetailItem) => {
  appStore.setDetailObj(item);
  uni.navigateTo({
    url: '/subpackages/daily/inventory-query/detail',
  });
};
onLoad(options => {
  const { entryId, goodsId, prodArea } = options || {};
  InventoryQueryService.inventoryByLot({
    entryId: entryId,
    goodsId: goodsId,
  }).then(res => {
    if (res.code !== '200') {
      return;
    }
    detailDataList.value = res.data.map((item: InventoryQueryDetailItem) => ({
      ...item,
      prodArea: prodArea || '主档信息暂未维护',
    }));
  });
});
</script>

<style lang="scss" scoped></style>
