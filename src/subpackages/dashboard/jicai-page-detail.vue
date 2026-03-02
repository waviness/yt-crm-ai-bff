<template>
  <view class="page-container">
    <!-- Sticky Header -->
    <view class="sticky-header">
      <view class="header">
        <view class="header-center">
          <text class="dept-name">{{ type }}-第{{ batch }}批</text>
        </view>
        <view class="time-selector" @click="calendarClick">
          <text class="time-text">{{
            time.format(new Date(dashboardStore.dateTime), 'yyyy-MM-dd')
          }}</text>
          <up-icon name="arrow-down" size="14"></up-icon>
        </view>
      </view>

      <!-- Search Bar -->
      <view class="search-container">
        <view class="search-wrapper">
          <uni-icons type="search" size="16" color="#969799" />
          <input
            v-model="searchValue"
            class="search-input"
            placeholder="搜索"
            placeholder-style="color: #C8C9CC"
            @input="onSearchInput"
          />
        </view>
      </view>
    </view>

    <!-- Calendar -->
    <app-calendar ref="calendarRef" :endDate="maxDate" :date="maxDate" @confirm="calendarConfirm" />

    <!-- Summary Card -->
    <view class="content-wrapper">
      <view class="card-container">
        <view class="summary-card">
          <view class="card-title">
            <text class="title-text">集采相关品规</text>
          </view>

          <view v-if="cdloading" class="card-loading">
            <uni-load-more status="loading" />
          </view>

          <template v-else>
            <view class="card-content">
              <text class="title-text">集采相关品规</text>
              <text class="sales-amount">{{ cardData.sale || '--' }}万元</text>
              <view class="growth-indicator">
                <text class="growth-text" :class="cardData.saleTb > 0 ? 'text-up' : 'text-down'">
                  {{ cardData.saleTb > 0 ? '+' : '' }}{{ cardData.saleTb }}%
                </text>
              </view>
            </view>

            <!-- Winning Products Progress -->
            <view class="progress-section">
              <view class="progress-container">
                <view class="progress-track">
                  <view class="progress-fill" :style="{ width: cardData.winningProgress + '%' }" />
                </view>
              </view>
              <view class="summary-item">
                <text class="summary-label">中标品种</text>
                <text class="summary-value">{{ cardData.bidSale }}万元</text>
                <text
                  class="summary-growth"
                  :class="cardData.bidSaleTb > 0 ? 'text-up' : 'text-down'"
                >
                  {{ cardData.bidSaleTb > 0 ? '+' : '' }}{{ cardData.bidSaleTb }}%
                </text>
              </view>
            </view>

            <!-- Non-winning Products Progress -->
            <view class="progress-section">
              <view class="progress-container">
                <view class="progress-track">
                  <view
                    class="progress-fill"
                    :style="{ width: cardData.nonWinningProgress + '%' }"
                  />
                </view>
              </view>
              <view class="summary-item">
                <text class="summary-label">备选和未中选品种</text>
                <text class="summary-value">{{ cardData.noBidSale }}万元</text>
                <text
                  class="summary-growth"
                  :class="cardData.noBidSaleTb > 0 ? 'text-up' : 'text-down'"
                >
                  {{ cardData.noBidSaleTb > 0 ? '+' : '' }}{{ cardData.noBidSaleTb }}%
                </text>
              </view>
            </view>
          </template>
        </view>
      </view>

      <!-- Table Section -->
      <view class="table-section bg-white">
        <view class="white-block pb-3 mb-4" v-if="listItems.length === 0 && !filterParams.loading">
          <app-empty class="py-7" description="暂无数据" />
        </view>
        <view v-if="filterParams.loading" class="flex py-8 justify-center align-center">
          <up-loading-icon
            class="py-6"
            v-if="filterParams.loading && !listItems.length"
            text="加载中"
            mode="circle"
            textSize="18"
            color="rgb(53 97 242)"
          ></up-loading-icon>
        </view>

        <view class="table-body background-color-white mt-2">
          <view
            class="table-line flex text-14 color-gray-5 align-center py-3"
            v-if="listItems.length > 0"
          >
            <view class="table-div-1">品种ID/品种名称</view>
            <view class="table-div-2">集采中标状态</view>
            <view class="table-div-3">产地</view>
            <view class="table-div-4">{{
              salesTabValue === 1 ? '销售实绩(万元)' : '销售数量'
            }}</view>
            <view class="table-div-5">{{
              salesTabValue === 1 ? '较同期净增长(万元)' : '较同期净增长数量'
            }}</view>
            <view class="table-div-6">同比增幅</view>
          </view>

          <view class="table-content" v-if="listItems.length > 0">
            <view
              class="table-line flex text-14 color-black-2 align-center py-3"
              v-for="(item, index) in listItems"
              :key="index + 'jicai'"
              :style="index % 2 === 0 ? 'background-color: #F7F7F7' : ''"
            >
              <view class="table-div-1">{{ item.goodsId }}/{{ item.goodsName }}</view>
              <view class="table-div-2">{{ item.bidFlag }}</view>
              <view class="table-div-3">{{ item.factoryName }}</view>
              <view class="table-div-4">{{ item.sale }}</view>
              <view class="table-div-5">{{ item.saleUp }}</view>
              <view class="table-div-6">{{ item.saleTb }}%</view>
            </view>
          </view>
        </view>

        <view v-if="listItems.length > 0" class="pa-4 bg-white">
          <up-pagination
            :current-page="filterParams.currentPage"
            :page-size="filterParams.pageSize"
            :total="filterParams.total"
            layout="prev, pager, next"
            @current-change="handleTableChange"
          />
        </view>
      </view>
    </view>

    <view class="footer-actions">
      <view class="action-left">
        <app-fix-btn @click="orderTypeFlag = true" text="排序方式" />
      </view>
      <view class="action-right">
        <view class="toggle-wrapper">
          <view
            class="toggle-item"
            :class="{ 'toggle-active': salesTabValue === 1 }"
            @click="salesTabClick(1)"
          >
            <text class="toggle-text">销售额</text>
          </view>
          <view
            class="toggle-item"
            :class="{ 'toggle-active': salesTabValue === 2 }"
            @click="salesTabClick(2)"
          >
            <text class="toggle-text">销售数量</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Sort Action Sheet -->
    <up-action-sheet
      :actions="orderList"
      @close="orderTypeFlag = false"
      @select="orderSelect"
      :cancelText="'取消'"
      :show="orderTypeFlag"
    ></up-action-sheet>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { DashboardService } from '@/api/dashboard';
