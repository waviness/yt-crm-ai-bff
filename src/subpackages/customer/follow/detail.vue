<script setup lang="ts">
import { useCustomerFollow } from './composables/use-customer-follow';
import Comment from './components/comment.vue';
import CustomLabel from './components/custom-label.vue';

const appStore = useAppStore();

const openFlag = ref(false);
const openFlagComment = ref(false);
const cuvId = ref<string>('');

const detailObj = computed(() => appStore.detailObj || {});

// 使用客户随访 composable
const {
  commentShow,
  showAdressPicker,
  customerLabelShow,
  addStarClick: _addStarClick,
  editClick: _editClick,
  commentClick: _commentClick,
  sureComment,
  clickChange: _clickChange,
  adressOnConfirm,
  addressChoose,
  adressCancel,
} = useCustomerFollow();

/**
 * 获取随访详情
 */
const getUserVisit = async (cuvId: string) => {
  const res = await CustomerFollowService.getUserVisit({ cuvId });
  appStore.setDetailObj(res.list[0]);
};

/**
 * 格式化公司名称第一部分
 */
const formatCompanyNameFirst = (companyName: string) => {
  if (!companyName) return '';
  const parts = companyName.split('/');
  if (parts.length > 2) {
    return parts[0] + '/';
  }
  return companyName.substring(0, 10);
};

/**
 * 格式化公司名称剩余部分
 */
const formatCompanyNameRest = (companyName: string) => {
  if (!companyName) return '';
  const parts = companyName.split('/');
  if (parts.length > 2) {
    // 原代码逻辑：拼接第1和第2部分
    return parts[1] + '/' + parts[2] + '/';
  }
  return companyName.substring(10);
};

/**
 * 获取公司类型文本
 */
const getCompanyTypeText = (type: number) => {
  const typeMap: Record<number, string> = {
    1: '供应商',
    2: '下游客户',
    3: '政府单位',
  };
  return typeMap[type] || '';
};

/**
 * 获取任务类型文本
 */
const getTaskTypeText = (type: number) => {
  const typeMap: Record<number, string> = {
    1: '个人拜访',
    2: '协访',
    3: '接待',
  };
  return typeMap[type] || '';
};

/**
 * 获取任务类型样式类
 */
const getTaskTypeClass = (type: number) => {
  const classMap: Record<number, string> = {
    1: 'bg-main color-white border-main',
    2: 'color-main  border-main',
    3: 'bg-main-100 color-main border-main-100',
  };
  return classMap[type] || '';
};

/**
 * 获取热力值图标
 */
const getWarmthIcon = (warmthNum: number) => {
  const iconMap: Record<number, string> = {
    1: 'full-green',
    2: 'full-orange',
    3: 'full-red',
  };
  return iconMap[warmthNum] || '';
};

/**
 * 获取药事会类型名称
 */
const getMedicBoardTypeName = (type: number | undefined, memo?: string) => {
  if (!type) return '';
  if (type === 1) return '新药会';
  if (type === 2) return '国谈会';
  if (type === 3) return memo || '';
  return '';
};

/**
 * 格式化日期时间（去掉秒）
 */
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '';
  return dateTime.substring(0, dateTime.length - 3);
};

/**
 * 星标点击
 */
const addStarClick = () => {
  _addStarClick(detailObj.value);
};

/**
 * 编辑点击
 */
const editClick = () => {
  _editClick(detailObj.value);
};

/**
 * 关联打卡点击
 */
const clickChange = () => {
  _clickChange(detailObj.value);
};

/**
 * 批注点击
 */
const commentClick = () => {
  _commentClick(detailObj.value);
};

onLoad((opts: any) => {
  cuvId.value = opts.cuvid || opts.civid || '';
  if (cuvId.value) {
    appStore.setDetailObj({});
    getUserVisit(cuvId.value);
  }
});
</script>

