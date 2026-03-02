<template>
  <view class="gray-block box-shadow">
    <view class="topic-top white-block pa-2 flex justify-between items-baseline">
      <app-tag :name="data.smallTagName" type="primary" size="small" />
      <view class="color-gray text-12">{{ data.visitTime }}</view>
    </view>
    <view class="pa-2 text-14">{{ data.remark }}</view>
  </view>
</template>

<script lang="ts" setup>
import type { TopicItem } from '../types';

defineProps<{
  data: TopicItem;
}>();
</script>

<style lang="scss" scoped>
.topic-top {
  border-radius: 8px 8px 0 0;
}
.gray-block {
  background: #f7f8fa;
  border-radius: 8px;
}
.white-block {
  background: #fff;
}
.box-shadow {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
</style>
