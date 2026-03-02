<script setup lang="ts">
import type { OrderFilterParams } from '../../types';
interface Props {
  formData: OrderFilterParams;
  orderTypeFlag: boolean;
}

interface Emits {
  (e: 'confirm', data: OrderFilterParams): void;
}
const props = defineProps<Props>();
const emit = defineEmits<Emits>();
// 筛选弹窗显示状态
const filterShow = ref(false);
// 筛选值
const filterVal = ref<OrderFilterParams>({
  ...props.formData,
});

// 定义类型安全的值检查函数
const isFilled = (value: string | undefined | null | string[]): value is string => {
  return (
    value !== undefined &&
    value !== null &&
    value !== '' &&
    (Array.isArray(value) ? value.length > 0 : true)
  );
};

// 是否有筛选条件
const filterSome = computed(() => {
  return Object.values(filterVal.value).some(value =>
    isFilled(value as string | undefined | null | string[])
  );
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
// 重置筛选条件
const reset = () => {
  filterVal.value = {
    ...props.formData,
  };
  emit('confirm', filterVal.value);
};
let orderTypeShow = ref(false);
const orderTypeOptions = [
  {
    name: '二销订单',
    id: '14',
  },
  {
    name: '报货单',
    id: '6',
  },
];
// 选择订单类型
const handleSelectOrderType = (val: { name: string; id: string }) => {
  filterVal.value.orderType = val.id;
  orderTypeShow.value = false;
};
// 确认筛选
const onConfirm = () => {
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
        <app-form-item label="客户ID">
          <up-input
            v-model="filterVal.customId"
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
        <app-form-item label="总单ID">
          <up-input
            v-model="filterVal.codDocId"
            clearable
            placeholder="请输入总单ID"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          >
          </up-input>
        </app-form-item>
        <app-form-item label="类型切换" v-if="orderTypeFlag">
          <!-- @click="statusClick" -->
          <view
            @click="orderTypeShow = true"
            :class="`w-full text-right ${filterVal.orderType ? '' : 'color-gray-6'}`"
          >
            {{
              +filterVal.orderType === 14
                ? '二销订单'
                : +filterVal.orderType === 6
                  ? '报货单'
                  : '点击选择类型'
            }}
          </view>
        </app-form-item>
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
      </up-form>
      <app-calendar ref="calendarRef" :endDate="maxDate" mode="range" @confirm="calendarConfirm" />
    </app-filter-pop>
    <app-action-sheet
      v-model:show="orderTypeShow"
      :actions="orderTypeOptions"
      description="过期状态选择"
      @select="handleSelectOrderType"
    />
  </view>
</template>
<style scoped lang="scss">
.active {
  color: #2271f5;
  background: rgba(#2271f5, 0.1);
}
</style>
