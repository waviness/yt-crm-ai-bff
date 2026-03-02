<script lang="ts" setup>
import { ref, watch } from 'vue';
import type { FilterFormData } from '../types';

/**
 * 定义组件的props属性
 * @param licenseType - 证照类型：0-企业证照，1-客户/供应商法人委托书
 * @param formData - 表单数据对象
 */
interface IProps {
  licenseType?: number;
  formData: FilterFormData;
}

const props = withDefaults(defineProps<IProps>(), {
  licenseType: 0,
});

const calendarRef = ref();

/**
 * 证照类型选项
 */
const licenseTypeOptions = ref([
  {
    name: '企业证照',
    value: 0,
  },
  {
    name: '客户/供应商法人委托书',
    value: 1,
  },
]);

/**
 * 过期状态选项
 */
const statusOptions = ref([
  {
    value: 1,
    name: '已过期',
  },
  {
    value: 0,
    name: '未过期',
  },
]);

/**
 * 单位类型选项
 */
const typeOptions = ref([
  {
    name: '客户',
    value: 2,
  },
  {
    name: '供应商',
    value: 1,
  },
]);

/**
 * 控制证照类型选择弹窗显示状态
 */
const changeTypeShow = ref(false);

/**
 * 控制筛选条件弹窗显示状态
 */
const filterShow = ref(false);

/**
 * 控制下拉选择弹窗显示状态
 */
const typeShow = ref(false); // 单位类型
const statusShow = ref(false); // 过期状态

/**
 * 筛选表单数据
 */
const filterVal = ref<FilterFormData>({
  companyKeyWord: '',
  licenseKeyWord: '',
  queryEntryId: '',
  expireStatus: {
    value: '',
    name: '',
  },
  validEndDateBegin: '',
  validEndDateTerminate: '',
  companyType: {
    value: '',
    name: '',
  },
});

/**
 * 定义组件事件发射器
 */
const emit = defineEmits(['typeChange', 'confirm']);

/**
 * 证照类型更改处理函数
 */
const handleTypeChange = (val: string) => {
  console.log('handleTypeChange', val);
  filterVal.value = {
    companyKeyWord: '',
    licenseKeyWord: '',
    queryEntryId: '',
    expireStatus: {
      value: '',
      name: '',
    },
    validEndDateBegin: '',
    validEndDateTerminate: '',
    companyType: {
      value: '',
      name: '',
    },
  };
  changeTypeShow.value = false;
  emit('typeChange', filterVal.value, val);
};

/**
 * 选择过期状态处理函数
 * @param action - 选择的动作对象
 */
const handleSelectStatus = (action: any) => {
  statusShow.value = false;
  filterVal.value.expireStatus = action;
};

/**
 * 选择单位类型处理函数
 * @param action - 选择的动作对象
 */
const handleSelectType = (action: any) => {
  console.log(action);
  typeShow.value = false;
  filterVal.value.companyType = action;
};

/**
 * 日期确认处理函数
 * @param value - 选择的日期范围数组
 */
const handleDateConfirm = (value: any) => {
  filterVal.value.validEndDateBegin = value.range.before;
  filterVal.value.validEndDateTerminate = value.range.after;
};

/**
 * 重置筛选条件函数
 */
const reset = () => {
  filterVal.value = {
    companyKeyWord: '',
    licenseKeyWord: '',
    queryEntryId: '',
    expireStatus: {
      value: '',
      name: '',
    },
    validEndDateBegin: '',
    validEndDateTerminate: '',
    companyType: {
      value: '',
      name: '',
    },
  };
};

/**
 * 确认筛选条件函数
 */
const handleConfirm = () => {
  filterShow.value = false;
  emit('confirm', filterVal.value);
};

/**
 * 监听表单数据变化
 * @param newValue - 新的表单数据
 */
watch(
  () => props.formData,
  newValue => {
    filterVal.value = newValue as any;
    console.log('filterVal', filterVal.value);
  }
);
</script>

