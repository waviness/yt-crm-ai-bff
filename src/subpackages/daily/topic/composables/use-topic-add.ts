/**
 * 新增话题 Composable
 * 按页面轻复用原则，仅用于 add.vue
 */
export function useTopicAdd() {
  const appStore = useAppStore();
  const userStore = useUserStore();

  // 表单数据
  const title = ref('');
  const labelType = ref<any>({});
  const topicValue = ref('');
  const message = ref('');

  // 选择的用户
  const checkedUsers = ref<string[]>([]);
  const checkDetailList = ref<any[]>([]);

  // 标签树
  const labelTreeList = ref<any[]>([]);
  const labelShow = ref(false);
  const activeId = ref(-1);
  const activeIndex = ref(0);

  /**
   * 获取标签树
   */
  const getLabelTree = async () => {
    const params = { type: '1' };

    try {
      const res = await CommonService.getLabelTree(params);

      labelTreeList.value = res.map((item: any) => {
        let children: any[] = [];
        if (item.CHILD_LIST.length) {
          children = item.CHILD_LIST.map((ele: any) => ({
            id: ele.LABEL_ID,
            text: ele.LABEL_NAME,
          }));
        }
        return {
          id: item.LABEL_ID,
          text: item.LABEL_NAME,
          children: [...children],
        };
      });
    } catch (error) {
      console.error('获取标签树失败:', error);
    }
  };

  /**
   * 标签选择
   */
  const handleLabelSelect = (id: number) => {
    const parentItem = labelTreeList.value[activeIndex.value];
    if (!parentItem) return;

    const childItem = parentItem.children?.find((item: any) => item.id === id);
    if (childItem) {
      labelType.value = childItem;
      labelShow.value = false;
    }
  };

  /**
   * 用户选择确认
   */
  const handleUserConfirm = (list: string[], userList: any[]) => {
    checkedUsers.value = list;
    const detail = userList.filter((user: any) => list.includes(user.userId));
    checkDetailList.value = checkDetailList.value.concat(detail);

    // 去重
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
  };

  /**
   * 提交表单
   */
  const submitTopic = async () => {
    if (!title.value.trim()) {
      showToast('请输入标题');
      return false;
    }

    if (!labelType.value.id) {
      showToast('请选择事件分类');
      return false;
    }

    if (!topicValue.value.trim()) {
      showToast('请输入话题内容');
      return false;
    }

    if (checkedUsers.value.length === 0) {
      showToast('请选择提醒谁看');
      return false;
    }

    const params = {
      labelId: labelType.value.id,
      topicContent: topicValue.value,
      topicTitle: title.value,
      isSign: !!checkedUsers.value.length,
      signContent: message.value,
      userIdList: checkedUsers.value,
    };

    try {
      await showModal({ content: '确定新建话题？' });

      await TopicService.insTopicPersonal(params);
      showSuccess('新建成功');

      // 设置标记，通知列表页刷新
      appStore.setHadDoneOnDetail(true);
      router.back();

      return true;
    } catch (error) {
      console.error('新建话题失败:', error);
      return false;
    }
  };

  /**
   * 取消操作
   */
  const cancelAdd = () => {
    router.back();
  };

  return {
    title,
    labelType,
    topicValue,
    message,
    checkedUsers,
    checkDetailList,
    labelTreeList,
    labelShow,
    activeId,
    activeIndex,
    getLabelTree,
    handleLabelSelect,
    handleUserConfirm,
    submitTopic,
    cancelAdd,
  };
}
