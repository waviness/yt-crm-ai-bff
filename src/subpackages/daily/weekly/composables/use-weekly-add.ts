/**
 * 周报新增 Composable
 * 按页面轻复用原则，仅用于 add.vue
 */
import { useWeeklyReportOperations } from './use-weekly-report-operations';

// 默认添加项模板
const ADD_LIST_TEMPLATE = {
  firstLabelTypeId: '',
  firstLabelTypeName: '',
  labelTypeId: '',
  labelTypeText: '',
  exceptTimeStr: '',
  objTypeId: '',
  objTypeText: '',
  objId: '',
  objName: '',
  labelRemark: '',
};

// 任务类型选项
const needOptions = [
  { name: '客户拜访', id: 10052, text: '客户拜访' },
  { name: '品种进院', id: 10051, text: '品种进院' },
  { name: '厂家协同', id: 10050, text: '厂家协同' },
  { name: '货款催收', id: 10049, text: '货款催收' },
  { name: '其他事务', id: 10048, text: '其他事务' },
];

const needOptions1 = [
  { name: '市场调研', id: 10063, text: '市场调研' },
  { name: '区域开发', id: 10052, text: '区域开发' },
  { name: '部门交办', id: 10064, text: '部门交办' },
];

// 单位类型选项
const objTypeActions = [
  { name: '下游客户', typeNum: 1, id: 2, text: '下游客户' },
  { name: '政府单位', typeNum: 34, id: 3, text: '政府单位' },
  { name: '供应商', typeNum: 11, id: 1, text: '供应商' },
];