<template>
  <view class="pb-50">
    <app-watermark> </app-watermark>
    <view class="px-5 pt-5 pb-3 bg-white rounded-b-10px">
      <view class="flex justify-between items-center">
        <view class="flex items-center">
          <text class="text-14 font-bold">{{ formatCompanyNameFirst(detailObj.companyName) }}</text>
          <app-icon v-if="detailObj.address" name="tuding1" class="ml-3" size="16" multi />
        </view>
        <text class="color-gray-4">{{
          detailObj.visitTime ? detailObj.visitTime.substring(0, 16) : ''
        }}</text>
      </view>
      <view class="flex justify-between items-center">
        <view class="w-[75%]">
          <text class="font-bold text-14">{{ formatCompanyNameRest(detailObj.companyName) }}</text>
          <text class="color-gray-4 ml-1">{{ getCompanyTypeText(detailObj.companyType) }}</text>
        </view>
        <view class="flex items-center">
          <up-icon v-if="!detailObj.isRaisedStarFlag" name="star" size="32rpx" color="#FBD71B" />
          <up-icon
            v-for="star in detailObj.starFlag"
            :key="star"
            name="star-fill"
            size="32rpx"
            color="#FBD71B"
          />
          <app-icon
            v-if="detailObj.whetherLegwork === 0"
            name="xingzhuangjiehe2"
            size="32rpx"
            class="ml-1"
            multi
          />
          <app-icon v-if="detailObj.whetherLegwork === 1" name="buhang" class="ml-1" multi />
          <text class="ml-2">{{ detailObj.whetherLegwork === 1 ? '' : '非' }}外勤</text>
        </view>
      </view>
      <view class="flex justify-between items-center my-2">
        <view class="flex items-center">
          <text class="font-bold text-14">{{ detailObj.visitUserName }}</text>
          <app-icon
            v-if="getWarmthIcon(detailObj.warmthNum)"
            :name="getWarmthIcon(detailObj.warmthNum)"
            class="ml-1 pr-1 h-32!"
            multi
          />
          <text class="color-gray-4">（发起人：{{ detailObj.creName }}）</text>
        </view>
        <text
          :class="getTaskTypeClass(detailObj.taskType)"
          class="text-12 rounded-10rpx h-40 leading-5 px-2 border-solid border-1"
          >{{ getTaskTypeText(detailObj.taskType) }}</text
        >
      </view>
    </view>
    <view class="p-10 overflow-auto h-[calc(100%-188px)]">
      <view v-if="detailObj.cciId" class="p-10 bg-white rounded-8px mb-2">
        <view class="color-gray-4 text-14">定位信息</view>
        <view>{{ detailObj.cciId }}/{{ detailObj.address }}</view>
      </view>
      <view class="p-10 bg-white rounded-8px">
        <view class="color-gray-4 text-14">客情事件信息</view>
        <view
          class="px-10 text-12px"
          v-for="crmLabelRemark in detailObj.crmLabelRemarkDtoList?.slice(0, 3)"
          :key="'crmLabelRemark' + crmLabelRemark.clrId"
        >
          <view class="color-main py-2">
            {{ crmLabelRemark.labelName }}
            <text class="pl-2" v-if="crmLabelRemark.credate">{{
              formatDateTime(crmLabelRemark.credate)
            }}</text>
          </view>
          <template v-if="crmLabelRemark.labelName === '药事会信息'">
            <view class="pb-2 flex">
              <view class="color-gray-4 w-80px">药事会类型</view>
              <view class="color-main">
                {{
                  crmLabelRemark.medicBoardType
                    ? getMedicBoardTypeName(
                        crmLabelRemark.medicBoardType,
                        crmLabelRemark.medicBoardTypeMemo
                      )
                    : ''
                }}
              </view>
            </view>
            <view class="pb-2 flex">
              <view class="color-gray-4 w-80px">计划日期</view>
              <view class="color-main">
                {{
                  crmLabelRemark.scheduleMeetingTime
                    ? crmLabelRemark.scheduleMeetingTime.split(' ')[0]
                    : ''
                }}
              </view>
            </view>
            <view class="pb-2 color-gray-4">备注</view>
            <view class="pb-2">{{ crmLabelRemark.medicBoardMemo }}</view>
          </template>
          <view v-else class="pb-2">{{ crmLabelRemark.remark }}</view>
        </view>
        <view
          v-show="openFlag"
          class="px-10 text-12px"
          v-for="crmLabelRemark in detailObj.crmLabelRemarkDtoList?.slice(3)"
          :key="'crmLabelRemark' + crmLabelRemark.clrId"
        >
          <view class="color-main py-2">
            {{ crmLabelRemark.labelName }}
            <text class="pl-2" v-if="crmLabelRemark.credate">{{
              formatDateTime(crmLabelRemark.credate)
            }}</text>
          </view>
          <template v-if="crmLabelRemark.labelName === '药事会信息'">
            <view class="pb-2 flex">
              <view class="color-gray-4 w-80px">药事会类型</view>
              <view class="color-main">
                {{
                  crmLabelRemark.medicBoardType
                    ? getMedicBoardTypeName(
                        crmLabelRemark.medicBoardType,
                        crmLabelRemark.medicBoardTypeMemo
                      )
                    : ''
                }}
              </view>
            </view>
            <view class="pb-2 flex">
              <view class="color-gray-4 w-80px">计划日期</view>
              <view class="color-main">{{ crmLabelRemark.scheduleMeetingTime }}</view>
            </view>
            <view class="pb-2 color-gray-4">备注</view>
            <view class="pb-2">{{ crmLabelRemark.medicBoardMemo }}</view>
          </template>
          <view v-else class="pb-2">{{ crmLabelRemark.remark }}</view>
        </view>
        <view
          v-if="(detailObj.crmLabelRemarkDtoList?.length || 0) > 3"
          class="flex justify-center items-center"
        >
          <text class="color-gray-4" @click="openFlag = !openFlag">
            {{ !openFlag ? '点击展开' : '点击收回' }}
          </text>
          <app-icon
            :name="!openFlag ? 'a-lujing1' : 'a-lujing1-copy'"
            size="mini"
            color="#323233"
            @click.stop="openFlag = !openFlag"
          />
        </view>
      </view>
      <view class="p-10 bg-white rounded-8px mt-2">
        <view class="color-gray-4 text-14">批注信息</view>
        <view
          class="px-10 text-12px"
          v-for="crmVisitComment in detailObj.crmVisitCommentDtoList?.slice(0, 3)"
          :key="'crmLabelRemark' + crmVisitComment.cvcId"
        >
          <view class="color-main py-2">
            {{ crmVisitComment.creName }}
            <text class="pl-2" v-if="crmVisitComment.credate">{{
              formatDateTime(crmVisitComment.credate)
            }}</text>
          </view>
          <view class="pb-2">{{ crmVisitComment.commentRemark }}</view>
        </view>
        <view
          v-show="openFlagComment"
          class="px-10 text-12px"
          v-for="crmVisitComment in detailObj.crmVisitCommentDtoList?.slice(3)"
          :key="'crmLabelRemark' + crmVisitComment.cvcId"
        >
          <view class="color-main py-2">
            {{ crmVisitComment.creName }}
            <text class="pl-2" v-if="crmVisitComment.credate">{{
              formatDateTime(crmVisitComment.credate)
            }}</text>
          </view>
          <view class="pb-2">{{ crmVisitComment.commentRemark }}</view>
        </view>
        <view
          v-if="(detailObj.crmVisitCommentDtoList?.length || 0) > 3"
          class="flex justify-center items-center"
        >
          <text class="color-gray-4" @click="openFlagComment = !openFlagComment">
            {{ !openFlagComment ? '点击展开' : '点击收回' }}
          </text>
          <app-icon
            :name="!openFlagComment ? 'a-lujing1' : 'a-lujing1-copy'"
            size="16rpx"
            color="#323233"
            @click.stop="openFlagComment = !openFlagComment"
          />
        </view>
      </view>
    </view>
    <app-bottom-actions class="w-fit justify-self-center">
      <view
        class="flex-1 bg-white shadow-[0_0_12px_5px_rgb(209_207_207_/_50%)] left-[calc(30%-85px)] rounded-[1.12rem] mx-8px px-20px h-40px flex items-center justify-center"
      >
        <up-icon
          v-if="!detailObj.isRaisedStarFlag"
          name="star"
          size="40rpx"
          color="#2271F5"
          @click="addStarClick"
        />
        <up-icon v-if="detailObj.isRaisedStarFlag" name="star-fill" size="40rpx" color="#FBD71B" />
        <app-icon name="tuding" size="40" class="ml-6 w-40" multi @click="clickChange" />
        <app-icon
          v-if="!cuvId"
          name="lujing2"
          size="16"
          color="#2271F5"
          class="ml-6"
          @click="editClick"
        />
      </view>
      <app-action-btn
        v-if="!cuvId"
        class="flex-1 min-w-250"
        text="点击添加批注"
        type="primary"
        @click="commentClick"
      />
    </app-bottom-actions>
    <CustomLabel
      v-if="customerLabelShow"
      :activeName="0"
      :customerLabelShow="customerLabelShow"
      :customerId="detailObj.companyId"
      @closeClick="customerLabelShow = false"
    />
    <Comment
      v-if="commentShow"
      :commentShow="commentShow"
      @closeClick="commentShow = false"
      @sureComment="sureComment"
    />
    <biz-clock-in
      v-model="showAdressPicker"
      :detailClock="detailObj.cciId"
      :visitDate="detailObj.visitTime"
      @adressOnConfirm="adressOnConfirm"
      @addressChoose="addressChoose"
      @adressCancel="adressCancel"
    />
  </view>
</template>
