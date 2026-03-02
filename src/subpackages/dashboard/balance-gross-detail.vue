<template>
  <view class="page-container">
    <!-- 头部筛选栏 -->
    <view class="header-bar">
      <view class="header-content">
        <!-- 供应商选择 -->
        <view class="supplier-picker" @click="showSupplierPicker = true">
          <text class="supplier-text">{{ selectedSupplierText }}</text>
          <up-icon name="arrow-down" size="14" />
        </view>

        <!-- 日期选择 -->
        <view class="date-picker" @click="showDatePicker = true">
          <text class="date-text">{{ getRangeDate(dashboardStore.dateTime) }}</text>
          <up-icon name="arrow-down" size="14" />
        </view>
      </view>
    </view>

    <!-- 供应商选择器 -->
    <up-picker
      :show="showSupplierPicker"
      :columns="supplierColumns"
      @confirm="onSupplierConfirm"
      @cancel="showSupplierPicker = false"
    />

    <!-- 日期选择器 -->
    <up-picker
      :show="showDatePicker"
      :columns="dateColumns"
      @confirm="onDateConfirm"
      @cancel="showDatePicker = false"
      @change="onDateChange"
    />

    <!-- 数据卡片区域 -->
    <scroll-view class="cards-scroll" scroll-x>
      <view class="cards-container">
        <view class="cards-row">
          <view v-for="(card, index) in firstRowCards" :key="'first-' + index" class="data-card">
            <text class="card-title">{{ card.title }}</text>

            <view class="card-change">
              <!-- 特殊卡片处理 (天数/比例) -->
              <template v-if="isSplitCard(card.title)">
                <view v-for="(part, i) in splitChange(card.change)" :key="i" class="change-part">
                  <view :class="getTrendIconClass(part, card.title)" />
                  <text :class="getChangeClass(part, card.title)">
                    {{ Math.abs(part) }}{{ getUnitByPart(card.title, i) }}
                  </text>
                  <text v-if="i < splitChange(card.change).length - 1" class="separator">/</text>
                </view>
              </template>

              <!-- 普通卡片处理 -->
              <template v-else>
                <view :class="getTrendIconClass(card.change, card.title)" />
                <text :class="getChangeClass(card.change, card.title)">
                  {{ Math.abs(card.change) }}{{ card.changeUnit }}
                </text>
              </template>
            </view>

            <text class="card-value">{{ card.value }}{{ card.unit || '' }}</text>
          </view>
        </view>
        <view class="cards-row">
          <view v-for="(card, index) in secondRowCards" :key="'second-' + index" class="data-card">
            <text class="card-title">{{ card.title }}</text>

            <view class="card-change">
              <!-- 特殊卡片处理 (天数/比例) -->
              <template v-if="isSplitCard(card.title)">
                <view v-for="(part, i) in splitChange(card.change)" :key="i" class="change-part">
                  <view :class="getTrendIconClass(part, card.title)" />
                  <text :class="getChangeClass(part, card.title)">
                    {{ Math.abs(part) }}{{ getUnitByPart(card.title, i) }}
                  </text>
                  <text v-if="i < splitChange(card.change).length - 1" class="separator">/</text>
                </view>
              </template>

              <!-- 普通卡片处理 -->
              <template v-else>
                <view :class="getTrendIconClass(card.change, card.title)" />
                <text :class="getChangeClass(card.change, card.title)">
                  {{ Math.abs(card.change) }}{{ card.changeUnit }}
                </text>
              </template>
            </view>

            <text class="card-value">{{ card.value }}{{ card.unit || '' }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 表格区域 -->
    <view class="table-container">
      <!-- 空状态 -->
      <view v-if="tableData.length === 0 && !loading" class="empty-container">
        <app-empty description="暂无数据" />
      </view>

      <!-- 加载状态 -->
      <view v-if="loading" class="loading-container">
        <uni-load-more status="loading" />
      </view>

      <!-- 表格内容 -->
      <scroll-view v-if="tableData.length > 0" class="table-scroll" scroll-x>
        <!-- 表头 -->
        <view class="table-header">
          <view class="table-cell cell-1">品种ID/品种名称</view>
          <view class="table-cell cell-2">规格</view>
          <view class="table-cell cell-3">平衡毛利(万元)</view>
          <view class="table-cell cell-4">平衡毛利率</view>
          <view class="table-cell cell-5">销售数量</view>
          <view class="table-cell cell-6">无税销售(万元)</view>
          <view class="table-cell cell-7">基础毛利率</view>
          <view class="table-cell cell-8">上游付款天数</view>
          <view class="table-cell cell-9">库存周转天数</view>
          <view class="table-cell cell-10">下游回款天数</view>
          <view class="table-cell cell-11">采购银行承兑比例</view>
          <view class="table-cell cell-12">{{
            deptId === '968' ? '电商及战采销售占比' : '内部零售及批发销售占比'
          }}</view>
          <view class="table-cell cell-13">集采类型</view>
          <view class="table-cell cell-14">集采中标状态</view>
          <view class="table-cell cell-15">厂家</view>
          <view class="table-cell cell-16">采购员</view>
        </view>

        <!-- 表格数据 -->
        <view class="table-body">
          <view
            v-for="(item, index) in tableData"
            :key="index"
            :class="['table-row', { 'row-even': index % 2 === 0 }]"
          >
            <view class="table-cell cell-1">{{ item.goodsId }}/{{ item.goodsName }}</view>
            <view class="table-cell cell-2">{{ item.goodsType }}</view>
            <view class="table-cell cell-3">{{ item.phml }}</view>
            <view class="table-cell cell-4">{{ item.phmll }}%</view>
            <view class="table-cell cell-5">{{ item.goodsQty }}</view>
            <view class="table-cell cell-6">{{ item.wsxs }}</view>
            <view class="table-cell cell-7">{{ item.jcmll }}%</view>
            <view class="table-cell cell-8">{{ item.syfkts }}</view>
            <view class="table-cell cell-9">{{ item.kczzts }}</view>
            <view class="table-cell cell-10">{{ item.xyhkts }}</view>
            <view class="table-cell cell-11">{{ item.cgcdbl }}%</view>
            <view class="table-cell cell-12"
              >{{ deptId === '968' ? item.dsjzcxszb : item.nblsjpfxszb }}%</view
            >
            <view class="table-cell cell-13">{{ item.jcTypeText }}</view>
            <view class="table-cell cell-14">{{ item.isBid }}</view>
            <view class="table-cell cell-15">{{ item.factory }}</view>
            <view class="table-cell cell-16">{{ item.buyerName }}</view>
          </view>
        </view>
      </scroll-view>

      <!-- 分页 -->
      <view v-if="tableData.length > 0" class="pagination">
        <view :class="['page-btn', { disabled: currentPage === 1 }]" @click="prevPage">
          <up-icon name="arrow-left" size="16" />
        </view>

        <view class="page-info"> {{ currentPage }} / {{ totalPages }} </view>

        <view :class="['page-btn', { disabled: currentPage === totalPages }]" @click="nextPage">
          <up-icon name="arrow-right" size="16" />
        </view>
      </view>
    </view>

    <!-- 高级筛选按钮 -->
    <view class="filter-button-container">
      <view class="filter-button" @click="showFilter = true">
        <up-icon name="list" size="15" />
        <text class="filter-button-text">高级操作</text>
      </view>
    </view>

    <!-- 高级筛选弹窗 -->
    <up-popup :show="showFilter" mode="bottom" @close="showFilter = false">
      <view class="filter-popup">
        <view class="filter-header">
          <text class="filter-title">高级筛选</text>
        </view>

        <up-form>
          <!-- 品种ID/名称 -->
          <app-form-item label="品种ID/名称">
            <up-input
              v-model="filterObj.goods"
              clearable
              placeholder="请输入品种ID/名称"
              inputAlign="right"
              fontSize="28rpx"
              border="none"
            />
          </app-form-item>

          <!-- 排序类型 -->
          <app-form-item label="排序类型" :borderBottom="false">
            <view class="w-full text-right" @click="showSortPicker = true">
              <text :class="filterObj.sortType ? '' : 'color-gray-6'">
                {{ filterObj.sortType || '点击选择排序类型' }}
              </text>
            </view>
          </app-form-item>
        </up-form>

        <view class="filter-buttons">
          <view class="filter-btn filter-btn-reset" @click="resetFilter">重置</view>
          <view class="filter-btn filter-btn-confirm" @click="handleFilterConfirm">确定</view>
        </view>
      </view>
    </up-popup>

    <!-- 排序选择器 -->
    <up-picker
      :show="showSortPicker"
      :columns="sortColumns"
      @confirm="onSortConfirm"
      @cancel="showSortPicker = false"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import dayjs from 'dayjs';

const { formatRaw } = useFormatter();
const dashboardStore = useDashboardStore();

// 路由参数
const deptId = ref<string>('');
const supplyId = ref<string>('');
const supplyName = ref<string>('');
const filterResult = ref<string>('');

// 状态管理
const showSupplierPicker = ref<boolean>(false);
const showDatePicker = ref<boolean>(false);
const showFilter = ref<boolean>(false);
const showSortPicker = ref<boolean>(false);
const loading = ref<boolean>(false);

// 供应商选项
const supplierOptions = ref<any[]>([]);
const selectedSupplier = ref<string>('');

// 日期数据
const availableDate = ref<any[]>([]);
const dateColumns = ref<any[]>([]);

// 筛选对象
const filterObj = ref({
  goods: '',
  sortType: '',
});

// 集采类型映射
const jcTypeMap = ref<any[]>([]);

// 卡片数据
const firstRowCards = ref([
  {
    title: '平衡毛利(万元)',
    value: 0,
    unit: '',
    change: 0,
    changeUnit: '%',
  },
  {
    title: '上游付款天数/承兑比例',
    value: 0,
    unit: '',
    change: 0,
    changeUnit: 'p',
  },
  {
    title: '基础毛利率',
    value: 0,
    unit: '%',
    change: 0,
    changeUnit: 'p',
  },
  {
    title: '库存资金占用率',
    value: 0,
    unit: '%',
    change: 0,
    changeUnit: 'p',
  },
  {
    title: '固定费用率',
    value: 0,
    unit: '%',
    change: 0,
    changeUnit: 'p',
  },
  {
    title: '上游资金收益率',
    value: 0,
    unit: '%',
    change: 0,
    changeUnit: 'p',
  },
]);

const secondRowCards = ref([
  {
    title: '无税销售(万元)',
    value: 0,
    unit: '',
    change: 0,
    changeUnit: '%',
  },
  {
    title: '下游回款天数/承兑比例',
    value: 0,
    unit: '',
    change: 0,
    changeUnit: 'p',
  },
  {
    title: '平衡毛利率',
    value: 0,
    unit: '%',
    change: 0,
    changeUnit: 'p',
  },
  {
    title: '库存周转天数',
    value: 0,
    unit: '天',
    change: 0,
    changeUnit: 'p',
  },
  {
    title: '电商及战采销售占比',
    value: 0,
    unit: '%',
    change: 0,
    changeUnit: 'p',
  },
  {
    title: '下游资金占用率',
    value: 0,
    unit: '%',
    change: 0,
    changeUnit: 'p',
  },
]);

// 表格数据
const tableData = ref<any[]>([]);
const allTableData = ref<any[]>([]);
const currentPage = ref<number>(1);
const pageSize = ref<number>(10);

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
const supplierColumns = computed(() => {
  return [supplierOptions.value.map(item => item.text)];
});

const sortColumns = computed(() => {
  return [sortTypes.map(item => item.text)];
});

const totalPages = computed(() => {
  return Math.ceil(allTableData.value.length / pageSize.value);
});

const selectedSupplierText = computed(() => {
  // 如果有直接传递的supplyName，则使用它
  if (supplyId.value && supplyName.value) {
    return `${supplyId.value}/${supplyName.value}`;
  }
  // 否则从供应商列表中查找
  const supplier = supplierOptions.value.find(item => item.value === selectedSupplier.value);
  return supplier ? supplier.text : '请选择供应商';
});

// API 请求使用的 end
const apiEndDate = computed(() => {
  const selected = dayjs(dashboardStore.dateTime);
  const currentDate = dayjs();

  if (selected.isSame(currentDate, 'month')) {
    return selected.subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
  } else {
    return selected.startOf('month').format('YYYY-MM-DD');
  }
});

// 方法
const getRangeDate = (date: string) => {
  const year = dayjs(date).format('YYYY');
  const month = dayjs(date).format('M');
  return `${year}年1月-${month}月`;
};

const isSplitCard = (title: string) => {
  return ['上游付款天数/承兑比例', '下游回款天数/承兑比例'].includes(title);
};

const splitChange = (change: any) => {
  return (change || '').split('/').map(Number);
};

const getUnitByPart = (title: string, index: number) => {
  if (title === '上游付款天数/承兑比例' || title === '下游回款天数/承兑比例') {
    return index === 0 ? '' : 'p';
  }
  return '';
};

const getChangeClass = (change: any, title: string) => {
  const reverseFields = [
    '下游资金占用率',
    '固定费用率',
    '下游回款天数/承兑比例',
    '电商及战采销售占比',
    '库存资金占用率',
    '库存周转天数',
  ];

  if (reverseFields.includes(title)) {
    if (change > 0) return 'text-decrease';
    if (change < 0) return 'text-increase';
    return 'text-no-change';
  } else {
    if (change > 0) return 'text-increase';
    if (change < 0) return 'text-decrease';
    return 'text-no-change';
  }
};

const getTrendIconClass = (change: any, title: string) => {
  const reverseFields = [
    '下游资金占用率',
    '固定费用率',
    '下游回款天数/承兑比例',
    '电商及战采销售占比',
    '库存资金占用率',
    '库存周转天数',
  ];

  if (reverseFields.includes(title)) {
    if (change > 0) return 'icon-down-red';
    if (change < 0) return 'icon-up-green';
    return 'icon-flat';
  } else {
    if (change > 0) return 'icon-up-green';
    if (change < 0) return 'icon-down-red';
    return 'icon-flat';
  }
};

const transformData = (data: Array<{ year: number; month: number }>) => {
  const yearMap: Record<number, number[]> = {};

  data.forEach(({ year, month }) => {
    if (!yearMap[year]) {
      yearMap[year] = [];
    }
    yearMap[year].push(month);
  });

  return Object.entries(yearMap)
    .map(([year, months]) => ({
      year: parseInt(year, 10),
      month: months.sort((a, b) => a - b),
    }))
    .sort((a, b) => a.year - b.year);
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
      const lastYear = availableDate.value[availableDate.value.length - 1];
      const lastMonth = lastYear.month[lastYear.month.length - 1];
      dashboardStore.setDateTime(`${lastYear.year}-${String(lastMonth).padStart(2, '0')}-01`);
      initDateColumns();
    }
  } catch (error) {
    console.error('获取日期数据失败:', error);
  }
};