<template>
  <view>
    <view class="bg-white relative px-2 py-10 z-[9999] flex">
      <view
        :class="[
          'h-80 line-height-10 text-14 filter-border flex items-center justify-around flex-1 slh',
          changeTypeShow ? 'color-main' : '',
        ]"
        @click="
          filterShow = false;
          changeTypeShow = !changeTypeShow;
        "
      >
        <view>{{ licenseType === 0 ? '企业证照' : '客户/供应商法人委托书' }}</view>
        <up-icon
          :name="`arrow-${changeTypeShow ? 'up' : 'down'}`"
          :color="filterShow ? 'main' : ''"
          size="32rpx"
        />
      </view>
      <view
        :class="[
          'ml-2 w-272 h-80 line-height-10 text-14 filter-border flex items-center justify-between px-10',
          filterShow ? 'color-main' : '',
        ]"
        @click="
          changeTypeShow = false;
          filterShow = !filterShow;
        "
      >
        <view>条件筛选</view>
        <up-icon
          :name="`arrow-${filterShow ? 'up' : 'down'}`"
          :color="filterShow ? 'main' : ''"
          size="16px"
        />
      </view>
    </view>
    <up-popup
      :show="changeTypeShow"
      :zIndex="999"
      mode="top"
      round="16"
      customStyle="top: 116rpx"
      @close="changeTypeShow = false"
    >
      <up-radio-group
        :modelValue="licenseType"
        icon-placement="right"
        class="mt-1 mb-3 flex-row-reverse"
        @change="handleTypeChange"
      >
        <up-form class="w-full">
          <app-form-item
            v-for="(item, idx) in licenseTypeOptions"
            :key="idx"
            :label="item.name"
            :borderBottom="idx !== licenseTypeOptions.length - 1"
          >
            <view class="w-full text-right">
              <up-radio :name="item.value" />
            </view>
          </app-form-item>
        </up-form>
      </up-radio-group>
    </up-popup>
    <up-popup
      :show="filterShow"
      :zIndex="999"
      mode="top"
      round="16"
      customStyle="top: 116rpx"
      @close="filterShow = false"
    >
      <up-form borderBottom>
        <app-form-item v-if="licenseType === 1" label="单位类型">
          <view
            :class="`w-full text-right ${filterVal.companyType.value ? '' : 'color-gray-6'}`"
            @click="typeShow = true"
          >
            {{ filterVal.companyType.name || '点击选择' }}
          </view>
        </app-form-item>
        <app-form-item label="客户名称">
          <up-input
            v-model="filterVal.companyKeyWord"
            clearable
            placeholder="请输入客户名称|客户ID"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          >
          </up-input>
        </app-form-item>
        <app-form-item :label="licenseType === 0 ? '证照信息' : '委托书信息'">
          <up-input
            v-model="filterVal.licenseKeyWord"
            clearable
            :placeholder="licenseType === 0 ? '请输入证照ID|名称' : '请输入委托书ID'"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          >
          </up-input>
        </app-form-item>
        <app-form-item label="核算单元">
          <up-input
            v-model="filterVal.queryEntryId"
            clearable
            placeholder="请输入核算单元ID"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          >
          </up-input>
        </app-form-item>
        <app-form-item label="过期状态">
          <view
            :class="`w-full text-right ${filterVal.expireStatus.name ? '' : 'color-gray-6'}`"
            @click="statusShow = true"
          >
            {{ filterVal.expireStatus.name || '点击选择' }}
          </view>
        </app-form-item>
        <app-form-item label="有效期至" :borderBottom="false">
          <view
            :class="`w-full text-right ${filterVal.validEndDateBegin ? '' : 'color-gray-6'}`"
            @click="calendarRef.open()"
          >
            {{
              `${
                filterVal.validEndDateBegin
                  ? filterVal.validEndDateBegin + ' 至 ' + filterVal.validEndDateTerminate
                  : '点击选择'
              }`
            }}
          </view>
        </app-form-item>
      </up-form>
      <view class="h-160 flex items-center justify-space-evenly px-4">
        <up-button shape="circle" @click="reset">重置</up-button>
        <up-button class="ml-4" shape="circle" type="primary" @click="handleConfirm"
          >确认</up-button
        >
      </view>
      <app-action-sheet
        v-model:show="statusShow"
        :actions="statusOptions"
        description="过期状态选择"
        @select="handleSelectStatus"
      />
      <app-calendar ref="calendarRef" mode="range" @confirm="handleDateConfirm" />
      <app-action-sheet
        v-model:show="typeShow"
        :actions="typeOptions"
        description="单位类型选择"
        @select="handleSelectType"
      />
    </up-popup>
  </view>
</template>
