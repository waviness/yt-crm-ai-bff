<script setup lang="ts">
/**
 * 账户列表组件
 * 显示账户信息和反馈功能
 */

import type { AccountInfo } from '../types';

// 定义组件属性
interface Props {
  list: AccountInfo[];
  type?: 'normal' | 'danger';
  dateKey?: string;
  valKey: string;
  isAdvanced?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'normal',
  isAdvanced: false,
  disabled: false,
});

// 定义事件
const emit = defineEmits<{
  feedback: [feedType: number, item: AccountInfo];
}>();

// 格式化日期为年月日
const formateDate = (date: string) => {
  const str = date.split(' ')[0].split('-');
  return `${str[0]}年${str[1]}月${str[2]}日`;
};

// 格式化日期为年月
const formateDateWithoutDay = (date: string) => {
  const str = date.split(' ')[0].split('-');
  return `${str[0]}年${Number(str[1])}月`;
};

// 点击反馈按钮
const onClick = (feedType: number, item: AccountInfo) => {
  emit('feedback', feedType, item);
};

// 计算属性
const circleClass = computed(() => {
  return props.type === 'danger' ? 'bg-red-500' : 'bg-blue-500';
});
</script>

<template>
  <view class="p-10">
    <view class="account" v-for="(item, idx) in list" :key="idx">
      <view class="flex justify-between">
        <view>
          <view class="flex items-center">
            <view :class="['account-circle', circleClass]"></view>
            <view class="text-sm color-gray-4 ml-4">
              {{
                !isAdvanced
                  ? formateDateWithoutDay(item[dateKey])
                  : `${item.paymentDate ? formateDate(item.paymentDate) : ''}到账`
              }}
            </view>
          </view>
          <view class="account-border text-sm font-bold pt-2">
            {{ item[valKey] }}<span v-if="isAdvanced">(未处理：{{ item.unMixedMoney || 0 }})</span>
          </view>
        </view>
        <view v-if="isAdvanced">
          <up-button
            v-if="!item.isRemark"
            type="primary"
            size="small"
            shape="circle"
            @click="onClick(1, item)"
          >
            反馈
          </up-button>
          <up-button
            v-else
            type="primary"
            size="small"
            shape="circle"
            :disabled="disabled"
            @click="onClick(2, item)"
          >
            查看
          </up-button>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.account {
  &-circle {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  &-border {
    height: 48px;
    border-left: 1px solid #dcdee0;
    margin-left: 5px;
    padding-left: 20px;
  }

  &:last-child {
    .account-border {
      border-left: 0;
      margin-left: 6px;
      height: 16px;
    }
  }
}

:deep(.up-button) {
  width: 72px;
}
</style>
