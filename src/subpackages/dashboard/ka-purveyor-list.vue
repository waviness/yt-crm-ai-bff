<template>
  <view class="page-container">
    <!-- 筛选条件栏 -->
    <app-filter-pop
      v-model:filterShow="filterShow"
      :filterSome="filterSome"
      @confirm="onConfirm"
      @reset="reset"
    >
      <up-form>
        <!-- 供应商名称输入 -->
        <app-form-item label="供应商名称" class="mt-1">
          <up-input
            v-model="filterVal.purveyorName"
            clearable
            placeholder="请输入供应商名称"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          />
        </app-form-item>
        <!-- 采购员输入 -->
        <app-form-item label="采购员">
          <up-input
            v-model="filterVal.purchaseManName"
            clearable
            placeholder="请输入采购员"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          />
        </app-form-item>
        <!-- 日期选择 -->
        <app-form-item label="日期选择">
          <view class="w-full text-right" @click="showDatePicker = true">
            <text :class="filterVal.selectDate ? '' : 'color-gray-6'">
              {{ filterVal.selectDate || '点击选择日期' }}
            </text>
          </view>
        </app-form-item>
        <!-- 排序类型 -->
        <app-form-item label="排序类型" :borderBottom="false">
          <view class="w-full text-right" @click="showSortPicker = true">
            <text :class="filterVal.sortType ? '' : 'color-gray-6'">
              {{ filterVal.sortType || '点击选择排序类型' }}
            </text>
          </view>
        </app-form-item>
      </up-form>
    </app-filter-pop>

    <!-- 页面标题 -->
    <view class="page-title">公司KA供应商 {{ titleDate }}</view>

    <!-- 日期选择器 -->
    <u-calendar
      v-model="showDatePicker"
      :default-date="new Date(filterVal.selectDate || new Date())"
      :min-date="new Date(2021, 0, 1)"
      :max-date="new Date()"
      @confirm="onDateConfirm"
    />

    <!-- 排序选择器 -->
    <up-picker
      :show="showSortPicker"
      :columns="sortColumns"
      @confirm="onSortConfirm"
      @cancel="showSortPicker = false"
    />

    <!-- 数据表格 -->
    <view class="table-container">
      <!-- 空状态 -->
      <view v-if="listItems.length === 0 && !loading" class="empty-container">
        <app-empty description="暂无数据" />
      </view>

      <!-- 加载状态 -->
      <view v-if="loading" class="loading-container">
        <uni-load-more status="loading" />
      </view>

      <!-- 表格内容 -->
      <scroll-view v-if="listItems.length > 0" class="table-scroll" scroll-x>
        <!-- 表头 -->
        <view class="table-header">
          <view class="table-cell cell-1">排名</view>
          <view class="table-cell cell-2">供应商名称</view>
          <view class="table-cell cell-3">采购员</view>
          <view class="table-cell cell-4">无税销售(万元)</view>
          <view class="table-cell cell-5">销售额净增(万元)</view>
          <view class="table-cell cell-6">同比增长</view>
          <view class="table-cell cell-7">去年整年无税销售(万元)</view>
          <view class="table-cell cell-8">品种数量</view>
        </view>

        <!-- 表格数据 -->
        <view class="table-body">
          <view
            v-for="(item, index) in listItems"
            :key="index"
            :class="['table-row', { 'row-even': index % 2 === 0 }]"
          >
            <view class="table-cell cell-1">{{ item.rank }}</view>
            <view class="table-cell cell-2">{{ item.purveyorName }}</view>
            <view class="table-cell cell-3">{{ item.purchaseManName }}</view>
            <view class="table-cell cell-4">{{ item.salesAmount }}</view>
            <view class="table-cell cell-5">{{ item.netIncrease }}</view>
            <view class="table-cell cell-6">{{ item.onPercent }}%</view>
            <view class="table-cell cell-7">{{ item.lastEntireSalesAmount }}</view>
            <view class="table-cell cell-8">{{ item.goodsCount }}</view>
          </view>
        </view>
      </scroll-view>

      <!-- 分页 -->
      <view v-if="listItems.length > 0" class="pagination">
        <view :class="['page-btn', { disabled: currentPage === 1 }]" @click="prevPage">
          <up-icon name="arrow-left" size="16" />
        </view>

        <view class="page-info"> {{ currentPage }} / {{ totalPages }} </view>

        <view :class="['page-btn', { disabled: currentPage === totalPages }]" @click="nextPage">
          <up-icon name="arrow-right" size="16" />
        </view>
      </view>
    </view>

    <!-- 底部Tab -->
    <view class="end-tab">
      <view class="tab-container">
        <view :class="['tab-btn', { active: activeTab === '1' }]" @click="handleTabChange('1')">
          年
        </view>
        <view :class="['tab-btn', { active: activeTab === '2' }]" @click="handleTabChange('2')">
          月
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import dayjs from 'dayjs';

