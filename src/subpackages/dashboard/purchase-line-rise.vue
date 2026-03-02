<template>
  <view>
    <view v-if="!isInnerFlag" class="purchase-page-wrapper">
      <view class="purchase-page">
        <!-- 头部 -->
        <view class="header">
          <view class="header-left" @click="showPopup = true">
            <text class="dept-name">{{ currentDept?.deptName || '加载中...' }}</text>
            <icon name="arrow-down" size="14"></icon>
          </view>
          <view class="header-right" @click="openCalendar">
            <text class="time">{{ selectedDate }}</text>
            <up-icon name="arrow-down" size="14"></up-icon>
          </view>
        </view>

        <!-- 主要数据卡片 -->
        <view class="total-content">
          <view class="main-content">
            <!-- 营收实绩卡片 -->
            <view class="daily-sales">
              <view class="sales-info">
                <text class="label">{{ activeTab === '1' ? '年' : '月' }}营收实绩(万元)</text>
                <text class="sub-label">同比:{{ purchaseDataObj.yearRevenueOnPercent }}</text>
                <text class="value">{{ purchaseDataObj.yearRevenue }}</text>
              </view>
            </view>

            <!-- 在销品规数/数据趋势 -->
            <view v-if="showPurchaseData" class="data-trend" @click="handleTrendClick">
              <text class="trend-label">数据趋势</text>
              <icon name="arrow-right" size="16"></icon>
            </view>
            <view v-else class="goods-info">
              <text class="info-label">在销品规数</text>
              <text class="info-value">{{ purchaseDataObj.yearInSaleGoodsNum }}</text>
              <view v-if="purchaseDataObj.targetCompletePercent !== '--'">
                <text class="info-label">预算完成进度</text>
                <text class="info-value">{{ purchaseDataObj.targetCompletePercent }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 采购数据(战略/非战略) -->
        <view v-if="showPurchaseData" class="purchase-data-card">
          <view class="data-row">
            <view class="data-item">
              <text class="item-label">非战略采购</text>
              <text class="item-value">{{ purchaseDataObj.fzcAmount }}</text>
              <text class="item-label">同比增长</text>
              <text :class="['item-value', getColorClass(purchaseDataObj.fzcPercent)]">
                {{ getFH(purchaseDataObj.fzcPercent) }}{{ purchaseDataObj.fzcPercent }}
              </text>
            </view>
            <view class="data-item border-side">
              <text class="item-label">战略采购</text>
              <text class="item-value">{{ purchaseDataObj.zcAmount }}</text>
              <text class="item-label">同比增长</text>
              <text :class="['item-value', getColorClass(purchaseDataObj.zcPercent)]">
                {{ getFH(purchaseDataObj.zcPercent) }}{{ purchaseDataObj.zcPercent }}
              </text>
            </view>
            <view class="data-item">
              <text class="item-label">在销品规数</text>
              <text class="item-value">{{ purchaseDataObj.yearInSaleGoodsNum }}</text>
              <text class="item-label">同比增长</text>
              <text
                :class="['item-value', getColorClass(purchaseDataObj.yearInSaleGoodsNumOnPercent)]"
              >
                {{ getFH(purchaseDataObj.yearInSaleGoodsNumOnPercent)
                }}{{ purchaseDataObj.yearInSaleGoodsNumOnPercent }}
              </text>
            </view>
          </view>
        </view>

        <!-- 部门数据 Tabs (英特药业) -->
        <view v-if="showDepartData && !pdloading" class="depart-data">
          <view class="tabs-header">
            <view
              v-for="item in sonObjectStatList"
              :key="item.generalObjectId"
              :class="['tab-item', { active: currentTab === item.generalObjectId }]"
              @click="currentTab = item.generalObjectId"
            >
              {{ item.generalObjectName }}
            </view>
          </view>
          <view class="tab-content">
            <view
              v-for="item in sonObjectStatList"
              :key="item.generalObjectId"
              v-show="currentTab === item.generalObjectId"
            >
              <view class="dept-card" @click="handleDeptCardClick(item)">
                <view class="card-header">
                  <view class="blue-icon"></view>
                  <text class="dept-name">{{ item.generalObjectName }}</text>
                  <text class="goods-count">在销品规数 {{ item.yearInSaleGoodsNum }}</text>
                  <up-icon name="arrow-right" size="16"></up-icon>
                </view>
              </view>
              <view class="dept-data-row">
                <view class="dept-data-item">
                  <text class="data-label">非战略采购</text>
                  <text class="data-value">{{ item.fzcAmount }}</text>
                </view>
                <view class="dept-data-item">
                  <text class="data-label">{{ activeTab === '1' ? '年' : '月' }}同比</text>
                  <text :class="['data-value', getColorClass(item.fzcPercent)]">
                    {{ item.fzcPercent }}
                  </text>
                </view>
                <view class="dept-data-item">
                  <text class="data-label">战略采购</text>
                  <text class="data-value">{{ item.zcAmount }}</text>
                </view>
                <view class="dept-data-item">
                  <text class="data-label">{{ activeTab === '1' ? '年' : '月' }}同比</text>
                  <text :class="['data-value', getColorClass(item.zcPercent)]">
                    {{ item.zcPercent }}
                  </text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 加载状态 -->
        <view v-if="pdloading" class="loading-container">
          <text>加载中...</text>
        </view>

        <!-- 货品满足 -->
        <view class="card goods-satisfaction">
          <view class="card-header">
            <view class="blue-icon"></view>
            <text class="card-title">货品满足</text>
          </view>
          <view v-if="gsloading" class="loading">加载中...</view>
          <view v-else class="card-content">
            <view class="content-item">
              <text class="label">本月货品满足率</text>
              <text class="value">{{ goodsSatisfactionData.monthGoodsFillRate }}</text>
              <text
                :class="[
                  'growth',
                  getColorClass(goodsSatisfactionData.monthGoodsFillRateNetIncrease),
                ]"
              >
                {{ goodsSatisfactionData.monthGoodsFillRateNetIncrease }}
              </text>
            </view>
            <view class="content-item">
              <text class="label">本年货品满足率</text>
              <text class="value">{{ goodsSatisfactionData.yearGoodsFillRate }}</text>
              <text
                :class="[
                  'growth',
                  getColorClass(goodsSatisfactionData.yearGoodsFillRateNetIncrease),
                ]"
              >
                {{ goodsSatisfactionData.yearGoodsFillRateNetIncrease }}
              </text>
            </view>
            <view
              v-if="
                goodsSatisfactionData.targetFillRateDiff !== '--' &&
                goodsSatisfactionData.targetFillRateDiff != '0.00%'
              "
              class="content-item"
            >
              <text class="label">较指标差距</text>
              <text :class="['value', getColorClass(goodsSatisfactionData.targetFillRateDiff)]">
                {{ goodsSatisfactionData.targetFillRateDiff }}
              </text>
            </view>
          </view>
        </view>

        <!-- KA供应商 -->
        <view class="card ka-purveyor" @click="handleKaPurveyorClick">
          <view class="card-header">
            <view class="blue-icon"></view>
            <text class="card-title">KA供应商(万元)</text>
            <up-icon name="arrow-right" size="16"></up-icon>
          </view>
          <view v-if="kaloading" class="loading">加载中...</view>
          <view v-else class="card-content">
            <view class="content-item">
              <text class="label">本月无税收入</text>
              <text class="value">{{ kaPurveyorData.monthSalesAmount }}</text>
              <text :class="['growth', getColorClass(kaPurveyorData.monthOnPercent)]">
                {{ getFH(kaPurveyorData.monthOnPercent) }}{{ kaPurveyorData.monthOnPercent }}
              </text>
            </view>
            <view class="content-item">
              <text class="label">本年无税收入</text>
              <text class="value">{{ kaPurveyorData.yearSalesAmount }}</text>
              <text :class="['growth', getColorClass(kaPurveyorData.yearOnPercent)]">
                {{ getFH(kaPurveyorData.yearOnPercent) }}{{ kaPurveyorData.yearOnPercent }}
              </text>
            </view>
            <view class="content-item">
              <text class="label">销售占比</text>
              <text class="value">{{ kaPurveyorData.sharePercent }}</text>
              <text :class="['growth', getColorClass(kaPurveyorData.sharePercentNetIncrease)]">
                {{ getFH(kaPurveyorData.sharePercentNetIncrease)
                }}{{ kaPurveyorData.sharePercentNetIncrease }}
              </text>
            </view>
          </view>
        </view>

        <view class="card sale-lock">
          <view class="card-header">
            <view class="blue-icon"></view>
            <text class="card-title">锁控</text>
          </view>
          <view v-if="tdloading" class="loading">加载中...</view>
          <view v-else class="card-content"> </view>
        </view>

        <!-- 库存周转 -->
        <view class="card turnover">
          <view class="card-header">
            <view class="blue-icon"></view>
            <text class="card-title">库存周转</text>
          </view>
          <view v-if="tdloading" class="loading">加载中...</view>
          <view v-else class="card-content">
            <view class="content-item">
              <text class="label">本月库存周转</text>
              <text class="value">{{ turnoverData.monthTurnoverDays }}天</text>
              <text :class="['growth', getColorClass(turnoverData.monthTurnoverDaysNetDiff)]">
                {{ getFH(turnoverData.monthTurnoverDaysNetDiff)
                }}{{ turnoverData.monthTurnoverDaysNetDiff }}天
              </text>
            </view>
            <view class="content-item">
              <text class="label">本年库存周转</text>
              <text class="value">{{ turnoverData.yearTurnoverDays }}天</text>
              <text :class="['growth', getColorClass(turnoverData.yearTurnoverDaysNetDiff)]">
                {{ getFH(turnoverData.yearTurnoverDaysNetDiff)
                }}{{ turnoverData.yearTurnoverDaysNetDiff }}天
              </text>
            </view>
            <view v-if="turnoverData.targetDiffPercent !== '--'" class="content-item">
              <text class="label">较指标差距</text>
              <text :class="['value', getColorClass(turnoverData.yearTurnoverDaysNetDiff)]">
                {{ getFH(turnoverData.targetDiffPercent) }}{{ turnoverData.targetDiffPercent }}
              </text>
            </view>
          </view>
        </view>

        <!-- 子对象列表 -->
        <view v-if="showItemBox" class="item-box">
          <view v-for="item in sonObjectStatList" :key="item.generalObjectName" class="item">
            <view class="item-title">
              <view class="blue-icon"></view>
              <text class="name">{{ item.generalObjectName }}</text>
              <text class="count">在销品规数 {{ item.yearInSaleGoodsNum }}</text>
            </view>
            <view class="item-line"></view>
            <view class="item-body">
              <view class="body-labels">
                <text class="label">非战采</text>
                <text class="label">{{ activeTab === '1' ? '年' : '月' }}同比</text>
                <text class="label">预算进度</text>
                <text class="label">战采</text>
                <text class="label">{{ activeTab === '1' ? '年' : '月' }}同比</text>
                <text class="label">预算进度</text>
              </view>
              <view class="body-values">
                <text class="value">{{ item.fzcAmount }}</text>
                <text :class="getColorClass(item.fzcPercent)">{{ item.fzcPercent }}</text>
                <text class="value">{{ item.fzcProgress }}</text>
                <text class="value">{{ item.zcAmount }}</text>
                <text :class="getColorClass(item.zcPercent)">{{ item.zcPercent }}</text>
                <text class="value">{{ item.zcProgress }}</text>
              </view>
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

        <!-- 部门选择弹窗 -->
        <DeptSelectPopup
          v-model:show="showPopup"
          :auth-dept-sales="authDeptSales"
          :current-dept-id="currentDept?.deptId"
          @select="handleDeptSelect"
        />
      </view>
    </view>
    <view v-else class="purchase-page pb-100">
      <!-- 内部页面使用相同的结构 -->
      <!-- 头部 -->
      <view class="header">
        <view class="header-left" @click="showPopup = true">
          <text class="dept-name">{{ currentDept?.deptName || '加载中...' }}</text>
          <up-icon name="arrow-down" size="14"></up-icon>
        </view>
        <view class="header-right" @click="openCalendar">
          <text class="time">{{ selectedDate }}</text>
          <up-icon name="arrow-down" size="14"></up-icon>
        </view>
      </view>

      <!-- 主要数据卡片 -->
      <view class="total-content">
        <view class="main-content">
          <!-- 营收实绩卡片 -->
          <view class="daily-sales">
            <view class="sales-info">
              <text class="label">{{ activeTab === '1' ? '年' : '月' }}营收实绩(万元)</text>
              <text class="sub-label">同比:{{ purchaseDataObj.yearRevenueOnPercent }}</text>
              <text class="value">{{ purchaseDataObj.yearRevenue }}</text>
            </view>
          </view>

          <!-- 在销品规数/数据趋势 -->
          <view v-if="showPurchaseData" class="data-trend" @click="handleTrendClick">
            <text class="trend-label">数据趋势</text>
            <up-icon name="arrow-right" size="16"></up-icon>
          </view>
          <view v-else class="goods-info">
            <text class="info-label">在销品规数</text>
            <text class="info-value">{{ purchaseDataObj.yearInSaleGoodsNum }}</text>
            <view v-if="purchaseDataObj.targetCompletePercent !== '--'">
              <text class="info-label">预算完成进度</text>
              <text class="info-value">{{ purchaseDataObj.targetCompletePercent }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 采购数据(战略/非战略) -->
      <view v-if="showPurchaseData" class="purchase-data-card">
        <view class="data-row">
          <view class="data-item">
            <text class="item-label">非战略采购</text>
            <text class="item-value">{{ purchaseDataObj.fzcAmount }}</text>
            <text class="item-label">同比增长</text>
            <text :class="['item-value', getColorClass(purchaseDataObj.fzcPercent)]">
              {{ getFH(purchaseDataObj.fzcPercent) }}{{ purchaseDataObj.fzcPercent }}
            </text>
          </view>
          <view class="data-item border-side">
            <text class="item-label">战略采购</text>
            <text class="item-value">{{ purchaseDataObj.zcAmount }}</text>
            <text class="item-label">同比增长</text>
            <text :class="['item-value', getColorClass(purchaseDataObj.zcPercent)]">
              {{ getFH(purchaseDataObj.zcPercent) }}{{ purchaseDataObj.zcPercent }}
            </text>
          </view>
          <view class="data-item">
            <text class="item-label">在销品规数</text>
            <text class="item-value">{{ purchaseDataObj.yearInSaleGoodsNum }}</text>
            <text class="item-label">同比增长</text>
            <text
              :class="['item-value', getColorClass(purchaseDataObj.yearInSaleGoodsNumOnPercent)]"
            >
              {{ purchaseDataObj.yearInSaleGoodsNumOnPercent }}
            </text>
          </view>
        </view>
      </view>

      <!-- 部门数据 Tabs (英特药业) -->
      <view v-if="showDepartData && !pdloading" class="depart-data">
        <view class="tabs-header">
          <view
            v-for="item in sonObjectStatList"
            :key="item.generalObjectId"
            :class="['tab-item', { active: currentTab === item.generalObjectId }]"
            @click="currentTab = item.generalObjectId"
          >
            {{ item.generalObjectName }}
          </view>
        </view>
        <view class="tab-content">
          <view
            v-for="item in sonObjectStatList"
            :key="item.generalObjectId"
            v-show="currentTab === item.generalObjectId"
          >
            <view class="dept-card" @click="handleDeptCardClick(item)">
              <view class="card-header">
                <view class="blue-icon"></view>
                <text class="dept-name">{{ item.generalObjectName }}</text>
                <text class="goods-count">在销品规数 {{ item.yearInSaleGoodsNum }}</text>
                <up-icon name="arrow-right" size="16"></up-icon>
              </view>
            </view>
            <view class="dept-data-row">
              <view class="dept-data-item">
                <text class="data-label">非战略采购</text>
                <text class="data-value">{{ item.fzcAmount }}</text>
              </view>
              <view class="dept-data-item">
                <text class="data-label">{{ activeTab === '1' ? '年' : '月' }}同比</text>
                <text :class="['data-value', getColorClass(item.fzcPercent)]">
                  {{ item.fzcPercent }}
                </text>
              </view>
              <view class="dept-data-item">
                <text class="data-label">战略采购</text>
                <text class="data-value">{{ item.zcAmount }}</text>
              </view>
              <view class="dept-data-item">
                <text class="data-label">{{ activeTab === '1' ? '年' : '月' }}同比</text>
                <text :class="['data-value', getColorClass(item.zcPercent)]">
                  {{ item.zcPercent }}
                </text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view v-if="pdloading" class="loading-container">
        <text>加载中...</text>
      </view>

      <!-- 货品满足 -->
      <view class="card goods-satisfaction">
        <view class="card-header">
          <view class="blue-icon"></view>
          <text class="card-title">货品满足</text>
        </view>
        <view v-if="gsloading" class="loading">加载中...</view>
        <view v-else class="card-content">
          <view class="content-item">
            <text class="label">本月货品满足率</text>
            <text class="value">{{ goodsSatisfactionData.monthGoodsFillRate }}</text>
            <text
              :class="[
                'growth',
                getColorClass(goodsSatisfactionData.monthGoodsFillRateNetIncrease),
              ]"
            >
              {{ goodsSatisfactionData.monthGoodsFillRateNetIncrease }}
            </text>
          </view>
          <view class="content-item">
            <text class="label">本年货品满足率</text>
            <text class="value">{{ goodsSatisfactionData.yearGoodsFillRate }}</text>
            <text
              :class="['growth', getColorClass(goodsSatisfactionData.yearGoodsFillRateNetIncrease)]"
            >
              {{ goodsSatisfactionData.yearGoodsFillRateNetIncrease }}
            </text>
          </view>
          <view
            v-if="
              goodsSatisfactionData.targetFillRateDiff !== '--' &&
              goodsSatisfactionData.targetFillRateDiff != '+0.00%'
            "
            class="content-item"
          >
            <text class="label">较指标差距</text>
            <text :class="['value', getColorClass(goodsSatisfactionData.targetFillRateDiff)]">
              {{ goodsSatisfactionData.targetFillRateDiff }}
            </text>
          </view>
        </view>
      </view>

      <!-- KA供应商 -->
      <view class="card ka-purveyor" @click="handleKaPurveyorClick">
        <view class="card-header">
          <view class="blue-icon"></view>
          <text class="card-title">KA供应商(万元)</text>
          <up-icon name="arrow-right" size="16"></up-icon>
        </view>
        <view v-if="kaloading" class="loading">加载中...</view>
        <view v-else class="card-content">
          <view class="content-item">
            <text class="label">本月无税收入</text>
            <text class="value">{{ kaPurveyorData.monthSalesAmount }}</text>
            <text :class="['growth', getColorClass(kaPurveyorData.monthOnPercent)]">
              {{ kaPurveyorData.monthOnPercent }}
            </text>
          </view>
          <view class="content-item">
            <text class="label">本年无税收入</text>
            <text class="value">{{ kaPurveyorData.yearSalesAmount }}</text>
            <text :class="['growth', getColorClass(kaPurveyorData.yearOnPercent)]">
              {{ kaPurveyorData.yearOnPercent }}
            </text>
          </view>
          <view class="content-item">
            <text class="label">销售占比</text>
            <text class="value">{{ kaPurveyorData.sharePercent }}</text>
            <text :class="['growth', getColorClass(kaPurveyorData.sharePercentNetIncrease)]">
              {{ kaPurveyorData.sharePercentNetIncrease }}
            </text>
          </view>
        </view>
      </view>

      <!-- 库存周转 -->
      <view class="card turnover">
        <view class="card-header">
          <view class="blue-icon"></view>
          <text class="card-title">库存周转</text>
        </view>
        <view v-if="tdloading" class="loading">加载中...</view>
        <view v-else class="card-content">
          <view class="content-item">
            <text class="label">本月库存周转</text>
            <text class="value">{{ turnoverData.monthTurnoverDays }}天</text>
            <text :class="['growth', getColorClass(turnoverData.monthTurnoverDaysNetDiff)]">
              {{ turnoverData.monthTurnoverDaysNetDiff }}天
            </text>
          </view>
          <view class="content-item">
            <text class="label">本年库存周转</text>
            <text class="value">{{ turnoverData.yearTurnoverDays }}天</text>
            <text :class="['growth', getColorClass(turnoverData.yearTurnoverDaysNetDiff)]">
              {{ turnoverData.yearTurnoverDaysNetDiff }}天
            </text>
          </view>
          <view
            v-if="turnoverData.targetDiffPercent !== '--' && turnoverData.targetDiffPercent != '0'"
            class="content-item"
          >
            <text class="label">较指标差距</text>
            <text :class="['value', getColorClass(turnoverData.yearTurnoverDaysNetDiff)]">
              {{ turnoverData.targetDiffPercent }}
            </text>
          </view>
        </view>
      </view>

      <balanceGross />

      <!-- 子对象列表 -->
      <view v-if="showItemBox" class="item-box">
        <view v-for="item in sonObjectStatList" :key="item.generalObjectName" class="item">
          <view class="item-title">
            <view class="blue-icon"></view>
            <text class="name">{{ item.generalObjectName }}</text>
            <text class="count">在销品规数 {{ item.yearInSaleGoodsNum }}</text>
          </view>
          <view class="item-line"></view>
          <view class="item-body">
            <view class="body-labels">
              <text class="label">非战采</text>
              <text class="label">{{ activeTab === '1' ? '年' : '月' }}同比</text>
              <text class="label">预算进度</text>
              <text class="label">战采</text>
              <text class="label">{{ activeTab === '1' ? '年' : '月' }}同比</text>
              <text class="label">预算进度</text>
            </view>
            <view class="body-values">
              <text class="value">{{ item.fzcAmount }}</text>
              <text :class="getColorClass(item.fzcPercent)">{{ item.fzcPercent }}</text>
              <text class="value">{{ item.fzcProgress }}</text>
              <text class="value">{{ item.zcAmount }}</text>
              <text :class="getColorClass(item.zcPercent)">{{ item.zcPercent }}</text>
              <text class="value">{{ item.zcProgress }}</text>
            </view>
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

      <!-- 部门选择弹窗 -->
      <DeptSelectPopup
        v-model:show="showPopup"
        :auth-dept-sales="authDeptSales"
        :current-dept-id="currentDept?.deptId"
        @select="handleDeptSelect"
      />
    </view>
  </view>
  <app-calendar
    ref="calendarRef"
    :startDate="minDate"
    :endDate="maxDate"
    :date="selectedDate"
    @confirm="calendarConfirm"
  />
