<script setup lang="ts">
import type { OrderListFilterData, EntryInfo, StatusOption, ContactInfo } from '../types';
import type { OptionItem } from '@/types/common';
import { usePagination } from '@/composables/use-pagination';

interface IProps {
  /**
   * 控制筛选弹窗显示/隐藏
   */
  filterShow: boolean;
  /**
   * 筛选数据对象
   */
  filterValue: OrderListFilterData;
  /**
   * 客户ID（用于获取分支机构）
   */
  customerId?: string | number;
}

const props = withDefaults(defineProps<IProps>(), {
  filterShow: false,
  filterValue: () => ({
    goodsId: '',
    goodsName: '',
    time: '',
    conType: null,
    userNames: '',
    entryId: '',
    entryName: '',
    subArriveType: '',
    subArriveName: '',
    contactIdList: [],
    contactString: '',
    entryKeyword: '',
  }),
  customerId: '',
});

const emit = defineEmits<{
  /**
   * 更新筛选弹窗显示状态
   */
  'update:filterShow': [value: boolean];
  /**
   * 确认筛选
   */
  confirm: [filterData: OrderListFilterData, userIdLists?: string[]];
  /**
   * 重置筛选
   */
  reset: [];
  /**
   * 关闭弹窗（用于恢复原始值）
   */
  close: [];
}>();

/**
 * 内部筛选数据（用于临时编辑）
 */
const localFilterValue = ref<OrderListFilterData>({ ...props.filterValue });

/**
 * 监听外部 filterValue 变化，同步到内部状态
 */
watch(
  () => props.filterValue,
  newVal => {
    localFilterValue.value = { ...newVal };
  },
  { deep: true }
);

/**
 * 是否通过确认关闭
 */
const isConfirmClose = ref(false);

/**
 * 监听 filterShow 变化，重置内部状态
 */
watch(
  () => props.filterShow,
  (newVal, oldVal) => {
    if (newVal) {
      // 弹窗打开时，同步外部数据到内部
      localFilterValue.value = { ...props.filterValue };
      isConfirmClose.value = false;
    } else if (oldVal && !isConfirmClose.value) {
      // 弹窗关闭时，如果不是通过确认关闭的，触发 close 事件让父组件恢复原始值
      emit('close');
    }
  }
);

/**
 * 处理确认筛选
 */
const handleConfirm = () => {
  isConfirmClose.value = true;
  emit('update:filterShow', false);
  emit('confirm', { ...localFilterValue.value }, userIdLists.value);
};

/**
 * 判断是否有筛选条件
 * 参考 impulse-filter-pop.vue 的逻辑
 * 只有当弹窗关闭时，才判断是否有筛选条件（基于已确认的 filterValue）
 * 弹窗打开时返回 false，避免编辑过程中的状态闪烁
 */
const hasFilter = computed(() => {
  if (
    !props.filterShow &&
    (props.filterValue.goodsId ||
      props.filterValue.goodsName ||
      props.filterValue.conType ||
      props.filterValue.userNames ||
      props.filterValue.entryId ||
      props.filterValue.subArriveType ||
      (props.filterValue.contactIdList && props.filterValue.contactIdList.length > 0))
  ) {
    return true;
  }
  return false;
});

/**
 * 处理重置筛选
 */
const handleReset = () => {
  localFilterValue.value = {
    goodsId: '',
    goodsName: '',
    time: '',
    conType: null,
    userNames: '',
    entryId: '',
    entryName: '',
    subArriveType: '',
    subArriveName: '',
    contactIdList: [],
    contactString: '',
    entryKeyword: '',
  };
  userIdLists.value = [];
  contactIdList.value = [];
  emit('reset');
};

// ========== 子弹窗相关逻辑 ==========

// 锁控类型
const conList = ref<string[]>([
  '缺货',
  '区域限销',
  '价格限销',
  '下限锁',
  '两票制提醒',
  '紧俏药品',
  '禁限销',
  '库存状态',
  '近效期',
]);
const showCont = ref(false);

const onPickConfirm = (e: { value: string[] }) => {
  localFilterValue.value.conType = e.value[0];
  showCont.value = false;
};

// 人员选择
const userIdLists = ref<string[]>([]);
const userShow = ref(false);

