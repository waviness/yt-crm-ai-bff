<script setup lang="ts">
import { useTopicDetail } from './composables/use-topic-detail';
import { useTopicOperations } from './composables/use-topic-operations';
import TopicItem from './components/topic-item.vue';
import Discuss from './components/discuss.vue';

const userStore = useUserStore();
const { addSign } = useTopicOperations();

const {
  detailObj,
  tabsActive,
  getTopicDetail,
  handleSubscribe,
  handleDiscuss,
  handleReply,
  handleOpClick,
} = useTopicDetail();

const discussShow = ref(false);
const discussTitle = ref('评论');
const replyInfo = ref<any>({});

const messageShow = ref(false);
const messageValue = ref('');
const checkedUsers = ref<string[]>([]);
const checkDetailList = ref<any[]>([]);
const changeTypeShow = ref(false);
const hasDept = ref(false);

const backClick = (item: any) => {
  replyInfo.value = {
    ctdId: item.ctdId,
    createId: item.createId,
    createName: item.createName,
  };
  discussTitle.value = `回复${item.createName}`;
  discussShow.value = true;
};

const sureComment = async (val: string) => {
  if (!replyInfo.value.ctdId) {
    await handleDiscuss(val);
  } else {
    await handleReply(val, replyInfo.value.ctdId, replyInfo.value.createId);
  }
  discussShow.value = false;
};

const opClick = () => {
  handleOpClick(
    () => handleSubscribe(),
    () => {
      discussTitle.value = '评论';
      replyInfo.value = {};
      discussShow.value = true;
    },
    () => {
      changeTypeShow.value = true;
    }
  );
};

const handleTreeConfirm = (list: string[], userList: any[]) => {
  checkedUsers.value = list;
  const detail = userList.filter((user: any) => list.includes(user.userId));
  checkDetailList.value = checkDetailList.value.concat(detail);

  const detailList: any[] = [];
  for (let index = 0; index < checkDetailList.value.length; index++) {
    const element = checkDetailList.value[index];
    if (
      list.indexOf(element.userId) !== -1 &&
      !detailList.some((val: any) => element.userId === val.userId)
    ) {
      detailList.push(element);
    }
  }
  checkDetailList.value = detailList;
  messageShow.value = true;
};

const confirmDialog = async (action: string) => {
  if (action === 'confirm') {
    await addSign(detailObj.value.ctsId, messageValue.value, checkedUsers.value, () => {
      const messageObj = checkDetailList.value.map(element => ({
        createHeadImgUrl: userStore.userInfor.headImgUrl,
        createName: userStore.userInfor.userName,
        signedName: element.userName,
        signContent: messageValue.value,
      }));

      detailObj.value.signToSignedList = [...detailObj.value.signToSignedList, ...messageObj];

      messageValue.value = '';
      checkedUsers.value = [];
      checkDetailList.value = [];
      messageShow.value = false;
    });
  } else {
    messageShow.value = false;
  }

  changeTypeShow.value = false;
  return true;
};

onLoad((options: any) => {
  if (options.ctsId) {
    getTopicDetail(options.ctsId);
  }
});

// 只传数字，不传 icon
const tabList = computed(() => [
  { label: String(detailObj.value?.subscribeList?.length || 0) },
  { label: String(detailObj.value?.discussList?.length || 0) },
  { label: String(detailObj.value?.signToSignedList?.length || 0) },
]);

const handleTabChange = ({ index }: { index: number }) => {
  tabsActive.value = (index + 1).toString();
};
</script>

