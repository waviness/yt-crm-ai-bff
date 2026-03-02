<!--
  通用切换组件
  用于两个选项之间的切换
  
  使用示例：
  <app-tab-switch 
    v-model="currentTab"
    :options="[
      { label: '月', value: 0 },
      { label: '年', value: 1 }
    ]"
  />
  
  Props:
  - modelValue: 当前选中的值
  - options: 选项数组 [{ label: string, value: any }]
  - width: 切换器宽度 (可选，默认160px)
  - height: 切换器高度 (可选，默认32px)
  
  Events:
  - update:modelValue: 切换时触发
-->
<script setup lang="ts">
interface TabOption {
  label: string;
  value: any;
}

interface IProps {
  modelValue: any;
  options: TabOption[];
  fixed?: boolean;
  width?: string;
  height?: string;
  border?: boolean;
  boxShadow?: boolean;
  type?: 'primary' | 'danger' | 'warning' | 'success';
  textColor?: 'info'; // 有些时候不需要依据类型来给文字颜色 就是黑色 默认和类型一致
}

const props = withDefaults(defineProps<IProps>(), {
  width: '160px',
  height: '32px',
  fixed: true,
  boxShadow: true,
  border: false,
  type: 'primary',
});

const emit = defineEmits(['update:modelValue']);

const currentValue = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
});

const handleTabClick = (value: any) => {
  currentValue.value = value;
};
</script>

<template>
  <view
    class="app-tab-switch"
    :class="[fixed ? 'app-tab-fixed' : '', border ? `border-${type}` : '']"
  >
    <view class="tab-container" :class="boxShadow ? 'box-shadow' : ''" :style="{ width, height }">
      <view
        v-for="option in options"
        :key="option.value"
        class="tab-item"
        :class="[
          currentValue === option.value ? `active-${type}` : '',
          textColor ? `text-${textColor}` : `text-${type}`,
        ]"
        @click="handleTabClick(option.value)"
      >
        {{ option.label }}
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.app-tab-fixed {
  position: fixed;
  bottom: calc(env(safe-area-inset-bottom) + 120rpx);
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}
.box-shadow {
  box-shadow: 0 0 6px 2px rgba(209, 207, 207, 0.5);
}
.border-primary {
  border: 1px solid #3561f2;
}
.border-danger {
  border: 1px solid #f24d4d;
}
.border-warning {
  border: 1px solid #f2994a;
}
.border-success {
  border: 1px solid #27ae60;
}
.text-primary {
  color: #3561f2;
}
.text-danger {
  color: #f24d4d;
}
.text-warning {
  color: #f2994a;
}
.text-success {
  color: #27ae60;
}
.app-tab-switch {
  border-radius: 30px;
  .tab-container {
    font-size: 14px;
    background: #ffffff;
    border-radius: 30px;
    display: flex;
    align-items: center;

    .tab-item {
      flex: 1;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      &.active-primary {
        background: #3561f2;
        color: white;
        border-radius: 30px;
      }
      &.active-danger {
        background: #f24d4d;
        color: white;
        border-radius: 30px;
      }
      &.active-warning {
        background: #f2994a;
        color: white;
        border-radius: 30px;
      }
      &.active-success {
        background: #27ae60;
        color: white;
        border-radius: 30px;
      }
    }
  }
}
</style>
