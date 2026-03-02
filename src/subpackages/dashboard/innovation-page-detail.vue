<template>
  <view class="page-container">
    <!-- Sticky Header -->
    <view class="sticky-header">
      <view class="header">
        <view class="header-center">
          <text class="dept-name">{{ currentYear }}年新药</text>
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

    <!-- Year Tabs -->
    <view class="tabs-container">
      <scroll-view scroll-x class="tabs-scroll" :scroll-left="tabScrollLeft">
        <view class="tabs-wrapper">
          <view
            v-for="(year, index) in years"
            :key="year"
            class="tab-item"
            :class="{ 'tab-active': activeTabIndex === index }"
            @click="onTabChange(index)"
          >
            <text class="tab-text">{{ year }}年新药</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- Calendar -->
    <app-calendar ref="calendarRef" :endDate="maxDate" :date="maxDate" @confirm="calendarConfirm" />

    <!-- Sales Card -->
    <view class="content-wrapper">
      <view class="card-container">
        <view class="sales-card">
          <view class="card-title">
            <text class="title-text">销售实绩</text>
          </view>

          <view v-if="cdloading" class="card-loading">
            <uni-load-more status="loading" />
          </view>

          <template v-else>
            <view class="card-content">
              <text class="sales-amount">{{ cardData.sales || '--' }}万元</text>
              <view class="growth-indicator">
                <view :class="cardData.growthRate > 0 ? 'icon-up' : 'icon-down'" />
                <text
                  class="growth-text"
                  :class="cardData.growthRate > 0 ? 'text-up' : 'text-down'"
                >
                  {{ Math.abs(cardData.growthRate) }}%
                </text>
              </view>
            </view>

            <view class="progress-container">
              <view class="progress-track">
                <view class="progress-fill" :style="{ width: cardData.progress + '%' }" />
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
            <view class="table-div-2">品牌</view>
            <view class="table-div-3">营运品种分类</view>
            <view class="table-div-4">产地</view>
            <view class="table-div-5">{{
              salesTabValue === 1 ? '销售实绩(万元)' : '销售数量'
            }}</view>
            <view class="table-div-6">{{
              salesTabValue === 1 ? '较同期净增长(万元)' : '较同期净增长数量'
            }}</view>
            <view class="table-div-7">同比增幅</view>
          </view>

          <view class="table-content" v-if="listItems.length > 0">
            <view
              class="table-line flex text-14 color-black-2 align-center py-3"
              v-for="(item, index) in listItems"
              :key="index + 'innovation'"
              :style="index % 2 === 0 ? 'background-color: #F7F7F7' : ''"
            >
              <view class="table-div-1">{{ item.goodsId }}/{{ item.goodsName }}</view>
              <view class="table-div-2">{{ item.brandName }}</view>
              <view class="table-div-3">{{ item.goodsOpClassName }}</view>
              <view class="table-div-4">{{ item.goodsProdArea }}</view>
              <view class="table-div-5">{{ item.salesAmount }}</view>
              <view class="table-div-6">{{ item.periodCompareNetIncrease }}</view>
              <view class="table-div-7">{{ item.periodComparePercent }}%</view>
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

    <!-- Sort Action Sheet (use shared up-action-sheet + app-fix-btn trigger) -->
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
const currentYear = ref<number>(0);
const deptId = ref<string>('');
const deptName = ref<string>('');

// UI State
const searchValue = ref<string>('');
const calendarRef = ref<any>();
const maxDate = ref(time.format(time.add(new Date(), 0, 'year'), time.FORMATS.ISO_DATE));
const tabScrollLeft = ref<number>(0);

// Data State
const years = ref<number[]>([]);
const cardData = ref<any>({});
const maxSaleAmount = ref<number>(0);
const cdloading = ref<boolean>(false);
const allYearData = ref<any[]>([]);
const listItems = ref<any[]>([]);
const activeTabIndex = ref<number>(0);
const activeYear = ref<number>(0);
const salesTabValue = ref<number>(1);

// Pagination
const filterParams = ref({
  total: 0,
  currentPage: 1,
  pageSize: 10,
  loading: false,
});

