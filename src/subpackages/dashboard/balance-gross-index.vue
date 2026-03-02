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
        <!-- 部门选择 -->
        <app-form-item label="部门" class="mt-1">
          <view class="w-full text-right" @click="showDeptPicker = true">
            <text :class="filterVal.deptName ? '' : 'color-gray-6'">
              {{ filterVal.deptName || '点击选择部门' }}
            </text>
          </view>
        </app-form-item>
        <!-- 日期选择 -->
        <app-form-item label="日期选择">
          <view class="w-full text-right" @click="showDatePicker = true">
            <text :class="filterVal.date ? '' : 'color-gray-6'">
              {{ filterVal.date || '点击选择日期' }}
            </text>
          </view>
        </app-form-item>
        <!-- 供应商输入 -->
        <app-form-item label="供应商ID/名称">
          <up-input
            v-model="filterVal.supplier"
            clearable
            placeholder="请输入供应商ID/名称"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          />
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
    <view class="page-title">
      平衡毛利({{ deptName }}){{ titleDateRange.startYear }}年{{ titleDateRange.startMonth }}月-{{
        titleDateRange.endYear
      }}年{{ titleDateRange.endMonth }}月
    </view>

    <!-- 部门选择器 -->
    <up-picker
      :show="showDeptPicker"
      :columns="deptColumns"
      @confirm="onDeptConfirm"
      @cancel="showDeptPicker = false"
    />

    <!-- 日期选择器 -->
    <up-picker
      :show="showDatePicker"
      :columns="dateColumns"
      @confirm="onDateConfirm"
      @cancel="showDatePicker = false"
      @change="onDateChange"
    />

    <!-- 排序选择器 -->
    <up-picker
      :show="showSortPicker"
      :columns="sortColumns"
      @confirm="onSortConfirm"
      @cancel="showSortPicker = false"
    />

    <!-- 数据卡片 -->
    <view class="data-cards">
      <view class="card-row">
        <view class="data-card">
          <text class="card-label">平衡毛利（万元）</text>
          <view class="card-change">
            <view :class="getTrendIconClass(generalData.phmltb)" />
            <text :class="getChangeClass(generalData.phmltb)"
              >{{ Math.abs(generalData.phmltb) }}%</text
            >
          </view>
          <text class="card-value">{{ generalData.phml || '-' }}</text>
        </view>

        <view class="data-card">
          <text class="card-label">基础毛利率</text>
          <view class="card-change">
            <view :class="getTrendIconClass(generalData.jcmlltb)" />
            <text :class="getChangeClass(generalData.jcmlltb)"
              >{{ Math.abs(generalData.jcmlltb) }}%</text
            >
          </view>
          <text class="card-value">{{ generalData.jcmll }}%</text>
        </view>
      </view>

      <view class="card-row">
        <view class="data-card">
          <text class="card-label">整体销售（万元）</text>
          <view class="card-change">
            <view :class="getTrendIconClass(generalData.wsxstb)" />
            <text :class="getChangeClass(generalData.wsxstb)"
              >{{ Math.abs(generalData.wsxstb) }}%</text
            >
          </view>
          <text class="card-value">{{ generalData.wsxs || '-' }}</text>
        </view>

        <view class="data-card">
          <text class="card-label">平衡毛利率</text>
          <view class="card-change">
            <view :class="getTrendIconClass(generalData.phmlltb)" />
            <text :class="getChangeClass(generalData.phmlltb)"
              >{{ Math.abs(generalData.phmlltb) }}%</text
            >
          </view>
          <text class="card-value">{{ generalData.phmll }}%</text>
        </view>
      </view>
    </view>

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
          <view class="table-cell cell-1">供应商ID/供应商名称</view>
          <view class="table-cell cell-2">平衡毛利(万元)</view>
          <view class="table-cell cell-3">平衡毛利率</view>
          <view class="table-cell cell-4">无税销售(万元)</view>
          <view class="table-cell cell-5">基础毛利率</view>
          <view class="table-cell cell-5">上游付款天数</view>
          <view class="table-cell cell-6">库存周转天数</view>
          <view class="table-cell cell-7">下游回款天数</view>
          <view class="table-cell cell-8">采购银行承兑比例</view>
          <view class="table-cell cell-9">{{
            deptId === '968' ? '电商及战采销售占比' : '内部零售及批发销售占比'
          }}</view>
        </view>

        <!-- 表格数据 -->
        <view class="table-body">
          <view
            v-for="(item, index) in listItems"
            :key="index"
            :class="['table-row', { 'row-even': index % 2 === 0 }]"
            @click="handleItemClick(item)"
          >
            <view class="table-cell cell-1">{{ item.supplyId }}/{{ item.supplyName }}</view>
            <view class="table-cell cell-2">{{ item.phml }}</view>
            <view class="table-cell cell-3">{{ item.phmll }}%</view>
            <view class="table-cell cell-4">{{ item.wsxs }}</view>
            <view class="table-cell cell-5">{{ item.jcmll }}%</view>
            <view class="table-cell cell-5">{{ item.syfkts }}</view>
            <view class="table-cell cell-6">{{ item.kczzts }}</view>
            <view class="table-cell cell-7">{{ item.xyhkts }}</view>
            <view class="table-cell cell-8">{{ item.cgcdbl }}%</view>
            <view class="table-cell cell-9"
              >{{ deptId === '968' ? item.dsjzcxszb : item.nblsjpfxszb }}%</view
            >
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
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import router from '@/utils/router';
import dayjs from 'dayjs';
import cache from '@/utils/cache';

