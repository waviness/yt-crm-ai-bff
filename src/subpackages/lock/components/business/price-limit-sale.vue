<template>
  <view class="bg-white px-2 mt-2">
    <!-- 解锁意见显示 -->
    <view v-if="detailObj.statusFlag !== 0">
      <lockRow
        :leftLabel="'解锁意见'"
        :leftClass="
          detailObj.approveStatus === -1
            ? 'color-red'
            : detailObj.approveStatus === 2
              ? 'color-success'
              : ''
        "
        :leftValue="`${detailObj.approveStatus === -1 ? '不同意' : detailObj.approveStatus === 2 ? '同意' : ''}`"
      >
      </lockRow>
      <lockRow
        v-if="detailObj.approveStatus === 2"
        :leftLabel="'解锁数量'"
        :leftValue="detailObj.predictQuantity || '--'"
      >
      </lockRow>
      <lockRow :leftLabel="'备注'" :leftValue="detailObj.remark || '--'"> </lockRow>
    </view>

    <view
      v-if="
        detailObj.statusFlag === 0 &&
        role === 2 &&
        (querySelfNumber === 1 || managementOpflagForSaler || managementOpflagForPurchaser)
      "
    >
      <up-form>
        <app-form-item style="padding: 0" label="是否同意">
          <up-radio-group
            @change="agreeChange"
            class="flex flex-row justify-end"
            v-model="deblockingObj.isAgree"
            direction="row"
          >
            <up-radio :name="2" label="同意" />
            <up-radio :name="-1" label="不同意" />
          </up-radio-group>
        </app-form-item>

        <app-form-item style="padding: 0" label="解锁数量" v-show="deblockingObj.isAgree === 2">
          <up-input
            v-model="deblockingObj.agreeNumber"
            placeholder="请输入解锁数量"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          />
        </app-form-item>

        <app-form-item
          style="padding: 0"
          label="调整合同价"
          v-if="detailObj.conType === 2 && deblockingObj.isAgree === 2"
        >
          <up-input
            v-model="deblockingObj.adjustPrice"
            placeholder="请输入调整合同价"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          />
        </app-form-item>
        <app-form-item style="padding: 0" label="备注">
          <up-textarea
            v-model="deblockingObj.remark"
            placeholder="请输入备注"
            height="30px"
            autoHeight
            border="none"
          ></up-textarea>
        </app-form-item>
      </up-form>
    </view>
    <app-bottom-actions
      v-if="querySelfNumber === 1 || managementOpflagForSaler || managementOpflagForPurchaser"
    >
      <up-button
        v-if="detailObj.statusFlag === 0 && role === 2"
        @click="deblockingClick"
        shape="circle"
        type="primary"
        >提交</up-button
      >
      <up-button
        v-if="detailObj.statusFlag === 2 && role === 1"
        @click="activeSubmit"
        shape="circle"
        type="primary"
        >再次激活</up-button
      >
    </app-bottom-actions>
  </view>
</template>

<script lang="ts" setup>
/**
 * 限价限售组件
 * 用于展示和处理限价限售商品的解锁审批流程
 * 支持采购人员同意/不同意解锁、设置解锁数量、调整合同价等功能
 */
import lockRow from '../base/lock-row.vue';
import type { DetailObj } from '../../types';

/**
 * 组件属性接口
 */
interface Props {
  /** 商品详情对象 */
  detailObj: DetailObj;
  /** 用户角色（1-销售 2-采购） */
  role: number;
  /** 是否查询自己的数据（1-是 0-否） */
  querySelfNumber: number;
  /** 销售是否有管理操作权限 */
  managementOpflagForSaler: boolean;
  /** 采购是否有管理操作权限 */
  managementOpflagForPurchaser: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits(['submitSuccess']);

/**
 * 解锁审批对象
 */
const deblockingObj: any = ref({
  /** 是否同意解锁（2-同意 -1-不同意） */
  isAgree: '',
  /** 解锁数量 */
  agreeNumber: '',
  /** 备注 */
  remark: '',
  /** 调整合同价 */
  adjustPrice: '',
});
// const emit = defineEmits(['submitSuccess']);
/**
 * 同意状态变更
 */
const agreeChange = () => {
  if (deblockingObj.value.isAgree === 2) {
    deblockingObj.value.agreeNumber = props.detailObj.contractQuantity;
    deblockingObj.value.adjustPrice = props.detailObj.contractPrice;
  } else {
    deblockingObj.value.agreeNumber = '';
    deblockingObj.value.adjustPrice = '';
  }
};
/**
 * 批量解锁订单
 */
const _batchUnlockOrder = async (params: any) => {
  const data = await OutOfStockService.batchUnlockOrder(params);
  if (data) {
    showSuccess('解锁成功');
    emit('submitSuccess');
  } else {
    showError('解锁失败');
  }
};
/**
 * 提交解锁审批
 */
const deblockingClick = () => {
  if (!deblockingObj.value.isAgree) {
    uni.showToast({
      title: '解锁意见不能为空',
      icon: 'none',
    });
    return;
  }
  if (deblockingObj.value.isAgree === 2) {
    if (deblockingObj.value.agreeNumber === '') {
      uni.showToast({
        title: '解锁数量不能为空',
        icon: 'none',
      });
    }
    if (parseInt(deblockingObj.value.agreeNumber) <= 0) {
      uni.showToast({
        title: '解锁数量不能小于等于0',
        icon: 'none',
      });
      return;
    }
    if (deblockingObj.value.agreeNumber > deblockingObj.value.contractQuantity) {
      uni.showToast({
        title: '解锁数量不能超过合同数量',
        icon: 'none',
      });
      return;
    }
  }
  const params = [
    {
      isAgree: deblockingObj.value.isAgree,
      recordId: props.detailObj.recordId,
      remark: deblockingObj.value.remark,
      adjustPrice:
        deblockingObj.value.isAgree === 2
          ? deblockingObj.value.adjustPrice
          : props.detailObj.contractPrice,
      taskId: props.detailObj.taskId,
      unlockQuantity: deblockingObj.value.isAgree === 2 ? deblockingObj.value.agreeNumber : '',
    },
  ];
  _batchUnlockOrder(params);
};
/**
 * 再次激活订单
 */
const activeSubmit = () => {
  showModal({
    title: '提示',
    content: '是否再次激活此订单？',
    success: async res => {
      if (res.confirm) {
        const response = await OutOfStockService.secondActive({ taskId: props.detailObj.taskId });
        if (response.code === '200') {
          showSuccess('激活成功，当前采购处理中。');
          setTimeout(() => {
            emit('submitSuccess');
          }, 1000);
        } else {
          showError('激活失败');
        }
      }
    },
  });
};
</script>

<style lang="scss" scoped>
:deep(.uni-textarea-placeholder) {
  text-align: right;
}
</style>
