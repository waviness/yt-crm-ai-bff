<script setup lang="ts">
import type { StatusType } from '../types';

interface IProps {
  status?: StatusType; // 0无 1进行中 2完成 3未上会
  text?: string;
  clickable?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  status: 0,
  text: '',
  clickable: false,
});

const emit = defineEmits(['click']);

const colorArr: readonly string[] = ['#969799', '#ED7B2F', '#00A870', '#EE0A24'];
const statusArr: readonly string[] = [
  'circle',
  'checkmark-circle-fill',
  'checkmark-circle-fill',
  'error-circle-fill',
];

const onClick = () => {
  if (props.clickable) {
    emit('click');
  }
};
</script>

<template>
  <view class="text-14 flex items-center" @click="onClick">
    <view
      v-if="status === 0"
      class="empty-circle mr-2 w-28 h-28 rounded-full border-box border-solid border-2 border-gray-7"
    ></view>
    <up-icon v-else :name="statusArr[status]" size="16" :color="colorArr[status]" class="mr-2" />{{
      text
    }}
  </view>
</template>
