<script setup lang="ts">
interface IProps {
  data: {
    menuLevelOneName?: string;
    menuLevelTwoName?: string;
    content?: string;
    url?: string;
  };
}

const props = defineProps<IProps>();

const emit = defineEmits<{
  handleClick: [];
}>();

const menuColorType = computed(() => {
  const name = props.data.menuLevelOneName;
  if (name === '锁控管理') return 'danger';
  if (name === '订单管理') return 'warning';
  return 'primary';
});

const onClick = () => {
  emit('handleClick');
};
</script>

<template>
  <view class="bg-white rounded-20rpx" @click="onClick">
    <view class="flex items-baseline px-4 py-3">
      <app-tag
        v-if="data.menuLevelTwoName"
        :type="menuColorType"
        class="mr-2"
        :fontSize="12"
        :name="data.menuLevelTwoName"
      />
      <view class="flex-1 text-12">{{ data.content }}</view>
    </view>
    <view v-if="data.url" class="border-0 border-t border-solid border-gray-12"></view>
    <view v-if="data.url" class="py-3 px-4 flex justify-between items-center">
      <view class="text-12">点击查看更多信息</view>
      <up-icon name="arrow-right" size="24rpx" />
    </view>
  </view>
</template>