import time from '@/utils/time';

const { formatTenThousand } = useFormatter();
const dashboardStore = useDashboardStore();

// Route params
const type = ref<string>('');
const batch = ref<string>('');
const deptId = ref<string>('');

// UI State
const searchValue = ref<string>('');
const calendarRef = ref<any>();
const maxDate = ref(time.format(time.add(new Date(), 0, 'year'), time.FORMATS.ISO_DATE));

// Data State
const cardData = ref<any>({});
const cdloading = ref<boolean>(false);
const listItems = ref<any[]>([]);
const salesTabValue = ref<number>(1);

// Pagination
const filterParams = ref({
  total: 0,
  currentPage: 1,
  pageSize: 10,
  loading: false,
});

// Sort options - 注意这里的 orderType 值需要根据实际接口调整
const sortTypes = ref([
  { name: '销售实绩升序', orderColumn: 'salesAmount', orderType: 1 },
  { name: '销售实绩倒序', orderColumn: 'salesAmount', orderType: 2, color: '#2271F5' },
  { name: '较同期净增升序', orderColumn: 'periodCompareNetIncrease', orderType: 3 },
  { name: '较同期净增倒序', orderColumn: 'periodCompareNetIncrease', orderType: 4 },
  { name: '同比增幅升序', orderColumn: 'periodComparePercent', orderType: 5 },
  { name: '同比增幅倒序', orderColumn: 'periodComparePercent', orderType: 6 },
]);

const selectedSort = ref(sortTypes.value[1]);

// Action sheet state
const orderTypeFlag = ref<boolean>(false);
const orderList = ref(
  sortTypes.value.map((item: any, idx: number) => ({ id: idx, name: item.name }))
);

watch(
  () => sortTypes.value,
  () => {
    orderList.value = sortTypes.value.map((item: any, idx: number) => ({
      id: idx,
      name: item.name,
    }));
  }
);

const orderSelect = (action: any) => {
  const idx = action?.id;
  const selected = sortTypes.value[idx];
  if (selected) {
    onSortConfirm(selected);
  }
};

// Methods
const salesTabClick = (val: number) => {
  salesTabValue.value = val;
  filterParams.value.currentPage = 1;
  getJiCaiGoodsList();
};

const onSearchInput = () => {
  filterParams.value.currentPage = 1;
  getJiCaiGoodsList();
};

