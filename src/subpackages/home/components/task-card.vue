<script setup lang="ts">
interface IProps {
  data: {
    emergencyLevel?: number;
    useStatus?: number | string;
    smallTagName?: string;
    title?: string;
    content?: string;
    sendUserName?: string;
    eventAgeingEnd?: string;
    dealNum?: number;
    totalNum?: number;
  };
  taskType: number; // 2我收到的 1我发出的
}

const props = defineProps<IProps>();

const emit = defineEmits<{
  handleClick: [];
}>();

const emergencyLevelText = computed(() => {
  const arr = ['', '普通', '重要', '紧急'];
  return arr[props.data.emergencyLevel || 0] || '';
});

const useStatusText = computed(() => {
  const arr = ['作废', '已读', '未读'];
  const arrSend = ['已作废', '进行中', '已完成'];
  const status = +(props.data.useStatus || 0);
  return props.taskType === 2 ? arr[status] : arrSend[status];
});

const emergencyColorType = computed(() => {
  const level = +(props.data.emergencyLevel || 0);
  if (level === 3) return 'danger';
  if (level === 1) return 'success';
  if (level === 2) return 'warning';
  return 'default';
});

const textColorType = computed(() => {
  const status = +(props.data.useStatus || 0);
  if (props.taskType === 2) {
    // 我收到的
    const arr = ['danger', 'success', 'default'];
    return arr[status] || 'default';
  } else {
    // 我发出的
    const arr = ['danger', 'primary', 'success'];
    return arr[status] || 'default';
  }
});

const replyRate = computed(() => {
  if (!props.data.dealNum || !props.data.totalNum) return 0;
  return Math.ceil((props.data.dealNum / props.data.totalNum) * 100);
});

const onClick = () => {
  emit('handleClick');
};
</script>

<template>
  <view class="bg-white rounded-20rpx" @click="onClick">
    <view class="flex justify-between px-4 py-3">
      <view class="flex items-center">
        <app-tag
          v-if="emergencyLevelText"
          :type="emergencyColorType"
          :name="emergencyLevelText"
          :fontSize="12"
          class="mr-2"
        />
        <app-tag v-if="data.smallTagName" type="default" :name="data.smallTagName" :fontSize="12" />
      </view>
      <app-tag :type="textColorType" :name="useStatusText" :fontSize="12" />
    </view>
    <view class="border-0 border-t border-solid border-gray-12"></view>
    <view class="py-10 px-4 flex justify-between items-center">
      <view class="flex-1">
        <view class="font-bold text-12 color-black-2">{{ data.title }}</view>
        <view class="color-gray-5 mt-1 text-12">{{ data.content }}</view>
        <view v-if="taskType === 2" class="color-gray-4 mt-2 flex items-center text-12">
          <app-icon name="fajianren" class="mr-1" size="24rpx" />
          发件人:{{ data.sendUserName }}
        </view>
        <view v-if="taskType === 1" class="mt-2 flex items-center color-gray-5 text-12">
          <view class="w-480rpx h-34rpx bg-[#e7e7e7] rounded-16rpx overflow-hidden mr-2">
            <view
              :class="[
                'h-full transition-all-300',
                +data.useStatus === 1 ? 'bg-[#2271f5]' : 'bg-[#c8c9cc]',
              ]"
              :style="`width: ${+data.useStatus === 2 ? 100 : replyRate}%`"
            ></view>
          </view>
          {{ replyRate }}%
        </view>
        <view v-if="data.eventAgeingEnd" class="color-gray-4 mt-2 flex items-center text-12">
          <app-icon name="shijian2" class="mr-1" size="24rpx" />
          {{ data.eventAgeingEnd.split(' ')[0] }}截止
        </view>
      </view>
      <up-icon name="arrow-right" size="24rpx" />
    </view>
  </view>
</template>