const onSupplierConfirm = async (e: any) => {
  const selectedText = e.value[0];
  const supplier = supplierOptions.value.find(item => item.text === selectedText);

  if (supplier) {
    selectedSupplier.value = supplier.value;
    supplyId.value = supplier.value;
    currentPage.value = 1;
    await fetchBalanceGrossData();
    await fetchGoodsDetail();
  }

  showSupplierPicker.value = false;
};

const onDateChange = (e: any) => {
  const { indexs, values } = e;
  if (indexs[0] !== undefined) {
    const selectedYear = parseInt(String(values[0]).replace('年1月至', ''), 10);
    const selectedYearData = availableDate.value.find(item => item.year === selectedYear);

    if (selectedYearData) {
      const months = selectedYearData.month.map((m: number) => `${m}月`);
      dateColumns.value = [dateColumns.value[0], months];
    }
  }
};

const onDateConfirm = async (e: any) => {
  const values = e.value;
  let yearStr = values[0];
  if (typeof yearStr === 'number') {
    yearStr = `${yearStr}年1月至`;
  } else if (typeof yearStr === 'object' && yearStr.year) {
    yearStr = `${yearStr.year}年1月至`;
  }

  const year = yearStr.replace('年1月至', '');
  const month = String(values[1]).replace('月', '').padStart(2, '0');
  dashboardStore.setDateTime(`${year}-${month}-01`);

  currentPage.value = 1;
  await fetchBalanceGrossData();
  await fetchGoodsDetail();

  showDatePicker.value = false;
};

