<script setup lang="ts">
/**
 * 上传/查看图片弹窗组件
 * 支持图片上传和查看功能
 */

import type { ImpulseDetailInfo, ImpulseActionType } from '../types';
import type { UploadFileInfo } from '@/types/common';

// 定义组件属性
interface Props {
  type: ImpulseActionType; // 1上传图片 2查看图片
  data: ImpulseDetailInfo;
  loading: boolean;
}

const props = defineProps<Props>();

// 定义事件
const emit = defineEmits<{
  close: [];
  confirm: [list: any[]];
}>();

// 响应式数据
const show = ref(true);
const fileList = ref<any[]>([]);
let idxKey = 0; // 文件索引计数器

// 关闭弹窗
const onClose = () => {
  emit('close');
};

// 删除文件
const removeFile = (event: { index: number }) => {
  fileList.value.splice(event.index, 1);
};

// 确认操作
const confirm = () => {
  if (props.type === 1) {
    // 只统计上传成功的文件
    const successFiles = fileList.value.filter(file => file.status === 'success');
    if (!successFiles.length) {
      showToast('请至少上传一张图片');
      return;
    }
    emit('confirm', successFiles);
  } else {
    emit('close');
  }
};

// 图片预览（传递索引）
const previewImg = (index: number) => {
  const files = props.data.files || [];
  const images = files.map((item: any) => item.address).filter((addr: string) => addr);
  uni.previewImage({
    urls: images.length > 0 ? images : [],
    current: index,
  });
};

// 上传后处理
const afterRead = async (event: any) => {
  const files = Array.isArray(event.file) ? event.file : [event.file];
  for (const file of files) {
    // 给文件添加唯一标识
    const fileIndex = `${file.file?.name || file.name || Date.now()}-${idxKey++}`;
    file.index = fileIndex;

    // 先将文件添加到列表中（显示上传中状态）
    const fileItem = {
      ...file,
      index: fileIndex,
      status: 'uploading',
      message: '上传中...',
    };
    fileList.value.push(fileItem);

    try {
      const fileObj = file.file || file;
      const uploadFileInfo: UploadFileInfo = {
        name: fileObj.name || file.name,
        size: fileObj.size || 0,
        type: fileObj.type || '',
        url: fileObj.url || (isH5() && fileObj instanceof File ? URL.createObjectURL(fileObj) : ''),
        status: 'uploading',
        file: isH5() && fileObj instanceof File ? fileObj : undefined,
        tempFilePath: fileObj.url || fileObj.tempFilePath,
      };

      const fileUrl = await uploadSingleFile(uploadFileInfo);

      const urlParts = fileUrl.split('/');
      const fileName = urlParts[urlParts.length - 1] || uploadFileInfo.name;
      const nameParts = fileName.split('.');
      const suffix = nameParts.length > 1 ? nameParts.pop() : '';

      // 找到对应的文件项并更新状态
      const index = fileList.value.findIndex(item => item.index === fileIndex);
      if (index !== -1) {
        fileList.value[index] = {
          ...fileList.value[index],
          status: 'success',
          message: '上传成功',
          result: {
            fileName: nameParts.join('.'),
            suffix,
            fullPath: fileUrl,
          },
          fileName: nameParts.join('.'),
          fileType: suffix,
          fileUrl: fileUrl,
          url: fileUrl,
        };
      }
    } catch (err) {
      console.error('文件上传失败:', err);
      // 找到对应的文件项并更新状态
      const index = fileList.value.findIndex(item => item.index === fileIndex);
      if (index !== -1) {
        fileList.value[index] = {
          ...fileList.value[index],
          status: 'failed',
          message: err instanceof Error ? err.message : '上传失败',
        };
      }
    }
  }
};
</script>

<template>
  <up-popup :show="show" closeable position="bottom" round="16" :zIndex="998" @close="onClose">
    <view class="flex flex-col h-90vh">
      <view class="text-16 font-bold text-center py-3">
        细单图片{{ type === 1 ? '上传' : '查看' }}
      </view>
      <view class="flex-1 overflow-y-auto min-h-[calc(100%-117px)]">
        <view class="bg-white rounded-10rpx p-10 border-1 border-solid border-[#979797] mx-10">
          <view class="flex justify-between items-center">
            <app-tag :fontSize="12" :name="data.id" type="primary" />
            <view class="font-bold">{{ data.confirmDate }}</view>
          </view>
          <app-infor-item
            title="客户"
            :content="data.customId ? `${data.customId}/${data.customName}` : ''"
            class="mt-2"
          />
          <app-infor-item
            title="业务部门"
            :content="data.deptId ? `${data.deptId}/${data.deptName}` : ''"
            class="mt-2"
          />
          <app-infor-item
            title="销售数据核算单元"
            :content="data.entryId ? `${data.entryId}/${data.entryName}` : ''"
            :titleWidth="96"
            contentClass="font-bold"
            class="mt-2"
          />
          <app-infor-item v-if="data.status" title="补充说明" :content="data.desc" class="mt-2" />
          <app-infor-item
            title="备注"
            :content="data.memo"
            contentClass="color-main-2"
            class="mt-2"
          />
        </view>
        <view class="mx-4 my-3 flex flex-wrap">
          <up-image
            v-for="(item, idx) in data.files"
            :key="idx"
            fit="cover"
            class="mt-4px rounded-8px"
            :style="`margin-right: ${idx % 4 === 3 ? 0 : 'calc(25% - 160rpx)'}`"
            width="160rpx"
            height="160rpx"
            :src="item.address"
            @click="previewImg(idx)"
          />
          <app-empty
            v-if="type !== 1 && (!data.files || !data.files.length)"
            description="未上传图片"
          />
        </view>
        <view v-if="type === 1" class="mx-4">
          <up-upload :fileList="fileList" @afterRead="afterRead" @delete="removeFile" />
        </view>
      </view>
      <view class="p-4">
        <up-button type="primary" shape="circle" :loading="loading" @click="confirm">
          确认
        </up-button>
      </view>
    </view>
  </up-popup>
</template>
