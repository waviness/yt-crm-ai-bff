<template>
  <view>
    <view class="filter-wrapper pa-2 relative z-100">
      <view
        class="filter-button flex items-center justify-between pa-3 rd-2"
        :class="[
          filterShow ? 'filter-button--active' : '',
          filterActive ? 'filter-button--has-filter' : '',
        ]"
        @click="filterShow = !filterShow"
      >
        <text>条件筛选</text>
        <up-icon :name="filterShow ? 'arrow-up' : 'arrow-down'" size="16"></up-icon>
      </view>
    </view>

    <up-popup
      v-model:show="filterShow"
      mode="top"
      :round="10"
      :zIndex="99"
      customStyle="top: 88rpx"
    >
      <view class="filter-popup">
        <up-form>
          <app-form-item label="客户名称" class="mt-1">
            <up-input
              v-model="filterVal.custom"
              clearable
              placeholder="请输入客户名称|客户ID"
              inputAlign="right"
              fontSize="28rpx"
              border="none"
            />
          </app-form-item>
          <app-form-item label="客户类型">
            <view
              :class="`w-full text-right ${customerObj.name ? '' : 'color-gray-6'}`"
              @click="chooseFilter(1)"
            >
              {{ customerObj.name || '点击选择' }}
            </view>
          </app-form-item>
          <app-form-item label="标签/关联" :borderBottom="false">
            <view
              :class="`w-full text-right ${relObj.name ? '' : 'color-gray-6'}`"
              @click="chooseFilter(2)"
            >
              {{ relObj.name || '点击选择' }}
            </view>
          </app-form-item>
        </up-form>

        <view class="filter-actions flex justify-around pa-4">
          <up-button
            :customStyle="{ width: '280rpx', height: '70rpx' }"
            text="重置"
            shape="circle"
            @click="reset"
          />
          <up-button
            :customStyle="{ width: '280rpx', height: '70rpx' }"
            text="确认"
            type="primary"
            shape="circle"
            @click="onConfirm"
          />
        </view>
      </view>

      <!-- Action Sheets -->
      <app-action-sheet
        v-if="actionType === 1"
        :show="actionShow"
        :actions="props.customTypeList"
        cancel-text="取消"
        close-on-click-action
        @select="onSelectCustomerType"
        @update:show="actionShow = $event"
      />
      <app-action-sheet
        v-if="actionType === 2"
        :show="actionShow"
        :actions="relOptions"
        cancel-text="取消"
        close-on-click-action
        @select="onSelectRel"
        @update:show="actionShow = $event"
      />
    </up-popup>
  </view>
</template>

<script setup lang="ts">
import type { CustomerPersonFilterData, RelOption, OptionItem } from '../types';

interface Props {
  formData: CustomerPersonFilterData;
  relOptions: RelOption[];
  customTypeList: OptionItem[];
  filterActive: boolean;
}

interface Emits {
  (e: 'confirm', data: CustomerPersonFilterData): void;
  (e: 'reset'): void;
}

const props = withDefaults(defineProps<Props>(), {
  customTypeList: () => [],
});
const emit = defineEmits<Emits>();

// 筛选弹窗显示状态
const filterShow = ref(false);

// ActionSheet state
const actionShow = ref(false);
const actionType = ref(0);

// 筛选值
const filterVal = ref<CustomerPersonFilterData>({
  ...props.formData,
});

// 选中的对象（用于显示）
const customerObj = ref<{ name: string; value: string }>({ name: '', value: '' });
const relObj = ref<{ name: string; value: string }>({ name: '', value: '' });

// 监听formData变化，同步到filterVal
watch(
  () => props.formData,
  newVal => {
    filterVal.value = { ...newVal };
    // 回显选中的客户类型
    if (newVal.customerType) {
      const found = props.customTypeList.find((item: any) => item.value === newVal.customerType);
      if (found) {
        customerObj.value = found;
      }
    } else {
      customerObj.value = { name: '', value: '' };
    }
    // 回显选中的关联状态
    if (newVal.sourceType !== undefined || newVal.relStatus !== undefined) {
      const relValue = `${newVal.sourceType || ''}-${newVal.relStatus || ''}`.replace(/^-|-$/g, '');
      const found = props.relOptions.find(item => item.value === relValue);
      if (found) {
        relObj.value = found;
      }
    } else {
      relObj.value = { name: '', value: '' };
    }
  },
  { immediate: true, deep: true }
);

// 打开选择器
const chooseFilter = (type: number) => {
  actionShow.value = true;
  actionType.value = type;
};

// 选择客户类型
const onSelectCustomerType = (option: any) => {
  customerObj.value = option;
  filterVal.value.customerType = option.value;
  actionShow.value = false;
};

// 选择关联状态
const onSelectRel = (option: RelOption) => {
  relObj.value = option;
  const [sourceType, relStatus] = option.value.split('-');
  filterVal.value.sourceType = sourceType || '';
  filterVal.value.relStatus = relStatus || '';
  actionShow.value = false;
};

// 重置筛选条件
const reset = () => {
  filterVal.value = {
    custom: '',
    sourceType: '',
    customerType: '',
    relStatus: '',
  };
  customerObj.value = { name: '', value: '' };
  relObj.value = { name: '', value: '' };
  filterShow.value = false;
  emit('reset');
};

// 确认筛选
const onConfirm = () => {
  filterShow.value = false;
  emit('confirm', filterVal.value);
};
</script>

<style lang="scss" scoped>
.filter-wrapper {
  background: #f5f6f9;
}

.filter-button {
  background: #fff;
  font-size: 28rpx;
  transition: all 0.3s;

  &--active {
    color: #2271f5;
  }

  &--has-filter {
    background: #2271f5;
    color: #fff;
  }
}

.filter-popup {
  padding: 20rpx 0;
}

.color-gray-6 {
  color: #666;
}
</style>
