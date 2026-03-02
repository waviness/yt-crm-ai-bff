<script setup lang="ts">
import { useWeeklyReportOperations } from './composables/use-weekly-report-operations';
import { useWeeklyIndex } from './composables/use-weekly-index';
import list from './components/list.vue';
import time from '@/utils/time';

defineOptions(SHARED_STYLE_OPTIONS);

const userStore = useUserStore();
const appStore = useAppStore();
const departmentStore = useDepartmentStore();

// 部门用户相关状态
const hasDept = ref(false);
const checkedUsers = ref<any[]>([]);
const changeTypeShow = ref(false);
const checkDetailList = ref<any[]>([]); // 保留用于周报逻辑

// Refs
const calendarRef = ref();

// 状态
const weeklyReportObj = ref<any>({});
const weeklyReportError = ref('');
const weeklyReportMsg = ref('');
const cwrdocId = ref('');
const isSubmit = ref(false);
const activeNames = ref<any[]>([]);
const gatherFlag = ref(0);

// 使用 composables（按页面轻复用原则，合并为一个 composable）
const {
  weekNumber,
  weekString,
  weekChangeString,
  startTime,
  endTime,
  dateRange,
  initWeekDate,
  setWeekDateRange,
  leaderList,
  submitLeaderId,
  submitLeaderName,
  leaderShow,
  getLeader: _getLeader,
  leaderSelect,
  resetLeaderSelect,
  selectLabelFlag,
  selectLabelAll,
  toggleSelectLabel: selectLabelClick,
  toggleSelectAll: selectLabelAllClick,
  checkSelectAll,
  resetLabelSelect,
} = useWeeklyIndex(String(userStore.userInfor?.userId || ''), weeklyReportObj);

// 选择时间
const calendarConfirm = (value: any) => {
  // autoSelectWeek 已自动选中整周，直接使用选中的范围
  setWeekDateRange(value.range.before, value.range.after, _getReportDtl);
};

const {
  validateReportData,
  collectSaveData,
  collectSubmitDataIds,
  saveReport,
  submitReport,
  deleteReportItem,
  generateReport,
} = useWeeklyReportOperations();

// 获取周报详情
const _getReportDtl = async () => {
  weeklyReportMsg.value = '';
  weeklyReportError.value = '';

  if (leaderList.value.length > 0) {
    resetLeaderSelect();
    resetLabelSelect();
  }

  const params = {
    gatherFlag: gatherFlag.value,
    userIdList: checkedUsers.value,
    weekOfYear: weekNumber.value,
    startDate: startTime.value,
    endDate: endTime.value,
  };

  try {
    const res = await WeeklyService.getReportDtl(params);
    activeNames.value = [];
    cwrdocId.value = String(res.cwrdocId || '');
    weeklyReportObj.value = res;
    isSubmit.value = weeklyReportObj.value.commitFlag ? true : false;

    for (let index = 0; index < weeklyReportObj.value.resultList.length; index++) {
      const element = weeklyReportObj.value.resultList[index];
      element.labelNumber = 0;

      for (let childindex = 0; childindex < element.childList.length; childindex++) {
        const childelement = element.childList[childindex];
        if (childelement.reportDtoList.length) {
          ++element.labelNumber;
          activeNames.value.push(element.majorClassLabelId);
        }

        for (
          let reportDtoindex = 0;
          reportDtoindex < childelement.reportDtoList.length;
          reportDtoindex++
        ) {
          const reportDtoelement = childelement.reportDtoList[reportDtoindex];
          if (
            !(reportDtoelement.subClassLabelName === '客户拜访') &&
            weeklyReportObj.value.commitFlag === 0
          ) {
            reportDtoelement.editing = true;
          }
        }
      }
    }
    console.log('activeNames', activeNames.value);
  } catch (error: any) {
    // 处理异常情况（网络错误、请求失败等）
    // 从 originalHttpError 中获取原始的 code 和 msg
    const originalHttpError = error?.originalHttpError;

    if (originalHttpError) {
      // 如果能获取到原始 HttpError，使用原始的错误信息
      weeklyReportMsg.value = originalHttpError.errMsg || error?.message || '获取周报详情失败';
      weeklyReportError.value = originalHttpError.code || (error as any)?.code || 'error';
    } else if (error?.message) {
      // 如果只有 Error.message，使用它作为错误信息
      weeklyReportMsg.value = error.message;
      weeklyReportError.value = (error as any)?.code || 'error';
    } else {
      // 否则使用错误对象中的信息
      weeklyReportMsg.value = error?.errMsg || error?.msg || '获取周报详情失败';
      weeklyReportError.value = (error as any)?.code || 'error';
    }

    isSubmit.value = false;
    // 清空周报数据
    weeklyReportObj.value = {};
    cwrdocId.value = '';
  }
};

