<script setup lang="ts">
import { CustomerFollowService } from '@/api/customer-follow';
import { DashboardService } from '@/api/dashboard';
import time from '@/utils/time';
import { formatNumber } from '@/utils/number';
import router from '@/utils/router';
import { useRoute } from 'vue-router';

// 定义props
interface Props {
  createTime?: string;
  curpId?: string;
  customerId?: string;
  customerName?: string;
  entryId?: string;
  entryName?: string;
  userId?: string;
  contactName?: string;
  showButtons?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  createTime: '',
  curpId: '',
  customerId: '',
  customerName: '',
  entryId: '',
  entryName: '',
  userId: '',
  contactName: '',
  showButtons: true,
});

const route = useRoute();

// 页面参数
const pageParams = ref({
  createTime: '',
  curpId: '',
  customerId: '',
  customerName: '',
  entryId: '',
  entryName: '',
  userId: '',
  contactName: '',
  showButtons: true,
});

// 标签页状态
const activeTab = ref(0);
const expandedItems = ref<Record<string, boolean>>({});

// 数据字段
const currentDayMoney = ref(0);
const visitCount = ref(0);
const monthSalesAmount = ref(0);
const lastYearMonthSalesAmount = ref(0);
const yearSalesAmount = ref(0);
const lastYearSalesAmount = ref(0);
const monthOnMonthPercent = ref(0);
const yearOnYearPercent = ref(0);

// 品种分析相关数据
const lostGoodsAnalyze = ref<any[]>([]);
const addGoodsAnalyze = ref<any[]>([]);

// 市场建议相关数据
const marketSuggestions = ref<any[]>([]);

// 弹窗相关
const popupVisible = ref(false);
const lostGoodsDetail = ref<any[]>([]);
const newGoodsDetail = ref<any[]>([]);
const loading = ref(false);

// 货币转换(元转万元)
const yToW = (value: any): string => {
  if (!value && value !== 0) return '-';
  const num = Number(value);
  if (isNaN(num)) return '-';
  return (num / 10000).toFixed(2);
};

// 获取符号
const getFH = (numberValue: number): string => {
  return numberValue > 0 ? '+' : '';
};

// 获取百分比颜色类名
const getPercentClass = (percent: number): string => {
  if (!percent && percent !== 0) return 'positive';
  return percent >= 0 ? 'positive' : 'negative';
};

// 格式化日期
const formatDate = (dateString: string = ''): string => {
  const dateToFormat = dateString || pageParams.value.createTime;
  if (!dateToFormat) return '';
  return time.format(new Date(dateToFormat), 'yyyy-MM-dd');
};

// 切换详情展开/收起状态
const toggleDetail = (key: string) => {
  expandedItems.value[key] = !expandedItems.value[key];
};

// 获取近30天拜访次数
const fetchVisitCount = async () => {
  try {
    const response = await CustomerFollowService.chashujuGetUserVisitWx({
      companyId: pageParams.value.customerId,
      startTime: time.format(time.add(new Date(), -30, 'day'), time.FORMATS.ISO_DATE),
      endTime: time.format(new Date(), time.FORMATS.ISO_DATE),
      pageNum: 1,
      pageSize: 20,
      userIdList: pageParams.value.userId ? [pageParams.value.userId] : [],
    });
    if (response && response.total) {
      visitCount.value = response.total;
    }
  } catch (error) {
    console.error('获取近30天拜访次数失败:', error);
  }
};

// 获取品种分析
const getUvaiGoodsAnalyze = async () => {
  try {
    const response = await CustomerFollowService.getUvaiGoodsAnalyze({
      curpId: pageParams.value.curpId,
    });
    if (response) {
      lostGoodsAnalyze.value = response.lostGoodsAnalyze || [];
      addGoodsAnalyze.value = response.addGoodsAnalyze || [];
    }
  } catch (error) {
    console.error('获取品种分析失败:', error);
  }
};

// 获取市场建议
const getUvaiMarketAnalyze = async () => {
  try {
    const response = await CustomerFollowService.getUvaiMarketAnalyze({
      curpId: pageParams.value.curpId,
    });
    if (response) {
      marketSuggestions.value = response;
    }
  } catch (error) {
    console.error('获取市场建议失败:', error);
  }
};

