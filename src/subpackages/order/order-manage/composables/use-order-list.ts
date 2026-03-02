/**
 * 订单列表页面业务逻辑
 * 管理订单列表的筛选、分页、选择等相关逻辑
 */
import type {
  OrderListFilterData,
  CustomerInfo,
  ContactInfo,
  EntryInfo,
  StatusOption,
  OrderDetailListParams,
} from '../types';

export const useOrderList = () => {
  // 响应式数据
  const show = ref(false);
  const showTime = ref(false);
  const showCont = ref(false);
  const entryShow = ref(false);
  const contactShow = ref(false);
  const statusShow = ref(false);
  const isJustSelf = ref(false);
  const tabActiveIndex = ref(0);
  const cardType = ref(0);
  const customer = ref<CustomerInfo>({} as CustomerInfo);
  const timeList = ref<string[]>([]);
  const userIdLists = ref<string[]>([]);
  const contactIdList = ref<string[]>([]);
  const contactDataList = ref<ContactInfo[]>([]);
  const contactPage = ref(1);
  const contactLoading = ref(false);
  const contactFinished = ref(false);
  const contactRefreshing = ref(false);
  const searchValueContact = ref('');

  const filterObj = ref<OrderListFilterData>({
    goodsId: '',
    goodsName: '',
    time: '',
    conType: null,
    userNames: '',
    entryId: '',
    entryName: '',
    subArriveType: '',
    subArriveName: '',
    contactIdList: [],
    contactString: '',
    entryKeyword: '',
  });

  const originFilter = ref<OrderListFilterData>({
    goodsId: '',
    goodsName: '',
    time: '',
    conType: null,
    userNames: '',
    entryId: '',
    entryName: '',
    subArriveType: '',
    subArriveName: '',
    contactIdList: [],
    contactString: '',
    entryKeyword: '',
  });

  // 锁控类型选项
  const conList = ref<string[]>([
    '缺货',
    '区域限销',
    '价格限销',
    '下限锁',
    '两票制提醒',
    '紧俏药品',
    '禁限销',
    '库存状态',
    '近效期',
  ]);

  // 核算单元列表
  const entryList = ref<EntryInfo[]>([]);

  // 订阅状态选项
  const statusList = ref<StatusOption[]>([
    { label: '未订阅到货品种', value: '0' },
    { label: '未订阅到票品种', value: '1' },
    { label: '已订阅到货品种', value: '2' },
    { label: '已订阅到票品种', value: '3' },
  ]);

  // 权限相关
  const needQueryAll = ref(false);
  const needQueryAllEntrys = ref(false);
  const needQueryAllDept = ref(false);
  const managementOpflagForSaler = ref(false);
  const managementOpflagForPurchaser = ref(false);

  // 计算属性
  const getOtherClass = computed(() => {
    if (
      filterObj.value.goodsId ||
      filterObj.value.goodsName ||
      filterObj.value.time ||
      filterObj.value.conType ||
      filterObj.value.userNames ||
      filterObj.value.entryId ||
      filterObj.value.subArriveType
    ) {
      return 'have-filter';
    }
    return '';
  });

  // 显示筛选弹窗
  const showPopup = () => {
    originFilter.value = deepClone(filterObj.value);
    show.value = true;
  };

  // 重置筛选条件
  const refreshFilter = () => {
    filterObj.value.goodsId = '';
    filterObj.value.goodsName = '';
    filterObj.value.time = '';
    filterObj.value.conType = null;
    filterObj.value.userNames = '';
    filterObj.value.entryId = '';
    filterObj.value.entryName = '';
    filterObj.value.subArriveType = '';
    filterObj.value.subArriveName = '';
    filterObj.value.contactIdList = [];
    filterObj.value.contactString = '';
    contactPage.value = 1;
    contactFinished.value = false;
    contactRefreshing.value = false;
    contactDataList.value = [];
    contactIdList.value = [];
  };

  // 处理筛选确认
  const handleFilter = () => {
    show.value = false;
    if (
      filterObj.value.goodsId === originFilter.value.goodsId &&
      filterObj.value.goodsName === originFilter.value.goodsName &&
      filterObj.value.time === originFilter.value.time &&
      filterObj.value.conType === originFilter.value.conType &&
      filterObj.value.userNames === originFilter.value.userNames &&
      filterObj.value.entryId === originFilter.value.entryId &&
      JSON.stringify(filterObj.value.contactIdList) ===
        JSON.stringify(originFilter.value.contactIdList) &&
      filterObj.value.subArriveType === originFilter.value.subArriveType
    ) {
      return false;
    }
    // 确认筛选后，更新 originFilter，这样关闭时恢复的就是确认后的值
    originFilter.value = deepClone(filterObj.value);
    return true; // 需要刷新
  };

  // 关闭筛选弹窗
  const closePopup = () => {
    filterObj.value.goodsId = originFilter.value.goodsId;
    filterObj.value.goodsName = originFilter.value.goodsName;
    filterObj.value.entryKeyword = originFilter.value.entryKeyword;
    filterObj.value.time = originFilter.value.time;
    filterObj.value.conType = originFilter.value.conType;
    filterObj.value.userNames = originFilter.value.userNames;
    filterObj.value.entryId = originFilter.value.entryId;
    filterObj.value.entryName = originFilter.value.entryName;
    filterObj.value.subArriveType = originFilter.value.subArriveType;
    filterObj.value.subArriveName = originFilter.value.subArriveName;
    filterObj.value.contactIdList = originFilter.value.contactIdList;
  };

  // 确认时间选择
  const onConfirm = (date: Date[]) => {
    // 原始代码中 timeList 存储的是格式化后的日期字符串（YYYY-MM-DD）
    timeList.value = [
      time.format(date[0], time.FORMATS.ISO_DATE),
      time.format(date[1], time.FORMATS.ISO_DATE),
    ];
    // 原始代码中 filterObj.time 只显示日期部分
    filterObj.value.time = timeList.value[0] + ' ~ ' + timeList.value[1];
    showTime.value = false;
    // 原始代码中 onConfirm 不刷新，需要手动调用 onRefresh
    return false;
  };

  // 确认锁控类型选择
  const onPickConfirm = (data: string) => {
    filterObj.value.conType = data;
    showCont.value = false;
  };

  // 获取订单列表数据
  const fetchOrderList = async (params: { pageNum: number; pageSize: number }) => {
    if (!customer.value.customerId) {
      return {
        list: [],
        hasNextPage: false,
        total: 0,
      };
    }

    const requestParams: OrderDetailListParams = {
      dtlUsestatus: tabActiveIndex.value,
      customerId: customer.value.customerId,
      goodsName: filterObj.value.goodsName,
      contactIdList: filterObj.value.contactIdList,
      entryKeyword: filterObj.value.entryKeyword,
      goodsId: filterObj.value.goodsId,
      ...(filterObj.value.conType && {
        conType: conList.value.indexOf(filterObj.value.conType),
      }),
      userIdList: filterObj.value.userNames ? userIdLists.value : [],
      subArriveType: filterObj.value.subArriveType,
      entryId: filterObj.value.entryId,
      orderType: cardType.value,
      selectType: isJustSelf.value ? 0 : 3,
      startTime: timeList.value.length === 2 ? timeList.value[0] + ' 00:00:00' : undefined,
      endTime: timeList.value.length === 2 ? timeList.value[1] + ' 23:59:59' : undefined,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
    };

    const response = await OrderManageService.getCstmOrderList(requestParams);
    return {
      list: response.list || [],
      hasNextPage: response.hasNextPage || false,
      total: response.total || 0,
    };
  };

  // 获取分支机构数据
  const fetchContactList = async (params: { pageNum: number; pageSize: number }) => {
    const response = await OrderManageService.getConcatByCstmId({
      keyword: searchValueContact.value,
      customerId: customer.value.customerId,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
    });

    return {
      list: response.list || [],
      hasNextPage: response.hasNextPage || false,
      total: response.total || 0,
    };
  };

  // 分支机构相关方法
  const contactOnRefresh = () => {
    contactPage.value = 1;
    contactFinished.value = false;
    contactRefreshing.value = false;
  };

  const contactOnLoad = () => {
    // 加载更多逻辑在 wrapper 中处理
  };

  const contactToggle = (index: number) => {
    // 切换选择状态
    const checkbox = document.querySelectorAll('.contact-checkbox')[index] as HTMLInputElement;
    if (checkbox) {
      checkbox.click();
    }
  };

  const contactSureClick = () => {
    filterObj.value.contactIdList = deepClone(contactIdList.value);
    filterObj.value.contactString = `已选择${contactIdList.value.length}个分支机构`;
    contactShow.value = false;
  };

  // 核算单元相关方法
  const fetchEntryList = async () => {
    const response = await CommonService.queryEntryid();
    entryList.value = response || [];
  };

  const entryChangeClick = (item: EntryInfo) => {
    filterObj.value.entryId = item.entryid;
    filterObj.value.entryName = item.entryname;
    entryShow.value = false;
  };

  const onCancelEntry = () => {
    filterObj.value.entryId = '';
    filterObj.value.entryName = '';
    entryShow.value = false;
  };

  // 订阅状态相关方法
  const statusChangeClick = (item: StatusOption) => {
    filterObj.value.subArriveName = item.label;
    filterObj.value.subArriveType = item.value;
    statusShow.value = false;
  };

  const onCancelStatus = () => {
    filterObj.value.subArriveName = '';
    filterObj.value.subArriveType = '';
    statusShow.value = false;
  };

  // 切换显示范围
  const toggleJustSelf = () => {
    isJustSelf.value = !isJustSelf.value;
  };

  // 初始化权限
  const initPermissions = () => {
    needQueryAll.value = hasPermission('orderintegrateWx-query-all');
    needQueryAllEntrys.value = hasPermission('orderintegrateWx-query-entry');
    needQueryAllDept.value = hasPermission('orderintegrateWx-query-dept');
    managementOpflagForSaler.value = hasPermission('ManagementPermissionsAllowOperationsForSaler');
    managementOpflagForPurchaser.value = hasPermission(
      'ManagementPermissionsAllowOperationsForPurchaser'
    );
  };

  // 初始化页面数据
  const initPageData = (query: any) => {
    if (query.customer) {
      try {
        // 先尝试解码 URL 编码的字符串，然后再解析 JSON
        let customerStr = query.customer;
        // 如果字符串以 % 开头，说明是 URL 编码的
        if (customerStr.startsWith('%')) {
          customerStr = decodeURIComponent(customerStr);
        }
        const item = JSON.parse(customerStr);
        if (
          customer.value.customerId !== item.customerId ||
          cardType.value !== parseInt(query.type) ||
          filterObj.value.goodsId !== query.goodsId ||
          filterObj.value.goodsName !== query.goodsName ||
          (timeList.value.length > 0 &&
            query.startTime &&
            (timeList.value[0] !== query.startTime || timeList.value[1] !== query.endTime)) ||
          (timeList.value.length === 0 && query.startTime) ||
          (timeList.value.length > 0 && !query.startTime)
        ) {
          cardType.value = parseInt(query.type);
          if (cardType.value === 2) {
            tabActiveIndex.value = 0;
          }
          customer.value = item;
          if (query.startTime) {
            timeList.value = [query.startTime, query.endTime];
          } else {
            timeList.value = [];
          }
          filterObj.value.goodsId = query.goodsId;
          filterObj.value.goodsName = query.goodsName;
          return true; // 需要刷新
        }
      } catch (error) {
        console.error('解析 customer 参数失败：', error, query.customer);
        // 解析失败时，尝试直接解码（可能已经是解码后的 JSON 字符串）
        try {
          const decodedStr = decodeURIComponent(query.customer);
          const item = JSON.parse(decodedStr);
          customer.value = item;
          return true;
        } catch (e) {
          console.error('二次解析 customer 参数也失败：', e);
        }
      }
    }
    return false;
  };

  return {
    // 响应式数据
    show,
    showTime,
    showCont,
    entryShow,
    contactShow,
    statusShow,
    isJustSelf,
    tabActiveIndex,
    cardType,
    customer,
    timeList,
    userIdLists,
    contactIdList,
    contactDataList,
    contactPage,
    contactLoading,
    contactFinished,
    contactRefreshing,
    searchValueContact,
    filterObj,
    conList,
    entryList,
    statusList,
    needQueryAll,
    needQueryAllEntrys,
    needQueryAllDept,
    managementOpflagForSaler,
    managementOpflagForPurchaser,

    // 计算属性
    getOtherClass,

    // 方法
    showPopup,
    refreshFilter,
    handleFilter,
    closePopup,
    onConfirm,
    onPickConfirm,
    fetchOrderList,
    fetchContactList,
    contactOnRefresh,
    contactOnLoad,
    contactToggle,
    contactSureClick,
    fetchEntryList,
    entryChangeClick,
    onCancelEntry,
    statusChangeClick,
    onCancelStatus,
    toggleJustSelf,
    initPermissions,
    initPageData,
  };
};
