<template>
  <view class="flex">
    <u-image
      class="pl-2"
      width="80"
      height="80"
      :src="
        item.smallimglink &&
        item.smallimglink != '`http://pic.drugoogle.com/medicine/75x66/2010070114525558283.jpg`'
          ? item.smallimglink
          : ''
      "
    />
    <view class="flex-1 px-2">
      <app-infor-item contentClass="color-gray-5" :content="item.goodsId + '/' + item.goodsName" />
      <app-infor-item
        title="库存类型"
        contentClass="color-main"
        :content="item.invoiceWay === 2 ? '特惠库存' : '普通库存'"
      />
      <app-infor-item
        title="最小销售数量"
        :contentClass="
          item.salesqtycontrol === 1
            ? 'color-never'
            : item.salesqtycontrol === 2
              ? 'color-normal'
              : '--'
        "
        :content="`${item.leastsaleqty}(${item.salesqtycontrol === 1 ? '严控' : item.salesqtycontrol === 2 ? '非严控' : '--'})`"
      />
      <view class="flex flex justify-between">
        <view class="color-main">￥{{ item.price }}</view>
        <up-number-box
          :min="0"
          :step="item.salesqtycontrol === 1 ? item.leastsaleqty : 1"
          v-model="localGoodsQty"
          @change="handleChange"
        ></up-number-box>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
interface IProps {
  item: any;
}

const props = defineProps<IProps>();
const emit = defineEmits(['change']);

// 使用本地ref来维护数量值
const localGoodsQty = ref(props.item.goodsQty);

// 当props中的goodsQty变化时，同步到本地ref
watch(
  () => props.item.goodsQty,
  newVal => {
    console.log('props.item.goodsQty 变化了', newVal);
    localGoodsQty.value = newVal;
  }
);

// 处理数量变化
const handleChange = ({ value }: { value: number }) => {
  localGoodsQty.value = value;
  // 然后触发change事件，传递最新的数量值
  emit('change', localGoodsQty.value);
};
</script>

<style lang="scss" scoped></style>
