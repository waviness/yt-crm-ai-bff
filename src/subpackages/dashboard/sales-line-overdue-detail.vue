<template>
  <view class="pb-100">
    <up-sticky style="background-color: white; top: 0">
      <view class="px-10 py-2 text-16 page-title">
        {{ +active === 1 ? '逾期' : +active === 2 ? '应收' : +active === 3 ? '长账龄' : '' }}详情
      </view>

      <!-- 长账龄头部信息 -->
      <view v-if="+active === 3" class="bg-white pa-2">
        <view class="flex align-center justify-between mb-2">
          <view class="flex align-center">
            <view class="type-circle bg-danger mr-2"></view>
            <text class="text-14 font-bold">一年期以上长账龄</text>
          </view>
          <text class="text-12">{{ detailInfo.deptName }}</text>
        </view>
        <view class="text-14 color-gray-5 py-1 font-500">
          {{ detailInfo.customId }}/{{ detailInfo.customName }}
        </view>
        <view class="flex mb-2">
          <view class="flex-1 flex flex-col">
            <text class="color-gray-4 pb-1 text-12">总金额</text>
            <text class="color-gray-5 text-16 font-500">{{ detailInfo.receivable }}</text>
          </view>
          <view class="flex-1 flex flex-col">
            <text class="color-gray-4 pb-1 text-12">1-2年</text>
            <text class="color-gray-5 text-16 font-500">{{ detailInfo.receivable12year }}</text>
          </view>
          <view class="flex-1 flex flex-col">
            <text class="color-gray-4 pb-1 text-12">2-3年</text>
            <text class="color-gray-5 text-16 font-500">{{ detailInfo.receivable23year }}</text>
          </view>
        </view>
        <view class="flex">
          <view class="flex-1 flex flex-col">
            <text class="color-gray-4 pb-1 text-12">3-4年</text>
            <text class="color-gray-5 text-16 font-500">{{ detailInfo.receivable34year }}</text>
          </view>
          <view class="flex-1 flex flex-col">
            <text class="color-gray-4 pb-1 text-12">4-5年</text>
            <text class="color-gray-5 text-16 font-500">{{ detailInfo.receivable45year }}</text>
          </view>
          <view class="flex-1 flex flex-col">
            <text class="color-gray-4 pb-1 text-12">5年以上</text>
            <text class="color-gray-5 text-16 font-500">{{ detailInfo.receivable5year }}</text>
          </view>
        </view>
      </view>
    </up-sticky>

    <!-- 长账龄列表 -->
    <app-pull-refresh
      v-if="+active === 3"
      :refreshing="refreshing"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <view class="px-2 pt-2">
        <view v-for="(data, index) in list" :key="index" class="card-item mb-2">
          <view class="card-content">
            <view class="text-14 color-main py-1 font-bold">
              {{ data.saleId }}/{{ data.saleName }}
            </view>
            <view class="flex mb-2">
              <view class="flex-1 flex flex-col">
                <text class="color-gray-4 pb-1 text-12">总金额</text>
                <text class="color-gray-5 text-16 font-500">{{ data.receivable }}</text>
              </view>
              <view class="flex-1 flex flex-col">
                <text class="color-gray-4 pb-1 text-12">1-2年</text>
                <text class="color-gray-5 text-16 font-500">{{ data.receivable12year }}</text>
              </view>
              <view class="flex-1 flex flex-col">
                <text class="color-gray-4 pb-1 text-12">2-3年</text>
                <text class="color-gray-5 text-16 font-500">{{ data.receivable23year }}</text>
              </view>
            </view>
            <view class="flex">
              <view class="flex-1 flex flex-col">
                <text class="color-gray-4 pb-1 text-12">3-4年</text>
                <text class="color-gray-5 text-16 font-500">{{ data.receivable34year }}</text>
              </view>
              <view class="flex-1 flex flex-col">
                <text class="color-gray-4 pb-1 text-12">4-5年</text>
                <text class="color-gray-5 text-16 font-500">{{ data.receivable45year }}</text>
              </view>
              <view class="flex-1 flex flex-col">
                <text class="color-gray-4 pb-1 text-12">5年以上</text>
                <text class="color-gray-5 text-16 font-500">{{ data.receivable5year }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <app-empty v-if="!loading && !list.length" class="mt-6" />
    </app-pull-refresh>

    <!-- 逾期/应收详情 -->
    <view v-if="+active === 1 || +active === 2">
      <!-- 类型标签 -->
      <view class="flex align-center px-10 py-2">
        <view :class="['type-circle mr-2', typeClass]"></view>
        <text class="text-14 font-bold">{{ typeName }}</text>
      </view>

      <!-- 详情列表 -->
      <u-cell-group>
        <cell
          title="客户信息"
          :value="detail.customId ? `${detail.customId}/${detail.customName}` : ''"
          class="mt-2"
        />
        <cell title="核算单元" :value="detail.entryId" class="mt-2" />
        <cell v-if="+active === 2" title="应收账款" :value="detail.receivable || 0" class="mt-2" />
        <cell
          title="已逾期"
          :value="detail.overdueAmount || 0"
          valueClass="color-danger font-500"
          class="mt-2"
        />
        <cell title="预收未处理" :value="detail.advanceAmount || 0" class="mt-2" />
        <cell
          title="剩余信额"
          :value="
            detail.creditAmount !== undefined && detail.creditAmount !== null
              ? detail.creditAmount
              : '-'
          "
          class="mt-2"
        />
        <cell title="信保状态" :value="creditStatusText" class="mt-2" />
        <cell
          v-if="+active === 1"
          title="逾期填报原因"
          :value="latestOverdueRemark.reason || '-'"
          :is-link="true"
          @click="showReasonModal = true"
          class="mt-2"
        />
      </u-cell-group>

      <!-- 逾期特有字段 -->
      <u-cell-group v-if="+active === 1">
        <cell title="信用天数" :value="detail.creditDays" class="mt-2" />
        <cell title="最长逾期天数" :value="detail.maxDay" class="mt-2" />
      </u-cell-group>

      <!-- 账款分布 -->
      <view v-if="+active === 1" class="bg-white mt-2 py-10 px-4">
        <view class="color-gray-5 text-14 mb-2">逾期金额到期分布</view>
        <account-list
          :list="detailList"
          dateKey="overdueDate"
          valKey="overdueAmount"
          type="danger"
        />
      </view>

      <view v-if="+active === 2" class="bg-white mt-2 py-10 px-4">
        <view class="color-gray-5 text-14 mb-2">应收金额（根据发货单确认日期）</view>
        <account-list :list="detailList" dateKey="billDate" valKey="billAmount" />
      </view>

      <!-- 数据说明 -->
      <data-desc
        v-if="+active === 1"
        presentText="数据更新于本月第一个工作日，待财务勾对后，以第六个工作日展示的数据为准"
      />
      <data-desc
        v-if="+active === 2"
        presentText="以上数据统计截止至昨日23:59"
        nextText="下次更新时间为今日23:59"
      />
    </view>

    <!-- 逾期原因弹窗 -->
    <u-popup v-model="showReasonModal" mode="center" :round="10">
      <view class="reason-modal">
        <view class="reason-header">
          <text class="reason-title">逾期填报原因</text>
          <u-icon name="close" size="20" @click="showReasonModal = false" />
        </view>
        <view class="reason-content">
          <view v-if="detail.overdueRemark && detail.overdueRemark.length">
            <view v-for="(item, idx) in detail.overdueRemark" :key="idx" class="reason-item">
              <view class="reason-date">{{ item.creDate ? item.creDate.substr(0, 10) : '-' }}</view>
              <view class="reason-fields">
                <text class="reason-label">原因：</text>
                <text class="reason-main">{{ item.reason || '-' }}</text>
              </view>
              <view v-if="idx !== detail.overdueRemark.length - 1" class="divider"></view>
            </view>
          </view>
          <view v-else class="reason-empty">暂无填报原因</view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script lang="ts" setup>
import accountList from './components/base/account-list.vue';
import dataDesc from '@/components/base/data-desc.vue';
import cell from '@/components/base/cell.vue';
import { useOverdueDetailInfo } from './composables/use-overdue-detail-info';

const active = ref('');
const detailInfo = ref<any>({});
const showReasonModal = ref(false);

const {
  detail,
  detailList,
  loading,
  typeName,
  typeClass,
  creditStatusText,
  latestOverdueRemark,
  getOverdueDetail,
  getReceivableDetail,
  fetchLongAccountsList,
} = useOverdueDetailInfo(active, detailInfo);

// 长账龄分页
const pagination = usePagination(
  {
    pageSize: 20,
    initialPage: 1,
    toolBarHeight: 145,
  },
  fetchLongAccountsList
);

const {
  list,
  refreshing,
  loadmoreConfig,
  pullRefreshHeight,
  onRefresh,
  onLoadMore,
  calcPullRefreshHeight,
} = pagination;

onLoad(options => {
  active.value = options.active || '';

  // 从storage获取详情信息
  const storedInfo = uni.getStorageSync('overdueDetailInfo');
  if (storedInfo) {
    detailInfo.value = storedInfo;
  }

  // 根据类型加载数据
  if (+active.value === 1) {
    getOverdueDetail();
  } else if (+active.value === 2) {
    getReceivableDetail();
  } else if (+active.value === 3) {
    calcPullRefreshHeight();
    onRefresh();
  }
});
</script>

<style lang="scss" scoped>
.page-title {
  background: #f7f8fa;
  font-weight: 500;
}

.type-circle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transform: translateY(4px);
}

