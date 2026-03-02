<script setup lang="ts">
/**
 * 订阅提醒卡片详情组件
 * 支持订阅操作的展示和交互
 */

import type { SubscribableGoods, SubscribeArriveInfo } from '../types';

interface IProps {
  info: SubscribableGoods | SubscribeArriveInfo;
  isSearch: boolean;
  timeTitle: string;
}

const props = defineProps<IProps>();

// 定义事件
const emit = defineEmits<{
  handleClick: [{ type: number; info: any }];
}>();

// 处理按钮点击事件
const handleClick = (type: number) => {
  const actionMap: Record<number, string> = {
    1: '是否确认删除订阅',
    2: '是否确认激活订阅',
    3: '是否确认订阅到货提醒',
    4: '是否确认订阅到票提醒',
    5: '是否确认激活到货提醒',
    6: '是否确认激活到票提醒',
  };

  showModal({
    title: '确认操作',
    content: actionMap[type] || '是否确认操作',
    success: res => {
      if (res.confirm) {
        emit('handleClick', { type, info: props.info });
      }
    },
  });
};
</script>

<template>
  <view class="gray-block rounded-2 shadow-view text-xs">
    <!-- 非搜索模式 -->
    <view class="bg-white px-10 py-4 rounded-2" v-if="!isSearch">
      <app-tag class="w-fit block" :name="`${info.entryId}/${info.entryName}`" :fontSize="12" />
      <app-infor-item class="mt-10" title="品种" :content="`${info.goodsId}/${info.goodsName}`" />
      <app-infor-item class="mt-2" title="发票号" :content="info.invNo" />
      <app-infor-item class="mt-2" title="订阅时间" :content="info.subDate" />
      <app-infor-item
        v-if="info.sendFlag == 1"
        class="mt-2"
        :title="timeTitle"
        :content="info.lastSendTime"
      />
      <app-infor-item title="状态" class="block mt-2">
        <app-tag v-if="info.sendFlag == 1" name="已发送" type="success" :fontSize="12" />
        <app-tag v-if="info.sendFlag == 2" name="未发送" type="danger" :fontSize="12" />
      </app-infor-item>
    </view>

    <!-- 搜索模式 -->
    <view class="bg-white px-10 py-4 rounded-2" v-if="isSearch">
      <app-tag class="w-fit block" :name="`${info.entryId}/${info.entryName}`" :fontSize="12" />
      <app-infor-item class="mt-10" title="品种" :content="`${info.goodsId}/${info.goodsName}`" />
      <app-infor-item class="mt-2" title="厂家" :content="info.zxFactoryName" />
      <app-infor-item class="mt-2" title="规格" :content="info.goodsType" />
    </view>

    <!-- 按钮区域 -->
    <view class="flex items-center justify-end px-10 py-4">
      <up-button
        shape="circle"
        type="error"
        size="small"
        class="mr-4 px-5! w-auto!"
        v-show="!isSearch"
        @click="handleClick(1)"
      >
        删除订阅
      </up-button>
      <up-button
        shape="circle"
        :type="info.sendFlag == 1 ? 'primary' : 'info'"
        :disabled="info.sendFlag != 1"
        size="small"
        class="mx-0 px-5! w-auto!"
        v-show="!isSearch"
        @click="handleClick(2)"
      >
        激活订阅
      </up-button>
      <up-button
        shape="circle"
        size="small"
        type="primary"
        style="width: 180rpx"
        class="mr-4 px-5! w-auto!"
        :disabled="info.subGoodsType > 0"
        v-show="isSearch && info.subGoodsType != 1"
        @click="handleClick(3)"
      >
        订阅到货提醒
      </up-button>
      <up-button
        shape="circle"
        size="small"
        class="mx-0 px-5! w-auto!"
        type="primary"
        style="width: 180rpx"
        :disabled="info.subInvnoType > 0"
        v-show="isSearch && info.subInvnoType != 1"
        @click="handleClick(4)"
      >
        订阅到票提醒
      </up-button>
      <up-button
        shape="circle"
        size="small"
        type="primary"
        style="width: 180rpx"
        class="mr-4 px-5! w-auto!"
        v-show="isSearch && info.subGoodsType == 1"
        @click="handleClick(5)"
      >
        激活到货提醒
      </up-button>
      <up-button
        shape="circle"
        size="small"
        type="primary"
        class="mx-0 px-5! w-auto!"
        style="width: 180rpx"
        v-show="isSearch && info.subInvnoType == 1"
        @click="handleClick(6)"
      >
        激活到票提醒
      </up-button>
    </view>
  </view>
</template>
