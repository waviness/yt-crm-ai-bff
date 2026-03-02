<script setup lang="ts">
import labelTreePop from '@/components/biz/label-tree-pop.vue';
type FilterData = {
  startTime: string;
  endTime: string;
  labelText: string;
  labelIdList: string[];
  customerKeyword: string;
  visitType: string;
};
const props = defineProps<{
  filterObj: FilterData;
}>();
// 状态管理
const filterShow = ref(false);
// 筛选值
const filterVal = ref<FilterData>({
  startTime: '',
  endTime: '',
  labelText: '',
  labelIdList: [],
  customerKeyword: '',
  visitType: '',
});
// 是否有筛选条件
const filterSome = computed(() => {
  if (
    !filterShow.value &&
    (filterVal.value.startTime ||
      filterVal.value.endTime ||
      filterVal.value.labelIdList.length ||
      filterVal.value.customerKeyword ||
      filterVal.value.visitType)
  ) {
    return true;
  }
  return false;
});
// 事件定义
const emit = defineEmits<{
  confirm: [filterVal: FilterData];
}>();

// 确认筛选
const onConfirm = () => {
  filterShow.value = false;
  emit('confirm', filterVal.value);
};
// 重置筛选条件
const reset = () => {
  filterShow.value = false;
  filterVal.value = {
    startTime: props.filterObj.startTime,
    endTime: props.filterObj.endTime,
    labelText: '',
    labelIdList: [],
    customerKeyword: props.filterObj.customerKeyword,
    visitType: '',
  };
  emit('confirm', filterVal.value);
};

const calendarRef = ref();
const maxDate = ref(time.format(time.add(new Date(), 0, 'year'), time.FORMATS.ISO_DATE));
// 日期范围选择
const calendarConfirm = (val: any) => {
  console.log('选择的日期范围:', val);
  filterVal.value.startTime = val.range.before;
  filterVal.value.endTime = val.range.after;
};
const labelTreeShow = ref(false);
const labelTreeConfirm = (val: any) => {
  filterVal.value.labelText = val.labelName;
  filterVal.value.labelIdList = [val.labelId];
  labelTreeShow.value = false;
};
const labelTreeClose = () => {
  labelTreeShow.value = false;
};
onMounted(() => {
  console.log(props.filterObj);
  nextTick(() => {
    filterVal.value.startTime = props.filterObj.startTime;
    filterVal.value.endTime = props.filterObj.endTime;
    filterVal.value.customerKeyword = props.filterObj.customerKeyword;
  });
});
</script>
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
        <app-form-item label="事件分类" class="mt-1">
          <view
            @click="labelTreeShow = true"
            :class="`w-full text-right ${filterVal.labelIdList.length ? '' : 'color-gray-6'}`"
          >
            {{ filterVal.labelText ? filterVal.labelText : '点击选择事件分类' }}
          </view>
        </app-form-item>

        <app-form-item label="客户信息" :borderBottom="false">
          <up-input
            v-model="filterVal.customerKeyword"
            clearable
            placeholder="请输入客户信息"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          >
          </up-input>
        </app-form-item>
        <app-form-item label="拜访类型" :borderBottom="false">
          <up-radio-group
            class="flex flex-row justify-end"
            v-model="filterVal.visitType"
            placement="row"
          >
            <up-radio
              :customStyle="{ marginBottom: '8px' }"
              v-for="(item, index) in [
                { label: '个人', name: '1' },
                { label: '协防', name: '2' },
                { label: '接待', name: '3' },
              ]"
              :key="index"
              :label="item.label"
              :name="item.name"
            >
            </up-radio>
          </up-radio-group>
        </app-form-item>
      </up-form>
    </app-filter-pop>
    <app-calendar ref="calendarRef" :endDate="maxDate" mode="range" @confirm="calendarConfirm" />
    <label-tree-pop
      :label-tree-show="labelTreeShow"
      @labelTreeConfirm="labelTreeConfirm"
      @labelTreeClose="labelTreeClose"
    ></label-tree-pop>
  </view>
</template>
