<template>
  <view style="height: 100vh">
    <app-watermark> </app-watermark>
    <up-sticky style="background-color: white; top: 0">
      <lockFilterPop
        :conType="conType"
        :role="role"
        :form-data="formData"
        :querySelfNumber="querySelfNumber"
        @confirm="fliterConfirm"
      />
      <app-tabs
        :disabled="messageEntry"
        :current="tabActive"
        :list="tabList"
        @change="({ index }: { index: number }) => handleActiveChange(index)"
      />
      <!-- <up-tabs :list="tabList" :active="tabActive" @change="handleActiveChange" /> -->
    </up-sticky>

    <app-pull-refresh
      :refreshing="refreshing"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <view class="px-10 pt-10">
        <lockList
          v-for="(item, index) in list"
          :index="index"
          :con-type="conType"
          :role="role"
          :item="item"
          :tab-type="tabActive"
          :key="item.taskId + '' + index"
          :select-label-flag="selectLabelFlag"
          @detailClick="detailClick(item, index)"
          @changeCheckClick="changeCheckClick(index, item)"
          @subscribeClick="type => subscribeClick(type, item)"
        />

        <app-empty v-show="!list.length && !refreshing" class="py-7" description="暂无数据" />
      </view>
    </app-pull-refresh>

    <app-bottom-actions style="padding: 0 4px">
      <view class="w-full flex justify-center">
        <up-button
          @click="batchUnlockClick"
          icon="lock-open"
          v-if="
            !selectLabelFlag &&
            (conType === 2 || conType === 3 || conType === 5) &&
            role === 2 &&
            (querySelfNumber === 1 || managementAllowOperation) &&
            tabActive === 0
          "
          type="primary"
          plain
          shape="circle"
          :customStyle="{
            width: '100px',
            'font-size': '12px',
            margin: '0px 4px',
          }"
        >
          批量解锁
        </up-button>

        <up-button
          v-if="selectLabelFlag"
          @click="batchUnlockClick"
          type="info"
          plain
          shape="circle"
          :customStyle="{
            width: '100px',
            'font-size': '12px',
            margin: '0px 4px',
          }"
        >
          取消
        </up-button>

        <up-button
          v-if="selectLabelFlag"
          @click="deblockingClick(2)"
          type="success"
          plain
          shape="circle"
          :customStyle="{
            width: '100px',
            'font-size': '12px',
            margin: '0px 4px',
          }"
        >
          同意
        </up-button>
        <up-button
          v-if="selectLabelFlag"
          @click="deblockingClick(-1)"
          type="error"
          plain
          shape="circle"
          :customStyle="{
            width: '100px',
            'font-size': '12px',
            margin: '0px 4px',
          }"
        >
          不同意
        </up-button>

        <app-action-btn
          v-if="!selectLabelFlag"
          customClass="px-3"
          @click="orderClick"
          icon="shaixuanfilter1"
          type="plain"
          :multi="false"
          :text="` 当前${
            orderByTimeCustomer === 0
              ? '按时间降序'
              : orderByTimeCustomer === 1
                ? '按时间升序'
                : orderByTimeCustomer === 2
                  ? '按客户ID降序'
                  : orderByTimeCustomer === 3
                    ? '按客户ID升序'
                    : ''
          }`"
        />
        <app-action-btn
          v-if="!selectLabelFlag"
          customClass="ml-1 px-3"
          style="font-size: 12px"
          type="plain"
          @click="justSelfClick"
          :text="querySelfNumber === 1 ? '显示全部' : '显示与我相关'"
          plain
        />
      </view>
    </app-bottom-actions>
    <app-action-sheet
      v-model:show="showFilter"
      :actions="orderOptions"
      description="排序选择"
      @select="handleOrderSelect"
    />
    <up-popup
      :show="batchPopFlag"
      :zIndex="999"
      mode="bottom"
      round="16"
      customStyle="height: 90vh;overflow: auto"
      @close="batchPopFlag = false"
    >
      <view class="px-4 pt-4 pb-100">
        <view class="header text-14 text-center font-bold">批量订单</view>
        <view class="positionR mb-2" v-for="(item, index) in selectObjList" :key="index">
          <view class="common-list-content">
            <view class="flex justify-between font-bold text-14 py-2">
              <text>{{ item.taskId }}</text>
              <text>{{ item.createTime }}</text>
            </view>
            <lockRow :leftLabel="'核算单元'" :leftValue="item.entryId + '/' + item.entryName">
            </lockRow>
            <lockRow :leftLabel="'客户'" :leftValue="item.customerId + '/' + item.customerName">
            </lockRow>
            <lockRow :leftLabel="'品种'" :leftValue="item.goodsId + '/' + item.goodsName">
            </lockRow>
            <lockRow leftLabel="解锁意见" left-class="color-success" leftValue="同意"> </lockRow>
            <up-form>
              <app-form-item style="padding: 0" label="解锁数量">
                <up-input
                  v-model="item.agreeNumber"
                  placeholder="请输入解锁数量"
                  inputAlign="right"
                  fontSize="28rpx"
                  border="none"
                />
              </app-form-item>

              <app-form-item style="padding: 0" label="调整合同价" v-if="conType === 2">
                <up-input
                  v-model="item.contractPrice"
                  placeholder="请输入调整合同价"
                  inputAlign="right"
                  fontSize="28rpx"
                  border="none"
                />
              </app-form-item>
              <app-form-item style="padding: 0" label="备注">
                <up-textarea
                  v-model="item.remark"
                  placeholder="请输入备注"
                  height="30px"
                  autoHeight
                ></up-textarea>
              </app-form-item>
            </up-form>
          </view>
        </view>
        <app-bottom-actions>
          <up-button shape="circle" @click="batchPopClick" type="primary">提交</up-button>
          <up-button @click="batchPopFlag = false" shape="circle" class="ml-2" type="info"
            >取消</up-button
          >
        </app-bottom-actions>
        <!-- <view class="commonButton-footer d-flex justify-center">
            <button
              size="small"
              round
              @click="batchPopFlag = false"
              class="cu-btn bg-white text-gray"
            >
              取消
            </button>
            <button size="small" class="cu-btn bg-blue text-white" @click="batchPopClick" round>
              确定
            </button>
          </view>
        </view> -->
      </view>
    </up-popup>
  </view>
</template>

<script lang="ts" setup>
import type { FilterValues } from './types';
import lockFilterPop from './components/base/lock-filter-pop.vue';
import { useLockIndex } from './composables/use-lock-index';
import lockList from './components/business/lock-list.vue';
import lockRow from './components/base/lock-row.vue';
const appStore = useAppStore();

const {
  formData,
  role,
  conType,
  tabList,
  tabActive,
  managementAllowOperation,
  selectLabelFlag,
  rowIndex,
  orderByTimeCustomer,
  showFilter,
  orderOptions,
  selectObjList,
  batchPopFlag,
  list,
  refreshing,
  loadmoreConfig,
  pullRefreshHeight,
  querySelfNumber,
  messageEntry,
  onRefresh,
  onLoadMore,
  calcPullRefreshHeight,
  removeRow,
  init,
  subscribeClick,
  changeCheckClick,
  handleActiveChange,
  fliterConfirm,
  detailClick,
  justSelfClick,
  orderClick,
  batchUnlockClick,
  handleOrderSelect,
  deblockingClick,
  batchPopClick,
} = useLockIndex();

onActivated(() => {
  if (appStore.hadDoneOnDetail) {
    if (rowIndex.value >= 0) {
      removeRow(rowIndex.value);
    }
    appStore.setHadDoneOnDetail(false);
  }
});
onLoad(async (options: any) => {
  try {
    const endTime = time.format(new Date(), time.FORMATS.ISO_DATE);
    const startTime = time.format(time.add(new Date(endTime), -30, 'day'), time.FORMATS.ISO_DATE);
    Object.assign(formData.value, {
      endTime,
      startTime,
    });
    console.log('option');
    console.log(options);
    await init({
      ...options,
    });
    calcPullRefreshHeight();
    onRefresh();
  } catch (error) {
    console.error('页面初始化失败:', error);
    showError('页面初始化失败');
  }
});
</script>

<style lang="scss" scoped></style>
