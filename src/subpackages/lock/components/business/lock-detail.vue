<template>
  <view class="lock-detail">
    <!-- 顶部信息 -->
    <view class="pa-2 flex justify-between items-center">
      <view>
        <text class="text-14">{{ conTypeString }}信息列表</text>
        <text class="pl-1">#{{ detailObj.taskId }}</text>
      </view>
      <text>{{ detailObj.createTime }}</text>
    </view>

    <!-- 基本信息 -->
    <view class="px-2 bg-white">
      <lockRow
        leftLabel="类型"
        :leftValue="conTypeString"
        :rightLabel="+role === 1 ? '业务员' : '采购员'"
        :showDivider="true"
        :showRight="true"
      >
        <template #leftContent>
          <view class="flex items-center">
            <text class="color-red">{{ conTypeString }}</text>
            <up-copy
              :content="
                conTypeString +
                ',合同细单：' +
                detailObj.conDtlId +
                ',客户名称：' +
                detailObj.customerId +
                '/' +
                detailObj.customerName +
                ',货品：' +
                detailObj.goodsId +
                '/' +
                detailObj.goodsName +
                ',合同数量：' +
                detailObj.contractQuantity
              "
            >
              <app-icon name="fuzhi" size="32" class="color-main" />
            </up-copy>
          </view>
        </template>

        <template #rightContent>
          <up-tag
            :text="+role === 1 ? detailObj.salesmanName : detailObj.purchaserName"
            plain
            plainFill
          ></up-tag>
        </template>
      </lockRow>

      <!-- 合同细单行 -->
      <lockRow
        :leftLabel="'合同细单'"
        :leftValue="detailObj.conDtlId"
        :showRight="detailObj.coreHospital === 1 && +role === 2"
      >
        <template #rightContent>
          <up-tag text="核心医院" plain plainFill></up-tag>
        </template>
      </lockRow>
      <lockRow
        :leftLabel="'客户'"
        :leftValue="detailObj.customerId ? detailObj.customerId + '/' + detailObj.customerName : ''"
      >
      </lockRow>
      <lockRow
        v-if="detailObj.branchId"
        :leftLabel="'分支机构'"
        :leftValue="detailObj.branchId ? detailObj.branchId + '/' + detailObj.brandName : ''"
      >
      </lockRow>
      <lockRow :leftLabel="'核算单元'" :leftValue="detailObj.entryId + '/' + detailObj.entryName">
      </lockRow>
      <lockRow :leftLabel="'品种'" :leftValue="detailObj.goodsName">
        <template #leftContent>
          {{ detailObj.goodsId }}/{{ detailObj.goodsName }}
          <text v-if="detailObj.conType == 3 && detailObj.goodsCurrencyName && +role === 1">
            /{{ detailObj.goodsCurrencyName }}
          </text>
        </template>
      </lockRow>

      <lockRow :leftLabel="'规格'" :leftValue="detailObj.goodsType"> </lockRow>
      <lockRow :leftLabel="'厂家'" :leftValue="detailObj.factoryName"> </lockRow>
      <lockRow
        :leftLabel="'上笔进货合同创建时间'"
        :leftValue="detailObj.lastBuyContractCreateTime || '--'"
      >
      </lockRow>

      <lockRow
        :leftLabel="'订单来源'"
        :leftValue="getOrderSource"
        :rightLabel="+role === 1 ? '采购姓名' : '业务姓名'"
        :rightValue="+role === 1 ? detailObj.purchaserName : detailObj.salesmanName"
        :showRight="true"
      >
        <template #rightContent>
          <up-tag
            :text="+role === 1 ? detailObj.purchaserName : detailObj.salesmanName"
            plain
            plainFill
          ></up-tag>
        </template>
      </lockRow>

      <!-- <view class="common-detail-two">
        <view class="common-detail-two-left">
          <text class="title">订单来源</text>
          <text class="value">{{ getOrderSource }}</text>
        </view>
        <view class="line"></view>
        <view class="common-detail-two-right common-detail-two-tag">
          <text class="title">{{ role === 1 ? '采购姓名' : '业务姓名' }}</text>
          <text class="value tag-primary-plain">{{
            role === 1 ? detailObj.purchaserName : detailObj.salesmanName
          }}</text>
        </view>
      </view> -->
      <lockRow
        v-if="
          (detailObj.conType === 2 || detailObj.conType === 3 || detailObj.conType === 5) &&
          +role === 2
        "
        :leftLabel="'营运客户分类'"
        :leftValue="detailObj.operatingCustomerStatus || '--'"
      >
      </lockRow>
      <lockRow
        v-if="
          (detailObj.conType === 2 || detailObj.conType === 3 || detailObj.conType === 5) &&
          +role === 2
        "
        :leftLabel="'所属业态'"
        :leftValue="detailObj.ddlId ? detailObj.ddlId + '/' + detailObj.ddlName : '--'"
      >
      </lockRow>
    </view>
    <!-- 详细信息 -->
    <view class="mt-2 px-2 bg-white">
      <lockRow
        :leftLabel="'合同数量'"
        :leftValue="detailObj.contractQuantity"
        rightLabel="已开数量"
        :rightValue="detailObj.confirmedQuantity || 0"
      >
      </lockRow>

      <lockRow
        v-if="detailObj.entryId === 5 || detailObj.entryId === 38 || detailObj.entryId === 39"
        :leftLabel="'两票制剩余'"
        :leftValue="detailObj.twoInvoiceLeftQuantity"
        rightLabel="对应药业库存"
        :rightValue="detailObj.yyStockQuantity || 0"
      >
      </lockRow>
      <lockRow v-else :leftLabel="'两票制剩余'" :leftValue="detailObj.twoInvoiceLeftQuantity">
      </lockRow>

      <lockRow
        :leftLabel="'当前可销总库存'"
        :leftValue="detailObj.totalAvailableStockQuantity"
        rightLabel="锁控时库存"
        :rightValue="detailObj.stockQuantity || '--'"
      >
      </lockRow>

      <lockRow
        @click="onReservePlanQuantityClick"
        v-show="detailObj.conType === 0"
        :leftLabel="`储备数量${detailObj.reservePlanQuantity ? '(点击查看明细)' : ''}`"
        :leftValue="detailObj.reservePlanQuantity || '无计划'"
        :leftClass="'color-main'"
      >
      </lockRow>

      <lockRow
        :leftLabel="'考核价'"
        :leftValue="detailObj.examinePrice"
        rightLabel="合同价"
        :rightValue="detailObj.contractPrice || '--'"
      >
      </lockRow>

      <lockRow
        :leftLabel="'上次销价'"
        :leftValue="detailObj.lastSellPrice || '--'"
        rightLabel="限价"
        :rightValue="detailObj.limitPrice || '--'"
      >
      </lockRow>

      <lockRow :leftLabel="'未分配原因'" :leftValue="detailObj.zxErrorMessage || '--'"> </lockRow>
      <lockRow :leftLabel="'总单备注'" :leftValue="detailObj.memo || '--'"> </lockRow>
    </view>

    <!-- 到货/到票时间 -->

    <view
      v-if="(detailObj.conType === 0 || detailObj.conType === 4) && detailObj.arriveTime"
      class="mt-2 px-2 bg-white"
    >
      <lockRow
        :leftLabel="`到${detailObj.conType === 0 ? '货' : '票'}时间`"
        :leftValue="detailObj.arriveTime || '--'"
      >
      </lockRow>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { DetailObj } from '../../types';