</template>

<script setup lang="ts">
import { usePurchaseLine } from './composables/use-purchase-line';
import DeptSelectPopup from './components/base/dept-select-popup.vue';
import balanceGross from './components/business/balance-gross.vue';
import { getColorClass } from '@/utils/number';

// 使用 composable
const isInnerFlag = ref(false);
const currentTab = ref('');
const calendarRef = ref<any>(null);
const minDate = ref('2021-01-01');
const maxDate = ref(time.format(new Date(), time.FORMATS.ISO_DATE));

const {
  authDeptSales,
  currentDept,
  activeTab,
  showPopup,
  purchaseDataObj,
  sonObjectStatList,
  goodsSatisfactionData,
  kaPurveyorData,
  turnoverData,
  selectedDate,
  pdloading,
  gsloading,
  kaloading,
  tdloading,
  showDepartData,
  showPurchaseData,
  showItemBox,
  handleDeptSelect,
  getFH,
  loadAllData,
  handleTabChange,
  handleDateSelect,
  handleDeptCardClick,
} = usePurchaseLine();

const openCalendar = () => {
  calendarRef.value?.open?.();
};

const calendarConfirm = async (val: any) => {
  const fulldate = typeof val === 'string' ? val : val?.fulldate;
  if (!fulldate) return;
  await handleDateSelect(new Date(fulldate));
};

