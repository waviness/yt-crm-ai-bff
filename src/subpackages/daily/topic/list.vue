<script setup lang="ts">
import { useTopicList } from './composables/use-topic-list';
import { useTopicOperations } from './composables/use-topic-operations';
import TopicItem from './components/topic-item.vue';
import Discuss from './components/discuss.vue';

defineOptions(SHARED_STYLE_OPTIONS);

const appStore = useAppStore();

const { toggleSubscribe, addDiscuss, addReply, addSign, getDiscussList } = useTopicOperations();

const {
  dataList,
  totalNum,
  loading,
  finished,
  refreshing,
  onRefresh,
  onLoad: onLoadList,
} = useTopicList();

// 查询参数
const cardItem = ref<any>({});

// 评论/回复
const discussShow = ref(false);
const discussTitle = ref('评论');
const replyInfo = ref<any>({});

// @人
const messageShow = ref(false);
const messageValue = ref('');
const checkedUsers = ref<string[]>([]);
const checkDetailList = ref<any[]>([]);
const changeTypeShow = ref(false);
const hasDept = ref(false);

// 当前操作的话题
const currentTopic = ref<any>({});

// 列表项点击
const listClick = (item: any) => {
  uni.navigateTo({
    url: `/subpackages/daily/topic/detail?ctsId=${item.ctsId}`,
  });
};

// 点赞
const subscribeClick = async (item: any) => {
  await toggleSubscribe(item, subscribeList => {
    item.subscribeList = subscribeList;
  });
};

// 评论
const discussClick = (item: any) => {
  currentTopic.value = item;
  discussTitle.value = '评论';
  replyInfo.value = {};
  discussShow.value = true;
};

// 回复
const backClick = (discussItem: any, item: any) => {
  currentTopic.value = discussItem;
  replyInfo.value = {
    ctdId: item.ctdId,
    createId: item.createId,
    createName: item.createName,
  };
  discussTitle.value = `回复${item.createName}`;
  discussShow.value = true;
};

// @人
const signToSignedClick = (item: any) => {
  currentTopic.value = item;
  changeTypeShow.value = true;
};

// 确定发表评论/回复
const sureComment = async (val: string) => {
  if (!replyInfo.value.ctdId) {
    // 评论
    await addDiscuss(currentTopic.value.ctsId, val, async () => {
      discussShow.value = false;
      const discussList = await getDiscussList(currentTopic.value.ctsId);
      currentTopic.value.discussList = discussList;
    });
  } else {
    // 回复
    await addReply(
      currentTopic.value.ctsId,
      val,
      replyInfo.value.ctdId,
      replyInfo.value.createId,
      async () => {
        discussShow.value = false;
        const discussList = await getDiscussList(currentTopic.value.ctsId);
        currentTopic.value.discussList = discussList;
      }
    );
  }
};

// 确认选择用户
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

// 确认@人
const confirmDialog = async (action: string) => {
  if (action === 'confirm') {
    await addSign(currentTopic.value.ctsId, messageValue.value, checkedUsers.value, () => {
      const userStore = useUserStore();
      const messageObj = checkDetailList.value.map(element => ({
        createHeadImgUrl: userStore.userInfor.headImgUrl,
        createName: userStore.userInfor.userName,
        signedName: element.userName,
        signContent: messageValue.value,
      }));

      currentTopic.value.signToSignedList = [...currentTopic.value.signToSignedList, ...messageObj];

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

// 加载数据
const handleLoad = () => {
  onLoadList(cardItem.value);
};

// 刷新
const handleRefresh = () => {
  onRefresh();
  handleLoad();
};

// 生命周期
onLoad((options: any) => {
  // uniapp 通过 onLoad 获取页面参数
  cardItem.value = options;
  handleLoad();
});

onShow(() => {
  if (appStore.hadDoneOnDetail) {
    handleRefresh();
    appStore.setHadDoneOnDetail(false);
  }
});
</script>

<template>
  <view class="list pb-100">
    <app-watermark />

    <up-sticky style="top: 0">
      <view class="list-header mb-2 flex justify-between px-10 bg-white">
        <view>
          <text class="text-16">{{ cardItem.LABEL_NAME }}</text>
          <text v-if="cardItem.todayNum !== undefined" class="color-gray-5 pl-4 text-12">
            今日新增{{ cardItem.todayNum }}条
          </text>
        </view>
        <view v-show="totalNum !== 0" class="text-14">
          共<text class="px-1">{{ totalNum }}</text
          >条
        </view>
      </view>
    </up-sticky>

    <view class="list-content">
      <scroll-view
        class="h-[calc(100vh-50px)]"
        scroll-y
        enable-flex
        @scrolltolower="handleLoad"
        @scrolltoupper="handleRefresh"
      >
        <app-empty v-if="!loading && !dataList.length" class="pb-6" description="暂无数据" />

        <topic-item
          v-for="(item, index) in dataList"
          :key="index"
          :listItem="item"
          @click="listClick(item)"
          @subscribeClick="subscribeClick(item)"
          @discussClick="discussClick(item)"
          @signToSignedClick="signToSignedClick(item)"
        />

        <up-loadmore
          v-if="loading || !finished"
          :status="loading ? 'loading' : finished ? 'nomore' : 'loadmore'"
        />
      </scroll-view>
    </view>

    <!-- 评论/回复 -->
    <up-popup :show="discussShow" mode="bottom" :round="16" @close="discussShow = false">
      <view class="h-40vh">
        <discuss v-if="discussShow" :title="discussTitle" @sureComment="sureComment" />
      </view>
    </up-popup>

    <!-- 部门用户选择 -->
    <biz-dept-user
      v-model:show="changeTypeShow"
      v-model:checkedUsers="checkedUsers"
      v-model:hasDept="hasDept"
      @confirm="handleTreeConfirm"
    />

    <!-- @人留言 -->
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
.list {
  &-header {
    height: 40px;
    line-height: 40px;
    box-shadow: 0 4px 24px 0 rgb(125 126 128 / 12%);
  }
}
</style>
