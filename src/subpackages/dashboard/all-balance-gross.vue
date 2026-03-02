<template>
  <view class="page-container">
    <!-- Search Bar -->
    <view class="search-container">
      <view class="search-wrapper">
        <uni-icons type="search" size="16" color="#969799" />
        <input
          v-model="searchValue"
          class="search-input"
          placeholder="搜索"
          placeholder-style="color: #C8C9CC"
          @input="onSearch"
        />
      </view>
    </view>

    <!-- Card List -->
    <view class="card-list">
      <view
        v-for="(item, index) in filteredData"
        :key="index"
        class="profit-card"
        @click="cardClick(item)"
      >
        <!-- Card Header -->
        <view class="card-header">
          <view class="header-left">
            <view class="blue-line" />
            <text class="unit-name">{{ item.deptName }}</text>
          </view>
          <view class="header-right">
            <text class="date-range">{{ item.dateRange }}</text>
            <up-icon name="arrow-right" size="16" color="#C8C9CC" />
          </view>
        </view>

        <!-- Card Body -->
        <view class="card-body">
          <view class="data-grid">
            <!-- 平衡毛利 -->
            <view class="data-cell">
              <text class="cell-label">平衡毛利(万元)</text>
              <text class="cell-value">{{ item.phml }}</text>
              <view class="cell-change">
                <view :class="getTrendIconClass(item.phmltb)" />
                <text :class="getChangeClass(item.phmltb)"> {{ Math.abs(item.phmltb) }}% </text>
              </view>
            </view>

            <!-- 平衡毛利率 -->
            <view class="data-cell data-cell-border">
              <text class="cell-label">平衡毛利率</text>
              <text class="cell-value">{{ item.phmll }}%</text>
              <view class="cell-change">
                <view :class="getTrendIconClass(item.phmlltb)" />
                <text :class="getChangeClass(item.phmlltb)"> {{ Math.abs(item.phmlltb) }}% </text>
              </view>
            </view>

            <!-- 整体销售 -->
            <view class="data-cell data-cell-border">
              <text class="cell-label">整体销售(万元)</text>
              <text class="cell-value">{{ item.wsxs }}</text>
              <view class="cell-change">
                <view :class="getTrendIconClass(item.wsxstb)" />
                <text :class="getChangeClass(item.wsxstb)"> {{ Math.abs(item.wsxstb) }}% </text>
              </view>
            </view>

            <!-- 基础毛利率 -->
            <view class="data-cell data-cell-border">
              <text class="cell-label">基础毛利率</text>
              <text class="cell-value">{{ item.jcmll }}%</text>
              <view class="cell-change">
                <view :class="getTrendIconClass(item.jcmlltb)" />
                <text :class="getChangeClass(item.jcmlltb)"> {{ Math.abs(item.jcmlltb) }}% </text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- Empty State -->
      <view v-if="filteredData.length === 0 && !loading" class="empty-container">
        <app-empty description="暂无数据" />
      </view>

      <!-- Loading State -->
      <view v-if="loading" class="loading-container">
        <uni-load-more status="loading" />
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { DashboardService } from '@/api/dashboard';
import router from '@/utils/router';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
const { formatTenThousand, formatRaw } = useFormatter();

// State
const searchValue = ref<string>('');
const phmlData = ref<any[]>([]);
const loading = ref<boolean>(false);

// Computed
const filteredData = computed(() => {
  if (!searchValue.value) {
    return phmlData.value;
  }
  return phmlData.value.filter((item: any) => item.deptName.includes(searchValue.value));
});

// Methods
const getTrendIconClass = (change: any) => {
  const numChange = Number(change);
  if (numChange > 0) {
    return 'icon-up';
  } else if (numChange < 0) {
    return 'icon-down';
  } else {
    return 'icon-flat';
  }
};

const getChangeClass = (change: any) => {
  const numChange = Number(change);
  if (numChange > 0) {
    return 'text-increase';
  } else if (numChange < 0) {
    return 'text-decrease';
  } else {
    return 'text-no-change';
  }
};

