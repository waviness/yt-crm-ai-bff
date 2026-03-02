<template>
  <view v-for="item in list" :key="item.cutId" class="mb-2">
    <up-swipe-action>
      <up-swipe-action-item
        :options="disabled ? [] : options"
        @click="(val: any) => handleClick(val, item)"
      >
        <view class="white-block pa-2 rounded">
          <view class="flex justify-between items-baseline">
            <view class="color-gray text-12">时间</view>
            <view class="font-bold text-14">{{ item.targetTime }}</view>
          </view>
          <view class="flex justify-between items-baseline mt-2">
            <view class="color-gray text-12">状态</view>
            <view
              :class="[
                'font-bold text-14',
                Number(item.status) === 0
                  ? 'color-never'
                  : Number(item.status) === 1
                    ? 'color-normal'
                    : '',
              ]"
            >
              {{ Number(item.status) === 0 ? '待完成' : Number(item.status) === 1 ? '已完成' : '' }}
            </view>
          </view>
          <view class="color-gray text-12 mt-2">内容</view>
          <view class="text-14">{{ item.content }}</view>
        </view>
      </up-swipe-action-item>
    </up-swipe-action>
  </view>
</template>

<script lang="ts" setup>
import type { TargetItem } from '../types';

defineProps<{
  list: TargetItem[];
  disabled?: boolean;
}>();

const emit = defineEmits<{
  finish: [item: TargetItem];
  edit: [type: number, item: TargetItem];
  delete: [type: number, item: TargetItem];
}>();

const options = [
  {
    text: '已完成',
    style: {
      backgroundColor: '#07c160',
    },
  },
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

const handleClick = ({ index }: { index: number }, item: TargetItem) => {
  if (index === 0) {
    emit('finish', item);
  } else if (index === 1) {
    emit('edit', 2, item);
  } else {
    emit('delete', 2, item);
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