const onSortConfirm = (e: any) => {
  filterObj.value.sortType = e.value[0];
  showSortPicker.value = false;
};

const resetFilter = () => {
  filterObj.value = {
    goods: '',
    sortType: '',
  };
};

const handleFilterConfirm = async () => {
  await fetchGoodsDetail();
  showFilter.value = false;
};

const sortData = (data: any[]) => {
  const sortType = filterObj.value.sortType;
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
  tableData.value = allTableData.value.slice(start, end);
};

const getProcureTypeText = (jcType: any, jcBatch: any) => {
  if (jcType === null || jcBatch === null) {
    return '-';
  }

  const typeItem = jcTypeMap.value.find((item: any) => item.procureTypeId === jcType);
  if (typeItem) {
    return `${typeItem.procureTypeName}第${jcBatch}批次`;
  }

  return '-';
};

const fetchSupplierList = async () => {
  try {
    const params = {
      deptId: deptId.value,
      end: apiEndDate.value,
      start: dayjs(apiEndDate.value).startOf('year').format('YYYY-MM-DD'),
      search: filterResult.value,
      type: 1,
    };

    const response = await DashboardService.querySupplierList(params);

    if (response && response.code === '200' && response.data) {
      supplierOptions.value = response.data.map((item: any) => ({
        text: `${item.supplyId}/${item.supplyName}`,
        value: item.supplyId.toString(), // 转换为字符串以匹配URL参数类型
      }));
      // 重新设置selectedSupplier以确保计算属性正确更新
      selectedSupplier.value = supplyId.value;
    }
  } catch (error) {
    console.error('获取供应商列表失败:', error);
  }
};

