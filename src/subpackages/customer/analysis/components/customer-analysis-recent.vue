<template>
  <view class="recent-card bg-white mt-2 rd-md relative" @click="onClick">
    <view class="flex justify-between items-center pa-3 text-14">
      <text class="font-bold">近100天</text>
      <up-icon name="arrow-right" size="32rpx"></up-icon>
    </view>

    <view class="flex justify-between pt-4 px-7">
      <event-item
        icon="star"
        color="#0052d9"
        label="累计客勤事件/次"
        :value="eventCount.custEventCount || 0"
      />
      <event-item
        icon="play-circle"
        color="#266fe8"
        label="累计外勤拜访/次"
        :value="eventCount.legWorkCount || 0"
      />
    </view>

    <view class="flex justify-between py-4 px-7">
      <event-item
        icon="eye"
        color="#699ef5"
        label="累计客户随访/次"
        :value="eventCount.followCount || 0"
      />
      <event-item
        icon="heart"
        color="#bbd3fb"
        label="累计客户协防/次"
        :value="eventCount.assistCount || 0"
      />
    </view>

    <!-- 进度条 -->
    <view v-if="eventTotal" class="flex overflow-hidden" style="border-radius: 0 0 10rpx 10rpx">
      <view
        class="border-div"
        :style="`background: #0052d9; width: ${(eventCount.custEventCount * 100) / eventTotal}%`"
      ></view>
      <view
        class="border-div"
        :style="`background: #266fe8; width: ${(eventCount.legWorkCount * 100) / eventTotal}%`"
      ></view>
      <view
        class="border-div"
        :style="`background: #699ef5; width: ${(eventCount.followCount * 100) / eventTotal}%`"
      ></view>
      <view
        class="border-div"
        :style="`background: #bbd3fb; width: ${(eventCount.assistCount * 100) / eventTotal}%`"
      ></view>
    </view>

    <!-- 加载状态 -->
    <app-local-loading :show="loading" bg-color="bg-white/80" />
  </view>
</template>

<script lang="ts" setup>
import eventItem from './event-item.vue';
import type { EventCount } from '../types';

interface Props {
  eventCount: EventCount;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits(['click']);

// 计算总数
const eventTotal = computed(() => {
  const { custEventCount, legWorkCount, followCount, assistCount } = props.eventCount;
  return (custEventCount || 0) + (legWorkCount || 0) + (followCount || 0) + (assistCount || 0);
});

const onClick = () => {
  emit('click');
};
</script>

<style lang="scss" scoped>
.recent-card {
  box-shadow: 0 1px 6px 1px rgb(209 207 207 / 30%);
  position: relative;
}

.border-div {
  height: 12rpx;
}
</style>
