<template>
  <view class="approve-item pa-2 bg-white mb-2" @click="onClick">
    <view class="flex align-center">
      <up-tag
        :text="`${data.entryid}/${data.entryname}`"
        size="mini"
        plain
        plainFill
        borderColor="transparent"
      ></up-tag>

      <up-tag
        class="ml-2"
        v-if="data.status === 3 || data.status === 4 || data.status === 5"
        :text="`${statusNameArr[data.status]}`"
        size="mini"
        plain
        borderColor="transparent"
      ></up-tag>
      <!-- <view class="tag-blue slh">{{ data.entryid }}/{{ data.entryname }}</view> -->
      <up-tag
        class="ml-2"
        v-else-if="
          data.status === 1 ||
          data.status === 2 ||
          data.status === 6 ||
          data.status === 7 ||
          data.status === 8
        "
        :text="`${statusNameArr[data.status]}`"
        type="success"
        size="mini"
        plain
        plainFill
        borderColor="transparent"
      ></up-tag>
      <up-tag
        v-else
        class="ml-2"
        text="未审核"
        type="warning"
        size="mini"
        plain
        plainFill
        borderColor="transparent"
      ></up-tag>
    </view>
    <app-infor-item title="创建时间" :content="data.createtime" class="mt-2"></app-infor-item>
    <app-infor-item title="总单ID" :content="data.invoiceid" class="mt-2"></app-infor-item>
    <app-infor-item title="销售合同ID" :content="data.conid" class="mt-2"></app-infor-item>
    <app-infor-item title="总价格" :content="data.totolprice" class="mt-2"></app-infor-item>
    <app-infor-item
      title="客户"
      :content="`${data.customeid}/${data.customename}`"
      class="mt-2"
    ></app-infor-item>
    <app-infor-item
      title="分支机构"
      :content="data.contactid ? `${data.contactid}/${data.contactname}` : '-'"
      class="mt-2"
    ></app-infor-item>
    <app-infor-item
      title="运输地址"
      :content="`${data.addressid}/${data.address}`"
      class="mt-2"
    ></app-infor-item>
    <app-infor-item
      title="下单人"
      :content="`${data.crmid}/${data.crmname}`"
      class="mt-2"
    ></app-infor-item>
    <app-infor-item title="备注" :content="data.memo || '-'" class="mt-2"></app-infor-item>
  </view>
</template>

<script lang="ts" setup>
const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['click']);

const statusNameArr: any = [
  '待审核',
  '已审核',
  '已生成订单',
  '审核未通过',
  '传输到erp报错',
  'ERP:作废',
  'ERP:临时',
  'ERP:正式',
  'ERP:完成',
];

const onClick = () => {
  emit('click');
};
</script>

<style lang="scss" scoped>
.approve-item {
  border-radius: 10px;
}
</style>
