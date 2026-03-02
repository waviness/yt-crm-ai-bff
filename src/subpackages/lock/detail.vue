<template>
  <view class="pb-32">
    <app-watermark> </app-watermark>
    <lockDetail :detail-obj="detailObj" :role="role"></lockDetail>
    <shortageTicket
      v-if="
        detailObj.conType === 0 ||
        detailObj.conType === 4 ||
        detailObj.conType === 7 ||
        detailObj.conType === 8
      "
      :detail-obj="detailObj"
      :querySelfNumber="querySelfNumber"
      :managementOpflagForSaler="managementOpflagForSaler"
      :managementOpflagForPurchaser="managementOpflagForPurchaser"
      :role="role"
      @submitSuccess="submitSuccess"
    />
    <priceLimitSale
      v-if="detailObj.conType === 2 || detailObj.conType === 3 || detailObj.conType === 5"
      :detail-obj="detailObj"
      :querySelfNumber="querySelfNumber"
      :managementOpflagForSaler="managementOpflagForSaler"
      :managementOpflagForPurchaser="managementOpflagForPurchaser"
      :role="role"
      @submitSuccess="submitSuccess"
    />
    <restricted
      :managementOpflagForSaler="managementOpflagForSaler"
      :managementOpflagForPurchaser="managementOpflagForPurchaser"
      v-if="detailObj.conType === 6"
      :querySelfNumber="querySelfNumber"
      :detailObj="detailObj"
      :role="role"
      @submitSuccess="submitSuccess"
    ></restricted>
    <statusNear
      :detail-obj="detailObj"
      :role="role"
      v-if="detailObj.conType === 7 || detailObj.conType === 8"
      :querySelfNumber="querySelfNumber"
      :managementOpflagForSaler="managementOpflagForSaler"
      :managementOpflagForPurchaser="managementOpflagForPurchaser"
      @submitSuccess="submitSuccess"
    ></statusNear>
    <view class="pb-6"></view>
  </view>
</template>

<script lang="ts" setup>
import lockDetail from './components/business/lock-detail.vue';
import shortageTicket from './components/business/shortage-ticket.vue';
import priceLimitSale from './components/business/price-limit-sale.vue';
import restricted from './components/business/restricted.vue';
import statusNear from './components/business/status-near.vue';
import { useLockDetail } from './composables/use-lock-detail';

const {
  detailObj,
  managementOpflagForSaler,
  managementOpflagForPurchaser,
  querySelfNumber,
  submitSuccess,
  initPermissions,
  fetchDetail,
} = useLockDetail();
const role = ref<1 | 2>(1); // 默认角色为业务员

onLoad((option: any) => {
  role.value = +option.role as 1 | 2;
  fetchDetail(option.taskId);
  initPermissions();
});
</script>

<style lang="scss" scoped></style>
