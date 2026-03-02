<script setup lang="ts">
import { isImage } from '@/utils/preview';

interface IProps {
  data?: any;
  isUpload?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  data: () => ({}),
  isUpload: false,
});

const emit = defineEmits<{
  download: [data: any];
  remove: [data: any];
}>();

const appStore = useAppStore();

const handlePreviewFile = (data: any) => {
  previewFile(data.fileUrl, {
    fileType: data.fileType,
    fileName: `${data.fileName}.${data.fileType}`,
  });
};

const _downloadFile = (data: any) => {
  emit('download', data);
};

const removeFile = (data: any) => {
  emit('remove', data);
};
</script>

<template>
  <view>
    <view class="flex items-center p-10 bg-white">
      <app-icon
        v-if="!isImage(data.fileType)"
        name="word"
        :size="60"
        multi
        @click="handlePreviewFile(data)"
      />
      <up-image
        v-else
        :src="data.fileUrl"
        width="60rpx"
        height="60rpx"
        @click="handlePreviewFile(data)"
      />
      <view class="flex-1 mx-2 slh color-main-3 underline" @click="handlePreviewFile(data)">
        {{ data.fileName }}.{{ data.fileType }}
      </view>
      <view v-if="isUpload" class="color-danger" @click="removeFile(data)">删除</view>
      <view v-else class="color-main-3" @click="_downloadFile(data)">点击下载</view>
    </view>
  </view>
</template>
