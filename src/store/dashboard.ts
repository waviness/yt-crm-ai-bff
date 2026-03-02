export const useDashboardStore = defineStore('dashboard', () => {
  const sybOriginList = ref<any[]>([]); // 事业部List
  const xszxOriginList = ref<any[]>([]); // 销售中心List
  const bmList = ref<any[]>([]); // 部门List
  const bmChildList = ref<any[]>([]); // 子部门List
  const labelTreeList = ref<any[]>([]); // 子部门List
  const selectDeptFlag = ref<boolean>(false); // 选择部门标志
  const customerTrendDetail = reactive({
    // 客户趋势详情
    value: {}, // 将 value 作为对象的一个属性
  });
  const visitDetail = ref({
    // 拜访详情
  });
  const dateTime = ref<string>(time.format(time.add(new Date(), 0, 'year'), time.FORMATS.ISO_DATE));
  const visitFilterParams = reactive({
    companyIdOrName: '',
    userIdOrName: '',
    labelIdList: [],
    labelId: '',
    labelText: '',
    taskType: '',
    userIdList: [],
    startTime: '',
    endTime: '',
  });
  // 处理部门数据的通用函数
  const processDeptData = (data: any[], level: number) => {
    const list: any[] = [];
    if (!data || data.length === 0) return list;

    data.forEach((element1: any) => {
      if (element1.deptVO && element1.deptVO.length > 0) {
        // 有子部门的情况
        element1.deptVO.forEach((element2: any) => {
          const item: any = {
            deptId: element2.deptId.toString(),
            deptName: element2.deptName,
            deptLevel: +level,
            parentId: element1.parentId,
            parentName: element1.parentName,
          };

          // level 3 和 4 需要添加 isChild 属性
          if (level === 3 || level === 4) {
            item.isChild = element2.sonDeptNum ? true : false;
          }

          list.push(item);
        });
      } else {
        // 没有子部门的情况
        const item: any = {
          deptId: element1.deptId.toString(),
          deptName: element1.deptName,
          deptLevel: +level,
        };

        // level 1 和 2 可能需要 parentId 和 parentName
        if (level === 1 || level === 2) {
          if (element1.parentId) item.parentId = element1.parentId;
          if (element1.parentName) item.parentName = element1.parentName;
        }

        // level 3 和 4 需要添加 isChild 属性
        if (level === 3 || level === 4) {
          item.isChild = element1.sonDeptNum ? true : false;
          if (element1.parentId) item.parentId = element1.parentId;
          if (element1.parentName) item.parentName = element1.parentName;
        }

        list.push(item);
      }
    });

    return list;
  };

  // 获取事业部List
  const _getsybOriginList = async () => {
    try {
      const res: any = await DashboardService.queryDataDeptByType('1');
      if (res.code == 200 && res.data) {
        sybOriginList.value = processDeptData(res.data, 1);
      }
    } catch (error) {
      console.error('获取事业部列表失败:', error);
    }
  };

  // 获取销售中心List
  const _getxszxOriginList = async () => {
    try {
      const res: any = await DashboardService.queryDataDeptByType('2');
      if (res.code == 200 && res.data) {
        xszxOriginList.value = processDeptData(res.data, 2);
      }
    } catch (error) {
      console.error('获取销售中心列表失败:', error);
    }
  };

  // 获取部门List
  const _getbmList = async () => {
    try {
      const res: any = await DashboardService.queryDataDeptByType('3');
      if (res.code == 200 && res.data) {
        bmList.value = processDeptData(res.data, 3);
      }
    } catch (error) {
      console.error('获取部门列表失败:', error);
    }
  };

  // 获取子部门List
  const _getbmChildList = async () => {
    try {
      const res: any = await DashboardService.queryDataDeptByType('4');
      if (res.code == 200 && res.data) {
        bmChildList.value = processDeptData(res.data, 4);
      }
    } catch (error) {
      console.error('获取子部门列表失败:', error);
    }
  };
  const _getLabelTree = async () => {
    await CommonService.getLabelTree({ type: 1 }).then((res: any) => {
      labelTreeList.value = res;
    });
  };
  const setDateTime = (newDateTime: string) => {
    dateTime.value = newDateTime;
  };
  const setCustomerTrendDetail = (detail: any) => {
    customerTrendDetail.value = detail;
  };
  const setVisitFilterParams = (params: any) => {
    console.log(params);
    visitFilterParams.companyIdOrName = params.companyIdOrName;
    visitFilterParams.userIdOrName = params.userIdOrName;
    visitFilterParams.labelIdList = params.labelIdList;
    visitFilterParams.startTime = params.startTime;
    visitFilterParams.endTime = params.endTime;
    visitFilterParams.taskType = params.taskType;
    visitFilterParams.userIdList = params.userIdList;
  };
  const setVisitDetail = (detailObj: any) => {
    visitDetail.value = detailObj;
  };
  const setSelectDeptFlag = (flag: boolean) => {
    selectDeptFlag.value = flag;
  };
  const setSybOriginList = (list: any[]) => {
    sybOriginList.value = list;
  };
  const setXszxOriginList = (list: any[]) => {
    xszxOriginList.value = list;
  };
  const setBmList = (list: any[]) => {
    bmList.value = list;
  };
  const setBmChildList = (list: any[]) => {
    bmChildList.value = list;
  };
  return {
    sybOriginList,
    xszxOriginList,
    bmList,
    bmChildList,
    dateTime,
    customerTrendDetail,
    visitFilterParams,
    visitDetail,
    labelTreeList,
    selectDeptFlag,
    _getsybOriginList,
    _getxszxOriginList,
    _getbmList,
    _getbmChildList,
    _getLabelTree,
    setDateTime,
    setCustomerTrendDetail,
    setVisitFilterParams,
    setVisitDetail,
    setSybOriginList,
    setXszxOriginList,
    setBmList,
    setBmChildList,
    setSelectDeptFlag,
  };
});
