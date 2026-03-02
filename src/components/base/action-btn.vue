<!--
  操作按钮组件
  用于各种操作场景的按钮，支持图标和不同类型
  
  使用示例：
  - 基础按钮：<app-action-btn text="确认" />
  - 主要按钮：<app-action-btn text="提交" type="primary" />
  - 带图标：<app-action-btn text="筛选" icon="🔍" type="primary" multi="false" />
  - 加载状态：<app-action-btn text="提交" type="primary" :loading="true" />
  
  Props:
  - text: 按钮文字
  - type: 按钮类型 ('primary' | 'main' | 'default' | 'plain')
  - icon: 图标（可选）
  - multi: 是否显示图标和文字（可选，默认为 true）
  - arrow: 是否显示箭头（可选，默认为 false）
  - disabled: 是否禁用（可选，默认为 false）
  - loading: 是否显示加载状态（可选，默认为 false）
  
  Events:
  - click: 点击事件
-->
<script setup lang="ts">
interface IProps {
  text: string;
  type?: 'primary' | 'main' | 'default' | 'plain';
  icon?: string;
  multi?: boolean;
  arrow?: boolean;
  disabled?: boolean;
  loading?: boolean;
  customClass?: string; // 解决小程序中类目添加失败问题
}

withDefaults(defineProps<IProps>(), {
  type: 'default',
  arrow: false,
  icon: '',
  disabled: false,
  multi: true,
  loading: false,
});

defineEmits(['click']);
</script>

<template>
  <view
    :class="[
      'h-76 line-height-10 rounded-10 text-center text-14 flex items-center justify-center border-2 border-solid',
      type === 'default'
        ? 'bg-white color-black-3 border-gray-8'
        : type === 'main'
          ? 'bg-white color-main-3 border-gray-8'
          : type === 'plain'
            ? 'bg-white color-main-3 border-main-3'
            : 'bg-main-3 color-white border-main-3',
      (disabled || loading) && 'opacity-50',
      customClass,
    ]"
    @click="disabled || loading ? () => {} : $emit('click')"
  >
    <!-- Loading 状态图标 -->
    <up-loading-icon
      v-if="loading"
      :color="type === 'primary' ? '#ffffff' : type === 'main' ? '#3561f2' : '#191919'"
      :size="20"
      mode="spinner"
      class="mr-2"
    />
    <!-- 普通图标（loading 时不显示） -->
    <app-icon
      v-else-if="icon"
      class="mr-2 flex items-center"
      :name="icon"
      size="28"
      :multi="multi"
    />
    <!-- 文字（loading 时也显示） -->
    <view class="flex items-center">{{ text }}</view>
    <!-- 箭头（loading 时不显示） -->
    <up-icon
      v-if="arrow && !loading"
      name="arrow-up"
      color="#191919"
      class="ml-2"
      size="32rpx"
    ></up-icon>
  </view>
</template>
