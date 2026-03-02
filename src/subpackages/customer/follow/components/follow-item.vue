<script setup lang="ts">
interface IProps {
  item: any;
}

const props = defineProps<IProps>();

const emit = defineEmits<{
  listClick: [item: any];
  addStarClick: [item: any];
  editClick: [item: any];
  clickChange: [item: any];
  commentClick: [item: any];
}>();

const userStore = useUserStore();

const listClick = () => {
  emit('listClick', props.item);
};

const addStarClick = () => {
  emit('addStarClick', props.item);
};

const editClick = () => {
  emit('editClick', props.item);
};

const clickChange = () => {
  emit('clickChange', props.item);
};

const commentClick = () => {
  emit('commentClick', props.item);
};

// 格式化公司名称第一部分
const formatCompanyName = (companyName: string) => {
  if (!companyName) return '';
  const parts = companyName.split('/');
  if (parts.length > 2) {
    return parts[0] + '/';
  }
  return companyName.substring(0, 10);
};

// 格式化公司名称剩余部分
const formatCompanyNameRest = (companyName: string) => {
  if (!companyName) return '';
  const parts = companyName.split('/');
  if (parts.length > 2) {
    // 原代码逻辑：拼接第1和第2部分
    return parts[1] + '/' + parts[2] + '/';
  }
  return companyName.substring(10);
};

const getCompanyTypeText = (type: number) => {
  const typeMap: Record<number, string> = {
    1: '供应商',
    2: '下游客户',
    3: '政府单位',
  };
  return typeMap[type] || '';
};

const getTaskTypeText = (type: number) => {
  const typeMap: Record<number, string> = {
    1: '个人拜访',
    2: '协访',
    3: '接待',
  };
  return typeMap[type] || '';
};

const getTaskTypeClass = (type: number) => {
  const classMap: Record<number, string> = {
    1: 'bg-main color-white border-main',
    2: 'color-main  border-main',
    3: 'bg-main-100 color-main border-main-100',
  };
  return classMap[type] || '';
};

const getWarmthIcon = (warmthNum: number) => {
  const iconMap: Record<number, string> = {
    1: 'full-green',
    2: 'full-orange',
    3: 'full-red',
  };
  return iconMap[warmthNum] || '';
};
</script>

