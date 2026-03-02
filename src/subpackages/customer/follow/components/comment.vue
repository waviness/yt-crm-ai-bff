<script setup lang="ts">
interface IProps {
  commentShow: boolean;
}

const props = defineProps<IProps>();

const emit = defineEmits<{
  closeClick: [];
  sureComment: [value: string];
}>();

const innCommentShow = ref(false);
const commentMessage = ref('');

watch(
  () => props.commentShow,
  newVal => {
    innCommentShow.value = newVal;
    if (!newVal) {
      commentMessage.value = '';
    }
  },
  { immediate: true }
);

const closeClick = () => {
  emit('closeClick');
};

const sureComment = () => {
  if (!commentMessage.value.trim()) {
    showToast('请输入批注内容');
    return;
  }
  emit('sureComment', commentMessage.value);
  commentMessage.value = '';
};
</script>

<template>
  <up-popup :show="innCommentShow" mode="bottom" :round="16" @close="closeClick">
    <view class="text-16px font-bold text-center pt-4 pb-2">批注</view>
    <up-textarea v-model="commentMessage" class="h-400" placeholder="请输入批注" border="none" />
    <view class="h-55px w-full flex items-center justify-end bg-gray-12">
      <text class="color-main text-14px px-4" @click="sureComment">提交</text>
    </view>
  </up-popup>
</template>
