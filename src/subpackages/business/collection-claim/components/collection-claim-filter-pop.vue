<script setup lang="ts">
import type { CollectionClaimFilterData } from '../types';
interface Props {
  formData: CollectionClaimFilterData;
  outerUsestatusString: string;
}

interface Emits {
  (e: 'confirm', data: CollectionClaimFilterData): void;
}
const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const advancePayOptions = [
  {
    label: '是',
    value: '1',
  },
  {
    label: '否',
    value: '0',
  },
];
// 筛选弹窗显示状态
const filterShow = ref(false);

// 筛选值
const filterVal = ref<CollectionClaimFilterData>({
  ...props.formData,
});

// 定义类型安全的值检查函数
const isFilled = (value: string | undefined | null | string[]): value is string => {
  return (
    value !== undefined &&
    value !== null &&
    value !== '' &&
    (Array.isArray(value) ? value.length > 0 : true)
  );
};

// 是否有筛选条件
const filterSome = computed(() => {
  return Object.values(filterVal.value).some(isFilled);
});

// 重置筛选条件
const reset = () => {
  filterVal.value = {
    ...props.formData,
  };
  usestatusString = props.outerUsestatusString;
  filterShow.value = false;
  emit('confirm', filterVal.value);
};
let usestatusString: string = '';
// 确认筛选
const onConfirm = () => {
  filterShow.value = false;
  emit('confirm', filterVal.value);
};
const statusShow = ref(false);
const statusOptions = [
  { label: '临时', value: '0' },
  { label: '未认领', value: '1' },
  { label: '部分认领', value: '2' },
  { label: '认领完成', value: '3' },
  { label: '手工认领', value: '4' },
];
const statusClick = () => {
  console.log('statusClick');
  statusShow.value = true;
};
const handleStatusClose = () => {
  statusShow.value = false;
};
const handleStatusOk = () => {
  statusShow.value = false;
  getFilterString();
};

const getFilterString = () => {
  if (filterVal.value.usestatusList.length > 2) {
    usestatusString =
      statusOptions[parseInt(filterVal.value.usestatusList[0])].label +
      ',' +
      statusOptions[parseInt(filterVal.value.usestatusList[1])].label +
      '等';
  } else if (filterVal.value.usestatusList.length == 0) {
    usestatusString = '';
  } else {
    usestatusString =
      statusOptions[parseInt(filterVal.value.usestatusList[0])].label +
      (filterVal.value.usestatusList[1]
        ? ',' + statusOptions[parseInt(filterVal.value.usestatusList[1])].label
        : '');
  }
};
const getClass = (data: string) => {
  if (filterVal.value.usestatusList.indexOf(data) > -1) {
    return true;
  } else {
    return false;
  }
};
const chooseStatus = (value: any) => {
  if (!value) {
    if (filterVal.value.usestatusList.length == statusOptions.length) {
      filterVal.value.usestatusList = [];
    } else {
      filterVal.value.usestatusList = [];
      statusOptions.forEach((element: any) => {
        filterVal.value.usestatusList.push(element.value);
      });
    }
    return;
  }
  if (filterVal.value.usestatusList.indexOf(value) > -1) {
    filterVal.value.usestatusList.splice(filterVal.value.usestatusList.indexOf(value), 1);
  } else {
    filterVal.value.usestatusList.push(value);
  }
};
onMounted(() => {
  usestatusString = props.outerUsestatusString;
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
        <app-form-item label="认领总单">
          <up-input
            v-model="filterVal.accdocid"
            clearable
            placeholder="请输入认领总单ID"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          >
          </up-input>
        </app-form-item>
        <app-form-item label="客户ID|名称">
          <up-input
            v-model="filterVal.custom"
            clearable
            placeholder="请输入客户ID|名称"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          >
          </up-input>
        </app-form-item>
        <app-form-item label="核算单元">
          <up-input
            v-model="filterVal.entry"
            clearable
            placeholder="请输入核算单元"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          >
          </up-input>
        </app-form-item>
        <app-form-item label="对方户名">
          <up-input
            v-model="filterVal.ordercustomname"
            clearable
            placeholder="请输入对方户名"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          >
          </up-input>
        </app-form-item>
        <app-form-item label="使用状态">
          <view
            :class="`w-full text-right ${usestatusString ? '' : 'color-gray-6'}`"
            @click="statusClick"
          >
            {{ usestatusString ? usestatusString : '请选择使用状态' }}
          </view>
          <!-- <up-input
            v-model="usestatusString"
            clearable
            readonly
            @click.native="statusClick"
            placeholder="请选择使用状态"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          >
          </up-input> -->
        </app-form-item>
        <app-form-item label="挂预付款">
          <up-radio-group
            class="flex flex-row justify-end"
            v-model="filterVal.advancePayFlag"
            direction="row"
          >
            <up-radio
              v-for="item in advancePayOptions"
              :key="item.value"
              :name="item.value"
              :label="item.label"
            />
          </up-radio-group>
        </app-form-item>
      </up-form>
    </app-filter-pop>
    <up-popup
      :zIndex="999"
      :show.async="statusShow"
      mode="bottom"
      minHeight="600rpx"
      :round="30"
      @close="statusShow = false"
    >
      <view class="flex align-center justify-between py-4 px-4 text-16">
        <view class="text-12" @click="handleStatusClose">取消</view>
        <view class="font-bold">使用状态</view>
        <view class="text-12" @click="handleStatusOk">确认</view>
      </view>
      <view
        @click="chooseStatus(item.value)"
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
<style scoped lang="scss">
.active {
  color: #2271f5;
  background: rgba(#2271f5, 0.1);
}
</style>
