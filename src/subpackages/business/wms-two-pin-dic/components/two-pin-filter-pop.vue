<script setup lang="ts">
import type { TwoPinFilterData } from '../types';

interface Props {
  formData: TwoPinFilterData;
}

interface Emits {
  (e: 'confirm', data: TwoPinFilterData): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 筛选弹窗显示状态
const filterShow = ref(false);

// 筛选值
const filterVal = ref<TwoPinFilterData>({
  ...props.formData,
});

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
    goodsNameOrId: '',
    entryId: '',
    entryName: '',
  };
  filterShow.value = false;
  emit('confirm', filterVal.value);
};

// 确认筛选
const onConfirm = () => {
  filterShow.value = false;
  emit('confirm', filterVal.value);
};
</script>

<template>
  <view>
    <app-filter-pop
      v-model:filterShow="filterShow"
      :filterSome="filterSome"
      @confirm="onConfirm"
      @reset="reset"
    >
      <up-form>
        <app-form-item label="货品ID|名称" class="mt-1">
          <up-input
            v-model="filterVal.goodsNameOrId"
            clearable
            placeholder="请输入货品ID|名称"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          >
          </up-input>
        </app-form-item>
        <app-form-item label="核算单元ID">
          <up-input
            v-model="filterVal.entryId"
            clearable
            placeholder="请输入核算单元ID"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          >
          </up-input>
        </app-form-item>
        <app-form-item label="核算单元名称" :borderBottom="false">
          <up-input
            v-model="filterVal.entryName"
            clearable
            placeholder="请输入核算单元名称"
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
