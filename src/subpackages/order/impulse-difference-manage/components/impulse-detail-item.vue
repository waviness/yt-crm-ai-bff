<script setup lang="ts">
/**
 * 冲差细单项目组件
 * 显示冲差细单的详细信息和操作按钮
 */

import type { ImpulseDetailInfo, ImpulseStatus, ImpulseActionType } from '../types';

// 定义组件属性
interface Props {
  data: ImpulseDetailInfo;
  status: ImpulseStatus; // 1未处理 2已处理 3已审核
}

const props = defineProps<Props>();

// 定义事件
const emit = defineEmits<{
  submit: [type: ImpulseActionType, data: ImpulseDetailInfo];
}>();

// 处理提交操作
const submit = (type: ImpulseActionType) => {
  emit('submit', type, props.data);
};
</script>

<template>
  <view class="bg-light-gray-2 rounded-10rpx shadow-view">
    <view class="bg-white rounded-10rpx p-10">
      <view class="flex justify-between items-center">
        <app-tag :fontSize="12" :name="data.id" type="primary" />
        <view class="font-bold">{{ data.confirmDate }}</view>
      </view>
      <app-infor-item
        title="客户"
        :content="data.customId ? `${data.customId}/${data.customName}` : ''"
        class="block mt-2"
      />
      <app-infor-item
        title="业务部门"
        :content="data.deptId ? `${data.deptId}/${data.deptName}` : ''"
        class="block mt-2"
      />
      <app-infor-item
        title="销售数据核算单元"
        :content="data.entryId ? `${data.entryId}/${data.entryName}` : ''"
        :titleWidth="96"
        contentClass="font-bold"
        class="block mt-2"
      />
      <app-infor-item
        v-if="status !== 1"
        title="补充说明"
        :content="data.confirmMemo"
        class="block mt-2"
      />
      <app-infor-item
        title="备注"
        :content="data.memo"
        contentClass="color-main-2"
        class="block mt-2"
      />
    </view>
    <view v-if="status !== 1" class="flex items-center justify-end px-10 py-2">
      <up-button
        type="info"
        size="small"
        shape="circle"
        plain
        class="mr-0 px-5! w-auto!"
        @click.stop="submit(2)"
      >
        查看图片
      </up-button>
      <up-button size="small" class="mx-0 px-5! w-auto! ml-3" shape="circle" disabled
        >已提交</up-button
      >
    </view>
    <view v-else class="flex items-center justify-end px-10 py-2">
      <up-button type="primary" size="small" shape="circle" plain @click="submit(1)">
        上传图片
      </up-button>
      <up-button type="primary" size="small" shape="circle" class="block ml-3" @click="submit(3)">
        提交
      </up-button>
    </view>
  </view>
</template>
