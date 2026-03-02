<template>
  <view class="person-op pb-120">
    <view class="bg-white mb-4 pa-2">
      <view class="font-bold text-16 mb-2">{{ userDetail ? '编辑人员' : '新增人员' }}</view>
    </view>

    <up-form ref="formRef">
      <app-form-item label="客户信息" class="mt-1">
        <text class="float-right"
          >{{ detailInfo.szymCustomerId }}/{{ detailInfo.customerName }}</text
        >
      </app-form-item>

      <app-form-item label="人员姓名" required>
        <up-input
          v-model="formData.userName"
          clearable
          placeholder="请输入人员姓名"
          inputAlign="right"
          fontSize="28rpx"
          border="none"
        />
      </app-form-item>

      <app-form-item label="手机号" required>
        <up-input
          v-model="formData.phoneNum"
          clearable
          placeholder="请输入手机号"
          inputAlign="right"
          fontSize="28rpx"
          border="none"
          @input="queryUserByPhone(formData.phoneNum)"
        />
      </app-form-item>

      <!-- 手机号搜索结果 -->
      <view v-if="phoneLoading || userObj" class="user-search-result">
        <up-loading-icon v-if="phoneLoading" mode="circle" />
        <view v-else-if="userObj" class="user-info" @click="chooseUser(userObj)">
          <view class="user-info__name">{{ userObj.userId }}/{{ userObj.userName }}</view>
          <view class="user-info__detail">手机号：{{ userObj.phoneNum }}</view>
          <view class="user-info__detail">微信号：{{ userObj.wxCode }}</view>
        </view>
      </view>

      <app-form-item label="微信号" required>
        <up-input
          v-model="formData.wxCode"
          clearable
          placeholder="请输入人员微信号"
          inputAlign="right"
          fontSize="28rpx"
          border="none"
        />
      </app-form-item>

      <app-form-item label="性别" required>
        <view
          :class="`w-full text-right ${genderObj.name ? '' : 'color-gray-6'}`"
          @click="chooseAction(1)"
        >
          {{ genderObj.name || '点击选择' }}
        </view>
      </app-form-item>

      <app-form-item label="生日">
        <view
          :class="['w-full text-right', formData.birthday ? 'color-black-2' : 'color-gray-7']"
          @click="openBirthdayCalendar"
        >
          {{ formData.birthday || '点击选择' }}
        </view>
      </app-form-item>

      <app-form-item label="年龄">
        <up-input
          v-model="formData.age"
          disabled
          placeholder="请选择生日"
          inputAlign="right"
          fontSize="28rpx"
          border="none"
        />
      </app-form-item>

      <app-form-item label="科室信息" required>
        <view
          :class="`w-full text-right ${officeIdObj.name ? '' : 'color-gray-6'}`"
          @click="chooseAction(2)"
        >
          {{ officeIdObj.name || '点击选择' }}
        </view>
      </app-form-item>

      <app-form-item label="职称信息" required>
        <view
          :class="`w-full text-right ${positionIdObj.name ? '' : 'color-gray-6'}`"
          @click="chooseAction(3)"
        >
          {{ positionIdObj.name || '点击选择' }}
        </view>
      </app-form-item>

      <app-form-item label="行政级别">
        <view
          :class="`w-full text-right ${structureLevelObj.name ? '' : 'color-gray-6'}`"
          @click="chooseAction(4)"
        >
          {{ structureLevelObj.name || '点击选择' }}
        </view>
      </app-form-item>

      <app-form-item label="头衔">
        <up-textarea
          v-model="formData.honorTitle"
          placeholder="请输入头衔"
          border="none"
          inputAlign="right"
          fontSize="28rpx"
          :autoHeight="true"
        />
      </app-form-item>

      <app-form-item label="客户分级" required>
        <view
          :class="`w-full text-right ${customerUserGradeObj.name ? '' : 'color-gray-6'}`"
          @click="chooseAction(5)"
        >
          {{ customerUserGradeObj.name || '点击选择' }}
        </view>
      </app-form-item>

      <app-form-item label="学位" :borderBottom="false">
        <up-input
          v-model="formData.degree"
          clearable
          placeholder="请输入学位"
          inputAlign="right"
          fontSize="28rpx"
          border="none"
        />
      </app-form-item>
    </up-form>

    <view class="commonButton-footer flex justify-center">
      <up-button
        :customStyle="{ width: '240rpx', height: '70rpx' }"
        text="取消"
        shape="circle"
        plain
        @click="handleCancel"
      />
      <up-button
        :customStyle="{ width: '240rpx', height: '70rpx' }"
        text="确定"
        type="primary"
        shape="circle"
        @click="handleSubmit"
      />
    </view>

    <!-- Action Sheets -->
    <app-action-sheet
      v-if="actionType === 1"
      :show="actionShow"
      :actions="genderOptions"
      cancel-text="取消"
      close-on-click-action
      @select="handleSelectGender"
      @update:show="actionShow = $event"
    />
    <app-action-sheet
      v-if="actionType === 2"
      :show="actionShow"
      :actions="officeOptions"
      cancel-text="取消"
      close-on-click-action
      @select="handleSelectOffice"
      @update:show="actionShow = $event"
    />
    <app-action-sheet
      v-if="actionType === 3"
      :show="actionShow"
      :actions="positionOptions"
      cancel-text="取消"
      close-on-click-action
      @select="handleSelectPosition"
      @update:show="actionShow = $event"
    />
    <app-action-sheet
      v-if="actionType === 4"
      :show="actionShow"
      :actions="structureLevelOptions"
      cancel-text="取消"
      close-on-click-action
      @select="handleSelectStructureLevel"
      @update:show="actionShow = $event"
    />
    <app-action-sheet
      v-if="actionType === 5"
      :show="actionShow"
      :actions="customerUserGradeOptions"
      cancel-text="取消"
      close-on-click-action
      @select="handleSelectCustomerUserGrade"
      @update:show="actionShow = $event"
    />

    <!-- Date Picker -->
    <up-datetime-picker
      :show="showDatePicker"
      v-model="currentDate"
      mode="date"
      :minDate="minDate"
      :maxDate="maxDate"
      @confirm="handleDateConfirm"
      @cancel="showDatePicker = false"
    />
  </view>
