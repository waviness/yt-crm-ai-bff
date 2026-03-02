<!-- 品种选择弹窗 -->
<script setup lang="ts">
import { useVbpProjectGoods } from '../composables/use-vbp-project-goods';
import AddGoodsPop from './add-goods-pop.vue';
import type { GoodsItem } from '../composables/use-vbp-project-goods';

interface IProps {
  goodsName: string;
}

const props = withDefaults(defineProps<IProps>(), {
  goodsName: '',
});

const emit = defineEmits<{
  close: [];
  confirm: [value: GoodsItem];
}>();

// Composables
const {
  show,
  searchValue,
  list,
  curIndex,
  curItem,
  addGoodsShow,
  onSearch,
  onItemClick,
  onConfirm,
  onClose,
  showAddGoods,
  closeAddGoods,
  addGoods,
  onAddGoodsSuccess,
  init,
} = useVbpProjectGoods();

// 生命周期
onMounted(() => {
  init(props.goodsName);
});
</script>

<template>
  <up-popup
    :show="show"
    closeable
    position="bottom"
    round="16"
    customStyle="height: 80vh"
    @close="() => onClose(emit)"
  >
    <view class="flex flex-col h-full">
      <view class="text-16 font-bold text-center py-3">品种检索</view>
      <app-search
        v-model="searchValue"
        placeholder="搜索"
        @search="(value: string) => onSearch(value, props.goodsName)"
      />
      <up-cell class="mt-2" title="手动录入品种" is-link @click="showAddGoods" />
      <view class="main-div">
        <view
          :class="['inner-block goods-item', curIndex === idx ? 'goods-item--active' : '']"
          v-for="(item, idx) in list"
          :key="idx"
          @click="onItemClick(item, idx)"
        >
          <view class="flex">
            <view class="color-gray-4">品种</view>
            <view class="ml-7">{{ item.goodsName }}</view>
          </view>
          <view class="flex mt-1">
            <view class="color-gray-4">厂家</view>
            <view class="ml-7">{{ item.factoryName }}</view>
          </view>
          <view class="flex mt-1">
            <view class="color-gray-4">规格</view>
            <view class="ml-7">{{ item.goodsType }}</view>
          </view>
        </view>
        <app-empty v-if="!list.length" class="py-7" description="暂无数据" />
      </view>
      <view class="p-4">
        <up-button type="primary" shape="circle" @click="() => onConfirm(emit)">确定</up-button>
      </view>
    </view>
    <add-goods-pop
      v-if="addGoodsShow"
      :goodsName="goodsName"
      @close="closeAddGoods"
      @confirm="onAddGoodsSuccess"
    />
  </up-popup>
</template>

<style lang="scss" scoped>
.main-div {
  height: calc(100% - 227px);
  overflow-y: auto;
}

.goods-item {
  border: 1px solid #979797;
  border-radius: 5px;
  padding: 10px;
  margin: 8px 10px;

  &--active {
    border: 1px solid #2271f5;
  }
}
</style>