const { formatRaw } = useFormatter();

// 路由参数
const deptId = ref<string>('');
const deptName = ref<string>('');
// 使用全局 dashboard store
const dashboardStore = useDashboardStore();
// 页面局部日期变量
const localDateTime = ref<string>(dashboardStore.dateTime);

// 状态
// 筛选状态管理
const filterShow = ref(false);
const filterSome = computed(() => {
  if (
    !filterShow.value &&
    (filterVal.value.deptId ||
      filterVal.value.date ||
      filterVal.value.supplier ||
      filterVal.value.sortType)
  ) {
    return true;
  }
  return false;
});
const showDeptPicker = ref<boolean>(false);
const showDatePicker = ref<boolean>(false);
const showSortPicker = ref<boolean>(false);
const loading = ref<boolean>(false);

// 筛选对象
const filterVal = ref({
  deptId: '',
  deptName: '',
  date: '',
  supplier: '',
  sortType: '平衡毛利倒序',
});

// 通用数据
const generalData = ref<any>({
  phml: '-',
  phmltb: 0,
  phmll: '-',
  phmlltb: 0,
  wsxs: '-',
  wsxstb: 0,
  jcmll: '-',
  jcmlltb: 0,
});

// 列表数据
const listItems = ref<any[]>([]);
const allData = ref<any[]>([]);
const currentPage = ref<number>(1);
const pageSize = ref<number>(10);

// 部门数据
const allDepts = ref([
  { deptId: '968', deptName: '英特药业' },
  { deptId: '974', deptName: '英特电商' },
  { deptId: '998', deptName: '宁波英特' },
  { deptId: '984', deptName: '温州英特' },
  { deptId: '985', deptName: '台州英特' },
  { deptId: '990', deptName: '嘉兴英特' },
  { deptId: '991', deptName: '嘉信医药' },
  { deptId: '992', deptName: '湖州英特' },
  { deptId: '993', deptName: '绍兴英特' },
  { deptId: '994', deptName: '金华英特' },
  { deptId: '995', deptName: '浦江英特' },
  { deptId: '996', deptName: '丽水英特' },
  { deptId: '997', deptName: '英特海斯' },
  { deptId: '999', deptName: '明州英特' },
  { deptId: '1000', deptName: '舟山卫盛' },
  { deptId: '1001', deptName: '淳安英特' },
  { deptId: '1002', deptName: '英特盛健' },
  { deptId: '1042', deptName: '英特生物' },
]);

// 可用日期数据
const availableDate = ref<any[]>([]);
const dateColumns = ref<any[]>([]);

