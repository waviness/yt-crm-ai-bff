<template>
  <view>
    <view class="filter-wrapper pa-2 relative z-100">
      <view
        class="filter-button flex items-center justify-between pa-3 rd-2"
        :class="[
          filterShow ? 'filter-button--active' : '',
          filterActive ? 'filter-button--has-filter' : '',
        ]"
        @click="filterShow = !filterShow"
      >
        <text>条件筛选</text>
        <up-icon :name="filterShow ? 'arrow-up' : 'arrow-down'" size="16"></up-icon>
      </view>
    </view>

    <up-popup
      v-model:show="filterShow"
      mode="top"
      :round="10"
      :zIndex="99"
      customStyle="top: 88rpx"
    >
      <view class="filter-popup">
        <up-form>
          <app-form-item label="时间范围" class="mt-1">
            <view
              :class="`w-full text-right ${dateRange ? '' : 'color-gray-6'}`"
              @click="calendarRef?.open()"
            >
              {{ dateRange || '点击选择时间范围' }}
            </view>
          </app-form-item>

          <app-form-item label="事件分类">
            <view
              :class="`w-full text-right ${remarkName ? '' : 'color-gray-6'}`"
              @click="labelShow = true"
            >
              {{ remarkName || '点击选择事件分类' }}
            </view>
          </app-form-item>

          <app-form-item label="标签/关联">
            <view
              :class="`w-full text-right ${relObj.name ? '' : 'color-gray-6'}`"
              @click="chooseFilter(2)"
            >
              {{ relObj.name || '点击选择' }}
            </view>
          </app-form-item>

          <app-form-item label="拜访类型">
            <up-radio-group
              v-model="taskType"
              placement="row"
              style="justify-content: flex-end; width: 100%"
            >
              <up-radio name="1" label="个人" activeColor="#2271F5" iconSize="28rpx"></up-radio>
              <up-radio name="2" label="协访" activeColor="#2271F5" iconSize="28rpx"></up-radio>
              <up-radio name="3" label="接待" activeColor="#2271F5" iconSize="28rpx"></up-radio>
            </up-radio-group>
          </app-form-item>

          <app-form-item label="客户信息">
            <view
              :class="`w-full text-right ${customerName ? '' : 'color-gray-6'}`"
              @click="objChangeClick"
            >
              {{ customerName || '点击选择客户信息' }}
            </view>
          </app-form-item>

          <app-form-item label="客户职员" :borderBottom="false">
            <view
              :class="`w-full text-right ${visitUserName ? '' : 'color-gray-6'}`"
              @click="staffMemberClick"
            >
              {{ visitUserName || '点击选择客户职员' }}
            </view>
          </app-form-item>
        </up-form>

        <view class="filter-actions flex justify-around pa-4">
          <up-button
            :customStyle="{ width: '280rpx', height: '70rpx' }"
            text="重置"
            shape="circle"
            @click="reset"
          />
          <up-button
            :customStyle="{ width: '280rpx', height: '70rpx' }"
            text="确认"
            type="primary"
            shape="circle"
            @click="onConfirm"
          />
        </view>
      </view>

      <!-- 关联状态选择 -->
      <app-action-sheet
        v-if="actionType === 2"
        :show="actionShow"
        :actions="relOptions"
        cancel-text="取消"
        close-on-click-action
        @select="onSelectRel"
        @update:show="actionShow = $event"
      />

      <!-- 事件分类选择 -->
      <app-action-sheet
        :show="labelShow"
        :actions="props.labelTreeList"
        cancel-text="取消"
        close-on-click-action
        @select="onSelectLabel"
        @update:show="labelShow = $event"
      />

      <!-- 时间选择器 -->
      <app-calendar ref="calendarRef" :endDate="maxDate" mode="range" @confirm="onConfirmDate" />

      <!-- 客户信息弹窗 -->
      <up-popup v-model:show="objShowPicker" mode="bottom" :round="10" closeable>
        <view class="popup-header">客户信息</view>
        <app-tabs
          :list="tabList"
          :current="sourceTypeTab"
          @change="onCustomerTabChange"
          color="#2271F5"
        />
        <up-search
          v-model="objSearchValue"
          placeholder="搜索"
          @search="objSearch"
          @clear="objSearch"
        />
        <view class="popup-content">
          <app-empty v-if="!custLoading && !custlistOptions.length" description="暂无数据" />
          <scroll-view v-else scroll-y class="scroll-view">
            <view
              v-for="(item, index) in custlistOptions"
              :key="index"
              class="list-item"
              @click="changeCust(item)"
            >
              <text>{{ item.szymCustomerId }}/{{ item.customerName }}</text>
            </view>
            <up-loadmore
              v-if="custLoading || custlistOptions.length < custTotal"
              :status="custLoading ? 'loading' : custHasMore ? 'loadmore' : 'nomore'"
            />
          </scroll-view>
        </view>
      </up-popup>

      <!-- 职员信息弹窗 -->
      <up-popup v-model:show="staffMemberShow" mode="bottom" :round="10" closeable>
        <view class="popup-header">职员信息选择</view>
        <up-search v-model="staffMemberValue" placeholder="搜索" />
        <view class="popup-content">
          <up-radio-group v-model="visitUserId">
            <view
              v-for="(item, index) in filteredStaffList"
              :key="index"
              class="list-item"
              @click="staffMemberChange(item)"
            >
              <view>
                <text>{{ item.userName }}</text>
                <text v-if="item.phoneNum" class="ml-2 color-gray-6">{{ item.phoneNum }}</text>
              </view>
              <up-radio :name="item.userId" activeColor="#2271F5" />
            </view>
          </up-radio-group>
          <app-empty v-if="!filteredStaffList.length" description="暂无职员信息" />
        </view>
      </up-popup>
    </up-popup>
  </view>