// 页面加载
onLoad((options: any) => {
  if (options?.isInner) {
    isInnerFlag.value = !!Number(options.isInner);
  }

  // 如果有路由参数，使用路由参数初始化部门
  if (options?.deptId && options?.deptName) {
    loadAllData(false, true, {
      deptId: options.deptId,
      deptName: options.deptName,
    });
  } else {
    // 否则加载默认部门
    loadAllData(true, true);
  }
});

// 设置默认选中的Tab
watchEffect(() => {
  if (sonObjectStatList.value.length > 0 && !currentTab.value) {
    currentTab.value = sonObjectStatList.value[0].generalObjectId;
  }
});

const handleTrendClick = () => {
  // 跳转到数据趋势页面
  console.log('查看数据趋势');
};

const handleKaPurveyorClick = () => {
  // 跳转到KA供应商列表页面
  router.push(RouteMap.kaPurveyorList, {
    deptId: currentDept.value?.deptId || '',
    deptName: currentDept.value?.deptName || '',
    dateTime: selectedDate.value,
  });
};
</script>

<style lang="scss" scoped>
.purchase-page {
  min-height: 100vh;
  background: #fff;
}

.header {
  height: 144rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  background: #fff;
  box-shadow: 0 8rpx 48rpx rgb(100 101 102 / 8%);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;

  &-left,
  &-right {
    display: flex;
    align-items: center;
    gap: 8rpx;
  }

  .dept-name {
    font-size: 64rpx;
    font-weight: bold;
  }

  .time {
    font-size: 32rpx;
  }
}

