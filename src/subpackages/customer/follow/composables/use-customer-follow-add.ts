/**
 * 客户随访新增 Composable
 */
const CUSTOM_DATA = {
  changeTime: '',
  visitType: '1',
  objTypeValue: -1,
  visitUserName: '',
  visitUserId: '',
  objName: '',
  objId: '',
  staffMemberId: '',
  staffMemberName: '',
  addressValue: '',
  addressDeatilValue: '',
};

export function useCustomerFollowAdd() {
  const appStore = useAppStore();
  const userStore = useUserStore();

  // 表单数据
  const customerData = ref<any>({ ...CUSTOM_DATA });
  const staffMemberCheckDetail = ref<any[]>([]);
  const activeName = ref(0);

  // 弹窗状态
  const timeShowPicker = ref(false);
  const objTypeShowPicker = ref(false);
  const visitUserShow = ref(false);
  const objShowPicker = ref(false);
  const staffMemberShow = ref(false);
  const showAdressPicker = ref(false);
  const customerLabelShow = ref(false);

  // 时间相关
  const timeValue = ref(time.getHourTimestamp(new Date()));
  const minDate = ref(new Date(2019, 0, 1).getTime());
  const maxDate = ref(new Date().getTime());

  // 协访人相关
  const visitUserValue = ref('');
  const visitUserLoading = ref(false);
  const userOptions = ref<any[]>([]);
  const visitUserCheck = ref<any[]>([]);
  const visitUserLoaded = ref(false); // 标记是否已加载过协访人员列表
  const visitUserOriginalList = ref<any[]>([]); // 保存原始协访人员列表
  const visitUserSearchResult = ref<{ keyword: string; list: any[] } | null>(null); // 保存搜索结果
  const visitUserContentReady = ref(false); // 控制内容延迟渲染

  // 单位类型
  const objTypeActions = ref([
    { name: '下游客户', typeNum: 1, id: 2 },
    { name: '政府单位', typeNum: 34, id: 3 },
    { name: '供应商', typeNum: 11, id: 1 },
  ]);

  // 单位相关
  const objSearchValue = ref('');
  const custlistOptions = ref<any[]>([]);
  const goverListOptions = ref<any[]>([]);
  const providerInforOptions = ref<any[]>([]);

  // 职员相关
  const staffMemberValue = ref('');
  const staffMemberCheck = ref<any[]>([]);
  const personList = ref<any[]>([]);

  // 标签树
  const labelTreeList = ref<any[]>([]);

  // 使用分页 composable（用于单位选择）
  const {
    list: unitList,
    totalNum: unitTotalNum,
    paginationLoading: unitLoading,
    resetAndFetchData: resetUnitData,
    loadMore: loadMoreUnit,
  } = useSimplePagination<any>(20);

  /**
   * 获取标签树
   */
  const getLabelTree = async () => {
    const res = await CommonService.getLabelTree({ type: '1' });
    labelTreeList.value = res.map((item: any) => ({
      id: item.LABEL_ID,
      text: item.LABEL_NAME,
      children: (item.CHILD_LIST || []).map((child: any) => ({
        id: child.LABEL_ID,
        text: child.LABEL_NAME,
      })),
    }));
  };

  /**
   * 时间选择确认
   */
  const confirmTime = (val: any) => {
    let timestamp = timeValue.value;
    if (val?.value && val.value !== timeValue.value) {
      // 用户修改了时间，使用修改后的值
      timestamp = val.value;
    }
    // 格式化为 yyyy-MM-dd HH:mm（只包含时分，不包含秒）
    customerData.value.changeTime = time.format(timestamp, 'yyyy-MM-dd HH:mm');
    timeShowPicker.value = false;
  };

  /**
   * 单位类型选择
   */
  const objTypeSelect = (val: any) => {
    if (customerData.value.objTypeValue !== val.id && customerData.value.objId) {
      showModal({
        content: '切换单位类型将清空已有单位信息，确定要切换吗？',
        success: res => {
          if (res.confirm) {
            customerData.value.objTypeValue = val.id;
            customerData.value.objId = '';
            customerData.value.objName = '';
          }
        },
      });
    } else {
      customerData.value.objTypeValue = val.id;
    }
  };

  /**
   * 获取协访人员列表
   */
  const getUserByParams = async (params: any) => {
    visitUserLoading.value = true;
    const res = await CommonService.getUserByParams(params);
    userOptions.value = res || [];
    visitUserLoading.value = false;
    // 如果没有搜索关键词，保存原始列表并标记为已加载
    if (!params?.keyword) {
      visitUserOriginalList.value = res || [];
      visitUserLoaded.value = true;
    }
  };

  /**
   * 协访人切换
   */
  const visitUserChange = (item: any) => {
    visitUserCheck.value = [item.userId];
    customerData.value.visitUserName = item.userName;
    customerData.value.visitUserId = item.userId;
    visitUserShow.value = false;
  };

  /**
   * 协访人搜索
   */
  const visitUserSearch = async (val: string) => {
    // 搜索时总是请求接口
    await getUserByParams({ keyword: val, leaderFlag: false });
    // 保存搜索结果
    visitUserSearchResult.value = {
      keyword: val,
      list: [...userOptions.value],
    };
  };

  /**
   * 打开协访人选择弹窗
   */
  const openVisitUserPopup = async () => {
    // 先标记内容未准备好，显示空白弹窗
    visitUserContentReady.value = false;
    // 立即显示弹窗，提升响应速度
    visitUserShow.value = true;

    // 使用 nextTick 确保弹窗动画先执行
    await nextTick();

    // 延迟一小段时间再加载内容，提升打开速度
    setTimeout(async () => {
      // 如果有搜索关键词
      if (visitUserValue.value) {
        // 如果搜索关键词匹配上次的搜索结果，直接使用
        if (visitUserSearchResult.value?.keyword === visitUserValue.value) {
          userOptions.value = visitUserSearchResult.value.list;
          visitUserContentReady.value = true;
          return;
        }
        // 如果搜索关键词变化了，请求接口
        userOptions.value = [];
        try {
          await getUserByParams({ keyword: visitUserValue.value, leaderFlag: false });
        } finally {
          visitUserContentReady.value = true;
        }
        return;
      }
      // 如果没有搜索关键词，且已经加载过，则使用缓存的数据
      if (visitUserLoaded.value) {
        userOptions.value = visitUserOriginalList.value;
        visitUserContentReady.value = true;
        return;
      }
      // 否则请求接口
      userOptions.value = [];
      try {
        await getUserByParams({ leaderFlag: false });
      } finally {
        visitUserContentReady.value = true;
      }
    }, 50);
  };

  /**
   * 关闭协访人选择弹窗
   */
  const closeVisitUserPopup = () => {
    visitUserShow.value = false;
    // 关闭时重置状态
    visitUserContentReady.value = false;
  };

  /**
   * 单位选择点击
   */
  const objChangeClick = () => {
    if (customerData.value.objTypeValue === -1) {
      showToast('请先选择单位类型');
      return;
    }
    custlistOptions.value = [];
    goverListOptions.value = [];
    providerInforOptions.value = [];
    objSearchValue.value = '';
    resetUnitData(fetchUnitList);
    objShowPicker.value = true;
  };

  /**
   * 获取单位列表
   */
  const fetchUnitList = async ({ pageNum, pageSize }: { pageNum: number; pageSize: number }) => {
    let res: any;
    console.log('customerData', customerData);
    if (customerData.value.objTypeValue === 1) {
      // 供应商
      res = await CustomerFollowService.queryProviderForVisit({
        providerNameOrId: objSearchValue.value,
        useridList: [],
        pageSize,
        pageNum,
      });
      providerInforOptions.value =
        pageNum === 1 ? res.list || [] : [...providerInforOptions.value, ...(res.list || [])];
      return {
        list: res.list || [],
        total: res.total || 0,
        hasNextPage: res.hasNextPage ?? (res.list?.length || 0) >= pageSize,
      };
    } else if (customerData.value.objTypeValue === 2) {
      // 下游客户
      res = await CustomerFollowService.queryCustListByUserId({
        pageNum,
        pageSize,
        cust: objSearchValue.value,
        type: customerData.value.visitType,
        otherUserId: +customerData.value.visitType === 2 ? customerData.value.visitUserId : '',
      });
      custlistOptions.value =
        pageNum === 1 ? res.list || [] : [...custlistOptions.value, ...(res.list || [])];
      return {
        list: res.list || [],
        total: res.total || 0,
        hasNextPage: res.hasNextPage ?? (res.list?.length || 0) >= pageSize,
      };
    } else if (customerData.value.objTypeValue === 3) {
      // 政府单位
      res = await CustomerFollowService.queryGovernmentForVisit({
        orgnizationKeyword: objSearchValue.value,
      });
      goverListOptions.value = res || [];
      return {
        list: res || [],
        total: res?.length || 0,
        hasNextPage: false,
      };
    }
    throw new Error('获取单位列表失败');
  };

  /**
   * 单位搜索
   */
  const objSearch = () => {
    resetUnitData(fetchUnitList);
  };

  /**
   * 选择客户
   */
  const changeCust = async (item: any) => {
    const params = {
      creId: userStore.userInfor?.userId,
      custId: item.custId,
      type: customerData.value.visitType,
      otherUserId: +customerData.value.visitType === 2 ? customerData.value.visitUserId : '',
    };
    const res = await CustomerFollowService.queryPersonByCustId(params);
    personList.value = res || [];
    customerData.value.objId = item.custId;
    customerData.value.objName = item.custName;
    objShowPicker.value = false;
  };

  /**
   * 选择供应商
   */
  const changeProvider = (item: any) => {
    const personListFiltered: any[] = [];
    for (let index = 0; index < (item.userList || []).length; index++) {
      const element = item.userList[index];
      if (element.userId && element.isDel !== 3 && !element.oldOperationId) {
        personListFiltered.push(element);
      }
    }
    personList.value = personListFiltered;
    customerData.value.objId = item.cpiId;
    customerData.value.objName = item.providerName;
    objShowPicker.value = false;
  };

  /**
   * 选择政府单位
   */
  const changeGover = async (item: any) => {
    const params = {
      cgId: item.cgId,
      govAttributeid: '',
      orgnizationKeyword: '',
      pageNum: 1,
      pageSize: 1,
      ssqCode: '',
      useridList: [],
    };
    const res = await CustomerFollowService.queryGovernmentUserMsgForVisit(params);
    const personListTemp: any[] = [];
    const detailList = res?.list[0]?.govermentList[0]?.detail || [];
    for (let index = 0; index < detailList.length; index++) {
      const element = detailList[index];
      if (element.USER_ID && element.IS_DEL !== 3) {
        personListTemp.push(element);
      }
    }
    if (personListTemp.length > 0) {
      const newArr = [personListTemp[0]];
      for (let i = 0; i < personListTemp.length; i++) {
        let repeat = false;
        for (let j = 0; j < newArr.length; j++) {
          if (personListTemp[i].USER_ID === newArr[j].USER_ID) {
            repeat = true;
            break;
          }
        }
        if (!repeat) {
          newArr.push(personListTemp[i]);
        }
      }
      personList.value = newArr;
    }
    customerData.value.objId = item.cgId;
    customerData.value.objName =
      item.govAttributeId + '/' + item.govAttributeName + '/' + item.orgnizationName;
    objShowPicker.value = false;
  };

  /**
   * 职员选择点击
   */
  const staffMemberClick = () => {
    if (!customerData.value.objId || !customerData.value.objName) {
      showToast('请先选择单位信息');
      return;
    }
    staffMemberShow.value = true;
  };

  /**
   * 职员选择确定
   */
  const staffMemberSure = () => {
    staffMemberShow.value = false;
    customerData.value.staffMemberName = '';
    staffMemberCheckDetail.value = [];
    const middlePerson = personList.value.filter(
      (ele: any) => staffMemberCheck.value.indexOf(ele.USER_ID || ele.userId) !== -1
    );
    if (Array.isArray(middlePerson)) {
      middlePerson.forEach((elementPerson: any, index: number) => {
        customerData.value.staffMemberName += elementPerson.CU_USER_NAME || elementPerson.userName;
        if (index < middlePerson.length - 1) {
          customerData.value.staffMemberName += '，';
        }
        staffMemberCheckDetail.value.push({
          userId: elementPerson.USER_ID || elementPerson.userId,
          userName: elementPerson.CU_USER_NAME || elementPerson.userName,
          phoneNumber: elementPerson.CU_PHONE_NUM || elementPerson.phoneNum,
          hotid: elementPerson.WARMTH_NUM || elementPerson.warmthNum,
          starCheck: 0,
          outsideCheck: customerData.value.addressValue ? 1 : 0,
          hotValue:
            +elementPerson.WARMTH_NUM === 1 || +elementPerson.warmthNum === 1
              ? '业务员一般客情'
              : +elementPerson.WARMTH_NUM === 2 || +elementPerson.warmthNum === 2
                ? '需要进阶的客情'
                : +elementPerson.WARMTH_NUM === 3 || +elementPerson.warmthNum === 3
                  ? '从未接触的客情'
                  : '请选择热力值信息',
          remarkValueList: [
            {
              labelId: '',
              labelName: '',
              remark: '',
              expectTimeStr: '',
            },
          ],
          needLabelValueObj: [],
        });
      });
    } else {
      console.warn('⚠️ middlePerson 不是数组:', middlePerson);
    }
    appStore.setDetailObj({ staffMemberCheckDetail: staffMemberCheckDetail.value });
  };

  /**
   * 打卡信息点击
   */
  const adressPickerClick = () => {
    if (!customerData.value.changeTime) {
      showToast('请先选择拜访时间');
      return;
    }
    showAdressPicker.value = true;
  };

  /**
   * 已有打卡信息选择
   */
  const adressOnConfirm = (item: any) => {
    if (!item) {
      customerData.value.addressValue = '';
      customerData.value.addressDeatilValue = '';
      showAdressPicker.value = false;
      return;
    }
    customerData.value.addressValue = item.cciId;
    customerData.value.addressDeatilValue = item.cciId + '/' + item.address;
    showAdressPicker.value = false;
  };

  /**
   * 立即打卡确定选择
   */
  const addressChoose = (val: any) => {
    customerData.value.addressValue = val.addressID;
    customerData.value.addressDeatilValue = val.addressDetail;
    showAdressPicker.value = false;
  };

  /**
   * 取消打卡
   */
  const adressCancel = () => {
    showAdressPicker.value = false;
  };

  /**
   * 客情标签确认
   */
  const addCustomSure = (val: any) => {
    staffMemberCheckDetail.value = val;
    customerLabelShow.value = false;
  };

  /**
   * 提交客情
   */
  const submitClick = async () => {
    if (customerData.value.changeTime === '') {
      showToast('请选择拜访时间');
      return;
    }
    if (customerData.value.objTypeValue === -1) {
      showToast('请选择单位类型');
      return;
    }
    if (customerData.value.objId === '') {
      showToast('请选择单位信息');
      return;
    }
    if (!staffMemberCheckDetail.value.length) {
      showToast('请选择职员信息');
      return;
    }

    const params: any[] = [];
    staffMemberCheckDetail.value.forEach((element: any) => {
      const crmLabelRemarkVoList: any[] = [];
      if (Array.isArray(element.remarkValueList)) {
        element.remarkValueList.forEach((remarkelement: any) => {
          if (remarkelement.labelId) {
            crmLabelRemarkVoList.push({
              labelName: remarkelement.labelName,
              labelId: remarkelement.labelId,
              remark: remarkelement.remark,
              medicBoardType: remarkelement.medicBoardType,
              medicBoardTypeName: remarkelement.medicBoardTypeName,
              medicBoardTypeMemo: remarkelement.medicBoardTypeMemo,
              scheduleMeetingTime: remarkelement.scheduleMeetingTime,
              medicBoardMemo: remarkelement.medicBoardMemo,
              isSign: false,
              userIdList: [],
              tagIdList: [],
            });
          }
        });
      } else {
        console.warn('⚠️ remarkValueList 不是数组:', element);
      }
      params.push({
        companyType: customerData.value.objTypeValue,
        companyId: customerData.value.objId,
        companyName: customerData.value.objName,
        dataType: 1,
        cciId: customerData.value.addressValue,
        leaderIsItVisible: 1,
        starFlag: element.starCheck ? 1 : 0,
        taskType: customerData.value.visitType,
        togetherUserId: customerData.value.visitUserId,
        userId: userStore.userInfor?.userId,
        visitTime: customerData.value.changeTime,
        visitUserId: element.userId,
        whetherLegwork: element.outsideCheck || customerData.value.addressValue ? 1 : 0,
        crmLabelRemarkVoList: crmLabelRemarkVoList,
      });
    });

    await CustomerFollowService.insVisit(params);
    showSuccess('提交成功');
    appStore.setHadDoneOnDetail(true);
    router.back();
  };

  /**
   * 取消
   */
  const cancelClick = () => {
    showModal({
      content: '确定取消新增客情事件？',
      success: res => {
        if (res.confirm) {
          router.back();
        }
      },
    });
  };

  return {
    // 表单数据
    customerData,
    staffMemberCheckDetail,
    activeName,

    // 弹窗状态
    timeShowPicker,
    objTypeShowPicker,
    visitUserShow,
    objShowPicker,
    staffMemberShow,
    showAdressPicker,
    customerLabelShow,

    // 时间相关
    timeValue,
    minDate,
    maxDate,

    // 协访人相关
    visitUserValue,
    visitUserLoading,
    userOptions,
    visitUserCheck,
    visitUserContentReady,
    openVisitUserPopup,
    closeVisitUserPopup,

    // 单位类型
    objTypeActions,

    // 单位相关
    objSearchValue,
    custlistOptions,
    goverListOptions,
    providerInforOptions,

    // 职员相关
    staffMemberValue,
    staffMemberCheck,
    personList,

    // 标签树
    labelTreeList,

    // 分页相关
    unitList,
    unitTotalNum,
    unitLoading,
    resetUnitData,
    loadMoreUnit,

    // 方法
    getLabelTree,
    confirmTime,
    objTypeSelect,
    getUserByParams,
    visitUserChange,
    visitUserSearch,
    objChangeClick,
    fetchUnitList,
    objSearch,
    changeCust,
    changeProvider,
    changeGover,
    staffMemberClick,
    staffMemberSure,
    adressPickerClick,
    adressOnConfirm,
    addressChoose,
    adressCancel,
    addCustomSure,
    submitClick,
    cancelClick,
  };
}
