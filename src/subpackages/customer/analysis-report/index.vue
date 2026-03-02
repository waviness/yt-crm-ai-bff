<script setup lang="ts">
import { useCustomerAnalysisReport } from './composables/use-customer-analysis-report';

defineOptions(SHARED_STYLE_OPTIONS);

// 使用业务逻辑
const {
  loading,
  error,
  updateTime,
  showAllUnits,
  showAllActivities,
  showDetailModal,
  selectedEvent,
  showRecommendationModal,
  selectedRecommendation,
  visitDetails,
  detailLoading,
  dashboardData,
  displayedMainUnits,
  displayedActivities,
  getTotalEvents,
  getActivityPercentage,
  fetchData,
  showEventDetail,
  closeDetailModal,
  showRecommendationDetail,
  closeRecommendationModal,
  toggleUnits,
  toggleActivities,
} = useCustomerAnalysisReport();

// 路由参数
function getCurIdFromRoute(): number | null {
  const currentRoute = router.getCurrentRoute();
  const curId = Number(currentRoute?.options?.curId);
  if (curId && !isNaN(curId)) {
    return curId;
  }
  return null;
}

const lastFetchedCurId = ref<number | null>(null);
const missingCurIdToastShown = ref(false);

function fetchDataOncePerCurId() {
  const curId = getCurIdFromRoute();
  if (!curId) {
    if (!missingCurIdToastShown.value) {
      missingCurIdToastShown.value = true;
      uni.showToast({
        title: '缺少有效的参数',
        icon: 'none',
      });
    }
    return;
  }

  missingCurIdToastShown.value = false;

  if (lastFetchedCurId.value === curId) {
    return;
  }

  lastFetchedCurId.value = curId;
  fetchData(curId);
}

// 生命周期
onMounted(() => {
  fetchDataOncePerCurId();
});

