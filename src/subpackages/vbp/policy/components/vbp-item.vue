<script setup lang="ts">
// 类型定义
interface PolicyItem {
  customId: string;
  customName: string;
  creDate: string;
  visitFinishDate?: string;
}

interface Props {
  data: PolicyItem;
  active: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  click: [];
}>();

const onClick = () => {
  emit('click');
};

// 计算属性
const displayName = computed(() => {
  const { customId, customName } = props.data;
  return customId && customName ? `${customId}/${customName}` : '';
});

const createDate = computed(() => {
  return props.data.creDate ? props.data.creDate.split(' ')[0] : '';
});

const finishDate = computed(() => {
  return props.data.visitFinishDate ? props.data.visitFinishDate.split(' ')[0] : '';
});
</script>

<template>
  <view class="p-10 bg-white" @click="onClick">
    <view class="text-14">{{ displayName }}</view>
    <view class="mt-2 color-gray-4"> 生成时间：{{ createDate }} </view>
    <view v-if="active" class="mt-2 color-gray-4"> 处理时间：{{ finishDate }} </view>
  </view>
</template>
