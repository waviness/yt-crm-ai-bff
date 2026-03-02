<template>
  <view class="business-card mb-10" v-for="(data, index) in list" :key="statusActive + index">
    <view
      class="header flex justify-between mx-2 py-2.5 px-2.5 text-14 text-gray-400"
      @click="businessFormClick(data)"
    >
      <text>{{ data.businessForm }}</text>
      <u-icon name="arrow-right" size="16" />
    </view>
    <view class="content flex p-4">
      <view class="w-3/7 flex justify-between">
        <view class="relative flex-1 text-14">
          <view
            class="now-year absolute bottom-0 w-full"
            :style="`height: ${data.yearAmountProgress}%`"
          ></view>
          <view
            class="label absolute bottom-0 w-full flex justify-center items-center text-white text-14"
            :style="`height: ${data.yearAmountProgress}%`"
          >
            <text>{{ data.yearAmountText }}年</text>
          </view>
        </view>
        <view class="relative flex-1 text-14 ml-2">
          <view
            class="before-year absolute bottom-0 w-full"
            :style="`height: ${data.yearOnAmountProgress}%`"
          ></view>
          <view
            class="label absolute bottom-0 w-full flex justify-center items-center text-white text-14"
            :style="`height: ${data.yearOnAmountProgress}%`"
          >
            <text>{{ data.yearOnAmountText }}年</text>
          </view>
        </view>
      </view>
      <view class="w-4/7 h-full">
        <view class="pl-4 h-full text-14 flex flex-col justify-between">
          <view class="flex justify-between pt-6">
            <text>同比增幅</text>
            <text>{{ data.increment }}</text>
          </view>
          <view class="flex justify-between">
            <view class="flex items-center">
              <view class="circle circle-1"></view>
              <text class="pl-2">{{ data.yearAmountText }}年</text>
            </view>
            <text>
              {{ data.yearAmount }}
              <text>{{ data.yearAmountDWShow ? '元' : '万元' }}</text>
            </text>
          </view>
          <view class="flex justify-between">
            <view class="flex items-center">
              <view class="circle circle-2"></view>
              <text class="pl-2">{{ data.yearOnAmountText }}年</text>
            </view>
            <text>
              {{ data.yearOnAmount }}
              <text>{{ data.yearOnAmountDWShow ? '元' : '万元' }}</text>
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
interface Props {
  list: readonly any[];
  statusActive: number;
}

defineProps<Props>();
const emit = defineEmits(['businessFormClick']);
const businessFormClick = (data: any) => {
  emit('businessFormClick', data);
};
</script>

<style lang="scss" scoped>
.business-card {
  height: 170px;
  border-radius: 30px;
  border: 1px solid #e7e7e7;
  margin-bottom: 10px;
}

.content {
  height: calc(100% - 72px);

  .relative {
    background: #f3f3f3;
    border-radius: 12px;
    overflow: hidden;
  }
}

.now-year {
  background: #3561f2;
  border-radius: 12px;
}

.before-year {
  background: #b8b8bb;
  border-radius: 12px;
}

.circle-1 {
  width: 8px;
  height: 8px;
  background: #3561f2;
  border-radius: 50%;
}

.circle-2 {
  width: 8px;
  height: 8px;
  background: #b8b8bb;
  border-radius: 50%;
}

.label {
  min-height: 20px;
}
</style>
