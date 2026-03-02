// @ts-ignore
import GoEasy from '../libs/goeasy-lite.js';

// 状态标记：记录初始化状态
let isInitialized = false;
let isConnected = false;
let isSubscribed = false;
let currentChannel = '';

// 初始化 GoEasy 实例（单例模式）
export const initGoEasy = async () => {
  if (isInitialized) {
    console.log('GoEasy already initialized');
    return;
  }

  GoEasy.getInstance({
    host: 'hangzhou.goeasy.io', // 服务器地址（根据实际区域选择）
    appkey: 'BC-9772e271f68f4541879841e801c9f973', // GoEasy appkey
    modules: ['pubsub'], // 加载 pubsub 模块（发布/订阅功能）
  });

  isInitialized = true;
  console.log('GoEasy initialized');
};

export const connectGoEasy = async () => {
  if (isConnected) {
    console.log('GoEasy already connected');
    return;
  }

  GoEasy.connect({
    onSuccess: () => {
      console.log('GoEasy connect successfully.');
      isConnected = true;
    },
    onFailed: (error: any) => {
      console.log('Failed to connect GoEasy, code:' + error.code + ',error:' + error.content);
      isConnected = false;
      showModal({
        title: error.code.toString(),
        content: error.content,
        showCancel: false,
        duration: 6000,
      });
    },
    onProgress: (attempts: number) => {
      console.log('GoEasy is connecting', attempts);
    },
  });
};

export const subscribeGoEasy = async (
  appStore: ReturnType<typeof useAppStore>,
  userStore: ReturnType<typeof useUserStore>
) => {
  const channel = `${userStore.userInfor.userId}-msg`;

  // 如果已经订阅了相同的频道，直接返回
  if (isSubscribed && currentChannel === channel) {
    console.log('GoEasy already subscribed to channel:', channel);
    return;
  }

  // 如果订阅了不同的频道，先取消订阅
  if (isSubscribed && currentChannel !== channel) {
    console.log('Unsubscribing from previous channel:', currentChannel);
    GoEasy.pubsub.unsubscribe({
      channel: currentChannel,
    });
    isSubscribed = false;
  }

  GoEasy.pubsub.subscribe({
    channel: channel,
    onMessage: (message: { content: string; channel: string }) => {
      console.log(message.content);
      try {
        // 解析 JSON 消息
        const data = JSON.parse(message.content);
        appStore.setMsgObj(data);
      } catch (error) {
        console.error('JSON 解析失败:', error);
        console.log('原始消息:', message.content);
      }
    },
    onSuccess: () => {
      console.log('订阅成功');
      isSubscribed = true;
      currentChannel = channel;
    },
    onFailed: (error: any) => {
      console.log('订阅失败，错误编码：' + error.code + ' 错误信息：' + error.content);
      isSubscribed = false;
    },
  });
};
