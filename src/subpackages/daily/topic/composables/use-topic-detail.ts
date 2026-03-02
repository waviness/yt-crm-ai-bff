/**
 * 话题详情 Composable
 * 按页面轻复用原则，仅用于 detail.vue
 */
import { ref } from 'vue';
import { useTopicOperations } from './use-topic-operations';
import { TopicService } from '@/api/topic';

export function useTopicDetail() {
  const { toggleSubscribe, addDiscuss, addReply, getDiscussList } = useTopicOperations();

  // 详情数据
  const detailObj = ref<any>({});
  const tabsActive = ref('1');

  /**
   * 获取话题详情
   */
  const getTopicDetail = async (ctsId: string) => {
    try {
      const res = await TopicService.getTopicDetail({ ctsId });
      detailObj.value = res;
    } catch (error) {
      console.error('获取话题详情失败:', error);
    }
  };

  /**
   * 点赞操作
   */
  const handleSubscribe = async () => {
    await toggleSubscribe(detailObj.value, subscribeList => {
      detailObj.value.subscribeList = subscribeList;
    });
  };

  /**
   * 评论操作
   */
  const handleDiscuss = async (discussContent: string) => {
    await addDiscuss(detailObj.value.ctsId, discussContent, async () => {
      // 刷新评论列表
      const discussList = await getDiscussList(detailObj.value.ctsId);
      detailObj.value.discussList = discussList;
    });
  };

  /**
   * 回复操作
   */
  const handleReply = async (
    discussContent: string,
    discussId: string,
    discussedUserId: string
  ) => {
    await addReply(detailObj.value.ctsId, discussContent, discussId, discussedUserId, async () => {
      // 刷新评论列表
      const discussList = await getDiscussList(detailObj.value.ctsId);
      detailObj.value.discussList = discussList;
    });
  };

  /**
   * 根据当前tab执行对应操作
   */
  const handleOpClick = (onSubscribe: () => void, onDiscuss: () => void, onSign: () => void) => {
    switch (tabsActive.value) {
      case '1':
        onSubscribe();
        break;
      case '2':
        onDiscuss();
        break;
      case '3':
        onSign();
        break;
    }
  };

  return {
    detailObj,
    tabsActive,
    getTopicDetail,
    handleSubscribe,
    handleDiscuss,
    handleReply,
    handleOpClick,
  };
}
