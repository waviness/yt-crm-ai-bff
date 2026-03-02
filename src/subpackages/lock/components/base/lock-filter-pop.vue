<template>
  <view>
    <app-filter-pop
      v-model:filterShow="filterShow"
      :filterSome="filterSome"
      @confirm="onConfirm"
      @reset="reset"
    >
      <up-form>
        <app-form-item label="时间范围" class="mt-1">
          <view
            :class="`w-full text-right ${filterVal.startTime ? '' : 'color-gray-6'}`"
            @click="calendarRef.open()"
          >
            {{
              filterVal.startTime
                ? `${filterVal.startTime}至${filterVal.endTime}`
                : '点击选择时间范围'
            }}
          </view>
        </app-form-item>
        <app-form-item label="货品信息">
          <up-input
            v-model="filterVal.goodsKeyword"
            clearable
            placeholder="ID精确搜索|名称模糊搜索|操作码模糊搜索"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          >
          </up-input>
        </app-form-item>
        <app-form-item label="客户信息">
          <up-input
            v-model="filterVal.customerKeyword"
            placeholder="ID精确搜索|名称模糊搜索"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          />
        </app-form-item>
        <app-form-item v-if="conType === 0 && role === 2" label="核算单元">
          <up-input
            v-model="filterVal.entryKeyword"
            placeholder="ID精确搜索|名称模糊搜索"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          />
        </app-form-item>

        <app-form-item v-if="role === 2" label="核心客户类型">
          <view
            @click="showCustomerTypeFlag = true"
            :class="`w-full text-right ${filterVal.coreHospitalName ? '' : 'color-gray-6'}`"
          >
            {{ filterVal.coreHospitalName ? filterVal.coreHospitalName : '点击切换客户类型' }}
          </view>
        </app-form-item>
        <app-form-item
          v-if="(conType === 2 || conType === 3 || conType === 5) && role === 2"
          label="营运客户分类"
        >
          <view
            @click="handleOperatingCustomerClick"
            :class="`w-full text-right ${filterVal.operatingCustomerStatus ? '' : 'color-gray-6'}`"
          >
            {{
              filterVal.operatingCustomerStatus
                ? filterVal.operatingCustomerStatus
                : '点击选择营运客户分类'
            }}
          </view>
        </app-form-item>
        <app-form-item v-if="role === 2" label="不包含货品">
          <view
            @click="handleExGoodsClick"
            :class="`w-full text-right ${filterVal.exgoodsIds && filterVal.exgoodsIds.length ? '' : 'color-gray-6'}`"
          >
            {{
              filterVal.exgoodsIds && filterVal.exgoodsIds.length
                ? `已选择${filterVal.exgoodsIds.length}个不包含货品ID`
                : '点击选择不包含货品'
            }}
          </view>
        </app-form-item>
        <app-form-item label="锁控类型" v-if="conType === 0 && role === 2">
          <view
            :class="`w-full text-right ${filterVal.conTypeText ? '' : 'color-gray-6'}`"
            @click="conTypeClick"
          >
            {{ filterVal.conTypeText ? filterVal.conTypeText : '请选择锁控类型' }}
          </view>
        </app-form-item>
        <app-form-item label="是否医疗机构">
          <up-radio-group
            class="flex flex-row justify-end"
            v-model="filterVal.publicHospitalFlag"
            direction="row"
          >
            <up-radio
              v-for="item in hospitalOptions"
              :key="item.value"
              :name="item.value"
              :label="item.label"
            />
          </up-radio-group>
        </app-form-item>

        <app-form-item label="采购是否反馈" v-if="+role === 1 && (conType === 7 || conType === 8)">
          <up-radio-group
            class="flex flex-row justify-end"
            v-model="filterVal.isOutOfStockHandle"
            direction="row"
          >
            <up-radio key="" name="" label="全部" />
            <up-radio :key="1" :name="1" label="是" />
            <up-radio :key="0" :name="0" label="否" />
          </up-radio-group>
        </app-form-item>
        <app-form-item label="是否超期未到货" v-if="+role === 2 && conType === 0">
          <up-radio-group
            class="flex flex-row justify-end"
            v-model="filterVal.overdueFlag"
            direction="row"
          >
            <up-radio key="" name="" label="全部" />
            <up-radio :key="1" :name="1" label="是" />
          </up-radio-group>
        </app-form-item>
      </up-form>
    </app-filter-pop>
    <app-calendar ref="calendarRef" :endDate="maxDate" mode="range" @confirm="calendarConfirm" />
    <app-action-sheet
      v-model:show="showCustomerTypeFlag"
      :actions="customerTypeOptions"
      description="类型选择"
      @select="handleCustomerType"
    />
    <up-popup
      :zIndex="999"
      :show.async="exGoodsShow"
      mode="bottom"
      :customStyle="{ height: '90vh' }"
      :round="30"
      @close="exGoodsShow = false"
    >
      <exGoods
        :querySelfNumber="querySelfNumber"
        @handleFilterOk="handleExGoodsOk"
        @cancelClick="exGoodsShow = false"
        :exgoodsIds="filterVal.exgoodsIds"
      ></exGoods>
    </up-popup>
    <up-popup
      :zIndex="999"
      :show.async="conTypeShow"
      mode="bottom"
      minHeight="600rpx"
      :round="30"
      @close="conTypeShow = false"
    >
      <view class="flex align-center justify-between py-4 px-4 text-16">
        <view class="text-12" @click="conTypeShow = false">取消</view>
        <view class="font-bold">使用状态</view>
        <view class="text-12" @click="handleConTypeOk">确认</view>
      </view>
      <view
        @click="chooseConType(item)"
        class="text-center pa-4"
        :class="getClass(item.value) ? 'active' : ''"
        v-for="item in statusOptions"
        :key="item.value"
      >
        {{ item.label }}
      </view>
    </up-popup>
  </view>
