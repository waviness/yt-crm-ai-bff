<script setup lang="ts">
interface Props {
  formData: {
    goodsKeyword: string;
    customerKeyword: string;
    entryKeyword: string;
    userNames: string;
  };
}

interface Emits {
  (e: 'confirm', data: Props['formData'], userIdLists?: string[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 筛选弹窗显示状态
const filterShow = ref(false);

// 筛选值
const filterVal = ref({
  ...props.formData,
});

// 人员选择
const userIdLists = ref<string[]>([]);
const userShow = ref(false);

const handleTreeConfirm = (data: { list: any[]; name: string }) => {
  userIdLists.value = data.list;
  filterVal.value.userNames = data.name;
  userShow.value = false;
};

const handleCancelUser = () => {
  userIdLists.value = [];
  filterVal.value.userNames = '';
  userShow.value = false;
};

// 定义类型安全的值检查函数
const isFilled = (value: string | undefined | null): value is string => {
  return value !== undefined && value !== null && value !== '';
};

// 是否有筛选条件
const filterSome = computed(() => {
  return Object.values(filterVal.value).some(isFilled);
});

// 重置筛选条件
const reset = () => {
  filterVal.value = {
    goodsKeyword: '',
    customerKeyword: '',
    entryKeyword: '',
    userNames: '',
  };
  userIdLists.value = [];
  filterShow.value = false;
  emit('confirm', filterVal.value);
};

// 确认筛选
const onConfirm = () => {
  filterShow.value = false;
  emit('confirm', filterVal.value, userIdLists.value);
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
      <up-form>
        <app-form-item label="货品ID｜名称">
          <up-input
            v-model="filterVal.goodsKeyword"
            placeholder="请输入货品ID｜名称"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
            clearable
          />
        </app-form-item>
        <app-form-item label="客户ID｜名称">
          <up-input
            v-model="filterVal.customerKeyword"
            placeholder="请输入客户ID｜名称"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
            clearable
          />
        </app-form-item>
        <app-form-item label="核算单元">
          <up-input
            v-model="filterVal.entryKeyword"
            placeholder="点击输入核算单元ID｜名称"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
            clearable
          />
        </app-form-item>
        <app-form-item label="人员选择" :borderBottom="false">
          <view
            :class="`w-full text-right text-14 ${filterVal.userNames ? 'color-black-2' : 'color-gray-6'}`"
            @click="userShow = true"
          >
            {{ filterVal.userNames || '请选择人员' }}
          </view>
        </app-form-item>
      </up-form>
    </app-filter-pop>

    <!-- 人员选择 -->
    <biz-dept-user
      v-model:show="userShow"
      :isSelect="true"
      :needName="true"
      @confirm="handleTreeConfirm"
      @cancel="handleCancelUser"
    />
  </view>
</template>
