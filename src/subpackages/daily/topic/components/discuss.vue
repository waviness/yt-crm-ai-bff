<script setup lang="ts">
defineOptions(SHARED_STYLE_OPTIONS);

interface IProps {
  title: string;
}

const props = defineProps<IProps>();

const emit = defineEmits<{
  sureComment: [value: string];
}>();

const commentMessage = ref('');

const handleSubmit = () => {
  if (!commentMessage.value.trim()) {
    showToast('请输入内容');
    return;
  }
  emit('sureComment', commentMessage.value);
  commentMessage.value = '';
};
</script>

<template>
  <view class="discuss h-full bg-white">
    <view class="text-16 font-bold text-center pt-4 pb-2">{{ title }}</view>

    <up-textarea
      v-model="commentMessage"
      class="flex-1 p-4"
      placeholder="请输入批注"
      :autoHeight="true"
      :showWordLimit="true"
      :maxlength="200"
      border="none"
    />

    <view class="footer w-full flex items-center justify-end bg-light-gray">
      <text class="color-main text-14 px-4" @click="handleSubmit">提交</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.discuss {
  display: flex;
  flex-direction: column;
}

.footer {
  height: 55px;
}

:deep(.u-textarea) {
  height: calc(100% - 100px);

  textarea {
    font-size: 28rpx;
  }
}
</style>
