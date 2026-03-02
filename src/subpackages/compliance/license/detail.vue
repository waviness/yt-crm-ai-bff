<script setup lang="ts">
/**
 * 证照详情页面
 * 支持证照详情展示、延期申请、审批、经理复签等功能
 */

import { useLicenseDetail } from './composables/use-license-detail';
import { useManagerSelection } from './composables/use-manager-selection';
import { useLicenseOperations } from './composables/use-license-operations';
import { useFileUpload } from '@/composables/use-file-upload';
import type { LicenseType, MessageType, ListType, StatusType } from './types';

defineOptions(SHARED_STYLE_OPTIONS);

const calendarRef = ref();

// 使用基础功能组合式API
const licenseDetail = useLicenseDetail();
const {
  pageConfig,
  formData,
  loadingStates,
  popupStates,
  memo,
  extensionReason,
  approveStatus,
  licenseStatusType,
  approveStatusList,
  date,
  tomorrowDate,
  sevenDaysLaterDate,
  handleDateConfirm: onDateConfirm,
} = licenseDetail;

// 使用业务操作功能
const licenseOperations = useLicenseOperations();
const { submitExtensionApplication, submitApproval, submitManagerResign, submitChooseManager } =
  licenseOperations;

// 使用文件上传功能
const fileUpload = useFileUpload();
const { fileList, deletePic, afterRead } = fileUpload;

// 使用经理选择功能
const managerSelection = useManagerSelection();
const { leader, leaderList, getLeaderList, handleSelectLeader, resetLeader } = managerSelection;

/**
 * 处理日期确认
 */
const handleDateConfirm = (value: any) => {
  onDateConfirm(value.fulldate, formData.value);
};
// 经理选择相关方法已通过composable提供
/**
 * 提交选择经理
 */
const submitLeader = async () => {
  loadingStates.publishLoading = true;

  const success = await submitChooseManager(
    formData.value,
    date.value,
    memo.value,
    fileList.value,
    leader.value,
    pageConfig.value.licenseType as LicenseType,
    pageConfig.value.msgType
  );

  if (success) {
    if (pageConfig.value.msgType) {
      formData.value.buttonShow = false;
    }
  }

  loadingStates.publishLoading = false;
};
/**
 * 提交申请延期
 */
const submit = async () => {
  if (!date.value) {
    showToast('请选择延期时间');
    return;
  }
  if (!memo.value) {
    showToast('请填写延期原因');
    return;
  }

  if ((formData.value.unLockTimes || 0) >= 3) {
    // 需要经理复签
    resetLeader();
    await getLeaderList();
    popupStates.chooseShow = true;
  } else {
    // 直接提交延期申请
    loadingStates.publishLoading = true;

    const success = await submitExtensionApplication(
      formData.value,
      date.value,
      memo.value,
      fileList.value,
      pageConfig.value.licenseType as LicenseType,
      pageConfig.value.msgType
    );

    if (success && pageConfig.value.msgType) {
      formData.value.buttonShow = false;
    }

    loadingStates.publishLoading = false;
  }
};
/**
 * 提交审批
 */
const submitApprove = async () => {
  loadingStates.submitLoading = true;

  const success = await submitApproval(
    formData.value,
    approveStatus.value,
    extensionReason.value,
    pageConfig.value.licenseType as LicenseType
  );

  loadingStates.submitLoading = false;
};
/**
 * 经理复签提交
 */
const leaderSubmit = async (type: number) => {
  if (type === 1) {
    loadingStates.submitLoading = true;
  } else {
    loadingStates.submitLoading2 = true;
  }

  const success = await submitManagerResign(
    formData.value,
    type,
    pageConfig.value.licenseType as LicenseType
  );

  if (success) {
    formData.value.buttonShow = false;
  }

  loadingStates.submitLoading = false;
  loadingStates.submitLoading2 = false;
};
/**
 * 页面加载时的初始化处理
 */
onLoad((opts: any) => {
  // 初始化页面数据
  const decodedOpts = decodeObjectValues(opts);
  console.log('decodedOpts', decodedOpts);
  formData.value = JSON.parse(decodedOpts.item);
  pageConfig.value = {
    msgType: (decodedOpts.msgType || '') as MessageType,
    listType: Number(decodedOpts.listType) as ListType,
    licenseType: Number(decodedOpts.licenseType) as LicenseType,
    statusType: Number(decodedOpts.statusType) as StatusType,
  };

  formData.value.buttonShow = true;
  console.log('页面初始化数据:', formData.value);
  console.log('页面配置:', pageConfig.value);
});
</script>

