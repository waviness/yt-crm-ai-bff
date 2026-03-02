<script setup lang="ts">
import { useHighValueDetail } from './composables/use-high-value-detail';

defineOptions(SHARED_STYLE_OPTIONS);

const chgtsId = ref('');
const statusDtl = ref(0);
const type = ref<'info' | 'goods'>('info');

const { info, loading, params, columns, getDetail, onConfirm, getFeedbackTypeText, handleClick } =
  useHighValueDetail(chgtsId, statusDtl);

const showPicker = ref(false);

onLoad((options: any) => {
  chgtsId.value = options.chgtsId;
  statusDtl.value = Number(options.statusDtl);
  type.value = options.type || 'info';
  getDetail();
});
</script>

<template>
  <view class="full-HW text-14 pb-10">
    <app-watermark></app-watermark>

    <view class="text-12 pa-2"> 高值货品{{ statusDtl == 0 ? '未处理' : '已处理' }}信息 </view>

    <!-- 基本信息 -->
    <view class="bg-white mb-2 px-4">
      <app-cell
        title="核算单元"
        :value="`${info.entryId}/${info.entryName}`"
        title-class="color-gray-5"
        value-class="tag-blue"
        border
      >
        <view class="px-1 text-12 color-main bg-main-1 rounded-1">
          {{ info.entryId }}/{{ info.entryName }}
        </view>
      </app-cell>
      <app-cell
        title="客户"
        :value="`${info.customerId}/${info.customerName}`"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
      <app-cell
        title="分支机构"
        :value="info.contactId ? `${info.contactId}/${info.contactName}` : '-'"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
      <app-cell
        title="运输地址"
        :value="info.address"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
      <app-cell
        title="品种"
        :value="`${info.goodsId}/${info.goodsName}`"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
      <app-cell
        title="规格"
        :value="info.goodsType"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
      <app-cell
        title="产地"
        :value="info.prodarea"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
    </view>

    <!-- 详细信息 -->
    <view class="bg-white mb-2 px-4">
      <view class="flex items-center justify-between py-3 border-b border-gray-1">
        <view class="flex items-center justify-between pr-2 flex-1">
          <text class="color-gray-5">销售细单ID</text>
          <text class="color-black-2">{{ info.sadtlId }}</text>
        </view>
        <view class="flex items-center justify-between pl-2 flex-1 border-l border-gray-1">
          <text class="color-gray-5">批号ID</text>
          <text class="color-black-2">{{ info.lotId }}</text>
        </view>
      </view>
      <view class="flex items-center justify-between py-3 border-b border-gray-1">
        <view class="flex items-center justify-between pr-2 flex-1">
          <text class="color-gray-5">批号</text>
          <text class="color-black-2">{{ info.lotNo }}</text>
        </view>
        <view class="flex items-center justify-between pl-2 flex-1 border-l border-gray-1">
          <text class="color-gray-5">效期</text>
          <text class="color-black-2">{{
            info.invalidDate ? info.invalidDate.slice(0, 10) : '-'
          }}</text>
        </view>
      </view>
      <view class="flex items-center justify-between py-3 border-b border-gray-1">
        <view class="flex items-center justify-between pr-2 flex-1">
          <text class="color-gray-5">原单销售数量</text>
          <text class="color-black-2">{{ info.goodsQty }}</text>
        </view>
        <view class="flex items-center justify-between pl-2 flex-1 border-l border-gray-1">
          <text class="color-gray-5">金额</text>
          <text class="color-black-2">{{ info.highPrice }}</text>
        </view>
      </view>
      <app-cell title="业务员" title-class="color-gray-5" border>
        <view class="px-1 text-12 color-main bg-main-1 rounded-1 tag-blue">
          {{ info.salerId }}/{{ info.salerName }}
        </view>
      </app-cell>
      <app-cell title="采购员" title-class="color-gray-5" border>
        <view class="px-1 text-12 color-main bg-main-1 rounded-1 tag-blue">
          {{ info.supplyerId }}/{{ info.supplyerName }}
        </view>
      </app-cell>
    </view>

    <!-- 退货政策和销售时间 -->
    <view class="bg-white mb-2 px-4">
      <app-cell
        title="退货政策"
        :value="info.returnsPolicy || '-'"
        title-class="color-gray-5"
        value-class="font-bold"
        border
      />
      <app-cell
        title="上次销售时间"
        :value="info.lastSaleDate || '-'"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
    </view>

    <!-- 已处理的反馈信息 (statusDtl == 0 && info.feedbackType) -->
    <view class="bg-white mb-2 px-4" v-if="statusDtl == 0 && info.feedbackType">
      <app-cell
        title="上次反馈时间"
        :value="info.lastFeedbackTime || '-'"
        title-class="color-main"
        value-class="color-black-2"
        border
      />
      <app-cell
        title="剩余库存"
        :value="info.customerQty || 0"
        title-class="color-main"
        value-class="color-black-2"
        border
      />
      <app-cell title="反馈处理意见" title-class="color-main" border>
        <view class="px-1 text-12 color-main rounded-1 tag-blue">
          {{ getFeedbackTypeText(info.feedbackType) }}
        </view>
      </app-cell>
      <app-cell
        title="备注"
        :value="info.feedbackMemo || '无'"
        title-class="color-main"
        value-class="color-black-2"
        border
      />
    </view>

    <!-- 未处理显示反馈信息 (statusDtl == 1) -->
    <view class="bg-white mb-2 px-4" v-if="statusDtl == 1">
      <app-cell
        title="剩余库存"
        :value="info.customerQty || 0"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
      <app-cell title="反馈处理意见" title-class="color-gray-5" border>
        <view class="px-1 text-12 color-main tag-blue rounded-1">
          {{ getFeedbackTypeText(info.feedbackType) }}
        </view>
      </app-cell>
      <app-cell
        title="备注"
        :value="info.feedbackMemo || '无'"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
    </view>

    <!-- 无反馈时的显示 (statusDtl == 2) -->
    <view class="bg-white mb-2 px-4" v-if="statusDtl == 2">
      <app-cell title="剩余库存" value="-" title-class="color-gray-5" border />
      <app-cell
        title="反馈处理意见"
        value="-"
        title-class="color-gray-5"
        value-class="tag-blue"
        border
      />
      <app-cell title="备注" value="-" title-class="color-gray-5" border />
    </view>

    <!-- 高值信息无反馈时显示 (type === 'info' && statusDtl == 0 && !info.feedbackType) -->
    <view class="bg-white mb-2 px-4" v-if="type === 'info' && statusDtl == 0 && !info.feedbackType">
      <app-cell title="剩余库存" value="-" title-class="color-gray-5" border />
      <app-cell
        title="反馈处理意见"
        value="-"
        title-class="color-gray-5"
        value-class="tag-blue"
        border
      />
      <app-cell title="备注" value="-" title-class="color-gray-5" border />
    </view>

    <!-- 待处理的反馈表单 (statusDtl == 0 && type === 'goods') -->
    <view class="bg-white mb-4" v-if="statusDtl == 0 && type === 'goods'">
      <app-form-item label="剩余库存">
        <up-input
          v-model="params.customerQty"
          placeholder="请输入剩余库存"
          input-align="right"
          fontSize="14"
          type="number"
          border="none"
        />
      </app-form-item>
      <app-form-item label="反馈处理意见">
        <view
          :class="`w-full text-right text-14 ${params.feedbackTypeName ? 'color-black-2' : 'color-gray-6'}`"
          @click="showPicker = true"
        >
          {{ params.feedbackTypeName || '点击选择意见' }}
        </view>
      </app-form-item>
      <app-form-item label="备注" :borderBottom="false">
        <up-input
          v-model="params.feedbackMemo"
          placeholder="请输入备注（选填）"
          input-align="right"
          fontSize="14"
          border="none"
        />
      </app-form-item>
    </view>

    <!-- 底部按钮 (statusDtl == 0 && type === 'goods') -->
    <view class="flex items-center justify-center pb-4" v-if="statusDtl == 0 && type === 'goods'">
      <view class="flex items-center" style="gap: 12px">
        <up-button
          v-show="info.feedbackType"
          style="width: 120px; height: 44px; border-radius: 22px"
          shape="round"
          type="primary"
          plain
          @click="handleClick(info, 1)"
        >
          按上次反馈
        </up-button>
        <up-button
          style="width: 120px; height: 44px; border-radius: 22px"
          shape="round"
          type="primary"
          plain
          @click="handleClick(info, 2)"
        >
          已销售完
        </up-button>
        <up-button
          style="width: 100px; height: 44px; border-radius: 22px"
          shape="round"
          type="primary"
          @click="handleClick(null)"
        >
          提交
        </up-button>
      </view>
    </view>

    <!-- 反馈类型选择器 (type === 'goods') -->
    <up-picker
      v-if="type === 'goods'"
      :show="showPicker"
      :columns="[columns]"
      @confirm="
        e => {
          onConfirm(e);
          showPicker = false;
        }
      "
      @cancel="showPicker = false"
      @close="showPicker = false"
    />
  </view>
</template>

<style scoped>
:deep(.u-cell) {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

:deep(.u-cell__body) {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

:deep(.app-cell__title) {
  max-width: 180rpx;
}

:deep(.app-cell__value) {
  max-width: calc(100% - 180rpx);
}

:deep(.tag-blue) {
  display: inline-block;
  padding: 4rpx 12rpx;
  font-size: 24rpx;
  color: #2271f5;
  background: #e8f3ff;
  border-radius: 4rpx;
}
</style>
