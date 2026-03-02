<script setup lang="ts">
import type { FilterData } from '../types';
interface Props {
  formData: FilterData;
}

interface Emits {
  (e: 'confirm', data: FilterData): void;
}
const props = defineProps<Props>();
const emit = defineEmits<Emits>();
// 筛选弹窗显示状态
const filterShow = ref(false);

// 筛选值
const filterVal = ref<FilterData>({
  ...props.formData,
});
// 日期相关
const calendarRef = ref();
const maxDate = ref(time.format(time.add(new Date(), 0, 'year'), time.FORMATS.ISO_DATE));

// 日期范围选择
const calendarConfirm = (val: { range: { before: string; after: string } }) => {
  if (!val?.range?.before || !val?.range?.after) return;
  filterVal.value.startTime = val.range.before;
  filterVal.value.endTime = val.range.after;
};

// 定义类型安全的值检查函数
const isFilled = (value: string | undefined | null): value is string => {
  return value !== undefined && value !== null && value !== '';
};
// 是否有筛选条件
const filterSome = computed(() => {
  return Object.values(filterVal.value).every(isFilled);
});

// 重置筛选条件
const reset = () => {
  filterVal.value = {
    startTime: '',
    endTime: '',
    confirmadocid: '',
    customerId: '',
    customName: '',
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
            :class="`w-full text-right ${filterVal.startTime ? '' : 'color-gray-6'}`"
            @click="calendarRef.open()"
          >
            {{
              filterVal.startTime
                ? `${filterVal.startTime}至${filterVal.endTime}`
                : '点击选择时间范围'
            }}
          </view>
        </app-form-item>
        <app-form-item label="总单编号">
          <up-input
            v-model="filterVal.confirmadocid"
            clearable
            placeholder="请输入总单编号"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          >
          </up-input>
        </app-form-item>
        <app-form-item label="客户ID">
          <up-input
            v-model="filterVal.customerId"
            clearable
            placeholder="请输入客户ID"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          >
          </up-input>
        </app-form-item>
        <app-form-item label="客户名称" :borderBottom="false">
          <up-input
            v-model="filterVal.customName"
            clearable
            placeholder="请输入客户名称"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          >
          </up-input>
        </app-form-item>
      </up-form>
    </app-filter-pop>
    <app-calendar ref="calendarRef" :endDate="maxDate" mode="range" @confirm="calendarConfirm" />
  </view>
</template>
