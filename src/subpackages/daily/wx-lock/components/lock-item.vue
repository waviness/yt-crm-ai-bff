<script setup lang="ts">
defineOptions(SHARED_STYLE_OPTIONS);

interface IProps {
  data: any;
}

defineProps<IProps>();

const emit = defineEmits(['click']);

const onClick = () => {
  emit('click');
};
</script>

<template>
  <view class="bg-white pa-2" @click="onClick">
    <view class="flex justify-between items-center">
      <view class="px-2 bg-main-1 color-main tag-blue rounded-2">
        {{ data.entryid }}/{{ data.entryname }}
      </view>
      <view class="font-bold">{{ data.credate }}</view>
    </view>
    <app-infor-item title="锁控编号" :content="data.taskid" class="mt-2" />
    <app-infor-item title="销售细单ID" :content="data.condtlid" class="mt-2" />
    <app-infor-item title="货品" :content="`${data.goodsid}/${data.goodsname}`" class="mt-2" />
    <app-infor-item title="客户" :content="`${data.custsetid}/${data.custsetname}`" class="mt-2" />
  </view>
</template>

<style scoped>
.tag-blue {
  display: inline-block;
  padding: 4rpx 12rpx;
  font-size: 24rpx;
  color: #2271f5;
  background: #e8f3ff;
  border-radius: 4rpx;
}
</style>
