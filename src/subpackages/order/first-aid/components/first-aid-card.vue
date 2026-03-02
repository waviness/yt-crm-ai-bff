<template>
  <up-card
    margin="0rpx 0rpx 20rpx"
    :border="false"
    :show-head="false"
    :foot-border-top="false"
    :body-style="{ padding: '20rpx' }"
    :foot-style="{
      background: 'rgb(249, 249, 249)',
      padding: type === 0 || type === 1 ? '20rpx' : '0rpx',
    }"
  >
    <template #body>
      <view class="text-12 flex flex-col" style="padding: 0rpx" @click="onClick">
        <view class="flex flex-justify-between flex-items-center font-bold pb-2">
          <view>{{ orderItem.addtime }}</view>
          <view>{{ orderItem.entryid }}/{{ orderItem.entryname }}</view>
        </view>
        <app-infor-item
          class="mb-2"
          title="客户"
          :content="`${orderItem.erpcustomid}/${orderItem.erpcustomename}`"
        />
        <app-infor-item
          class="mb-2"
          title="品种"
          :content="`${orderItem.erpid}/${orderItem.tym}`"
        />
        <app-infor-item class="mb-2" title="规格" :content="`${orderItem.gg}`" />
        <app-infor-item class="mb-2" title="产地" :content="`${orderItem.scqy}`" />
        <view class="flex flex-items-center flex-justify-between pb-2">
          <app-infor-item class="flex-1" title="合同数量" :content="`${orderItem.erp_cgsl}`" />
          <app-infor-item class="flex-1 pl-2" title="合同价" :content="`${orderItem.cgjg}`" />
        </view>
      </view>
    </template>
    <template #foot v-show="type === 0 || type === 1">
      <up-row justify="end">
        <up-col span="3" v-if="type === 0">
          <view>
            <up-button @click="invalid(2)" shape="circle" size="small" type="error"
              >作废</up-button
            ></view
          >
        </up-col>
        <up-col span="3" v-if="type === 0">
          <view class="ml-2"
            ><up-button @click="reset" shape="circle" size="small" type="primary"
              >重置</up-button
            ></view
          >
        </up-col>
        <up-col span="3" v-if="type === 1">
          <view class="ml-2"
            ><up-button @click="invalid(0)" shape="circle" size="small" type="primary"
              >回退</up-button
            ></view
          >
        </up-col>
      </up-row>
    </template>
  </up-card>
</template>
<script setup lang="ts">
interface cardProps {
  orderItem: any;
  type?: number;
}
defineProps<cardProps>();
const emit = defineEmits<{
  click: [];
  invalid: [type: number];
  reset: [];
}>();
const onClick = () => {
  emit('click');
};
const invalid = (type: number) => {
  emit('invalid', type);
};
const reset = () => {
  emit('reset');
};
</script>