// 获取销售统计数据
const fetchSaleStat = async () => {
  try {
    const response = await DashboardService.getDataUserCustomerSalesList({
      selectDate: time.format(new Date(), time.FORMATS.ISO_DATE),
      custom: pageParams.value.customerId,
      userId: pageParams.value.userId || undefined,
      pageNum: 1,
      pageSize: 1,
    });
    if (response && response.list && response.list.length > 0) {
      const data = response.list[0];
      currentDayMoney.value = formatNumber(data?.currentDayMoney, 1) || 0;
      monthSalesAmount.value = formatNumber(data?.currentMonthMoney, 1);
      lastYearMonthSalesAmount.value = formatNumber(data?.lyCurrentMonthMoney, 1) || 0;
      yearSalesAmount.value = formatNumber(data?.currentYearMoney, 1) || 0;
      lastYearSalesAmount.value = formatNumber(data?.lyCurrentYearMoney, 1) || 0;
      monthOnMonthPercent.value = formatNumber(data?.monthPercentage, 2) || 0;
      yearOnYearPercent.value = formatNumber(data?.yearPercentage, 2) || 0;
    }
  } catch (error) {
    console.error('获取销售统计数据失败:', error);
  }
};

// 查看全部详情
const viewAllDetails = async () => {
  popupVisible.value = true;
  loading.value = true;
  lostGoodsDetail.value = [];
  newGoodsDetail.value = [];

  try {
    // 获取userId
    const appStore = useAppStore();
    const userId = appStore.userInfor?.userId || pageParams.value.userId;
    const customerId = pageParams.value.customerId;

    const params: any = {
      selectDate: time.format(new Date(), time.FORMATS.ISO_DATE),
      goodsKeyword: '',
      orderColumn: 'currentYearMoney',
      orderType: 0,
      pageNum: 1,
      pageSize: 5,
      userId: userId,
      customerId: customerId,
      hideLoading: true,
      showType: 1, // 1 销售额 2 销售数量
    };

    // 并行请求流失品种和新增品种数据
    const [lostData, newData] = await Promise.all([
      DashboardService.getUserCstmGoodSalesLost({
        selectDate: time.format(new Date(), time.FORMATS.ISO_DATE),
        userId: userId,
        customerId: customerId,
        pageSize: 5,
        pageNum: 1,
      }),
      DashboardService.getFixCustomerNewGoodSalesList(params),
    ]);

    if (lostData && lostData.list) {
      lostGoodsDetail.value = lostData.list || [];
    }

    if (newData && newData.list) {
      newGoodsDetail.value = newData.list || [];
    }
  } catch (error) {
    console.error('获取品种详情数据失败:', error);
    uni.showToast({
      title: '获取数据失败',
      icon: 'none',
    });
  } finally {
    loading.value = false;
  }
};

// 关闭弹窗
const closePopup = () => {
  popupVisible.value = false;
};

// 处理拜访计划
const handleVisitPlan = async (visitPlan: number) => {
  try {
    const response = await CustomerFollowService.updUvaiRcmdPlan({
      curpId: pageParams.value.curpId,
      visitPlan: visitPlan,
    });

    let message = '';
    switch (visitPlan) {
      case 1:
        message = '已设置近30天不再提醒';
        break;
      case 2:
        message = '本次不拜访';
        break;
      case 3:
        message = '已添加至拜访计划';
        break;
    }

    uni.showToast({
      title: message,
      icon: 'success',
    });

    setTimeout(() => {
      router.redirect(RouteMap.customerFollow, {
        needRefresh: 'recommendation',
        timestamp: Date.now(),
        currentTab: 0,
      });
    }, 1500);
  } catch (error) {
    console.error('操作失败:', error);
    uni.showToast({
      title: '操作失败，请稍后重试',
      icon: 'none',
    });
  }
};

