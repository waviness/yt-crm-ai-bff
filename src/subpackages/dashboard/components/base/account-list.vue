<template>
  <view class="pa-10">
    <view class="account" v-for="(item, idx) in props.list" :key="idx">
      <view class="d-flex justify-space-between">
        <view>
          <view class="d-flex align-center">
            <view
              :class="`account-circle ${props.type === 'danger' ? 'bg-danger' : 'bg-main-2'}`"
            ></view>
            <view class="font-14 color-gray-4 ml-4">
              {{
                !props.isAdvanced
                  ? formateDateWithoutDay(item[props.dateKey])
                  : `${item.paymentDate ? formateDate(item.paymentDate) : ''}到账`
              }}
            </view>
          </view>
          <view class="account-border font-14 font-bold pt-2">
            {{ item[props.valKey] }}
            <text v-if="props.isAdvanced">(未处理：{{ item.unMixedMoney || 0 }})</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { watch } from 'vue';

// 定义组件属性
const props = withDefaults(
  defineProps<{
    list: any[];
    type?: string; // normal蓝色 danger红色
    dateKey?: string;
    valKey?: string;
    isAdvanced?: boolean; // 是否预收预警
  }>(),
  {
    list: () => [],
    type: 'normal',
    dateKey: '',
    valKey: '',
    isAdvanced: false,
  }
);

// 定义组件事件
const emit = defineEmits<{
  feedback: [feedType: number, item: any];
}>();

// 调试：监听 list 变化
watch(
  () => props.list,
  newVal => {
    console.log('account-list 接收到的 list:', newVal);
    console.log('list 长度:', newVal?.length);
  },
  { immediate: true, deep: true }
);

// 将yyyy-MM-dd HH:MM:SS 格式化为yyyy年mm月dd日
const formateDate = (date: string): string => {
  if (!date) return '';
  const str = date.split(' ')[0].split('-');
  return `${str[0]}年${str[1]}月${str[2]}日`;
};

// 将yyyy-MM-dd HH:MM:SS 格式化为yyyy年m月
const formateDateWithoutDay = (date: string): string => {
  if (!date) return '';
  const str = date.split(' ')[0].split('-');
  return `${str[0]}年${Number(str[1])}月`;
};

// 点击事件处理
const onClick = (feedType: number, item: any) => {
  // type 1反馈 2查看
  emit('feedback', feedType, item);
};
</script>

<style scoped lang="scss">
.account {
  &:last-child {
    .account-border {
      border-left: 0;
      margin-left: 6px;
      height: 16px;
    }
  }

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
}

/* uniapp 中使用 :deep() 或 ::v-deep */
:deep(.van-button) {
  width: 72px;
}

/* 辅助类 - 如果你的项目中没有这些类，需要添加 */
.d-flex {
  display: flex;
}

.justify-space-between {
  justify-content: space-between;
}

.align-center {
  align-items: center;
}

.ml-4 {
  margin-left: 16rpx;
}

.pt-2 {
  padding-top: 8rpx;
}

.font-14 {
  font-size: 28rpx; /* uniapp 使用 rpx，14px ≈ 28rpx */
}

.font-bold {
  font-weight: bold;
}

.color-gray-4 {
  color: #909399;
}

.bg-danger {
  background-color: #ee0a24;
}

.bg-main-2 {
  background-color: #409eff; /* 根据你的主题色调整 */
}

.pa-10 {
  padding: 20rpx;
}
</style>
