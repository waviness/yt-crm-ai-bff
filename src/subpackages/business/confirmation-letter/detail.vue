<template>
  <view>
    <app-watermark> </app-watermark>
    <view class="pa-2 bg-white" v-if="inquiryDetailObj">
      <view class="text-14">
        {{ inquiryDetailObj.customid + '/' + inquiryDetailObj.customerName?.split('/')[0] }}
      </view>
      <view class="flex justify-between mt-2" hover-class="none" hover-stop-propagation="false">
        <app-infor-item title="总单编号：" :content="inquiryDetailObj.confirmadocid" />
        <app-infor-item class="font-bold" :content="`核算单元 ${inquiryDetailObj.entryid}`" />
      </view>
      <view class="mt-2 flex justify-between items-center">
        <app-infor-item title="出函金额：" :content="inquiryDetailObj.total" />
        <view v-if="inquiryDetailObj.usestate !== 5 && inquiryDetailObj.usestate !== 6">
          <up-tag
            v-if="inquiryDetailObj.validDays < 0"
            :text="`已过期${Math.abs(inquiryDetailObj.validDays)}天`"
            type="error"
            plain
            plainFill
            borderColor="transparent"
          ></up-tag>
          <up-tag
            v-else
            :text="`距到期还剩${Math.abs(inquiryDetailObj.validDays)}天`"
            type="success"
            plain
            plainFill
            borderColor="transparent"
          ></up-tag>
        </view>
      </view>
      <app-infor-item
        v-if="inquiryDetailObj.customsuredate"
        class="mt-2"
        title="业务处理时间："
        :content="inquiryDetailObj.customsuredate"
      />
      <view class="color-red tips"
        >请核对财务下发的纸质材料，确认无误后点击下方 "确定"！当前操作默认点击 "启动询证"</view
      >
    </view>
    <view class="my-2" v-if="inquiryDetailObj">
      <app-cell title="询函结果">
        <up-radio-group
          v-if="inquiryDetailObj.usestate !== 6"
          name="radio"
          v-model="inquiryDetailObj.returnFlag"
          placement="row"
        >
          <up-radio :name="1" label="一致"></up-radio>
          <up-radio :name="2" label="有异"></up-radio>
          <up-radio :name="3" label="报错"></up-radio>
        </up-radio-group>
        <view
          v-else
          :class="
            inquiryDetailObj.returnFlag === 1
              ? 'color-success'
              : inquiryDetailObj.returnFlag === 2
                ? 'color-warning'
                : inquiryDetailObj.returnFlag === 3
                  ? 'color-red'
                  : ''
          "
        >
          {{
            inquiryDetailObj.returnFlag === 1
              ? '一致'
              : inquiryDetailObj.returnFlag === 2
                ? '有异'
                : inquiryDetailObj.returnFlag === 3
                  ? '报错'
                  : ''
          }}
        </view>
      </app-cell>
    </view>
    <view class="pa-2 bg-white" v-if="inquiryDetailObj && inquiryDetailObj.usestate !== 6">
      <view class="text-14"> 附件上传 </view>
      <up-upload
        :fileList="fileList"
        @delete="deletePic"
        @afterRead="afterRead"
        :previewFullImage="true"
        multiple
        class="block mt-2"
      />
    </view>
    <view class="pa-4 bg-white my-3">
      <view class="text-14"> 已上传附件 </view>
      <view class="flex flex-wrap">
        <up-image
          v-for="(item, index) in imgList"
          :key="index"
          fit="cover"
          class="mt-4px rounded-8px"
          :style="`margin-right: ${index % 4 === 3 ? 0 : 'calc(25% - 160rpx)'}`"
          width="160rpx"
          height="160rpx"
          :src="item.url"
          @click="previewImg(index)"
        />
        <app-empty v-if="!imgList || !imgList.length" description="未上传图片" />
      </view>
    </view>
    <app-bottom-actions v-if="inquiryDetailObj && inquiryDetailObj.usestate !== 6">
      <view class="w-full flex justify-center">
        <up-button @click="cancelClick" shape="circle" text="取消" />
        <up-button @click="sureRead" shape="circle" type="primary" class="ml-2" text="确认上传" />
      </view>
    </app-bottom-actions>
  </view>
</template>

<script lang="ts" setup>
import type { ConfirmationItem } from './types';
import { uploadFormdataPic } from '@/utils/upload';
const appStore = useAppStore();
// 使用文件上传功能
const { fileList, deletePic, afterRead, getFileCount, clearFiles } = useFileUpload();

