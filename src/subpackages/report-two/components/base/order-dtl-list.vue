<template>
  <view class="card mb-2">
    <view class="pa-2 bg-white" v-if="orderType === '14'">
      <view class="flex justify-between items-center">
        <up-tag
          :type="item.goodsStatusId === 3 ? 'warning' : 'error'"
          plain
          plainFill
          borderColor="transparent"
        >
          {{ item.goodsStatus }}
        </up-tag>
        <text>{{ item.invaliddate?.substring(0, 10) }}</text>
      </view>
      <view class="flex justify-between items-center pt-2">
        <view class="font-bold text-14 flex-5">{{ item.goodsId }}/{{ item.goodsName }}</view>
        <app-infor-item
          class="flex-3 pl-2"
          title="总价"
          contentClass="color-main"
          :content="`${item.dtlTotalPrice}`"
        />
      </view>
      <view class="flex justify-between items-center pt-2">
        <app-infor-item
          class="flex-5"
          title="销售订单细单ID"
          contentClass="color-main"
          :content="`${item.condtlid}`"
        />
        <app-infor-item class="flex-3 pl-2" title="细单ID" :content="`${item.codDtlId}`" />
      </view>
      <view class="flex justify-between items-center pt-2">
        <app-infor-item
          class="flex-5"
          title="保管帐"
          :content="`${item.storageId}/${item.storageName}`"
        />
        <app-infor-item class="flex-3 pl-2" title="批号" :content="`${item.lotNo}`" />
      </view>
      <view class="flex justify-between items-center pt-2">
        <app-infor-item class="flex-5" title="规格" :content="`${item.goodstype}`" />
        <app-infor-item class="flex-3 pl-2" title="数量" :content="`${item.goodsQty}`" />
      </view>
      <app-infor-item class="pt-2" title="厂家" :content="`${item.zxfactoryname}`" />
    </view>
    <view class="pa-2 bg-white" v-if="orderType === '6'">
      <view class="font-bold text-14"> {{ item.goodsId }}/{{ item.goodsName }} </view>

      <view class="flex justify-between items-center pt-2">
        <app-infor-item
          class="flex-3"
          title="细单ID"
          contentClass="color-main"
          :content="`${item.ccdDtlId || '--'}`"
        />
        <app-infor-item
          class="flex-2 pl-2"
          contentClass="color-main"
          title="库存类型"
          :content="`${item.zxSpecialflag ? '特惠库存' : '普通库存'}`"
        />
      </view>
      <view class="flex justify-between items-center pt-2">
        <app-infor-item
          class="flex-3"
          title="销售订单细单ID"
          contentClass="color-main"
          :content="`${item.condtlid || '--'}`"
        />
        <app-infor-item
          class="flex-2 pl-2"
          title="是否冷链"
          :content="`${item.coldflag === 0 ? '否' : item.coldflag === 1 ? '是' : ''}`"
        />
      </view>

      <view class="flex justify-between items-center pt-2">
        <app-infor-item class="flex-3" title="厂家" :content="`${item.zxfactoryname}`" />
        <app-infor-item
          class="flex-2 pl-2"
          title="报价"
          :content="`${item.price ? item.price.toFixed(2) : '--'}`"
        />
      </view>
      <view class="flex justify-between items-center pt-2">
        <app-infor-item class="flex-3" title="规格" :content="`${item.goodstype}`" />
        <app-infor-item class="flex-2 pl-2" title="细单合计" :content="`${item.dtlTotalPrice}`" />
      </view>

      <view class="flex justify-between items-center pt-2">
        <app-infor-item class="flex-3" title="数量" :content="`${item.goodsQty}`" />
        <app-infor-item
          class="flex-2 pl-2"
          title="效期至"
          :content="`${item.invaliddate ? item.invaliddate.split(' ')[0] : '--'}`"
        />
      </view>
    </view>
    <view class="bg-light-gray pa-2">
      <app-infor-item title="备注" :content="`${item.dtlMemo || '--'}`" />
    </view>
  </view>
</template>

<script lang="ts" setup>
defineProps<{
  item: any;
  orderType: string;
}>();
</script>

<style lang="scss" scoped>
.card {
  background: #f9f9f9;
  box-shadow: 0 1px 6px 1px rgb(209 207 207 / 30%);
}
</style>
