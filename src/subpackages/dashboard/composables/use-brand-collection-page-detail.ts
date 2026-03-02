import type { EntryObj } from '../types';
const { formatPercentage, formatTenThousand } = useFormatter();
const dashboardStore = useDashboardStore();

export function useBrandCollectionDetail() {
  const entryObj = ref<EntryObj>({
    deptId: '',
    deptName: '',
    brandId: '',
    brandName: '',
  });
  const brandHeaderObj = reactive({
    value: '',
    yearNetIncrease: '',
    increment: '',
  });
  const statusActive = ref(0); // 0 品种 1 业态
  const salesTabValue = ref(1); // 1 销售额 2 销售数量
  const pageTypeValue = ref(1); // 1 品牌详情界面 2 品牌下的品种详情界面
  let businessMiddleList = ref<any[]>([]);
  let areaArr = reactive(['', '']);
  let searchVal = ref('');
  const brandChartData = ref({
    categories: [
      { value: 0.25, color: '#EA394B' }, // -100到-50
      { value: 0.5, color: '#D55B26' }, // -50到0
      { value: 0.75, color: '#00A870' }, // 0到50
      { value: 1, color: '#2271F5' }, // 50到100
    ],
    series: [
      {
        name: '完成率',
        data: 0,
      },
    ],
  });

  const brandOpts = ref({
    padding: [0, 0, 0, 0],
    title: {
      name: '',
      fontSize: 12,
      color: '#2fc25b',
      offsetY: 0,
    },
    subtitle: {
      name: '1',
      fontSize: 12,
      color: '#666666',
      offsetY: 10,
    },
    extra: {
      gauge: {
        type: 'default',
        width: 10,
        labelColor: 'transparent', // 将标签颜色设置为透明
        startAngle: 0.75,
        endAngle: 0.25,
        startNumber: 0,
        endNumber: 100,
        labelFormat: '',
        splitLine: {
          fixRadius: 0,
          splitNumber: 0,
          width: 10,
          color: '#FFFFFF',
          childNumber: 0, // 将子刻度数量设置为0
          childWidth: 12,
        },
        pointer: {
          width: 10,
          color: 'auto',
        },
      },
    },
  });

  // 根据完成率值动态计算颜色
  const getColorByValue = (value: number) => {
    console.log(value);
    if (value < -50) {
      return '#EA394B'; // 红色
    } else if (value < 0) {
      return '#D55B26'; // 橙色
    } else if (value < 50) {
      return '#00A870'; // 绿色
    } else {
      return '#2271F5'; // 蓝色
    }
  };
  const chartsShow = ref(false);
  const formatUserDataFormat = (data: number) => {
    if (data < -1) {
      return 0;
    }
    if (data > 1) {
      return 1;
    }
    if (data > -1 && data < 0) {
      return Math.abs(data) / 2;
    }
    if (data > 0) {
      return Math.abs(data) / 2 + 0.5;
    } else {
      return data;
    }
  };
  const fetchGetDeptTotalStat = async () => {
    const response = await DashboardService.getDeptTotalStat({
      date: dashboardStore.dateTime,
      deptId: entryObj.value.deptId,
      brandId: entryObj.value.brandId,
    });
    if (response.code === '200') {
      brandHeaderObj.value = formatTenThousand(response.data.yearAmount);
      brandHeaderObj.yearNetIncrease = formatTenThousand(response.data.yearNetIncrease, {
        showPlusSign: false,
      });
      brandHeaderObj.increment = formatPercentage(response.data.yearOnPercent);
      const useData = +formatPercentage(response.data.monthOnPercent, { showPercentage: false });
      const formatUserData = formatUserDataFormat(response.data.monthOnPercent);

      brandChartData.value.series[0].data = formatUserData;
      const color = getColorByValue(useData);
      brandOpts.value.subtitle.name = useData + '%';
      brandOpts.value.subtitle.color = color;
      // brandOpts.value.extra.gauge.pointer.color = color;
      console.log(brandOpts.value);
      console.log(brandChartData.value);
      chartsShow.value = true;
    }
  };
  const fetchGetAllList = async (pagination: { pageNum: number; pageSize: number }) => {
    if (pageTypeValue.value === 1) {
      if (statusActive.value === 0) {
        return fetchGetAllListByBrand(pagination);
      }
      if (statusActive.value === 1) {
        if (searchVal.value) {
          const listData = [];
          for (let index = 0; index < businessMiddleList.value.length; index++) {
            const element = businessMiddleList.value[index];
            if (String(element.businessForm).indexOf(searchVal.value) !== -1) {
              listData.push(element);
            }
          }

          return {
            list: listData,
            hasNextPage: false,
            total: 0,
          };
        }
        return fetchGetFormStatListByDeptAndBrand();
      }
      return {
        list: [],
        hasNextPage: false,
        total: 0,
      };
    } else if (pageTypeValue.value === 2) {
      return fetchGetStatListByGoods(pagination);
    } else {
      return fetchGetStatList(pagination);
    }
  };
  const fetchGetAllListByBrand = async (pagination: { pageNum: number; pageSize: number }) => {
    const response = await DashboardService.getAllListByBrand({
      date: dashboardStore.dateTime,
      deptId: entryObj.value.deptId,
      brandId: entryObj.value.brandId,
      showType: salesTabValue.value,
      goodsKeyword: searchVal.value,
      pageFlag: 1,
      queryTop3Flag: 0,
      pageSize: pagination.pageSize,
      pageNum: pagination.pageNum,
    });
    const list = response.data.list.map((val: any) => {
      return {
        objId: val.goodsId,
        objName: val.goodsName,
        arrowFlag: true, // 是否有箭头 && 标题有颜色
        value: formatTenThousand(val.yearAmount),
        increment: formatPercentage(val.yearOnPercent),
        yearNetIncrease: formatTenThousand(val.yearNetIncrease),
      };
    });
    return {
      list: list,
      hasNextPage: response.data.hasNextPage,
      total: response.data.total,
    };
  };
  const fetchGetStatListByGoods = async (pagination: { pageNum: number; pageSize: number }) => {
    const response = await DashboardService.getStatListByGoods({
      date: dashboardStore.dateTime,
      deptId: entryObj.value.deptId,
      brandId: entryObj.value.brandId,
      goodsId: entryObj.value.goodsId,
      pageSize: pagination.pageSize,
      pageNum: pagination.pageNum,
      sortField: 1,
      sortOrder: 2,
    });
    const list = response.data.list.map((val: any) => {
      return {
        objId: val.customerId,
        objName: val.customerName,
        value: formatTenThousand(val.yearAmount),
        increment: formatPercentage(val.yearOnPercent),
        yearNetIncrease: formatTenThousand(val.yearNetIncrease),
      };
    });
    return {
      list: { ...list, areaShow: false },
      hasNextPage: response.data.hasNextPage,
      total: response.data.total,
    };
  };
  const fetchGetFormStatListByDeptAndBrand = async () => {
    const response = await DashboardService.getFormStatListByDeptAndBrand({
      date: dashboardStore.dateTime,
      deptId: entryObj.value.deptId,
      brandId: entryObj.value.brandId,
    });
    const list = response.data.map((val: any) => {
      const sumValue = arithmetic.sum([val.yearAmount, val.yearOnAmount]);
      return {
        businessForm: val.businessForm,
        yearAmountText: time.format(new Date(dashboardStore.dateTime), time.FORMATS.YEAR),
        yearAmount:
          val.yearAmount < 1000 ? val.yearAmount.toFixed(1) : formatTenThousand(val.yearAmount),
        yearAmountDWShow: val.yearAmount < 1000,
        yearAmountProgress:
          sumValue === 0
            ? 0
            : arithmetic.multiply(arithmetic.divide(val.yearAmount, sumValue), 100),
        yearOnAmountText: +time.format(new Date(dashboardStore.dateTime), time.FORMATS.YEAR) - 1,
        yearOnAmount:
          val.yearOnAmount < 1000
            ? val.yearOnAmount.toFixed(1)
            : formatTenThousand(val.yearOnAmount),
        yearOnAmountDWShow: val.yearOnAmount < 1000,
        yearOnAmountProgress:
          sumValue === 0
            ? 0
            : arithmetic.multiply(arithmetic.divide(val.yearOnAmount, sumValue), 100),
        increment: formatPercentage(val.yearOnPercent),
      };
    });
    businessMiddleList.value = JSON.parse(JSON.stringify(list));
    return {
      list: list,
      hasNextPage: false,
      total: 0,
    };
  };

  const fetchGetStatList = async (pagination: { pageNum: number; pageSize: number }) => {
    const response = await DashboardService.getStatList({
      date: dashboardStore.dateTime,
      deptId: entryObj.value.deptId,
      brandId: entryObj.value.brandId,
      goodsId: entryObj.value.goodsId,
      businessForm: entryObj.value.businessForm,
      area: '',
      city: areaArr[1],
      province: areaArr[0],
      customerKeyword: searchVal.value,
      pageSize: pagination.pageSize,
      pageNum: pagination.pageNum,
      sortField: 1,
      sortOrder: 2,
    });
    const list = response.data.list.map((val: any) => {
      return {
        objId: val.customerId,
        objName: val.customerName,
        areaText: val.city.split('市')[0] + '地区',
        arrowFlag: true, // 是否有箭头 && 标题有颜色
        value: formatTenThousand(val.yearAmount),
        increment: formatPercentage(val.yearOnPercent),
        yearNetIncrease: formatTenThousand(val.yearNetIncrease),
      };
    });
    return {
      list: list,
      hasNextPage: response.data.hasNextPage,
      total: response.data.total,
    };
  };
  const fetchGetAllListByBrandOne = async () => {
    const response = await DashboardService.getAllListByBrand({
      date: dashboardStore.dateTime,
      deptId: entryObj.value.deptId,
      brandId: entryObj.value.brandId,
      showType: salesTabValue.value,
      goodsKeyword: entryObj.value.goodsId,
      sortField: 1,
      sortOrder: 2,
      pageFlag: 1,
      pageNum: 1,
      pageSize: 1,
    });
    if (response.code === '200') {
      brandHeaderObj.value = formatTenThousand(response.data.list[0].yearAmount);
      brandHeaderObj.yearNetIncrease = formatTenThousand(response.data.list[0].yearNetIncrease, {
        showPlusSign: false,
      });
      brandHeaderObj.increment = formatPercentage(response.data.list[0].yearOnPercent, {
        showPlusSign: true,
      });
      const useData = +formatPercentage(response.data.list[0].monthOnPercent, {
        showPercentage: false,
      });
      const formatUserData = formatUserDataFormat(response.data.list[0].monthOnPercent);
      brandChartData.value.series[0].data = formatUserData;
      const color = getColorByValue(useData);
      brandOpts.value.subtitle.name = useData + '%';
      brandOpts.value.subtitle.color = color;
      chartsShow.value = true;
    }
  };
  const fetchGetRegionStatList = async () => {
    const response = await DashboardService.getRegionStatList({
      brandId: entryObj.value.brandId,
      businessForm: entryObj.value.businessForm,
      date: dashboardStore.dateTime,
      deptId: entryObj.value.deptId,
      pageNum: 1,
      pageSize: 5,
    });
    if (response.code === '200') {
      brandHeaderObj.value = formatTenThousand(response.data.list[0].yearAmount);
      brandHeaderObj.yearNetIncrease = formatTenThousand(response.data.list[0].yearNetIncrease, {
        showPlusSign: false,
      });
      brandHeaderObj.increment = formatPercentage(response.data.list[0].yearOnPercent, {
        showPlusSign: true,
      });
      const useData = +formatPercentage(response.data.list[0].monthOnPercent, {
        showPercentage: false,
      });
      const formatUserData = formatUserDataFormat(response.data.list[0].monthOnPercent);
      brandChartData.value.series[0].data = formatUserData;
      const color = getColorByValue(useData);
      brandOpts.value.subtitle.name = useData + '%';
      brandOpts.value.subtitle.color = color;
      chartsShow.value = true;
    }
  };
  /**
   * 获取并设置入口对象
   * @param entry - 入口对象，类型为EntryObj
   */
  const getEntryObj = (entry: EntryObj) => {
    if (pageTypeValue.value === 1) {
      // 定义一个接收EntryObj类型参数的函数
      entryObj.value = entry; // 将传入的entry值赋给entryObj的value属性
      entryObj.value.titleName = entry.brandName;
    }
    if (pageTypeValue.value === 2) {
      entryObj.value = entry;
      entryObj.value.deptName = entry.deptName + '/' + entry.brandName;
      entryObj.value.titleName = entry.goodsName;
    }
    if (pageTypeValue.value === 3) {
      entryObj.value = entry;
      entryObj.value.deptName = entry.deptName + '/' + entry.businessForm;
      entryObj.value.titleName = entry.brandName;
    }
  };
  const goodsClick = (data: any) => {
    if (pageTypeValue.value === 1) {
      router.push(
        '/subpackages/dashboard/brand-collection-page-detail?deptId=' +
          entryObj.value.deptId +
          '&deptName=' +
          entryObj.value.deptName +
          '&brandName=' +
          entryObj.value.brandName +
          '&brandId=' +
          entryObj.value.brandId +
          '&goodsId=' +
          data.objId +
          '&goodsName=' +
          data.objName +
          '&key=2'
      );
    } else {
      router.push(
        '/subpackages/dashboard/brand-collection-page-custom-detail?deptId=' +
          entryObj.value.deptId +
          '&deptName=' +
          entryObj.value.deptName +
          '&brandName=' +
          entryObj.value.brandName +
          '&brandId=' +
          entryObj.value.brandId +
          '&businessForm=' +
          entryObj.value.businessForm +
          '&customerId=' +
          data.objId +
          '&customerName=' +
          data.objName
      );
    }
  };
  const businessFormClick = (data: any) => {
    router.push(
      '/subpackages/dashboard/brand-collection-page-detail?deptId=' +
        entryObj.value.deptId +
        '&deptName=' +
        entryObj.value.deptName +
        '&brandName=' +
        entryObj.value.brandName +
        '&brandId=' +
        entryObj.value.brandId +
        '&businessForm=' +
        data.businessForm +
        '&key=3'
    );
  };
  let areaColumns = ref();
  let areaColumnData = ref();
  const transformData = (
    data: Array<{ province: string; city: string }>
  ): {
    columns: Ref<string[][]>;
    columnData: Ref<string[][]>;
  } => {
    // 提取所有省份
    const provinces = [...new Set(data.map(item => item.province))];

    // 按省份分组城市
    const citiesByProvince: Record<string, string[]> = {};
    data.forEach(item => {
      if (!citiesByProvince[item.province]) {
        citiesByProvince[item.province] = [];
      }
      citiesByProvince[item.province].push(item.city);
    });

    // 获取所有城市
    // const allCities = [...new Set(data.map(item => item.city))];

    // 构建 columns 结构：[['全部', ...所有省份], ['全部']]
    const columns = [['全部', ...provinces], ['全部']];

    // 构建 columnData 结构：[['全部'], [省份1对应的城市], [省份2对应的城市], ...]
    const columnData = [
      ['全部'], // 第一列对应"全部"选项
      ...provinces.map(province => citiesByProvince[province]),
    ];

    return {
      columns: ref(columns),
      columnData: ref(columnData),
    };
  };

  const fetchGetDynamicRegionList = async () => {
    const response = await DashboardService.getDynamicRegionList({
      brandId: entryObj.value.brandId,
      businessForm: entryObj.value.businessForm,
      date: dashboardStore.dateTime,
      deptId: entryObj.value.deptId,
    });
    if (response.code === '200') {
      //  this.areaList = [{ text: '全部', children: [{ text: '全部' }] }]
      // this.areaList = this.areaList.concat(this.buildRegionTree(res.data))
      const { columns, columnData } = transformData(response.data);
      areaColumns.value = columns.value;
      areaColumnData.value = columnData.value;
    }
  };
  const areaConfirm = (value: { value: [string, string] }) => {
    if (Array.isArray(value)) {
      areaArr[0] = value[0] === '全部' ? '' : value[0];
      areaArr[1] = value[0] === '全部' ? '' : value[1];
    }
  };
  const dateChange = ({ fulldate }: { fulldate: string }) => {
    dashboardStore.setDateTime(time.format(new Date(fulldate), 'yyyy-MM-dd'));
  };

  return {
    fetchGetDeptTotalStat,
    getEntryObj,
    fetchGetAllList,
    goodsClick,
    fetchGetAllListByBrandOne,
    businessFormClick,
    fetchGetRegionStatList,
    fetchGetDynamicRegionList,
    areaConfirm,
    dateChange,
    chartsShow,
    pageTypeValue,
    businessMiddleList,
    statusActive,
    salesTabValue,
    brandHeaderObj,
    entryObj,
    areaColumns,
    areaColumnData,
    areaArr,
    searchVal,
    brandOpts,
    brandChartData,
  };
}
