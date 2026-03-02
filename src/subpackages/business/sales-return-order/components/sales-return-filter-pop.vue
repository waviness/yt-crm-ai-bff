<script setup lang="ts">
import type { SalesReturnFilterData } from '../types';

interface Props {
  formData: SalesReturnFilterData;
}

interface Emits {
  (e: 'confirm', data: SalesReturnFilterData): void;
  (e: 'reset'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 筛选弹窗显示状态
const filterShow = ref(false);

// 筛选值
const filterVal = ref<SalesReturnFilterData>({
  ...props.formData,
});

// 日历组件引用
const calendarRef = ref();

// 日期选择确认
const calendarConfirm = (val: any) => {
  if (!val) return;
  filterVal.value.confirmTime = val;
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
    confirmTime: '',
    contactKeyword: '',
    customerKeyword: '',
  };
  filterShow.value = false;
  emit('reset');
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
        <app-form-item label="客户ID/客户名称" class="mt-1">
          <up-input
            v-model="filterVal.customerKeyword"
            clearable
            placeholder="客户ID|客户名称"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          />
        </app-form-item>

        <app-form-item label="分支机构ID/名称">
          <up-input
            v-model="filterVal.contactKeyword"
            clearable
            placeholder="分支机构ID|名称"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          />
        </app-form-item>

        <app-form-item label="收货日期" :borderBottom="false">
          <view
            :class="`w-full text-right ${filterVal.confirmTime ? '' : 'color-gray-6'}`"
            @click="calendarRef.open()"
          >
            {{ filterVal.confirmTime || '点击选择收货日期' }}
          </view>
        </app-form-item>
      </up-form>
    </app-filter-pop>

    <app-calendar ref="calendarRef" mode="single" @confirm="calendarConfirm" />
  </view>
</template>