</template>

<script lang="ts" setup>
import type { CustomerStaffDetail, OptionItem } from '../types';
import { usePersonOp } from '../composables/use-person-op';
import dayjs from 'dayjs';

interface Props {
  userDetail: CustomerStaffDetail | null;
  officeOptions: OptionItem[];
  positionOptions: OptionItem[];
  structureLevelOptions: OptionItem[];
  customerUserGradeOptions: OptionItem[];
}

interface Emits {
  (e: 'cancel'): void;
  (e: 'submit', data: CustomerStaffDetail): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const appStore = useAppStore();
const detailInfo = computed(() => appStore.detailObj);

const userDetailRef = toRef(props, 'userDetail');

const {
  formData,
  genderOptions,
  genderObj,
  officeIdObj,
  positionIdObj,
  structureLevelObj,
  customerUserGradeObj,
  phoneLoading,
  userObj,
  queryUserByPhone,
  chooseUser,
  selectGender,
  selectBirthday,
  selectOffice,
  selectPosition,
  selectStructureLevel,
  selectCustomerUserGrade,
  validateForm,
  initForm,
} = usePersonOp(userDetailRef);

// ActionSheet state
const actionShow = ref(false);
const actionType = ref(0);

const chooseAction = (type: number) => {
  actionShow.value = true;
  actionType.value = type;
};

// Date Picker State
const showDatePicker = ref(false);
const currentDate = ref(Number(new Date()));
const minDate = new Date(1900, 0, 1).getTime();
const maxDate = new Date().getTime();

const openBirthdayCalendar = () => {
  if (formData.value.birthday) {
    currentDate.value = new Date(formData.value.birthday).getTime();
  } else {
    currentDate.value = new Date().getTime();
  }
  showDatePicker.value = true;
};

const handleDateConfirm = (e: any) => {
  const date = new Date(e.value);
  const dateStr = dayjs(date).format('YYYY-MM-DD');
  selectBirthday(dateStr);
  showDatePicker.value = false;
};

// Wrapper functions for ActionSheet select events
const handleSelectGender = (item: OptionItem) => {
  selectGender(item);
  actionShow.value = false;
};

const handleSelectOffice = (item: OptionItem) => {
  selectOffice(item);
  actionShow.value = false;
};

const handleSelectPosition = (item: OptionItem) => {
  selectPosition(item);
  actionShow.value = false;
};

const handleSelectStructureLevel = (item: OptionItem) => {
  selectStructureLevel(item);
  actionShow.value = false;
};

const handleSelectCustomerUserGrade = (item: OptionItem) => {
  selectCustomerUserGrade(item);
  actionShow.value = false;
};

const handleCancel = () => {
  emit('cancel');
};

const handleSubmit = () => {
  if (!validateForm()) {
    return;
  }
  emit('submit', formData.value);
};

onMounted(() => {
  initForm();
});
</script>

<style lang="scss" scoped>
.person-op {
  max-height: 90vh;
  overflow-y: auto;
}

.user-search-result {
  position: absolute;
  z-index: 99;
  left: 220rpx;
  width: 55%;
  min-height: 160rpx;
  background: #fff;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10rpx;
  padding: 20rpx;

  &:active {
    background: #f2f2f2;
  }
}

.user-info {
  width: 100%;

  &__name {
    font-size: 28rpx;
    font-weight: bold;
    margin-bottom: 10rpx;
  }

  &__detail {
    font-size: 24rpx;
    color: #666;
    margin-bottom: 5rpx;
  }
}

.color-gray-6 {
  color: #666;
}

.color-gray-7 {
  color: #999;
}

.color-black-2 {
  color: #333;
}
</style>
