<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/store/user';
import { useDepartmentStore } from '@/store/department';
import { useScheduleIndex } from './composables/use-schedule-index';
import AddSchedule from './components/add-schedule.vue';
import time from '@/utils/time';

defineOptions(SHARED_STYLE_OPTIONS);

const userStore = useUserStore();
const departmentStore = useDepartmentStore();

// 部门用户相关状态
const hasDept = ref(false);
const userId = ref('');
const userName = ref('我的日程');
const changeTypeShow = ref(false);

// Refs
const calendarRef = ref();
const addScheduleRef = ref();

// 使用 composable
const {
  nowClickDay,
  dateTitle,
  isToday,
  nowdateList,
  nowDetail,
  nowDetailList,
  dateRange,
  weeekList,
  statusMap,
  initDay,
  chooseDay,
  getColor,
  getDayClass,
  getScheduleOfDateList,
} = useScheduleIndex(userId);

// 状态映射
const statusMap_display = {
  '0': '在岗办公',
  '1': '本地出差',
  '2': '外地出差',
  '3': '请假/调休',
};

// 选择日期
const calendarConfirm = (value: any) => {
  initDay(new Date(value.date));
};

// 返回今天
const backToday = () => {
  if (isToday.value) {
    return;
  }
  initDay(new Date());
};

// 编辑日程
const editSchedule = () => {
  if (userId.value) {
    return;
  }
  const nowDate = new Date().toLocaleDateString();
  const date1 = Date.parse(nowDate);
  const choose = time.format(nowClickDay.value, time.FORMATS.ISO_DATE).replace(/-/g, '/');
  const date2 = Date.parse(choose);
  if (date2 < date1) {
    return;
  }
  addScheduleRef.value?.init();
};

// AUTO 编辑
const autoEdit = () => {
  addScheduleRef.value?.init('auto');
};

// 显示客情详情
const showKqDetail = () => {
  if (userId.value || !nowDetail.value.mor || !nowDetail.value.mor.visitNum) {
    return;
  }
  addScheduleRef.value?.init('kq', time.format(nowClickDay.value, time.FORMATS.ISO_DATE));
};

// 确认用户选择
const onTreeConfirm = (id: string, name: string) => {
  changeTypeShow.value = false;
  userId.value = id || '';
  userName.value = name || '我的日程';
  getScheduleOfDateList();
};

// 返回我的日程
const backMy = () => {
  userId.value = '';
  userName.value = '我的日程';
  getScheduleOfDateList();
};

// 用户点击
const getUsersClick = () => {
  changeTypeShow.value = true;
};

// 新增成功回调
const insertScheduleSuccess = () => {
  getScheduleOfDateList();
};

// 生命周期
onMounted(async () => {
  // 初始化部门树（如果需要）
  await departmentStore.initDepTree({ treeType: 1, authorizedFlag: true });
  if (departmentStore.depTreeList && departmentStore.depTreeList.length > 0) {
    hasDept.value = true;
  }

  // 初始化日期
  initDay(new Date());
});
</script>