const fetchCardData = async () => {
  try {
    cdloading.value = true;
    const res = await DashboardService.queryJiCaiList({
      date: dashboardStore.dateTime,
      deptId: deptId.value,
      flag: 1,
      type: type.value,
    });
    cdloading.value = false;

    if (res.code === '200' && res.data) {
      const targetBatch = `第${batch.value}批次`;
      const matchedItem = res.data.find((item: any) => item.batch === targetBatch);

      if (matchedItem) {
        cardData.value = {
          batchName: matchedItem.batch,
          sale: formatTenThousand(matchedItem.sale),
          saleTb: (matchedItem.saleTb * 100).toFixed(2),
          bidSale: formatTenThousand(matchedItem.bidSale),
          bidSaleTb: (matchedItem.bidSaleTb * 100).toFixed(2),
          noBidSale: formatTenThousand(matchedItem.noBidSale),
          noBidSaleTb: (matchedItem.noBidSaleTb * 100).toFixed(2),
          winningProgress:
            matchedItem.sale > 0
              ? ((matchedItem.bidSale / matchedItem.sale) * 100).toFixed(1)
              : '0',
          nonWinningProgress:
            matchedItem.sale > 0
              ? ((matchedItem.noBidSale / matchedItem.sale) * 100).toFixed(1)
              : '0',
        };
      }
    }
  } catch (error) {
    console.error('获取卡片数据失败:', error);
    cdloading.value = false;
  }
};

const getJiCaiGoodsList = async () => {
  filterParams.value.loading = true;
  try {
    listItems.value = [];
    const res = await DashboardService.queryJiCaiGoodsList({
      batch: '第' + batch.value + '批次',
      date: dashboardStore.dateTime,
      deptId: deptId.value,
      keyword: searchValue.value,
      flag: 1,
      order: selectedSort.value.orderType,
      pageNum: filterParams.value.currentPage,
      pageSize: filterParams.value.pageSize,
      type: type.value,
      showType: salesTabValue.value,
    });

    if (res.code === '200' && res.data) {
      listItems.value = res.data.list.map((item: any) => ({
        goodsId: item.goodsId,
        goodsName: item.goodsName,
        bidFlag: item.bidFlag,
        factoryName: item.factoryName || '-',
        sale:
          item.sale != null
            ? salesTabValue.value === 1
              ? formatTenThousand(item.sale)
              : item.sale
            : '-',
        saleUp:
          item.saleUp != null
            ? salesTabValue.value === 1
              ? formatTenThousand(item.saleUp)
              : item.saleUp
            : '-',
        saleTb: item.saleTb != null ? (item.saleTb * 100).toFixed(1) : '-',
      }));

      filterParams.value.total = res.data.total || 0;
    }
  } catch (error) {
    console.error('获取表格数据失败:', error);
  } finally {
    filterParams.value.loading = false;
  }
};

const handleTableChange = (page: number) => {
  filterParams.value.currentPage = page;
  getJiCaiGoodsList();
};

const onSortConfirm = (selected: any) => {
  sortTypes.value.forEach(item => {
    item.color = '';
  });

  const selectedItem = sortTypes.value.find(
    item =>
      item.name === selected.name &&
      item.orderColumn === selected.orderColumn &&
      item.orderType === selected.orderType
  );
  if (selectedItem) {
    selectedItem.color = '#2271F5';
  }

  selectedSort.value = selected;
  orderTypeFlag.value = false;
  filterParams.value.currentPage = 1;
  getJiCaiGoodsList();
};

const calendarClick = () => {
  calendarRef.value?.open();
};

const calendarConfirm = ({ fulldate }: { fulldate: string }) => {
  const dateStr = time.format(new Date(fulldate), 'yyyy-MM-dd');
  dashboardStore.setDateTime(dateStr);
  fetchCardData();
  getJiCaiGoodsList();
};

// Lifecycle
onLoad(async (options: any) => {
  if (options) {
    type.value = options.type;
    batch.value = options.batch;
    deptId.value = options.deptId;
    console.log('集采详情页参数：', { type: type.value, batch: batch.value, deptId: deptId.value });
    await fetchCardData();
    await getJiCaiGoodsList();
  }
});

onMounted(() => {
  console.log('onMounted：当前部门ID：', deptId.value);
});
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: #fff;
  padding-bottom: 100px;
}

/* ========== Sticky Header ========== */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #fff;
}

.header {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 4px 24px 0 rgb(100 101 102 / 8%);
}

.header-center {
  flex: 1;
  display: flex;
}

.dept-name {
  font-size: 16px;
  font-weight: bold;
  color: #323233;
}

.time-selector {
  display: flex;
  align-items: center;
}

.time-text {
  font-size: 16px;
  font-weight: bold;
  color: #969799;
}

