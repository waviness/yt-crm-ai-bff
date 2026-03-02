/**
 * 任务发布页面业务逻辑
 */
import { uploadSingleFile } from '@/utils/upload';
import type { UploadFileInfo } from '@/types/common';
const urgencyList = [
  { name: 1, label: '普通' },
  { name: 2, label: '重要' },
  { name: 3, label: '紧急' },
];

const isReturnList = [
  { name: 1, label: '需要' },
  { name: 0, label: '不需要' },
];

export function useTaskPublish() {
  const appStore = useAppStore();

  // 响应式数据
  const activeId = ref(-1);
  const activeIndex = ref(0);
  const labelTreeList = ref<any[]>([]);
  const loading = ref(false);
  const publishLoading = ref(false);
  const actionShow = ref(false);
  const personShow = ref(false);
  const minDate = ref(new Date(2010, 0, 1));
  const urgencyListData = ref(urgencyList);
  const isReturnListData = ref(isReturnList);
  const dateRange = ref<any[]>([]);
  const bigLabelValue = ref<any>({});
  const labelValue = ref<any>({});
  const urgency = ref(1);
  const isReturn = ref(1);
  const title = ref('');
  const content = ref('');
  const depTreeList = ref<any[]>([]); // 组织架构树结构
  const groupTreeList = ref<any[]>([]);
  const tagDataList = ref<any[]>([]); // 标签信息列表
  const active = ref(0);
  const sendPersons = ref<any[]>([]);
  const fileList = ref<any[]>([]);
  const searchTreeValue = ref('');
  const checkedTree = ref<any>({
    checkedDep: [],
    checkedTag: [],
    checkedGroup: [],
  });
  const idxKey = ref(1);

  // 计算属性
  const labelText = computed(() => {
    return labelValue.value.id ? `${bigLabelValue.value.text}/${labelValue.value.text}` : '';
  });

  const dateRangeText = computed(() => {
    return dateRange.value[0] ? `${dateRange.value[0]} 至 ${dateRange.value[1]}` : '';
  });

  const sendPersonsText = computed(() => {
    return sendPersons.value.length ? `${sendPersons.value.length}人` : '';
  });

  // 获取标签树
  const getLabelTree = async () => {
    const params = { type: '1' };
    const res = await CommonService.getLabelTree(params);

    labelTreeList.value = res.map((item: any) => {
      let children: any[] = [];
      if (item.CHILD_LIST?.length) {
        children = item.CHILD_LIST.map(({ LABEL_ID, LABEL_NAME }: any) => ({
          id: LABEL_ID,
          text: LABEL_NAME,
        }));
      }

      if (item.LABEL_ID === bigLabelValue.value.id) {
        bigLabelValue.value.text = item.LABEL_NAME;
      }

      return {
        id: item.LABEL_ID,
        text: item.LABEL_NAME,
        children,
      };
    });
  };

  // 获取组织架构tree信息
  const getDepTree = async () => {
    loading.value = true;
    const res = await TaskService.queryDepOrGroup({ type: 1 });
    depTreeList.value = formatTreeData(res);
    await getGroupTree();
    loading.value = false;
  };

  // 获取小组tree信息
  const getGroupTree = async () => {
    loading.value = true;
    const res = await TaskService.queryDepOrGroup({ type: 2 });
    groupTreeList.value = formatTreeDataWithoutUser(res);
    loading.value = false;
  };

  // 格式化树数据（包含用户）
  const formatTreeData = (list: any[]): any[] => {
    return list.map((item: any) => {
      const { depId, depName, childDeps, depUsers } = item;
      const childs = formatTreeData(childDeps || []);
      const users = (depUsers || []).map((ele: any) => {
        const { userId, userName } = ele;
        return {
          id: `${depId}-${userId}`,
          label: userName,
          isUser: 1,
          userId,
          userName,
          depId,
          depName,
        };
      });
      return {
        id: depId,
        label: depName,
        children: [...childs, ...users],
        depUsers: depUsers,
      };
    });
  };

  // 格式化树数据（不包含用户，用于小组）
  const formatTreeDataWithoutUser = (list: any[]): any[] => {
    return list.map((item: any) => {
      const { depId, depName, childDeps, depUsers } = item;
      const childs = formatTreeDataWithoutUser(childDeps || []);
      const users = (depUsers || []).map((userItem: any) => ({
        distributeId: depId,
        distribute: depName,
        orderType: 3,
        sendUserId: userItem.userId,
        sendUser: userItem.userName,
      }));
      return {
        id: depId,
        label: depName,
        children: [...childs],
        users,
      };
    });
  };

  // 查询标签信息
  const getTags = async () => {
    loading.value = true;
    tagDataList.value = [];
    const res = await TaskService.queryTag({});
    tagDataList.value = res.map((item: any) => {
      const { tagId, tagName, users } = item;
      const targetUsers = (users || []).map((userItem: any) => ({
        distributeId: tagId,
        distribute: tagName,
        orderType: 2,
        sendUserId: userItem.userId,
        sendUser: userItem.userName,
      }));
      return {
        id: tagId,
        label: tagName,
        targetUsers,
      };
    });
    loading.value = false;
  };

  // 日期改变
  const handleDateChange = (value: any) => {
    if (value?.range?.before && value?.range?.after) {
      dateRange.value = [value.range.before, value.range.after];
    } else {
      dateRange.value = [];
    }
  };

  // 标签改变
  const onLabelChange = (data: any) => {
    actionShow.value = false;
    labelValue.value = data;
    bigLabelValue.value = labelTreeList.value[activeIndex.value];
  };

  // 发送确认
  const onSendConfirm = (checkedPersons: any[]) => {
    sendPersons.value = checkedPersons;
    personShow.value = false;
  };

  // 验证器（用于表单验证）
  const validator = () => {
    return true;
  };

  // 表单验证失败
  const onFailed = (errorInfo: any) => {
    console.log('表单验证失败:', errorInfo);
  };

  // 文件读取后处理（适配 uview-plus upload 组件）
  const afterRead = async (event: any) => {
    const files = Array.isArray(event.file) ? event.file : [event.file];
    for (const file of files) {
      // 给文件添加唯一标识
      const fileIndex = `${file.file?.name || file.name || Date.now()}-${idxKey.value++}`;
      file.index = fileIndex;
      file.status = 'uploading';
      file.message = '上传中...';

      try {
        // uview-plus 的 file 结构可能是 { file: File } 或 { url: string }
        const fileObj = file.file || file;

        // 构建 UploadFileInfo 对象
        const uploadFileInfo: UploadFileInfo = {
          name: fileObj.name || file.name,
          size: fileObj.size || 0,
          type: fileObj.type || '',
          url:
            fileObj.url || (isH5() && fileObj instanceof File ? URL.createObjectURL(fileObj) : ''),
          status: 'uploading',
          file: isH5() && fileObj instanceof File ? fileObj : undefined,
          tempFilePath: fileObj.url || fileObj.tempFilePath,
        };

        // 使用公共方法上传文件
        const fileUrl = await uploadSingleFile(uploadFileInfo);

        // 解析返回的URL获取文件信息
        const urlParts = fileUrl.split('/');
        const fileName = urlParts[urlParts.length - 1] || uploadFileInfo.name;
        const nameParts = fileName.split('.');
        const suffix = nameParts.length > 1 ? nameParts.pop() : '';

        // 找到 fileList 中对应的文件并更新状态
        const index = fileList.value.findIndex(item => item.index === fileIndex);
        if (index !== -1) {
          // 如果文件已经在 fileList 中，更新它
          fileList.value[index] = {
            ...fileList.value[index],
            status: 'success',
            message: '上传成功',
            result: {
              fileName: nameParts.join('.'),
              suffix,
              fullPath: fileUrl,
            },
            fileName: nameParts.join('.'),
            fileType: suffix,
            url: fileUrl,
            fileUrl: fileUrl,
          };
        } else {
          // 如果文件不在 fileList 中，添加它
          fileList.value.push({
            ...file,
            status: 'success',
            message: '上传成功',
            result: {
              fileName: nameParts.join('.'),
              suffix,
              fullPath: fileUrl,
            },
            fileName: nameParts.join('.'),
            fileType: suffix,
            url: fileUrl,
            fileUrl: fileUrl,
          });
        }

        // 同时更新 file 对象本身（用于组件内部状态）
        file.status = 'success';
        file.message = '上传成功';
        file.result = {
          fileName: nameParts.join('.'),
          suffix,
          fullPath: fileUrl,
        };
        file.fileName = nameParts.join('.');
        file.fileType = suffix;
        file.url = fileUrl;
        file.fileUrl = fileUrl;

        console.log(fileList.value);
      } catch (err) {
        console.error('文件上传失败:', err);
        // 更新 fileList 中的状态
        const index = fileList.value.findIndex(item => item.index === fileIndex);
        if (index !== -1) {
          fileList.value[index] = {
            ...fileList.value[index],
            status: 'failed',
            message: err instanceof Error ? err.message : '上传失败',
          };
        }
        // 更新 file 对象本身
        file.status = 'failed';
        file.message = err instanceof Error ? err.message : '上传失败';
      }
    }
  };

  // 删除文件
  const removeFile = (file: any) => {
    fileList.value = fileList.value.filter((obj: any) => obj.index !== file.index);
  };

  // 提交
  const submit = async () => {
    const files = fileList.value.map((file: any) => {
      const { fileName, suffix, fullPath } = file.result || {};
      return {
        fileName,
        fileType: suffix,
        fileUrl: fullPath,
      };
    });

    const params = {
      bigTagId: bigLabelValue.value.id,
      smallTagId: labelValue.value.id,
      eventAgeingStart: dateRange.value[0] || '',
      eventAgeingEnd: dateRange.value[1] || '',
      emergencyLevel: urgency.value,
      isReturn: isReturn.value,
      orderTitle: title.value,
      orderContent: content.value,
      files,
      sendPersons: sendPersons.value,
      synergiaType: 0,
    };

    // 表单验证
    if (!params.smallTagId) {
      showToast('事件分类不能为空');
      return;
    }
    if (!params.emergencyLevel) {
      showToast('紧急程度不能为空');
      return;
    }
    if (!(+params.isReturn === 0 || +params.isReturn === 1)) {
      showToast('是否需要回执不能为空');
      return;
    }
    if (!params.sendPersons.length) {
      showToast('发送至不能为空');
      return;
    }
    if (!params.orderTitle) {
      showToast('标题不能为空');
      return;
    }
    if (!params.orderContent) {
      showToast('内容不能为空');
      return;
    }

    publishLoading.value = true;
    await TaskService.addTaskApproval(params);
    appStore.setHadDoneOnDetail(true);
    showSuccess('发送成功');
    setTimeout(() => {
      router.back();
    }, 500);
    publishLoading.value = false;
  };

  // 返回
  const goBack = () => {
    router.back();
  };

  // 初始化（编辑模式）
  const initEditMode = (taskDetail: any) => {
    if (taskDetail) {
      urgency.value = taskDetail.emergencyLevel;
      isReturn.value = taskDetail.isReturn;
      dateRange.value = [taskDetail.eventAgeingStart, taskDetail.eventAgeingEnd];
      bigLabelValue.value = {
        id: taskDetail.bigTagId,
      };
      labelValue.value = {
        id: taskDetail.smallTagId,
        text: taskDetail.smallTag,
      };
      title.value = taskDetail.orderTitle;
      content.value = taskDetail.orderContent;

      fileList.value = (taskDetail.files || []).map(
        ({ fileName, fileType, fileUrl }: any, idx: number) => ({
          fileName,
          fileType,
          fileUrl,
          index: `${fileName}-${idx}`,
          result: {
            fileName,
            suffix: fileType,
            fullPath: fileUrl,
          },
        })
      );

      idxKey.value = fileList.value.length;
      sendPersons.value = [];
      checkedTree.value = {
        checkedDep: [],
        checkedTag: [],
        checkedGroup: [],
      };

      if (taskDetail.sendList) {
        taskDetail.sendList.forEach(({ sendUserId, sendUserName, sendTypeList }: any) => {
          sendTypeList?.forEach(({ distributeId, distribute, orderType }: any) => {
            sendPersons.value.push({
              distributeId,
              distribute,
              orderType,
              sendUserId,
              sendUser: sendUserName,
            });
            if (orderType === 1) {
              checkedTree.value.checkedDep.push(`${distributeId}-${sendUserId}`);
            } else if (orderType === 2 && !checkedTree.value.checkedTag.includes(distributeId)) {
              checkedTree.value.checkedTag.push(distributeId);
            } else if (orderType === 3 && !checkedTree.value.checkedGroup.includes(distributeId)) {
              checkedTree.value.checkedGroup.push(distributeId);
            }
          });
        });
      }
    }
  };

  // 初始化
  const init = async (detail: any) => {
    if (detail) {
      initEditMode(detail);
    }
    await Promise.all([getLabelTree(), getDepTree(), getTags()]);
  };

  return {
    // 状态
    activeId,
    activeIndex,
    labelTreeList,
    loading,
    publishLoading,
    actionShow,
    personShow,
    minDate,
    urgencyList: urgencyListData,
    isReturnList: isReturnListData,
    dateRange,
    bigLabelValue,
    labelValue,
    urgency,
    isReturn,
    title,
    content,
    depTreeList,
    groupTreeList,
    tagDataList,
    active,
    sendPersons,
    fileList,
    searchTreeValue,
    checkedTree,
    idxKey,
    labelText,
    dateRangeText,
    sendPersonsText,

    // 方法
    handleDateChange,
    onLabelChange,
    onSendConfirm,
    validator,
    onFailed,
    afterRead,
    removeFile,
    submit,
    goBack,
    init,
  };
}
