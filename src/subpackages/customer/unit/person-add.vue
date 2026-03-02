<script setup lang="ts">
import router from '@/utils/router';
import { usePersonAdd } from './composables/use-person-add';
import {
  MARITAL_OPTIONS,
  EDUCATION_OPTIONS,
  POLITICAL_OPTIONS,
  STATUS_FULL_OPTIONS,
  MEDICAL_MEMBER_OPTIONS,
  WARMTH_NUM_OPTIONS,
} from './constants';

const appStore = useAppStore();

// 路由参数
const type = ref<string | number>('1'); // 1新增 2修改 3详情
const cupId = ref<string>('');
const customerInfo = computed(() => appStore.detailObj || {});

// 使用 composable
const {
  nowUser,
  userList,
  phoneLoading,
  submitLoading,
  actionShow,
  actionType,
  hobbyPopShow,
  birthdayPopShow,
  politicsBirthdayPopShow,
  birthday,
  politicsBirthday,
  statusOptions,
  hobbyOptions,
  hobbyResult,
  departOptions,
  positionOptions,
  formData,
  hobbyDetail,
  detailInfor,
  getHobbyFun,
  queryDept,
  getPostionFun,
  queryCrmUser,
  chooseUser,
  chooseFilter,
  handleSelectMarital,
  handleSelectEducation,
  handleSelectPolitical,
  handleSelectHobby,
  handleSelectDepart,
  handleSelectPosition,
  handleSelectStatus,
  handleSelectMedicalMember,
  handleSelectWarmth,
  handleSelectBirthday,
  handleSelectPoliticsBirthday,
  getDetail,
  submit,
  cleanup,
} = usePersonAdd(customerInfo, cupId, type);

/**
 * 编辑
 */
const editDetail = () => {
  type.value = 2;
};

// 日历引用
const birthdayCalendarRef = ref();
const politicsBirthdayCalendarRef = ref();

/**
 * 打开生日日历
 */
const openBirthdayCalendar = () => {
  birthdayCalendarRef.value?.open();
};

/**
 * 打开政治生日日历
 */
const openPoliticsBirthdayCalendar = () => {
  politicsBirthdayCalendarRef.value?.open();
};

// 页面加载
onLoad((options: any) => {
  // 接收路由参数
  type.value = options?.type || '1';
  cupId.value = options?.cupId || '';

  // 初始化数据
  initData();
});

onShow(() => {
  if (appStore.hadDoneOnDetail) {
    initData();
  }
});

/**
 * 初始化数据
 */
const initData = async () => {
  await getHobbyFun();
  if (+type.value !== 1) {
    await getDetail();
  } else {
    await queryDept();
  }
};

onUnmounted(() => {
  cleanup();
});
</script>

