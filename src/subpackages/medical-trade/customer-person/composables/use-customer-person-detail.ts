import type { CustomerStaffDetail, OptionItem, CustomerPersonItem } from '../types';

export function useCustomerPersonDetail() {
  const appStore = useAppStore();

  const detailInfo = ref<CustomerPersonItem>({} as CustomerPersonItem);
  const editCustomerVisible = ref(false);
  const addPopVisible = ref(false);
  const editPersonObj = ref<CustomerStaffDetail | null>(null);

  // 字典选项
  const officeOptions = ref<OptionItem[]>([]); // 科室信息
  const positionOptions = ref<OptionItem[]>([]); // 职位信息
  const structureLevelOptions = ref<OptionItem[]>([]); // 行政级别
  const customerUserGradeOptions = ref<OptionItem[]>([]); // 客户分级

  const customTypeList = ref<OptionItem[]>([]); // 客户类型
  const scienceLineTypeList = ref<OptionItem[]>([]); // 学术专线
  const businessNatureTypeList = ref<OptionItem[]>([]); // 经营性质

  // 客户编辑表单
  const customTypeObj = ref<OptionItem>({ value: '', name: '' });
  const businessNatureObj = ref<OptionItem>({ value: '', name: '' });
  const scienceLineObj = ref<OptionItem>({ value: '', name: '' });

  // 获取字典列表
  const getDictList = async (typeId: number) => {
    const res = await CommonService.getDictionaries({
      full: true,
      pageNum: 1,
      pageSize: 100000,
      usestatus: 1,
      typeId,
    });
    return res.list.map((ele: any) => ({
      value: ele.DIC_SELECT_ID,
      name: ele.DIC_SELECT_NAME,
    }));
  };

  // 初始化字典数据
  const initDictData = async () => {
    const [offices, positions, grades, levels, customTypes, scienceLines, businessNatures] =
      await Promise.all([
        getDictList(64), // 科室信息
        getDictList(65), // 职位信息
        getDictList(71), // 客户分级
        getDictList(72), // 行政级别
        getDictList(67), // 客户类型
        getDictList(62), // 学术专线
        getDictList(63), // 经营性质
      ]);

    officeOptions.value = offices;
    positionOptions.value = positions;
    customerUserGradeOptions.value = grades;
    structureLevelOptions.value = levels;

    customTypeList.value = customTypes;
    scienceLineTypeList.value = scienceLines;
    businessNatureTypeList.value = businessNatures;

    // 初始化客户编辑表单
    customTypeObj.value = {
      value: detailInfo.value.customerType || '',
      name: detailInfo.value.customerTypeName || '',
    };
    businessNatureObj.value = {
      value: detailInfo.value.businessNature || '',
      name: detailInfo.value.businessNatureName || '',
    };
    scienceLineObj.value = {
      value: detailInfo.value.scienceLine || '',
      name: detailInfo.value.scienceLineName || '',
    };
  };

  // 获取人员列表
  const fetchStaffList = async (params: { pageNum: number; pageSize: number }) => {
    const response = await SzymCustomerService.getSzymCustomerStaff({
      szymCustomerId: detailInfo.value.szymCustomerId,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
    });
    // 更新人员总数
    detailInfo.value.customerStaffNum = response.total;
    return {
      list: response.list || [],
      hasNextPage: response.hasNextPage || false,
      total: response.total || 0,
    };
  };

  const {
    list: personList,
    refreshing,
    loadmoreConfig,
    pullRefreshHeight,
    onRefresh,
    onLoadMore,
    calcPullRefreshHeight,
  } = usePagination(
    {
      pageSize: 10,
      initialPage: 1,
      toolBarHeight: 180,
    },
    fetchStaffList
  );

  // 新增人员
  const handleAddPerson = () => {
    editPersonObj.value = null;
    addPopVisible.value = true;
  };

  // 编辑人员
  const handleEditPerson = (person: CustomerStaffDetail) => {
    editPersonObj.value = person;
    addPopVisible.value = true;
  };

  // 删除人员
  const handleDeletePerson = async (person: CustomerStaffDetail) => {
    showModal({
      title: '提示',
      content: '确定删除职员信息?',
      confirmText: '确定',
      confirmColor: '#2271F5',
      success: async res => {
        if (res.confirm) {
          const result = await SzymCustomerService.dltSzymCustomerStaff({
            scStaffId: person.scStaffId,
          });
          if (+result.code === 200) {
            showSuccess(result.msg);
            onRefresh();
          } else {
            showError(result.msg);
          }
        }
      },
    });
  };

  // 提交人员信息
  const handleSubmitPerson = async (data: CustomerStaffDetail) => {
    const result = await SzymCustomerService.optSzymCustomerStaff({
      ...data,
      szymCustomerId: detailInfo.value.szymCustomerId,
    });
    if (result.success) {
      showSuccess(result.msg);
      addPopVisible.value = false;
      onRefresh();
    } else {
      showError(result.msg);
    }
  };

  // 编辑客户
  const handleEditCustomer = () => {
    editCustomerVisible.value = true;
  };

  // 保存客户信息
  const handleSaveCustomer = async () => {
    const result = await SzymCustomerService.updSzymCustomer({
      szymCustomerId: detailInfo.value.szymCustomerId,
      customerType: customTypeObj.value.value,
      scienceLine: scienceLineObj.value.value,
      businessNature: businessNatureObj.value.value,
    });
    if (+result.code === 200) {
      editCustomerVisible.value = false;
      showSuccess(result.msg);
      // 更新详情信息
      detailInfo.value.customerTypeName = customTypeObj.value.name;
      detailInfo.value.customerType = customTypeObj.value.value as string;
      detailInfo.value.businessNatureName = businessNatureObj.value.name;
      detailInfo.value.businessNature = businessNatureObj.value.value as string;
      detailInfo.value.scienceLineName = scienceLineObj.value.name;
      detailInfo.value.scienceLine = scienceLineObj.value.value as string;
      appStore.setDetailObj(detailInfo.value);
    } else {
      showError(result.msg);
    }
  };

  return {
    detailInfo,
    personList,
    refreshing,
    loadmoreConfig,
    pullRefreshHeight,
    editCustomerVisible,
    addPopVisible,
    editPersonObj,
    officeOptions,
    positionOptions,
    structureLevelOptions,
    customerUserGradeOptions,
    customTypeList,
    scienceLineTypeList,
    businessNatureTypeList,
    customTypeObj,
    businessNatureObj,
    scienceLineObj,
    onRefresh,
    onLoadMore,
    calcPullRefreshHeight,
    initDictData,
    handleAddPerson,
    handleEditPerson,
    handleDeletePerson,
    handleSubmitPerson,
    handleEditCustomer,
    handleSaveCustomer,
  };
}
