<script setup lang="ts">
/**
 * 证照信息展示组件
 * 用于展示证照/委托书的详细信息，包括单位信息、剩余时间、审批状态等
 * 并根据不同的状态显示操作按钮
 */

import type { LicenseData } from '../types';

/**
 * 定义组件的props属性
 * @param data - 证照数据对象
 * @param current - 当前状态：0临期 1审批中 2已审批
 * @param licenseType - 证照类型：0企业证照 1委托书
 * @param listType - 列表类型：1延期 2审批
 */
interface IProps {
  data: LicenseData;
  current?: number;
  licenseType?: number;
  listType?: number;
}

const props = withDefaults(defineProps<IProps>(), {
  current: 0,
  licenseType: 0,
  listType: 1,
});

/**
 * 计算证照状态类型
 * 根据剩余天数返回不同的状态类型
 * @returns {string} success-正常(>7天) warning-警告(0-7天) danger-危险(<0天)
 */
const type = computed(() => {
  const expireLeftDay = props.data.expireLeftDay;
  return expireLeftDay > 7 ? 'success' : expireLeftDay >= 0 ? 'warning' : 'danger';
});

/**
 * 定义事件发射器
 * 用于向父组件传递点击事件
 */
const emit = defineEmits(['click']);

/**
 * 处理点击事件
 * 发射click事件给父组件
 */
const handleClick = () => emit('click');
</script>

<template>
  <view class="bg-light-gray-2 rounded-1 shadow-view" @click="handleClick">
    <view class="bg-white rounded-1 p-10">
      <!-- 核算单元信息 -->
      <app-infor-item
        title="核算单元"
        :content="props.data.entryId ? `${props.data.entryId}/${props.data.entryName}` : ''"
      />
      <!-- 单位信息 -->
      <app-infor-item
        title="单位信息"
        :content="props.data.companyId ? `${props.data.companyId}/${props.data.companyName}` : ''"
        class="block mt-2"
      />
      <!-- 单位类型 (仅在委托书类型时显示) -->
      <app-infor-item
        v-if="licenseType === 1"
        title="单位类型"
        :content="
          props.data.companyType === 1 ? '供应商' : props.data.companyType === 2 ? '客户' : '-'
        "
        class="block mt-2"
      />
      <!-- 证照信息 (仅在企业证照类型时显示) -->
      <app-infor-item
        v-if="licenseType === 0"
        title="证照信息"
        :content="props.data.licenseId ? `${props.data.licenseId}/${props.data.licenseName}` : ''"
        class="block mt-2"
      />
      <!-- 委托人信息 (仅在委托书类型时显示) -->
      <app-infor-item
        v-if="licenseType === 1"
        title="委托人"
        :content="props.data.agentId ? `${props.data.agentId}/${props.data.agentName}` : ''"
        class="block mt-2"
      />
      <!-- 委托书ID (仅在委托书类型时显示) -->
      <app-infor-item
        v-if="licenseType === 1"
        title="委托书ID"
        :content="props.data.seqId"
        class="block mt-2"
      />
      <!-- 申请人信息 (仅在审批列表时显示) -->
      <app-infor-item
        v-if="listType === 2"
        title="申请人"
        :content="
          props.data.applyManId ? `${props.data.applyManId}/${props.data.applyManName}` : ''
        "
        class="block mt-2"
      />
      <!-- 申请时间 (仅在审批列表时显示) -->
      <app-infor-item
        v-if="listType === 2"
        title="申请时间"
        :content="props.data.applyDate"
        class="block mt-2"
      />
      <!-- 剩余时间 -->
      <app-infor-item title="剩余时间" class="block mt-2">
        <app-tag
          :name="`${props.data.expireLeftDay < 0 ? '已过期' : '距到期还剩'}${Math.abs(props.data.expireLeftDay)}天`"
          :type="type"
          :fontSize="12"
        />
      </app-infor-item>
      <!-- 审批状态 (已审批或审批列表中的审批中状态时显示) -->
      <app-infor-item
        v-if="current === 2 || (listType === 2 && current === 1)"
        title="审批状态"
        class="block mt-2"
      >
        <view
          :class="
            props.data.approveStatus === 3
              ? 'color-success'
              : props.data.approveStatus === 4
                ? 'color-danger'
                : 'color-main'
          "
        >
          {{
            props.data.approveStatus === 3
              ? '已通过'
              : props.data.approveStatus === 4
                ? '未通过'
                : ''
          }}
        </view>
      </app-infor-item>
    </view>
    <!-- 延期申请按钮 (仅在临期且为延期列表时显示) -->
    <view class="px-10 py-2 flex" v-if="current === 0 && listType === 1">
      <view class="flex-1"></view>
      <up-button
        size="small"
        shape="circle"
        type="primary"
        customStyle="width: 180rpx"
        text="申请延期"
        @click="handleClick"
      >
      </up-button>
    </view>
  </view>
</template>
