<script setup lang="ts">
import type { ProjectInfo } from '../types';
import converter from '@/utils/converter';

interface IProps {
  data?: ProjectInfo;
  gray?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  data: () => ({}) as ProjectInfo,
  gray: false,
});

const emit = defineEmits<{
  click: [data: ProjectInfo];
}>();

const onClick = () => {
  emit('click', props.data);
};
</script>

<template>
  <view
    :class="['flex items-center py-3 pl-4 text-left text-14', gray ? 'bg-gray-10' : 'bg-white']"
    @click="onClick"
  >
    <view class="flex-1 color-main-3">{{ data.projectName }}</view>
    <view class="flex-1 ml-2 slh">{{ data.productNum }}</view>
    <view class="flex-1 ml-2 slh flex">
      <view>{{ data.goalNum }}</view>
      <view class="color-success ml-3">
        <text v-if="converter.toNumber(data.goalNumInc) >= 0">+</text
        >{{ converter.toNumber(data.goalNumInc) }}
      </view>
    </view>
    <view class="flex-1 ml-2 slh flex">
      <view>{{ data.accessNum }}</view>
      <view class="color-success ml-3">
        <text v-if="converter.toNumber(data.accessNumInc) >= 0">+</text
        >{{ converter.toNumber(data.accessNumInc) }}
      </view>
    </view>
  </view>
</template>
