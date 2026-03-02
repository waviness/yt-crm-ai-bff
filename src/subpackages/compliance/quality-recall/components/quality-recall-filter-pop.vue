<script setup lang="ts">
import type { QualityRecallFilterData } from '../types';

interface Props {
  formData: QualityRecallFilterData;
  isJustSelf: boolean;
  needQueryAll: boolean;
  needQueryAllEntrys: boolean;
}

interface Emits {
  (e: 'confirm', data: QualityRecallFilterData): void;
  (e: 'reset'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const filterShow = ref(false);

// 筛选值
const filterVal = ref<QualityRecallFilterData>({
  ...props.formData,
});

// 日期相关
const calendarRef = ref();

// 客户选择相关
const customShow = ref(false);
const customSearchValue = ref('');
const customList = ref<any[]>([]);
const customRefreshing = ref(false);
const customLoadmoreConfig = ref({
  status: 'loadmore' as 'loadmore' | 'loading' | 'nomore',
});
const customPageNum = ref(1);
const customPageSize = 20;

// 计算权限类型
const permissionType = computed(() => {
  if (props.isJustSelf) {
    return 1;
  }
  if (props.needQueryAll) {
    return 0;
  } else if (!props.needQueryAll && props.needQueryAllEntrys) {
    return 2;
  }
  return 1;
});

// 获取客户列表
const fetchCustomList = async (isRefresh = false) => {
  if (isRefresh) {
    customPageNum.value = 1;
    customRefreshing.value = true;
  } else {
    customLoadmoreConfig.value.status = 'loading';
  }

  try {
    const response = await QualityService.getCustomList({
      permissionType: permissionType.value,
      keyword: customSearchValue.value,
      pageNum: customPageNum.value,
      pageSize: customPageSize,
    });

    const newList = response.list.map(({ customId, customName }: any) => ({
      customid: customId,
      customname: customName,
    }));

    if (isRefresh) {
      customList.value = newList;
    } else {
      customList.value = [...customList.value, ...newList];
    }

    if (response.hasNextPage) {
      customLoadmoreConfig.value.status = 'loadmore';
      customPageNum.value++;
    } else {
      customLoadmoreConfig.value.status = 'nomore';
    }
  } catch (error) {
    console.error('获取客户列表失败:', error);
    showError('获取客户列表失败');
  } finally {
    customRefreshing.value = false;
  }
};

// 客户搜索
const onCustomSearch = () => {
  fetchCustomList(true);
};

// 客户列表刷新
const onCustomRefresh = () => {
  fetchCustomList(true);
};

// 客户列表加载更多
const onCustomLoadMore = () => {
  if (customLoadmoreConfig.value.status === 'loadmore') {
    fetchCustomList(false);
  }
};

// 选择客户
const onCustomConfirm = (item: any) => {
  filterVal.value.customId = item.customid;
  filterVal.value.customName = item.customname;
  customShow.value = false;
};

// 打开客户弹窗时加载数据
watch(customShow, val => {
  if (val) {
    customSearchValue.value = '';
    fetchCustomList(true);
  }
});

// 日期范围选择
const calendarConfirm = (val: { range: { before: string; after: string } }) => {
  if (!val?.range?.before || !val?.range?.after) return;
  filterVal.value.startTime = val.range.before;
  filterVal.value.endTime = val.range.after;
  filterVal.value.time = `${val.range.before}至${val.range.after}`;
};

// 是否有筛选条件
const filterSome = computed(() => {
  return (
    !!filterVal.value.time ||
    !!filterVal.value.customId ||
    !!filterVal.value.customName ||
    !!filterVal.value.goodsKey
  );
});

// 重置筛选条件
const reset = () => {
  filterVal.value = {
    time: '',
    startTime: '',
    endTime: '',
    customId: '',
    customName: '',
    goodsKey: '',
  };
  filterShow.value = false;
  emit('reset');
};

// 确认筛选
const onConfirm = () => {
  filterShow.value = false;
  emit('confirm', filterVal.value);
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
        <app-form-item label="时间范围" class="mt-1">
          <view
            :class="`w-full text-right ${filterVal.time ? '' : 'color-gray-6'}`"
            @click="calendarRef.open()"
          >
            {{ filterVal.time || '点击选择日期' }}
          </view>
        </app-form-item>
        <app-form-item label="客户信息">
          <view
            :class="`w-full text-right ${filterVal.customId ? '' : 'color-gray-6'}`"
            @click="customShow = true"
          >
            {{
              filterVal.customId
                ? `${filterVal.customId}/${filterVal.customName}`
                : '点击选择客户信息'
            }}
          </view>
        </app-form-item>
        <app-form-item label="药品信息" :borderBottom="false">
          <up-input
            v-model="filterVal.goodsKey"
            clearable
            placeholder="请输入药品关键字"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          >
          </up-input>
        </app-form-item>
      </up-form>
    </app-filter-pop>

    <app-calendar ref="calendarRef" mode="range" @confirm="calendarConfirm" />

    <!-- 客户列表弹窗 -->
    <up-popup v-model:show="customShow" mode="bottom" round="16rpx" closeable>
      <view class="p-4" style="height: 90vh; display: flex; flex-direction: column">
        <view class="text-16 py-2 font-bold text-center">单位信息</view>

        <!-- 搜索框 -->
        <view class="pa-2 bg-white">
          <up-search
            v-model="customSearchValue"
            @search="onCustomSearch"
            @clear="onCustomSearch"
            shape="round"
            placeholder="搜索客户"
          ></up-search>
        </view>

        <!-- 客户列表 -->
        <view style="flex: 1; overflow: hidden">
          <app-pull-refresh
            :refreshing="customRefreshing"
            :loadmoreProps="customLoadmoreConfig"
            pullRefreshHeight="calc(90vh - 120px)"
            @refresh="onCustomRefresh"
            @loadmore="onCustomLoadMore"
          >
            <view v-if="customList.length > 0">
              <up-cell
                v-for="(item, index) in customList"
                :key="item.customid + index"
                :title="`${item.customid} / ${item.customname}`"
                isLink
                border
                @click="onCustomConfirm(item)"
              >
                <template #right-icon>
                  <up-icon name="arrow-right" size="16" class="text-gray-5" />
                </template>
              </up-cell>
            </view>
            <up-empty v-else text="暂无客户数据" mode="list" />
          </app-pull-refresh>
        </view>
      </view>
    </up-popup>
  </view>
</template>
