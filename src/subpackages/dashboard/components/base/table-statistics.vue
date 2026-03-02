<template>
  <view class="table-div">
    <view class="white-block pb-3 mb-4" v-if="dataList.length == 0 && !filterParams.loading">
      <app-empty class="py-7" description="暂无数据" />
    </view>
    <view v-if="filterParams.loading" class="flex py-8 justify-center align-center">
      <up-loading-icon
        class="py-6"
        v-if="filterParams.loading && !dataList.length"
        text="加载中"
        mode="circle"
        textSize="18"
        color="rgb(53 97 242)"
      ></up-loading-icon>
    </view>

    <view class="table-body background-color-white mt-2">
      <view
        class="table-line flex text-14 color-gray-5 align-center py-3"
        v-if="dataList.length > 0"
      >
        <view class="table-div-1">{{ title }}ID/{{ title }}名称</view>
        <view class="table-div-2">近30天</view>
        <view class="table-div-3">近31-60天</view>
        <view class="table-div-4">近61-90天</view>
        <view class="table-div-6">最后一次销售时间</view>
      </view>

      <view class="table-content" v-if="dataList.length > 0">
        <view
          class="table-line flex text-14 color-black-2 align-center py-3"
          v-for="(data, index) in dataList"
          :key="index + 'goods'"
          :style="index % 2 === 0 ? 'background-color: #F7F7F7' : ''"
        >
          <view class="table-div-1">{{ data.id }}/{{ data.name }}</view>
          <view class="table-div-2">{{ data.count1st }}{{ salesTabValue === 1 ? '万' : '' }}</view>
          <view class="table-div-3">{{ data.count2nd }}{{ salesTabValue === 1 ? '万' : '' }}</view>
          <view class="table-div-4">{{ data.count3rd }}{{ salesTabValue === 1 ? '万' : '' }}</view>
          <view class="table-div-6">{{ data.time ? data.time : '-' }}</view>
        </view>
      </view>
    </view>

    <!-- 分页器 -->
    <view v-if="dataList.length > 0" class="pa-4 bg-white">
      <up-pagination
        :current-page="filterParams.currentPage"
        :page-size="filterParams.pageSize"
        :total="filterParams.total"
        layout="prev, pager, next"
        @current-change="handleTableChange"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { LoseTableData, CommonFilterParams } from '../../types';
interface IProps {
  dataList: LoseTableData[];
  filterParams: CommonFilterParams;
  title: string;
  salesTabValue?: number;
}
defineProps<IProps>();
const emit = defineEmits(['update:page']);
const handleTableChange = (page: number) => {
  emit('update:page', page);
};
</script>

<style lang="scss" scoped>
.table-div {
  height: calc(100% - 101px);
  overflow-y: scroll;
}

.table-body {
  overflow-x: scroll;

  .table-line {
    width: fit-content;
  }

  .table-div-1,
  .table-div-2,
  .table-div-3,
  .table-div-4,
  .table-div-5 {
    flex-shrink: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    margin-right: 33px;
  }

  .table-div-1 {
    padding-left: 32rpx;
    width: 270rpx;
  }

  .table-div-2,
  .table-div-3,
  .table-div-4 {
    width: 140rpx;
    text-align: right;
  }

  .table-div-5 {
    width: 340rpx;
  }

  .table-div-6 {
    width: 330rpx;
    margin-right: 0;
    white-space: nowrap;
  }

  .table-content {
    width: 1356rpx;
    height: calc(100% - 88rpx);
  }
}
</style>
