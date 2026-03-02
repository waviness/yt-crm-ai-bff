<script setup lang="ts">
/**
 * 字段弹窗组件
 * 用于反馈输入和查看
 */

// 定义组件属性
interface Props {
  show: boolean;
  title: string;
  content?: string;
  placeholder?: string;
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  placeholder: '',
  readonly: false,
});

// 定义事件
const emit = defineEmits<{
  close: [];
  confirm: [content: string];
}>();

// 响应式数据
const inputText = ref(props.content);

// 监听content变化
watch(
  () => props.content,
  newVal => {
    inputText.value = newVal;
  }
);

// 确认
const confirm = () => {
  if (!inputText.value) {
    showToast('请输入反馈原因');
    return;
  }
  emit('confirm', inputText.value);
};

// 关闭
const onClose = () => {
  emit('close');
};
</script>

<template>
  <up-popup :show="show" closeable position="bottom" :round="16" @close="onClose">
    <view class="flex flex-col h-full">
      <view class="text-base font-bold text-center py-3">{{ title }}</view>
      <up-textarea v-if="!readonly" v-model="inputText" border="none" :placeholder="placeholder" />
      <view v-else class="px-4 py-2 min-h-300 text-16">
        {{ inputText }}
      </view>
      <view v-if="!readonly" class="bg-gray-10 text-right">
        <view class="text-sm font-bold color-main-3 mx-4 my-5" @click="confirm">确认</view>
      </view>
    </view>
  </up-popup>
</template>
