<template>
  <up-popup
    v-model:show="popShow"
    :closeOnClickOverlay="false"
    mode="bottom"
    :customStyle="{ height: '90vh' }"
    round="16"
    @close="cancelClick"
  >
    <app-watermark> </app-watermark>
    <view class="pa-4">
      <view class="py-2 text-14">已上传文件</view>

      <view class="py-2 flex flex-wrap">
        <up-image
          v-for="(item, index) in imageList"
          :key="index"
          fit="cover"
          class="mt-4px rounded-8px"
          width="160rpx"
          height="160rpx"
          :src="item.fileUrl"
          @click="previewImg(index)"
        />
        <app-empty v-if="!imageList.length" class="mt-7" description="暂无图片" size="200rpx" />
      </view>

      <!-- 图片上传 -->
      <view class="upload-area">
        <up-upload
          :fileList="fileList"
          :previewImage="true"
          :multiple="true"
          @delete="deletePic"
          @afterRead="afterRead"
        />
      </view>
      <app-bottom-actions class="pb-15 px-4">
        <app-action-btn class="flex-1" text="取消" @click="cancelClick" />
        <app-action-btn class="flex-1" type="primary" text="确定" @click="submitClick" />
      </app-bottom-actions>
    </view>
  </up-popup>
</template>

<script lang="ts" setup>
const varietyFollowStore = useVarietyFollowStore();
interface Props {
  outPopShow: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'submitClick', fileList: any[]): void;
  (e: 'cancelClick'): void;
}>();
const { fileList, deletePic, afterRead, getFileCount, clearFiles } = useFileUpload();
const opTopObj = computed(() => varietyFollowStore.opTopObj);
const pcObj = computed(() => varietyFollowStore.pcObj);

const popShow = ref(false);
const imageList = ref<any[]>([]);

// 提交上传
const submitClick = async () => {
  if (fileList.value.length <= 0) {
    showError('请选择图片');
    return;
  }

  uni.showLoading({
    title: '上传操作中...',
    mask: true,
  });

  try {
    const newFileList: any[] = [];
    for (let index = 0; index < fileList.value.length; index++) {
      const element = fileList.value[index];
      let processedFile = element.file || element.url;

      newFileList.push(processedFile);
    }

    // 批量上传
    const requestList = newFileList.map(
      async file =>
        await uploadSingleFile({
          file,
          name: file.name,
          type: file.type,
          url: file.url || '',
          status: file.status || 'success',
          size: file.size,
        })
    );
    const resList = await Promise.all(requestList);
    const fileUpList = resList.map((res: any) => {
      const urlParts = res.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const nameParts = fileName.split('.');
      const suffix = nameParts.length > 1 ? nameParts.pop() : '';
      return {
        fileName: fileName,
        fileType: suffix,
        fileUrl: res,
      };
    });

    emit('submitClick', fileUpList);
    uni.hideLoading();
    // 清空已选图片
    fileList.value = [];
    popShow.value = false;
  } catch (error: any) {
    uni.hideLoading();
    showError(error.msg || '上传失败');
  }
};

// 查询文件列表
const _queryFileList = async () => {
  try {
    const res = await varietyFollowService.queryFileList({
      cgtfId: opTopObj.value.cgtformId,
      cgtcId: pcObj.value.cgtcId,
    });
    if (+res.code === 200) {
      imageList.value = res.data || [];
    }
  } catch (error: any) {
    console.log(error.msg || '获取文件列表失败');
  }
};

// 取消
const cancelClick = () => {
  if (fileList.value.length > 0) {
    showModal({
      title: '提示',
      content: '确定取消上传？',
      confirmText: '确定',
      confirmColor: '#2271f5',
      cancelText: '取消',
      success: res => {
        if (res.confirm) {
          fileList.value = [];
          popShow.value = false;
          emit('cancelClick');
        }
      },
    });
  } else {
    emit('cancelClick');
    popShow.value = false;
  }
};

// 图片预览（传递索引）
const previewImg = (index: number) => {
  const files = imageList.value || [];
  const images = files.map((item: any) => item.fileUrl);
  uni.previewImage({
    urls: images.length > 0 ? images : [],
    current: index,
  });
};

onMounted(() => {
  popShow.value = props.outPopShow;
  _queryFileList();
});
</script>

<style lang="scss" scoped>
.upload-area {
  margin-top: 16rpx;
}

.common-button-footer {
  padding: 16rpx 0;

  :deep(.u-button) {
    margin: 0 8rpx;
  }
}
</style>
