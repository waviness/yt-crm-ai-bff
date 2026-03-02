/**
 * 任务详情页面业务逻辑
 */
export function useTaskDetail() {
  const appStore = useAppStore();
  const userStore = useUserStore();

  // 响应式数据
  const detail = ref<any>({});
  const loading = ref(false);
  const replyContent = ref('');
  const submitLoading = ref(false);
  const knownLoading = ref(false);
  const orderTypeList = ref(['', '部门', '标签', '小组']);
  const active = ref(0);
  const replyList = ref<any[]>([]);
  const noReplyList = ref<any[]>([]);
  const replyRate = ref(0);
  const rateText = ref('');
  const noReplyshow = ref(false);

  // 从路由和 store 获取数据
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1] as any;
  const routeOptions = currentPage?.options || {};
  const isMsg = computed(() => routeOptions.isMsg);
  const userId = computed(() => routeOptions.userId);
  const detailInfor = computed(() => appStore.detailObj || {}); // type 1发出的 2收到的
  const userInfor = computed(() => userStore.userInfor);

  // 已知悉
  const known = () => {
    knownLoading.value = true;
    commit(1);
  };

  // 提交回执
  const submit = () => {
    if (!replyContent.value.trim()) {
      showError('请填写内容');
      return;
    }
    submitLoading.value = true;
    commit(2);
  };

  // 提交回执（统一处理）
  const commit = async (type: number) => {
    const params = {
      csoId: detail.value.csoId,
      csodId: detail.value.csodId,
      content: type === 1 ? '已知悉' : replyContent.value,
    };

    await TaskService.submitReturn(params);
    submitLoading.value = false;
    knownLoading.value = false;
    showSuccess('回执成功');
    if (isMsg.value) {
      detail.value.content = replyContent.value;
    } else {
      appStore.setHadDoneOnDetail(true);
      setTimeout(() => {
        uni.navigateBack();
      }, 500);
    }
    submitLoading.value = false;
    knownLoading.value = false;
  };

  // 下载文件
  const downloadFile = (file: any) => {
    const { fileUrl } = file;
    // 所有文件（包括图片）都跳转到下载页面进行下载
    router.push(RouteMap.download, {
      fileUrl,
    });
  };

  // 获取详情
  const getDetail = async () => {
    loading.value = true;
    let res: any = {};

    if (+detailInfor.value.type === 1) {
      res = await TaskService.querySendMsgDetail({ csoId: detailInfor.value.csoId });
    } else if (+detailInfor.value.type === 2) {
      res = await TaskService.queryWxMsg({
        csoId: detailInfor.value.csoId,
        userId: userId.value || userInfor.value.userId || '',
      });
    }

    detail.value = res || {};
    replyList.value = [];
    noReplyList.value = [];

    if (detail.value.sendList) {
      detail.value.sendList.forEach((item: any) => {
        if (item.sendTypeList) {
          item.sendTypeList.forEach((send: any) => {
            send.text = `${send.distributeId}/${send.distribute}（${orderTypeList.value[send.orderType]}）`;
          });
        }
        if (item.content) {
          replyList.value.push(item);
        } else {
          noReplyList.value.push(item);
        }
      });

      replyRate.value = detail.value.isReturn
        ? Math.ceil((replyList.value.length / detail.value.sendList.length) * 100)
        : 100;
      rateText.value = replyRate.value.toFixed(0) + '%';
    }

    // 处理文件 URL，没有前缀的加上 domainUrl
    if (detail.value.files && Array.isArray(detail.value.files)) {
      detail.value.files.forEach((file: any) => {
        if (
          file.fileUrl &&
          !file.fileUrl.startsWith('http://') &&
          !file.fileUrl.startsWith('https://')
        ) {
          file.fileUrl = `${appStore.domainUrl}${file.fileUrl}`;
        }
      });
    }

    loading.value = false;
  };

  // 催办
  const onUrgeReply = async (csoId: any) => {
    await TaskService.urgeReply({ csoId });
    showSuccess('催办成功');
  };

  // 再次发起
  const resend = () => {
    router.push(RouteMap.taskPublish, { detail: JSON.stringify(detail.value) });
  };

  // 初始化
  const init = () => {
    getDetail();
  };

  return {
    // 状态
    detail,
    loading,
    replyContent,
    submitLoading,
    knownLoading,
    orderTypeList,
    active,
    replyList,
    noReplyList,
    replyRate,
    rateText,
    noReplyshow,
    isMsg,
    userId,
    detailInfor,
    userInfor,

    // 方法
    known,
    submit,
    commit,
    downloadFile,
    getDetail,
    onUrgeReply,
    resend,
    init,
  };
}