const fetchBalanceGrossData = async () => {
  try {
    const params = {
      type: 0,
      deptId: deptId.value,
      supplierId: supplyId.value,
      start: dayjs(apiEndDate.value).startOf('year').format('YYYY-MM-DD'),
      end: apiEndDate.value,
    };

    const response = await DashboardService.querySupplierAll(params);

    if (response && response.code === '200' && response.data) {
      const res = response.data;

      // 更新第一行卡片
      firstRowCards.value = firstRowCards.value.map((card: any) => {
        const newCard = { ...card };
        switch (card.title) {
          case '平衡毛利(万元)':
            newCard.value = formatRaw(res.phml, { digits: 0 });
            newCard.change = Number(res.phmltb).toFixed(2);
            break;
          case '上游付款天数/承兑比例':
            newCard.value = `${Math.round(res.syfkts)}天/${Number(res.cgyhcdbl).toFixed(2)}%`;
            newCard.change = `${Number(res.syfktstb).toFixed(2)}/${Number(res.cgyhcdbltb).toFixed(2)}`;
            break;
          case '基础毛利率':
            newCard.value = Number(res.jcmll).toFixed(2);
            newCard.change = Number(res.jcmlltb).toFixed(2);
            break;
          case '库存资金占用率':
            newCard.value = Number(res.kczjzyl).toFixed(2);
            newCard.change = Number(res.kczjzyltb).toFixed(2);
            break;
          case '固定费用率':
            newCard.value = Number(res.gdfyl).toFixed(2);
            newCard.change = Number(res.gdfyltb).toFixed(2);
            break;
          case '上游资金收益率':
            newCard.value = Number(res.syzjsyl).toFixed(2);
            newCard.change = Number(res.syzjsyltb).toFixed(2);
            break;
        }
        return newCard;
      });

      // 更新第二行卡片
      secondRowCards.value = secondRowCards.value.map((card: any) => {
        const newCard = { ...card };
        switch (card.title) {
          case '无税销售(万元)':
            newCard.value = formatRaw(res.wsxs, { digits: 0 });
            newCard.change = Number(res.wsxstb).toFixed(2);
            break;
          case '下游回款天数/承兑比例':
            newCard.value = `${Math.round(res.xyhkts)}天/${Number(res.xyyhcdbl).toFixed(2)}%`;
            newCard.change = `${Number(res.xyhktstb).toFixed(2)}/${Number(res.xyyhcdbltb).toFixed(2)}`;
            break;
          case '平衡毛利率':
            newCard.value = Number(res.phmll).toFixed(2);
            newCard.change = Number(res.phmlltb).toFixed(2);
            break;
          case '库存周转天数':
            newCard.value = Math.round(res.kczzts);
            newCard.change = Number(res.kczztstb).toFixed(2);
            break;
          case '电商及战采销售占比':
            newCard.value = Number(res.dsjzcxszb).toFixed(2);
            newCard.change = Number(res.dsjzcxszbtb).toFixed(2);
            break;
          case '下游资金占用率':
            newCard.value = Number(res.xyzjzyl).toFixed(2);
            newCard.change = Number(res.xyzjzyltb).toFixed(2);
            break;
        }
        return newCard;
      });
    }
  } catch (error) {
    console.error('获取平衡毛利数据失败:', error);
  }
};