// 生成周报
const generateClick = (type: string = '') => {
  if (type) {
    showModal({
      content: '确定重新生成?',
      success: res => {
        if (res.confirm) {
          _generateReport();
        }
      },
    });
  } else {
    _generateReport();
  }
};

// 暂存
const saveClick = () => {
  const params = collectSaveData(weeklyReportObj.value);
  if (!validateReportData(params)) {
    return;
  }
  saveReport(params, _getReportDtl);
};

// 生成周报
const _generateReport = async () => {
  generateReport(
    {
      startTime: startTime.value,
      endTime: endTime.value,
    },
    _getReportDtl
  );
};

// 提交周报
const submitReportClick = () => {
  if (!submitLeaderId.value.length) {
    showToast('请选择汇报领导');
    return;
  }

  const cwrdtlIdList = collectSubmitDataIds(weeklyReportObj.value, leaderList.value);

  if (!cwrdtlIdList.length) {
    showToast('请选择要提交的信息');
    return;
  }

  if (leaderList.value.length > 1) {
    showModal({
      content: '单个汇报领导只能提交一次，请确定选择提交信息无遗漏！',
      success: async res => {
        if (res.confirm) {
          for (let index = 0; index < submitLeaderId.value.length; index++) {
            const element = submitLeaderId.value[index];
            await submitReport(
              {
                cwrdocId: weeklyReportObj.value.cwrdocId,
                leaderId: element,
                cwrdtlIdList,
              },
              _getReportDtl
            );
          }
        }
      },
    });
  } else {
    submitReport(
      {
        cwrdocId: weeklyReportObj.value.cwrdocId,
        leaderId: submitLeaderId.value[0],
        cwrdtlIdList,
      },
      _getReportDtl
    );
  }
};

// 删除
const deleteClick = async (item: any) => {
  showModal({
    content: '确定删除当前信息？',
    success: async res => {
      if (res.confirm) {
        deleteReportItem(item.cwrdtlId, _getReportDtl);
      }
    },
  });
};

// 确认选择用户
const handleTreeConfirm = (list: any[]) => {
  changeTypeShow.value = false;

  if (checkedUsers.value.length) {
    gatherFlag.value = 2;
  } else {
    gatherFlag.value = 1;
  }

  // 切换人员时保持当前日期不变，只刷新数据
  _getReportDtl();
};

// 获取用户点击
const getUsersClick = async () => {
  changeTypeShow.value = true;
};

// 重置到本人周报
const resetToMyReport = () => {
  checkedUsers.value = [];
  gatherFlag.value = 0;
  // 切换到本人时保持当前日期不变，只刷新数据
  _getReportDtl();
};

// 新增周报
const addWeeklyClick = () => {
  router.push(RouteMap.weeklyAdd, {
    cwrdocId: weeklyReportObj.value.cwrdocId,
  });
};

// 生命周期
onMounted(async () => {
  // 首次加载时获取领导列表
  await _getLeader();
  // 等待dept-user组件初始化完成后，根据用户数据设置gatherFlag初始值
  await nextTick();
  if (hasDept.value) {
    const depTreeList = departmentStore.depTreeList;
    const rootDeptId = depTreeList?.[0]?.depId;
    const userList = rootDeptId ? departmentStore.deptUserData[rootDeptId]?.userList : null;
    if (userList?.length > 0) {
      gatherFlag.value = 1;
    }
  }
  initWeekDate(new Date(), _getReportDtl);
});

// 页面显示时检查是否需要刷新
onShow(() => {
  // 从新增页面返回时刷新数据（保持当前日期范围不变）
  if (appStore.hadDoneOnDetail) {
    _getReportDtl();
    appStore.setHadDoneOnDetail(false);
  }
});
</script>

