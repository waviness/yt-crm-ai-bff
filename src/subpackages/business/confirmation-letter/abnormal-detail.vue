<template>
  <view class="detail">
    <app-watermark> </app-watermark>
    <view class="bg-white mb-2">
      <view class="pa-3">
        <view class="flex justify-between items-center">
          <text class="font-bold">
            {{ detailObj?.customerId }}/{{ (detailObj?.customerName || '').split('/')[0] }}
          </text>
          <text class="color-gray-5 text-12">
            {{ detailObj?.createTime?.substring(0, 16) }}
          </text>
        </view>
        <view class="mt-2 color-gray-5" v-if="detailObj?.contactId">
          {{ detailObj?.contactId }}{{ detailObj?.contactName }}
        </view>
        <view class="mt-2">
          <text class="color-gray-5">核算单元：</text>
          <text>{{ detailObj?.entryId }}/{{ detailObj?.entryName }}</text>
        </view>
        <view class="mt-2 flex justify-between items-center">
          <text class="color-gray-5">
            发起人：{{ detailObj?.userId }}/{{ detailObj?.userName }}
          </text>
        </view>
      </view>
    </view>

    <view class="bg-white mt-2" v-if="imgList.length">
      <view class="pa-3 text-14">已上传附件</view>
      <view class="px-3 pb-3 flex flex-wrap">
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
      </view>
    </view>
    <view class="bg-white mt-2" v-else>
      <app-empty description="暂无图片" />
    </view>

    <view v-if="detailObj?.status === 0 && !hasDeal && +role === 0" class="bg-white mt-2 pa-3">
      <up-textarea
        v-model="message"
        placeholder="请输入反馈信息"
        count
        autoHeight
        :maxlength="300"
      />
    </view>

    <view class="bg-white mt-2 pa-3" v-if="detailObj?.status === 1 || hasDeal">
      <view class="text-14 color-gray-5">反馈</view>
      <view class="pt-2">
        <view>
          {{ detailObj?.replyUserName }}
          <text class="color-gray-4 text-12">
            {{ (detailObj?.updateTime || '').substring(0, 16) }}
          </text>
        </view>
        <view class="text-12 mt-1">{{ detailObj?.confirmationContent }}</view>
      </view>
    </view>

    <app-bottom-actions v-if="detailObj?.status === 0 && !hasDeal && +role === 0">
      <view class="w-full flex justify-center">
        <up-button @click="cancelClick" shape="circle" text="取消" />
        <up-button class="ml-2" type="primary" shape="circle" text="提交" @click="submitClick" />
      </view>
    </app-bottom-actions>
  </view>
</template>

<script lang="ts" setup>
const imgList = ref<{ url: string }[]>([]);
const hasDeal = ref(false);
const message = ref('');

// 详情对象（与异常列表字段保持一致）
const detailObj = ref<any>({});
const role = ref(0);
const processImageList = (arr?: string[]) => {
  if (!arr || !arr.length) {
    imgList.value = [];
    return;
  }
  imgList.value = arr.map((val: string) => {
    const ext = val.split('.').pop()?.toLowerCase() || '';
    const processParam =
      ext !== 'svg' ? '?x-oss-process=image%2Fresize%2Cm_fixed%2Cw_800%2Ch_1000' : '';
    return { url: val + processParam };
  });
};

const fetchDetail = async (ccrId?: string, role: number = 0) => {
  const res = await ConfirmationLetterService.initiatedConfirmationRequest({
    ccrId,
    role,
    pageNum: 1,
    pageSize: 1,
  });
  const row = res?.data?.list?.[0] || {};
  detailObj.value = row;
  processImageList(row.imageUrlList);
};

const cancelClick = () => {
  uni.navigateBack();
};

const submitClick = async () => {
  if (!message.value.trim()) {
    uni.showToast({ title: '请输入反馈信息', icon: 'none' });
    return;
  }
  try {
    const res = await ConfirmationLetterService.handleConfirmationRequest(detailObj.value?.ccrId, {
      replyRemark: message.value,
    });
    if (String(res.code) === '200') {
      hasDeal.value = true;
      detailObj.value.updateTime = time.format(new Date(), 'yyyy-MM-dd HH:mm');
      detailObj.value.replyUserName = uni.getStorageSync('userName') || '我';
      detailObj.value.confirmationContent = message.value;
      uni.showToast({ title: res.msg || '提交成功', icon: 'success' });
    } else {
      uni.showToast({ title: res.msg || '提交失败', icon: 'none' });
    }
  } catch (e) {
    uni.showToast({ title: '提交失败', icon: 'none' });
  }
};

const previewImg = (index: number) => {
  const images = imgList.value.map(i => i.url);
  if (!images.length) return;
  uni.previewImage({ urls: images, current: index });
};

onLoad((options: any) => {
  const ccrId = options?.ccrId || options?.id;
  role.value = +(options?.role || 0);
  fetchDetail(ccrId, role.value);
});
</script>
