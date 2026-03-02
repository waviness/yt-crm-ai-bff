<template>
  <view class="pa-2">
    <salesDepartGlobalBrand @brandClick="brandClick" :entryObj="entryObj" />
    <salesDepartGlobalCustomTrend :entryObj="entryObj" />
    <salesDepartGlobalInnvoation :entryObj="entryObj" />
    <salesDepartGlobalJicai :entryObj="entryObj" />
    <balanceGross />
  </view>
</template>

<script lang="ts" setup>
import salesDepartGlobalBrand from './business/sales-depart-global-brand.vue';
import salesDepartGlobalCustomTrend from './business/sales-depart-global-custom-trend.vue';
import salesDepartGlobalJicai from './business/sales-depart-global-jicai.vue';
import salesDepartGlobalInnvoation from './business/sales-depart-global-innvoation.vue';
import balanceGross from './business/balance-gross.vue';
import type { EntryObj } from '../types';
interface IProps {
  entryObj: EntryObj; // 入口对象
}
const props = defineProps<IProps>();
const brandClick = () => {
  router.push(
    '/subpackages/dashboard/brand-collection-page?deptId=' +
      props.entryObj.deptId +
      '&deptName=' +
      props.entryObj.deptName +
      '&deptLevel=' +
      props.entryObj.deptLevel
  );
};
</script>

<style lang="scss" scoped></style>