</template>

<script lang="ts" setup>
import type { FilterValues } from '../../types/index';
import exGoods from '../business/ex-goods.vue';
interface Props {
  conType: number;
  role: number;
  formData: FilterValues;
  querySelfNumber?: number | string;
}
const props = defineProps<Props>();
interface Emits {
  (e: 'confirm', data: FilterValues): void;
}

const emit = defineEmits<Emits>();
const filterVal = ref<FilterValues>({ ...props.formData });
const filterShow = ref(false);
const isFilled = (
  value: string | undefined | null | (number | string)[]
): value is NonNullable<string | string[]> => {
  if (typeChecker.isArray(value)) {
    return value.length > 0;
  }
  return value !== undefined && value !== null && value !== '';
};
// 是否有筛选条件
const filterSome = computed(() => {
  return Object.values(filterVal.value).some(isFilled);
});

// 确认筛选
const onConfirm = () => {
  filterShow.value = false;
  emit('confirm', { ...filterVal.value });
};

// 重置筛选条件
const reset = () => {
  filterVal.value = {
    startTime: props.formData.startTime,
    endTime: props.formData.endTime,
    goodsKeyword: '',
    customerKeyword: '',
    operatingCustomerStatus: '',
    coreHospitalType: '',
    coreHospitalName: '',
    entryKeyword: '',
    publicHospitalFlag: '',
    exgoodsIds: [],
    conTypeList: [],
  };
};
// 日期相关
const calendarRef = ref();
const maxDate = ref(time.format(time.add(new Date(), 0, 'year'), time.FORMATS.ISO_DATE));
// 日期范围选择
const calendarConfirm = (val: { range: { before: string; after: string } }) => {
  if (!val?.range?.before || !val?.range?.after) return;
  filterVal.value.startTime = val.range.before;
  filterVal.value.endTime = val.range.after;
};

const showCustomerTypeFlag = ref(false); // 客户类型显示
const customerTypeOptions = ref([
  { name: '全部', value: '' },
  { name: '非核心客户', value: 0 },
  { name: '核心客户', value: 1 },
]);
const hospitalOptions = ref([
  { label: '全部', value: '' },
  { label: '是', value: 1 },
  { label: '否', value: 0 },
]);
const handleCustomerType = (item: any) => {
  console.log(item);
};
const handleOperatingCustomerClick = (item: any) => {
  console.log(item);
};
const conTypeShow = ref(false);
const statusOptions = ref([
  { label: '缺货', value: 0 },
  { label: '库存状态', value: 7 },
  { label: '近效期', value: 8 },
]);
const conTypeClick = () => {
  conTypeShow.value = true;
};
const chooseConType = (item: any) => {
  if (!item.value && item.value !== 0) {
    if (filterVal.value.conTypeList.length == statusOptions.value.length) {
      filterVal.value.conTypeList = [];
    } else {
      filterVal.value.conTypeList = [];
      statusOptions.value.forEach((element: any) => {
        filterVal.value.conTypeList.push(element.value);
      });
    }
    return;
  }
  if (filterVal.value.conTypeList.indexOf(item.value) > -1) {
    filterVal.value.conTypeList.splice(filterVal.value.conTypeList.indexOf(item.value), 1);
  } else {
    filterVal.value.conTypeList.push(item.value);
  }
  console.log(filterVal.value.conTypeList);
};
const getClass = (data: number | string) => {
  if (filterVal.value.conTypeList.indexOf(data) > -1) {
    return true;
  } else {
    return false;
  }
};
const handleConTypeOk = () => {
  filterVal.value.conTypeText = statusOptions.value
    .filter((item: any) => filterVal.value.conTypeList.includes(item.value))
    .map((item: any) => item.label)
    .join(',');
  conTypeShow.value = false;
  console.log(filterVal.value);
  console.log(filterVal.value.conTypeText);
};
const exGoodsShow = ref(false);
const handleExGoodsClick = () => {
  exGoodsShow.value = true;
};
const handleExGoodsOk = (val: any) => {
  filterVal.value.exgoodsIds = val;
  exGoodsShow.value = false;
};
</script>
<style lang="scss" scoped>
.active {
  color: #2271f5;
  background: rgba(#2271f5, 0.1);
}
</style>
