<template>
  <view class="card mb-2" @click="toDetail">
    <view class="pa-2 bg-white flex flex-col">
      <view class="flex justify-between mb-2">
        <text class="font-bold">#{{ item.accdocid }}</text>
        <text>{{ item.createtime?.substring(0, 10) }}</text>
      </view>

      <view class="flex justify-between mb-2">
        <app-infor-item
          v-if="item.customid"
          :content="item.customid + '/' + item.customname?.split('/')[0]"
        />
        <app-infor-item v-else content="暂无客户信息" />
        <app-infor-item class="font-bold" :content="`核算单元 ${item.entryid}`" />
      </view>
      <app-infor-item
        v-if="item.contactid"
        class="mb-2"
        title="分支机构"
        :content="`${item.contactid}/${item.contactman}`"
      />
      <app-infor-item class="mb-2" title="对方户名" :content="item.ordercustomname" />
      <app-infor-item class="mb-2" title="金额" :content="item.total" />
      <view class="flex justify-between mb-2">
        <view class="text-14"> 未认领金额&nbsp;{{ item.notaccmoney }} </view>
        <up-tag :text="`${item.presalerid}/${item.presalername}`" plain> </up-tag>
      </view>
      <app-infor-item class="mb-2" title="备注" :content="item.description" />
    </view>
    <view class="bg-light-gray py-2 flex flex-row justify-end">
      <up-button
        @click.stop="toDetail"
        :customStyle="{ width: '90px', margin: '0px 5px' }"
        size="small"
        type="primary"
        shape="circle"
        :text="activeTab === 0 ? '上传照片' : '查看照片'"
      ></up-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { CollectionClaimListItem } from '../types';
interface IProps {
  item: CollectionClaimListItem;
  activeTab: number;
}
const props = defineProps<IProps>();

const emit = defineEmits(['toDetail']);

const toDetail = () => {
  emit('toDetail');
};
</script>

<style lang="scss" scoped>
.card {
  background: #f9f9f9;
  box-shadow: 0 1px 6px 1px rgb(209 207 207 / 30%);
}
</style>
