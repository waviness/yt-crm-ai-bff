<template>
  <view class="px-2">
    <view class="flex pt-2">
      <!-- 当日销售卡片 -->
      <view class="daily-sales flex-5" :class="visitFlag ? 'mr-2' : ''">
        <view class="flex flex-col justify-between text-14 pt-3 pl-4">
          <view>当日销售(万元)</view>
          <view v-if="objName" class="py-1">
            <text class="fontWeight">{{ objName }}</text>
          </view>
          <view v-else class="py-1" style="visibility: hidden">--</view>
          <view class="text-28 pt-2 fontWeight">
            <text v-if="!loading"> {{ currentDayMoney }}</text>
            <up-loading-icon v-else color="white" mode="semicircle"></up-loading-icon>
          </view>
        </view>
      </view>

      <!-- 近30天拜访卡片 -->
      <view
        v-if="visitFlag"
        class="visit-card pb-2 color-gray-4 flex flex-col justify-between fontWeight flex-3"
        @click="visitClick"
      >
        <view class="flex pl-4 pr-2 pt-3 align-center justify-between">
          <text class="text-16">近30天拜访</text>
          <u-icon name="arrow-right" size="16" />
        </view>
        <view class="text-28 pl-4 pt-2 color-main-3">{{ visitNumber }}次</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps({
  currentDayMoney: {
    type: [String, Number],
    default: '0',
  },
  visitNumber: {
    type: Number,
    default: 0,
  },
  objName: {
    type: String,
    default: '',
  },
  visitFlag: {
    type: Boolean,
    default: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

// 3. 定义 Emits (组件的事件)
// 使用 defineEmits 宏来声明组件可以触发的事件
const emit = defineEmits(['visitClick']);

// 4. 定义方法
const visitClick = () => {
  // 触发 'visitClick' 事件，并可以传递数据
  emit('visitClick');
};
</script>

<style lang="scss" scoped>
.daily-sales {
  height: 242rpx;
  border-radius: 60rpx;
  color: white;
  background: #3561f2 url('@/static/images/chashuju-total-bg.webp') no-repeat;
  background-position: 100% 0%;
  background-size: 60%;
}

.visit-card {
  border-radius: 60rpx;
  border: 1rpx solid #e7e7e7;
}
</style>
