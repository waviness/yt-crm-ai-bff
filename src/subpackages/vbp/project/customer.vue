<!-- VBP - 客户查找 -->
<script setup lang="ts">
import type { CustomerItem } from '@/types/common';

const appStore = useAppStore();

const searchValue = ref('');
const placeholder = ref('搜索');
const list = ref<CustomerItem[]>([]);

const handleSearch = (value: string) => {
  searchValue.value = value;
  list.value = [];
  getDataList();
};

const getDataList = async () => {
  const res = await VbpService.querySupplierHospitalList({
    custom: searchValue.value,
    pm4Id: appStore.salerInfor.userId,
  });
  list.value = res || [];
};

const toProjectList = (item: CustomerItem) => {
  appStore.setDetailObj(item);
  router.push(RouteMap.vbpProjectList);
};

onMounted(() => {
  searchValue.value = '';
  handleSearch('');
});
</script>

<template>
  <view class="pb-100">
    <app-watermark> </app-watermark>
    <app-search v-model="searchValue" :placeholder="placeholder" @search="handleSearch" />
    <up-cell
      v-for="(item, idx) in list"
      :key="idx"
      class="block bg-white mt-2"
      :title="`${item.customId}/${item.customName}`"
      is-link
      @click="toProjectList(item)"
    />
    <app-empty v-if="!list.length" class="py-7" description="暂无数据" />
  </view>
</template>
