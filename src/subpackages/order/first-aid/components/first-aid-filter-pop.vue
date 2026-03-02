<script setup lang="ts">
import type { FirstAidOrderFilterData } from '../types';
interface Props {
  formData: FirstAidOrderFilterData;
}

interface Emits {
  (e: 'confirm', data: FirstAidOrderFilterData): void;
}
const props = defineProps<Props>();
const emit = defineEmits<Emits>();
// 筛选弹窗显示状态
const filterShow = ref(false);

// 筛选值
const filterVal = ref<FirstAidOrderFilterData>({
  ...props.formData,
});
// 日期相关
const calendarRef = ref();
const defaultDate = ref(time.format(new Date(), time.FORMATS.ISO_DATE));
const minDate = ref(time.format(time.add(new Date(), -5, 'year'), time.FORMATS.ISO_DATE));
const maxDate = ref(time.format(time.add(new Date(), 0, 'year'), time.FORMATS.ISO_DATE));

// 日期范围选择
const calendarConfirm = (val: { range: { before: string; after: string } }) => {
  if (!val?.range?.before || !val?.range?.after) return;
  filterVal.value.starttime = val.range.before;
  filterVal.value.endtime = val.range.after;
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
    starttime: '',
    endtime: '',
    goodsid: '',
    goodsname: '',
    customerid: '',
    customname: '',
  };
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
            :class="`w-full text-right ${filterVal.starttime ? '' : 'color-gray-6'}`"
            @click="calendarRef.open()"
          >
            {{
              filterVal.starttime
                ? `${filterVal.starttime}至${filterVal.endtime}`
                : '点击选择时间范围'
            }}
          </view>
        </app-form-item>
        <app-form-item label="货品ID">
          <up-input
            v-model="filterVal.goodsid"
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
            v-model="filterVal.goodsname"
            clearable
            placeholder="请输入货品名称"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          >
          </up-input>
        </app-form-item>
        <app-form-item label="客户ID">
          <up-input
            v-model="filterVal.customerid"
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
            v-model="filterVal.customname"
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