const inquiryDetailObj = ref<ConfirmationItem>();

const fetchDetail = async (confirmadocid: string) => {
  const response = await ConfirmationLetterService.getConfirmationRequestList({
    confirmadocid: confirmadocid,
    pageNum: 1,
    pageSize: 1,
  });
  inquiryDetailObj.value = response.data.list[0];
  const userId: any = uni.getStorageSync('userId');
  if (
    inquiryDetailObj.value?.filledReasonList &&
    inquiryDetailObj.value.filledReasonList.some((val: any) => val.userId === userId)
  ) {
    inquiryDetailObj.value.filledReasonFlag = true;
  }
  fetchPictures();
};
let imgList = ref<any[]>([]);
const pdfList = ref<any[]>([]);
const fetchPictures = async () => {
  const response = await ConfirmationLetterService.downloadConfirmationRequestPictures({
    confirmadocid: inquiryDetailObj.value?.confirmadocid,
    entryId: inquiryDetailObj.value?.entryid,
    customerId: inquiryDetailObj.value?.customid,
    settleAccountsMonth: inquiryDetailObj.value?.usemm,
  });
  // 重置数据
  imgList.value = [];
  pdfList.value = [];
  const middleImgList: string[] = [];

  // 处理返回的数据
  response.data.forEach((val: string) => {
    const extension = val.split('.').pop()?.toLowerCase() || '';
    if (extension !== 'pdf') {
      middleImgList.push(val);
    } else {
      pdfList.value.push(val);
    }
  });

  // 转换图片列表
  imgList.value = middleImgList.map((val: string) => {
    const extension = val.split('.').pop()?.toLowerCase() || '';
    const processParam =
      extension !== 'svg' ? '?x-oss-process=image%2Fresize%2Cm_fixed%2Cw_800%2Ch_1000' : '';

    return {
      url: val + processParam,
    };
  });
};
// 图片预览（传递索引）
const previewImg = (index: number) => {
  const files = imgList.value || [];
  const images = files.map((item: any) => item.url).filter((addr: string) => addr);
  uni.previewImage({
    urls: images.length > 0 ? images : [],
    current: index,
  });
};
const cancelClick = () => {
  uni.navigateBack();
};
const sureRead = async () => {
  if (!inquiryDetailObj.value) return;
  if (getFileCount() === 0) {
    uni.showToast({
      title: '请选择要上传的图片',
      icon: 'error',
    });
    return;
  }
  if (!inquiryDetailObj.value.returnFlag) {
    uni.showToast({
      title: '请选择询函结果',
      icon: 'error',
    });
    return;
  }
  const formData = new FormData();
  try {
    // 处理文件
    for (const item of fileList.value) {
      if (item?.file) {
        formData.append('imageList', item.file, item.file.name);
      }
    }

    // 添加其他必要参数
    formData.append('confirmadocid', inquiryDetailObj.value.confirmadocid);
    formData.append('customerId', inquiryDetailObj.value.customid);
    formData.append('entryId', inquiryDetailObj.value.entryid);
    formData.append('settleAccountsMonth', inquiryDetailObj.value.usemm || '');
    formData.append('createId', inquiryDetailObj.value.cremanid || '');
    formData.append('salesPersonName', inquiryDetailObj.value.salesPersonName || '');
    formData.append('replyFlag', inquiryDetailObj.value.returnFlag?.toString() || '');
    const response = await uploadFormdataPic(
      formData,
      FORMDATA_UPLOAD_ENDPOINTS.CONFIRMATION_LITTER
    );
    console.log(response);
    if (response.length === 0) {
      throw new Error('上传失败');
    } else {
      if (+inquiryDetailObj.value.usestate === 2 || +inquiryDetailObj.value.usestate === 4) {
        appStore.setHadDoneOnDetail(true);
      }
      uni.showToast({
        title: '上传成功',
        icon: 'success',
      });
      // 清空文件列表
      clearFiles();
      fetchDetail(inquiryDetailObj.value.confirmadocid);
    }
  } catch (error) {
    uni.showToast({
      title: '上传失败',
      icon: 'none',
    });
  }
};

onLoad(options => {
  fetchDetail(options?.id || options?.confirmadocid || options?.confirmadocId);
});
</script>

<style lang="scss" scoped>
:deep(.u-radio-group) {
  flex: 2 !important;
}
</style>
