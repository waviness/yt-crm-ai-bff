<script setup lang="ts">
interface IProps {
  item?: any;
}

const props = withDefaults(defineProps<IProps>(), {
  item: () => ({}),
});

const emit = defineEmits<{
  cancelClick: [];
}>();

const appStore = useAppStore();

// 响应式数据
const detailObj = ref<any>({});
const message = ref('');

// 获取发出的督办订单详情
const _getSendSynergiaOrderDetail = async () => {
  const res = await DataCenterService.getSendSynergiaOrderDetail({
    csoId: props.item.csoId,
  });

  detailObj.value = res;
};

// 获取收到的督办订单详情
const _getReceiveSynergiaOrderDetail = async () => {
  const res = await DataCenterService.getReceiveSynergiaOrderDetail({
    csoId: props.item.csoId,
  });

  const objData = res;
  // 处理标题和标签
  const titleArr = objData.orderTitle?.split(' ') || [];
  if (titleArr.length >= 2) {
    objData.useTitle = titleArr[0] + ' ' + titleArr[1];
    objData.problemLableList = titleArr.slice(2, titleArr.length);
  }
  detailObj.value = objData;
};

// 提交回执
const _receiptSynergiaOrderl = async () => {
  if (!message.value.trim()) {
    showToast('请输入回执内容');
    return;
  }

  const res = await DataCenterService.receiptSynergiaOrder({
    csoId: props.item.csoId,
    csodId: detailObj.value.csodId,
    receiptContent: message.value,
  });

  showSuccess('提交成功');
  message.value = '';

  // 重新获取详情
  if (props.item.activeNumber === 0) {
    await _getSendSynergiaOrderDetail();
  } else {
    await _getReceiveSynergiaOrderDetail();
  }

  // 记录点击
  await CommonService.crmUserClick({
    catalogType: 1,
    catalogTypeName: 'CDP',
    cucrId: '',
    menuId: '',
    menuName: '',
    menuOperation: '任务督办详情中提交按钮点击',
    operationType: 3,
  });
};

// 预览图片
const getImg = () => {
  console.log(detailObj.value);
  if (!detailObj.value.files || !detailObj.value.files.length) {
    return;
  }

  const imgList: string[] = detailObj.value.files.map((file: any) => {
    return `${appStore.domainUrl}${file.fileUrl}`;
  });

  console.log(imgList);
  uni.previewImage({
    urls: imgList,
    current: 0,
  });
};

// 取消
const cancelClick = () => {
  emit('cancelClick');
};

// 初始化
onMounted(() => {
  if (props.item.activeNumber === 0) {
    _getSendSynergiaOrderDetail();
  } else {
    _getReceiveSynergiaOrderDetail();
  }
});
</script>

<template>
  <view class="bg-light-gray h-full overflow-hidden">
    <view class="p-10 bg-white">
      <view class="flex justify-between items-center">
        <text class="text-14 flex-1">{{ detailObj.orderTitle || detailObj.useTitle }}</text>
        <text class="color-gray-4 text-right">{{ detailObj.creTime }}</text>
      </view>
      <view class="py-2 overflow-hidden flex items-center justify-between">
        <view class="flex items-center">
          <text
            v-if="item.activeNumber === 1"
            v-for="(proItem, proIndex) in detailObj.problemLableList"
            :key="'proIndex' + proIndex"
            class="color-main mr-8"
          >
            #{{ proItem }}
          </text>
        </view>
        <app-status-tag
          v-if="detailObj.emergencyLevel === 1"
          type="success"
          name="普通"
          class="mr-2"
        />
        <app-status-tag
          v-if="detailObj.emergencyLevel === 2"
          type="warning"
          name="重要"
          class="mr-2"
        />
        <app-status-tag
          v-if="detailObj.emergencyLevel === 3"
          type="danger"
          name="紧急"
          class="mr-2"
        />
      </view>
      <view class="overflow-hidden flex justify-between">
        <view class="flex items-center">
          <text
            v-if="item.activeNumber === 0"
            v-for="(proItem, proIndex) in detailObj.problemLableList"
            :key="'proIndex' + proIndex"
            class="color-main mr-8"
          >
            #{{ proItem }}
          </text>
          <text v-if="item.activeNumber === 1">发送人：{{ detailObj.sendName }}</text>
        </view>
        <view class="font-bold">{{ detailObj.useStatus === 1 ? '进行中' : '已完成' }}</view>
      </view>
    </view>
    <view class="py-10">
      <text class="inline-block w-3px h-10px bg-main-3"></text>
      <text class="ml-2 color-gray-3">补充意见</text>
    </view>
    <view class="p-10 bg-white">
      {{ detailObj.orderContent }}
    </view>
    <view class="py-10">
      <text class="inline-block w-3px h-10px bg-main-3"></text>
      <text class="ml-2 color-gray-3">附件</text>
    </view>
    <view
      v-for="(fileItem, fileIndex) in detailObj.files"
      :key="'file' + fileIndex"
      class="p-10 bg-white flex justify-between items-center"
      @click="getImg"
    >
      <view class="flex justify-between items-center">
        <app-icon name="image" size="small" multi />
        督办页面详情.png
      </view>
      <view>点击查看</view>
    </view>
    <view class="py-10">
      <text class="inline-block w-3px h-10px bg-main-3"></text>
      <text class="ml-2 color-gray-3">回执{{ item.activeNumber === 0 ? '列表' : '信息' }}</text>
    </view>
    <view v-if="item.activeNumber === 1 && detailObj.useStatus === 2" class="bg-white p-10">
      <view class="text-14 py-1">
        {{ detailObj.sendName }}
        <text class="ml-10 text-12 color-gray-3">{{ detailObj.callBackTime }}</text>
      </view>
      <view class="py-1 text-12">
        {{ detailObj.content }}
      </view>
      <view v-if="!detailObj.content" class="color-gray-3">暂无回执</view>
    </view>
    <view v-if="detailObj.sendList && item.activeNumber === 0" class="bg-white p-10">
      <view v-for="(send, sendIndex) in detailObj.sendList" :key="'send' + sendIndex">
        <view class="text-14 py-1">
          {{ send.sendUserName }}
          <text class="ml-10 text-12 color-gray-3">{{ send.callBackTime }}</text>
        </view>
        <view class="py-1 text-12">
          {{ send.content }}
        </view>
        <view v-if="!send.content" class="color-gray-3">暂无回执</view>
      </view>
    </view>
    <view v-if="item.activeNumber === 1 && detailObj.useStatus === 1" class="mt-10">
      <up-textarea v-model="message" placeholder="请输入回执" :autoHeight="true" border="none" />
    </view>
    <app-bottom-actions v-if="item.activeNumber === 1 && detailObj.useStatus === 1">
      <up-button
        plain
        type="primary"
        color="#3561f2"
        @click="cancelClick"
        shape="circle"
        class="flex-1"
      >
        取消
      </up-button>
      <app-action-btn class="flex-1" type="primary" text="提交" @click="_receiptSynergiaOrderl" />
    </app-bottom-actions>
  </view>
</template>
