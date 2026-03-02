<script setup lang="ts">
interface IProps {
  data?: any;
  receipt?: boolean; // true我收到的 false我发出的
  showProgress?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  data: () => ({}),
  receipt: false,
  showProgress: false,
});

const statusText = computed(() => {
  const arr = ['已作废', '未读', '已读'];
  const arrSend = ['已作废', '进行中', '已完成'];
  return props.receipt ? arr[+props.data.useStatus] : arrSend[+props.data.useStatus];
});

const textColor = computed(() => {
  return +props.data.useStatus === 0
    ? 'color-danger'
    : +props.data.useStatus === 2
      ? 'color-success'
      : '';
});

const progress = computed(() => {
  return Math.ceil((props.data.hasReply / props.data.sendList?.length) * 100);
});
</script>

<template>
  <view class="bg-white p-10 relative">
    <view class="flex justify-between items-center">
      <view class="flex items-center">
        <view :class="['text-14', +data.useStatus === 1 ? '' : 'color-gray-4']">{{
          data.smallTag
        }}</view>
        <app-icon
          name="return"
          :class="['ml-2', data.isReturn ? 'color-main-3' : 'color-gray-4']"
        />
      </view>
      <view class="color-gray-4">{{
        data.creTime ? data.creTime.slice(0, data.creTime.length - 3) : ''
      }}</view>
    </view>
    <view class="flex justify-between items-center mt-2">
      <view
        v-if="data.eventAgeingStart"
        :class="['flex items-center', +data.useStatus === 1 ? 'color-main-3' : 'color-gray-4']"
      >
        <app-icon :name="`a-bianzu11${+data.useStatus === 1 ? '' : '1'}`" multi class="mr-1" />
        {{
          `${data.eventAgeingStart.replaceAll('-', '.')}-${data.eventAgeingEnd.replaceAll('-', '.')}`
        }}
      </view>
      <view v-else class="color-gray-7 flex items-center">
        <app-icon name="a-bianzu111" multi class="mr-1" />
        暂未设定时效
      </view>
      <app-status-tag
        v-if="+data.emergencyLevel === 1"
        :type="+data.useStatus === 1 ? 'success' : 'default'"
        name="普通"
        class="mr-2"
      />
      <app-status-tag
        v-if="+data.emergencyLevel === 2"
        :type="+data.useStatus === 1 ? 'warning' : 'default'"
        name="重要"
        class="mr-2"
      />
      <app-status-tag
        v-if="+data.emergencyLevel === 3"
        :type="+data.useStatus === 1 ? 'danger' : 'default'"
        name="紧急"
        class="mr-2"
      />
    </view>
    <view class="flex justify-between items-center mt-2">
      <view v-if="receipt" :class="+data.useStatus === 1 ? '' : 'color-gray-4'"
        >发送人：{{ data.sendName || '' }}</view
      >
      <view
        v-else-if="showProgress"
        class="w-44px h-14px leading-14px rounded-8px text-white text-center font-bold border-1px"
        :class="
          +data.useStatus === 1 ? 'bg-main-3 border-main-3' : 'bg-gray-4 progress-div--finish'
        "
      >
        {{ `${+data.useStatus === 2 ? 100 : progress}%` }}
      </view>
      <view v-else></view>
      <view :class="['font-bold', textColor]">
        {{ statusText }}
      </view>
    </view>
    <view
      v-if="showProgress"
      class="w-full h-4 bg-gray-12 rounded-1px absolute left-0 bottom-0"
    ></view>
    <view
      v-if="showProgress"
      class="w-full h-4 rounded-1px absolute left-0 bottom-0"
      :class="+data.useStatus === 1 ? 'bg-main' : 'bg-gray-7'"
      :style="`width: ${+data.useStatus === 2 ? 100 : progress}%`"
    ></view>
  </view>
</template>

<style lang="scss" scoped>
// 仅保留必要的自定义样式（border 透明度）
.progress-div--finish {
  border-color: rgb(150 151 153 / 10%);
}
</style>