.bg-danger {
  background-color: #ee0a24;
}

.bg-warning {
  background-color: #ff976a;
}

.card-item {
  background: linear-gradient(180deg, #f5f5f5 0%, #fff 20px);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
}

.card-content {
  background: #fff;
  padding: 10px;
  border-radius: 8px;
}

.reason-modal {
  width: 80vw;
  max-height: 70vh;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
}

.reason-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #ebedf0;
}

.reason-title {
  font-size: 16px;
  font-weight: 500;
}

.reason-content {
  padding: 15px 20px;
  max-height: 50vh;
  overflow-y: auto;
}

.reason-item {
  margin-bottom: 12px;
}

.reason-date {
  font-size: 13px;
  color: #999;
  margin-bottom: 4px;
  font-weight: bold;
}

.reason-fields {
  display: flex;
  align-items: flex-start;
  font-size: 15px;
}

.reason-label {
  color: #888;
  font-weight: bold;
  margin-right: 4px;
  white-space: nowrap;
  flex-shrink: 0;
}

.reason-main {
  color: #222;
  word-break: break-all;
  flex: 1;
}

.reason-empty {
  text-align: center;
  color: #999;
  padding: 20px 0;
}

.divider {
  border-bottom: 1px solid #e7e7e7;
  margin: 10px 0;
}
</style>