const fetchGoodsDetail = async () => {
  try {
    loading.value = true;

    const params = {
      deptId: deptId.value,
      supplierId: supplyId.value,
      start: dayjs(apiEndDate.value).startOf('year').format('YYYY-MM-DD'),
      end: apiEndDate.value,
      buyer: '',
      factory: '',
      goods: filterObj.value.goods,
    };

    const response = await DashboardService.querySupplierGoodsList(params);

    if (response && response.code === '200' && response.data) {
      const formattedData = response.data.map((item: any) => ({
        goodsId: item.goodsId,
        goodsName: item.goodsName,
        goodsType: item.goodsType,
        phml: formatRaw(item.phml, { digits: 0 }),
        phmll: item.phmll != null ? item.phmll.toFixed(2) : '-',
        goodsQty: item.goodsQty != null ? formatRaw(item.goodsQty, { digits: 0 }) : '-',
        wsxs: formatRaw(item.wsxs, { digits: 0 }),
        jcmll: item.jcmll != null ? item.jcmll.toFixed(2) : '-',
        syfkts: item.syfkts != null ? Math.round(item.syfkts) : '-',
        kczzts: item.kczzts != null ? Math.round(item.kczzts) : '-',
        xyhkts: item.xyhkts != null ? Math.round(item.xyhkts) : '-',
        cgcdbl: item.cgcdbl != null ? item.cgcdbl.toFixed(2) : '-',
        dsjzcxszb: item.dsjzcxszb != null ? item.dsjzcxszb.toFixed(2) : '-',
        nblsjpfxszb: item.nblsjpfxszb != null ? item.nblsjpfxszb.toFixed(2) : '-',
        jcTypeText: getProcureTypeText(item.jcType, item.jcBatch),
        isBid: item.isBid === 0 ? '非中标' : item.isBid === 1 ? '中标' : '-',
        factory: item.factory || '-',
        buyerName: item.buyerName || '-',
      }));

      allTableData.value = sortData(formattedData);
      currentPage.value = 1;
      updatePagedData();
    }
  } catch (error) {
    console.error('获取货品详情失败:', error);
    uni.showToast({ title: '获取数据失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const fetchJcTypeMap = async () => {
  try {
    const response = await DashboardService.queryProcureTypeList();
    if (response && response.code === '200' && response.data) {
      jcTypeMap.value = response.data;
    }
  } catch (error) {
    console.error('获取集采类型映射失败:', error);
  }
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
  supplyId.value = options.supplyId || '';
  supplyName.value = options.supplyName ? decodeURIComponent(options.supplyName) : '';
  filterResult.value = options.filterResult || '';

  if (options.dateTime) {
    dashboardStore.setDateTime(options.dateTime);
  }

  selectedSupplier.value = supplyId.value;
});

onMounted(async () => {
  await fetchJcTypeMap();
  await updateDateColumns();
  filterObj.value.sortType = '平衡毛利倒序';
  await fetchSupplierList();
  await fetchBalanceGrossData();
  await fetchGoodsDetail();
});
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f6f7;
  padding-bottom: 120px;
}

/* ========== 头部栏 ========== */
.header-bar {
  background-color: #fff;
  box-shadow: 0 4px 24px 0 rgb(100 101 102 / 8%);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 16px;
}

.supplier-picker,
.date-picker {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 16px;
  color: #323233;
}

.supplier-text,
.date-text {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ========== 卡片区域 ========== */
.cards-scroll {
  background-color: #fff;
  padding: 8px 12px;
  white-space: nowrap;
}

.cards-container {
  display: inline-block;
  padding-bottom: 8px;
}

.cards-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  white-space: nowrap;
}

.data-card {
  display: flex;
  flex-direction: column;
  width: 170px;
  background-color: #f9f9f9;
  border-radius: 6px;
  padding: 10px;
  gap: 3px;
  flex-shrink: 0;
}

.card-title {
  font-size: 10px;
  color: #666;
  margin-bottom: 14px;
}

.card-change {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.change-part {
  display: flex;
  align-items: center;
}

.separator {
  margin: 0 4px;
  font-size: 16px;
  color: #999;
}

.card-value {
  font-size: 22px;
  color: #2271f5;
  font-weight: bold;
  line-height: 1.2;
}

/* ========== 趋势图标 ========== */
.icon-up-green,
.icon-down-red,
.icon-flat {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  margin-right: 4px;
}

.icon-up-green {
  background: url('~@/static/images/rank-up.png') center/contain no-repeat;
}

.icon-down-red {
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
  margin-top: 8px;
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
  width: 150px;
  padding-left: 16px;
}

.cell-2 {
  width: 100px;
  overflow-wrap: break-word;
}

.cell-3,
.cell-6,
.cell-10 {
  width: 100px;
  justify-content: flex-end;
}

.cell-4,
.cell-5,
.cell-7 {
  width: 70px;
  justify-content: flex-end;
}

.cell-8,
.cell-9 {
  width: 90px;
  justify-content: flex-end;
}

.cell-11,
.cell-12 {
  width: 160px;
  justify-content: flex-end;
}

.cell-13,
.cell-14 {
  width: 100px;
}

.cell-15 {
  width: 130px;
}

.cell-16 {
  width: 70px;
  margin-right: 30px;
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

/* ========== 筛选按钮 ========== */
.filter-button-container {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #fff;
  border: 1px solid #1989fa;
  border-radius: 20px;
  box-shadow: 0 2px 12px rgb(0 0 0 / 10%);
}

.filter-button-text {
  font-size: 12px;
  font-weight: 500;
  color: #1989fa;
}

/* ========== 筛选弹窗 ========== */
.filter-popup {
  background-color: #fff;
  max-height: 80vh;
  overflow-y: auto;
}

.filter-header {
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid #ebedf0;
}

.filter-title {
  font-size: 16px;
  font-weight: 500;
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
</style>