// 页面激活时刷新
onShow(() => {
  fetchDataOncePerCurId();
});
</script>
<template>
  <view class="dashboard-container">
    <app-watermark />

    <!-- header -->
    <view class="dashboard-header">
      <view class="title">数据分析与重点事项跟进</view>
      <view class="update-time">时间范围:{{ updateTime }}</view>
    </view>

    <!-- 卡片统计 -->
    <view class="card-panel">
      <view class="card-header">
        <view class="blue-icon"></view>
        <view class="unit-name">整体概况</view>
      </view>

      <view v-show="loading" class="d-flex py-8 justify-center align-center">
        <up-loading-icon mode="circle" color="#1989fa" />
      </view>

      <view class="content">
        <view class="stats-row">
          <view class="stat-card">
            <image src="/static/images/kq-icon1.png" class="stat-icon" mode="aspectFit" />
            <view class="stat-name">拜访总次数</view>
            <view class="stat-value">{{ dashboardData.overview.totalVisits || 0 }}</view>
          </view>

          <view class="stat-card">
            <image src="/static/images/kq-icon2.png" class="stat-icon" mode="aspectFit" />
            <view class="stat-name">主要单位数</view>
            <view class="stat-value">
              {{ dashboardData.overview.mainUnits ? dashboardData.overview.mainUnits.length : 0 }}
            </view>
          </view>

          <view class="stat-card">
            <image src="/static/images/kq-icon3.png" class="stat-icon" mode="aspectFit" />
            <view class="stat-name">活跃业务员</view>
            <view class="stat-value">
              {{
                Array.isArray(dashboardData.overview.salespersonActivity)
                  ? dashboardData.overview.salespersonActivity.length
                  : Object.keys(dashboardData.overview.salespersonActivity || {}).length
              }}
            </view>
          </view>

          <view class="stat-card">
            <image src="/static/images/kq-icon4.png" class="stat-icon" mode="aspectFit" />
            <view class="stat-name">重点事件</view>
            <view class="stat-value event-value">{{ getTotalEvents() }}</view>
          </view>
        </view>

        <!-- 主要拜访单位 -->
        <view class="sub-section">
          <view class="sub-header">
            <view class="sub-title" @click="toggleUnits">
              主要拜访单位
              <up-icon
                :name="showAllUnits ? 'arrow-up' : 'arrow-down'"
                class="expand-icon"
              ></up-icon>
            </view>
          </view>
          <view class="units-list in-panel">
            <view v-for="(unit, idx) in displayedMainUnits" :key="'unit-' + idx" class="unit-item">
              <span class="key-customer">重点客户</span>
              <span class="customer-name">{{
                typeof unit === 'object' ? unit.unit || unit.name : unit
              }}</span>
            </view>
          </view>
        </view>

        <!-- 业务员活动频率 -->
        <view class="sub-section">
          <view class="sub-header">
            <view class="sub-title" @click="toggleActivities">
              业务员活动频率
              <up-icon
                :name="showAllActivities ? 'arrow-up' : 'arrow-down'"
                class="expand-icon"
              ></up-icon>
            </view>
          </view>
          <view class="activity-list in-panel">
            <template v-if="displayedActivities && displayedActivities.length">
              <view
                v-for="(item, idx) in displayedActivities"
                :key="'act-' + idx"
                class="activity-item"
              >
                <view class="bar">
                  <view class="bar-bg"></view>
                  <view
                    class="bar-fill"
                    :style="{ width: getActivityPercentage(item.visitCount || 0) + '%' }"
                  ></view>
                </view>
                <view class="activity-row">
                  <view class="name">{{ item.name || '未知' }}</view>
                  <view class="count">{{ item.visitCount || 0 }}</view>
                </view>
              </view>
            </template>
            <view v-else class="empty">暂无数据</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 重点事件 -->
    <view class="card-panel">
      <view class="card-header">
        <view class="blue-icon"></view>
        <view class="unit-name">重点事件（高重要性）</view>
      </view>
      <view class="events-list">
        <view
          class="px-4 py-2"
          v-if="
            dashboardData.keyEvents &&
            dashboardData.keyEvents.some(
              unitEvent => unitEvent.events && unitEvent.events.length > 0
            )
          "
        >
          <view
            v-for="(unitEvent, uidx) in dashboardData.keyEvents"
            :key="uidx"
            class="unit-events"
          >
            <view v-if="unitEvent.unit && unitEvent.unit !== 'keyEvents'" class="unit-name-label">
              {{ unitEvent.unit }}
            </view>
            <view class="unit-events-list">
              <view
                v-for="(e, j) in unitEvent.events || []"
                :key="j"
                class="event-item"
                @click="showEventDetail(e)"
              >
                <span class="event-text">{{ e.keyInfo || '无标题' }}</span>
              </view>
            </view>
          </view>
        </view>
        <view v-else class="empty">暂无重点事件</view>
      </view>
    </view>

    <!-- 推送建议 -->
    <view class="card-panel recommend-panel">
      <view class="card-header">
        <view class="blue-icon"></view>
        <view class="unit-name">推送建议</view>
      </view>

      <view class="recommend-body">
        <!-- 红色:紧急跟进事项 -->
        <view class="recommend-block">
          <view class="group-title"><span class="dot red"></span> 紧急跟进事项</view>
          <view class="rec-list">
            <template
              v-if="
                dashboardData.recommendations &&
                dashboardData.recommendations.urgentFollowUp &&
                dashboardData.recommendations.urgentFollowUp.length
              "
            >
              <view
                v-for="(r, k) in dashboardData.recommendations.urgentFollowUp"
                :key="'urgent-' + k"
                class="rec-item"
                @click="showRecommendationDetail(r)"
              >
                {{ r.description }}
              </view>
            </template>
            <view v-else class="empty">暂无数据</view>
          </view>
        </view>

        <!-- 橙色:领导关注客户 -->
        <view class="recommend-block">
          <view class="group-title"><span class="dot orange"></span> 领导关注客户</view>
          <view class="rec-list">
            <template
              v-if="
                dashboardData.recommendations &&
                dashboardData.recommendations.leadershipAttention &&
                dashboardData.recommendations.leadershipAttention.length
              "
            >
              <view
                v-for="(r, k) in dashboardData.recommendations.leadershipAttention"
                :key="'lead-' + k"
                class="rec-item"
                @click="showRecommendationDetail(r)"
              >
                {{ r.description }}
              </view>
            </template>
            <view v-else class="empty">暂无数据</view>
          </view>
        </view>

        <!-- 紫色:潜在风险与机遇 -->
        <view class="recommend-block">
          <view class="group-title"><span class="dot purple"></span> 潜在风险与机遇</view>
          <view class="rec-list">
            <template
              v-if="
                dashboardData.recommendations &&
                dashboardData.recommendations.potentialRisksOpportunities &&
                dashboardData.recommendations.potentialRisksOpportunities.length
              "
            >
              <view
                v-for="(r, k) in dashboardData.recommendations.potentialRisksOpportunities"
                :key="'risk-' + k"
                class="rec-item"
                @click="showRecommendationDetail(r)"
              >
                {{ r.description }}
              </view>
            </template>
            <view v-else class="empty">暂无数据</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 事件详情模态框 -->
    <up-popup :show="showDetailModal" mode="center" :round="16" closeable @close="closeDetailModal">
      <view class="detail-modal">
        <view class="modal-head">
          <view class="modal-title">事件详情</view>
        </view>
        <view class="modal-body">
          <view><strong>关键信息:</strong> {{ selectedEvent.keyInfo }}</view>

          <view v-if="detailLoading" class="loading-center">
            <up-loading-icon mode="circle" color="#1989fa" />
            <view class="loading-text">加载拜访记录详情中...</view>
          </view>

          <view v-else-if="visitDetails && visitDetails.length > 0" class="visit-details-container">
            <view v-for="(detail, index) in visitDetails" :key="index" class="visit-detail-item">
              <view v-if="visitDetails.length > 1" class="detail-separator">
                <span>记录 {{ index + 1 }}</span>
              </view>

              <view class="company-name-row">
                <span class="company-name">{{ detail.companyName }}</span>
              </view>

              <view class="company-type-row">
                <span v-if="detail.companyType" class="company-type">{{ detail.companyType }}</span>
                <span class="visit-time">{{ detail.visitTime }}</span>
              </view>

              <view class="visit-person-info">
                <view class="person-name">
                  <span class="visitor-name">{{ detail.visitUserName }}</span>
                  <span class="initiator-info">(发起人:{{ detail.creName }})</span>
                </view>
                <view class="task-type">{{ detail.taskType }}</view>
              </view>

              <view
                v-if="detail.crmLabelRemarkDtoList && detail.crmLabelRemarkDtoList.length > 0"
                class="crm-info"
              >
                <view class="crm-label">客情事件信息</view>
                <view class="crm-content">
                  <view
                    v-for="(crmItem, crmIndex) in detail.crmLabelRemarkDtoList"
                    :key="crmIndex"
                    class="crm-item"
                  >
                    {{ crmItem.labelName }}:{{ crmItem.remark || '暂无' }}
                  </view>
                </view>
              </view>
            </view>
          </view>

          <view v-else-if="!detailLoading" class="empty-state">
            <view>暂无拜访记录详情</view>
          </view>
        </view>
      </view>
    </up-popup>

    <!-- 推荐详情模态框 -->
    <up-popup
      :show="showRecommendationModal"
      mode="center"
      :round="16"
      closeable
      @close="closeRecommendationModal"
    >
      <view class="detail-modal">
        <view class="modal-head">
          <view class="modal-title">推送建议详情</view>
        </view>
        <view class="modal-body">
          <view><strong>建议内容:</strong> {{ selectedRecommendation.description }}</view>
          <view><strong>相关客户ID:</strong> {{ selectedRecommendation.cuvIds.join(', ') }}</view>
          <view v-if="selectedRecommendation.type">
            <strong>类型:</strong> {{ selectedRecommendation.type }}
          </view>

          <view v-if="detailLoading" class="loading-center">
            <up-loading-icon mode="circle" color="#1989fa" />
            <view class="loading-text">加载拜访记录详情中...</view>
          </view>

          <view v-else-if="visitDetails && visitDetails.length > 0" class="visit-details-container">
            <view v-for="(detail, index) in visitDetails" :key="index" class="visit-detail-item">
              <view v-if="visitDetails.length > 1" class="detail-separator">
                <span>记录 {{ index + 1 }}</span>
              </view>

              <view class="company-name-row">
                <span class="company-name">{{ detail.companyName }}</span>
              </view>

              <view class="company-type-row">
                <span v-if="detail.companyType" class="company-type">{{ detail.companyType }}</span>
                <span class="visit-time">{{ detail.visitTime }}</span>
              </view>

              <view class="visit-person-info">
                <view class="person-name">
                  <span class="visitor-name">{{ detail.visitUserName }}</span>
                  <span class="initiator-info">(发起人:{{ detail.creName }})</span>
                </view>
                <view class="task-type">{{ detail.taskType }}</view>
              </view>

              <view
                v-if="detail.crmLabelRemarkDtoList && detail.crmLabelRemarkDtoList.length > 0"
                class="crm-info"
              >
                <view class="crm-label">客情事件信息</view>
                <view class="crm-content">
                  <view
                    v-for="(crmItem, crmIndex) in detail.crmLabelRemarkDtoList"
                    :key="crmIndex"
                    class="crm-item"
                  >
                    {{ crmItem.labelName }}:{{ crmItem.remark || '暂无' }}
                  </view>
                </view>
              </view>
            </view>
          </view>

          <view v-else-if="!detailLoading" class="empty-state">
            <view>暂无拜访记录详情</view>
          </view>
        </view>
      </view>
    </up-popup>
  </view>
