/**
 * 消息列表页面业务逻辑 Composable
 *
 * 管理消息列表的所有业务逻辑，包括：
 * - 消息类型切换（工作流/通用任务）
 * - 筛选条件管理
 * - 标签筛选
 * - 未读消息数管理
 */
import { MessageService } from '@/api/message';
import router from '@/utils/router';
import { RouteMap } from '@/config/route';
import { showToast, showModal, showSuccess } from '@/utils/toast';
import type { TabsItem } from '@/types/common';

import { resolveMessageUrl } from '@/utils/resolve-message-url';
import { isH5 } from '@/utils/env';

export function useMessage() {
  const appStore = useAppStore();
  const userStore = useUserStore();

  // 消息类型：2工作流 1通用任务
  const msgType = ref(2);
  // 任务类型：2我收到的 1我发出的
  const taskType = ref(2);
  // 标签筛选相关
  const showTag = ref(false);
  const tagItems = ref<any[]>([]);
  const activeIds = ref<any[]>([]);
  const activeIndex = ref(0);
  const activeId = ref<number | string>('');

  // 未读消息数
  const flowCount = ref(0);
  const taskCount = ref(0);

  // 筛选条件
  const filterObj = ref({
    startTime: '',
    endTime: '',
    urgency: {},
    useStatus: {},
    keyword: '',
  });

  // 标签页配置
  const tabCurrent = computed<number>(() => (msgType.value === 2 ? 0 : 1));

  const tabList = computed<TabsItem[]>(() => [
    {
      name: '工作流',
      badge: {
        value: flowCount.value > 0 ? (flowCount.value > 99 ? '99+' : flowCount.value) : '',
      },
    },
    {
      name: '通用任务',
      badge: {
        value: taskCount.value > 0 ? (taskCount.value > 99 ? '99+' : taskCount.value) : '',
      },
    },
  ]);

  // 获取消息列表
  const fetchMessageList = async (params: { pageNum: number; pageSize: number }) => {
    const { startTime, endTime, urgency, useStatus, keyword } = filterObj.value;
    let requestParams: any = {
      startTime,
      endTime,
      keyword,
      messageType: msgType.value,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
    };

    if (msgType.value === 1) {
      // 通用任务
      requestParams.emergencyLevel = (urgency as any)?.value;
      requestParams.useStatus = (useStatus as any)?.value;
      requestParams.receiveSendFlag = taskType.value === 1 ? 1 : 0;
    } else {
      // 工作流
      requestParams.useStatus = (useStatus as any)?.value;
      requestParams.menuLevelTwoList = activeIds.value.filter((active: number) => active > 0);
      const lockItem = tagItems.value.filter((item: any) => item.id === '110003');
      const conTypeStrCGList: any = [];
      const conTypeStrYWList: any = [];
      if (lockItem[0] && lockItem[0].children.length) {
        lockItem[0].children.forEach((ele: any) => {
          if (ele.lockId && activeIds.value.includes(ele.id)) {
            if (ele.lockId === 437) {
              conTypeStrYWList.push(ele.lockText);
            } else {
              conTypeStrCGList.push(ele.lockText);
            }
            const idx = requestParams.menuLevelTwoList.indexOf(ele.id);
            requestParams.menuLevelTwoList.splice(idx, 1);
            if (!requestParams.menuLevelTwoList.includes(ele.lockId)) {
              requestParams.menuLevelTwoList.push(ele.lockId);
            }
          }
        });
      }
      requestParams.conTypeStrCGList = conTypeStrCGList;
      requestParams.conTypeStrYWList = conTypeStrYWList;
    }

    const res = await MessageService.getCrmMessageList(requestParams);

    return {
      list: res.list || [],
      total: res.total || 0,
    };
  };

  // 标签导航切换
  const handleLabelNavChange = (index: number) => {
    activeIndex.value = index;
    activeId.value = '';
  };

  // 标签选择
  const handleLabelSelect = (id: number | string) => {
    activeId.value = id;

    // 辅助函数：检查 id 是否在 activeIds 中（使用字符串比较）
    const isIdInActiveIds = (targetId: number | string) => {
      if (targetId === null || targetId === undefined) return false;
      const targetIdStr = String(targetId);
      return activeIds.value.some((active: any) => {
        if (active === null || active === undefined) return false;
        return String(active) === targetIdStr;
      });
    };

    // 辅助函数：从 activeIds 中移除 id
    const removeFromActiveIds = (targetId: number | string) => {
      if (targetId === null || targetId === undefined) return;
      const targetIdStr = String(targetId);
      const index = activeIds.value.findIndex((active: any) => {
        if (active === null || active === undefined) return false;
        return String(active) === targetIdStr;
      });
      if (index !== -1) {
        activeIds.value.splice(index, 1);
      }
    };

    // 辅助函数：添加到 activeIds（如果不存在）
    const addToActiveIds = (targetId: number | string) => {
      if (!isIdInActiveIds(targetId)) {
        activeIds.value.push(targetId);
      }
    };

    // 辅助函数：检查"全部"项是否应该显示为选中（通过检查所有子项是否都被选中）
    const isAllItemSelected = (allItemId: number | string, currentItem: any) => {
      // 如果"全部"项本身在 activeIds 中，直接返回 true
      if (isIdInActiveIds(allItemId)) {
        return true;
      }
      // 检查是否所有子项（id > 0）都被选中
      const positiveChildren = currentItem.children.filter((item: any) => Number(item.id) > 0);
      if (positiveChildren.length === 0) return false;
      return positiveChildren.every((item: any) => isIdInActiveIds(item.id));
    };

    if (Number(id) < 0) {
      // "全部"项的处理
      const currentItem = tagItems.value[activeIndex.value];
      if (!currentItem) return;

      // 使用 isAllItemSelected 来判断是否应该显示为选中
      const isSelected = isAllItemSelected(id, currentItem);

      if (isSelected) {
        // 取消选中全部
        if (Number(id) === -11) {
          // 移除所有项
          activeIds.value = [];
          activeId.value = '';
        } else {
          // 移除当前分类的"全部"项和所有子项
          // 先移除所有子项（id > 0），避免"全部"项因为子项还在而继续显示为选中
          currentItem.children.forEach((item: any) => {
            if (Number(item.id) > 0) {
              removeFromActiveIds(item.id);
            }
          });
          // 再移除"全部"项本身
          removeFromActiveIds(id);
          // 清空 activeId，避免单选模式下的显示问题
          if (activeId.value === id) {
            activeId.value = '';
          }
        }
      } else {
        // 选中全部
        if (Number(id) === -11) {
          // 选中所有分类的所有子项
          activeIds.value = [];
          tagItems.value.forEach((item: any) => {
            if (item.children) {
              item.children.forEach((child: any) => {
                if (Number(child.id) > 0) {
                  activeIds.value.push(child.id);
                }
              });
            }
          });
          // 将"全部"项本身也添加进去
          addToActiveIds(id);
        } else {
          // 选中当前分类的"全部"和所有子项
          // 先添加所有子项（id > 0）
          currentItem.children.forEach((item: any) => {
            if (Number(item.id) > 0) {
              addToActiveIds(item.id);
            }
          });
          // 再添加"全部"项本身
          addToActiveIds(id);
        }
      }
    } else if (Number(id) > 0) {
      // 单个标签选择
      const currentItem = tagItems.value[activeIndex.value];
      if (!currentItem) return;

      if (isIdInActiveIds(id)) {
        // 取消选中
        removeFromActiveIds(id);
        // 如果当前点击的项是 activeId，清空它
        if (activeId.value === id) {
          activeId.value = '';
        }

        // 如果取消选中后，当前分类的所有子项都不在 activeIds 中，则移除该分类的"全部"项
        const allItem = currentItem.children.find((item: any) => Number(item.id) < 0);
        if (allItem) {
          // 重新检查是否还有选中的子项（在移除当前项之后）
          const hasSelectedChild = currentItem.children.some(
            (item: any) => Number(item.id) > 0 && isIdInActiveIds(item.id)
          );
          if (!hasSelectedChild) {
            // 移除"全部"项
            removeFromActiveIds(allItem.id);
            // 如果"全部"项是 activeId，也清空它
            if (activeId.value === allItem.id) {
              activeId.value = '';
            }
          }
        }
      } else {
        // 选中
        addToActiveIds(id);

        // 如果当前分类的所有子项（id > 0）都被选中，则自动选中该分类的"全部"项
        const allItem = currentItem.children.find((item: any) => Number(item.id) < 0);
        if (allItem && Number(allItem.id) !== -11) {
          const positiveChildren = currentItem.children.filter((item: any) => Number(item.id) > 0);
          // 检查是否所有子项都被选中（包括刚刚添加的这个）
          const allSelected =
            positiveChildren.length > 0 &&
            positiveChildren.every((item: any) => isIdInActiveIds(item.id));
          if (allSelected) {
            addToActiveIds(allItem.id);
          }
        }
      }
    }
  };

  // 确认标签筛选
  const handleConfirmTag = () => {
    showTag.value = false;
  };

  // 切换任务类型
  const changeTaskType = (type: number) => {
    filterObj.value = {
      startTime: '',
      endTime: '',
      urgency: {},
      useStatus: {},
      keyword: '',
    };
    taskType.value = type;
  };

  // 筛选条件变化
  const handleFilterChange = (filterVal: any) => {
    filterObj.value = filterVal;
  };

  // 标签页切换
  const handleTabChange = ({ index }: { index: number }) => {
    msgType.value = index === 0 ? 2 : 1;
    filterObj.value = {
      startTime: '',
      endTime: '',
      urgency: {},
      useStatus: {},
      keyword: '',
    };
    activeIds.value = [];
    activeIndex.value = 0;
    activeId.value = '';
    taskType.value = 2;
  };

  // 跳转工作流详情
  const toFlowDetail = async (data: any) => {
    // 1. 优先处理已读状态 (点击即已读，无论后续跳转是否成功)
    if (data.useStatus === 2) {
      await MessageService.readMessage({ cmsId: data.cmsId });
      data.useStatus = 1;

      // 更新 Store，依赖 watch 自动同步更新本地 flowCount/taskCount
      appStore.setMsgObj({
        unReadMsgCount: (appStore.msgObj?.unReadMsgCount || 0) - 1,
        wordflowUnReadMsgCount: flowCount.value - 1,
        commonTaskUnReadMsgCount: taskCount.value,
      });
    }

    if (!data.url) {
      showToast('该消息暂时无法跳转');
      return;
    }

    // 2. 解析 URL，支持旧版 Hash 路由映射、新版路由、非 Hash 路径
    const targetUrl = resolveMessageUrl(data.url);

    // 3. 执行内部跳转
    if (targetUrl) {
      router.push(targetUrl);
      return;
    }

    // 非 H5 环境提示无法打开
    // @ts-ignore
    if (typeof uni !== 'undefined' && !isH5()) {
      showToast('不支持的链接格式');
    } else {
      window.location.href = data.url;
    }
  };

  // 跳转任务详情
  const toDetail = async (data: any) => {
    if (!data.csoId) {
      showToast('历史消息暂时无法跳转');
      return;
    }
    if (taskType.value === 2 && data.useStatus === 2) {
      await MessageService.readMessage({ cmsId: data.cmsId });
      data.useStatus = 1;
      appStore.setMsgObj({
        unReadMsgCount: (appStore.msgObj?.unReadMsgCount || 0) - 1,
        wordflowUnReadMsgCount: flowCount.value,
        commonTaskUnReadMsgCount: taskCount.value - 1,
      });
      taskCount.value -= 1;
    }
    appStore.setDetailObj({ type: taskType.value, csoId: data.csoId });
    appStore.setHadDoneOnDetail(false);
    router.push(RouteMap.taskDetail);
  };

  // 跳转发布任务
  const toPublish = () => {
    appStore.setHadDoneOnDetail(false);
    router.push(RouteMap.taskPublish);
  };

  // 获取未读消息数
  const getUnread = async () => {
    const res1 = await MessageService.getUnReadCount({ messageType: '2' });
    flowCount.value = res1 || 0;
    const res2 = await MessageService.getUnReadCount({ messageType: '1' });
    taskCount.value = res2 || 0;
  };

  // 全部标记已读
  const readAll = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      showModal({
        title: '提示',
        content: '确定全部标记已读?',
        showCancel: true,
        confirmColor: appStore.theme.color.main,
        success: async res => {
          if (res.confirm) {
            try {
              await MessageService.readMessage({ messageType: String(msgType.value) });
              showSuccess('标记成功');
              const unReadMsgCount =
                msgType.value === 2
                  ? (appStore.msgObj?.unReadMsgCount || 0) - flowCount.value
                  : (appStore.msgObj?.unReadMsgCount || 0) - taskCount.value;
              appStore.setMsgObj({
                unReadMsgCount,
                wordflowUnReadMsgCount: msgType.value === 2 ? 0 : flowCount.value,
                commonTaskUnReadMsgCount: msgType.value === 1 ? 0 : taskCount.value,
              });
              if (msgType.value === 2) {
                flowCount.value = 0;
              } else {
                taskCount.value = 0;
              }
              resolve();
            } catch (error) {
              reject(error);
            }
          } else {
            reject(new Error('用户取消'));
          }
        },
      });
    });
  };

  // 初始化标签数据
  const initTagItems = () => {
    const ywzx = (userStore.menu as any)?.ywzx;
    if (!ywzx) return;

    tagItems.value = Object.keys(ywzx).map((key: string) => {
      const item = ywzx[key];
      let children: any = [];
      if (item.arr && item.arr.length) {
        item.arr.forEach((ele: any) => {
          children.push({
            id: ele.pmsId === 437 || ele.pmsId === 445 ? +`${ele.pmsId}${ele.type}` : ele.pmsId,
            text:
              ele.pmsId === 437
                ? `${ele.pmsName}(业务)`
                : ele.pmsId === 445
                  ? `${ele.pmsName}(采购)`
                  : ele.pmsName,
            lockId: ele.pmsId === 437 || ele.pmsId === 445 ? ele.pmsId : '',
            lockText: ele.pmsId === 437 || ele.pmsId === 445 ? ele.pmsName : '',
          });
        });
      }
      return {
        id: key,
        text: item.title[0],
        children: [
          {
            id: -Number(key) - 2,
            text: '全部',
          },
          ...children,
        ],
      };
    });

    tagItems.value.unshift({
      id: 1,
      text: '全部',
      children: [
        {
          id: -11,
          text: '全部',
        },
      ],
    });

    console.log(tagItems.value, 'tagItems.value');
  };

  // 初始化
  const init = () => {
    msgType.value = 2;
    taskType.value = 2;
    filterObj.value = {
      startTime: '',
      endTime: '',
      urgency: {},
      useStatus: {},
      keyword: '',
    };
  };

  // 监听消息对象变化
  watch(
    () => appStore.msgObj,
    (val: any) => {
      if (val?.wordflowUnReadMsgCount !== undefined) {
        flowCount.value = val.wordflowUnReadMsgCount;
      }
      if (val?.commonTaskUnReadMsgCount !== undefined) {
        taskCount.value = val.commonTaskUnReadMsgCount;
      }
    },
    { deep: true, immediate: true }
  );

  return {
    // 状态
    msgType,
    taskType,
    showTag,
    tagItems,
    activeIds,
    activeIndex,
    activeId,
    flowCount,
    taskCount,
    filterObj,
    tabCurrent,
    tabList,
    // 方法
    fetchMessageList,
    handleLabelNavChange,
    handleLabelSelect,
    handleConfirmTag,
    changeTaskType,
    handleFilterChange,
    handleTabChange,
    toFlowDetail,
    toDetail,
    toPublish,
    getUnread,
    readAll,
    initTagItems,
    init,
  };
}
