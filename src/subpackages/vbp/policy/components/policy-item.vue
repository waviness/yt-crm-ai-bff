<!-- 政策选项组件 -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import type { OptionItem } from '@/types/common';
import AppActionSheet from '@/components/base/action-sheet.vue';

interface IProps {
  description: string;
  placeholder: string;
  actions: OptionItem[];
  selectValue?: OptionItem;
  editable: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  description: '',
  placeholder: '',
  actions: () => [],
  selectValue: undefined,
  editable: false,
});

// 定义 emits
const emit = defineEmits<{
  'update:selectValue': [value: OptionItem];
}>();

// 响应式数据
const show = ref(false);

// 计算属性
const displayText = computed(() => {
  return props.selectValue?.name || props.placeholder;
});

const textClass = computed(() => {
  return props.selectValue?.name ? '' : 'color-gray-7';
});

// 方法定义
const onClick = () => {
  if (props.editable) {
    show.value = true;
  }
};

const onSelect = (action: OptionItem) => {
  emit('update:selectValue', action);
};
</script>

<template>
  <view class="text-14">
    <view class="mx-4 my-2 color-gray-4">{{ description }}</view>
    <view v-if="editable" class="bg-white py-3 px-4 clickable" @click="onClick">
      <text :class="textClass">{{ displayText }}</text>
    </view>
    <view v-else class="bg-white py-10 px-4">
      <text v-if="selectValue?.name">{{ selectValue.name }}</text>
    </view>
    <app-action-sheet
      v-model:show="show"
      :actions="actions"
      :description="description"
      @select="onSelect"
    />
  </view>
</template>