/* ========== Search Bar ========== */
.search-container {
  padding: 8px 16px;
  background-color: #fff;
}

.search-wrapper {
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 12px;
  background-color: #f7f8fa;
  border-radius: 18px;
}

.search-input {
  flex: 1;
  margin-left: 8px;
  font-size: 14px;
  color: #323233;
}

/* ========== Content ========== */
.content-wrapper {
  background-color: #f5f5f7;
}

/* ========== Summary Card ========== */
.card-container {
  padding: 12px;
  background-color: #fff;
}

.summary-card {
  background-color: #fff;
  border: 1px solid #c8c9cc;
  border-radius: 30px;
  overflow: hidden;
  padding: 16px 14px;
}

.card-title {
  display: none;
}

.card-loading {
  padding: 32px 0;
  display: flex;
  justify-content: center;
}

.card-content {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f5f7;
  border-radius: 12px;
  margin-bottom: 12px;
  gap: 12px;
}

.title-text {
  font-size: 14px;
  color: #323233;
  flex-shrink: 0;
}

.sales-amount {
  font-size: 14px;
  font-weight: bold;
  color: #3561f2;
  flex: 1;
  text-align: right;
}

.growth-indicator {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.icon-up,
.icon-down {
  width: 14px;
  height: 14px;
}

.icon-up {
  background: url('~@/static/images/rank-up.png') center/contain no-repeat;
}

.icon-down {
  background: url('~@/static/images/rank-down.png') center/contain no-repeat;
}

.growth-text {
  font-size: 14px;
  font-weight: bold;
}

.text-up {
  color: #00a870;
}

.text-down {
  color: #f56c6c;
}

.progress-section {
  margin-bottom: 8px;
  padding: 0 12px;
}

.progress-container {
  margin-bottom: 8px;

  //   padding: 0 12px;
}

.progress-track {
  height: 8px;
  background-color: #ebedf0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #3561f2;
  transition: width 0.3s;
}

.summary-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  gap: 12px;
}

.summary-label {
  flex-shrink: 0;
  color: #323233;
}

.summary-value {
  font-size: 14px;
  font-weight: bold;
  color: #3561f2;
  flex: 1;
  text-align: right;
}

.summary-growth {
  font-size: 14px;
  font-weight: bold;
  flex-shrink: 0;
}

/* ========== Table ========== */
.table-section {
  margin: 8px 0px;
  padding: 0 8px;
}

.table-body {
  overflow-x: scroll;
  border-radius: 8px;

  .table-line {
    width: fit-content;
  }

  .table-div-1,
  .table-div-2,
  .table-div-3,
  .table-div-4,
  .table-div-5,
  .table-div-6 {
    flex-shrink: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    margin-right: 33px;
  }

  .table-div-1 {
    padding-left: 16rpx;
    width: 270rpx;
  }

  .table-div-2 {
    width: 150rpx;
  }

  .table-div-3 {
    width: 200rpx;
  }

  .table-div-4 {
    width: 220rpx;
    text-align: right;
  }

  .table-div-5 {
    width: 260rpx;
    text-align: right;
  }

  .table-div-6 {
    flex-shrink: 0;
    width: 200rpx;
    text-align: right;
    margin-right: 0;
    white-space: nowrap;
  }
}

/* ========== Footer Actions ========== */
.footer-actions {
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  gap: 12px;
  z-index: 99;
  padding: 0 16px;
}

.action-left {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  margin-right: 8px;
}

.action-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* #ifdef H5 */
:deep(.action-left) > * {
  display: inline-block;
}

/* #endif */

.footer-actions :deep(.fix-btn) {
  position: static !important;
  bottom: auto !important;
  left: auto !important;
  transform: none !important;
  box-shadow: none !important;
  height: 40px !important;
  min-width: 0 !important;
  padding: 0 14px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 20px !important;
  background: #3561f2 !important;
  font-size: 14px !important;
  font-weight: 500 !important;
}

/* #ifdef H5 */
.footer-actions :deep(.fix-btn) > * {
  line-height: 40px !important;
  font-size: 14px !important;
}

/* #endif */

.toggle-wrapper {
  display: inline-flex;
  height: 40px;
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 0 6px 2px rgb(209 207 207 / 50%);
  overflow: hidden;
}

.toggle-item {
  min-width: 80px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.toggle-active {
  background-color: #3561f2;
  border-radius: 20px;
}

.toggle-text {
  font-size: 14px;
  color: #323233;
}

.toggle-active .toggle-text {
  color: #fff;
}
</style>