<template>
  <view class="pa-2">
    <app-watermark />

    <!-- 头部按钮区域 -->
    <view class="p-10 bg-white rounded-5">
      <view class="flex justify-between mb-2">
        <view
          class="flex-1 text-14 px-10 bg-light-gray h-80 leading-80 rounded-20rpx flex items-center"
          @click="calendarRef?.open()"
        >
          <text class="flex-1">{{ dateTitle }}</text>
          <view class="flex items-center" @click.stop="backToday">
            <app-icon v-if="!isToday" name="revoke" color="main" size="24rpx" class="mr-1" />
            <text :class="isToday ? '' : 'color-main'" class="text-12 color-gray-5">
              {{ isToday ? '今天' : '返回' }}
            </text>
          </view>
        </view>

        <view
          :class="userId ? 'bg-main color-white' : 'bg-light-gray'"
          class="flex-1 text-14 ml-2 px-10 text-center h-80 leading-80 rounded-20rpx flex items-center justify-center"
          @click="getUsersClick"
        >
          <text>{{ userName }}</text>
          <up-icon
            v-show="hasDept"
            name="arrow-down"
            :color="userId ? 'white' : ''"
            size="28rpx"
            class="ml-1"
          />
        </view>
      </view>
    </view>

    <!-- 周日历 -->
    <view class="flex justify-between px-10 py-10 bg-white mt-2">
      <view
        v-for="(date, index) in nowdateList"
        :key="index"
        class="flex flex-col items-center"
        style="width: 65.4rpx"
      >
        <text class="text-12 color-black-2 mb-2">{{ weeekList[index] }}</text>
        <view
          :class="getDayClass(date)"
          class="flex items-center justify-center text-16 mb-2"
          style="width: 60rpx; height: 60rpx; border-radius: 10rpx"
          @click="chooseDay(date)"
        >
          {{ date.split('-')[2] }}
        </view>
        <view class="flex items-center mt-2">
          <view
            class="rounded-full"
            style="width: 8rpx; height: 8rpx; margin-right: 10rpx"
            :style="getColor(nowDetailList[index], 'mor')"
          />
          <view
            class="rounded-full"
            style="width: 8rpx; height: 8rpx"
            :style="getColor(nowDetailList[index], 'aft')"
          />
        </view>
      </view>
    </view>

    <!-- 日程内容 -->
    <view class="bg-white mt-2 px-2 pb-16" @click="editSchedule">
      <!-- 上午 -->
      <view class="py-6 border-b border-gray-12">
        <text class="text-14 color-black-2 block mb-2">上午</text>
        <view
          :class="'status-' + (nowDetail.mor ? nowDetail.mor.scheduleType : '')"
          class="flex items-center mb-2"
        >
          <view class="w-17px h-17px rounded-full mr-2" />
          <text class="text-14">
            {{ nowDetail.mor ? statusMap_display[nowDetail.mor.scheduleType] : '未设置状态' }}
          </text>
        </view>
        <view class="pl-2">
          <text class="text-12 color-gray-6 block mb-1">备注</text>
          <view
            class="bg-light-gray rounded-5px p-10 min-h-80 border-gray-10"
            style="border-left: 5px solid #94969b"
          >
            <text class="text-14 color-black-2">
              {{ nowDetail.morRemark || '暂无备注' }}
            </text>
          </view>
        </view>
      </view>

      <!-- 下午 -->
      <view class="py-6">
        <text class="text-14 color-black-2 block mb-2">下午</text>
        <view
          :class="'status-' + (nowDetail.aft ? nowDetail.aft.scheduleType : '')"
          class="flex items-center mb-2"
        >
          <view class="w-17px h-17px rounded-full mr-2" />
          <text class="text-14">
            {{ nowDetail.aft ? statusMap_display[nowDetail.aft.scheduleType] : '未设置状态' }}
          </text>
        </view>
        <view class="pl-2">
          <text class="text-12 color-gray-6 block mb-1">备注</text>
          <view
            class="bg-light-gray rounded-5px p-10 min-h-80 border-gray-10"
            style="border-left: 5px solid #94969b"
          >
            <text class="text-14 color-black-2">
              {{ nowDetail.aftRemark || '暂无备注' }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 客情信息 -->
    <view class="flex items-center h-80 mt-2 px-10 bg-white rounded-20rpx" @click="showKqDetail">
      <text class="text-14 color-black-2">客情信息</text>
      <view
        :style="
          nowDetail.mor && nowDetail.mor.visitNum > 0
            ? 'background: #4970f3'
            : 'background: #D8D8D8'
        "
        class="h-24 leading-24 mx-2 px-2 rounded-16rpx text-12 font-600 color-white"
      >
        {{ nowDetail.mor && nowDetail.mor.visitNum ? nowDetail.mor.visitNum : 0 }}
      </view>
      <up-icon
        name="star"
        size="20rpx"
        :color="nowDetail.mor && nowDetail.mor.starNum > 0 ? '#FBD71B' : '#D8D8D8'"
      />
      <text
        v-if="nowDetail.mor && nowDetail.mor.starNum > 0"
        class="text-10 font-600 color-warning ml-1"
      >
        {{ nowDetail.mor.starNum }}
      </text>
    </view>

    <!-- AUTO 按钮 -->
    <view class="flex justify-center mt-16">
      <up-button
        v-show="!userId"
        style="width: 200rpx"
        class="h-80 shadow-btn"
        shape="circle"
        type="primary"
        @click.stop="autoEdit"
      >
        <view class="flex items-center justify-center">
          <image src="@/static/images/schedule-auto.png" class="w-32 h-28 mr-2" mode="aspectFit" />
          <text>AUTO</text>
        </view>
      </up-button>
      <up-button
        v-show="userId"
        style="width: 200rpx"
        class="h-80 shadow-btn"
        shape="circle"
        type="primary"
        @click.stop="backMy"
      >
        <view class="flex items-center justify-center">
          <image
            src="@/static/images/back-my-schedule.png"
            class="w-30 h-28 mr-2"
            mode="aspectFit"
          />
          <text class="text-12">本人日程</text>
        </view>
      </up-button>
    </view>

    <!-- 日历弹窗 -->
    <app-calendar
      ref="calendarRef"
      mode="single"
      :first-day-of-week="1"
      :date="time.format(nowClickDay, time.FORMATS.ISO_DATE)"
      title="选择日期"
      @confirm="calendarConfirm"
    />

    <!-- 部门用户选择 -->
    <biz-dept-user
      v-model:show="changeTypeShow"
      v-model:hasDept="hasDept"
      :is-select="false"
      :need-name="false"
      @confirm="onTreeConfirm"
    />

    <!-- 添加日程组件 -->
    <AddSchedule
      ref="addScheduleRef"
      :date-title="dateTitle"
      :father-detail="nowDetail"
      :now-detail-list="nowDetailList"
      @insert-schedule-success="insertScheduleSuccess"
    />
  </view>
</template>

<style lang="scss" scoped>
.day-text-before {
  color: #999;
}

.day-text-today {
  background: #e1e1e1;
  color: #fff;
}

.day-text-choose {
  background: #2271f5;
  color: #fff;
}

.status-0 {
  :deep(view:first-child) {
    background: #00a870;
  }
}

.status-1 {
  :deep(view:first-child) {
    background: #0052d9;
  }
}

.status-2 {
  :deep(view:first-child) {
    background: #ed7b2f;
  }
}

.status-3 {
  :deep(view:first-child) {
    background: #e34d59;
  }
}

.status- {
  :deep(view:first-child) {
    background: #94969b;
  }
}
</style>
