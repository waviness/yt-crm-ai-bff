<template>
  <view
    class="flex items-center py-3 lineHeight-20 text-14"
    :class="gray ? 'bg-gray-1' : 'bg-white'"
    @click="handleClick"
  >
    <view class="flex-2 pl-4 color-gray-8">{{ item.userId }}/ {{ item.userName }}</view>
    <view class="flex-3 color-black-2">{{ item.projectName }}</view>
    <view class="flex-2 color-black-2">{{ item.upVisitNum }}</view>
  </view>
</template>

<script lang="ts" setup>
import type { VisitRecordItem } from '../types';

interface Props {
  item: VisitRecordItem;
  gray?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  gray: false,
});

const emit = defineEmits<{
  click: [];
}>();

const handleClick = () => {
  emit('click');
};
</script>

<style lang="scss" scoped>
view {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  margin-right: 33rpx;
}
</style>
