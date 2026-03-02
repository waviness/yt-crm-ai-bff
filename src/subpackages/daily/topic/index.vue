<script setup lang="ts">
import time from '@/utils/time';
import { useTopicIndex } from './composables/use-topic-index';
import TopicCard from './components/topic-card.vue';

defineOptions(SHARED_STYLE_OPTIONS);

const appStore = useAppStore();
const calendarRef = ref();

const {
  startTime,
  endTime,
  dateRange,
  topicList,
  topicMessage,
  initDateRange,
  setDateRange,
  refreshTopicData,
} = useTopicIndex();

// 日历选择
const calendarConfirm = (value: any) => {
  setDateRange(new Date(value.range.before), new Date(value.range.after));
  refreshTopicData();
};

// 卡片点击
const cardClick = (item: any) => {
  router.push(RouteMap.topicList, {
    ...item,
    startTime: startTime.value,
    endTime: endTime.value,
  });
};

// 新建话题
const addTopicClick = () => {
  router.push(RouteMap.topicAdd);
};

// 生命周期
onMounted(() => {
  initDateRange();
  refreshTopicData();
});

onShow(() => {
  if (appStore.hadDoneOnDetail) {
    refreshTopicData();
    appStore.setHadDoneOnDetail(false);
  }
});
</script>

<template>
  <view class="topic pb-100">
    <app-watermark />

    <up-sticky style="top: 0">
      <view class="bg-light-gray p-10">
        <view class="text-14 pb-4">与我相关</view>
      </view>
    </up-sticky>

    <view class="topic-content">
      <!-- 与我相关 -->
      <view class="px-10">
        <view class="flex justify-between flex-wrap">
          <topic-card
            type="self"
            name="@我的"
            @cardClick="cardClick({ selectType: 2, LABEL_NAME: '与我相关' })"
          />
          <topic-card
            type="self"
            name="我@的"
            @cardClick="cardClick({ selectType: 1, LABEL_NAME: '我@的' })"
          />
          <topic-card
            type="self"
            name="我发起的"
            @cardClick="cardClick({ selectType: 3, LABEL_NAME: '我发起的' })"
          />
        </view>
      </view>

      <!-- 话题分类 -->
      <view v-for="(topic, index) in topicList" :key="'topic' + index" class="topic-label">
        <view class="text-14 mt-3 mb-2 px-10">{{ topic.MAJOR_LABEL_NAME }}</view>
        <view class="px-10">
          <view class="flex justify-between flex-wrap">
            <topic-card
              v-for="(label, labelIndex) in topic.labelList"
              :key="'label' + labelIndex"
              :name="label.LABEL_NAME"
              :topicSquareNum="label.topicSquareNum"
              :todayNum="label.todayNum"
              @cardClick="cardClick(label)"
            />
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="topicMessage" class="mt-10">
        <app-empty :description="topicMessage" />
      </view>
    </view>

    <!-- 底部操作 -->
    <app-bottom-actions>
      <view class="flex items-center w-full px-4">
        <app-action-btn
          class="flex-2 shadow-btn"
          type="plain"
          icon="lujing2"
          :multi="false"
          :text="`${startTime}~${endTime}`"
          @click="calendarRef?.open()"
        />
        <app-action-btn
          class="flex-1 shadow-btn ml-2"
          type="primary"
          icon="lujing2"
          :multi="false"
          text="新建话题"
          @click="addTopicClick"
        />
      </view>
    </app-bottom-actions>

    <!-- 日期弹框 -->
    <app-calendar
      ref="calendarRef"
      mode="range"
      :first-day-of-week="1"
      :date="
        dateRange.length === 2
          ? [
              time.format(dateRange[0], time.FORMATS.ISO_DATE),
              time.format(dateRange[1], time.FORMATS.ISO_DATE),
            ]
          : ''
      "
      title="选择日期"
      @confirm="calendarConfirm"
    />
  </view>
</template>

<style lang="scss" scoped>
.topic {
  &-content {
    min-height: calc(100vh - 150px);
  }
}
</style>