import lockRow from '../base/lock-row.vue';

const props = defineProps<{
  detailObj: DetailObj;
  role: number; // 1 业务员 2 采购
}>();

const emit = defineEmits<{
  (
    e: 'reservePlanQuantityClick',
    params: { entryId: string | number; reserveDocId?: string }
  ): void;
}>();

// 计算属性
const conTypeString = computed(() => {
  const { conType } = props.detailObj;
  switch (conType) {
    case 2:
      return '价格限销';
    case 3:
      return '库存下限';
    case 0:
      return '缺货';
    case 4:
      return '两票制';
    case 5:
      return '紧俏药品';
    case 6:
      return '禁限销';
    case 7:
      return '库存状态';
    case 8:
      return '近效期';
    default:
      return '';
  }
});

const getOrderSource = computed(() => {
  const { isAutoOrder, signAddress } = props.detailObj;
  if (isAutoOrder && isAutoOrder === 1) return '自动补货';
  if (!signAddress) return '其他';

  const sourceMap: Record<string, string> = {
    huazhao: '华招平台',
    manbing: '慢病平台',
    微信: '微信订单',
  };
  return sourceMap[signAddress] || '其他';
});

// 事件处理
const onReservePlanQuantityClick = () => {
  emit('reservePlanQuantityClick', {
    entryId: props.detailObj.entryId,
    reserveDocId: props.detailObj.reserveDocId,
  });
};
</script>

<style>
.common-detail-two {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.common-detail-one {
  margin-bottom: 8px;
}

.line {
  width: 1px;
  height: 20px;
  background-color: #eee;
  margin: 0 8px;
}

.title {
  color: #666;
  margin-right: 8px;
}

.value {
  color: #333;
}

.color-main {
  color: #2271f5;
}

.color-red {
  color: #ff4d4f;
}

.tag-primary-plain {
  padding: 2px 8px;
  border: 1px solid #2271f5;
  color: #2271f5;
  border-radius: 4px;
}
</style>
