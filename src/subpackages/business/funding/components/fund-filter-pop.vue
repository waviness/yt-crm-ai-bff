<script setup lang="ts">
import type { FundingFilterData, DepartmentInfo } from '../types';

interface IProps {
  formData: FundingFilterData;
  deptList: DepartmentInfo[];
}

const props = defineProps<IProps>();

// 状态管理
const filterShow = ref(false);
const selectShow = ref(false);
const deptShow = ref(false);

// 日期相关
const maxDate = ref(new Date(new Date().getFullYear(), new Date().getMonth() + 1).getTime());
const currentDate = ref(Date.now());

// 筛选值
const filterVal = ref<FundingFilterData>({
  deptId: '',
  deptName: '',
  year: '',
  month: '',
});

// 组件引用
const datetimePicker = ref<any>(null);
const columns = ref<string[]>([]);

// 日期格式化器
const formatter = (type: string, val: number) => {
  if (type === 'year') {
    return `${val}年`;
  } else if (type === 'month') {
    return `${val}月`;
  }
  return val;
};

// 日期确认处理
const onDateConfirm = () => {
  selectShow.value = false;
  filterVal.value.year = new Date(currentDate.value).getFullYear();
  filterVal.value.month = new Date(currentDate.value).getMonth() + 1;
};

// 是否有筛选条件
const filterSome = computed(() => {
  if (!filterShow.value && (filterVal.value.deptId || filterVal.value.year)) {
    return true;
  }
  return false;
});

// 重置筛选条件
const reset = () => {
  filterVal.value = {
    deptId: '',
    deptName: '',
    year: '',
    month: '',
  };
};

// 事件定义
const emit = defineEmits<{
  confirm: [data: FundingFilterData];
}>();

// 确认筛选
const onConfirm = () => {
  filterShow.value = false;
  emit('confirm', filterVal.value);
};

// 部门确认处理
const onDeptConfirm = ({ value, indexs }: { value: string[]; indexs: number[] }) => {
  if (indexs.length > 0 && props.deptList[indexs[0]]) {
    filterVal.value.deptId = String(props.deptList[indexs[0]].id);
    filterVal.value.deptName = value[0];
  }
  deptShow.value = false;
};

// 初始化部门列表
const initDeptColumns = () => {
  columns.value = props.deptList.map(item => item.deptName);
};

// 设置日期选择器格式化器
const setupDateFormatter = () => {
  nextTick(() => {
    if (datetimePicker.value) {
      datetimePicker.value.setFormatter(formatter);
    }
  });
};

onMounted(() => {
  initDeptColumns();
  setupDateFormatter();
});

// 监听表单数据变化
watch(
  () => props.formData,
  newValue => {
    filterVal.value = { ...newValue };
  },
  { immediate: true }
);

// 监听部门列表变化
watch(
  () => props.deptList,
  () => {
    initDeptColumns();
  },
  { immediate: true }
);
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
        <app-form-item label="月份选择" class="mt-1">
          <view
            :class="`w-full text-right ${filterVal.year ? '' : 'color-gray-6'}`"
            @click="selectShow = true"
          >
            {{ filterVal.year ? `${filterVal.year}年${filterVal.month}月` : '点击选择' }}
          </view>
        </app-form-item>
        <app-form-item label="销售部选择" :borderBottom="false">
          <view
            :class="`w-full text-right ${filterVal.deptName ? '' : 'color-gray-6'}`"
            @click="deptShow = true"
          >
            {{ filterVal.deptName ? filterVal.deptName : '点击选择销售部' }}
          </view>
        </app-form-item>
      </up-form>
    </app-filter-pop>
    <up-datetime-picker
      :show="selectShow"
      v-model="currentDate"
      ref="datetimePicker"
      mode="year-month"
      title="选择年月"
      :max-date="maxDate"
      :formatter="formatter"
      closeOnClickOverlay
      @close="selectShow = false"
      @cancel="selectShow = false"
      @confirm="onDateConfirm"
    />
    <up-picker
      :show="deptShow"
      title="销售部选择"
      show-toolbar
      :columns="[columns]"
      closeOnClickOverlay
      @close="deptShow = false"
      @cancel="deptShow = false"
      @confirm="onDeptConfirm"
    />
  </view>
</template>
