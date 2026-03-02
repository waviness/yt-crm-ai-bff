<script setup lang="ts">
interface IProps {
  title?: string;
  sortShow?: boolean;
  sort?: number;
}

withDefaults(defineProps<IProps>(), {
  sortShow: false,
  sort: 0,
});

const icons = shallowRef(['wupaixu', 'jiangxu', 'shengxu']);

defineEmits(['click']);
</script>

<template>
  <view class="flex h-full items-center" @click="$emit('click')">
    <view class="color-gray-5 text-14">{{ title }}</view>
    <app-icon v-if="sortShow" :name="icons[sort]" class="text-12" multi />
  </view>
</template>