<template>
  <view class="pb-100">
    <app-watermark> </app-watermark>
    <view class="text-14 p-10">
      客户人员信息维护{{ +type === 1 ? '新增' : +type === 2 ? '编辑' : '详情' }}
    </view>
    <view class="text-14 mt-4 mb-2 mx-10 px-10 title-before">基础信息</view>
    <view v-if="+type === 1 || +type === 2" class="bg-white rounded-1 mb-2">
      <up-form>
        <app-form-item label="人员姓名" :required="true">
          <up-input
            v-model="formData.userName"
            :disabled="formData.creId ? String(formData.creId) !== nowUser : false"
            placeholder="请输入人员姓名"
            input-align="right"
            fontSize="28rpx"
            border="none"
          />
        </app-form-item>
        <app-form-item label="手机号" :required="true" class="relative">
          <up-input
            v-model="formData.phoneNum"
            :disabled="formData.creId ? String(formData.creId) !== nowUser : false"
            type="number"
            input-align="right"
            fontSize="28rpx"
            border="none"
            placeholder="请输入手机号"
            @change="queryCrmUser"
          />
          <view
            v-if="phoneLoading || userList.length"
            class="absolute left-220 top-80 w-max h-160 bg-white shadow-lg flex items-center justify-center z-99 px-12"
          >
            <up-loading-page v-if="phoneLoading" mode="spinner" color="main" />
            <view v-else-if="userList.length" class="p-10" @click="chooseUser(userList[0])">
              <view class="text-14">{{ `${userList[0].userId}/${userList[0].userName}` }}</view>
              <view class="color-gray-4 text-12 mt-1">手机号：{{ userList[0].phoneNum }}</view>
              <view class="color-gray-4 text-12 mt-1">微信号：{{ userList[0].wxCode }}</view>
            </view>
          </view>
        </app-form-item>
        <app-form-item label="微信号" :required="true">
          <up-input
            v-model="formData.wxCode"
            :disabled="formData.creId ? String(formData.creId) !== nowUser : false"
            input-align="right"
            fontSize="28rpx"
            border="none"
            placeholder="请输入人员微信号"
          />
        </app-form-item>
        <app-form-item label="部门信息" :required="true">
          <view
            :class="['w-full text-right', formData.depart?.name ? 'color-black-2' : 'color-gray-7']"
            @click="chooseFilter(5)"
          >
            {{ formData.depart?.name || '点击选择' }}
          </view>
        </app-form-item>
        <app-form-item label="职位信息" :required="true">
          <view
            :class="[
              'w-full text-right',
              formData.position?.name ? 'color-black-2' : 'color-gray-7',
            ]"
            @click="chooseFilter(6)"
          >
            {{ formData.position?.name || '点击选择' }}
          </view>
        </app-form-item>
        <app-form-item label="状态" :required="true">
          <view
            :class="[
              'w-full text-right',
              formData.statusObj?.name ? 'color-black-2' : 'color-gray-7',
            ]"
            @click="chooseFilter(7)"
          >
            {{ formData.statusObj?.name || '点击选择' }}
          </view>
        </app-form-item>
        <app-form-item label="药事会成员">
          <view
            :class="[
              'w-full text-right',
              formData.medicalMemberObj?.name ? 'color-black-2' : 'color-gray-7',
            ]"
            @click="chooseFilter(11)"
          >
            {{ formData.medicalMemberObj?.name || '点击选择' }}
          </view>
        </app-form-item>
        <app-form-item label="热力值" :required="true">
          <view
            :class="['w-full text-right', formData.warmth?.name ? 'color-black-2' : 'color-gray-7']"
            @click="chooseFilter(8)"
          >
            {{ formData.warmth?.name || '点击选择' }}
          </view>
        </app-form-item>
      </up-form>
    </view>
    <view v-else class="bg-white rounded-1 mb-2">
      <app-cell title="人员姓名" :value="formData.userName" />
      <app-cell title="手机号" :value="formData.phoneNum" />
      <app-cell title="微信号" :value="formData.wxCode" />
      <app-cell title="部门信息" :value="formData.depart?.name || ''" />
      <app-cell title="职位信息" :value="formData.position?.name || ''" />
      <app-cell title="状态" :value="formData.statusObj?.name || ''" />
      <app-cell
        title="药事会成员"
        :value="formData.medicalMember === 0 ? '否' : formData.medicalMember === 1 ? '是' : ''"
      />
      <app-cell
        title="热力值"
        :value="formData.warmth?.name || ''"
        :value-class="
          formData.warmth && formData.warmth.value
            ? formData.warmth.value === 1
              ? 'color-success'
              : formData.warmth.value === 2
                ? 'color-warning'
                : formData.warmth.value === 3
                  ? 'color-danger'
                  : 'color-gray-5'
            : 'color-gray-5'
        "
        :border="false"
      />
    </view>
    <view class="text-14 mt-4 mb-2 mx-10 px-10 title-before">拓展信息</view>
    <view v-if="+type === 1 || +type === 2" class="bg-white rounded-1 mb-2">
      <up-form>
        <app-form-item label="身份证号">
          <up-input
            v-model="formData.idCard"
            placeholder="请输入人员身份证号"
            input-align="right"
            fontSize="28rpx"
            border="none"
          />
        </app-form-item>
        <app-form-item label="生日">
          <view
            :class="['w-full text-right', formData.birthday ? 'color-black-2' : 'color-gray-7']"
            @click="openBirthdayCalendar"
          >
            {{ formData.birthday || '点击选择' }}
          </view>
        </app-form-item>
        <app-form-item label="学历">
          <view
            :class="[
              'w-full text-right',
              formData.education?.name ? 'color-black-2' : 'color-gray-7',
            ]"
            @click="chooseFilter(2)"
          >
            {{ formData.education?.name || '点击选择' }}
          </view>
        </app-form-item>
        <app-form-item label="政治面貌">
          <view
            :class="[
              'w-full text-right',
              formData.political?.name ? 'color-black-2' : 'color-gray-7',
            ]"
            @click="chooseFilter(3)"
          >
            {{ formData.political?.name || '点击选择' }}
          </view>
        </app-form-item>
        <app-form-item label="政治生日">
          <view
            :class="[
              'w-full text-right',
              formData.politicsBirthday ? 'color-black-2' : 'color-gray-7',
            ]"
            @click="openPoliticsBirthdayCalendar"
          >
            {{ formData.politicsBirthday || '点击选择' }}
          </view>
        </app-form-item>
        <app-form-item label="收入">
          <up-input
            v-model="formData.salary"
            type="number"
            input-align="right"
            fontSize="28rpx"
            border="none"
            placeholder="请输入人员收入"
          />
        </app-form-item>
        <app-form-item label="爱好">
          <view
            :class="['w-full text-right', hobbyDetail ? 'color-black-2' : 'color-gray-7']"
            @click="chooseFilter(4)"
          >
            {{ hobbyDetail || '点击选择' }}
          </view>
        </app-form-item>
        <app-form-item label="婚姻状况">
          <view
            :class="[
              'w-full text-right',
              formData.marital?.name ? 'color-black-2' : 'color-gray-7',
            ]"
            @click="chooseFilter(1)"
          >
            {{ formData.marital?.name || '点击选择' }}
          </view>
        </app-form-item>
        <app-form-item label="家庭情况">
          <up-input
            v-model="formData.familyStatus"
            input-align="right"
            fontSize="28rpx"
            border="none"
            placeholder="请输入人员家庭情况"
            auto-height
          />
        </app-form-item>
        <app-form-item label="地址">
          <up-input
            v-model="formData.address"
            input-align="right"
            fontSize="28rpx"
            border="none"
            placeholder="请输入地址"
            auto-height
          />
        </app-form-item>
        <app-form-item label="备注" :borderBottom="false">
          <up-input
            v-model="formData.remark"
            input-align="right"
            fontSize="28rpx"
            border="none"
            placeholder="请输入人员备注"
            auto-height
          />
        </app-form-item>
      </up-form>
    </view>
    <view v-else class="bg-white rounded-1 mb-2">
      <app-cell title="身份证号" :value="formData.idCard || ''" />
      <app-cell title="生日" :value="formData.birthday || ''" />
      <app-cell title="学历" :value="formData.education?.name || ''" />
      <app-cell title="政治面貌" :value="formData.political?.name || ''" />
      <app-cell title="政治生日" :value="formData.politicsBirthday || ''" />
      <app-cell title="收入" :value="formData.salary || ''" />
      <app-cell title="爱好" :value="hobbyDetail" />
      <app-cell title="婚姻状况" :value="formData.marital?.name || ''" />
      <app-cell title="家庭情况" :value="formData.familyStatus || ''" />
      <app-cell title="地址" :value="formData.address || ''" />
      <app-cell title="备注" :value="formData.remark || ''" :border="false" />
    </view>
    <app-bottom-actions class="mt-15 mx-4 block" :count="2" :fixed="false">
      <app-action-btn class="flex-1" text="取消" @click="router.back()" />
      <app-action-btn
        v-if="+type === 1 || +type === 2"
        class="flex-1"
        text="提交"
        type="primary"
        @click="submit"
      />
      <app-action-btn
        v-else-if="!detailInfor.onlyRead"
        class="flex-1"
        text="编辑"
        type="primary"
        @click="editDetail"
      />
    </app-bottom-actions>
    <app-action-sheet
      v-if="actionType === 1"
      :show="actionShow"
      :actions="MARITAL_OPTIONS"
      @select="handleSelectMarital"
      @update:show="actionShow = $event"
    />
    <app-action-sheet
      v-if="actionType === 2"
      :show="actionShow"
      :actions="EDUCATION_OPTIONS"
      @select="handleSelectEducation"
      @update:show="actionShow = $event"
    />
    <app-action-sheet
      v-if="actionType === 3"
      :show="actionShow"
      :actions="POLITICAL_OPTIONS"
      @select="handleSelectPolitical"
      @update:show="actionShow = $event"
    />
    <app-action-sheet
      v-if="actionType === 5"
      :show="actionShow"
      :actions="departOptions"
      @select="handleSelectDepart"
      @update:show="actionShow = $event"
    />
    <app-action-sheet
      v-if="actionType === 6"
      :show="actionShow"
      :actions="positionOptions"
      @select="handleSelectPosition"
      @update:show="actionShow = $event"
    />
    <app-action-sheet
      v-if="actionType === 7"
      :show="actionShow"
      :actions="statusOptions"
      @select="handleSelectStatus"
      @update:show="actionShow = $event"
    />
    <app-action-sheet
      v-if="actionType === 8"
      :show="actionShow"
      :actions="WARMTH_NUM_OPTIONS"
      @select="handleSelectWarmth"
      @update:show="actionShow = $event"
    />
    <app-action-sheet
      v-if="actionType === 11"
      :show="actionShow"
      :actions="MEDICAL_MEMBER_OPTIONS"
      @select="handleSelectMedicalMember"
      @update:show="actionShow = $event"
    />
    <!-- 爱好选择弹窗 -->
    <up-modal
      :show="hobbyPopShow"
      mode="center"
      showCancelButton
      @cancel="hobbyPopShow = false"
      @confirm="handleSelectHobby"
    >
      <view class="w-full max-h-70vh">
        <up-checkbox-group
          v-model="hobbyResult"
          shape="circle"
          placement="column"
          iconPlacement="right"
        >
          <up-checkbox
            v-for="(item, index) in hobbyOptions"
            :key="item.value"
            :name="item"
            :label="item.name"
            class="py-3"
          />
        </up-checkbox-group>
      </view>
    </up-modal>
    <!-- 生日日历 -->
    <app-calendar ref="birthdayCalendarRef" :date="birthday" @confirm="handleSelectBirthday" />
    <!-- 政治生日日历 -->
    <app-calendar
      ref="politicsBirthdayCalendarRef"
      :date="politicsBirthday"
      @confirm="handleSelectPoliticsBirthday"
    />
  </view>
</template>
