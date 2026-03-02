<template>
  <view>
    <!-- 基础信息卡片 -->
    <view class="p-2 mb-2 bg-white rounded">
      <view class="flex justify-between items-center">
        <view class="flex items-center">
          <text class="text-14 font-bold">
            {{
              visitObj.companyName
                ? visitObj.companyName.indexOf('/').length > 2
                  ? visitObj.companyName.split('/')[0] + '/'
                  : visitObj.companyName
                : ''
            }}
          </text>
        </view>
        <view class="flex flex-col items-end min-w-[110px]">
          <text class="text-gray-500 pb-1">{{ visitObj.visitTime.substring(0, 16) }}</text>
          <text
            :class="[
              visitObj.taskType === 1
                ? 'bg-blue-100 text-blue-600'
                : visitObj.taskType === 2
                  ? 'bg-blue-50 text-blue-500'
                  : visitObj.taskType === 3
                    ? 'bg-blue-500 text-white'
                    : '',
              'px-2 py-1 rounded text-xs',
            ]"
          >
            {{
              visitObj.taskType === 1
                ? '个人拜访'
                : visitObj.taskType === 2
                  ? '协访'
                  : visitObj.taskType === 3
                    ? '接待'
                    : ''
            }}
          </text>
        </view>
      </view>

      <view class="flex justify-between items-center my-2">
        <text>
          <text
            :class="[
              visitObj.warmthNum === 1
                ? 'text-gray-600'
                : visitObj.warmthNum === 2
                  ? 'text-orange-500'
                  : visitObj.warmthNum === 3
                    ? 'text-red-500'
                    : '',
              'text-14 pr-2',
            ]"
            >{{ visitObj.visitUserName }}</text
          >
          <text class="font-bold text-14">{{ visitObj.visitUserPosition }}</text>
        </text>
        <text class="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">
          {{ visitObj.creId }}/{{ visitObj.creName }}
        </text>
      </view>
    </view>

    <!-- 标签信息卡片 -->
    <view
      v-if="visitObj.crmLabelRemarkDtoList.length"
      :class="needbg ? 'bg-gray-100' : 'bg-white'"
      class="p-2 rounded"
    >
      <view class="text-14 text-gray-500 px-2">
        <view :class="needbg ? 'line-clamp-1' : ''">
          <text
            v-for="(crmLabel, index) in visitObj.crmLabelRemarkDtoList"
            :key="index"
            class="block"
          >
            {{ crmLabel.labelName }}：{{ crmLabel.remark }}。
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
// --- Props ---
const props = defineProps({
  visitObj: {
    type: Object,
    default: true,
  },
  needbg: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="scss" scoped></style>
