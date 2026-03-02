<script setup lang="ts">
import type { FundingFormData } from '../types';

interface IProps {
  data: FundingFormData;
  lastModify?: boolean;
  useOld?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  lastModify: false,
  useOld: false,
});

// 计算合计金额
const totalAmount = computed(() => {
  const { data, useOld } = props;
  if (useOld) {
    return calculateTotal(data.oldDhAmount || 0, data.oldChAmount || 0);
  }
  return calculateTotal(data.dhAmount, data.chAmount);
});
</script>

<template>
  <view>
    <view class="color-gray-4 mx-4 my-2">
      {{ data.creTime }}<span v-if="lastModify">(最近一次修改)</span>
    </view>
    <view>
      <app-cell title="部门" :value="data.deptName" value-class="color-black-2" border />
      <app-cell
        title="电汇(万元)"
        :value="useOld ? data.oldDhAmount : data.dhAmount"
        value-class="color-black-2"
        border
      />
      <app-cell
        title="承兑(万元)"
        :value="useOld ? data.oldChAmount : data.chAmount"
        value-class="color-black-2"
        border
      />
      <app-cell title="合计" :value="totalAmount" value-class="color-black-2" />
    </view>
  </view>
</template>
