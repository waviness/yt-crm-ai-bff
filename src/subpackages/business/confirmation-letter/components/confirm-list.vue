<template>
  <view class="bg-white card">
    <view class="pa-2" @click="toDetail">
      <view class="flex justify-between">
        <text class="font-bold">#{{ item.confirmadocid }}</text>
        <text>{{ item.credate?.substring(0, 10) }}</text>
      </view>
      <view class="flex justify-between mt-2">
        <app-infor-item :content="item.customid + '/' + item.customerName?.split('/')[0]" />
        <app-infor-item class="font-bold" :content="`核算单元 ${item.entryid}`" />
      </view>
      <app-infor-item
        class="mb-2"
        v-if="item.contactId"
        :title="`${item.contactId}/${item.contactMan}`"
      />
      <view class="flex justify-between mt-2 text-14">
        <app-infor-item class="font-bold" :content="`出函金额 ${item.total}`" />
        <view v-if="item.usestate !== 5 && item.usestate !== 6">
          <up-tag
            v-if="item.validDays < 0"
            :text="`已过期${Math.abs(item.validDays)}天`"
            type="error"
            plain
            plainFill
            borderColor="transparent"
          ></up-tag>
          <up-tag
            v-else
            :text="`距到期还剩${Math.abs(item.validDays)}天`"
            type="success"
            plain
            plainFill
            borderColor="transparent"
          ></up-tag>
        </view>
      </view>
    </view>
    <view
      v-if="item.usestate === 2 || item.usestate !== 6"
      class="bg-light-gray py-2 flex flex-row justify-end"
    >
      <up-button
        v-show="item.usestate === 2"
        :customStyle="{ width: '90px', margin: '0px 5px' }"
        size="small"
        type="primary"
        shape="circle"
        @click.stop="changeStatus"
        text="启动询证"
      ></up-button>
      <up-button
        v-show="item.usestate !== 6"
        :customStyle="{ width: '90px', margin: '0px 5px' }"
        size="small"
        type="primary"
        shape="circle"
        text="上传照片"
        @click="toDetail"
      ></up-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { ConfirmationItem } from '../types';
interface IProps {
  item: ConfirmationItem;
}
const props = defineProps<IProps>();
const emit = defineEmits(['changeStatus', 'toDetail']);
const changeStatus = () => {
  const content = '请核对财务下发的纸质材料，确认无误后点击下方"确定"！';
  showModal({
    title: '提示',
    content: content,
    confirmText: '确定',
    confirmColor: '#2271F5',
    success: res => {
      if (res.confirm) {
        const valObj = {
          confirmadocid: props.item.confirmadocid,
          statue: 4,
        };
        emit('changeStatus', valObj);
      }
      // 如果用户点击取消，不做任何操作
    },
  });
};
const toDetail = () => {
  router.push('/subpackages/business/confirmation-letter/detail', { id: props.item.confirmadocid });
  emit('toDetail');
};
</script>

<style lang="scss" scoped>
.card {
  background: #f9f9f9;
  box-shadow: 0 1px 6px 1px rgb(209 207 207 / 30%);
}
</style>