.total-content {
  padding-top: 176rpx;
  padding: 176rpx 16rpx 0;
}

.main-content {
  display: flex;
  gap: 20rpx;
}

.daily-sales {
  flex: 5;
  height: 242rpx;
  box-sizing: border-box;
  border-radius: 60rpx;
  padding: 32rpx 40rpx;
  color: white;
  background: #3561f2 url('@/static/images/chashuju-total-bg.webp') no-repeat;
  background-position: 100% 0%;
  background-size: 60%;

  .sales-info {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }

  .label {
    font-size: 28rpx;
  }

  .sub-label {
    font-size: 28rpx;
  }

  .value {
    font-size: 56rpx;
    font-weight: bold;
  }
}

.data-trend {
  flex: 3;
  height: 242rpx;
  box-sizing: border-box;
  border-radius: 60rpx;
  border: 2rpx solid #e7e7e7;
  padding: 32rpx;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-direction: row;
  gap: 16rpx;
  background: white url('~@/static/images/dataTrendBg.svg') no-repeat;
  background-size: 100% 100%;

  .trend-label {
    font-size: 28rpx;
  }
}

goods-info {
  flex: 3;
  height: 242rpx;
  border-radius: 60rpx;
  border: 2rpx solid #e7e7e7;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-around;

  .info-label {
    font-size: 28rpx;
    color: #969799;
  }

  .info-value {
    font-size: 28rpx;
    margin-top: 8rpx;
  }
}

