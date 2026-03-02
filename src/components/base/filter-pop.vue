<script setup lang="ts">
interface IProps {
  filterShow: boolean;
  filterSome: boolean;
}

withDefaults(defineProps<IProps>(), {
  filterShow: false,
  filterSome: false,
});

// 事件定义
const emit = defineEmits(['confirm', 'reset', 'update:filterShow']);

// 确认筛选
const onConfirm = () => {
  emit('update:filterShow', false);
  emit('confirm');
};

// 重置筛选
const reset = () => {
  emit('reset');
};
</script>

<template>
  <view>
    <view class="bg-white px-2 py-10 z-[99] relative flex">
      <view
        :class="[
          'filter-item filter-border w-full h-80 flex justify-between items-center text-14 px-10',
          filterShow ? 'color-main' : '',
          filterSome ? 'bg-main color-white' : '',
        ]"
        @click="emit('update:filterShow', !filterShow)"
      >
        <view>条件筛选</view>
        <up-icon
          :name="`arrow-${filterShow ? 'up' : 'down'}`"
          :color="filterShow ? 'main' : ''"
          size="16px"
        />
      </view>
    </view>
    <up-popup
      :show="filterShow"
      :zIndex="97"
      mode="top"
      round="16"
      customStyle="top: 116rpx"
      @close="emit('update:filterShow', false)"
    >
      <slot />
      <view class="h-160 flex items-center justify-space-evenly px-4">
        <up-button shape="circle" @click="reset">重置</up-button>
        <up-button class="ml-4" shape="circle" type="primary" @click="onConfirm">确认</up-button>
      </view>
    </up-popup>
  </view>
</template>
