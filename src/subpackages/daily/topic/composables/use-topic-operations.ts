import { showSuccess } from '@/utils/toast';

/**
 * 话题操作 Composable
 * 提供点赞、评论、回复、@人等公共操作
 */
export function useTopicOperations() {
  const appStore = useAppStore();
  const userStore = useUserStore();

  /**
   * 点赞/取消点赞
   */
  const toggleSubscribe = async (item: any, onSuccess?: (subscribeList: any[]) => void) => {
    const params = {
      objectId: item.ctsId,
      objectType: 0,
      operateType: item.subscribeFlag ? 1 : 0,
      userId: userStore.userInfor.userId,
    };

    try {
      await TopicService.addSubscribe(params);

      // 获取最新的点赞列表
      const res = await TopicService.getSubscribe({
        userId: '',
        objectId: params.objectId,
        objectType: params.objectType,
      });

      showSuccess(item.subscribeFlag ? '取消有用成功' : '点击有用成功');

      // 更新点赞状态
      item.subscribeFlag = !item.subscribeFlag;
      item.subscribeList = res;
      item.subscribeNum = item.subscribeFlag ? +item.subscribeNum + 1 : +item.subscribeNum - 1;

      onSuccess?.(res);
    } catch (error) {
      console.error('点赞操作失败:', error);
    }
  };

  /**
   * 发表评论
   */
  const addDiscuss = async (ctsId: string, discussContent: string, onSuccess?: () => void) => {
    const params = {
      ctsId,
      discussContent: discussContent.trim(),
      discussType: 0,
      usestatus: 0,
    };

    try {
      const res = await TopicService.insDiscuss(params);
      showSuccess(res?.msg || '评论成功');
      onSuccess?.();
    } catch (error) {
      console.error('评论失败:', error);
    }
  };

  /**
   * 回复评论
   */
  const addReply = async (
    ctsId: string,
    discussContent: string,
    discussId: string,
    discussedUserId: string,
    onSuccess?: () => void
  ) => {
    const params = {
      ctsId,
      discussContent: discussContent.trim(),
      discussType: 1,
      discussId,
      discussedUserId,
      usestatus: 0,
    };

    try {
      const res = await TopicService.insDiscuss(params);
      showSuccess(res?.msg || '回复成功');
      onSuccess?.();
    } catch (error) {
      console.error('回复失败:', error);
    }
  };

  /**
   * 获取话题评论列表
   */
  const getDiscussList = async (ctsId: string) => {
    try {
      const res = await TopicService.getTopicDiscuss({ ctsId });
      return res;
    } catch (error) {
      console.error('获取评论列表失败:', error);
      return [];
    }
  };

  /**
   * @人操作
   */
  const addSign = async (
    ctsId: string,
    signContent: string,
    userIdList: string[],
    onSuccess?: () => void
  ) => {
    const params = {
      ctsId,
      signContent: signContent.trim(),
      userIdList,
    };

    try {
      const res = await TopicService.insSign(params);
      showSuccess(res?.msg || '@成功');
      onSuccess?.();
    } catch (error) {
      console.error('@人失败:', error);
    }
  };

  return {
    toggleSubscribe,
    addDiscuss,
    addReply,
    getDiscussList,
    addSign,
  };
}
