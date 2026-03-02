/**
 * 客户人员新增/编辑 Composable
 */
import {
  MARITAL_OPTIONS,
  EDUCATION_OPTIONS,
  POLITICAL_OPTIONS,
  STATUS_FULL_OPTIONS,
  MEDICAL_MEMBER_OPTIONS,
  WARMTH_NUM_OPTIONS,
} from '../constants';

/**
 * 客户人员表单管理 Composable
 */
export const usePersonAdd = (
  customerInfo: Ref<any> | any,
  cupId: Ref<string> | string,
  type: Ref<any> | any
) => {
  const appStore = useAppStore();
  // 统一处理 ref 和普通值
  const customerInfoValue = computed(() =>
    typeof customerInfo === 'object' && 'value' in customerInfo ? customerInfo.value : customerInfo
  );
  const cupIdValue = computed(() =>
    typeof cupId === 'object' && 'value' in cupId ? cupId.value : cupId
  );
  const typeValue = computed(() =>
    typeof type === 'object' && 'value' in type ? type.value : type
  );

  const userStore = useUserStore();
  const nowUser = computed(() => userStore.userInfor.userId || '');

  // 状态
  const userList = ref<any[]>([]);
  const phoneLoading = ref(false);
  const submitLoading = ref(false);
  const actionShow = ref(false);
  const actionType = ref(0); // 1婚姻状况 2学历 3政治面貌 4爱好 5部门 6职位 7状态 8热力值 9生日 10政治生日 11药事会成员
  const hobbyPopShow = ref(false);
  const birthdayPopShow = ref(false);
  const politicsBirthdayPopShow = ref(false);

  // 日期
  const birthday = ref<string>(time.format(new Date(), time.FORMATS.ISO_DATE));
  const politicsBirthday = ref<string>(time.format(new Date(), time.FORMATS.ISO_DATE));

  // 选项列表
  const statusOptions = ref([
    { value: 0, name: '正式' },
    { value: 2, name: '退休/离职' },
  ]);

  const hobbyOptions = ref<any[]>([]);
  const hobbyResult = ref<any[]>([]);
  const departOptions = ref<any[]>([]);
  const positionOptions = ref<any[]>([]);

  // 表单数据
  const formData = ref<any>({
    cueId: '',
    marital: {},
    education: {},
    political: {},
    statusObj: {},
    medicalMemberObj: {},
    position: {},
    depart: {},
    warmth: {},
    userName: '',
    birthday: '',
    politicsBirthday: '',
    phoneNum: '',
    wxCode: '',
    idCard: '',
    familyStatus: '',
    address: '',
    remark: '',
    salary: '',
    userId: '',
    creId: '',
  });

  // 计算属性
  const hobbyDetail = computed(() => {
    return hobbyResult.value.length
      ? hobbyResult.value
          .map((item: any) => {
            return item.name;
          })
          .join(',')
      : '';
  });

  const detailInfor = computed(() => appStore.detailObj || {});

  // 防抖定时器
  let timeout: any = null;

  /**
   * 获取爱好列表
   */
  const getHobbyFun = async () => {
    const params = {
      keyword: '',
      pageNum: 1,
      pageSize: 10000,
      usestatus: 1,
      typeId: 11,
    };
    const res = await CommonService.getDictionaries(params);
    hobbyOptions.value = res.list.map((ele: any) => ({
      value: ele.DIC_SELECT_ID,
      name: ele.DIC_SELECT_NAME,
    }));
  };

  /**
   * 获取部门列表
   */
  const queryDept = async () => {
    const params = {
      dicUpperSelectId: customerInfoValue.value.orgRoleId,
      keyword: '',
      pageNum: 1,
      pageSize: 10000,
      typeId: 3,
      upperTypeId: 2,
      usestatus: 1,
      typeSecondId: 1,
    };
    const res = await CommonService.getDictionaries(params);
    departOptions.value = res.list.map((ele: any) => ({
      value: ele.DIC_SELECT_ID,
      name: ele.DIC_SELECT_NAME,
    }));
    if (formData.value.departmentId) {
      formData.value.depart = {
        value: formData.value.departmentId,
        name:
          departOptions.value.find((item: any) => item.value === +formData.value.departmentId)
            ?.name || '',
      };
    }
  };

  /**
   * 获取职位列表
   */
  const getPostionFun = async (val: any) => {
    const params = {
      dicUpperSelectId: val,
      keyword: '',
      pageNum: 1,
      pageSize: 10000,
      typeId: 4,
      upperTypeId: 3,
      usestatus: 1,
      typeSecondId: 1,
    };
    const res = await CommonService.getDictionaries(params);
    positionOptions.value = res.list.map((ele: any) => ({
      value: ele.DIC_SELECT_ID,
      name: ele.DIC_SELECT_NAME,
    }));
    if (formData.value.positionId) {
      formData.value.position = {
        value: formData.value.positionId,
        name:
          positionOptions.value.find((item: any) => item.value === +formData.value.positionId)
            ?.name || '',
      };
    }
  };

  /**
   * 查询CRM用户（根据手机号）- 带防抖
   */
  const queryCrmUser = async (phoneNum: string) => {
    console.log('phoneNum', phoneNum);
    phoneNum = phoneNum.replace(/[^0-9-]+/, '');
    formData.value.phoneNum = phoneNum;
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(async () => {
      if (!phoneNum) {
        userList.value = [];
        return;
      }
      phoneLoading.value = true;
      const res = await CommonService.queryCrmUser({ phoneNum });
      userList.value = res || [];
      phoneLoading.value = false;
    }, 800);
  };

  /**
   * 选择用户并填充表单
   */
  const chooseUser = (item: any) => {
    phoneLoading.value = false;
    userList.value = [];
    formData.value.wxCode = item.wxCode;
    formData.value.userName = item.userName;
    formData.value.userId = item.userId;
    formData.value.creId = item.creId;
    if (item.userExpandDOS && item.userExpandDOS.length > 0) {
      formData.value.cueId = item.userExpandDOS[0].cueId;
      formData.value.idCard = item.userExpandDOS[0].idCard;
      formData.value.familyStatus = item.userExpandDOS[0].familyStatus;
      formData.value.salary = item.userExpandDOS[0].salary;
      formData.value.address = item.userExpandDOS[0].address;
      formData.value.marital =
        item.userExpandDOS[0].maritalStatus !== null
          ? {
              value: item.userExpandDOS[0].maritalStatus,
              name:
                MARITAL_OPTIONS.find(
                  (opt: any) => opt.value === +item.userExpandDOS[0].maritalStatus
                )?.name || '',
            }
          : {};
      formData.value.education = item.userExpandDOS[0].education
        ? {
            value: item.userExpandDOS[0].education,
            name:
              EDUCATION_OPTIONS.find((opt: any) => opt.value === +item.userExpandDOS[0].education)
                ?.name || '',
          }
        : {};
      formData.value.warmth = item.userExpandDOS[0].warmthNum
        ? {
            value: item.userExpandDOS[0].warmthNum,
            name:
              WARMTH_NUM_OPTIONS.find((opt: any) => opt.value === +item.userExpandDOS[0].warmthNum)
                ?.name || '',
          }
        : {};
      hobbyResult.value = item.userExpandDOS[0].hobby
        ? item.userExpandDOS[0].hobby
            .split(',')
            .map((hobbyId: any) => hobbyOptions.value.find((opt: any) => opt.value === +hobbyId))
            .filter(Boolean)
        : [];
    }
  };

  /**
   * 选择筛选
   */
  const chooseFilter = (filterType: number) => {
    if (filterType === 4) {
      hobbyPopShow.value = true;
    } else if (filterType === 9) {
      birthdayPopShow.value = true;
    } else if (filterType === 10) {
      politicsBirthdayPopShow.value = true;
    } else {
      actionShow.value = true;
      actionType.value = filterType;
    }
  };

  /**
   * 处理婚姻状况选择
   */
  const handleSelectMarital = (action: any) => {
    actionShow.value = false;
    formData.value.marital = action;
  };

  /**
   * 处理学历选择
   */
  const handleSelectEducation = (action: any) => {
    actionShow.value = false;
    formData.value.education = action;
  };

  /**
   * 处理政治面貌选择
   */
  const handleSelectPolitical = (action: any) => {
    actionShow.value = false;
    formData.value.political = action;
  };

  /**
   * 处理爱好选择
   */
  const handleSelectHobby = () => {
    hobbyPopShow.value = false;
  };

  /**
   * 处理部门选择
   */
  const handleSelectDepart = (action: any) => {
    actionShow.value = false;
    formData.value.depart = action;
    formData.value.position = {};
    positionOptions.value = [];
    getPostionFun(action.value);
  };

  /**
   * 处理职位选择
   */
  const handleSelectPosition = (action: any) => {
    actionShow.value = false;
    formData.value.position = action;
  };

  /**
   * 处理状态选择
   */
  const handleSelectStatus = (action: any) => {
    actionShow.value = false;
    formData.value.statusObj = action;
  };

  /**
   * 处理药事会成员选择
   */
  const handleSelectMedicalMember = (action: any) => {
    actionShow.value = false;
    formData.value.medicalMemberObj = action;
  };

  /**
   * 处理热力值选择
   */
  const handleSelectWarmth = (action: any) => {
    actionShow.value = false;
    formData.value.warmth = action;
  };

  /**
   * 处理生日选择
   */
  const handleSelectBirthday = (date: any) => {
    birthdayPopShow.value = false;
    formData.value.birthday = time.format(date.fulldate, time.FORMATS.ISO_DATE);
  };

  /**
   * 处理政治生日选择
   */
  const handleSelectPoliticsBirthday = (date: any) => {
    politicsBirthdayPopShow.value = false;
    formData.value.politicsBirthday = time.format(date.fulldate, time.FORMATS.ISO_DATE);
  };

  /**
   * 获取详情
   */
  const getDetail = async () => {
    const res = await CustomerService.queryPerson({ cupId: cupIdValue.value });
    formData.value = { ...res };
    formData.value.creId = res.userCreId;
    formData.value.marital =
      formData.value.maritalStatus !== null
        ? {
            value: formData.value.maritalStatus,
            name:
              MARITAL_OPTIONS.find((opt: any) => opt.value === +formData.value.maritalStatus)
                ?.name || '',
          }
        : {};
    formData.value.education = formData.value.education
      ? {
          value: formData.value.education,
          name:
            EDUCATION_OPTIONS.find((opt: any) => opt.value === +formData.value.education)?.name ||
            '',
        }
      : {};
    formData.value.political = formData.value.politicalStatus
      ? {
          value: formData.value.politicalStatus,
          name:
            POLITICAL_OPTIONS.find((opt: any) => opt.value === +formData.value.politicalStatus)
              ?.name || '',
        }
      : {};
    hobbyResult.value = formData.value.hobby
      ? formData.value.hobby
          .split(',')
          .map((hobbyId: any) => hobbyOptions.value.find((opt: any) => opt.value === +hobbyId))
          .filter(Boolean)
      : [];
    if (+formData.value.status === 4) {
      statusOptions.value = [
        { value: 0, name: '正式' },
        { value: 2, name: '退休/离职' },
        { value: 4, name: '由转职来' },
      ];
    } else {
      statusOptions.value = [
        { value: 0, name: '正式' },
        { value: 2, name: '退休/离职' },
      ];
    }
    formData.value.statusObj = {
      value: formData.value.status,
      name:
        STATUS_FULL_OPTIONS.find((opt: any) => opt.value === +formData.value.status)?.name || '',
    };
    formData.value.medicalMemberObj = formData.value.medicalMember
      ? {
          value: formData.value.medicalMember,
          name:
            MEDICAL_MEMBER_OPTIONS.find((opt: any) => opt.value === +formData.value.medicalMember)
              ?.name || '',
        }
      : {};
    if (formData.value.departmentId) {
      await queryDept();
      getPostionFun(formData.value.departmentId);
    }
    formData.value.warmth = formData.value.warmthNum
      ? {
          value: formData.value.warmthNum,
          name:
            WARMTH_NUM_OPTIONS.find((opt: any) => opt.value === +formData.value.warmthNum)?.name ||
            '',
        }
      : {};
    birthday.value = formData.value.birthday
      ? time.format(new Date(formData.value.birthday), time.FORMATS.ISO_DATE)
      : time.format(new Date(), time.FORMATS.ISO_DATE);
    politicsBirthday.value = formData.value.politicsBirthday
      ? time.format(new Date(formData.value.politicsBirthday), time.FORMATS.ISO_DATE)
      : time.format(new Date(), time.FORMATS.ISO_DATE);
  };

  /**
   * 表单验证
   */
  const validateForm = (): boolean => {
    if (!formData.value.userName) {
      showToast('人员姓名不能为空');
      return false;
    }
    if (!formData.value.phoneNum) {
      showToast('手机号不能为空');
      return false;
    }
    if (!formData.value.wxCode) {
      showToast('微信号不能为空');
      return false;
    }
    if (!formData.value.depart?.name) {
      showToast('部门不能为空');
      return false;
    }
    if (!formData.value.position?.name) {
      showToast('职位不能为空');
      return false;
    }
    if (!formData.value.statusObj?.name) {
      showToast('状态不能为空');
      return false;
    }
    if (!formData.value.warmth?.name) {
      showToast('热力值不能为空');
      return false;
    }
    return true;
  };

  /**
   * 转换表单数据为API格式
   */
  const transformFormData = (): any => {
    const params: any = { ...formData.value };
    params.custId = customerInfoValue.value.custId;
    params.maritalStatus = params.marital?.value;
    params.education = params.education?.value;
    params.politicalStatus = params.political?.value;
    params.departmentId = params.depart?.value;
    params.positionId = params.position?.value;
    params.status = params.statusObj?.value;
    params.medicalMember = params.medicalMemberObj?.value;
    params.warmthNum = params.warmth?.value;
    delete params.marital;
    delete params.political;
    delete params.depart;
    delete params.position;
    delete params.statusObj;
    delete params.medicalMemberObj;
    delete params.warmth;
    params.orgnizationRoleId = customerInfoValue.value.orgRoleId;
    params.hobby = hobbyResult.value.length
      ? hobbyResult.value
          .map((item: any) => {
            return item.value;
          })
          .join(',')
      : '';
    params.phoneNum = params.phoneNum.replace(/\s+/g, '');
    return params;
  };

  /**
   * 提交
   */
  const submit = async () => {
    if (!validateForm()) {
      return;
    }

    const params = transformFormData();
    submitLoading.value = true;
    +typeValue.value === 2
      ? await CustomerService.updatePerson(params)
      : await CustomerService.addPerson(params);
    appStore.setHadDoneOnDetail(true);
    showSuccess(+typeValue.value === 2 ? '修改成功' : '新增成功');
    setTimeout(
      () => {
        router.back();
      },
      +typeValue.value === 2 ? 500 : 2000
    );
    submitLoading.value = false;
  };

  /**
   * 清理定时器
   */
  const cleanup = () => {
    if (timeout) {
      clearTimeout(timeout);
    }
  };

  return {
    // 状态
    nowUser,
    userList,
    phoneLoading,
    submitLoading,
    actionShow,
    actionType,
    hobbyPopShow,
    birthdayPopShow,
    politicsBirthdayPopShow,
    birthday,
    politicsBirthday,
    statusOptions,
    hobbyOptions,
    hobbyResult,
    departOptions,
    positionOptions,
    formData,
    hobbyDetail,
    detailInfor,

    // 方法
    getHobbyFun,
    queryDept,
    getPostionFun,
    queryCrmUser,
    chooseUser,
    chooseFilter,
    handleSelectMarital,
    handleSelectEducation,
    handleSelectPolitical,
    handleSelectHobby,
    handleSelectDepart,
    handleSelectPosition,
    handleSelectStatus,
    handleSelectMedicalMember,
    handleSelectWarmth,
    handleSelectBirthday,
    handleSelectPoliticsBirthday,
    getDetail,
    submit,
    cleanup,
  };
};