// Sort options
const sortTypes = ref([
  { name: '销售实绩升序', orderColumn: 'salesAmount', orderType: 1 },
  { name: '销售实绩倒序', orderColumn: 'salesAmount', orderType: 0, color: '#2271F5' },
  { name: '较同期净增升序', orderColumn: 'periodCompareNetIncrease', orderType: 1 },
  { name: '较同期净增倒序', orderColumn: 'periodCompareNetIncrease', orderType: 0 },
  { name: '同比增幅升序', orderColumn: 'periodComparePercent', orderType: 1 },
  { name: '同比增幅倒序', orderColumn: 'periodComparePercent', orderType: 0 },
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
  getNewGoodList();
};

const onTabChange = (index: number) => {
  if (activeTabIndex.value === index) return;
  activeTabIndex.value = index;
  const year = years.value[index];
  activeYear.value = year;
  currentYear.value = year;
  updateCardData(year);
  getNewGoodList();
};

const onSearchInput = () => {
  filterParams.value.currentPage = 1;
  getNewGoodList();
};

const fetchAllData = async () => {
  try {
    cdloading.value = true;
    const res = await DashboardService.getDeptNewSaleGoodsStat({
      selectedDate: dashboardStore.dateTime,
      deptId: deptId.value,
      timeDimFlag: 1,
    });
    cdloading.value = false;

    if (res.code === '200' && res.data) {
      const yearDataList = res.data[1];
      years.value = yearDataList
        .map((item: any) => item.yearNum)
        .sort((a: number, b: number) => b - a);
      activeTabIndex.value = years.value.indexOf(currentYear.value);
      maxSaleAmount.value = Math.max(...yearDataList.map((item: any) => item.salesAmount));
      allYearData.value = yearDataList;
      updateCardData(currentYear.value);
    }
  } catch (error) {
    console.error('获取数据失败:', error);
    cdloading.value = false;
  }
};

const getNewGoodList = async () => {
  filterParams.value.loading = true;
  try {
    listItems.value = [];
    const res = await DashboardService.getDeptNewSaleGoodsStatList({
      deptId: deptId.value,
      goodsCategoryList: [],
      keyword: searchValue.value,
      orderColumn: selectedSort.value.orderColumn,
      orderType: selectedSort.value.orderType,
      pageNum: filterParams.value.currentPage,
      pageSize: filterParams.value.pageSize,
      selectDate: dashboardStore.dateTime,
      timeDimFlag: '1',
      yearNum: currentYear.value,
      showType: salesTabValue.value,
    });

    if (res.code === '200' && res.data) {
      listItems.value = res.data.list.map((item: any) => ({
        goodsId: item.goodsId,
        goodsName: item.goodsName,
        brandName: item.brandList?.length > 0 ? item.brandList[0].brandName : '-',
        goodsOpClassName: item.goodsOpClassName,
        goodsProdArea: item.goodsProdArea || '-',
        salesAmount:
          item.salesAmount != null
            ? salesTabValue.value === 1
              ? formatTenThousand(item.salesAmount)
              : item.salesAmount
            : '-',
        periodCompareNetIncrease:
          item.periodCompareNetIncrease != null
            ? salesTabValue.value === 1
              ? formatTenThousand(item.periodCompareNetIncrease)
              : item.periodCompareNetIncrease
            : '-',
        periodComparePercent:
          item.periodComparePercent != null ? (item.periodComparePercent * 100).toFixed(1) : '-',
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
  getNewGoodList();
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
  // close action sheet
  orderTypeFlag.value = false;
  filterParams.value.currentPage = 1;
  getNewGoodList();
};

const isSelectedSort = (item: any) => {
  return (
    item.name === selectedSort.value.name &&
    item.orderColumn === selectedSort.value.orderColumn &&
    item.orderType === selectedSort.value.orderType
  );
};

// open/close handled via orderTypeFlag and up-action-sheet events

const updateCardData = (year: any) => {
  const currentYearData = allYearData.value.find((item: any) => item.yearNum == year);
  if (currentYearData) {
    cardData.value = {
      year: currentYearData.yearNum,
      sales: formatTenThousand(currentYearData.salesAmount),
      growthRate: (currentYearData.periodComparePercent * 100).toFixed(2),
      progress: ((currentYearData.salesAmount / maxSaleAmount.value) * 100).toFixed(2),
    };
  }
};

const calendarClick = () => {
  calendarRef.value?.open();
};

const calendarConfirm = ({ fulldate }: { fulldate: string }) => {
  const dateStr = time.format(new Date(fulldate), 'yyyy-MM-dd');
  dashboardStore.setDateTime(dateStr);
  fetchAllData();
  getNewGoodList();
};

// Lifecycle
onLoad(async (options: any) => {
  if (options) {
    currentYear.value = Number(options.year);
    activeYear.value = currentYear.value;
    deptId.value = options.deptId;
    deptName.value = decodeURIComponent(options.deptName || '');
    console.log('部门ID设置为：', deptId.value);
    // 在确保 deptId 等参数设置好后，等待数据加载完成
    await fetchAllData();
    await getNewGoodList();
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

  //   justify-content: center;
}

.dept-name {
  font-size: 32px;
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

/* ========== Tabs ========== */
.tabs-container {
  background-color: #fff;
  padding: 8px 0;
}

.tabs-scroll {
  white-space: nowrap;
}

.tabs-wrapper {
  display: inline-flex;
  gap: 5px;
  padding: 0 16px;
}

.tab-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  padding: 0 18px;
  height: 40px;
  line-height: 32px;
  background-color: #fff;
  border: 1px solid #c8c9cc;
  border-radius: 15px;
  white-space: nowrap;
  transition: all 0.3s;
}

.tab-active {
  background-color: #3561f2;
  border-color: #3561f2;
}

.tab-text {
  font-size: 12px;
  color: #323233;
}

.tab-active .tab-text {
  color: #fff;
}

/* ========== Content ========== */
.content-wrapper {
  background-color: #f5f5f7;
}

/* ========== Sales Card ========== */
.card-container {
  padding: 8px;
  background-color: #fff;
}

.sales-card {
  background-color: #fff;
  border: 1px solid #c8c9cc;
  border-radius: 24px;
  overflow: hidden;
}

.card-title {
  padding: 10px 16px;
}

.title-text {
  font-size: 14px;
  color: #969799;
}

.card-loading {
  padding: 32px 0;
  display: flex;
  justify-content: center;
}

.card-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.sales-amount {
  font-size: 28px;
  font-weight: bold;
  color: #323233;
}

.growth-indicator {
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
  font-size: 16px;
  font-weight: 500;
}

.text-up {
  color: #07c160;
}

.text-down {
  color: #ee0a24;
}

.progress-container {
  padding: 8px 16px 16px;
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
    width: 180rpx;
  }

  .table-div-3 {
    width: 240rpx;
  }

  .table-div-4 {
    width: 200rpx;
  }

  .table-div-5 {
    width: 220rpx;
    text-align: right;
  }

  .table-div-6 {
    width: 260rpx;
    text-align: right;
  }

  .table-div-7 {
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

.sort-btn {
  height: 40px;
  padding: 0 20px;
  background-color: #2271f5;
  border-radius: 20px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sort-btn::after {
  border: none;
}

.sort-btn-text {
  font-size: 12px;
  font-weight: 500;
  color: #fff;
}

.action-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ensure app-fix-btn behaves like inline-block and doesn't expand to full width */

/* #ifdef H5 */
:deep(.action-left) > * {
  display: inline-block;
}

/* #endif */

/* Override app-fix-btn when used inside this page footer: cancel its fixed positioning
   and make it sit inline with the toggle buttons, with matching height/style. */
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

/* make text size and line-height consistent with toggle buttons */

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

/* ========== Sort Popup ========== */
.sort-popup {
  background-color: #fff;
  border-radius: 16px 16px 0 0;
}

.sort-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #ebedf0;
}

.sort-title {
  font-size: 16px;
  font-weight: 500;
  color: #323233;
}

.sort-cancel {
  font-size: 14px;
  color: #969799;
}

.sort-options {
  padding: 8px 0;
  max-height: 400px;
  overflow-y: auto;
}

.sort-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
}

.sort-option-text {
  font-size: 16px;
}
</style>
