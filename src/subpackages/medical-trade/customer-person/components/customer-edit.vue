<template>
  <view class="customer-edit pb-120">
    <view class="bg-white mb-4 pa-2">
      <view class="flex justify-between items-start">
        <view class="font-bold flex-1">
          <view>{{ detailInfo.szymCustomerId }}/</view>
          <view>{{ detailInfo.customerName?.split('/')[0] || '' }}</view>
        </view>
        <view class="flex flex-col items-end ml-4">
          <text class="tag-primary-plain mb-2">
            {{ detailInfo.sourceType === 0 ? '拓展客户' : '业务系统内客户' }}
          </text>
          <text class="tag-primary-plain">{{ detailInfo.customerTypeName }}</text>
        </view>
      </view>
    </view>

    <up-form>
      <app-form-item label="客户类型" class="mt-1">
        <view
          :class="`w-full text-right ${localCustomTypeObj.name ? '' : 'color-gray-6'}`"
          @click="chooseFilter(1)"
        >
          {{ localCustomTypeObj.name || '点击选择' }}
        </view>
      </app-form-item>

      <app-form-item label="学术专线">
        <view
          :class="`w-full text-right ${localScienceLineObj.name ? '' : 'color-gray-6'}`"
          @click="chooseFilter(2)"
        >
          {{ localScienceLineObj.name || '点击选择' }}
        </view>
      </app-form-item>

      <app-form-item label="经营性质" :borderBottom="false">
        <view
          :class="`w-full text-right ${localBusinessNatureObj.name ? '' : 'color-gray-6'}`"
          @click="chooseFilter(3)"
        >
          {{ localBusinessNatureObj.name || '点击选择' }}
        </view>
      </app-form-item>
    </up-form>

    <view class="commonButton-footer flex justify-center">
      <up-button
        :customStyle="{ width: '240rpx', height: '70rpx' }"
        text="取消"
        shape="circle"
        plain
        @click="handleCancel"
      />
      <up-button
        :customStyle="{ width: '240rpx', height: '70rpx' }"
        text="确定"
        type="primary"
        shape="circle"
        @click="handleSubmit"
      />
    </view>

    <!-- Action Sheets -->
    <app-action-sheet
      v-if="actionType === 1"
      :show="actionShow"
      :actions="props.customTypeList"
      cancel-text="取消"
      close-on-click-action
      @select="selectCustomType"
      @update:show="actionShow = $event"
    />
    <app-action-sheet
      v-if="actionType === 2"
      :show="actionShow"
      :actions="props.scienceLineTypeList"
      cancel-text="取消"
      close-on-click-action
      @select="selectScienceLine"
      @update:show="actionShow = $event"
    />
    <app-action-sheet
      v-if="actionType === 3"
      :show="actionShow"
      :actions="props.businessNatureTypeList"
      cancel-text="取消"
      close-on-click-action
      @select="selectBusinessNature"
      @update:show="actionShow = $event"
    />
  </view>
</template>

<script lang="ts" setup>
import type { CustomerPersonItem, OptionItem } from '../types';

interface Props {
  detailInfo: CustomerPersonItem;
  customTypeObj: OptionItem;
  businessNatureObj: OptionItem;
  scienceLineObj: OptionItem;
  customTypeList: OptionItem[];
  scienceLineTypeList: OptionItem[];
  businessNatureTypeList: OptionItem[];
}

interface Emits {
  (e: 'cancel'): void;
  (e: 'submit'): void;
}

const props = withDefaults(defineProps<Props>(), {
  customTypeList: () => [],
  scienceLineTypeList: () => [],
  businessNatureTypeList: () => [],
});
const emit = defineEmits<Emits>();

// ActionSheet state
const actionShow = ref(false);
const actionType = ref(0);

// 本地副本，避免直接修改props
const localCustomTypeObj = ref({ ...props.customTypeObj });
const localBusinessNatureObj = ref({ ...props.businessNatureObj });
const localScienceLineObj = ref({ ...props.scienceLineObj });

// 打开选择器
const chooseFilter = (type: number) => {
  actionShow.value = true;
  actionType.value = type;
};

// 选择客户类型
const selectCustomType = (option: OptionItem) => {
  localCustomTypeObj.value = option;
  actionShow.value = false;
};

// 选择学术专线
const selectScienceLine = (option: OptionItem) => {
  localScienceLineObj.value = option;
  actionShow.value = false;
};

// 选择经营性质
const selectBusinessNature = (option: OptionItem) => {
  localBusinessNatureObj.value = option;
  actionShow.value = false;
};

const handleCancel = () => {
  emit('cancel');
};

const handleSubmit = () => {
  // 更新父组件的值
  Object.assign(props.customTypeObj, localCustomTypeObj.value);
  Object.assign(props.businessNatureObj, localBusinessNatureObj.value);
  Object.assign(props.scienceLineObj, localScienceLineObj.value);
  emit('submit');
};

// 监听props变化，同步到本地副本
watch(
  () => [props.customTypeObj, props.businessNatureObj, props.scienceLineObj],
  () => {
    localCustomTypeObj.value = { ...props.customTypeObj };
    localBusinessNatureObj.value = { ...props.businessNatureObj };
    localScienceLineObj.value = { ...props.scienceLineObj };
  },
  { deep: true }
);
</script>

<style lang="scss" scoped>
.customer-edit {
  max-height: 70vh;
  overflow-y: auto;
}
.color-gray-6 {
  color: #666;
}
</style>
