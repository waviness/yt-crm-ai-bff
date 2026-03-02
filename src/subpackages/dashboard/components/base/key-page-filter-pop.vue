<script setup lang="ts">
import type { EntryObj, FilterVal } from '../../types/key-page';

interface Props {
  entryObj: EntryObj;
}

const props = defineProps<Props>();
const showOrderType = ref(false);
// 状态管理
const filterShow = ref(false);
const columnsList = ref();
// 筛选值
let filterVal = ref<FilterVal>({
  keyword: '',
  orderColumn: 'salesAmount',
  orderType: 0,
  orderField: 1,
  orderRule: 2,
  orderTypeText: '销售额倒序',
});

// 是否有筛选条件
const filterSome = computed(() => {
  console.log('filterVal', filterVal.value);
  if (filterVal.value.keyword || filterVal.value.orderTypeText) {
    return true;
  }
  return false;
});

// 重置筛选条件
const reset = () => {
  filterVal.value = {
    keyword: '',
    orderColumn: 'salesAmount',
    orderType: 0,
    orderField: 1,
    orderRule: 2,
    orderTypeText: '销售额倒序',
  };
};

// 事件定义
const emit = defineEmits<{
  confirm: [data: FilterVal];
}>();

// 确认筛选
const oderTypeConfirmWrapper = ({ value }: any) => {
  const valueObj = value[0];
  console.log('valueObj', valueObj.id);
  console.log('valueObj', valueObj.name);
  if (+props.entryObj.key === 1) {
    filterVal.value.orderColumn = valueObj.id.split('-')[0];
    filterVal.value.orderType = valueObj.id.split('-')[1];
  } else {
    filterVal.value.orderField = valueObj.id.split('-')[0];
    filterVal.value.orderRule = valueObj.id.split('-')[1];
  }
  filterVal.value.orderTypeText = valueObj.name;
  showOrderType.value = false;
};
const showOrderClick = () => {
  showOrderType.value = true;
};
const onConfirm = () => {
  emit('confirm', filterVal.value);
};
const labeType = props.entryObj.key === '1' ? '客户' : '品种';
onMounted(() => {
  console.log('entryObj', props.entryObj);
  if (props.entryObj.key === '1') {
    columnsList.value = [
      { name: '销售额正序', id: 'salesAmount-1' },
      { name: '销售额倒序', id: 'salesAmount-0' },
      { name: '同比正序', id: 'periodComparePercent-1' },
      { name: '同比倒序', id: 'periodComparePercent-0' },
    ];
    filterVal = ref({
      keyword: '',
      orderColumn: 'salesAmount',
      orderType: 0,
      orderTypeText: '销售额倒序',
    });
  }
  if (props.entryObj.key === '2') {
    columnsList.value = [
      { name: '销售额正序', id: '1-1' },
      { name: '销售额倒序', id: '1-2' },
      { name: '同比正序', id: '2-1' },
      { name: '同比倒序', id: '2-2' },
    ];
    filterVal = ref({
      keyword: '',
      orderField: 1,
      orderRule: 2,
      orderTypeText: '销售额倒序',
    });
  }
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
        <app-form-item :label="`${labeType}ID/名称`">
          <up-input
            v-model="filterVal.keyword"
            clearable
            :placeholder="`请输入${labeType}ID/名称`"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          >
          </up-input>
        </app-form-item>
        <app-form-item label="排序类型" :borderBottom="false">
          <view
            :class="`w-full text-right ${filterVal.orderTypeText ? '' : 'color-gray-6'}`"
            @click="showOrderClick"
          >
            {{ filterVal.orderTypeText ? filterVal.orderTypeText : '点击选择排序类型' }}
          </view>
        </app-form-item>
      </up-form>
    </app-filter-pop>
    <up-picker
      v-model:show="showOrderType"
      :columns="[columnsList]"
      @confirm="oderTypeConfirmWrapper"
      keyName="name"
      valueName="id"
    ></up-picker>
  </view>
</template>
