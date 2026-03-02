<script setup lang="ts">
import type { TypeValue } from '../types';

interface IProps {
  type?: TypeValue;
  small?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  type: 1,
  small: false,
});

const emit = defineEmits<{
  typeChange: [type: number];
}>();

const onTypeChange = (type: TypeValue) => {
  if (type === props.type) return;
  emit('typeChange', type);
};
</script>

<template>
  <view class="flex">
    <view
      :class="[
        'rounded-4 text-14 h-64 line-height-8 text-center',
        type === 1 ? 'color-white bg-main-3' : '',
      ]"
      :style="small ? 'width: 70px; margin-right: 14px' : 'width: 88px'"
      @click="onTypeChange(1)"
    >
      销售进度
    </view>
    <view
      :class="[
        'rounded-4 text-14 h-64 line-height-8 text-center',
        type === 2 ? 'color-white bg-main-3' : '',
      ]"
      :style="small ? 'width: 70px;' : 'width: 88px'"
      @click="onTypeChange(2)"
    >
      网点覆盖
    </view>
  </view>
</template>
