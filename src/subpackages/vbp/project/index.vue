<!-- VBP - 销售人员选择 -->
<script setup lang="ts">
import type { SalesItem } from '@/types/common';

const appStore = useAppStore();

const list = ref<SalesItem[]>([]);
const loading = ref(false);
const handleRefresh = async () => {
  list.value = [];
  loading.value = true;
  const res = await VbpService.queryPm4Sales({});
  list.value = res || [];
  loading.value = false;
  console.log('handleRefresh', list.value);
};

const toCustomerList = (item: SalesItem) => {
  appStore.setSalerInfo(item);
  router.push(RouteMap.vbpProjectCustomer);
};

onLoad(() => {
  handleRefresh();
});
</script>

<template>
  <view class="pb-100">
    <app-watermark> </app-watermark>
    <up-cell
      v-for="(item, idx) in list"
      :key="idx"
      class="block bg-white mt-2"
      :title="`${item.userId}/${item.userName}（${item.entryId}/${item.entryName}）`"
      is-link
      @click="toCustomerList(item)"
    />
    <app-empty v-if="!loading && !list.length" class="py-7" description="暂无数据" />
  </view>
</template>
