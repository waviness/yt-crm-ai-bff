<script setup lang="ts">
interface Props {
  bgBlue?: boolean;
  info?: any;
}

const props = withDefaults(defineProps<Props>(), {
  bgBlue: false,
  info: () => ({}),
});

const emit = defineEmits<{
  click: [path: string];
}>();

const taskBgImage = '/static/images/task.webp';

const handleClick = () => {
  emit('click', props.info.path);
};
</script>

<template>
  <view
    class="w-[calc(50%-3px)] h-92px bg-white rounded-5px shadow-sm relative overflow-hidden"
    :class="bgBlue ? 'bg-main text-white' : ''"
    @click="handleClick"
  >
    <app-icon :name="info.icon" class="absolute top-32px left-16px text-17px" />
    <view class="absolute top-58px left-16px text-16px">{{ info.pmsName }}</view>
    <view v-if="info.loading" class="absolute top-38px right-6px">
      <up-loading-icon :color="bgBlue ? 'white' : '#3561f2'" :size="24" mode="spinner" />
    </view>
    <view
      v-else
      class="absolute top-48px right-6px rounded-8px text-10px font-bold px-5px h-12px leading-12px"
      :class="bgBlue ? 'bg-white text-main' : 'bg-main text-white'"
    >
      {{ info.ing }}
    </view>
    <view class="absolute top-64px right-6px" :class="bgBlue ? 'text-white' : 'color-gray-3'">
      {{ info.children ? info.children[0].pmsName : '' }}
    </view>
    <image v-if="!bgBlue" class="absolute -top-12px -right-10px w-148px" :src="taskBgImage" />
  </view>
</template>
