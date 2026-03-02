<script setup lang="ts">
interface IProps {
  filterShow: boolean;
  filterVal: any;
}

const props = withDefaults(defineProps<IProps>(), {
  filterShow: false,
  filterVal: () => ({}),
});

// 事件定义
const emit = defineEmits(['confirm', 'update:filterShow']);

// 内部状态
const localFilterVal = ref({ ...props.filterVal });

// 监听 props 变化，同步到内部状态
watch(
  () => props.filterVal,
  newVal => {
    localFilterVal.value = { ...newVal };
  }
);

// 确认筛选
const handleFilterConfirm = () => {
  emit('update:filterShow', false);
  emit('confirm', localFilterVal.value);
};

// 重置筛选
const reset = () => {
  localFilterVal.value = {
    goodsId: '',
    goodsName: '',
    sendFlag: 0,
  };
};
</script>

<template>
  <up-popup
    :show="filterShow"
    :zIndex="997"
    mode="bottom"
    round="16"
    @close="emit('update:filterShow', false)"
  >
    <up-form borderBottom>
      <app-form-item label="货品ID" class="mt-3">
        <up-input
          v-model="localFilterVal.goodsId"
          clearable
          placeholder="请输入货品ID"
          inputAlign="right"
          fontSize="28rpx"
          border="none"
        >
        </up-input>
      </app-form-item>
      <app-form-item label="货品名称">
        <up-input
          v-model="localFilterVal.goodsName"
          clearable
          placeholder="请输入货品名称"
          inputAlign="right"
          fontSize="28rpx"
          border="none"
        >
        </up-input>
      </app-form-item>
      <view class="bg-white flex justify-between items-center px-4 py-3 block mt-2">
        <view class="text-14 color-gray-5">状态筛选</view>
        <up-radio-group v-model="localFilterVal.sendFlag" class="justify-end">
          <up-radio :name="0" label="全部" iconSize="16" labelSize="14"></up-radio>
          <up-radio :name="1" label="已发送" iconSize="16" labelSize="14"></up-radio>
          <up-radio :name="2" label="未发送" iconSize="16" labelSize="14"></up-radio>
        </up-radio-group>
      </view>
    </up-form>
    <view class="h-160 flex items-center justify-space-evenly px-4">
      <up-button shape="circle" @click="reset">重置</up-button>
      <up-button class="ml-4" shape="circle" type="primary" @click="handleFilterConfirm"
        >确认</up-button
      >
    </view>
  </up-popup>
</template>
