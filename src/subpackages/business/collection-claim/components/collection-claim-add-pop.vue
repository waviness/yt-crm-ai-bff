<template>
  <view>
    <up-popup :show="uploadShow" mode="bottom" :round="16" :customStyle="{ height: '70vh' }">
      <view class="pa-2 bg-white">
        <view class="text-14"> 附件上传 </view>
        <up-upload
          :fileList="fileList"
          @delete="deletePic"
          @afterRead="afterRead"
          :previewFullImage="true"
          multiple
          class="block mt-2"
        />
        <app-bottom-actions>
          <view class="w-full flex justify-center">
            <up-button @click="closeClick" shape="circle" text="取消" />
            <up-button
              @click="sureRead"
              shape="circle"
              type="primary"
              class="ml-2"
              text="确认上传"
            />
          </view>
        </app-bottom-actions>
      </view>
      <view class="text-14"> 已上传附件 </view>
      <view class="flex flex-wrap">
        <up-image
          v-for="(item, index) in oldFilesList"
          :key="index"
          fit="cover"
          class="mt-4px rounded-8px"
          :style="`margin-right: ${index % 4 === 3 ? 0 : 'calc(25% - 160rpx)'}`"
          width="160rpx"
          height="160rpx"
          :src="item.imglink"
          @click="previewImg(index)"
        />
        <app-empty v-if="!oldFilesList || !oldFilesList.length" description="未上传图片" />
      </view>
    </up-popup>
  </view>
</template>

<script lang="ts" setup>
const appStore = useAppStore();
import type { CollectionClaimListItem, CollectionClaimImage } from '../types';
interface Props {
  detailObj: CollectionClaimListItem;
  outerUsestatusString: string;
  uploadShow: boolean;
  oldFilesList: CollectionClaimImage[];
}

interface Emits {
  (e: 'addSuccess'): void;
  (e: 'closeClick'): void;
}
const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const { fileList, deletePic, afterRead, getFileCount, clearFiles } = useFileUpload();
const sureRead = async () => {
  const formData = new FormData();
  if (fileList.value.length === 0) {
    uni.showToast({
      title: '请选择要上传的文件',
      icon: 'error',
    });
    return;
  }

  try {
    // 处理文件
    for (const item of fileList.value) {
      if (item?.file) {
        formData.append('imgs', item.file, item.file.name);
      }
    }

    // 添加其他必要参数
    formData.append('collectionid', props.detailObj.collectionid?.toString() || '');
    formData.append('attachmenttype', '1');
    const response = await uploadFormdataPic(
      formData,
      FORMDATA_UPLOAD_ENDPOINTS.COLLECTION_UPLOAD_APPENDIX
    );
    if (response.length === 0) {
      throw new Error('上传失败');
    } else {
      if (+props.detailObj.usestatus === 0) {
        appStore.setHadDoneOnDetail(true);
      }

      uni.showToast({
        title: '上传成功',
        icon: 'success',
      });
      clearFiles();
      emit('addSuccess');
    }
  } catch (error) {
    uni.showToast({
      title: '上传失败',
      icon: 'none',
    });
  }
};
const closeClick = () => {
  clearFiles();
  emit('closeClick');
};
// 图片预览（传递索引）
const previewImg = (index: number) => {
  const files = props.oldFilesList || [];
  const images = files
    .map((item: CollectionClaimImage) => item.imglink)
    .filter((addr: string) => addr);
  uni.previewImage({
    urls: images.length > 0 ? images : [],
    current: index,
  });
};
</script>

<style lang="scss" scoped></style>
