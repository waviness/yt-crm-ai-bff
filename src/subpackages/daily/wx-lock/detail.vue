<script setup lang="ts">
import { useWxLockDetail } from './composables/use-wx-lock-detail';

defineOptions(SHARED_STYLE_OPTIONS);

const taskid = ref('');

const {
  detailObj,
  loading,
  conTypeList,
  getDetail,
  toHandleDetail,
  getStockTypeText,
  getAccessTypeText,
  getActivateText,
} = useWxLockDetail(taskid);

onLoad((options: any) => {
  taskid.value = options.taskid;
  getDetail();
});

onShow(() => {
  // 从处理意见页返回时刷新数据
  if (taskid.value) {
    getDetail();
  }
});
</script>

<template>
  <view class="pb-20">
    <app-watermark></app-watermark>
    <view class="pa-2">锁控详情</view>
    <view>
      <app-cell
        title="锁控编号"
        :value="detailObj.taskid"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
      <app-cell
        title="创建时间"
        :value="detailObj.credate"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
      <app-cell
        title="销售细单ID"
        :value="detailObj.condtlid"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
      <app-cell
        title="核算单元"
        :value="`${detailObj.entryid}/${detailObj.entryname}`"
        title-class="color-gray-5"
        value-class="color-main"
        border
      />
      <app-cell
        title="货品"
        :value="`${detailObj.goodsid}/${detailObj.goodsname}`"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
      <app-cell
        title="规格"
        :value="detailObj.standard"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
      <app-cell
        title="厂家"
        :value="detailObj.factoryName"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
      <app-cell
        title="锁控类型"
        :value="conTypeList[detailObj.conType]"
        title-class="color-gray-5"
        value-class="color-main"
        border
      />
      <app-cell
        title="到货状态"
        :value="getStockTypeText(detailObj.stockType)"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
      <app-cell
        title="到货时间"
        :value="detailObj.arrivedate || '-'"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
      <app-cell title="业务员" title-class="color-gray-5" border>
        <view class="px-2 bg-main-1 color-main rounded-2">
          {{ `${detailObj.salesmanId}/${detailObj.salesmanName}` }}
        </view>
      </app-cell>
      <app-cell title="采购员" title-class="color-gray-5" border>
        <view class="px-2 bg-main-1 color-main rounded-2">
          {{ `${detailObj.purchaserId}/${detailObj.purchaserName}` }}
        </view>
      </app-cell>
      <app-cell
        title="合同数量"
        :value="detailObj.conQty"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
      <app-cell
        title="库存数量"
        :value="detailObj.stockQty"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
      <app-cell
        title="客户"
        :value="`${detailObj.custsetid}/${detailObj.custsetname}`"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
      <app-cell
        title="开票价"
        :value="detailObj.sellprice"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
      <app-cell
        title="上次销价"
        :value="detailObj.lastsellprice"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
      <app-cell
        title="限销价"
        :value="detailObj.limitprice"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
      <app-cell
        title="发送状态"
        :value="getAccessTypeText(detailObj.accessType)"
        title-class="color-gray-5"
        :value-class="detailObj.accessType === 0 ? 'color-danger' : 'color-success'"
        border
      />
      <app-cell
        title="是否激活"
        :value="getActivateText(detailObj.activate)"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
      <app-cell
        title="考核价"
        :value="detailObj.examprice"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
      <app-cell
        title="备注"
        :value="detailObj.remark || '-'"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
      <app-cell
        title="批号"
        :value="detailObj.lotid"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
      <app-cell
        title="两票制备注"
        :value="detailObj.msg || '-'"
        title-class="color-gray-5"
        value-class="color-black-2"
        border
      />
    </view>
    <view v-if="detailObj.recordid" class="flex justify-center mt-14">
      <up-button
        type="primary"
        shape="circle"
        customStyle="width: auto; padding: 0 40rpx;"
        @click="toHandleDetail"
        >处理意见</up-button
      >
    </view>
  </view>
</template>

<style scoped>
:deep(.app-cell__title) {
  width: 200rpx;
  flex: none;
}
</style>
