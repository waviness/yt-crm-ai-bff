<script setup lang="ts">
/**
 * 类型圆圈组件
 * 显示不同类型的应收管理状态标识
 */

import type { ReceivableDataType, ReceivableTabType } from '../types';

// 定义组件属性
interface Props {
  type: ReceivableDataType;
  active: ReceivableTabType;
}

const props = defineProps<Props>();

// 计算属性
const typeName = computed(() => {
  let text = '';
  if (props.active === 0) {
    const arr = ['', '逾期且预收超期未处理', '逾期且有预收未处理', '有预收未处理'];
    text = arr[props.type];
  } else if (props.active === 1) {
    text = '到本月底即将逾期';
  } else {
    text = '已逾期';
  }
  return text;
});

const typeClass = computed(() => {
  let className = '';
  if (props.active === 0) {
    const classArr = ['', 'bg-danger', 'bg-warning', 'bg-main'];
    className = classArr[props.type];
  } else if (props.active === 1) {
    className = 'bg-warning';
  } else {
    className = 'bg-danger';
  }
  return className;
});
</script>

<template>
  <view class="flex items-center">
    <view :class="['w-32 h-32 rounded-full mr-2', typeClass]"></view>
    <view class="text-sm font-bold">{{ typeName }}</view>
  </view>
</template>