// 排序类型
const sortTypes = [
  { text: '平衡毛利正序', value: 'phmlAsc' },
  { text: '平衡毛利倒序', value: 'phmlDesc' },
  { text: '平衡毛利率正序', value: 'phmllAsc' },
  { text: '平衡毛利率倒序', value: 'phmllDesc' },
  { text: '无税金额正序', value: 'wsxsAsc' },
  { text: '无税金额倒序', value: 'wsxsDesc' },
  { text: '基础毛利率正序', value: 'jcmllAsc' },
  { text: '基础毛利率倒序', value: 'jcmllDesc' },
];

// 计算属性
const deptColumns = computed(() => {
  const phmlArray = cache.get('phmlArray') || [];
  const filteredDepts = allDepts.value.filter(dept => phmlArray.includes(dept.deptName));
  return [filteredDepts.map(dept => dept.deptName)];
});

const sortColumns = computed(() => {
  return [sortTypes.map(item => item.text)];
});

const totalPages = computed(() => {
  return Math.ceil(allData.value.length / pageSize.value);
});

const titleDateRange = computed(() => {
  const selectedDate = dayjs(localDateTime.value);
  console.log(selectedDate);
  const now = dayjs();

  let endDate = selectedDate;
  if (selectedDate.isSame(now, 'month')) {
    endDate = selectedDate.month() === 0 ? selectedDate : selectedDate.subtract(1, 'month');
  }

  return {
    startYear: selectedDate.year(),
    startMonth: 1,
    endYear: endDate.year(),
    endMonth: endDate.month() + 1,
  };
});

// 方法
const getTrendIconClass = (change: any) => {
  const numChange = Number(change);
  if (numChange > 0) return 'icon-up';
  if (numChange < 0) return 'icon-down';
  return 'icon-flat';
};

// API 请求使用的 end：如果是当前月份则取前一个月的第一天，否则直接使用选择的月份
const apiEndDate = computed(() => {
  const selected = dayjs(localDateTime.value);
  const currentDate = dayjs();

  // 检查selected是否是当前月份
  if (selected.isSame(currentDate, 'month')) {
    // 如果是当前月份，取前一个月的第一天
    return selected.subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
  } else {
    // 如果不是当前月份，直接使用selected的月份的第一天
    return selected.startOf('month').format('YYYY-MM-DD');
  }
});

const getChangeClass = (change: any) => {
  const numChange = Number(change);
  if (numChange > 0) return 'text-increase';
  if (numChange < 0) return 'text-decrease';
  return 'text-no-change';
};

// 确认筛选
const onConfirm = async () => {
  if (filterVal.value.deptName) deptName.value = filterVal.value.deptName;
  if (filterVal.value.deptId) deptId.value = filterVal.value.deptId;

  if (filterVal.value.date) {
    const yearMatch = filterVal.value.date.match(/(\d{4})年/);
    const monthMatch = filterVal.value.date.match(/至(\d{1,2})月/);

    if (yearMatch && monthMatch) {
      const year = yearMatch[1];
      const month = monthMatch[1].padStart(2, '0');
      localDateTime.value = `${year}-${month}-01`;
    }
  }

  if (!filterVal.value.sortType) {
    filterVal.value.sortType = '平衡毛利倒序';
  }

  await fetchSupplierList(filterVal.value.supplier);
  await fetchGeneralData();

  filterShow.value = false;
};

// 重置筛选条件
const reset = () => {
  filterVal.value = {
    deptId: '',
    deptName: '',
    date: '',
    supplier: '',
    sortType: '平衡毛利倒序',
  };
  deptId.value = '';
  deptName.value = '';
};

const resetFilter = () => {
  filterVal.value = {
    deptId: '',
    deptName: '',
    date: '',
    supplier: '',
    sortType: '平衡毛利倒序',
  };
  deptId.value = '';
  deptName.value = '';
};