</template>

<style lang="scss" scoped>
.dashboard-container {
  padding: 16px;

  .dashboard-header {
    margin-bottom: 12px;

    .title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .update-time {
      margin-top: 6px;
      color: #999;
      font-size: 12px;
    }
  }

  .card-panel {
    background: #fff;
    border-radius: 30px;
    border: 1px solid #e7e7e7;
    width: 100%;
    max-width: 500px;
    padding-bottom: 16px;
    margin-bottom: 10px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    color: #333;
    border-bottom: 1px solid #ebedf0;
    padding: 15px 20px;
  }

  .blue-icon {
    width: 6px;
    height: 16px;
    background-color: #2271f5;
    border-radius: 3px;
    margin-right: 8px;
    align-self: center;
  }

  .unit-name {
    font-size: 16px;
    flex: 1;
  }

  .content {
    padding: 12px;
  }

  .stats-row {
    display: flex;
    gap: 12px;
    align-items: stretch;
  }

  .stat-card {
    flex: 1;
    min-width: 0;
    background: #fff;
    border-radius: 12px;
    padding: 12px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    border: 1px solid #f0f0f0;
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.02) inset;
  }

  .stat-icon {
    width: 22px;
    height: 22px;
    display: block;
  }

  .stat-name {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.65);
    margin: 10px 0 9px 0;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    line-height: 1.4;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: #2b6be6;
    line-height: 1;
  }

  .event-value {
    color: #ea394b;
  }

  .key-customer {
    background: #e8f2ff;
    color: #2b6be6;
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 12px;
    margin-right: 10px;
  }

  .customer-name {
    font-size: 14px;
    color: #333;
  }

  .sub-section {
    margin-top: 12px;

    .sub-header {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px solid #ececec;

      .sub-title {
        font-size: 14px;
        color: #666;
        cursor: pointer;
        display: flex;
        align-items: center;

        .expand-icon {
          font-size: 16px;
          margin-left: 4px;
        }
      }
    }

    .in-panel {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .unit-item {
      display: flex;
      align-items: center;
      background: #fff;
      border-radius: 22px;
      padding: 10px 14px;
      border: 1px solid #f0f0f0;
    }

    .activity-item {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .activity-row {
        display: flex;
        justify-content: space-between;

        .name {
          color: #333;
          font-size: 14px;
        }

        .count {
          color: #2b6be6;
          font-size: 14px;
        }
      }

      .bar {
        position: relative;
        height: 10px;
        border-radius: 6px;
        background: transparent;

        .bar-bg {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          background: #f0f0f0;
          border-radius: 6px;
        }

        .bar-fill {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          background: #2b6be6;
          border-radius: 6px;
        }
      }
    }
  }

  .empty {
    color: #999;
    text-align: center;
    padding: 12px 0;
  }

  .unit-events {
    background: #f3f3f3;
    border-radius: 12px;
    padding: 8px 4px 2px 4px;
    margin-bottom: 12px;
  }

  .unit-events-list {
    list-style-type: none;
    padding-left: 16px;
    margin: 0;
  }

  .event-item {
    position: relative;
    padding-left: 16px;
    margin-bottom: 8px;
    cursor: pointer;

    &::before {
      content: '•';
      position: absolute;
      left: 0;
      color: #333;
    }
  }

  .event-text {
    font-size: 14px;
    line-height: 1.5;
  }

  .unit-name-label {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
    color: #333;
  }

  .recommend-panel {
    padding: 0 0 12px 0;

    .recommend-body {
      padding: 12px 16px;
    }

    .recommend-block {
      padding: 8px 0 14px 0;
      border-bottom: 1px solid #ececec;

      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }

      .group-title {
        display: flex;
        align-items: center;
        font-weight: 600;
        margin-bottom: 10px;
        font-size: 14px;

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 8px;

          &.red {
            background: #ff5b5b;
          }

          &.orange {
            background: #ff9f43;
          }

          &.purple {
            background: #7c4dff;
          }
        }
      }

      .rec-list {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .rec-item {
          font-size: 14px;
          background: #f6f6f6;
          padding: 12px 14px;
          border-radius: 10px;
          color: #333;
          cursor: pointer;
          transition: all 0.3s ease;

          &:active {
            background: #e8ecf3;
          }
        }
      }
    }
  }

  .detail-modal {
    width: 90vw;
    max-width: 560px;
    background: #fff;
    border-radius: 8px;
    overflow: hidden;

    .modal-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #eee;

      .modal-title {
        font-size: 16px;
        font-weight: 700;
      }
    }

    .modal-body {
      padding: 20px;
      color: #333;
      font-size: 14px;
      line-height: 1.8;
      max-height: 60vh;
      overflow-y: auto;
    }

    .loading-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px 0;
    }

    .loading-text {
      margin-top: 10px;
      color: #666;
      font-size: 14px;
    }

    .visit-details-container {
      margin-top: 16px;
      border-radius: 8px;
      width: 100%;
      box-sizing: border-box;
      line-height: 1.6;
    }

    .visit-detail-item {
      margin-bottom: 16px;
      background-color: white;
      padding: 12px;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      &:last-child {
        margin-bottom: 0;
      }
    }

    .detail-separator {
      padding: 6px 0;
      border-bottom: 1px solid #eee;
      margin-bottom: 12px;
      font-weight: bold;
      color: #1989fa;
    }

    .company-name-row {
      margin-bottom: 6px;
    }

    .company-type-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .company-name {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .company-type {
      font-size: 12px;
      color: #7c4dff;
      padding: 2px 6px;
      border-radius: 4px;
      background-color: #f0ebff;
    }

    .visit-time {
      font-size: 12px;
      color: #666;
    }

    .visit-person-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .person-name {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #333;
    }

    .visitor-name {
      font-weight: 600;
      font-size: 14px;
    }

    .initiator-info {
      font-size: 12px;
      color: #999;
    }

    .task-type {
      font-size: 12px;
      color: white;
      padding: 4px 10px;
      border-radius: 12px;
      background-color: #2271f5;
    }

    .crm-info {
      margin-top: 12px;
    }

    .crm-label {
      font-size: 12px;
      color: #1989fa;
      margin-bottom: 8px;
    }

    .crm-content {
      background-color: #f8f8f8;
      border-radius: 6px;
      padding: 10px;
    }

    .crm-item {
      font-size: 13px;
      color: #333;
      line-height: 1.5;
    }

    .empty-state {
      text-align: center;
      color: #999;
      padding: 40px 0;
      margin-top: 20px;
      border-top: 1px solid #eee;
    }
  }
}
</style>
