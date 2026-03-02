<script setup lang="ts">
import typeChecker from '@/utils/type-checker';

defineOptions(SHARED_STYLE_OPTIONS);

interface IProps {
  title: string;
  titleIcon?: string;
  titleClass?: string;
  value?: string | number;
  valueClass?: string;
  required?: boolean;
  isLink?: boolean;
  border?: boolean;
  arrowDirection?: 'left' | 'right' | 'up' | 'down';
  clickable?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  required: false,
  isLink: false,
  border: false,
  clickable: false,
});

// 判断 value 是否被传入（通过检查 attrs 或 value 是否为 undefined）
const hasValue = computed(() => {
  // 如果 value 是 undefined，说明没有传入
  // 如果 value 是 null、空字符串等，说明传入了但为空
  return props.value !== undefined;
});
</script>

<template>
  <view class="bg-white">
    <up-cell
      :required="required"
      :arrowDirection="arrowDirection"
      :isLink="isLink"
      :border="border"
      :clickable="clickable"
      @click="() => $emit('click')"
    >
      <template #title>
        <view
          :class="['w-260 text-14 flex items-center', titleClass ? titleClass : 'color-gray-5']"
        >
          <view>{{ title }}</view>
          <up-icon v-if="titleIcon" :name="titleIcon" size="12" class="ml-2" />
        </view>
      </template>
      <template #value>
        <slot v-if="!hasValue"></slot>
        <view
          v-else
          :class="[
            'flex items-center justify-end text-14 text-right',
            valueClass ? valueClass : value ? 'color-gray-5' : 'color-gray-7',
          ]"
        >
          {{ typeChecker.isEmpty(value) ? '暂未维护' : value }}
        </view>
      </template>
      <template #right-icon>
        <slot name="right-icon"></slot>
      </template>
    </up-cell>
    <slot name="content"> </slot>
  </view>
</template>

<style lang="scss" scoped>
:deep(.u-cell__body) {
  align-items: baseline;
}
</style>
