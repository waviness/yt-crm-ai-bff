<script setup lang="ts">
/**
 * 文件项目组件
 * 显示文件信息和下载功能
 */

import type { ImpulseFile } from '../types';

// 定义组件属性
interface Props {
  data: ImpulseFile;
}

const props = defineProps<Props>();

// 定义事件
const emit = defineEmits<{
  download: [file: ImpulseFile];
}>();

// 响应式数据
const fileType = ref('');
const fileName = ref('');

// 判断是否为图片
const isImage = (type: string) => {
  const imgTypes = ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp', 'psd', 'svg', 'tiff'];
  return imgTypes.includes(type);
};

// 下载文件
const _downloadFile = (data: ImpulseFile) => {
  emit('download', data);
};

// 页面初始化
onMounted(() => {
  const addArr = props.data.address.split('/');
  fileName.value = addArr[addArr.length - 1];
  const fileArr = fileName.value.split('.');
  fileType.value = fileArr[fileArr.length - 1];
});
</script>

<template>
  <view>
    <view class="flex items-center p-10 white-bg">
      <app-icon v-if="!isImage(fileType)" name="word" :size="60" multi />
      <up-image v-else :src="data.address" width="30" height="30" />
      <view class="flex-1 mx-2 slh">
        {{ fileName }}
      </view>
      <view class="color-main-3" @click="_downloadFile(data)">点击下载</view>
    </view>
  </view>
</template>