.purchase-data-card {
  margin: 16rpx;
  border: 2rpx solid #e7e7e7;
  border-radius: 60rpx;
  padding: 32rpx;
}

.data-row {
  display: flex;
  gap: 32rpx;
}

.data-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;

  &.border-side {
    border-left: 2rpx solid #ebedf0;
    border-right: 2rpx solid #ebedf0;
    padding: 0 32rpx;
  }

  .item-label {
    font-size: 28rpx;
    color: #969799;
  }

  .item-value {
    font-size: 32rpx;
  }
}

.blue-icon {
  width: 12rpx;
  height: 32rpx;
  background-color: #2271f5;
  border-radius: 6rpx;
}

.card {
  margin: 16rpx;
  border: 2rpx solid #e7e7e7;
  border-radius: 60rpx;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 30rpx 40rpx;
  border-bottom: 2rpx solid #ebedf0;

  .card-title {
    flex: 1;
    font-size: 32rpx;
    font-weight: 500;
  }
}

.card-content {
  display: flex;
  padding: 30rpx;
  gap: 20rpx;
}

.content-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  position: relative;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    right: 0;
    top: 4rpx;
    bottom: 4rpx;
    width: 2rpx;
    background: #ebedf0;
  }

  .label {
    font-size: 24rpx;
    color: #666;
  }

  .value {
    font-size: 48rpx;
    font-weight: bold;
  }

  .growth {
    font-size: 28rpx;
  }
}

