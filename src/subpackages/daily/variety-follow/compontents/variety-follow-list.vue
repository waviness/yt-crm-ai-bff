<template>
  <view class="list-card mb-2">
    <view class="bg-white pa-2" @click="handleClick">
      <view class="flex mb-2 justify-between items-center">
        <text class="text-16 font-bold">{{ itemObj.objName }}</text>
        <up-icon v-if="arrowShow" name="arrow-right" size="14" color="#969799" />
      </view>

      <app-infor-item
        v-if="type === 0"
        class="mb-1"
        title="厂牌数量"
        :content="itemObj.brandCount"
      />
      <app-infor-item
        v-if="type === 1"
        class="mb-1"
        title="客户数量"
        :content="itemObj.customCount"
      />
      <app-infor-item class="mb-1" title="品种数量" :content="itemObj.goodsCount" />
      <app-infor-item class="mb-1" title="待填报数量" :content="itemObj.unFillCount" />
    </view>

    <view v-if="isCustomer" class="flex flex-col items-end pa-2">
      <view>
        <up-button
          :customStyle="'width: 120px'"
          size="small"
          type="primary"
          shape="circle"
          text="一键未完成"
          @click.capture="onFillSubmit"
        >
        </up-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
interface Props {
  itemObj: any;
  arrowShow?: boolean;
  isCustomer?: boolean;
  type?: number; // 0 按客户上报 1 按品牌上报
}

const props = withDefaults(defineProps<Props>(), {
  arrowShow: true,
  isCustomer: false,
  type: 1,
});

const emit = defineEmits<{
  (e: 'onFillSubmit', item: any): void;
  (e: 'click', item: any): void;
}>();

const onFillSubmit = () => {
  emit('onFillSubmit', props.itemObj);
};
const handleClick = () => {
  emit('click', props.itemObj);
};
</script>

<style lang="scss" scoped>
.list-card {
  background: #f9f9f9;
  box-shadow: 0 1px 6px 1px rgb(209 207 207 / 30%);
  border-radius: 5px;
}
</style>
