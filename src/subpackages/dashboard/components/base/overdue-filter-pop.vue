<script setup lang="ts">
const emit = defineEmits<{
  confirm: [data: any];
}>();

const filterShow = ref(false);

const filterObj = ref({
  entry: '',
  custom: '',
  checkboxGroup: ['isInner', 'isNegative'],
});

const filterSome = computed(() => {
  return !!filterObj.value.entry || !!filterObj.value.custom;
});

const reset = () => {
  filterObj.value = {
    entry: '',
    custom: '',
    checkboxGroup: ['isInner', 'isNegative'],
  };
};

const onConfirm = () => {
  const params = {
    entry: filterObj.value.entry,
    custom: filterObj.value.custom,
    isInner: filterObj.value.checkboxGroup.includes('isInner') ? 1 : 0,
    isNegative: filterObj.value.checkboxGroup.includes('isNegative') ? 1 : 0,
  };
  emit('confirm', params);
};
</script>

<template>
  <view>
    <app-filter-pop
      v-model:filterShow="filterShow"
      :filterSome="filterSome"
      @confirm="onConfirm"
      @reset="reset"
    >
      <up-form :model="filterObj">
        <app-form-item label="核算单元">
          <up-input
            v-model="filterObj.entry"
            placeholder="点击输入核算单元ID/名称"
            clearable
            border="none"
            inputAlign="right"
            fontSize="28rpx"
          />
        </app-form-item>
        <app-form-item label="客户ID/名称">
          <up-input
            v-model="filterObj.custom"
            placeholder="点击输入客户ID/名称"
            clearable
            border="none"
            inputAlign="right"
            fontSize="28rpx"
          />
        </app-form-item>
        <app-form-item>
          <up-checkbox-group v-model="filterObj.checkboxGroup">
            <up-checkbox name="isInner" label="剔除内部单位" />
            <up-checkbox name="isNegative" label="剔除负数长账龄" class="ml-4" />
          </up-checkbox-group>
        </app-form-item>
      </up-form>
    </app-filter-pop>
  </view>
</template>