const handleTreeConfirm = (data: { list: any[]; name: string }) => {
  userIdLists.value = data.list;
  localFilterValue.value.userNames = data.name;
  userShow.value = false;
};

const handleCancelUser = () => {
  userIdLists.value = [];
  localFilterValue.value.userNames = '';
  userShow.value = false;
};

// 核算单元
const entryList = ref<EntryInfo[]>([]);
const entryShow = ref(false);

const fetchEntryList = async () => {
  const response = await CommonService.queryEntryid();
  entryList.value = response || [];
};

// 核算单元选项（转换为 OptionItem 格式）
const entryActions = computed<OptionItem[]>(() => {
  return entryList.value.map((item, index) => ({
    id: index,
    name: `${item.entryid}/${item.entryname}`,
  }));
});

const entryChangeClick = (action: OptionItem) => {
  const item = entryList.value[action.id];
  if (item) {
    localFilterValue.value.entryId = item.entryid;
    localFilterValue.value.entryName = item.entryname;
  }
};

// 分支机构
const contactIdList = ref<string[]>([]);
const contactShow = ref(false);
const searchValueContact = ref('');

const fetchContactList = async (params: { pageNum: number; pageSize: number }) => {
  if (!props.customerId) {
    return { list: [], hasNextPage: false, total: 0 };
  }
  const response = await OrderManageService.getConcatByCstmId({
    keyword: searchValueContact.value,
    customerId: props.customerId,
    pageNum: params.pageNum,
    pageSize: params.pageSize,
  });

  return {
    list: response.list || [],
    hasNextPage: response.hasNextPage || false,
    total: response.total || 0,
  };
};

// 使用 usePagination 管理分支机构分页
const {
  list: contactDataList,
  refreshing: contactRefreshing,
  loadmoreConfig: contactLoadmoreConfig,
  pullRefreshHeight: contactPullRefreshHeight,
  onRefresh: contactOnRefresh,
  onLoadMore: contactOnLoadMore,
  calcPullRefreshHeight: contactCalcPullRefreshHeight,
} = usePagination<ContactInfo>(
  {
    pageSize: 10,
    initialPage: 1,
    toolBarHeight: 256, // 搜索框 + 底部按钮的高度
  },
  fetchContactList
);

// 监听搜索关键词变化，触发刷新
watch(searchValueContact, () => {
  if (contactShow.value) {
    contactOnRefresh();
  }
});

// 监听弹窗显示，初始化数据
watch(contactShow, newVal => {
  if (newVal) {
    contactCalcPullRefreshHeight();
    contactOnRefresh();
  }
});

const contactSureClick = () => {
  localFilterValue.value.contactIdList = deepClone(contactIdList.value);
  localFilterValue.value.contactString = `已选择${contactIdList.value.length}个分支机构`;
  contactShow.value = false;
};

// 订阅状态
const statusList = ref<StatusOption[]>([
  { label: '未订阅到货品种', value: '0' },
  { label: '未订阅到票品种', value: '1' },
  { label: '已订阅到货品种', value: '2' },
  { label: '已订阅到票品种', value: '3' },
]);
const statusShow = ref(false);

// 订阅状态选项（转换为 OptionItem 格式）
const statusActions = computed<OptionItem[]>(() => {
  return statusList.value.map((item, index) => ({
    id: index,
    name: item.label,
  }));
});

const statusChangeClick = (action: OptionItem) => {
  const item = statusList.value[action.id];
  if (item) {
    localFilterValue.value.subArriveName = item.label;
    localFilterValue.value.subArriveType = item.value;
  }
};

// 初始化核算单元列表
onMounted(() => {
  fetchEntryList();
});
</script>

