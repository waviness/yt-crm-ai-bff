<script setup lang="ts">
import type { FinalKnotFilterData } from '../types';

interface Props {
  formData: FinalKnotFilterData;
}

interface Emits {
  (e: 'confirm', data: FinalKnotFilterData): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 筛选弹窗显示状态
const filterShow = ref(false);

// 筛选值
const filterVal = ref<FinalKnotFilterData>({
  ...props.formData,
});

// 日期相关
const calendarRef = ref();

// 日期范围选择
const calendarConfirm = (val: { range: { before: string; after: string } }) => {
  if (!val?.range?.before || !val?.range?.after) return;
  filterVal.value.startTime = val.range.before;
  filterVal.value.endTime = val.range.after;
  filterVal.value.time = `${val.range.before}至${val.range.after}`;
};

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
    time: '',
    goodsId: '',
    goodsName: '',
    supplyId: '',
    supplyName: '',
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
        <app-form-item label="时间范围" class="mt-1">
          <view
            :class="`w-full text-right ${filterVal.time ? '' : 'color-gray-6'}`"
            @click="calendarRef.open()"
          >
            {{ filterVal.time || '点击选择日期' }}
          </view>
        </app-form-item>
        <app-form-item label="货品ID">
          <up-input
            v-model="filterVal.goodsId"
            clearable
            placeholder="请输入货品ID"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          >
          </up-input>
        </app-form-item>
        <app-form-item label="货品名称">
          <up-input
            v-model="filterVal.goodsName"
            clearable
            placeholder="请输入货品名称"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          >
          </up-input>
        </app-form-item>
        <app-form-item label="供应商ID">
          <up-input
            v-model="filterVal.supplyId"
            clearable
            placeholder="请输入供应商ID"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          >
          </up-input>
        </app-form-item>
        <app-form-item label="供应商名称" :borderBottom="false">
          <up-input
            v-model="filterVal.supplyName"
            clearable
            placeholder="请输入供应商名称"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          >
          </up-input>
        </app-form-item>
      </up-form>
    </app-filter-pop>
    <app-calendar ref="calendarRef" mode="range" @confirm="calendarConfirm" />
  </view>
</template>
