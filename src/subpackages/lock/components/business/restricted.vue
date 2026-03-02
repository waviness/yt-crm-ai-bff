<template>
  <view class="bg-white mb-4">
    <view class="px-2" v-if="detailObj.statusFlag !== 0">
      <lockRow :leftLabel="'备注'" :leftValue="detailObj.remark || '--'"> </lockRow>
    </view>
    <view
      class="mt-2"
      v-if="
        detailObj.statusFlag === 0 &&
        role === 2 &&
        (querySelfNumber === 1 || managementOpflagForSaler || managementOpflagForPurchaser)
      "
    >
      <up-form>
        <app-form-item label="备注">
          <up-textarea
            v-model="restrictRemark"
            placeholder="请输入请填写备注信息，提交后业务可以查看"
            autoHeight
            border="none"
            inputAlign="right"
          ></up-textarea>
        </app-form-item>
      </up-form>
    </view>
    <view v-if="querySelfNumber === 1 || managementOpflagForPurchaser">
      <app-bottom-actions>
        <up-button
          v-if="detailObj.statusFlag === 0 && role === 2"
          shape="circle"
          type="primary"
          @click="restrictClick"
        >
          提交
        </up-button>
        <up-button
          v-if="detailObj.statusFlag === 1 && role === 1"
          shape="circle"
          type="primary"
          @click="activeSubmit"
        >
          强制激活
        </up-button>
      </app-bottom-actions>
    </view>
  </view>
</template>

<script lang="ts" setup>
/**
 * 禁限销备注组件
 * 用于展示和编辑禁限销商品的备注信息
 * 支持提交备注和强制激活功能
 */
import lockRow from '../base/lock-row.vue';

/**
 * 组件属性接口
 */
interface Props {
  /** 商品详情对象 */
  detailObj: any;
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
 * 禁限销备注内容
 */
const restrictRemark = ref('');

/**
 * 提交备注
 */
const restrictClick = async () => {
  try {
    const data = await OutOfStockService.submitLimitSaleAdvice({
      recordId: props.detailObj.recordId,
      remark: restrictRemark.value,
      taskId: props.detailObj.taskId,
    });
    if (data) {
      showSuccess('提交成功');
      emit('submitSuccess');
    } else {
      showError('提交失败');
    }
  } catch (error) {
    showError('提交错误');
  }
};

/**
 * 强制激活
 */
const activeSubmit = () => {
  uni.showModal({
    title: '提示',
    content: '请确认采购员已解除当前禁限销限制后再激活，是否继续？',
    confirmText: '确定',
    cancelText: '取消',
    success: async res => {
      if (res.confirm) {
        try {
          const params = {
            conDtlId: props.detailObj.conDtlId,
            conType: props.detailObj.conType,
            taskId: props.detailObj.taskId,
            forceFlag: 0,
          };
          const res = await OutOfStockService.salerActive(params);
          if (res.success) {
            showSuccess('激活成功');
            emit('submitSuccess');
          } else {
            showError('激活失败');
          }
        } catch (error) {
          showError('激活错误');
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