// 加载详情数据
const loadDetailData = async () => {
  const appStore = useAppStore();
  const detailObj = appStore.detailObj || {};

  console.log('📋 智能拜访详情页加载, appStore数据:', detailObj);

  // 优先级: Props > AppStore > 路由参数
  pageParams.value = {
    createTime: String(props.createTime || detailObj.createTime || route.query.createTime || ''),
    curpId: String(props.curpId || detailObj.curpId || route.query.curpId || ''),
    customerId: String(
      props.customerId || detailObj.customerId || detailObj.objId || route.query.customerId || ''
    ),
    customerName: String(
      props.customerName ||
        detailObj.customerName ||
        detailObj.objName ||
        route.query.customerName ||
        '客户名称'
    ),
    entryId: String(props.entryId || detailObj.entryId || route.query.entryId || ''),
    entryName: String(props.entryName || detailObj.entryName || route.query.entryName || ''),
    userId: String(props.userId || detailObj.userId || route.query.userId || ''),
    contactName: String(
      props.contactName || detailObj.contactName || route.query.contactName || ''
    ),
    showButtons: props.showButtons !== false || route.query.showButtons !== 'false',
  };

  console.log('📋 最终使用的参数:', pageParams.value);

  const promises = [];

  if (pageParams.value.customerId) {
    promises.push(fetchVisitCount(), fetchSaleStat());
  }

  if (pageParams.value.curpId) {
    promises.push(getUvaiGoodsAnalyze(), getUvaiMarketAnalyze());
  }

  if (promises.length > 0) {
    await Promise.all(promises);
  }
};

// 监听关键属性变化，重新加载数据
watch(
  () => [props.customerId, props.curpId, props.userId],
  () => {
    loadDetailData();
  }
);

// 生命周期
onMounted(() => {
  loadDetailData();
});
</script>