const { formatTenThousand, formatPercentage } = useFormatter();

// 路由参数
const deptId = ref<string>('');
const deptName = ref<string>('');
const dateTime = ref<string>('');

// 状态
const filterShow = ref(false);
const showDatePicker = ref<boolean>(false);
const showSortPicker = ref<boolean>(false);
const loading = ref<boolean>(false);
const activeTab = ref<'1' | '2'>('1'); // 1: 年, 2: 月

// 筛选对象
const filterVal = ref({
  purveyorName: '',
  purchaseManName: '',
  selectDate: '',
  sortType: '无税销售倒序',
});

// 列表数据
const listItems = ref<any[]>([]);
const currentPage = ref<number>(1);
const pageSize = ref<number>(10);
const total = ref<number>(0);

// 排序类型
const sortTypes = [
  { text: '无税销售正序', orderField: 2, orderRule: 1 },
  { text: '无税销售倒序', orderField: 2, orderRule: 2 },
  { text: '销售额净增(万元)正序', orderField: 3, orderRule: 1 },
  { text: '销售额净增(万元)倒序', orderField: 3, orderRule: 2 },
  { text: '同比增长正序', orderField: 4, orderRule: 1 },
  { text: '同比增长倒序', orderField: 4, orderRule: 2 },
  { text: '去年整年无税销售(万元)正序', orderField: 5, orderRule: 1 },
  { text: '去年整年无税销售(万元)倒序', orderField: 5, orderRule: 2 },
];

// 当前选中的排序
const selectedSort = ref(sortTypes[1]); // 默认无税销售倒序

// 计算属性
const filterSome = computed(() => {
  if (
    !filterShow.value &&
    (filterVal.value.purveyorName ||
      filterVal.value.purchaseManName ||
      filterVal.value.selectDate ||
      filterVal.value.sortType !== '无税销售倒序')
  ) {
    return true;
  }
  return false;
});

const sortColumns = computed(() => {
  return [sortTypes.map(item => item.text)];
});

const totalPages = computed(() => {
  return Math.ceil(total.value / pageSize.value);
});

const titleDate = computed(() => {
  return filterVal.value.selectDate || dateTime.value || dayjs().format('YYYY-MM-DD');
});

// 方法
const onConfirm = async () => {
  await fetchKaList();
  filterShow.value = false;
};

const reset = () => {
  filterVal.value = {
    purveyorName: '',
    purchaseManName: '',
    selectDate: '',
    sortType: '无税销售倒序',
  };
  selectedSort.value = sortTypes[1];
};

const onDateConfirm = (date: Date) => {
  filterVal.value.selectDate = dayjs(date).format('YYYY-MM-DD');
  showDatePicker.value = false;
};

const onSortConfirm = (e: any) => {
  const selectedText = e.value[0];
  const selectedSortItem = sortTypes.find(item => item.text === selectedText);
  if (selectedSortItem) {
    selectedSort.value = selectedSortItem;
    filterVal.value.sortType = selectedText;
  }
  showSortPicker.value = false;
};

const handleTabChange = async (tab: '1' | '2') => {
  activeTab.value = tab;
  currentPage.value = 1;
  await fetchKaList();
};

// 获取选中的日期
const getSelectDate = (): string => {
  if (filterVal.value.selectDate) {
    return filterVal.value.selectDate;
  }
  if (dateTime.value) {
    return dateTime.value;
  }
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return `${year}-${month.toString().padStart(2, '0')}-01`;
};

