<template>
  <view v-for="item in list" :key="item.cupId" class="mb-2">
    <up-swipe-action>
      <up-swipe-action-item :options="options" @click="(val: any) => handleClick(val, item)">
        <view class="white-block pa-2 rounded">
          <view class="flex justify-between items-baseline">
            <view class="text-14 font-bold">{{ item.personId }}/{{ item.personName }}</view>
            <view class="color-gray text-12">{{ item.position }}</view>
          </view>
          <view class="flex justify-between items-baseline mt-2">
            <view class="color-gray text-12">进度</view>
            <view class="text-14">{{ item.content }}</view>
          </view>
          <view class="mt-2">
            <view class="text-12 color-gray">最新</view>
            <view class="flex items-center mt-1">
              <app-tag
                v-if="item.topicDetailVO?.smallTagName"
                :name="item.topicDetailVO?.smallTagName"
                type="primary"
                size="small"
                class="mr-2"
              />
              <view class="color-main text-12">
                {{
                  item.topicDetailVO?.visitTime
                    ? item.topicDetailVO.visitTime.slice(0, item.topicDetailVO.visitTime.length - 3)
                    : ''
                }}
              </view>
            </view>
            <view class="mt-1 text-12">{{ item.topicDetailVO?.remark || '无' }}</view>
          </view>
        </view>
      </up-swipe-action-item>
    </up-swipe-action>
  </view>
</template>

<script lang="ts" setup>
import type { GrItem } from '../types';

defineProps<{
  list: GrItem[];
}>();

const emit = defineEmits<{
  edit: [type: number, item: GrItem];
  delete: [type: number, item: GrItem];
}>();

const options = [
  {
    text: '编辑',
    style: {
      backgroundColor: '#1989fa',
    },
  },
  {
    text: '删除',
    style: {
      backgroundColor: '#ee0a24',
    },
  },
];

const handleClick = ({ index }: { index: number }, item: GrItem) => {
  if (index === 0) {
    emit('edit', 1, item);
  } else {
    emit('delete', 1, item);
  }
};
</script>

<style lang="scss" scoped>
.white-block {
  background: #fff;
}
.rounded {
  border-radius: 8px;
}
</style>