<template>
  <view class="intell-visit-detail">
    <app-watermark />

    <!-- 客户信息卡片 -->
    <view class="customer-info-card">
      <view class="customer-type">
        <view class="type-label">下游客户</view>
        <text class="company-name"
          >{{ pageParams.entryId || '-' }}/{{ pageParams.entryName || '-' }}</text
        >
      </view>
      <view class="customer-details">
        <view class="detail-row">
          <text class="detail-label">客户名称：</text>
          <text class="detail-value"
            >{{ pageParams.customerId || '-' }}/{{ pageParams.customerName || '-' }}</text
          >
        </view>
        <view class="detail-row">
          <text class="detail-label">分支机构：</text>
          <text class="detail-value">{{ pageParams.contactName || '-' }}</text>
        </view>
      </view>
    </view>

    <!-- 数据概览卡片 -->
    <view class="data-overview-card">
      <view class="data-item">
        <view class="data-icon">
          <up-icon name="rmb-circle-fill" color="#fff" size="30" />
        </view>
        <view class="data-info">
          <view class="data-label">当日销售(万元)</view>
          <view class="data-value">{{ currentDayMoney }}</view>
        </view>
      </view>
      <view class="data-item">
        <view class="data-icon">
          <up-icon name="calendar-fill" color="#fff" size="30" />
        </view>
        <view class="data-info">
          <view class="data-label">近30天拜访</view>
          <view class="data-value">{{ visitCount }}次</view>
        </view>
      </view>
    </view>

    <!-- 销售统计卡片 -->
    <view class="sales-stats-card">
      <view class="stats-content">
        <view class="stats-col">
          <view class="stats-label">本月累计</view>
          <view class="stats-value">{{ monthSalesAmount }}</view>
        </view>
        <view class="stats-col">
          <view class="stats-label">去年同期</view>
          <view class="stats-compare-value">{{ lastYearMonthSalesAmount }}</view>
        </view>
        <view class="stats-col">
          <view class="stats-label">同比增长</view>
          <view :class="['stats-growth', getPercentClass(monthOnMonthPercent)]">
            {{ getFH(monthOnMonthPercent) }}{{ monthOnMonthPercent }}%
          </view>
        </view>
      </view>
      <view class="stats-content">
        <view class="stats-col">
          <view class="stats-label">本年累计</view>
          <view class="stats-value">{{ yearSalesAmount }}</view>
        </view>
        <view class="stats-col">
          <view class="stats-label">去年同期</view>
          <view class="stats-compare-value">{{ lastYearSalesAmount }}</view>
        </view>
        <view class="stats-col">
          <view class="stats-label">同比增长</view>
          <view :class="['stats-growth', getPercentClass(yearOnYearPercent)]">
            {{ getFH(yearOnYearPercent) }}{{ yearOnYearPercent }}%
          </view>
        </view>
      </view>
    </view>

    <!-- 品种分析和市场建议切换 -->
    <view class="analysis-tabs">
      <view class="tab-item" :class="{ active: activeTab === 0 }" @click="activeTab = 0">
        <text class="tab-text">品种分析</text>
        <view v-if="activeTab === 0" class="tab-indicator"></view>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 1 }" @click="activeTab = 1">
        <text class="tab-text">市场建议</text>
        <view v-if="activeTab === 1" class="tab-indicator"></view>
      </view>
    </view>

    <!-- 品种分析内容 -->
    <view v-if="activeTab === 0" class="analysis-content">
      <view class="analysis-section">
        <view class="section-title"
          >基于系统交易数据监测 ({{ formatDate(pageParams.createTime) }})</view
        >

        <!-- 流失品种 -->
        <view class="variety-section">
          <view class="section-subtitle">流失品种(TOP5)</view>
          <view class="variety-list">
            <view v-if="lostGoodsAnalyze.length === 0" class="no-data">暂无数据</view>
            <view
              v-for="(item, index) in lostGoodsAnalyze"
              :key="'lost' + index"
              class="variety-item"
            >
              <view class="variety-tag lost-tag" @click="toggleDetail('lost' + index)">
                {{ item.goodsName }}（{{ item.summaryTag }}）
              </view>
              <view v-if="expandedItems['lost' + index]" class="variety-detail">
                <text>{{ item.reason || '暂无详细分析' }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 新增品种 -->
        <view class="variety-section">
          <view class="section-subtitle">新增品种(TOP5)</view>
          <view class="variety-list">
            <view v-if="addGoodsAnalyze.length === 0" class="no-data">暂无数据</view>
            <view
              v-for="(item, index) in addGoodsAnalyze"
              :key="'add' + index"
              class="variety-item"
            >
              <view class="variety-tag new-tag" @click="toggleDetail('add' + index)">
                {{ item.goodsName }}（{{ item.summaryTag }}）
              </view>
              <view v-if="expandedItems['add' + index]" class="variety-detail">
                <text>{{ item.reason || '暂无详细分析' }}</text>
              </view>
            </view>
          </view>

          <!-- 查看详情链接 -->
          <view class="view-detail-link" @click="viewAllDetails">点击查看详情</view>
        </view>
      </view>
    </view>

    <!-- 市场建议内容 -->
    <view v-if="activeTab === 1" class="market-suggestions">
      <view v-if="marketSuggestions.length > 0">
        <view
          v-for="(item, index) in marketSuggestions"
          :key="'suggestion-' + index"
          class="market-card"
        >
          <view class="card-header">
            <view class="category-tag">{{ item.category }}</view>
            <view class="card-title">{{ item.title }}</view>
          </view>
          <view class="card-content">
            <text class="content-text">{{ item.summary }}</text>
          </view>
          <view class="card-footer">
            <a :href="item.sourceUrl" target="_blank" rel="noopener noreferrer" class="source">{{
              item.sourceName || '未知来源'
            }}</a>
            <text v-if="item.completeUrl" style="margin: 0 8px">|</text>
            <a
              v-if="item.completeUrl"
              :href="item.completeUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="source"
            >
              具体链接
            </a>
          </view>
        </view>
      </view>
      <view v-else class="no-data">暂无市场建议数据</view>
    </view>

    <!-- 底部按钮 -->
    <app-bottom-actions v-if="pageParams.showButtons" :count="3">
      <app-action-btn
        @click="handleVisitPlan(1)"
        customClass="px-3 text-12"
        type="plain"
        :multi="false"
        text="近30天不再提醒"
      />
      <app-action-btn
        customClass="ml-2 px-3 text-12"
        @click="handleVisitPlan(2)"
        type="plain"
        :multi="false"
        text="本次不拜访"
      />
      <app-action-btn
        customClass="ml-2 px-3 text-12"
        @click="handleVisitPlan(3)"
        type="primary"
        :multi="false"
        text="添加至拜访计划"
      />
    </app-bottom-actions>

    <!-- 品种分析详情弹窗 -->
    <up-popup :show="popupVisible" mode="bottom" :round="10" @close="closePopup">
      <view class="popup-container">
        <view class="popup-header">
          <text class="popup-title">品种分析详情</text>
          <view class="close-btn" @click="closePopup">
            <up-icon name="close-circle" color="#ccc" size="24"></up-icon>
          </view>
        </view>

        <up-loading-icon v-if="loading" mode="circle" class="popup-loading" />

        <view v-else class="popup-content">
          <!-- 流失品种表格 -->
          <view class="table-section">
            <text class="table-title-1">流失品种(TOP5)</text>
            <scroll-view scroll-x="true" class="table-wrapper">
              <view class="detail-table">
                <view class="table-header">
                  <view class="table-cell table-div-1">货品ID/货品名称</view>
                  <view class="table-cell table-div-2">近30天</view>
                  <view class="table-cell table-div-3">近31-60天</view>
                  <view class="table-cell table-div-4">近61-90天</view>
                  <view class="table-cell table-div-5">最后销售时间</view>
                </view>
                <view v-if="lostGoodsDetail.length === 0" class="table-row">
                  <view class="table-cell no-data" style="text-align: center">暂无数据</view>
                </view>
                <view
                  v-for="(item, index) in lostGoodsDetail"
                  :key="'lost-' + index"
                  class="table-row"
                >
                  <view class="table-cell table-div-1"
                    >{{ item.goodsId || '' }}/{{ item.goodsName || '' }}</view
                  >
                  <view class="table-cell table-div-2">{{
                    yToW(item.thirtyDaysAmount1st) + '万'
                  }}</view>
                  <view class="table-cell table-div-3">{{
                    yToW(item.thirtyDaysAmount2nd) + '万'
                  }}</view>
                  <view class="table-cell table-div-4">{{
                    yToW(item.thirtyDaysAmount3rd) + '万'
                  }}</view>
                  <view class="table-cell table-div-5">{{ item.lastSaleTime || '-' }}</view>
                </view>
              </view>
            </scroll-view>
          </view>

          <!-- 新增品种表格 -->
          <view class="table-section">
            <text class="table-title-2">新增品种(TOP5)</text>
            <scroll-view scroll-x="true" class="table-wrapper">
              <view class="detail-table">
                <view class="table-header">
                  <view class="table-cell table-div-1">货品ID/货品名称</view>
                  <view class="table-cell table-div-2">本月销售</view>
                  <view class="table-cell table-div-2">月同比</view>
                  <view class="table-cell table-div-2">去年整月</view>
                  <view class="table-cell table-div-2">本年累计</view>
                  <view class="table-cell table-div-2">年同比</view>
                  <view class="table-cell table-div-2">去年累计整月</view>
                </view>
                <view v-if="newGoodsDetail.length === 0" class="table-row">
                  <view class="table-cell no-data" style="text-align: center">暂无数据</view>
                </view>
                <view
                  v-for="(item, index) in newGoodsDetail"
                  :key="'new-' + index"
                  class="table-row"
                >
                  <view class="table-cell table-div-1"
                    >{{ item.goodsId || '' }}/{{ item.goodsName || '' }}</view
                  >
                  <view class="table-cell table-div-2">{{
                    yToW(item.currentMonthMoney) + '万'
                  }}</view>
                  <view class="table-cell table-div-2">
                    {{ item.monthPercentage == 1 ? '100%' : item.monthPercentage }}
                  </view>
                  <view class="table-cell table-div-2">
                    {{
                      item.lyCurrentMonthMoney
                        ? yToW(item.lyCurrentMonthMoney) + '万'
                        : item.lyCurrentMonthMoney
                    }}
                  </view>
                  <view class="table-cell table-div-2">{{
                    yToW(item.currentYearMoney) + '万'
                  }}</view>
                  <view class="table-cell table-div-2">
                    {{ item.yearPercentage == 1 ? '100%' : item.yearPercentage }}
                  </view>
                  <view class="table-cell table-div-2">
                    {{
                      item.lyAllYearMonthMoney
                        ? yToW(item.lyAllYearMonthMoney) + '万'
                        : item.lyAllYearMonthMoney
                    }}
                  </view>
                </view>
              </view>
            </scroll-view>
          </view>
        </view>
      </view>
    </up-popup>
  </view>
</template>

<style lang="scss" scoped>
.intell-visit-detail {
  background-color: #f5f6f9;
  min-height: 100vh;
  padding-bottom: 100px;
}

.customer-info-card {
  background-color: #fff;
  margin: 10px 15px;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .customer-type {
    display: flex;
    align-items: center;

    .type-label {
      background-color: #2271f5;
      color: #fff;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
    }

    .company-name {
      color: #333;
      font-size: 14px;
      margin-left: 8px;
    }
  }

  .customer-details {
    margin-top: 12px;

    .detail-row {
      margin-bottom: 8px;

      .detail-label {
        color: #666;
        font-size: 14px;
        display: inline-block;
        width: 80px;
      }

      .detail-value {
        color: #333;
        font-size: 14px;
        word-break: break-all;
      }
    }
  }
}

.data-overview-card {
  display: flex;
  margin: 0 15px 10px;
  background-color: #fff;
  padding: 5px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .data-item {
    flex: 1;
    display: flex;
    align-items: center;
    padding: 5px 10px;

    &:first-child {
      border-right: 1px solid #f0f0f0;
    }

    .data-icon {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background-color: #2271f5;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 5px;
    }

    .data-info {
      display: flex;
      flex-direction: column;

      .data-label {
        font-size: 12px;
        color: #969799;
        margin-bottom: 8px;
      }

      .data-value {
        font-size: 16px;
        color: #3561f2;
        font-weight: bold;
      }
    }
  }
}

.sales-stats-card {
  background-color: #fff;
  margin: 0 15px 10px;
  padding: 15px 5px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .stats-content {
    display: flex;
    margin-bottom: 15px;

    &:last-child {
      margin-bottom: 0;
    }

    .stats-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;

      .stats-label {
        font-size: 14px;
        color: #969799;
        margin-bottom: 4px;
      }

      .stats-value {
        font-size: 16px;
        color: #333;
      }

      .stats-compare-value {
        font-size: 16px;
        color: #2271f5;
      }

      .stats-growth {
        font-size: 16px;

        &.positive {
          color: #00a870;
        }

        &.negative {
          color: #ea394b;
        }
      }
    }
  }
}

