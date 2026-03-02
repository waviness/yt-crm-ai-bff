import type { CustomerInfo, EventCount, PersonInfo, OrgType, RankCustomer } from '../types';

export function useCustomerAnalysis() {
  // 是否从驾驶舱进入
  const isCabin = ref(false);

  // 搜索相关
  const searchValue = ref('');
  const fullPopShow = ref(false);
  const custLoading = ref(false);
  const custList = ref<CustomerInfo[]>([]);

  // 当前选中客户
  const curCustom = ref<CustomerInfo>({} as CustomerInfo);

  // 客户详情
  const dataSource = ref<CustomerInfo>({} as CustomerInfo);
  const dataLoading = ref(false);

  // 标题显示控制
  const showFullTitle = ref(false);
  const titleOverflow = ref(false);

  // 客情统计
  const eventCount = ref<EventCount>({} as EventCount);
  const countLoading = ref(false);

  // 相关人员
  const active = ref(0);
  const personList = ref<PersonInfo[]>([]);
  const personLoading = ref(false);

  // 机构类型和排行榜
  const loading = ref(false);
  const typeList = ref<OrgType[]>([]);
  const rankList = ref<{ [key: string]: RankCustomer[] }>({});

  // 业务员列表（格式化）
  const salersList = computed(() => {
    if (dataSource.value?.saleManList) {
      return dataSource.value.saleManList.map((element: any) => {
        return `${element.userName}(${element.orgName})`;
      });
    }
    return [];
  });

  // 获取客户搜索列表
  const getCustList = async (custom: string) => {
    if (!custom) {
      custList.value = [];
      return;
    }

    custLoading.value = true;
    try {
      const res = isCabin.value
        ? await CustomerService.cockpitQueryCustList({ custom })
        : await CustomerService.queryCustList({ custom });

      custList.value = res || [];
    } catch (error) {
      console.error('获取客户列表失败:', error);
    } finally {
      custLoading.value = false;
    }
  };

  // 获取机构类型列表
  const getTypeList = async () => {
    try {
      const res = await CommonService.getDictionaries({
        keyword: '',
        pageNum: 1,
        pageSize: 10000,
        usestatus: 1,
        typeId: 26,
      });

      // 兼容处理：尝试从 res.data.list, res.list, res.data, 或 res 本身获取数组
      // 注意：根据控制台截图，res 直接是分页对象 { list: [...], total: ... }，没有 success 字段
      let list = [];
      if (Array.isArray(res)) {
        list = res;
      } else if (Array.isArray(res?.list)) {
        list = res.list;
      } else if (Array.isArray(res?.data?.list)) {
        list = res.data.list;
      } else if (Array.isArray(res?.data)) {
        list = res.data;
      }

      if (list.length > 0) {
        typeList.value = list.map((ele: any) => {
          // 简化名称
          const nameMap: { [key: string]: string } = {
            省级医疗机构: '省级',
            市级医疗机构: '市级',
            县级医疗机构: '县级',
            基层医疗机构: '基层',
            民营医疗机构: '民营',
            连锁药店: '连锁',
            单体药店: '药店',
            对外商业调拨: '商业',
          };
          return {
            ...ele,
            DIC_SELECT_NAME: nameMap[ele.DIC_SELECT_NAME] || ele.DIC_SELECT_NAME,
          };
        });

        // 获取排行榜数据
        await getDataList();
      }
    } catch (error) {
      console.error('获取类型列表失败:', error);
    }
  };

  // 获取排行榜数据
  const getDataList = async () => {
    loading.value = true;
    // TODO: 接口暂时不需要，使用硬编码数据，需要时再放开
    // const res = await CustomerService.queryTopTenCustomers({});
    loading.value = false;
    rankList.value = getMockRankData();
  };

  // 选择客户
  const onSelectCustomer = (item: CustomerInfo) => {
    curCustom.value = item;
    searchValue.value = `${item.custId}/${item.custName}`;
    fullPopShow.value = false;
    personList.value = [];

    // 获取客户详情
    getData(item.custId);
    getEventCount();
  };

  // 获取客户详情
  const getData = async (custId: string) => {
    dataLoading.value = true;
    try {
      const res = await CustomerService.queryCustViewInfo({ custId });
      dataSource.value = res;

      // 获取相关人员
      if (dataSource.value.saleManList?.length) {
        active.value = 0;
        getPersonList();
      }

      // 检查标题是否溢出（需要在nextTick中执行）
      nextTick(() => {
        // titleOverflow.value = checkTitleOverflow();
      });
    } catch (error) {
      console.error('获取客户详情失败:', error);
    } finally {
      dataLoading.value = false;
    }
  };

  // 获取客情统计数据
  const getEventCount = async () => {
    countLoading.value = true;
    try {
      const res = isCabin.value
        ? await CustomerService.cockpitQueryCustEventCount({ custId: curCustom.value.custId })
        : await CustomerService.queryCustEventCount({ custId: curCustom.value.custId });

      eventCount.value = res;
    } catch (error) {
      console.error('获取客情统计失败:', error);
    } finally {
      countLoading.value = false;
    }
  };

  // 获取相关人员列表
  const getPersonList = async () => {
    personLoading.value = true;
    personList.value = [];

    try {
      const params = {
        custId: curCustom.value.custId,
        userId: dataSource.value.saleManList![active.value].userId,
      };

      const res = isCabin.value
        ? await CustomerService.cockpitQueryPersonList(params)
        : await CustomerService.queryViewPersonList(params);

      personList.value = res || [];
    } catch (error) {
      console.error('获取人员列表失败:', error);
    } finally {
      personLoading.value = false;
    }
  };

  // 跳转到事件列表
  const toList = () => {
    uni.navigateTo({
      url: `/subpackages/customer/analysis/list?custId=${curCustom.value.custId}&isCabin=${isCabin.value}`,
    });
  };

  // 跳转到人员详情
  const toPerson = (item: PersonInfo) => {
    uni.navigateTo({
      url: `/subpackages/customer/analysis/person?item=${encodeURIComponent(JSON.stringify(item))}&custId=${curCustom.value.custId}&isCabin=${isCabin.value}`,
    });
  };

  // 初始化
  const init = () => {
    // 检查是否从驾驶舱进入
    // @ts-ignore
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const params: any = (currentPage as any).options || {};

    if (params.custId) {
      isCabin.value = true;
      curCustom.value = params;
      searchValue.value = `${params.custId}/${params.custName}`;
      personList.value = [];
      getData(params.custId);
      getEventCount();
    } else {
      getTypeList();
    }
  };

  return {
    isCabin,
    searchValue,
    fullPopShow,
    custLoading,
    custList,
    curCustom,
    dataSource,
    dataLoading,
    showFullTitle,
    titleOverflow,
    eventCount,
    countLoading,
    active,
    personList,
    personLoading,
    loading,
    typeList,
    rankList,
    salersList,
    getCustList,
    onSelectCustomer,
    getPersonList,
    toList,
    toPerson,
    init,
  };
}