<template>
  <view v-if="detailObj.ctsId" class="detail pb-100">
    <app-watermark />
    <topic-item :listItem="detailObj" type="detail" />

    <!-- 自定义 Tabs 头部（带图标） -->
    <view class="custom-tabs-wrap bg-white">
      <view class="custom-tabs-header flex">
        <view
          v-for="(item, index) in [
            { icon: 'thumb-up', count: detailObj?.subscribeList?.length || 0 },
            { icon: 'xingzhuang5', count: detailObj?.discussList?.length || 0 },
            { icon: 'at', count: detailObj?.signToSignedList?.length || 0 },
          ]"
          :key="index"
          class="custom-tab-item flex-1 flex items-center justify-center"
          :class="{ active: parseInt(tabsActive) === index + 1 }"
          @click="handleTabChange({ index })"
        >
          <app-icon
            :name="item.icon"
            :color="parseInt(tabsActive) === index + 1 ? '#2271f5' : '#a3a3a3'"
            size="small"
          />
          <text
            class="ml-2 text-14"
            :style="{ color: parseInt(tabsActive) === index + 1 ? '#2271f5' : '#a3a3a3' }"
          >
            {{ item.count }}
          </text>
        </view>
      </view>
      <view class="custom-tabs-line-wrap">
        <view
          class="custom-tabs-line"
          :style="{
            left: `${(parseInt(tabsActive) - 0.5) * 33.33}%`,
          }"
        />
      </view>
    </view>

    <!-- 点赞 -->
    <scroll-view class="h-[calc(100vh-250px)]" scroll-y v-show="parseInt(tabsActive) === 1">
      <view
        v-for="(subscribe, index) in detailObj.subscribeList || []"
        :key="'subscribe' + index"
        class="px-10 py-3 flex items-center"
      >
        <up-avatar :src="subscribe.headImgUrl" size="40" shape="circle" />
        <view class="pl-2 flex-1">
          <view class="text-14">{{ subscribe.userName }}</view>
          <view class="color-gray-5 text-12">{{ subscribe.createTime }}</view>
        </view>
      </view>
    </scroll-view>

    <!-- 评论 -->
    <scroll-view class="h-[calc(100vh-250px)]" scroll-y v-show="parseInt(tabsActive) === 2">
      <view
        v-for="(discuss, index) in detailObj.discussList || []"
        :key="'discuss' + index"
        class="px-10 py-3"
      >
        <view class="flex">
          <up-avatar :src="discuss.discussHeadImgUrl" size="40" shape="circle" />
          <view class="pl-2 flex-1">
            <view class="flex justify-between items-center">
              <text class="text-14">{{ discuss.createName }}</text>
              <text class="color-gray-5 text-12">{{ discuss.createTime }}</text>
            </view>
            <view class="flex justify-between items-center mt-2">
              <text :class="discuss.discussContent ? '' : 'color-gray-5'">
                {{ discuss.discussContent || '并没有说什么' }}
              </text>
              <app-icon
                name="a-huifubeifen4"
                color="gray"
                size="small"
                @click="backClick(discuss)"
              />
            </view>

            <view
              v-for="(reply, replyIndex) in discuss.replyList || []"
              :key="'reply' + replyIndex"
              class="mt-3 flex"
            >
              <up-avatar :src="reply.discussHeadImgUrl" size="40" shape="circle" />
              <view class="pl-2 flex-1">
                <view class="flex justify-between items-center">
                  <view class="flex items-center">
                    <text class="text-14">{{ reply.createName }}</text>
                    <app-icon name="play" size="6px" class="mx-2" />
                    <text class="color-main text-14">{{ reply.discussedUserName }}</text>
                  </view>
                  <text class="color-gray-5 text-12">{{ reply.createTime }}</text>
                </view>
                <view class="flex justify-between items-center mt-2">
                  <text :class="reply.discussContent ? '' : 'color-gray-5'">
                    {{ reply.discussContent || '并没有说什么' }}
                  </text>
                  <app-icon
                    name="a-huifubeifen4"
                    color="gray"
                    size="small"
                    @click="backClick(reply)"
                  />
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- @人 -->
    <scroll-view class="h-[calc(100vh-250px)]" scroll-y v-show="parseInt(tabsActive) === 3">
      <view
        v-for="(signToSigned, index) in detailObj.signToSignedList || []"
        :key="'signToSigned' + index"
        class="px-10 py-3 flex"
      >
        <up-avatar :src="signToSigned.createHeadImgUrl" size="40" shape="circle" />
        <view class="pl-2 flex-1">
          <view class="flex justify-between items-center">
            <view class="flex items-center">
              <text class="text-14">{{ signToSigned.createName }}</text>
              <app-icon name="at" color="main" size="mini" class="px-2" />
              <text class="color-main text-14">{{ signToSigned.signedName }}</text>
            </view>
            <text class="color-gray-5 text-12">{{ signToSigned.createTime }}</text>
          </view>
          <view :class="signToSigned.signContent ? '' : 'color-gray-5'" class="mt-2">
            {{ signToSigned.signContent || '并没有说什么' }}
          </view>
        </view>
      </view>
    </scroll-view>

    <app-bottom-actions>
      <app-action-btn
        class="w-180 mx-auto shadow-btn"
        type="primary"
        :icon="+tabsActive === 1 ? 'thumb-up' : +tabsActive === 2 ? 'xingzhuang5' : 'at'"
        :multi="false"
        @click="opClick"
      />
    </app-bottom-actions>

    <up-popup :show="discussShow" mode="bottom" :round="16" @close="discussShow = false">
      <view class="h-40vh">
        <discuss v-if="discussShow" :title="discussTitle" @sureComment="sureComment" />
      </view>
    </up-popup>

    <biz-dept-user
      v-model:show="changeTypeShow"
      v-model:checkedUsers="checkedUsers"
      v-model:hasDept="hasDept"
      @confirm="handleTreeConfirm"
    />

    <up-modal
      :show="messageShow"
      title="并留言"
      :showCancelButton="true"
      @confirm="confirmDialog('confirm')"
      @cancel="confirmDialog('cancel')"
    >
      <up-textarea v-model="messageValue" placeholder="请输入留言" :autoHeight="true" class="p-4" />
    </up-modal>
  </view>
</template>

<style lang="scss" scoped>
.detail {
  width: 100%;
  height: 100%;
}

.custom-tabs-wrap {
  .custom-tabs-header {
    display: flex;
    border-bottom: 1rpx solid #eee;
  }

  .custom-tab-item {
    padding: 20rpx 0;
    cursor: pointer;
    transition: all 0.3s;
  }

  .custom-tabs-line-wrap {
    position: relative;
    height: 6rpx;
    margin-top: -6rpx;
  }

  .custom-tabs-line {
    width: 80rpx;
    height: 6rpx;
    background-color: #2271f5;
    border-radius: 3rpx;
    transition: left 0.3s;
    position: absolute;
    left: 0;
    transform: translateX(-50%);
  }
}
</style>