// 分析标签页样式 - 圆润矩形包裹
.analysis-tabs {
  display: flex;
  background-color: #fff;
  margin: 0 15px 10px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 4px 20px;

  .tab-item {
    flex: 1;
    text-align: center;
    padding: 8px 0;
    position: relative;

    .tab-text {
      font-size: 14px;
      color: #666;
    }

    &.active .tab-text {
      color: #2271f5;
      font-weight: bold;
    }

    .tab-indicator {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 3px;
      background-color: #2271f5;
      border-radius: 1.5px;
    }
  }
}

.analysis-content {
  background-color: #fff;
  margin: 0 15px 10px;
  padding: 15px;
  border-radius: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .analysis-section {
    .section-title {
      font-size: 14px;
      color: #666;
      margin-bottom: 12px;
    }

    .variety-section {
      margin-bottom: 15px;

      &:last-child {
        margin-bottom: 0;
      }

      .section-subtitle {
        font-size: 14px;
        color: #333;
        font-weight: bold;
        margin-bottom: 10px;
      }

      .variety-list {
        .variety-item {
          display: block;
          border-radius: 6px;
          margin-bottom: 8px;
          font-size: 12px;

          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
  }
}

.variety-tag {
  display: inline-block;
  padding: 4px 12px;
  font-size: 12px;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 10px;

  &.lost-tag {
    background-color: #e34d59;
  }

  &.new-tag {
    background-color: #00a870;
  }
}

.variety-detail {
  background-color: #f7f7f7;
  padding: 12px;
  margin-top: 5px;
  margin-bottom: 15px;
  border-radius: 4px;
  border: 1px solid #e5e5e5;

  text {
    font-size: 14px;
    line-height: 1.6;
    color: #333;
  }
}

.view-detail-link {
  text-align: center;
  margin-top: 20px;
  padding: 10px 0;
  color: #1989fa;
  font-size: 14px;
  border-top: 1px solid #e5e5e5;
  margin-bottom: -15px;
}

.no-data {
  text-align: center;
  color: #999;
  font-size: 14px;
  padding: 20px 0;
}

.market-suggestions {
  margin-bottom: 100px;
  padding: 0 15px;

  .market-card {
    background-color: #fff;
    border-radius: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    margin-bottom: 15px;
    padding: 12px;

    .card-header {
      margin-bottom: 10px;

      .category-tag {
        display: inline-block;
        background-color: #f0f5ff;
        color: #2271f5;
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 4px;
        margin-bottom: 8px;
        font-weight: 500;
      }

      .card-title {
        font-size: 14px;
        color: #333;
        font-weight: bold;
        line-height: 1.4;
      }
    }

    .card-content {
      margin-bottom: 10px;

      .content-text {
        font-size: 13px;
        color: #666;
        line-height: 1.5;
      }
    }

    .card-footer {
      display: flex;
      align-items: center;
      font-size: 11px;
      color: #999;

      .source {
        color: #2271f5;
      }
    }
  }
}

.bottom-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 15px;
  background-color: #fff;
  display: flex;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.popup-container {
  height: 70vh;
  width: 100%;
  max-width: 100vw;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  overflow: hidden;
}

.popup-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;

  .popup-title {
    font-size: 16px;
    font-weight: bold;
    text-align: center;
    flex: 1;
  }

  .close-btn {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1;
  }
}

.popup-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
}

.popup-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 15px 15px 15px;
}