// 获取KA供应商列表
const fetchKaList = async () => {
  try {
    loading.value = true;

    const params = {
      deptIdList: deptId.value ? [Number(deptId.value)] : [990],
      startDate: '',
      endDate: '',
      flag: activeTab.value, // 1: 年, 2: 月
      orderField: selectedSort.value.orderField,
      orderRule: selectedSort.value.orderRule,
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      purveyorName: filterVal.value.purveyorName,
      purchaseManName: filterVal.value.purchaseManName,
      purveyorType: 1,
      selectDate: getSelectDate(),
    };

    const response = await DashboardService.getPurveyorStatList(params);

    if (response && response.code === '200' && response.data?.list) {
      listItems.value = response.data.list.map((item: any) => ({
        rank: item.rank,
        purveyorName: item.purveyorName,
        purchaseManName: item.purchaseManName,
        salesAmount: formatTenThousand(item.salesAmount, { digits: 1 }),
        netIncrease: formatTenThousand(item.netIncrease, { digits: 1 }),
        onPercent: formatPercentage(item.onPercent, { digits: 2, withSymbol: false }),
        lastEntireSalesAmount: formatTenThousand(item.lastEntireSalesAmount, { digits: 1 }),
        goodsCount: item.goodsNum,
      }));
      total.value = response.data.total;
    }
  } catch (error) {
    console.error('获取KA供应商列表失败:', error);
    uni.showToast({ title: '获取数据失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchKaList();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchKaList();
  }
};

// 生命周期
onLoad((options: any) => {
  deptId.value = options.deptId || '990';
  deptName.value = options.deptName || '';
  dateTime.value = options.dateTime || '';

  // 如果传入了日期,设置到筛选值中
  if (dateTime.value) {
    filterVal.value.selectDate = dateTime.value;
  }
});

onMounted(async () => {
  await fetchKaList();
});
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f6f7;
  padding-bottom: 200rpx;
}

/* ========== 页面标题 ========== */
.page-title {
  padding: 24rpx 32rpx;
  font-size: 28rpx;
  font-weight: 500;
  color: #323233;
  background-color: #f5f6f7;
}

/* ========== 表格容器 ========== */
.table-container {
  background-color: #fff;
  padding: 0 20rpx;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
}

.table-scroll::-webkit-scrollbar {
  height: 0;
}

/* ========== 表头 ========== */
.table-header {
  display: flex;
  background-color: #fff;
  border-bottom: 2rpx solid #ebedf0;
  padding: 24rpx 0;
  min-width: fit-content;
}

.table-cell {
  font-size: 28rpx;
  color: #646566;
  flex-shrink: 0;
  padding: 0 16rpx;
  display: flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-1 {
  width: 100rpx;
  padding-left: 32rpx;
}

.cell-2 {
  width: 160rpx;
  word-wrap: break-word;
}

.cell-3 {
  width: 120rpx;
  word-wrap: break-word;
}

.cell-4 {
  width: 220rpx;
  justify-content: flex-end;
}

.cell-5 {
  width: 240rpx;
  justify-content: flex-end;
}

.cell-6 {
  width: 200rpx;
  justify-content: flex-end;
}

.cell-7 {
  width: 300rpx;
  justify-content: flex-end;
}

.cell-8 {
  width: 180rpx;
  justify-content: flex-end;
}

/* ========== 表格主体 ========== */
.table-body {
  min-width: fit-content;
}

.table-row {
  display: flex;
  padding: 24rpx 0;
  border-bottom: 2rpx solid #ebedf0;
  min-width: fit-content;

  &.row-even {
    background-color: #f7f7f7;
  }

  .table-cell {
    color: #323233;
    font-size: 28rpx;
  }
}

/* ========== 空状态和加载 ========== */
.empty-container {
  padding: 120rpx 0;
  display: flex;
  justify-content: center;
  background-color: #fff;
}

.loading-container {
  padding: 80rpx 0;
  display: flex;
  justify-content: center;
  background-color: #fff;
}

/* ========== 分页 ========== */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32rpx;
  padding: 40rpx 0;
  background-color: #fff;
}

.page-btn {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f7f8fa;
  border-radius: 8rpx;

  &.disabled {
    opacity: 0.4;
    pointer-events: none;
  }
}

.page-info {
  font-size: 28rpx;
  color: #323233;
  min-width: 120rpx;
  text-align: center;
}

/* ========== 底部Tab ========== */
.end-tab {
  position: fixed;
  bottom: 72rpx;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 40rpx 0;
  z-index: 100;
}

.tab-container {
  display: flex;
  width: 352rpx;
  height: 64rpx;
  background: #fff;
  box-shadow: 0 0 24rpx 10rpx rgb(209 207 207 / 50%);
  border-radius: 64rpx;
  overflow: hidden;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  transition: all 0.3s;

  &.active {
    background: #3561f2;
    color: #fff;
    border-radius: 32rpx;
  }
}
</style>
