<template>
  <view class="visit-card bg-white rd-md pa-3">
    <!-- 头部：标题和时间 -->
    <view class="flex justify-between items-start mb-2">
      <view class="flex-1 mr-2">
        <text class="font-bold text-14">{{ data.labelName || '未知类型' }}</text>
      </view>
      <text class="color-gray-5 text-12 flex-shrink-0">{{
        formatTime(data.visitTime || data.createTime)
      }}</text>
    </view>

    <!-- 医院名称 -->
    <view class="flex items-start mb-2">
      <text class="color-gray-5 text-12 w-120rpx flex-shrink-0">医院</text>
      <text class="text-12 font-bold flex-1 text-right">{{ data.companyName || '' }}</text>
    </view>

    <!-- 业务员 -->
    <view class="flex items-start mb-2">
      <text class="color-gray-5 text-12 w-120rpx flex-shrink-0">业务员</text>
      <text class="text-12 font-bold flex-1 text-right">{{
        data.userName || data.visitUserName || ''
      }}</text>
    </view>

    <!-- 备注 -->
    <view class="flex items-start">
      <text class="color-gray-5 text-12 w-120rpx flex-shrink-0">备注</text>
      <text class="text-12 flex-1 text-right line-clamp-2">{{ data.remark || '暂无备注' }}</text>
    </view>

    <!-- 协同拜访标签（如果是协同拜访且有协防按钮，可在此处扩展，参考图1右下角悬浮按钮，此处仅保留标签展示） -->
    <view v-if="isTogether || data.taskType === 1" class="flex justify-end mt-2">
      <!-- 如果需要显示类似图1的协同tag可以在这里加，但图2主要是列表展示 -->
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { CustomerEvent } from '../types';

interface Props {
  data: CustomerEvent;
  isTogether?: boolean; // 是否协同拜访
}

const props = withDefaults(defineProps<Props>(), {
  isTogether: false,
});

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return '';
  // 如果是完整时间戳，只显示日期和时分
  if (time.length > 16) {
    return time.substring(0, 16);
  }
  return time;
};

// 获取事件类型样式类名
const getEventTypeClass = (type: string) => {
  const typeMap: { [key: string]: string } = {
    客勤事件: 'event',
    外勤拜访: 'visit',
    客户随访: 'follow',
    客户协防: 'assist',
    // 可以根据实际情况添加更多类型
  };
  return typeMap[type] || 'default';
};

// 获取相关人员名称列表
const getRelatedPersonNames = (persons: any[]) => {
  if (!persons || !persons.length) return '';
  return persons
    .map(p => p.personName || p.name)
    .filter(Boolean)
    .join('、');
};
</script>

<style lang="scss" scoped>
.visit-card {
  box-shadow: 0 1px 6px 1px rgb(209 207 207 / 30%);
}

.event-tag {
  padding: 4rpx 16rpx;
  border-radius: 4rpx;
  font-size: 24rpx;
  font-weight: bold;

  &--event {
    color: #0052d9;
    background: rgba(0, 82, 217, 0.1);
  }

  &--visit {
    color: #266fe8;
    background: rgba(38, 111, 232, 0.1);
  }

  &--follow {
    color: #699ef5;
    background: rgba(105, 158, 245, 0.1);
  }

  &--assist {
    color: #bbd3fb;
    background: rgba(187, 211, 251, 0.3);
  }

  &--default {
    color: #646566;
    background: rgba(100, 101, 102, 0.1);
  }
}

.together-tag {
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  font-size: 24rpx;
  color: #ff6b22;
  background: rgba(255, 107, 34, 0.1);
  border: 1rpx solid rgba(255, 107, 34, 0.3);
}

.event-content {
  line-height: 1.6;
  color: #323233;
}

.label-tag {
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  font-size: 24rpx;
  color: #2271f5;
  background: rgba(34, 113, 245, 0.08);
  border: 1rpx solid rgba(34, 113, 245, 0.2);
}
</style>