<template>
  <app-filter-pop
    :filterShow="filterShow"
    :filterSome="hasFilter"
    @update:filterShow="emit('update:filterShow', $event)"
    @confirm="handleConfirm"
    @reset="handleReset"
  >
    <up-form>
      <app-form-item label="货品ID">
        <up-input
          v-model="localFilterValue.goodsId"
          placeholder="请输入货品ID"
          input-align="right"
          fontSize="14"
          border="none"
          clearable
        />
      </app-form-item>
      <app-form-item label="货品名称">
        <up-input
          v-model="localFilterValue.goodsName"
          placeholder="请输入货品名称"
          input-align="right"
          fontSize="14"
          border="none"
          clearable
        />
      </app-form-item>
      <app-form-item label="锁控类型">
        <view
          :class="`w-full text-right text-14 ${localFilterValue.conType ? 'color-black-2' : 'color-gray-6'}`"
          @click="showCont = true"
        >
          {{ localFilterValue.conType || '请选择锁控类型' }}
        </view>
      </app-form-item>
      <app-form-item label="人员选择">
        <view
          :class="`w-full text-right text-14 ${localFilterValue.userNames ? 'color-black-2' : 'color-gray-6'}`"
          @click="userShow = true"
        >
          {{ localFilterValue.userNames || '请选择人员' }}
        </view>
      </app-form-item>
      <app-form-item label="核算单元">
        <view
          :class="`w-full text-right text-14 ${localFilterValue.entryName ? 'color-black-2' : 'color-gray-6'}`"
          @click="entryShow = true"
        >
          {{ localFilterValue.entryName || '请选择核算单元' }}
        </view>
      </app-form-item>
      <app-form-item label="分支机构">
        <view
          :class="`w-full text-right text-14 ${localFilterValue.contactString ? 'color-black-2' : 'color-gray-6'}`"
          @click="contactShow = true"
        >
          {{ localFilterValue.contactString || '请选择分支机构' }}
        </view>
      </app-form-item>
      <app-form-item label="订阅状态" :borderBottom="false">
        <view
          :class="`w-full text-right text-14 ${localFilterValue.subArriveName ? 'color-black-2' : 'color-gray-6'}`"
          @click="statusShow = true"
        >
          {{ localFilterValue.subArriveName || '请选择订阅状态' }}
        </view>
      </app-form-item>
    </up-form>
  </app-filter-pop>

  <!-- 锁控类型选择器 -->
  <up-picker
    :show="showCont"
    show-toolbar
    title="锁控类型选择"
    :columns="[conList]"
    @confirm="onPickConfirm"
    @cancel="showCont = false"
    @close="showCont = false"
  />

  <!-- 人员选择 -->
  <biz-dept-user
    v-model:show="userShow"
    :isSelect="true"
    :needName="true"
    @confirm="handleTreeConfirm"
    @cancel="handleCancelUser"
  />

  <!-- 核算单元选择 -->
  <app-action-sheet
    v-model:show="entryShow"
    :actions="entryActions"
    description="核算单元选择"
    @select="entryChangeClick"
  />

  <!-- 分支机构选择 -->
  <up-popup :show="contactShow" :round="16" mode="bottom">
    <view class="h-85vh">
      <app-search v-if="contactShow" v-model="searchValueContact" />
      <app-pull-refresh
        v-if="contactShow"
        :refreshing="contactRefreshing"
        :loadmoreProps="contactLoadmoreConfig"
        :pullRefreshHeight="contactPullRefreshHeight"
        @refresh="contactOnRefresh"
        @loadmore="contactOnLoadMore"
      >
        <view>
          <app-empty
            v-if="contactDataList.length === 0 && contactLoadmoreConfig.status !== 'loading'"
            description="暂无数据"
          />
          <up-checkbox-group
            v-model="contactIdList"
            placement="column"
            iconPlacement="right"
            shape="circle"
          >
            <up-checkbox
              v-for="item in contactDataList"
              :key="item.contactId"
              :name="item.contactId"
              :label="`${item.contactId}/${item.contactName}`"
              class="py-3 px-4"
            />
          </up-checkbox-group>
        </view>
      </app-pull-refresh>
      <app-bottom-actions class="m-4" :fixed="false">
        <app-action-btn class="flex-1" text="取消" @click="contactShow = false" />
        <app-action-btn class="flex-1" type="primary" text="确定" @click="contactSureClick" />
      </app-bottom-actions>
    </view>
  </up-popup>

  <!-- 订阅状态选择 -->
  <app-action-sheet
    v-model:show="statusShow"
    :actions="statusActions"
    description="订阅状态选择"
    @select="statusChangeClick"
  />
</template>
