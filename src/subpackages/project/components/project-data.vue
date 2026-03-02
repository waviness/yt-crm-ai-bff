<script setup lang="ts">
const appStore = useAppStore();

interface IProps {
  data?: any;
  icon?: string;
  title?: string;
  grow?: boolean;
  growNum?: number;
  bigValue?: boolean;
  value?: number | string;
  valueSize?: number;
  specialTitle?: boolean;
}

withDefaults(defineProps<IProps>(), {
  data: () => ({}),
  icon: '',
  title: '',
  grow: false,
  growNum: 0,
  bigValue: false,
  value: 0,
  valueSize: 20,
  specialTitle: false,
});
</script>

<template>
  <view class="bg-white rounded-20rpx p-10">
    <view v-if="specialTitle" class="flex items-center justify-between">
      <app-icon :name="icon" size="36rpx" :color="appStore.theme.color.primary" />
      <view :class="`text-${valueSize} font-bold`">{{ title }}</view>
    </view>
    <view v-else class="flex items-center">
      <app-icon :name="icon" size="36rpx" :color="appStore.theme.color.primary" />
      <view class="flex-1 mx-2 text-14">{{ title }}</view>
      <view v-if="!grow && !bigValue" :class="`text-${valueSize} font-bold`">{{ value }}</view>
    </view>
    <view v-if="!!grow" class="mt-3 flex items-center justify-between">
      <view class="flex items-center">
        <app-icon name="fall-green" size="36rpx" multi />
        <view class="color-success text-14">{{ growNum }}</view>
      </view>
      <view class="text-20 font-bold">{{ value }}</view>
    </view>
    <view v-if="bigValue" class="mt-3">
      <view class="text-20 font-bold">{{ value || '-' }}</view>
    </view>
  </view>
</template>
