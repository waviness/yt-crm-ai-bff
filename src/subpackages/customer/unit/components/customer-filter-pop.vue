<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDepartmentStore } from '@/store/department';

interface IProps {
  hosTypeList?: any[];
  saleTypeList?: any[];
  learnTypeList?: any[];
  roleTypeList?: any[];
  isProfitList?: any[];
  filterActive?: boolean;
  hasDept?: boolean;
  value?: number; // 1: 本人, 2: 已选人员
  checkedUsers?: any[];
  changeTypeShow?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  hosTypeList: () => [],
  saleTypeList: () => [],
  learnTypeList: () => [],
  roleTypeList: () => [],
  isProfitList: () => [],
  filterActive: false,
  hasDept: false,
  value: 1,
  checkedUsers: () => [],
  changeTypeShow: false,
});

const emit = defineEmits<{
  confirm: [
    filterObj: {
      custom: string;
      hospitalLevel: string;
      yearSalesVolume: string;
      scienceLine: string;
      isProfit: string;
    },
  ];
  'update:changeTypeShow': [show: boolean];
  'update:value': [value: number];
  'update:checkedUsers': [users: any[]];
  treeConfirm: [list: any[]];
}>();

const departmentStore = useDepartmentStore();
const hasDept = computed(() => props.hasDept || departmentStore.hasDept);
const changeTypeShow = computed({
  get: () => props.changeTypeShow,
  set: val => emit('update:changeTypeShow', val),
});
const checkedUsers = computed({
  get: () => props.checkedUsers,
  set: val => emit('update:checkedUsers', val),
});

const filterShow = ref(false);
const actionShow = ref(false);
const actionType = ref(0);
const hosType = ref<any>({});
const saleType = ref<any>({});
const learnType = ref<any>({});
const isProfit = ref<any>({});
const keywords = ref('');

// 判断是否有筛选条件
const filterSome = computed(() => {
  return !!(
    keywords.value ||
    hosType.value?.value ||
    saleType.value?.value ||
    learnType.value?.value ||
    isProfit.value?.value
  );
});

const chooseFilter = (type: number) => {
  actionShow.value = true;
  actionType.value = type;
};

const onSelectHosType = (action: any) => {
  hosType.value = action;
  actionShow.value = false;
};

const onSelectSaleType = (action: any) => {
  saleType.value = action;
  actionShow.value = false;
};

const onSelectLearnType = (action: any) => {
  learnType.value = action;
  actionShow.value = false;
};

const onSelectProfit = (action: any) => {
  isProfit.value = action;
  actionShow.value = false;
};

const reset = () => {
  hosType.value = {};
  saleType.value = {};
  learnType.value = {};
  isProfit.value = {};
  keywords.value = '';
};

const onConfirm = () => {
  const filterObj = {
    custom: keywords.value,
    hospitalLevel: hosType.value?.value || '',
    yearSalesVolume: saleType.value?.value || '',
    scienceLine: learnType.value?.value || '',
    isProfit: isProfit.value?.value || '',
  };
  filterShow.value = false;
  emit('confirm', filterObj);
};

const onTreeConfirm = (list: any[]) => {
  changeTypeShow.value = false;
  emit('update:value', 2);
  emit('update:checkedUsers', list);
  emit('treeConfirm', list);
};
</script>