<template>
  <view v-if="item" class="mb-2 bg-gray-11 rounded-5px shadow-sm">
    <view class="p-2 bg-white rounded-5px" @click="listClick">
      <view class="flex flex-col">
        <view class="flex justify-between items-center">
          <view class="flex items-center">
            <text class="text-14 font-bold">{{ formatCompanyName(item.companyName) }}</text>
            <app-icon v-if="item.address" name="tuding" class="ml-3" multi />
          </view>
          <text class="text-12 color-gray-4">{{
            item.visitTime ? item.visitTime.substring(0, 16) : ''
          }}</text>
        </view>
        <view class="flex justify-between items-center mt-2">
          <view class="w-[70%]">
            <text class="text-14 font-bold">{{ formatCompanyNameRest(item.companyName) }}</text>
            <text class="text-12 color-gray-4 ml-1">{{
              getCompanyTypeText(item.companyType)
            }}</text>
          </view>
          <view class="flex items-center">
            <up-icon v-if="!item.isRaisedStarFlag" name="star" size="32rpx" color="#FBD71B" />
            <up-icon
              v-for="star in item.starFlag"
              :key="star"
              name="star-fill"
              size="32rpx"
              color="#FBD71B"
            />
            <app-icon
              v-if="item.whetherLegwork === 0"
              name="xingzhuangjiehe2"
              size="32"
              multi
              class="ml-1"
            />
            <app-icon
              v-if="item.whetherLegwork === 1"
              name="buhang"
              size="32rpx"
              class="ml-1"
              multi
            />
            <text class="text-12 ml-2 color-main">
              {{ item.whetherLegwork === 1 ? '' : '非' }}外勤
            </text>
          </view>
        </view>
        <view class="flex justify-between items-center my-2">
          <view class="flex items-center">
            <text class="text-14 font-bold">{{ item.visitUserName }}</text>
            <app-icon
              v-if="getWarmthIcon(item.warmthNum)"
              :name="getWarmthIcon(item.warmthNum)"
              class="ml-1 pr-1 h-32!"
              multi
            />
            <text class="text-12 color-gray-4">（发起人：{{ item.creName }}）</text>
          </view>
          <text
            :class="getTaskTypeClass(item.taskType)"
            class="text-12 rounded-10rpx h-40 leading-5 px-2 border-solid border-1"
            >{{ getTaskTypeText(item.taskType) }}</text
          >
        </view>
      </view>
      <view class="mt-2">
        <view class="mb-2">
          <view class="flex items-center">
            <text class="text-14 color-gray-4">客情事件信息</text>
            <text
              :class="[
                item.crmLabelRemarkDtoList?.length
                  ? 'bg-[#9956f2] color-white font-bold'
                  : 'bg-gray-13 color-white',
                'text-12 h-12px leading-12px px-6px ml-1 rounded-8px',
              ]"
            >
              {{ item.crmLabelRemarkDtoList?.length || 0 }}
            </text>
          </view>
          <view
            v-if="item.crmLabelRemarkDtoList?.length"
            class="text-14 color-gray-4 mt-2 px-2 bg-gray-11 rounded-10rpx h-56 leading-7 overflow-hidden"
          >
            <view class="slh">
              <text v-for="(crmLabel, index) in item.crmLabelRemarkDtoList" :key="index">
                <template v-if="crmLabel.labelName === '药事会信息'">
                  {{ crmLabel.labelName }}：
                  <text v-if="crmLabel.medicBoardType">
                    {{
                      crmLabel.medicBoardType === 1
                        ? '新药会'
                        : crmLabel.medicBoardType === 2
                          ? '国谈会'
                          : crmLabel.medicBoardType === 3
                            ? crmLabel.medicBoardTypeMemo
                            : ''
                    }}
                  </text>
                  <text
                    v-if="
                      crmLabel.medicBoardType &&
                      (crmLabel.scheduleMeetingTime || crmLabel.medicBoardMemo)
                    "
                  >
                    ，
                  </text>
                  <text v-if="crmLabel.scheduleMeetingTime">{{
                    crmLabel.scheduleMeetingTime ? crmLabel.scheduleMeetingTime.split(' ')[0] : ''
                  }}</text>
                  <text v-if="crmLabel.scheduleMeetingTime && crmLabel.medicBoardMemo">，</text>
                  <text v-if="crmLabel.medicBoardMemo">{{ crmLabel.medicBoardMemo }}</text>
                  ；
                </template>
                <template v-else>{{ crmLabel.labelName }}：{{ crmLabel.remark }}；</template>
              </text>
            </view>
          </view>
        </view>
        <view>
          <view class="flex items-center">
            <text class="text-14 color-gray-4">批注信息</text>
            <text
              :class="[
                item.crmVisitCommentDtoList?.length
                  ? 'bg-[#9956f2] color-white font-bold'
                  : 'bg-gray-13 color-white',
                'text-12 h-12px leading-12px px-6px ml-1 rounded-8px',
              ]"
            >
              {{ item.crmVisitCommentDtoList?.length || 0 }}
            </text>
          </view>
        </view>
      </view>
    </view>
    <view class="flex items-center justify-between px-2 py-1">
      <view class="flex items-center">
        <up-icon
          v-if="!item.isRaisedStarFlag"
          name="star"
          size="20"
          color="main"
          @click="addStarClick"
        />
        <up-icon v-if="item.isRaisedStarFlag" name="star-fill" size="20" color="#FBD71B" />
        <app-icon
          v-show="userStore.userInfor?.userId === item.creId"
          name="tuding"
          class="mx-6 w-40"
          size="40"
          multi
          @click="clickChange"
        />
        <app-icon
          v-show="userStore.userInfor?.userId === item.creId"
          name="lujing2"
          size="20"
          color="main"
          @click="editClick"
        />
      </view>
      <up-button
        size="small"
        shape="circle"
        type="primary"
        class="mr-2 h-60 w-auto!"
        @click="commentClick"
      >
        批注
      </up-button>
    </view>
  </view>
</template>
