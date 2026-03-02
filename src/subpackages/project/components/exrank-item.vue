<script setup lang="ts">
interface IProps {
  data?: any;
  gray?: boolean;
}

withDefaults(defineProps<IProps>(), {
  data: () => ({}),
  gray: false,
});

const emit = defineEmits<{
  click: [];
}>();

const onClick = () => {
  emit('click');
};
</script>

<template>
  <view
    :class="['flex items-center py-3 pl-4 text-left text-14', gray ? 'bg-gray-10' : 'bg-white']"
    @click="onClick"
  >
    <view class="flex-6 color-main-3">{{ data.name }}</view>
    <view class="flex-4 ml-2 slh">{{ (data.completeRate * 100).toFixed(1) }}%</view>
  </view>
</template>