.table-section {
  margin-bottom: 20px;

  .table-title-1,
  .table-title-2 {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 10px;
    display: block;
  }

  .table-title-1 {
    color: #ea394b;
  }

  .table-title-2 {
    color: #00a870;
  }

  .table-wrapper {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    white-space: nowrap; /* 确保不换行 */

    /* 自定义滚动条样式 */
    &::-webkit-scrollbar {
      height: 4px;
      display: block; /* 强制显示滚动条 */
    }

    &::-webkit-scrollbar-thumb {
      background-color: #ccc;
      border-radius: 2px;
    }

    &::-webkit-scrollbar-track {
      background-color: #f5f5f5;
    }
  }

  .detail-table {
    display: inline-block; /* 关键：让表格作为行内块元素，由内容撑开宽度 */
    min-width: 100%;
    font-size: 12px;
    border-collapse: collapse;
    vertical-align: top;

    .table-header {
      display: flex;
      background-color: #f5f6f9;
      font-weight: bold;
      border-bottom: 1px solid #e5e5e5;
      width: fit-content; /* 关键：宽度由内容决定 */
      min-width: 100%;
      align-items: center;
    }

    .table-row {
      display: flex;
      border-bottom: 1px solid #f0f0f0;
      width: fit-content; /* 关键：宽度由内容决定 */
      min-width: 100%;
      align-items: center;

      .table-cell {
        &.no-data {
          width: 100%;
          min-width: 100%;
          flex: 1;
          text-align: center;
          color: #999;
          justify-content: center;
          position: sticky;
          left: 0;
          padding: 20px 0;
        }
      }
    }

    .table-cell {
      width: 90px;
      flex-shrink: 0;
      padding: 8px 6px;
      text-align: center;
      word-break: break-all;
      box-sizing: border-box;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      border-bottom: 1px solid #f0f0f0; /* 添加底部边框 */
    }

    /* 第一列(货品ID/货品名称)样式 */
    .table-cell:first-child {
      width: 180px;
      min-width: 180px;
      max-width: 180px;
      padding-left: 10px;
      text-align: left;
      /* 固定首列 - 移除position:sticky等属性使其可以横向滚动 */
      /* position: sticky; */
      /* left: 0; */
      /* z-index: 2; */
      background-color: inherit;
    }

    /* 最后一列样式 */
    .table-cell:last-child {
      width: 110px;
      min-width: 110px;
      max-width: 110px;
    }

    /* 表头的首列背景色 */
    .table-header .table-cell:first-child {
      background-color: #f5f6f9;
      /* 移除阴影 */
      /* box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05); */
    }

    /* 表格行的首列背景色 */
    .table-row .table-cell:first-child {
      background-color: #fff;
      /* 移除阴影 */
      /* box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05); */
    }
  }
}
</style>