const cardClick = (item: any) => {
  router.push('/subpackages/dashboard/balance-gross-index', {
    deptId: item.deptId,
    deptName: item.deptName,
    type: 0,
  });
};

const onSearch = () => {
  console.log('搜索内容:', searchValue.value);
};

const getDateRange = (year: number, month: number) => {
  const startMonth = '01';
  const endMonth = month < 10 ? `0${month}` : `${month}`;
  return `${year}.${startMonth}月至${endMonth}月`;
};

const queryBalanceProfitBar = async () => {
  try {
    loading.value = true;
    const userId = userStore.userInfor?.userId;
    if (!userId) {
      console.error('用户ID不存在');
      return;
    }

    const response = await DashboardService.queryBalanceProfitBar({ userId });

    if (response && response.code === '200' && response.data) {
      phmlData.value = response.data.map((item: any) => ({
        deptId: item.deptId,
        deptName: item.deptName,
        dateRange: getDateRange(item.year, item.month),
        phml: formatRaw(item.phml, { digits: 0 }),
        phmltb: item.phmltb != null ? item.phmltb.toFixed(2) : '-',
        phmll: item.phmll != null ? item.phmll.toFixed(2) : '-',
        phmlltb: item.phmlltb != null ? item.phmlltb.toFixed(2) : '-',
        wsxs: formatRaw(item.wsxs, { digits: 0 }),
        wsxstb: item.wsxstb != null ? item.wsxstb.toFixed(2) : '-',
        jcmll: item.jcmll != null ? item.jcmll.toFixed(2) : '-',
        jcmlltb: item.jcmlltb != null ? item.jcmlltb.toFixed(2) : '-',
      }));
    }
  } catch (error) {
    console.error('获取平衡毛利数据失败:', error);
    uni.showToast({
      title: '获取数据失败',
      icon: 'none',
    });
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  queryBalanceProfitBar();
});
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* ========== Search Bar ========== */
.search-container {
  padding: 8px 16px;
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
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

/* ========== Card List ========== */
.card-list {
  padding: 12px 12px 100px;
}

.profit-card {
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 8%);
  overflow: hidden;
}

/* ========== Card Header ========== */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  position: relative;
}

.card-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 16px;
  right: 16px;
  height: 1px;
  background-color: #ebedf0;
}

.header-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.blue-line {
  width: 6px;
  height: 16px;
  background-color: #2271f5;
  border-radius: 3px;
  margin-right: 8px;
}

.unit-name {
  font-size: 16px;
  font-weight: 500;
  color: #323233;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-range {
  font-size: 14px;
  color: #969799;
}

/* ========== Card Body ========== */
.card-body {
  padding: 8px;
}

/* 一行四列布局 */
.data-grid {
  display: flex;
  flex-wrap: nowrap;
  gap: 0;
  align-items: stretch;
}

.data-cell {
  flex: 1;
  min-width: 0;
  background-color: #f5f6f9;
  padding: 10px 8px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  position: relative;
}

/* 右侧边框线（除了最后一列） */
.data-cell-border::before {
  content: '';
  position: absolute;
  right: 0;
  top: 12px;
  bottom: 12px;
  width: 1px;
  background-color: #ebedf0;
}

.cell-label {
  display: block;
  font-size: 12px;
  color: #646566;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cell-value {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #2271f5;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cell-change {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ========== Trend Icons ========== */
.icon-up,
.icon-down,
.icon-flat {
  width: 14px;
  height: 14px;
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

/* ========== Change Text ========== */
.text-increase {
  font-size: 10px;
  color: #07c160;
}

.text-decrease {
  font-size: 10px;
  color: #ee0a24;
}

.text-no-change {
  font-size: 10px;
  color: #969799;
}

/* ========== Empty & Loading ========== */
.empty-container {
  padding: 60px 0;
  display: flex;
  justify-content: center;
}

.loading-container {
  padding: 40px 0;
  display: flex;
  justify-content: center;
}
</style>
