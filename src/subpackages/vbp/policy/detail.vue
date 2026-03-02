<!-- VBP - 政策详情 -->
<script setup lang="ts">
import { useVbpPolicy } from './composables/use-vbp-policy';
import VbpItem from './components/vbp-item.vue';
import PolicyItem from './components/policy-item.vue';
import {
  QUANTITY_POLICY_OPTIONS,
  VBP_POLICY_OPTIONS,
  VBP_DECISION_DEPT_OPTIONS,
  MANAGEMENT_TYPE_OPTIONS,
  ADJUSTMENT_CYCLE_OPTIONS,
} from '../constants';
import type { OptionItem } from '@/types/common';

// 类型定义
interface PolicyDetail {
  goodsQuantity?: number;
  vbpPolicy?: number;
  department?: number;
  adjustCycle?: number;
  manageType?: number;
}

// Composables
const { getPolicyDetail, submitPolicy, mapPolicyOptions } = useVbpPolicy();

// 表单验证
const validateSelect = (value: any, message: string) => {
  if (!value?.name) {
    showToast(message);
    return false;
  }
  return true;
};

const appStore = useAppStore();

// 状态管理
const loading = ref(false);
const statusType = ref(0); // 0未处理 1已处理
const recordId = ref(0); // recordId

// 响应式数据
const detailObj = ref<PolicyDetail>({});
const quantityObj = ref<OptionItem | undefined>(undefined);
const vbpObj = ref<OptionItem | undefined>(undefined);
const deptObj = ref<OptionItem | undefined>(undefined);
const cycleObj = ref<OptionItem | undefined>(undefined);
const manageObj = ref<OptionItem | undefined>(undefined);

// 方法定义
const getDetail = async () => {
  const res = await getPolicyDetail(recordId.value);
  detailObj.value = res;

  // 根据状态设置数据
  const options = mapPolicyOptions(res, statusType.value);
  quantityObj.value = options.quantityObj;
  vbpObj.value = options.vbpObj;
  deptObj.value = options.deptObj;
  cycleObj.value = options.cycleObj;
  manageObj.value = options.manageObj;
};

const goBack = () => {
  uni.navigateBack();
};

const submit = async () => {
  if (!validateSelect(quantityObj.value, '请选择报量政策')) return;
  if (!validateSelect(vbpObj.value, '请选择VBP政策')) return;
  if (!validateSelect(deptObj.value, '请选择VBP决策部门')) return;
  if (!validateSelect(cycleObj.value, '请选择调整周期')) return;
  if (!validateSelect(manageObj.value, '请选择管理类型')) return;

  const params = {
    recordId: recordId.value,
    goodsQuantity: quantityObj.value!.id,
    vbpPolicy: vbpObj.value!.id,
    department: deptObj.value!.id,
    adjustCycle: cycleObj.value!.id,
    manageType: manageObj.value!.id,
  };

  await submitPolicy(params);
  appStore.setHadDoneOnDetail(true);
  goBack();
};

onLoad((opts: any) => {
  statusType.value = +(opts.statusType || 0);
  recordId.value = +(opts.id || 0);
  getDetail();
});
</script>

<template>
  <view class="pb-100">
    <app-watermark> </app-watermark>
    <vbp-item :active="statusType" :data="detailObj" />
    <view class="">
      <policy-item
        description="中选品种报量政策 (按历史用量)"
        placeholder="点击选择报量政策"
        v-model:selectValue="quantityObj"
        :editable="!statusType"
        :actions="QUANTITY_POLICY_OPTIONS"
      />
      <policy-item
        description="VBP政策"
        placeholder="点击选择VBP政策"
        v-model:selectValue="vbpObj"
        :editable="!statusType"
        :actions="VBP_POLICY_OPTIONS"
      />
      <policy-item
        description="VBP用量控制关键决策部门"
        placeholder="点击选择VBP决策部门"
        v-model:selectValue="deptObj"
        :editable="!statusType"
        :actions="VBP_DECISION_DEPT_OPTIONS"
      />
      <policy-item
        description="对停限控的调整周期"
        placeholder="点击选择调整周期"
        v-model:selectValue="cycleObj"
        :editable="!statusType"
        :actions="ADJUSTMENT_CYCLE_OPTIONS"
      />
      <policy-item
        description="对停限控的管理类型"
        placeholder="点击选择管理类型"
        v-model:selectValue="manageObj"
        :editable="!statusType"
        :actions="MANAGEMENT_TYPE_OPTIONS"
      />
    </view>
    <view v-if="!statusType" class="mt-14 flex justify-between mx-4">
      <up-button class="flex-1" shape="circle" @click="goBack">取消</up-button>
      <up-button shape="circle" type="primary" class="ml-3 flex-1" @click="submit">提交</up-button>
    </view>
  </view>
</template>
