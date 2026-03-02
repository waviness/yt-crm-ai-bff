<script setup lang="ts">
import type { OrderFilterData } from '../types';

interface IProps {
  /**
   * 控制筛选弹窗显示/隐藏
   */
  filterShow: boolean;
  /**
   * 筛选数据对象
   */
  filterValue: OrderFilterData;
}

const props = withDefaults(defineProps<IProps>(), {
  filterShow: false,
  filterValue: () => ({
    goodsId: '',
    goodsName: '',
    customerId: '',
    customerName: '',
    entryKeyword: '',
    time: '',
  }),
});

const emit = defineEmits<{
  /**
   * 更新筛选弹窗显示状态
   */
  'update:filterShow': [value: boolean];
  /**
   * 确认筛选
   */
  confirm: [filterData: OrderFilterData];
  /**
   * 重置筛选
   */
  reset: [];
  /**
   * 关闭弹窗（用于恢复原始值）
   */
  close: [];
}>();

/**
 * 内部筛选数据（用于临时编辑）
 */
const localFilterValue = ref<OrderFilterData>({ ...props.filterValue });

/**
 * 监听外部 filterValue 变化，同步到内部状态
 */
watch(
  () => props.filterValue,
  newVal => {
    localFilterValue.value = { ...newVal };
  },
  { deep: true }
);

/**
 * 是否通过确认关闭
 */
const isConfirmClose = ref(false);

/**
 * 监听 filterShow 变化，重置内部状态
 */
watch(
  () => props.filterShow,
  (newVal, oldVal) => {
    if (newVal) {
      // 弹窗打开时，同步外部数据到内部
      localFilterValue.value = { ...props.filterValue };
      isConfirmClose.value = false;
    } else if (oldVal && !isConfirmClose.value) {
      // 弹窗关闭时，如果不是通过确认关闭的，触发 close 事件让父组件恢复原始值
      emit('close');
    }
  }
);

/**
 * 判断是否有筛选条件
 * 参考 impulse-filter-pop.vue 的逻辑
 * 只有当弹窗关闭时，才判断是否有筛选条件（基于已确认的 filterValue）
 * 弹窗打开时返回 false，避免编辑过程中的状态闪烁
 */
const hasFilter = computed(() => {
  if (
    !props.filterShow &&
    (props.filterValue.goodsId ||
      props.filterValue.goodsName ||
      props.filterValue.customerId ||
      props.filterValue.customerName)
  ) {
    return true;
  }
  return false;
});

/**
 * 处理确认筛选
 */
const handleConfirm = () => {
  isConfirmClose.value = true;
  emit('update:filterShow', false);
  emit('confirm', { ...localFilterValue.value });
};

/**
 * 处理重置筛选
 */
const handleReset = () => {
  localFilterValue.value = {
    goodsId: '',
    goodsName: '',
    customerId: '',
    customerName: '',
    entryKeyword: '',
    time: '',
  };
  emit('reset');
};
</script>

<template>
  <app-filter-pop
    :filterShow="filterShow"
    :filterSome="hasFilter"
    @update:filterShow="emit('update:filterShow', $event)"
    @confirm="handleConfirm"
    @reset="handleReset"
  >
    <up-form>
      <app-form-item label="品种ID">
        <up-input
          v-model="localFilterValue.goodsId"
          placeholder="请输入品种ID"
          input-align="right"
          fontSize="28rpx"
          border="none"
          clearable
        />
      </app-form-item>
      <app-form-item label="品种名称">
        <up-input
          v-model="localFilterValue.goodsName"
          placeholder="请输入品种名称"
          input-align="right"
          fontSize="28rpx"
          border="none"
          clearable
        />
      </app-form-item>
      <app-form-item label="客户ID">
        <up-input
          v-model="localFilterValue.customerId"
          placeholder="请输入客户ID"
          input-align="right"
          fontSize="28rpx"
          border="none"
          clearable
        />
      </app-form-item>
      <app-form-item label="客户名称" :borderBottom="false">
        <up-input
          v-model="localFilterValue.customerName"
          placeholder="请输入客户名称"
          input-align="right"
          fontSize="28rpx"
          border="none"
          clearable
        />
      </app-form-item>
    </up-form>
  </app-filter-pop>
</template>