<template>
  <view class="p-4rpx pb-100">
    <app-watermark> </app-watermark>
    <view class="px-10 pt-10">
      {{ +pageConfig.licenseType === 0 ? '企业证照' : '客户/供应商法人委托书'
      }}{{
        +pageConfig.statusType === 0
          ? '申请延期'
          : +pageConfig.statusType === 1
            ? '审批中'
            : '已审批'
      }}详情
    </view>
    <app-cell
      title="核算单元"
      :value="formData.entryId ? `${formData.entryId}/${formData.entryName}` : ''"
      valueClass="color-black-2"
      class="block mt-4"
    />
    <app-cell
      title="单位信息"
      :value="formData.companyId ? `${formData.companyId}/${formData.companyName}` : ''"
      valueClass="color-black-2"
      class="block mt-2"
    />
    <app-cell
      v-if="+pageConfig.licenseType === 1"
      title="单位类型"
      :value="formData.companyType === 1 ? '供应商' : formData.companyType === 2 ? '客户' : '-'"
      valueClass="color-black-2"
      class="block mt-2"
    />
    <app-cell
      v-if="+pageConfig.licenseType === 0"
      title="证照信息"
      :value="formData.licenseId ? `${formData.licenseId}/${formData.licenseName}` : ''"
      valueClass="color-black-2"
      class="block mt-2"
    />
    <template v-if="+pageConfig.licenseType === 1">
      <app-cell title="委托书ID" :value="formData.seqId" class="block mt-2" />
      <app-cell
        title="委托人"
        :value="formData.agentId ? `${formData.agentId}/${formData.agentName}` : ''"
        valueClass="color-black-2"
        class="block mt-2"
      />
      <app-cell title="委托人状态" class="block mt-2">
        <view class="flex items-center color-black-2 text-14">
          <view
            :class="`circle-view mr-2 ${
              formData.agentStatusString === '正常'
                ? 'bg-success'
                : formData.agentStatusString === '临时'
                  ? 'bg-gray'
                  : formData.agentStatusString === '停用'
                    ? 'bg-danger'
                    : ''
            }`"
          >
          </view>
          {{ formData.agentStatusString || '' }}
        </view>
      </app-cell>
    </template>
    <template v-if="+pageConfig.listType === 2">
      <app-cell
        title="申请人"
        :value="formData.applyManId ? `${formData.applyManId}/${formData.applyManName}` : ''"
        valueClass="color-black-2"
        class="block mt-2"
      />
      <app-cell
        title="申请时间"
        :value="formData.applyDate"
        valueClass="color-black-2"
        class="block mt-2"
      />
      <app-cell
        title="实际CRM申请人"
        :value="`${formData.crmApplyManId ? `${formData.crmApplyManId}/${formData.crmApplyManName}` : '--'}`"
        valueClass="color-black-2"
        class="block mt-2"
      />
    </template>
    <app-cell
      title="业务员"
      :value="
        formData.salerNameList && formData.salerNameList.length
          ? formData.salerNameList.join('，')
          : '--'
      "
      valueClass="color-black-2"
      class="block mt-2"
    />
    <app-cell
      title="采购员"
      :value="
        formData.purchaserNameList && formData.purchaserNameList.length
          ? formData.purchaserNameList.join('，')
          : '--'
      "
      valueClass="color-black-2"
      class="block mt-2"
    />
    <app-cell
      title="有效期起始日期"
      :value="+pageConfig.licenseType === 0 ? formData.validOnDate : formData.dateFrom"
      valueClass="color-black-2"
      class="block mt-2"
    />
    <app-cell
      title="有效期至"
      :value="+pageConfig.licenseType === 0 ? formData.validEndDate : formData.dateTo"
      valueClass="color-black-2"
      class="block mt-2"
    />
    <app-cell title="剩余时间" class="block mt-2">
      <app-tag
        class="text-14"
        :name="`${formData.expireLeftDay < 0 ? '已过期' : '距到期还剩'}${Math.abs(formData.expireLeftDay)}天`"
        :type="licenseStatusType"
      ></app-tag>
    </app-cell>
    <template
      v-if="+pageConfig.statusType > 0 || +pageConfig.listType === 2 || +pageConfig.msgType === 2"
    >
      <app-cell
        v-if="+pageConfig.licenseType === 0"
        title="延期至"
        :value="formData.delayToDate && formData.delayToDate.split(' ')[0]"
        valueClass="color-black-2"
        class="block mt-2"
      />
      <app-cell
        v-else
        title="延期至"
        :value="formData.delayDate && formData.delayDate.split(' ')[0]"
        valueClass="color-black-2"
        class="block mt-2"
      />
      <app-cell v-if="+pageConfig.licenseType === 0" title="延期原因" class="block mt-2">
        <template #content>
          <view class="w-full color-black-2 text-left px-4 pb-10">{{ formData.delayReason }}</view>
        </template>
      </app-cell>
      <app-cell v-else title="延期原因" class="block mt-2">
        <template #content>
          <view class="w-full color-black-2 text-left px-4 pb-10">{{ formData.applyMemo }}</view>
        </template>
      </app-cell>
      <app-cell title="附件" class="block mt-2">
        <template #content>
          <view
            v-if="formData.imageList && formData.imageList.length"
            class="w-full flex flex-wrap px-4 pb-1"
          >
            <up-album multipleSize="80" :urls="formData.imageList"></up-album>
          </view>
          <view v-else class="w-full text-14 color-gray-7 text-left px-4 pb-10">暂无附件</view>
        </template>
      </app-cell>
      <app-cell
        v-if="
          +pageConfig.msgType === 2 &&
          (formData.reApproveStatus === 3 || formData.reApproveStatus === 4)
        "
        title="复签意见"
        :value="formData.reApproveStatus === 3 ? '同意解锁' : '不同意'"
        valueClass="color-black-2"
        class="block mt-2"
      />
      <app-cell v-if="+pageConfig.statusType > 0" title="延期审批状态" class="block mt-2">
        <span
          :class="[
            'text-14',
            formData.approveStatus === 3
              ? 'color-success'
              : formData.approveStatus === 4
                ? 'color-danger'
                : 'color-main',
          ]"
          >{{
            formData.approveStatus === 3
              ? '通过'
              : formData.approveStatus === 4
                ? '不通过'
                : formData.approveStatus === 1
                  ? '审批中'
                  : ''
          }}</span
        >
      </app-cell>
      <app-cell
        v-if="
          +pageConfig.licenseType === 0 &&
          (+pageConfig.statusType === 3 || +pageConfig.statusType === 4) &&
          formData.approveRemark
        "
        title="审批原因"
        :value="formData.approveRemark"
        valueClass="color-black-2"
        class="block mt-2"
      />
      <app-cell
        v-if="
          +pageConfig.licenseType === 1 &&
          (+pageConfig.statusType === 3 || +pageConfig.statusType === 4) &&
          formData.approveMemo
        "
        title="审批原因"
        :value="formData.approveMemo"
        valueClass="color-black-2"
        class="block mt-2"
      />
    </template>
    <view
      v-if="
        +pageConfig.listType === 1 &&
        +pageConfig.statusType === 0 &&
        (!pageConfig.msgType || +pageConfig.msgType === 1)
      "
    >
      <up-form>
        <app-form-item label="延期至" class="block mt-2 bg-white" :borderBottom="false" required>
          <view
            :class="`w-full text-14 text-right ${date ? 'color-black-2' : 'color-gray-6'}`"
            @click="calendarRef.open()"
          >
            {{ date || '点击选择延期时间' }}
          </view>
        </app-form-item>
        <app-form-item
          label="延期原因"
          labelPosition="top"
          class="block mt-2 bg-white"
          :borderBottom="false"
          required
        >
          <view :class="`w-full ${memo ? 'color-black-2' : 'color-gray-6'}`">
            <up-textarea v-model="memo" placeholder="请输入延期原因" border="none" />
          </view>
        </app-form-item>
        <view class="bg-white py-10 px-4 block mt-2">
          <view class="text-14 color-gray-5">附件上传</view>
          <up-upload
            :fileList="fileList"
            @delete="deletePic"
            @afterRead="afterRead"
            :previewFullImage="true"
            multiple
            upload-icon="plus"
            class="block mt-2"
          />
        </view>
      </up-form>
    </view>
    <view v-if="+pageConfig.listType === 2 && +pageConfig.statusType === 1">
      <up-form>
        <view class="bg-white flex justify-between items-center px-4 py-3 block mt-2">
          <view class="text-14 color-gray-5">是否通过</view>
          <app-radio v-model:status="approveStatus" :options="approveStatusList" />
        </view>
        <app-form-item
          label="审批原因"
          labelPosition="top"
          class="block mt-2 bg-white"
          :borderBottom="false"
          required
        >
          <view :class="`w-full ${extensionReason ? 'color-black-2' : 'color-gray-6'}`">
            <up-textarea v-model="extensionReason" placeholder="请输入审批原因" border="none" />
          </view>
        </app-form-item>
      </up-form>
    </view>
    <app-bottom-actions
      v-if="
        +pageConfig.listType === 1 &&
        +pageConfig.statusType === 0 &&
        (!pageConfig.msgType || +pageConfig.msgType === 1) &&
        formData.buttonShow
      "
      class="block mx-4 my-15"
      :fixed="false"
      :count="1"
    >
      <app-action-btn
        type="primary"
        :loading="loadingStates.publishLoading"
        text="申请延期"
        @click="submit"
      />
    </app-bottom-actions>
    <app-bottom-actions
      v-if="+pageConfig.listType === 2 && +pageConfig.statusType === 1"
      class="block mx-4 my-15"
      :fixed="false"
      :count="1"
    >
      <app-action-btn
        text="提交"
        type="primary"
        :loading="loadingStates.submitLoading"
        @click="submitApprove"
      />
    </app-bottom-actions>
    <app-bottom-actions
      v-if="
        +pageConfig.msgType === 2 &&
        formData.buttonShow &&
        formData.reApproveStatus !== 3 &&
        formData.reApproveStatus !== 4
      "
      class="block mx-4 my-15"
      :fixed="false"
    >
      <app-action-btn
        text="不同意"
        class="flex-1"
        type="plain"
        :loading="loadingStates.submitLoading"
        :disabled="loadingStates.submitLoading2"
        @click="leaderSubmit(1)"
      />
      <app-action-btn
        text="同意解锁"
        type="primary"
        class="flex-1"
        :loading="loadingStates.submitLoading2"
        :disabled="loadingStates.submitLoading"
        @click="leaderSubmit(2)"
      />
    </app-bottom-actions>
    <app-calendar
      ref="calendarRef"
      :date="tomorrowDate"
      :startDate="tomorrowDate"
      :endDate="sevenDaysLaterDate"
      @confirm="handleDateConfirm"
    />
    <up-modal
      :show="popupStates.chooseShow"
      showCancelButton
      @confirm="submitLeader"
      @cancel="popupStates.chooseShow = false"
    >
      <view class="text-14">
        <view
          v-if="formData.reApproveStatus !== undefined && +formData.reApproveStatus === 4"
          class="p-4"
        >
          {{ +pageConfig.licenseType === 1 ? '委托书' : '证照' }}过期后至今解锁{{
            formData.unLockTimes
          }}次，复签不通过，重新选择部门经理进行复签
        </view>
        <view v-else class="p-4">
          {{ +pageConfig.licenseType === 1 ? '委托书' : '证照' }}过期后至今解锁{{
            formData.unLockTimes
          }}次，需选择部门经理进行复签
        </view>
        <up-form class="mt-2">
          <app-form-item label="部门经理">
            <view
              :class="`w-full text-right ${leader.name ? '' : 'color-gray-6'}`"
              @click="popupStates.actionShow = true"
            >
              {{ leader.name ? `${leader.name}` : '点击选择部门经理' }}
            </view>
          </app-form-item>
        </up-form>
      </view>
    </up-modal>
    <app-action-sheet
      :show="popupStates.actionShow"
      :actions="leaderList"
      @select="handleSelectLeader"
      @close="popupStates.actionShow = false"
    />
  </view>
</template>

<style lang="scss" scoped>
:deep(.u-textarea) {
  padding: 0 !important;

  textarea {
    font-size: 28rpx;
  }
}
</style>
