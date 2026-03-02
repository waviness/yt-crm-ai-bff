<script setup lang="ts">
import type { AbnormalFilterData } from '../types';
interface Props {
  formData: AbnormalFilterData;
}

interface Emits {
  (e: 'confirm', data: AbnormalFilterData): void;
}
const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 筛选弹窗显示状态
const filterShow = ref(false);

// 筛选值
const filterVal = ref<AbnormalFilterData>({
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
  return Object.values(filterVal.value).some(isFilled);
});

// 重置筛选条件
const reset = () => {
  filterVal.value = {
    startTime: '',
    endTime: '',
    customerId: '',
    customName: '',
    entryId: '',
    entryName: '',
    contactId: '',
    contactName: '',
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
        <app-form-item label="客户名称">
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
        <app-form-item label="核算单元名称">
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
        <app-form-item label="分支机构ID">
          <up-input
            v-model="filterVal.contactId"
            clearable
            placeholder="请输入分支机构ID"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          >
          </up-input>
        </app-form-item>
        <app-form-item label="分支机构名称" :borderBottom="false">
          <up-input
            v-model="filterVal.contactName"
            clearable
            placeholder="请输入分支机构名称"
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
