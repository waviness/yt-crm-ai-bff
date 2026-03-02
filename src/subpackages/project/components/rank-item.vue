<script setup lang="ts">
interface IProps {
  data?: Record<string, any>;
  gray?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  data: () => ({}),
  gray: false,
});

// Emits
const emit = defineEmits<{
  click: [];
}>();

// Methods
const onClick = () => {
  emit('click');
};
</script>

<template>
  <view
    :class="['flex items-center py-3 pl-4 text-left text-sm', gray ? 'bg-gray-100' : 'bg-white']"
    @click="onClick"
  >
    <view class="flex-6 text-blue-500">{{ data.text }}</view>
    <view class="flex-4 ml-2 slh">{{ Math.round(parseFloat(data.goalNum) * 100) / 100 }}</view>
    <view class="flex-5 ml-2 slh">{{ Math.round(parseFloat(data.accessNum) * 100) / 100 }}</view>
    <view class="flex-4 ml-2 slh">{{ (data.accessRate * 100).toFixed(1) }}%</view>
  </view>
</template>