.color-normal {
  color: #27ae60;
}

.color-never {
  color: #e74c3c;
}

.loading-container,
.loading {
  padding: 64rpx;
  text-align: center;
  color: #969799;
}

.item-box {
  padding: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.item {
  border: 2rpx solid #e7e7e7;
  border-radius: 40rpx;
}

.item-title {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx 36rpx;
  font-size: 32rpx;
  font-weight: 500;

  .name {
    flex: 1;
    color: #2271f5;
  }

  .count {
    font-size: 28rpx;
  }
}

.item-line {
  height: 2rpx;
  background: #ebedf0;
}

.item-body {
  padding: 20rpx 32rpx 30rpx;
}

.body-labels,
.body-values {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16rpx;

  .label {
    font-size: 24rpx;
    color: #969799;
  }

  .value {
    font-size: 26rpx;
  }
}

.body-values {
  margin-top: 16rpx;
}

.end-tab {
  position: fixed;
  bottom: 72rpx;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 40rpx 0;
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

.depart-data {
  margin: 16rpx;
  border: 2rpx solid #e7e7e7;
  border-radius: 60rpx;
  overflow: hidden;
}

.tabs-header {
  display: flex;
  padding: 16rpx 20rpx;
  gap: 10rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  font-size: 24rpx;
  line-height: 64rpx;
  height: 72rpx;
  border: 2rpx solid #dcdee0;
  border-radius: 30rpx;
  background: #fff;
  transition: all 0.3s;

  &.active {
    color: #fff;
    background: #3561f2;
    border-color: #3561f2;
  }
}

.dept-card {
  padding: 32rpx 40rpx;
  border-top: 2rpx solid #ebedf0;
  border-bottom: 2rpx solid #ebedf0;

  .card-header {
    display: flex;
    align-items: center;
    gap: 16rpx;
    border: none;
    padding: 0;

    .dept-name {
      flex: 1;
      font-size: 32rpx;
    }

    .goods-count {
      font-size: 28rpx;
    }
  }
}

.dept-data-row {
  display: flex;
  padding: 24rpx 32rpx;
  gap: 32rpx;
}

.dept-data-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;

  .data-label {
    font-size: 28rpx;
    color: #969799;
  }

  .data-value {
    font-size: 32rpx;
  }
}
</style>