<template>
  <view class="flex p-10 bg-light-gray z-[9999] relative">
    <view class="bg-white flex rounded-20rpx flex-1">
      <view
        :class="[
          'h-80 line-height-10 text-14 rounded-20rpx flex items-center justify-between px-10 flex-1',
          filterShow ? 'color-main' : '',
          props.filterActive || filterSome ? 'bg-main color-white' : '',
        ]"
        @click="filterShow = !filterShow"
      >
        <view>条件筛选</view>
        <up-icon
          :name="`arrow-${filterShow ? 'up' : 'down'}`"
          :color="filterShow ? 'main' : ''"
          size="32rpx"
        />
      </view>
    </view>
    <view
      v-if="hasDept"
      :class="[
        'ml-2 flex justify-around items-center rounded-20rpx h-80 text-14px',
        changeTypeShow ? 'color-main' : '',
        props.value === 2 ? 'bg-main color-white' : 'bg-white',
      ]"
      style="width: 103px"
      @click="changeTypeShow = !changeTypeShow"
    >
      <text>{{
        props.value === 1
          ? '本人'
          : `已选${props.checkedUsers.length > 99 ? '99+' : props.checkedUsers.length}人`
      }}</text>
      <up-icon
        :name="changeTypeShow ? 'arrow-up' : 'arrow-down'"
        size="32rpx"
        :color="props.value === 2 ? 'white' : ''"
      />
    </view>
  </view>
  <up-popup
    :show="filterShow"
    :zIndex="999"
    mode="top"
    round="16"
    customStyle="top: 116rpx"
    @close="filterShow = false"
  >
    <up-form>
      <app-form-item label="客户名称">
        <up-input
          v-model="keywords"
          clearable
          placeholder="请输入客户名称|客户ID"
          input-align="right"
          fontSize="28rpx"
          border="none"
        />
      </app-form-item>
      <app-form-item label="医院等级">
        <view
          :class="`w-full text-right ${hosType.name ? '' : 'color-gray-6'}`"
          @click="chooseFilter(1)"
        >
          {{ hosType.name || '点击选择' }}
        </view>
      </app-form-item>
      <app-form-item label="销售规模">
        <view
          :class="`w-full text-right ${saleType.name ? '' : 'color-gray-6'}`"
          @click="chooseFilter(2)"
        >
          {{ saleType.name || '点击选择' }}
        </view>
      </app-form-item>
      <app-form-item label="学术专线">
        <view
          :class="`w-full text-right ${learnType.name ? '' : 'color-gray-6'}`"
          @click="chooseFilter(3)"
        >
          {{ learnType.name || '点击选择' }}
        </view>
      </app-form-item>
      <app-form-item label="经营性质" :borderBottom="false">
        <view
          :class="`w-full text-right ${isProfit.name ? '' : 'color-gray-6'}`"
          @click="chooseFilter(4)"
        >
          {{ isProfit.name || '点击选择' }}
        </view>
      </app-form-item>
    </up-form>
    <view class="h-160 flex items-center justify-space-evenly px-4">
      <up-button shape="circle" @click="reset">重置</up-button>
      <up-button class="ml-4" shape="circle" type="primary" @click="onConfirm">确认</up-button>
    </view>
    <app-action-sheet
      v-if="actionType === 1"
      :show="actionShow"
      :actions="hosTypeList"
      cancel-text="取消"
      close-on-click-action
      @select="onSelectHosType"
      @update:show="actionShow = $event"
    />
    <app-action-sheet
      v-if="actionType === 2"
      :show="actionShow"
      :actions="saleTypeList"
      cancel-text="取消"
      close-on-click-action
      @select="onSelectSaleType"
      @update:show="actionShow = $event"
    />
    <app-action-sheet
      v-if="actionType === 3"
      :show="actionShow"
      :actions="learnTypeList"
      cancel-text="取消"
      close-on-click-action
      @select="onSelectLearnType"
      @update:show="actionShow = $event"
    />
    <app-action-sheet
      v-if="actionType === 4"
      :show="actionShow"
      :actions="isProfitList"
      cancel-text="取消"
      close-on-click-action
      @select="onSelectProfit"
      @update:show="actionShow = $event"
    />
  </up-popup>
  <!-- 部门用户选择 -->
  <biz-dept-user
    v-model:show="changeTypeShow"
    :checkedUsers="checkedUsers"
    @confirm="onTreeConfirm"
    @update:checkedUsers="checkedUsers = $event"
  />
</template>
