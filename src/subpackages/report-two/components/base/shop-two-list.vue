<template>
  <view class="flex">
    <view class="pos-relative">
      <u-image
        class="pl-2"
        width="110"
        height="100"
        :src="
          item.smallimglink &&
          item.smallimglink != '`http://pic.drugoogle.com/medicine/75x66/2010070114525558283.jpg`'
            ? item.smallimglink
            : ''
        "
      />
      <view
        v-show="item.goodsStatusId"
        class="pos-absolute label text-12"
        :class="item.goodsStatusId === 3 ? 'status' : 'deal'"
      >
        {{ item.goodsStatus }}
      </view>
    </view>

    <view class="flex-1 px-2">
      <app-infor-item contentClass="color-gray-5" :content="item.goodsId + '/' + item.goodsName" />
      <app-infor-item
        title="批号："
        contentClass="font-bold"
        :content="item.invoiceWay === 2 ? '特惠库存' : '普通库存'"
      />
      <app-infor-item title="可销库存：" :content="`${item.minQty}`" />
      <view class="flex flex justify-between">
        <view class="color-main">￥{{ item.price }}</view>
        <up-number-box
          :max="item.minQty"
          :min="0"
          :step="1"
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

<style lang="scss" scoped>
.label {
  width: 100px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  top: 50%;
  left: 50%;
  margin: -12px 0px 0px -50px;
  color: white;
}
.deal {
  background: #ea394b;
  border-radius: 2px;
  border: 1px solid #ea394b;
}
.status {
  background: #ed7b2f;
  border-radius: 2px;
  border: 1px solid #ed7b2f;
}
</style>
