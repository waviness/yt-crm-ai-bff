/**
 * 任务发送/接收列表页面业务逻辑
 */
import { TaskService } from '@/api/task';
import { useAppStore } from '@/store/app';

const statusOptions = [
  { value: '', name: '全部' },
  { value: 1, name: '未读' },
  { value: 2, name: '已读' },
  { value: 0, name: '作废' },
];

const sendStatusOptions = [
  { value: '', name: '全部' },
  { value: 1, name: '进行中' },
  { value: 2, name: '已完成' },
  { value: 0, name: '已作废' },
];

export function useTaskSend() {
  const appStore = useAppStore();

  // ========== 业务状态：筛选条件 ==========
  const taskType = ref(2); // 2我收到的 1我发出的
  const taskStatus = ref<any>('');
  const taskStatusName = ref('全部');
  const keywords = ref('');
  const statusShow = ref(false);

  // ========== 业务逻辑：数据获取 ==========
  const fetchTaskList = async (params: { pageNum: number; pageSize: number }) => {
    const requestParams = {
      ...params,
      status: taskStatus.value,
      search: keywords.value,
    };

    const res =
      taskType.value === 2
        ? await TaskService.queryReceive(requestParams)
        : await TaskService.querySend(requestParams);

    // 处理发出的任务，计算已回执数量
    if (taskType.value === 1) {
      res.list?.forEach((item: any) => {
        let hasReply = 0;
        item.sendList?.forEach((sendItem: any) => {
          if (sendItem.content) {
            hasReply++;
          }
        });
        item.hasReply = hasReply;
      });
    }

    return {
      list: res.list || [],
      total: res.total || 0,
    };
  };

  // 切换任务类型
  const changeTaskType = (type: number, resetAndFetchData: () => Promise<void>) => {
    taskType.value = type;
    taskStatus.value = '';
    taskStatusName.value = '全部';
    resetAndFetchData();
  };

  // 选择状态
  const onSelectStatus = (action: any, resetAndFetchData: () => Promise<void>) => {
    statusShow.value = false;
    taskStatus.value = action.value;
    taskStatusName.value = action.name;
    resetAndFetchData();
  };

  // 前往发布页面
  const toPublish = () => {
    appStore.setHadDoneOnDetail(false);
    router.push(RouteMap.taskPublish);
  };

  // 作废任务
  const cancelTask = async (item: any, resetAndFetchData: () => Promise<void>) => {
    await TaskService.deleteTaskApproval({ csoId: item.csoId });
    showSuccess('作废成功');
    item.useStatus = 0;
    resetAndFetchData();
  };

  // 再次发起
  const resendTask = (item: any) => {
    router.push(RouteMap.taskPublish, { detail: JSON.stringify(item) });
  };

  // 前往详情
  const toDetail = async (item: any) => {
    if (taskType.value === 2 && item.useStatus === 1) {
      await TaskService.modifyReceiveStatus({ csodId: item.csodId });
      item.useStatus = 2;
    }

    appStore.setDetailObj({ type: taskType.value, csoId: item.csoId });
    appStore.setHadDoneOnDetail(false);
    router.push(RouteMap.taskDetail);
  };

  return {
    // 状态
    taskType,
    taskStatus,
    taskStatusName,
    keywords,
    statusShow,
    statusOptions,
    sendStatusOptions,

    // 方法
    fetchTaskList,
    changeTaskType,
    onSelectStatus,
    toPublish,
    cancelTask,
    resendTask,
    toDetail,
  };
}
