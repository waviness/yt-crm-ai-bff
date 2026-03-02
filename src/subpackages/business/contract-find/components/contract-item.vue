<script setup lang="ts">
defineOptions(SHARED_STYLE_OPTIONS);

interface IProps {
  data: any;
}

const props = defineProps<IProps>();
const emit = defineEmits<{
  click: [];
}>();

const onClick = () => {
  emit('click');
};
</script>

<template>
  <view class="bg-white p-10 rounded-8rpx" @click="onClick">
    <view class="flex justify-between items-center">
      <view class="tag-blue color-main">{{ data.conId }}</view>
      <view class="font-bold">{{ data.confirmDate }}</view>
    </view>

    <app-infor-item
      title="核算单元"
      :content="data.entryId ? `${data.entryId}/${data.entryName}` : ''"
      class="block mt-2"
    />

    <app-infor-item
      title="客户"
      :content="data.customId ? `${data.customId}/${data.customName}` : ''"
      class="block mt-2"
    />

    <app-infor-item
      title="细单条数"
      :content="String(data.dtlCount)"
      contentClass="font-bold"
      class="block mt-2"
    />

    <app-infor-item
      title="总单备注"
      :content="data.memo"
      contentClass="color-main"
      class="block mt-2"
    />
  </view>
</template>

<style lang="scss" scoped>
.tag-blue {
  display: inline-block;
  padding: 4rpx 12rpx;
  font-size: 24rpx;
  color: #2271f5;
  background: #e8f3ff;
  border-radius: 4rpx;
}
</style>
