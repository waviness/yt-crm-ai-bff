<script setup lang="ts">
import { useVbpProjectGoods } from '../composables/use-vbp-project-goods';

const props = defineProps<{
  goodsName: string;
}>();

const emit = defineEmits<{
  close: [];
  confirm: [];
}>();

// Composables
const { loading, show, formData, onClose, addGoods, init } = useVbpProjectGoods();

// 生命周期
onMounted(() => {
  init(props.goodsName);
});
</script>

<template>
  <up-popup
    :show="show"
    position="bottom"
    round="16"
    customStyle="height: 80vh"
    @close="() => onClose(emit)"
  >
    <view class="flex flex-col h-full">
      <view class="text-16 font-bold flex justify-between items-center py-3 px-4">
        <up-icon
          name="arrow-left"
          :size="18"
          color="#969799"
          @click="() => onClose(emit)"
        />手动录入品种<up-icon
          name="close"
          :size="22"
          color="#C8C9CC"
          @click="() => onClose(emit)"
        />
      </view>
      <up-form class="mt-1 flex-1" :border="false">
        <app-form-item label="品种名称">
          <up-input
            v-model="formData.goodsName"
            placeholder="点击输入品种名称"
            input-align="right"
            fontSize="28rpx"
            readonly
            border="none"
          />
        </app-form-item>
        <app-form-item label="厂家">
          <up-input
            v-model="formData.factory"
            placeholder="点击输入厂家信息"
            input-align="right"
            fontSize="28rpx"
            border="none"
          />
        </app-form-item>
        <app-form-item label="规格">
          <up-input
            v-model="formData.goodsType"
            placeholder="点击输入规格信息"
            input-align="right"
            fontSize="28rpx"
            border="none"
          />
        </app-form-item>
      </up-form>
      <view class="p-4">
        <up-button type="primary" shape="circle" @click="() => addGoods(emit)" :loading="loading"
          >确定</up-button
        >
      </view>
    </view>
  </up-popup>
</template>