// 模拟排行榜数据（与 Vue2 版本保持同步）
function getMockRankData() {
  return {
    '1': [
      {
        custId: 45247,
        custName: '浙江大学医学院附属第一医院',
        orgType: '省级医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 20,
        monthRank2: 1,
        growthRank2: 9,
      },
      {
        custId: 44918,
        custName: '浙江省肿瘤医院/浙江省肿瘤中心/浙江省肿瘤医院互联网医院',
        orgType: '省级医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 20,
        monthRank2: 2,
        growthRank2: 14,
      },
      {
        custId: 45286,
        custName:
          '浙江大学医学院附属邵逸夫医院/浙江省邵逸夫医院/浙江大学医学院附属邵逸夫医院纳里健康科技有限公司互联网医院',
        orgType: '省级医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 20,
        monthRank2: 3,
        growthRank2: 10,
      },
      {
        custId: 45246,
        custName: '浙江大学医学院附属第二医院/浙江省第二医院/浙江大学医学院附属第二医院互联网医院',
        orgType: '省级医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 20,
        monthRank2: 4,
        growthRank2: 19,
      },
      {
        custId: 44917,
        custName: '浙江省人民医院',
        orgType: '省级医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 20,
        monthRank2: 5,
        growthRank2: 5,
      },
      {
        custId: 44868,
        custName: '浙江省中医院',
        orgType: '省级医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 20,
        monthRank2: 6,
        growthRank2: 15,
      },
      {
        custId: 44960,
        custName: '浙江省立同德医院/浙江省立同德医院互联网医院',
        orgType: '省级医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 20,
        monthRank2: 7,
        growthRank2: 11,
      },
      {
        custId: 44836,
        custName: '浙江医院/浙江医院互联网医院',
        orgType: '省级医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 20,
        monthRank2: 8,
        growthRank2: 18,
      },
      {
        custId: 45248,
        custName: '浙江大学医学院附属儿童医院',
        orgType: '省级医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 20,
        monthRank2: 9,
        growthRank2: 8,
      },
      {
        custId: 13669,
        custName: '浙江大学医学院附属第四医院/浙江大学医学院附属第四医院医共体',
        orgType: '省级医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '金华市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 20,
        monthRank2: 10,
        growthRank2: 7,
      },
    ],
    '2': [
      {
        custId: 44843,
        custName: '杭州市中医院/浙江中医药大学附属广兴医院/杭州市中医院互联网医院',
        orgType: '市级医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 95,
        monthRank2: 1,
        growthRank2: 30,
      },
      {
        custId: 44976,
        custName: '杭州市第一人民医院/杭州市第一人民医院互联网医院',
        orgType: '市级医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 95,
        monthRank2: 2,
        growthRank2: 70,
      },
      {
        custId: 3162,
        custName: '湖州市中心医院/湖州市中心医院微脉互联网医院',
        orgType: '市级医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '湖州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 95,
        monthRank2: 3,
        growthRank2: 45,
      },
      {
        custId: 65770,
        custName: '杭州市滨江医院/浙江大学医学院杭州市滨江医院/浙江大学医学院附属第二医院滨江院区',
        orgType: '市级医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 95,
        monthRank2: 4,
        growthRank2: 52,
      },
      {
        custId: 64536,
        custName: '台州市中心医院/台州学院附属医院/台州市中心医院互联网医院',
        orgType: '市级医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '台州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 95,
        monthRank2: 5,
        growthRank2: 75,
      },
      {
        custId: 10620,
        custName: '衢州市人民医院/衢州中心医院/衢州市医学应急救治中心/衢州市人民医院互联网医院',
        orgType: '市级医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '衢州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 95,
        monthRank2: 6,
        growthRank2: 41,
      },
      {
        custId: 44975,
        custName: '杭州市第三人民医院/杭州市惠民医院/杭州市第三人民医院互联网医院',
        orgType: '市级医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 95,
        monthRank2: 7,
        growthRank2: 40,
      },
      {
        custId: 44978,
        custName: '杭州市红十字会医院/浙江省中西医结合医院/杭州市红十字会医院互联网医院',
        orgType: '市级医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 95,
        monthRank2: 8,
        growthRank2: 36,
      },
      {
        custId: 64740,
        custName: '杭州市第七人民医院/杭州市精神病医院/杭州市第七人民医院互联网医院',
        orgType: '市级医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 95,
        monthRank2: 9,
        growthRank2: 25,
      },
      {
        custId: 45041,
        custName: '杭州师范大学附属医院/杭州市第二人民医院/杭州师范大学附属医院互联网医院',
        orgType: '市级医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 95,
        monthRank2: 10,
        growthRank2: 69,
      },
    ],
    '3': [
      {
        custId: 14201,
        custName: '永康市第一人民医院/永康市第一人民医院互联网医院',
        orgType: '县级医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '金华市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 279,
        monthRank2: 1,
        growthRank2: 78,
      },
      {
        custId: 13191,
        custName: '东阳市人民医院/浙中肿瘤专科医院',
        orgType: '县级医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '金华市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 279,
        monthRank2: 2,
        growthRank2: 154,
      },
      {
        custId: 45174,
        custName: '杭州市临平区第一人民医院',
        orgType: '县级医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 279,
        monthRank2: 3,
        growthRank2: 118,
      },
      {
        custId: 2984,
        custName: '德清县人民医院/德清县人民医院(纳里)互联网医院',
        orgType: '县级医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '湖州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 279,
        monthRank2: 4,
        growthRank2: 147,
      },
      {
        custId: 45170,
        custName: '杭州市萧山区第一人民医院/杭州市萧山区第一人民医院互联网医院',
        orgType: '县级医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 279,
        monthRank2: 5,
        growthRank2: 101,
      },
      {
        custId: 64537,
        custName: '仙居县人民医院/仙居县人民医院互联网医院',
        orgType: '县级医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '台州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 279,
        monthRank2: 6,
        growthRank2: 42,
      },
      {
        custId: 44894,
        custName: '三门县人民医院/三门县人民医院医疗卫生服务共同体',
        orgType: '县级医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '台州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 279,
        monthRank2: 7,
        growthRank2: 73,
      },
      {
        custId: 45166,
        custName: '杭州市富阳区第一人民医院',
        orgType: '县级医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 279,
        monthRank2: 8,
        growthRank2: 120,
      },
      {
        custId: 2113,
        custName: '浙江省嘉善县第一人民医院/浙江大学医学院附属第二医院嘉善分院',
        orgType: '县级医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '嘉兴市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 279,
        monthRank2: 9,
        growthRank2: 90,
      },
      {
        custId: 64564,
        custName: '玉环市第二人民医院/玉环市第二人民医院健共体集团',
        orgType: '县级医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '台州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 279,
        monthRank2: 10,
        growthRank2: 7,
      },
    ],
    '4': [
      {
        custId: 64676,
        custName: '杭州市拱墅区小河湖墅街道社区卫生服务中心/拱墅区红十字会医院',
        orgType: '基层医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 678,
        monthRank2: 1,
        growthRank2: 246,
      },
      {
        custId: 45374,
        custName: '杭州市余杭区良渚街道社区卫生服务中心',
        orgType: '基层医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 678,
        monthRank2: 2,
        growthRank2: 206,
      },
      {
        custId: 64543,
        custName: '杭州市滨江区长河街道社区卫生服务中心',
        orgType: '基层医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 678,
        monthRank2: 3,
        growthRank2: 225,
      },
      {
        custId: 64618,
        custName: '杭州市滨江区西兴街道社区卫生服务中心',
        orgType: '基层医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 678,
        monthRank2: 4,
        growthRank2: 187,
      },
      {
        custId: 64355,
        custName: '杭州市西湖区三墩镇社区卫生服务中心/杭州市西湖区中西医结合医院',
        orgType: '基层医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 678,
        monthRank2: 5,
        growthRank2: 196,
      },
      {
        custId: 65040,
        custName: '杭州市上城区笕桥街道社区卫生服务中心/杭州烧伤专科医院',
        orgType: '基层医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 678,
        monthRank2: 6,
        growthRank2: 143,
      },
      {
        custId: 45364,
        custName: '杭州市上城区小营街道社区卫生服务中心',
        orgType: '基层医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 678,
        monthRank2: 7,
        growthRank2: 310,
      },
      {
        custId: 64637,
        custName:
          '杭州市上城区南星街道社区卫生服务中心/杭州市上城区中西医结合医院/杭州市上城区关怀医院/杭州市上城区南星街道社区卫生服务中心互联网医院',
        orgType: '基层医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 678,
        monthRank2: 8,
        growthRank2: 313,
      },
      {
        custId: 64617,
        custName: '杭州市滨江区浦沿街道社区卫生服务中心',
        orgType: '基层医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 678,
        monthRank2: 9,
        growthRank2: 242,
      },
      {
        custId: 64709,
        custName: '杭州市拱墅区中西医结合医院/杭州市拱墅区祥符街道社区卫生服务中心',
        orgType: '基层医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 678,
        monthRank2: 10,
        growthRank2: 168,
      },
    ],
    '5': [
      {
        custId: 64661,
        custName: '宁波明州医院有限公司',
        orgType: '民营医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '宁波市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 675,
        monthRank2: 1,
        growthRank2: 262,
      },
      {
        custId: 13756,
        custName: '浙江金华广福肿瘤医院/金华市第三医院',
        orgType: '民营医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '金华市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 675,
        monthRank2: 2,
        growthRank2: 400,
      },
      {
        custId: 45100,
        custName: '杭州天目山医院有限公司',
        orgType: '民营医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 675,
        monthRank2: 3,
        growthRank2: 120,
      },
      {
        custId: 96726,
        custName: '义乌復元第一医院有限公司',
        orgType: '民营医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '金华市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 675,
        monthRank2: 4,
        growthRank2: 453,
      },
      {
        custId: 135796,
        custName: '宁波泰康脑科医院有限公司',
        orgType: '民营医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '宁波市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 675,
        monthRank2: 5,
        growthRank2: 27,
      },
      {
        custId: 45213,
        custName: '中国人民解放军陆军第七十二集团军医院/湖州市福音医院',
        orgType: '民营医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '湖州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 675,
        monthRank2: 6,
        growthRank2: 242,
      },
      {
        custId: 45133,
        custName: '树兰(杭州)医院有限公司',
        orgType: '民营医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 675,
        monthRank2: 7,
        growthRank2: 397,
      },
      {
        custId: 64018,
        custName: '杭州华医国康医院',
        orgType: '民营医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 675,
        monthRank2: 8,
        growthRank2: 6,
      },
      {
        custId: 144445,
        custName: '慈溪弘和医院有限公司',
        orgType: '民营医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '宁波市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 675,
        monthRank2: 9,
        growthRank2: 269,
      },
      {
        custId: 14520,
        custName: '横店文荣医院/东阳市横店集团医院',
        orgType: '民营医疗机构',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '金华市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 675,
        monthRank2: 10,
        growthRank2: 433,
      },
    ],
    '6': [
      {
        custId: 63150,
        custName: '阿里健康大药房医药连锁有限公司',
        orgType: '连锁药店',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '广州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 270,
        monthRank2: 1,
        growthRank2: 66,
      },
      {
        custId: 45210,
        custName: '浙江震元医药连锁有限公司',
        orgType: '连锁药店',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '绍兴市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 270,
        monthRank2: 2,
        growthRank2: 157,
      },
      {
        custId: 45250,
        custName: '瑞人堂医药集团股份有限公司',
        orgType: '连锁药店',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '台州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 270,
        monthRank2: 3,
        growthRank2: 37,
      },
      {
        custId: 11041,
        custName: '衢州德信行天福堂大药房有限公司',
        orgType: '连锁药店',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '衢州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 270,
        monthRank2: 4,
        growthRank2: 43,
      },
      {
        custId: 10357,
        custName: '温州市布衣大药房连锁有限公司',
        orgType: '连锁药店',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '温州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 270,
        monthRank2: 5,
        growthRank2: 152,
      },
      {
        custId: 1626,
        custName: '嘉兴市老百姓药品零售有限公司',
        orgType: '连锁药店',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '嘉兴市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 270,
        monthRank2: 6,
        growthRank2: 72,
      },
      {
        custId: 61604,
        custName: '京东大药房泰州连锁有限公司',
        orgType: '连锁药店',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '泰州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 270,
        monthRank2: 7,
        growthRank2: 58,
      },
      {
        custId: 62002,
        custName: '浙江云开亚美大药房连锁有限公司',
        orgType: '连锁药店',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 270,
        monthRank2: 8,
        growthRank2: 5,
      },
      {
        custId: 61733,
        custName: '杭州保民堂药房连锁有限公司',
        orgType: '连锁药店',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 270,
        monthRank2: 9,
        growthRank2: 44,
      },
      {
        custId: 1581,
        custName: '海宁市老百姓大药房有限责任公司',
        orgType: '连锁药店',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '嘉兴市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 270,
        monthRank2: 10,
        growthRank2: 162,
      },
    ],
    '7': [
      {
        custId: 64744,
        custName: '浙江抗癌科技开发有限公司',
        orgType: '单体药店',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 2286,
        monthRank2: 1,
        growthRank2: 552,
      },
      {
        custId: 129539,
        custName: '东阳市东人医医疗产业管理有限公司',
        orgType: '单体药店',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '金华市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 2286,
        monthRank2: 2,
        growthRank2: 144,
      },
      {
        custId: 116555,
        custName: '阿里健康大药房(天津)有限公司',
        orgType: '单体药店',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '天津市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 2286,
        monthRank2: 3,
        growthRank2: 199,
      },
      {
        custId: 85043,
        custName: '京东大药房(天津)有限公司',
        orgType: '单体药店',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '天津市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 2286,
        monthRank2: 4,
        growthRank2: 547,
      },
      {
        custId: 125297,
        custName: '京东大药房(东莞)有限公司',
        orgType: '单体药店',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '东莞市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 2286,
        monthRank2: 5,
        growthRank2: 348,
      },
      {
        custId: 82742,
        custName: '京东大药房(沈阳)有限公司',
        orgType: '单体药店',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '沈阳市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 2286,
        monthRank2: 6,
        growthRank2: 289,
      },
      {
        custId: 13052,
        custName: '金华物产明治大药房有限责任公司',
        orgType: '单体药店',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '金华市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 2286,
        monthRank2: 7,
        growthRank2: 520,
      },
      {
        custId: 99457,
        custName: '四川京东大药房有限公司广汉店',
        orgType: '单体药店',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '德阳市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 2286,
        monthRank2: 8,
        growthRank2: 362,
      },
      {
        custId: 118170,
        custName: '京东大药房(杭州)有限公司',
        orgType: '单体药店',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 2286,
        monthRank2: 9,
        growthRank2: 354,
      },
      {
        custId: 138595,
        custName: '北京京东健康有限公司',
        orgType: '单体药店',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '北京市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 2286,
        monthRank2: 10,
        growthRank2: 586,
      },
    ],
    '8': [
      {
        custId: 134222,
        custName: '阿里健康医药(广东)有限公司',
        orgType: '对外商业调拨',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '广州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 699,
        monthRank2: 1,
        growthRank2: 23,
      },
      {
        custId: 1916,
        custName: '台州瑞人堂药业有限公司',
        orgType: '对外商业调拨',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '台州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 699,
        monthRank2: 2,
        growthRank2: 500,
      },
      {
        custId: 7691,
        custName: '浙江九欣医药有限公司',
        orgType: '对外商业调拨',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 699,
        monthRank2: 3,
        growthRank2: 89,
      },
      {
        custId: 129410,
        custName: '浙江海王星辰医药有限公司',
        orgType: '对外商业调拨',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '湖州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 699,
        monthRank2: 4,
        growthRank2: 573,
      },
      {
        custId: 94836,
        custName: '浙江珍诚医药科技有限公司',
        orgType: '对外商业调拨',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 699,
        monthRank2: 5,
        growthRank2: 533,
      },
      {
        custId: 128811,
        custName: '丰沃达生物科技(杭州)有限公司',
        orgType: '对外商业调拨',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 699,
        monthRank2: 6,
        growthRank2: 477,
      },
      {
        custId: 1351,
        custName: '浙江海派医药有限公司',
        orgType: '对外商业调拨',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '温州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 699,
        monthRank2: 7,
        growthRank2: 71,
      },
      {
        custId: 82235,
        custName: '浙江健一行医药科技有限公司',
        orgType: '对外商业调拨',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '杭州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 699,
        monthRank2: 8,
        growthRank2: 484,
      },
      {
        custId: 10544,
        custName: '温州全亿医药有限公司',
        orgType: '对外商业调拨',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '温州市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 699,
        monthRank2: 9,
        growthRank2: 524,
      },
      {
        custId: 8426,
        custName: '宁波药材股份有限公司',
        orgType: '对外商业调拨',
        orgTypeNum: null,
        monthRank: null,
        lastMonthRank: null,
        growthRank: null,
        city: '宁波市',
        batchCode: '20250401',
        monthRate: null,
        yearRate: null,
        orgTypeNum2: 699,
        monthRank2: 10,
        growthRank2: 42,
      },
    ],
  };
}
