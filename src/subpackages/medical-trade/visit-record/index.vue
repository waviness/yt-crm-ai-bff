<template>
  <view>
    <app-watermark />
    <up-sticky style="top: 0">
      <view class="bg-white py-3 text-16 flex">
        <view class="flex-1 text-center">客情概览</view>
        <view class="flex-2 flex items-center justify-center pl-4" @click="openCalendar">
          <text class="pr-4">
            {{ formatDate(dateRange[0]) }} ~ {{ formatDate(dateRange[1]) }}
          </text>
          <up-icon name="arrow-down"></up-icon>
        </view>
      </view>
    </up-sticky>

    <!-- 统计卡片 -->
    <view class="pa-2 flex gap-2">
      <view class="flex-1 pa-3 flex flex-col justify-between visit-card visit-card-primary">
        <view class="color-white flex justify-between items-center">
          <view class="flex flex-col">
            <text class="text-12 mb-2">拜访客户数</text>
            <text class="text-24 font-bold">{{ statistics.visitCstmNum }}</text>
          </view>
          <app-icon name="xingzhuangjiehe3" class="copy-content pl-1" />
        </view>
      </view>
      <view class="flex-1 pa-3 flex flex-col justify-between visit-card">
        <view class="flex justify-between items-center">
          <view class="flex flex-col">
            <text class="text-12 mb-2">接待客户数</text>
            <text class="text-24 color-main font-bold">{{ statistics.receiveCstmNum }}</text>
          </view>
          <app-icon name="a-xingzhuangjiehe11" style="color: #2271f5" />
        </view>
      </view>
      <view class="flex-1 pa-3 flex flex-col justify-between visit-card">
        <view class="flex justify-between items-center">
          <view class="flex flex-col">
            <text class="text-12 mb-2">协访客户数</text>
            <text class="text-24 color-main font-bold">{{ statistics.assistVisitCstmNum }}</text>
          </view>
          <app-icon name="a-xingzhuangjiehe22" style="color: #2271f5" />
        </view>
      </view>
    </view>

    <!-- 表格头部和内容 -->
    <view class="table-body bg-white mt-2" v-if="list.length > 0">
      <view class="table-line flex text-14 color-gray-5 align-center py-3">
        <view class="table-div-1 pl-4">业务员</view>
        <view class="table-div-2">项目</view>
        <view class="table-div-3">拜访客户数</view>
      </view>

      <view class="table-content">
        <view
          class="table-line flex text-14 color-black-2 align-center py-3"
          v-for="(item, index) in list"
          :key="index + 'visit'"
          :style="index % 2 === 0 ? 'background-color: #F7F7F7' : ''"
          @click="handleItemClick(item)"
        >
          <view class="table-div-1">{{ item.userId }}/{{ item.userName }}</view>
          <view class="table-div-2">{{ item.projectName }}</view>
          <view class="table-div-3">{{ item.upVisitNum }}</view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="white-block pb-3 mb-4 mt-2" v-else-if="!loading">
      <app-empty class="py-7" description="暂无数据" />
    </view>

    <!-- 加载状态 -->
    <view v-if="loading && !list.length" class="flex py-8 justify-center align-center">
      <up-loading-icon
        class="py-6"
        v-if="loading && !list.length"
        text="加载中"
        mode="circle"
        textSize="18"
        color="rgb(53 97 242)"
      ></up-loading-icon>
    </view>

    <!-- 分页器 -->
    <view v-if="list.length > 0" class="pa-4 bg-white">
      <up-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="handleTableChange"
      />
    </view>

    <!-- 日期选择器 -->
    <app-calendar
      ref="calendarRef"
      mode="range"
      :date="dateRangeStr"
      :start-date="minDate"
      :end-date="maxDate"
      @confirm="handleDateConfirm"
    />
  </view>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';
import { useVisitRecord } from './composables/use-visit-record';

// 添加分页相关状态
const currentPage = ref<number>(1);
const pageSize = ref<number>(8);
const total = ref<number>(0);
const loading = ref<boolean>(false);

// 从 useVisitRecord 中获取原始数据和方法（不包括分页相关）
const { dateRange, statistics, refreshing, handleItemClick, getStatistics } = useVisitRecord();

// 定义本地的列表数据
const list = ref<any[]>([]);

// 重新定义数据获取逻辑以支持手动分页
const fetchDataWithPagination = async (page: number) => {
  try {
    loading.value = true;
    const response = await SzymUserVisitService.getSzymUserProjectVisit({
      userIdList: [],
      startTime: dayjs(dateRange.value[0]).format('YYYY-MM-DD') + ' 00:00:00',
      endTime: dayjs(dateRange.value[1]).format('YYYY-MM-DD') + ' 23:59:59',
      pageNum: page,
      pageSize: pageSize.value,
    });

    // 更新列表和分页信息
    list.value = response.list || [];
    total.value = response.total || 0;
  } catch (error) {
    console.error('获取拜访记录失败:', error);
    list.value = []; // 清空列表
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 处理分页变化
const handleTableChange = async (page: number) => {
  currentPage.value = page;
  await fetchDataWithPagination(page);
};

// 重新定义初始化数据方法
const initData = async () => {
  await getStatistics();
  await fetchDataWithPagination(currentPage.value);
};

const calendarRef = ref<any>(null);

// 格式化日期
const formatDate = (date: Date) => {
  return dayjs(date).format('YYYY-MM-DD');
};

// 日期范围字符串
const dateRangeStr = computed(() => {
  return [formatDate(dateRange.value[0]), formatDate(dateRange.value[1])];
});

// 最小最大日期
const minDate = formatDate(new Date(2023, 0, 1));
const maxDate = formatDate(new Date());

// 打开日历
const openCalendar = () => {
  calendarRef.value?.open();
};

// 日期确认
const handleDateConfirm = async (dates: any) => {
  if (dates && dates.range) {
    const { before, after } = dates.range;
    dateRange.value = [new Date(before), new Date(after)];
    await getStatistics();
    // 重置到第一页并刷新数据
    currentPage.value = 1;
    await fetchDataWithPagination(1);
  }
};

onMounted(async () => {
  await initData();
});
</script>

<style lang="scss" scoped>
.visit-card {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.visit-card-primary {
  background: #2271f5;
  border: none;
}

.gap-2 {
  gap: 16rpx;
}

.table-body {
  .table-line {
    width: 100%;
  }

  .table-div-1,
  .table-div-2,
  .table-div-3 {
    flex-shrink: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .table-div-1 {
    padding-left: 32rpx;
    width: 30%;
    flex: 1;
  }

  .table-div-2,
  .table-div-3 {
    width: 35%;
    flex: 1;
    text-align: left;
  }

  .table-content {
    width: 100%;
    max-height: calc(100vh - 300px);
    overflow-y: auto;
  }
}
</style>