</template>

<script setup lang="ts">
import type { RelOption } from '../types';
import dayjs from 'dayjs';

interface Props {
  labelTreeList: any[];
  filterActive: boolean;
}

interface Emits {
  (e: 'confirm', data: any): void;
}

const props = withDefaults(defineProps<Props>(), {
  labelTreeList: () => [],
  filterActive: false,
});

const emit = defineEmits<Emits>();

// 筛选弹窗状态
const filterShow = ref(false);
const actionShow = ref(false);
const actionType = ref(0);
const labelShow = ref(false);
const calendarRef = ref<any>(null);
const objShowPicker = ref(false);
const staffMemberShow = ref(false);

// 筛选值
const taskType = ref('');
const startTime = ref('');
const endTime = ref('');
const dateRange = ref('');
const remarkId = ref('');
const remarkName = ref('');
const customerName = ref('');
const customerId = ref('');
const visitUserId = ref('');
const visitUserName = ref('');
const staffMemberValue = ref('');
const relObj = ref<{ name: string; value: string }>({ name: '', value: '' });

// 客户列表相关
const sourceTypeTab = ref(0);
const objSearchValue = ref('');
const custlistOptions = ref<any[]>([]);
const custLoading = ref(false);
const custPage = ref(1);
const custTotal = ref(0);
const custHasMore = ref(true);

// 职员列表
const userListOptions = ref<any[]>([]);

// 关联选项
const relOptions: RelOption[] = [
  { name: '拓展客户-已关联', value: '0-1' },
  { name: '拓展客户-暂未关联', value: '0-0' },
  { name: '业务系统内客户', value: '1' },
];

// 日期范围
const minDate = ref(dayjs('2020-01-01').format('YYYY-MM-DD'));
const maxDate = ref(dayjs().format('YYYY-MM-DD'));

// 计算属性：过滤后的职员列表
const filteredStaffList = computed(() => {
  if (!staffMemberValue.value) return userListOptions.value;
  return userListOptions.value.filter(
    item =>
      item.userName?.includes(staffMemberValue.value) ||
      item.userId?.includes(staffMemberValue.value)
  );
});

// 打开选择器
const chooseFilter = (type: number) => {
  actionShow.value = true;
  actionType.value = type;
};

// 选择关联状态
const onSelectRel = (option: RelOption) => {
  relObj.value = option;
  actionShow.value = false;
};

// 选择事件分类
const onSelectLabel = (option: any) => {
  remarkId.value = option.value;
  remarkName.value = option.name;
  labelShow.value = false;
};

// 确认日期选择
const onConfirmDate = (val: any) => {
  startTime.value = val.range.before;
  endTime.value = val.range.after;
  dateRange.value = `${startTime.value} 至 ${endTime.value}`;
};

