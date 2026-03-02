<script setup lang="ts">
import type { FundingReportData } from '../types';
import { formatValue, formatPercent } from '@/utils/number';

interface IProps {
  data: FundingReportData;
  gray?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  gray: false,
});

const emit = defineEmits<{
  click: [data: FundingReportData];
}>();

const onClick = () => {
  if (props.data.cffId) {
    emit('click', props.data);
  }
};
</script>

<template>
  <view
    :class="[
      'text-left text-14 w-full pr-9',
      !data.cffId ? 'bg-[#e1e7f8]' : gray ? 'bg-[#f7f7f7]' : 'bg-white',
    ]"
    style="min-width: 876px"
    @click="onClick"
  >
    <view class="flex items-center py-3">
      <view
        style="width: 150px"
        :class="[
          'color-main-3 flex-5 position-sticky left-0 pl-4',
          !data.cffId ? 'bg-[#e1e7f8]' : gray ? 'bg-[#f7f7f7]' : 'bg-white',
        ]"
      >
        {{ data.deptName }}
      </view>
      <view class="w-168 text-right flex-3 ml-8 slh">
        {{ formatValue(data.actualityTotal, '') }}
      </view>
      <view style="width: 138px" class="text-right flex-5 ml-8 slh">
        {{ formatPercent(data.finish, 0) }}
      </view>
      <view style="width: 138px" class="text-right flex-5 ml-8 slh">
        {{ formatPercent(data.csfinish, 0) }}
      </view>
      <view class="w-168 text-right flex-3 ml-8 slh">
        {{ formatValue(data.total, '') }}
      </view>
      <view class="w-168 text-right flex-3 ml-8 slh">
        {{ formatValue(data.csAmount, '') }}
      </view>
    </view>
  </view>
</template>
