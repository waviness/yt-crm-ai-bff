<script setup lang="ts">
interface OrderApproveFilterData {
  startDate: string;
  endDate: string;
  customIdOrName: string;
  goodsIdOrName: string;
}

interface Props {
  formData: OrderApproveFilterData;
}

interface Emits {
  (e: 'confirm', data: OrderApproveFilterData): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 筛选弹窗显示状态
const filterShow = ref(false);

// 筛选值
const filterVal = ref<OrderApproveFilterData>({
  ...props.formData,
});

// 日期相关
const calendarRef = ref();
const maxDate = time.format(time.add(new Date(), 1, 'year'), time.FORMATS.ISO_DATE);

// 日期范围选择
const calendarConfirm = (val: { range: { before: string; after: string } }) => {
  if (!val?.range?.before || !val?.range?.after) return;
  filterVal.value.startDate = val.range.before;
  filterVal.value.endDate = val.range.after;
};

// 定义类型安全的值检查函数
const isFilled = (value: string | undefined | null): value is string => {
  return value !== undefined && value !== null && value !== '';
};

// 是否有筛选条件
const filterSome = computed(() => {
  return (
    isFilled(filterVal.value.customIdOrName) ||
    isFilled(filterVal.value.goodsIdOrName) ||
    isFilled(filterVal.value.startDate) ||
    isFilled(filterVal.value.endDate)
  );
});

// 重置筛选条件
const reset = () => {
  filterVal.value = {
    startDate: '',
    endDate: '',
    customIdOrName: '',
    goodsIdOrName: '',
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
            :class="`w-full text-right ${filterVal.startDate ? '' : 'color-gray-6'}`"
            @click="calendarRef.open()"
          >
            {{
              filterVal.startDate
                ? `${filterVal.startDate}至${filterVal.endDate}`
                : '点击选择时间范围'
            }}
          </view>
        </app-form-item>
        <app-form-item label="客户ID丨客户名称">
          <up-input
            v-model="filterVal.customIdOrName"
            clearable
            placeholder="请输入客户ID丨客户名称"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          >
          </up-input>
        </app-form-item>
        <app-form-item label="货品ID丨货品名称" :borderBottom="false">
          <up-input
            v-model="filterVal.goodsIdOrName"
            clearable
            placeholder="请输入货品ID丨货品名称"
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
