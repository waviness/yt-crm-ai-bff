import type { CustomerStaffDetail, OptionItem } from '../types';
import dayjs from 'dayjs';

export function usePersonOp(userDetail: Ref<CustomerStaffDetail | null>) {
  const phoneLoading = ref(false);
  const userObj = ref<CustomerStaffDetail | null>(null);
  let searchTimer: any = null;

  // 性别选项
  const genderOptions = reactive<OptionItem[]>([
    { value: 1, name: '男' },
    { value: 2, name: '女' },
  ]);

  // 表单数据
  const formData = ref<CustomerStaffDetail>({
    userId: '',
    userName: '',
    phoneNum: '',
    wxCode: '',
    gender: undefined,
    genderName: '',
    birthday: '',
    age: undefined,
    officeId: '',
    officeName: '',
    positionId: '',
    positionName: '',
    structureLevel: '',
    structureLevelName: '',
    honorTitle: '',
    customerUserGrade: '',
    customerUserGradeName: '',
    degree: '',
  });

  // 性别对象（用于显示）
  const genderObj = computed(() => {
    if (!formData.value.gender) return { value: '', name: '' };
    return {
      value: formData.value.gender,
      name: formData.value.gender === 1 ? '男' : '女',
    };
  });

  // 科室对象（用于显示）
  const officeIdObj = computed(() => ({
    value: formData.value.officeId || '',
    name: formData.value.officeName || '',
  }));

  // 职位对象（用于显示）
  const positionIdObj = computed(() => ({
    value: formData.value.positionId || '',
    name: formData.value.positionName || '',
  }));

  // 行政级别对象（用于显示）
  const structureLevelObj = computed(() => ({
    value: formData.value.structureLevel || '',
    name: formData.value.structureLevelName || '',
  }));

  // 客户分级对象（用于显示）
  const customerUserGradeObj = computed(() => ({
    value: formData.value.customerUserGrade || '',
    name: formData.value.customerUserGradeName || '',
  }));

  // 根据手机号查询用户
  const queryUserByPhone = async (phoneNum: string) => {
    if (!phoneNum) {
      userObj.value = null;
      return;
    }
    phoneLoading.value = true;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
      try {
        const res = await SzymCustomerService.getUserByPhoneNum({ phoneNum });
        if (+res.code === 200 && res.data) {
          userObj.value = res.data;
        } else {
          userObj.value = null;
        }
      } catch (error) {
        userObj.value = null;
      } finally {
        phoneLoading.value = false;
      }
    }, 800);
  };

  // 选择用户（点击搜索结果）
  const chooseUser = (user: CustomerStaffDetail) => {
    formData.value = { ...user };
    userObj.value = null;
  };

  // 选择性别
  const selectGender = (option: OptionItem) => {
    formData.value.gender = option.value as number;
    formData.value.genderName = option.name;
  };

  // 选择生日
  const selectBirthday = (date: string) => {
    formData.value.birthday = date;
    const birthDayjs = dayjs(date);
    const today = dayjs();
    formData.value.age = today.diff(birthDayjs, 'year');
  };

  // 选择科室
  const selectOffice = (option: OptionItem) => {
    formData.value.officeId = option.value as string;
    formData.value.officeName = option.name;
  };

  // 选择职位
  const selectPosition = (option: OptionItem) => {
    formData.value.positionId = option.value as string;
    formData.value.positionName = option.name;
  };

  // 选择行政级别
  const selectStructureLevel = (option: OptionItem) => {
    formData.value.structureLevel = option.value as string;
    formData.value.structureLevelName = option.name;
  };

  // 选择客户分级
  const selectCustomerUserGrade = (option: OptionItem) => {
    formData.value.customerUserGrade = option.value as string;
    formData.value.customerUserGradeName = option.name;
  };

  // 表单验证
  const validateForm = () => {
    if (!formData.value.userName?.trim()) {
      showError('请输入人员姓名');
      return false;
    }
    if (!formData.value.phoneNum?.trim()) {
      showError('请输入手机号');
      return false;
    }
    if (!formData.value.wxCode?.trim()) {
      showError('请输入微信号');
      return false;
    }
    if (!formData.value.gender) {
      showError('请选择人员性别');
      return false;
    }
    if (!formData.value.officeId) {
      showError('请选择科室信息');
      return false;
    }
    if (!formData.value.positionId) {
      showError('请选择职称信息');
      return false;
    }
    if (!formData.value.customerUserGrade) {
      showError('请选择客户分级');
      return false;
    }
    return true;
  };

  // 初始化表单（编辑模式）
  const initForm = () => {
    if (userDetail.value) {
      formData.value = { ...userDetail.value };
    } else {
      // 重置表单
      formData.value = {
        userId: '',
        userName: '',
        phoneNum: '',
        wxCode: '',
        gender: undefined,
        genderName: '',
        birthday: '',
        age: undefined,
        officeId: '',
        officeName: '',
        positionId: '',
        positionName: '',
        structureLevel: '',
        structureLevelName: '',
        honorTitle: '',
        customerUserGrade: '',
        customerUserGradeName: '',
        degree: '',
      };
      userObj.value = null;
    }
  };

  return {
    formData,
    genderOptions,
    genderObj,
    officeIdObj,
    positionIdObj,
    structureLevelObj,
    customerUserGradeObj,
    phoneLoading,
    userObj,
    queryUserByPhone,
    chooseUser,
    selectGender,
    selectBirthday,
    selectOffice,
    selectPosition,
    selectStructureLevel,
    selectCustomerUserGrade,
    validateForm,
    initForm,
  };
}
