<script setup lang="ts">
/**
 * 冲差总单项目组件
 * 显示冲差总单的基本信息和下载附件功能
 */

import type { ImpulseInfo } from '../types';

// 定义组件属性
interface Props {
  data: ImpulseInfo;
  active: number;
}

const props = defineProps<Props>();

// 定义事件
const emit = defineEmits<{
  click: [];
  download: [files: any[]];
}>();

// 处理点击事件
const onClick = () => {
  emit('click');
};

// 处理下载事件
const download = () => {
  emit('download', props.data.files || []);
};
</script>

<template>
  <view class="bg-light-gray-2 rounded-10rpx shadow-view" @click="onClick">
    <view class="bg-white rounded-10rpx p-10">
      <view class="flex justify-between items-center">
        <app-tag :fontSize="12" :name="data.id" type="primary" />
        <view class="font-bold">{{ data.confirmDate }}(确认时间)</view>
      </view>
      <app-infor-item
        title="品种"
        :content="data.goodsId ? `${data.goodsId}/${data.goodsName}` : ''"
        class="block mt-2"
      />
      <app-infor-item title="规格" :content="data.goodsType" class="block mt-2" />
      <app-infor-item
        title="生产厂家"
        :content="data.factoryName"
        contentClass="font-bold"
        class="block mt-2"
      />
      <app-infor-item
        title="冲差截止日期"
        :content="data.endDate?.split(' ')[0]"
        contentClass="color-main-3"
        class="block mt-2"
      />
      <app-infor-item
        title="冲差说明"
        :content="data.memo"
        contentClass="color-main-3"
        class="block mt-2"
      />
      <app-infor-item
        title="创建人"
        :content="`${data.creId}/${data.creName}`"
        class="block mt-2"
      />
    </view>
    <view class="flex items-center justify-end px-10 py-2">
      <up-button
        v-if="!data.files || !data.files.length"
        size="small"
        type="info"
        shape="circle"
        disabled
        class="mr-0 px-5! w-auto!"
        @click.stop
      >
        下载附件
      </up-button>
      <up-button
        v-else
        type="primary"
        size="small"
        shape="circle"
        class="mx-0 px-5! w-auto!"
        @click.stop="download"
      >
        下载附件
      </up-button>
    </view>
  </view>
</template>