const transformData = (data: Array<{ year: number; month: number }>) => {
  const yearMap: Record<number, number[]> = {};

  // 将月份按年份分组
  data.forEach(({ year, month }) => {
    if (!yearMap[year]) {
      yearMap[year] = [];
    }
    yearMap[year].push(month);
  });

  // 转换为数组并按年份排序
  return Object.entries(yearMap)
    .map(([year, months]) => ({
      year: parseInt(year, 10),
      month: months.sort((a, b) => a - b), // 月份升序排列
    }))
    .sort((a, b) => a.year - b.year); // 年份升序排列
};

const initDateColumns = () => {
  const years = availableDate.value.map(item => `${item.year}年1月至`);
  const lastYear = availableDate.value[availableDate.value.length - 1];
  const months = lastYear.month.map((m: number) => `${m}月`);

  dateColumns.value = [years, months];
};

const updateDateColumns = async () => {
  try {
    const response = await DashboardService.queryBalanceProfitTime({ deptId: deptId.value });
    if (response && response.data) {
      availableDate.value = transformData(response.data);
      // 设置默认的 dateTime 为最近的日期
      const lastYear = availableDate.value[availableDate.value.length - 1];
      const lastMonth = lastYear.month[lastYear.month.length - 1];
      localDateTime.value = `${lastYear.year}-${String(lastMonth).padStart(2, '0')}-01`;
      // 初始化日期选择器数据
      initDateColumns();
    }
  } catch (error) {
    console.error('获取日期数据失败:', error);
  }
};

const onDeptConfirm = (e: any) => {
  const selectedName = e.value[0];
  const selectedDept = allDepts.value.find(dept => dept.deptName === selectedName);

  if (selectedDept) {
    filterVal.value.deptId = selectedDept.deptId;
    filterVal.value.deptName = selectedDept.deptName;
    filterVal.value.date = '';
    updateDateColumns();
  }

  showDeptPicker.value = false;
};

const onDateChange = (e: any) => {
  const { indexs, values } = e;
  if (indexs[0] !== undefined) {
    // 直接将values[0]转换为字符串后处理，避免类型错误
    const selectedYear = parseInt(String(values[0]).replace('年1月至', ''), 10);
    const selectedYearData = availableDate.value.find(item => item.year === selectedYear);

    if (selectedYearData) {
      const months = selectedYearData.month.map((m: number) => `${m}月`);
      dateColumns.value = [dateColumns.value[0], months];
    }
  }
};

const onDateConfirm = (e: any) => {
  const values = e.value;
  // 确保values[0]是带"年1月至"的字符串
  let yearStr = values[0];
  if (typeof yearStr === 'number') {
    yearStr = `${yearStr}年1月至`;
  } else if (typeof yearStr === 'object' && yearStr.year) {
    yearStr = `${yearStr.year}年1月至`;
  }
  filterVal.value.date = `${yearStr}${values[1]}`;
  showDatePicker.value = false;
};

const onSortConfirm = (e: any) => {
  filterVal.value.sortType = e.value[0];
  showSortPicker.value = false;
};

const sortData = (data: any[]) => {
  const sortType = filterVal.value.sortType;
  const sorted = [...data];

  switch (sortType) {
    case '平衡毛利正序':
      return sorted.sort((a, b) => parseFloat(a.phml) - parseFloat(b.phml));
    case '平衡毛利倒序':
      return sorted.sort((a, b) => parseFloat(b.phml) - parseFloat(a.phml));
    case '平衡毛利率正序':
      return sorted.sort((a, b) => parseFloat(a.phmll) - parseFloat(b.phmll));
    case '平衡毛利率倒序':
      return sorted.sort((a, b) => parseFloat(b.phmll) - parseFloat(a.phmll));
    case '无税金额正序':
      return sorted.sort((a, b) => parseFloat(a.wsxs) - parseFloat(b.wsxs));
    case '无税金额倒序':
      return sorted.sort((a, b) => parseFloat(b.wsxs) - parseFloat(a.wsxs));
    case '基础毛利率正序':
      return sorted.sort((a, b) => parseFloat(a.jcmll) - parseFloat(b.jcmll));
    case '基础毛利率倒序':
      return sorted.sort((a, b) => parseFloat(b.jcmll) - parseFloat(a.jcmll));
    default:
      return sorted;
  }
};

