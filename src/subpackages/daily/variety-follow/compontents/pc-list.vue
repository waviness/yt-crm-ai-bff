<template>
  <view>
    <view class="header px-10 py-4"> 请选择 <text class="color-main">批次</text>进入 </view>
    <view
      class="flex justify-between items-center pa-2 bg-white mb-2"
      v-for="(batch, index) in batchList"
      :key="`batch-${batch.cgtcId}-${index}`"
      @click="cellClick(batch)"
    >
      <view class="flex flex-col">
        <text class="text-16 pb-2">{{ batch.cgtcId }}/{{ batch.configName }}</text>
        <text class="text-12"
          >{{ batch.startTime.slice(0, 10) }} - {{ batch.endTime.slice(0, 10) }}</text
        ></view
      >
      <up-icon name="arrow-right" size="20" color="#969799" />
    </view>
  </view>
</template>

<script lang="ts" setup>
const emit = defineEmits<{
  (e: 'batchChangeClick', val: any): void;
}>();

const batchList = ref<any[]>([]);

// 获取批次列表
const _queryBatchList = async () => {
  try {
    const res = await varietyFollowService.queryBatchList({
      pageNum: 1,
      pageSize: 100,
    });

    if (+res.code === 200) {
      batchList.value = res.data.list || [];

      // 如果只有一个批次，自动选择
      if (res.data.list.length === 1) {
        emit('batchChangeClick', res.data.list[0]);
      }
    }
  } catch (error: any) {
    showError(error.msg || '获取批次列表失败');
  }
};

// 点击批次
const cellClick = (val: any) => {
  emit('batchChangeClick', val);
};

onMounted(() => {
  _queryBatchList();
});
</script>

<style lang="scss" scoped></style>