<template>
  <!-- 周报 -->
  <view class="pb-50">
    <app-watermark> </app-watermark>
    <!-- 顶部固定区域 -->
    <up-sticky style="top: 0">
      <view class="p-10 bg-light-gray">
        <view class="flex">
          <view
            class="flex-1 text-14 px-10 bg-white h-80 leading-10 rounded-20rpx flex items-center"
            @click="calendarRef?.open()"
          >
            {{ weekChangeString }}
            <view
              class="color-gray-5 text-12 ml-2 flex"
              @click.stop="
                weekChangeString !== weekString
                  ? initWeekDate(new Date(), _getReportDtl)
                  : calendarRef?.open()
              "
            >
              <app-icon
                v-if="weekChangeString !== weekString"
                name="return1-copy"
                color="main"
                size="24rpx"
              />
              <text :class="weekChangeString !== weekString ? 'color-main' : ''">
                {{ weekChangeString !== weekString ? '返回' : '本周' }}
              </text>
            </view>
          </view>
          <view
            v-if="!checkedUsers.length"
            @click="getUsersClick"
            class="flex-1 text-14 ml-2 px-10 text-center bg-white h-80 leading-10 rounded-20rpx flex justify-center"
          >
            {{ gatherFlag === 0 ? '我的周报' : '查看指定人员周报' }}
            <up-icon v-if="hasDept" name="arrow-down" size="28rpx" class="ml-1" />
          </view>
          <view
            v-else
            class="flex-1 text-14 ml-2 px-10 text-center color-white bg-main h-80 leading-10 rounded-20rpx"
            @click="getUsersClick"
          >
            已选{{ checkedUsers.length }}人
          </view>
        </view>

        <view
          v-if="leaderList.length > 0 && weeklyReportError !== 'weeklyReportErr400' && !isSubmit"
          class="flex mt-2"
        >
          <view
            :class="submitLeaderId.length > 0 ? 'bg-main color-white' : 'bg-white'"
            class="flex-2 text-14 text-center px-10 h-40px leading-10 rounded-20rpx flex align-items justify-center"
            @click="
              leaderShow = true;
              resetLeaderSelect();
            "
          >
            <view>{{ submitLeaderName || '请选择汇报对象' }}</view>
            <up-icon
              name="arrow-down"
              size="28rpx"
              class="ml-1"
              :color="submitLeaderName ? 'white' : ''"
            />
          </view>
          <view
            :class="selectLabelFlag ? 'bg-main text-white' : 'bg-white'"
            @click="selectLabelClick"
            class="flex-1 text-14 ml-2 px-10 text-center h-40px leading-10 rounded-20rpx"
          >
            {{ selectLabelFlag ? '取消选择' : '选择标签' }}
          </view>
          <view
            v-if="selectLabelFlag"
            @click="selectLabelAllClick"
            :class="selectLabelAll ? 'bg-main text-white' : 'bg-white'"
            class="flex-1 text-14 ml-2 px-10 text-center h-40px leading-10 rounded-20rpx"
          >
            {{ selectLabelAll ? '取消' : '' }} 全选
          </view>
        </view>

        <view v-if="weeklyReportObj.fullName" class="flex pt-2 justify-between text-14">
          <text>{{ weeklyReportObj.fullName && weeklyReportObj.fullName.split('/')[0] }}</text>
          <text v-if="leaderList.length === 1 && submitLeaderName"
            >汇报对象：{{ submitLeaderName }}</text
          >
          <text class="color-danger" v-if="leaderList.length === 0 && !submitLeaderName"
            >未维护汇报对象</text
          >
          <text class="color-success" v-if="isSubmit">已提交</text>
        </view>
      </view>
    </up-sticky>

    <!-- 内容区域 -->
    <view
      class="h-[355px] bg-white flex items-center justify-center"
      v-if="weeklyReportError === 'weeklyReportErr400'"
    >
      <app-empty v-if="weeklyReportError === 'weeklyReportErr400'" :description="weeklyReportMsg" />
    </view>
    <view v-else class="bg-white">
      <up-collapse :value="activeNames">
        <up-collapse-item
          v-for="(weeklyReport, index) in weeklyReportObj.resultList"
          :name="weeklyReport.majorClassLabelId"
          :key="'weeklyReport' + index"
        >
          <template #title>
            <view>
              {{ weeklyReport.majorClassLabelName }}
              <text
                :class="
                  weeklyReport.labelNumber
                    ? 'px-2 ml-2 text-12 color-white bg-main rounded-2'
                    : 'px-2 ml-2 text-12 color-white bg-gray-13 rounded-2'
                "
              >
                {{ weeklyReport.labelNumber }}
              </text>
            </view>
          </template>
          <view
            v-show="weeklyChild.reportDtoList.length > 0"
            v-for="(weeklyChild, weeklyChildIndex) in weeklyReport.childList"
            :key="'weeklyChild' + weeklyChildIndex"
          >
            <text>
              {{ weeklyChild.subClassLabelName }}
              <text class="px-2 ml-2 text-12 color-white bg-main rounded-2">
                {{ weeklyChild.reportDtoList.length }}
              </text>
            </text>
            <list
              :isSubmit="isSubmit"
              v-for="(reportDto, reportDtoIndex) in weeklyChild.reportDtoList"
              class="shadow-view"
              :cwrdocId="String(weeklyReportObj.cwrdocId || '')"
              :selectLabelFlag="selectLabelFlag"
              :item="reportDto"
              :key="'reportDto' + reportDtoIndex"
              @deleteClick="deleteClick"
              @update:checked="
                (val: boolean) => {
                  reportDto.checked = val;
                  checkSelectAll();
                }
              "
              @update:exceptTimeStr="(val: string) => (reportDto.exceptTimeStr = val)"
              @update:labelRemark="(val: string) => (reportDto.labelRemark = val)"
              @update:cwrdocId="(val: string) => (reportDto.cwrdocId = val)"
            />
          </view>
          <view v-show="!weeklyReport.labelNumber" class="color-gray-4">暂无信息</view>
        </up-collapse-item>
      </up-collapse>
    </view>

    <!-- 底部操作按钮 -->
    <app-bottom-actions v-if="!isSubmit" :count="1">
      <!-- 本周周报还未生成时显示周报生成按钮 -->
      <template v-if="weeklyReportMsg === '本周周报还未生成'">
        <app-action-btn
          class="shadow-btn w-240 mx-auto"
          type="primary"
          icon="juxing"
          :multi="false"
          text="周报生成"
          @click="generateClick('')"
        >
        </app-action-btn>
      </template>
      <!-- 周报已生成时显示操作按钮 -->
      <template v-else>
        <view class="flex">
          <view
            v-show="!checkedUsers.length"
            class="bg-white shadow-btn rounded-84rpx mx-8 w-300 h-80 flex items-center justify-center"
          >
            <app-icon size="large" @click="generateClick('reload')" color="main" name="zhongxin" />
            <app-icon size="large" color="main" @click="saveClick" class="mx-6" name="baocun" />
            <app-icon @click="submitReportClick" size="large" color="main" name="tijiao" />
          </view>
          <app-action-btn
            v-if="!checkedUsers.length"
            class="shadow-btn w-180 ml-2"
            type="primary"
            icon="a-xingzhuang2"
            :multi="false"
            text="新增"
            @click="addWeeklyClick"
          >
          </app-action-btn>
          <app-action-btn
            v-else
            class="shadow-btn w-240 mx-auto"
            type="primary"
            icon="juxing1"
            :multi="false"
            text="本人周报"
            @click="resetToMyReport"
          >
          </app-action-btn>
        </view>
      </template>
    </app-bottom-actions>
    <app-bottom-actions v-else-if="isSubmit && checkedUsers.length">
      <app-action-btn
        class="shadow-btn w-240 mx-auto"
        type="primary"
        icon="juxing1"
        :multi="false"
        text="本人周报"
        @click="resetToMyReport"
      >
      </app-action-btn>
    </app-bottom-actions>

    <!-- 日期弹框 -->
    <app-calendar
      ref="calendarRef"
      mode="range"
      :first-day-of-week="6"
      :auto-select-week="true"
      :date="
        dateRange.length === 2
          ? [
              time.format(dateRange[0], time.FORMATS.ISO_DATE),
              time.format(dateRange[1], time.FORMATS.ISO_DATE),
            ]
          : ''
      "
      title="选择日期"
      @confirm="calendarConfirm"
    />

    <!-- 部门用户选择 -->
    <biz-dept-user
      v-model:show="changeTypeShow"
      v-model:checkedUsers="checkedUsers"
      v-model:hasDept="hasDept"
      :permissionCheck="{
        menuValue: '周报',
        authorityName: '周报查询所有权限',
        type: 1,
      }"
      @confirm="handleTreeConfirm"
    />

    <!-- 汇报对象选择 -->
    <up-action-sheet
      :show="leaderShow"
      title="请选择汇报对象"
      :round="16"
      @close="leaderShow = false"
    >
      <up-checkbox-group
        v-model="submitLeaderId"
        @change="leaderSelect"
        placement="column"
        iconPlacement="right"
        shape="circle"
      >
        <up-checkbox
          v-for="item in leaderList"
          :key="item.id"
          :name="item.id"
          :label="item.name"
          class="py-3 px-4"
        />
      </up-checkbox-group>
    </up-action-sheet>
  </view>
</template>