const updatePagedData = () => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  listItems.value = allData.value.slice(start, end);
};

const fetchSupplierList = async (searchText: string = '') => {
  try {
    loading.value = true;

    const params = {
      deptId: deptId.value,
      end: apiEndDate.value,
      start: dayjs(apiEndDate.value).startOf('year').format('YYYY-MM-DD'),
      search: searchText,
      type: 1,
    };

    const response = await DashboardService.querySupplierList(params);

    if (response && response.code === '200' && response.data) {
      const formattedData = response.data.map((item: any) => ({
        supplyId: item.supplyId,
        supplyName: item.supplyName,
        phml: formatRaw(item.phml, { digits: 0 }),
        phmll: item.phmll != null ? item.phmll.toFixed(2) : '-',
        wsxs: formatRaw(item.wsxs, { digits: 0 }),
        jcmll: item.jcmll != null ? item.jcmll.toFixed(2) : '-',
        syfkts: item.syfkts != null ? Math.round(item.syfkts) : '-',
        kczzts: item.kczzts != null ? Math.round(item.kczzts) : '-',
        xyhkts: item.xyhkts != null ? Math.round(item.xyhkts) : '-',
        cgcdbl: item.cgcdbl != null ? item.cgcdbl.toFixed(2) : '-',
        dsjzcxszb: item.dsjzcxszb != null ? item.dsjzcxszb.toFixed(2) : '-',
        nblsjpfxszb: item.nblsjpfxszb != null ? item.nblsjpfxszb.toFixed(2) : '-',
      }));

      allData.value = sortData(formattedData);
      currentPage.value = 1;
      updatePagedData();
    }
  } catch (error) {
    console.error('获取供应商列表失败:', error);
    uni.showToast({ title: '获取数据失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const fetchGeneralData = async () => {
  try {
    const params = {
      type: 0,
      deptId: deptId.value,
      supplierId: '',
      end: apiEndDate.value,
      start: dayjs(apiEndDate.value).startOf('year').format('YYYY-MM-DD'),
    };

    const response = await DashboardService.querySupplierAll(params);

    if (response && response.code === '200' && response.data) {
      generalData.value = {
        phml: formatRaw(response.data.phml, { digits: 0 }),
        phmltb: response.data.phmltb != null ? response.data.phmltb.toFixed(2) : 0,
        phmll: response.data.phmll != null ? response.data.phmll.toFixed(2) : '-',
        phmlltb: response.data.phmlltb != null ? response.data.phmlltb.toFixed(2) : 0,
        wsxs: formatRaw(response.data.wsxs, { digits: 0 }),
        wsxstb: response.data.wsxstb != null ? response.data.wsxstb.toFixed(2) : 0,
        jcmll: response.data.jcmll != null ? response.data.jcmll.toFixed(2) : '-',
        jcmlltb: response.data.jcmlltb != null ? response.data.jcmlltb.toFixed(2) : 0,
      };
    }
  } catch (error) {
    console.error('获取汇总数据失败:', error);
  }
};

const handleFilter = async () => {
  // This function might be outdated, but keeping it for backward compatibility
  onConfirm();
};

const handleItemClick = (item: any) => {
  router.push('/subpackages/dashboard/balance-gross-detail', {
    deptId: deptId.value,
    supplyId: item.supplyId,
    supplyName: item.supplyName,
    dateTime: localDateTime.value,
  });
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    updatePagedData();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    updatePagedData();
  }
};

// 生命周期
onLoad((options: any) => {
  deptId.value = options.deptId || '';
  deptName.value = options.deptName || '';
});

onMounted(async () => {
  await updateDateColumns();
  filterVal.value.sortType = '平衡毛利倒序';
  await fetchGeneralData();
  await fetchSupplierList('');
});
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f6f7;
  padding-bottom: 100px;
}

/* ========== 筛选栏 ========== */
.filter-bar {
  background-color: #fff;
  padding: 10px 16px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.filter-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #f7f8fa;
  border-radius: 4px;
  font-size: 14px;
  color: #646566;

  &.filter-active {
    color: #2271f5;
  }
}

/* ========== 页面标题 ========== */
.page-title {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #323233;
  background-color: #f5f6f7;
}

/* ========== 筛选弹窗 ========== */
.filter-popup {
  background-color: #fff;
  max-height: 80vh;
  overflow-y: auto;
}

.popup-line {
  height: 1px;
  background-color: #ebedf0;
  margin: 0 16px;
}

.filter-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #ebedf0;
}

