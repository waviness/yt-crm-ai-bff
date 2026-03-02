<template>
  <view class="pa-2">库存列表详情</view>
  <view class="flex flex-col">
    <app-cell
      class="mt-2"
      title="货品信息"
      :value="`${detailObj.goodsId}/${
        detailObj.currencyname
          ? detailObj.goodsName + '(' + detailObj.currencyname + ')'
          : detailObj.goodsName
      }`"
    />
    <app-cell class="mt-2" title="规格" :value="detailObj.goodsType" />
    <app-cell class="mt-2" title="保管账名称" :value="detailObj.storageName" />
    <app-cell class="mt-2" title="批号" :value="detailObj.lotNo" />
    <app-cell class="mt-2" title="产地" :value="detailObj.prodArea || '主档信息暂未维护'" />
    <app-cell class="mt-2" title="产地" :value="detailObj.prodArea || '主档信息暂未维护'" />

    <app-cell class="mt-2" title="货品状态">
      <up-tag :text="detailObj.goodsStatus" plain plainFill borderColor="transparent"> </up-tag>
    </app-cell>
    <app-cell
      v-show="detailObj.prodDate"
      class="mt-2"
      title="生产日期"
      :value="detailObj.prodDate"
    />
    <app-cell
      v-show="detailObj.invalidDate"
      class="mt-2"
      title="有效期至"
      :value="detailObj.invalidDate"
    />
    <app-cell
      class="mt-2"
      title="两票制"
      :value="
        detailObj.invoiceFlag == 1
          ? '两票制'
          : detailObj.invoiceFlag == 2
            ? '发票未到'
            : detailObj.invoiceFlag == 3
              ? '无两票制库存'
              : detailObj.invoiceFlag == 0
                ? '非两票制'
                : ''
      "
    />

    <app-cell
      v-if="detailObj.invoiceFlag !== 0"
      class="mt-2"
      title="两票制库存"
      :value="detailObj.invoiceGoodsNum || '0'"
      valueClass="color-main"
    />
    <app-cell
      class="mt-2"
      title="库存"
      :value="detailObj.goodsQuantity || '0'"
      valueClass="color-main"
    />
    <app-cell
      class="mt-2"
      title="包装"
      :value="detailObj.packSize + detailObj.goodsUnit + '/' + detailObj.packName"
      valueClass="color-main"
    />
    <app-cell class="mt-2" title="采购员" :value="detailObj.buyerName" />
  </view>
</template>

<script lang="ts" setup>
const appStore = useAppStore();
const detailObj = computed(() => appStore.detailObj);
</script>

<style lang="scss" scoped></style>
