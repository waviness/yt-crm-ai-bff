<script setup lang="ts">
import type { RefundApproveFilterData } from '../types';

interface Props {
  formData: RefundApproveFilterData;
  filterShow: boolean;
}

interface Emits {
  (e: 'confirm', data: RefundApproveFilterData): void;
  (e: 'update:filterShow', val: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const show = computed({
  get: () => props.filterShow,
  set: val => emit('update:filterShow', val),
});

// 筛选值
const filterVal = ref<RefundApproveFilterData>({
  ...props.formData,
});

watch(
  () => props.formData,
  val => {
    filterVal.value = { ...val };
  }
);

// 定义类型安全的值检查函数
const isFilled = (value: string | undefined | null): value is string => {
  return value !== undefined && value !== null && value !== '';
};

// 是否有筛选条件
const filterSome = computed(() => {
  return Object.values(filterVal.value).some(isFilled);
});

// 重置筛选条件
const reset = () => {
  filterVal.value = {
    goodsKeyword: '',
    customerKeyword: '',
  };
  show.value = false;
  emit('confirm', filterVal.value);
};

// 确认筛选
const onConfirm = () => {
  show.value = false;
  emit('confirm', filterVal.value);
};
</script>

<template>
  <view>
    <app-filter-pop
      v-model:filterShow="show"
      :filterSome="filterSome"
      @confirm="onConfirm"
      @reset="reset"
    >
      <up-form>
        <app-form-item label="货品信息" class="mt-1">
          <up-input
            v-model="filterVal.goodsKeyword"
            clearable
            placeholder="请输入货品名称丨ID"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          >
          </up-input>
        </app-form-item>
        <app-form-item label="客户信息" :borderBottom="false">
          <up-input
            v-model="filterVal.customerKeyword"
            clearable
            placeholder="请输入客户名称丨ID"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          >
          </up-input>
        </app-form-item>
      </up-form>
    </app-filter-pop>
  </view>
</template>