export function useWeeklyAdd(cwrdocId: Ref<string>) {
  console.log('useWeeklyAdd', cwrdocId.value);
  const { saveReport } = useWeeklyReportOperations();
  const appStore = useAppStore();

  // 表单数据
  const addList = ref<any[]>([{ ...ADD_LIST_TEMPLATE }]);
  const addOpIndex = ref(0);
  const labelTreeList = ref<any[]>([]);
  const isSubmit = ref(false);

  // 弹窗状态
  const labelShow = ref(false);
  const activeId = ref(-1);
  const activeIndex = ref(0);
  const objTypeShowPicker = ref(false);
  const objShowPicker = ref(false);
  const labelShowPicker = ref(false);
  const labelShowPicker1 = ref(false);

  // 单位选择相关状态（从 useWeeklyObjectSelect 合并）
  const loading = ref(false);
  const finished = ref(false);
  const page = ref(1);
  const objSearchValue = ref('');
  const custlistOptions = ref<any[]>([]);
  const goverListOptions = ref<any[]>([]);
  const providerInforOptions = ref<any[]>([]);

  /**
   * 获取并格式化标签树（从 useWeeklyLabelTree 合并）
   */
  const getLabelTree = async (type: string = '0') => {
    const params = { type };
    const res = await CommonService.getLabelTree(params);

    return res.map((item: any) => {
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
  };

  /**
   * 搜索单位信息（从 useWeeklyObjectSelect 合并）
   */
  const objSearch = (objTypeId: number) => {
    page.value = 1;
    providerInforOptions.value = [];
    custlistOptions.value = [];
    goverListOptions.value = [];
    finished.value = false;
    onLoad(objTypeId);
  };

  /**
   * 刷新数据（从 useWeeklyObjectSelect 合并）
   */
  const onRefresh = (objTypeId: number) => {
    finished.value = false;
    objSearchValue.value = '';
    page.value = 1;
    // 清空现有数据
    providerInforOptions.value = [];
    custlistOptions.value = [];
    goverListOptions.value = [];
    onLoad(objTypeId);
  };

  /**
   * 加载数据（从 useWeeklyObjectSelect 合并）
   */
  const onLoad = async (objTypeId: number) => {
    if (loading.value || finished.value) return;

    loading.value = true;

    try {
      if (objTypeId === 1) {
        await queryProviderForVisit();
      } else if (objTypeId === 2) {
        await queryCustListByUserId();
      } else if (objTypeId === 3) {
        await getGoverList();
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 客户请求（从 useWeeklyObjectSelect 合并）
   */
  const queryCustListByUserId = async () => {
    const params = {
      pageNum: page.value,
      pageSize: 10,
      cust: objSearchValue.value,
      type: 1,
    };

    const res = await CustomerFollowService.queryCustListByUserId(params);
    custlistOptions.value = page.value === 1 ? res.list : [...custlistOptions.value, ...res.list];

    if (!res.hasNextPage) {
      finished.value = true;
    } else {
      page.value++;
    }
  };

  /**
   * 供应商请求（从 useWeeklyObjectSelect 合并）
   */
  const queryProviderForVisit = async () => {
    const params = {
      providerNameOrId: objSearchValue.value,
      useridList: [],
      pageSize: 10,
      pageNum: page.value,
    };

    const res = await CustomerFollowService.queryProviderForVisit(params);
    providerInforOptions.value =
      page.value === 1 ? res.list : [...providerInforOptions.value, ...res.list];

    if (!res.hasNextPage) {
      finished.value = true;
    } else {
      page.value++;
    }
  };

  /**
   * 政府请求（从 useWeeklyObjectSelect 合并）
   */
  const getGoverList = async () => {
    const params = {
      orgnizationKeyword: objSearchValue.value,
    };

    const res = await CustomerFollowService.queryGovernmentForVisit(params);
    goverListOptions.value = res;
    finished.value = true;
  };

  /**
   * 重置单位选择状态（从 useWeeklyObjectSelect 合并）
   */
  const resetObjectSelect = () => {
    page.value = 1;
    objSearchValue.value = '';
    custlistOptions.value = [];
    goverListOptions.value = [];
    providerInforOptions.value = [];
    finished.value = false;
    loading.value = false;
  };

  // 打开标签选择
  const openLabelSelect = (index: number) => {
    addOpIndex.value = index;
    labelShow.value = true;
  };

  // 打开单位类型选择
  const openObjTypeSelect = (index: number) => {
    addOpIndex.value = index;
    objTypeShowPicker.value = true;
  };

  // 打开单位选择
  const openObjSelect = (index: number) => {
    if (!addList.value[index].objTypeId) {
      showToast('请先选择单位类型');
      return;
    }
    addOpIndex.value = index;
    resetObjectSelect();
    const currentItem = addList.value[addOpIndex.value];
    onRefresh(currentItem.objTypeId);
    objShowPicker.value = true;
  };

  // 打开任务类型选择
  const openTaskTypeSelect = (index: number, type: number) => {
    addOpIndex.value = index;
    if (type === 1) {
      labelShowPicker.value = true;
    } else {
      labelShowPicker1.value = true;
    }
  };

  // 单位类型选择
  const objTypeSelect = (val: any) => {
    const currentItem = addList.value[addOpIndex.value];

    if (currentItem.objTypeId !== val.id && currentItem.objId) {
      showModal({
        content: '切换单位类型将清空已有单位信息，确定要切换吗？',
        success: res => {
          if (res.confirm) {
            currentItem.objTypeId = val.id;
            currentItem.objTypeText = val.name;
            currentItem.objId = '';
            currentItem.objName = '';
          }
        },
      });
    } else {
      currentItem.objTypeId = val.id;
      currentItem.objTypeText = val.name;
    }
  };

  // 任务类型选择
  const labelTypeSelect = (val: any) => {
    const currentItem = addList.value[addOpIndex.value];
    currentItem.objId = val.id;
    currentItem.objName = val.name;
  };

  // 标签导航选择（左侧分类点击）
  const handleLabelNavChange = (index: number) => {
    const currentItem = addList.value[addOpIndex.value];
    const parentItem = labelTreeList.value[index];

    if (parentItem) {
      currentItem.firstLabelTypeId = parentItem.id;
      currentItem.firstLabelTypeName = parentItem.text;
    }
  };

  // 标签选择（右侧子项点击）
  const handleLabelSelect = (id: number) => {
    const currentItem = addList.value[addOpIndex.value];
    const parentItem = labelTreeList.value[activeIndex.value];

    if (parentItem) {
      currentItem.firstLabelTypeId = parentItem.id;
      currentItem.firstLabelTypeName = parentItem.text;
    }

    const childItem = parentItem?.children?.find((item: any) => item.id === id);
    if (childItem) {
      currentItem.labelTypeId = childItem.id;
      currentItem.labelTypeText = childItem.text;

      if (childItem.id === 10070 || childItem.id === 10074) {
        currentItem.objTypeId = 5;
      }
    }

    labelShow.value = false;
  };

  // 获取标签树
  const getLabelTreeData = async () => {
    labelTreeList.value = await getLabelTree('0');

    if (labelTreeList.value.length > 0) {
      addList.value[0].firstLabelTypeId = labelTreeList.value[0].id;
      addList.value[0].firstLabelTypeName = labelTreeList.value[0].text;
    }
  };

  // 单位信息搜索
  const handleObjSearch = () => {
    const currentItem = addList.value[addOpIndex.value];
    // 如果搜索值为空，则刷新数据
    if (!objSearchValue.value) {
      onRefresh(currentItem.objTypeId);
      return;
    }
    objSearch(currentItem.objTypeId);
  };

  // 加载数据
  const handleLoad = async () => {
    const currentItem = addList.value[addOpIndex.value];
    await onLoad(currentItem.objTypeId);
  };

  // 选择客户
  const changeCust = (item: any) => {
    const currentItem = addList.value[addOpIndex.value];
    currentItem.objId = item.custId;
    currentItem.objName = item.custName;
    objShowPicker.value = false;
  };

  // 选择供应商
  const changeProvider = (item: any) => {
    const currentItem = addList.value[addOpIndex.value];
    currentItem.objId = item.cpiId;
    currentItem.objName = item.providerName;
    objShowPicker.value = false;
  };

  // 选择政府
  const changeGover = (item: any) => {
    const currentItem = addList.value[addOpIndex.value];
    currentItem.objId = item.cgId;
    currentItem.objName =
      item.govAttributeId + '/' + item.govAttributeName + '(' + item.orgnizationName + ')';
    objShowPicker.value = false;
  };

  // 添加项目
  const addListClick = () => {
    const newItem = { ...ADD_LIST_TEMPLATE };
    if (labelTreeList.value.length > 0) {
      newItem.firstLabelTypeId = labelTreeList.value[0].id;
      newItem.firstLabelTypeName = labelTreeList.value[0].text;
    }
    addList.value.push(newItem);
  };

  // 删除项目
  const deleteItem = (index: number) => {
    showModal({
      content: '确定删除当前新增信息？',
      success: res => {
        if (res.confirm) {
          addList.value.splice(index, 1);
        }
      },
    });
  };

  // 提交
  const onSubmit = () => {
    if (addList.value.some((val: any) => !val.objId || !val.labelTypeId)) {
      showToast('请完善必填项');
      return;
    }

    const params: any[] = [];
    addList.value.forEach((item: any) => {
      params.push({
        tableType: item.labelTypeId === 10070 || item.labelTypeId === 10074 ? 4 : 3,
        cwrdocId: cwrdocId.value,
        exceptTimeStr: item.exceptTimeStr,
        labelRemark: item.labelRemark,
        objId: item.objId,
        objName: item.objName,
        objType: item.objTypeId,
        firstClassType: item.firstLabelTypeId,
        firstClassName: item.firstLabelTypeName,
        secondClassType: item.labelTypeId,
        secondClassTypeName: item.labelTypeText,
      });
    });

    saveReport(params, () => {
      // 设置标记，通知列表页刷新
      appStore.setHadDoneOnDetail(true);
      router.back();
    });
  };

  // 取消
  const cancelClick = () => {
    router.back();
  };

  return {
    // 数据
    addList,
    addOpIndex,
    labelTreeList,
    isSubmit,
    needOptions,
    needOptions1,
    objTypeActions,
    // 弹窗状态
    labelShow,
    activeId,
    activeIndex,
    objTypeShowPicker,
    objShowPicker,
    labelShowPicker,
    labelShowPicker1,
    // 单位选择相关
    loading,
    finished,
    objSearchValue,
    custlistOptions,
    goverListOptions,
    providerInforOptions,
    // 方法
    openLabelSelect,
    openObjTypeSelect,
    openObjSelect,
    openTaskTypeSelect,
    objTypeSelect,
    labelTypeSelect,
    handleLabelNavChange,
    handleLabelSelect,
    getLabelTreeData,
    handleObjSearch,
    handleLoad,
    changeCust,
    changeProvider,
    changeGover,
    addListClick,
    deleteItem,
    onSubmit,
    cancelClick,
  };
}
