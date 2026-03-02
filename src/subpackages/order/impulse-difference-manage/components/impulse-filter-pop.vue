<script setup lang="ts">
/**
 * 筛选弹窗组件
 * 提供冲差总单的筛选条件设置
 */

import type { ImpulseFilterData } from '../types';

// 定义组件属性
interface Props {
  formData: ImpulseFilterData;
}

const props = defineProps<Props>();

// 定义事件
const emit = defineEmits<{
  confirm: [data: ImpulseFilterData];
}>();

// 响应式数据
const filterShow = ref(false);
const filterVal = ref<ImpulseFilterData>({ ...props.formData });

// 日期选择相关
const calendarRef = ref();

// 计算是否有筛选条件
const filterSome = computed(() => {
  if (
    !filterShow.value &&
    (filterVal.value.docId ||
      filterVal.value.dtlId ||
      filterVal.value.goods ||
      filterVal.value.customer ||
      filterVal.value.factory ||
      filterVal.value.start)
  ) {
    return true;
  }
  return false;
});

// 日期范围选择确认
const onDateConfirm = (val: any) => {
  if (val.range) {
    filterVal.value.start = val.range.before;
    filterVal.value.end = val.range.after;
  }
};

// 重置筛选条件
const resetFilter = () => {
  filterVal.value = {
    docId: '',
    dtlId: '',
    goods: '',
    customer: '',
    factory: '',
    start: '',
    end: '',
  };
};

// 确认筛选
const confirmFilter = () => {
  filterShow.value = false;
  emit('confirm', { ...filterVal.value });
};

// 监听formData变化
watch(
  () => props.formData,
  newVal => {
    filterVal.value = { ...newVal };
  },
  { immediate: true, deep: true }
);
</script>

<template>
  <view>
    <app-filter-pop
      v-model:filterShow="filterShow"
      :filterSome="filterSome"
      @confirm="confirmFilter"
      @reset="resetFilter"
    >
      <up-form>
        <app-form-item label="总单ID" class="mt-1">
          <up-input
            v-model="filterVal.docId"
            clearable
            placeholder="请输入总单ID"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          />
        </app-form-item>
        <app-form-item label="细单ID">
          <up-input
            v-model="filterVal.dtlId"
            clearable
            placeholder="请输入细单ID"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          />
        </app-form-item>
        <app-form-item label="货品ID|名称">
          <up-input
            v-model="filterVal.goods"
            clearable
            placeholder="请输入货品ID|货品名称"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          />
        </app-form-item>
        <app-form-item label="客户ID|名称">
          <up-input
            v-model="filterVal.customer"
            clearable
            placeholder="请输入客户ID|客户名称"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          />
        </app-form-item>
        <app-form-item label="生产厂家">
          <up-input
            v-model="filterVal.factory"
            clearable
            placeholder="请输入生产厂家"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          />
        </app-form-item>
        <app-form-item label="确认时间范围" :borderBottom="false">
          <view
            :class="`w-full text-right ${filterVal.start ? '' : 'color-gray-6'}`"
            @click="calendarRef?.open()"
          >
            {{ filterVal.start ? `${filterVal.start} 至 ${filterVal.end}` : '点击选择' }}
          </view>
        </app-form-item>
      </up-form>
    </app-filter-pop>
    <app-calendar ref="calendarRef" mode="range" @confirm="onDateConfirm" />
  </view>
</template>