// 获取客户列表
const fetchCustomerList = async () => {
  if (custLoading.value) return;
  custLoading.value = true;

  try {
    const params = {
      selectType: 0,
      userIdList: [],
      sourceType: sourceTypeTab.value,
      customerType: '',
      relStatus: '',
      keyword: objSearchValue.value,
      pageSize: 10,
      pageNum: custPage.value,
      dataBelongEntry: 41,
    };

    const res = await SzymCustomerService.getSzymCustomerMng(params);
    if (res.code === '200') {
      if (custPage.value === 1) {
        custlistOptions.value = res.data.list || [];
      } else {
        custlistOptions.value = [...custlistOptions.value, ...(res.data.list || [])];
      }
      custTotal.value = res.data.total || 0;
      custHasMore.value = res.data.hasNextPage || false;
    }
  } finally {
    custLoading.value = false;
  }
};

// 标签页列表
const tabList = [{ name: '拓展客户' }, { name: '系统内客户' }];

// 客户标签页切换
const onCustomerTabChange = ({ index }: { index: number }) => {
  sourceTypeTab.value = index;
  custPage.value = 1;
  custlistOptions.value = [];
  fetchCustomerList();
};

// 客户搜索
const objSearch = () => {
  custPage.value = 1;
  custlistOptions.value = [];
  fetchCustomerList();
};

// 打开客户选择
const objChangeClick = () => {
  objShowPicker.value = true;
  custPage.value = 1;
  custlistOptions.value = [];
  objSearchValue.value = '';
  fetchCustomerList();
};

// 选择客户
const changeCust = (item: any) => {
  objShowPicker.value = false;
  customerId.value = item.szymCustomerId;
  customerName.value = item.customerName;
  userListOptions.value = [];
  visitUserId.value = '';
  visitUserName.value = '';
  // 获取职员列表
  fetchStaffList(item.szymCustomerId, item.customerStaffNum);
};

// 获取职员列表
const fetchStaffList = async (szymCustomerId: string, pageSize: number) => {
  try {
    const res = await SzymCustomerService.getSzymCustomerStaff({
      szymCustomerId,
      pageNum: 1,
      pageSize,
      dataBelongEntry: 41,
    });
    if (res.code === '200') {
      userListOptions.value = res.data.list || [];
    }
  } catch (error) {
    console.error('获取职员列表失败', error);
  }
};

// 打开职员选择
const staffMemberClick = () => {
  if (!customerId.value) {
    uni.showToast({ title: '请先选择客户信息', icon: 'none' });
    return;
  }
  staffMemberShow.value = true;
};

// 选择职员
const staffMemberChange = (item: any) => {
  visitUserId.value = item.userId;
  visitUserName.value = item.userName;
  staffMemberShow.value = false;
};

// 重置筛选条件
const reset = () => {
  startTime.value = '';
  endTime.value = '';
  dateRange.value = '';
  customerId.value = '';
  customerName.value = '';
  visitUserId.value = '';
  visitUserName.value = '';
  remarkId.value = '';
  remarkName.value = '';
  taskType.value = '';
  relObj.value = { name: '', value: '' };

  const filterObj = {
    startTime: '',
    endTime: '',
    szymCustomerId: '',
    visitUserId: '',
    remarkId: '',
    taskType: '',
    sourceType: '',
    relStatus: '',
  };
  emit('confirm', filterObj);
};

// 确认筛选
const onConfirm = () => {
  const [sourceType, relStatus] = relObj.value.value ? relObj.value.value.split('-') : ['', ''];
  const filterObj = {
    startTime: startTime.value,
    endTime: endTime.value,
    szymCustomerId: customerId.value,
    visitUserId: visitUserId.value,
    remarkId: remarkId.value,
    taskType: taskType.value,
    sourceType: sourceType || '',
    relStatus: relStatus || '',
  };
  filterShow.value = false;
  emit('confirm', filterObj);
};
</script>

<style lang="scss" scoped>
.filter-wrapper {
  background: #f5f6f9;
}

.filter-button {
  background: #fff;
  font-size: 28rpx;
  transition: all 0.3s;

  &--active {
    color: #2271f5;
  }

  &--has-filter {
    background: #2271f5;
    color: #fff;
  }
}

.filter-popup {
  padding: 20rpx 0;
}

.filter-actions {
  padding: 32rpx;
}

.popup-header {
  text-align: center;
  font-size: 32rpx;
  font-weight: 500;
  padding: 32rpx 0;
}

.popup-content {
  height: 800rpx;
  padding: 20rpx;
}

.scroll-view {
  height: 100%;
}

.list-item {
  padding: 24rpx;
  border-bottom: 1px solid #ebedf0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.color-gray-6 {
  color: #999;
}
</style>