.filter-label {
  font-size: 14px;
  color: #646566;
  flex-shrink: 0;
  width: 120px;
}

.filter-value {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.filter-text {
  font-size: 14px;
  color: #323233;
}

.filter-input {
  flex: 1;
  text-align: right;
  font-size: 14px;
  color: #323233;
}

.filter-buttons {
  display: flex;
  gap: 16px;
  padding: 16px;
  justify-content: center;
}

.filter-btn {
  flex: 1;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  font-size: 14px;
}

.filter-btn-reset {
  background-color: #f7f8fa;
  color: #646566;
}

.filter-btn-confirm {
  background-color: #2271f5;
  color: #fff;
}

/* ========== 数据卡片 ========== */
.data-cards {
  background-color: #fff;
  padding: 16px;
  margin-bottom: 8px;
}

.card-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
}

.data-card {
  flex: 1;
  background-color: #f9f9f9;
  border-radius: 6px;
  padding: 12px;
  display: flex;
  flex-direction: column;
}

.card-label {
  font-size: 10px;
  color: #646566;
  margin-bottom: 14px;
}

.card-change {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.card-value {
  font-size: 24px;
  font-weight: 600;
  color: #2271f5;
  line-height: 1.2;
}

/* ========== 趋势图标 ========== */
.icon-up,
.icon-down,
.icon-flat {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.icon-up {
  background: url('~@/static/images/rank-up.png') center/contain no-repeat;
}

.icon-down {
  background: url('~@/static/images/rank-down.png') center/contain no-repeat;
}

.icon-flat {
  background: url('~@/static/images/rank-line.png') center/contain no-repeat;
}

.text-increase {
  font-size: 16px;
  color: #07c160;
}

.text-decrease {
  font-size: 16px;
  color: #ee0a24;
}

.text-no-change {
  font-size: 16px;
  color: #969799;
}

/* ========== 表格容器 ========== */
.table-container {
  background-color: #fff;
  padding: 0 10px;
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
  border-bottom: 1px solid #ebedf0;
  padding: 12px 0;
  min-width: fit-content;
}

.table-cell {
  font-size: 14px;
  color: #646566;
  flex-shrink: 0;
  padding: 0 8px;
  display: flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-1 {
  width: 160px;
  padding-left: 16px;
}

.cell-2,
.cell-4 {
  width: 100px;
  justify-content: flex-end;
}

.cell-3 {
  width: 80px;
  justify-content: flex-end;
}

.cell-5 {
  width: 90px;
  justify-content: flex-end;
}

.cell-6,
.cell-7 {
  width: 90px;
  justify-content: flex-end;
}

.cell-8,
.cell-9 {
  width: 160px;
  justify-content: flex-end;
}

/* ========== 表格主体 ========== */
.table-body {
  min-width: fit-content;
}

.table-row {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #ebedf0;
  min-width: fit-content;

  &.row-even {
    background-color: #f7f7f7;
  }

  .table-cell {
    color: #323233;
  }
}

/* ========== 空状态和加载 ========== */
.empty-container {
  padding: 60px 0;
  display: flex;
  justify-content: center;
  background-color: #fff;
}

.loading-container {
  padding: 40px 0;
  display: flex;
  justify-content: center;
  background-color: #fff;
}

/* ========== 分页 ========== */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px 0;
  background-color: #fff;
}

.page-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f7f8fa;
  border-radius: 4px;

  &.disabled {
    opacity: 0.4;
    pointer-events: none;
  }
}

.page-info {
  font-size: 14px;
  color: #323233;
  min-width: 60px;
  text-align: center;
}
</style>
