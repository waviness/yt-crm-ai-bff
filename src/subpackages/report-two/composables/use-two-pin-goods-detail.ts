import { useBaseIndex } from './use-base-index';
export function useTwoPinGoodsDetail() {
  const reportTwoStore = useReportTwoStore();
  // 地址选择复用 useBaseIndex 的逻辑
  const { fetchContact, handleSelectAddress, addressShow, chooseAddress, addressList } =
    useBaseIndex('two-pin');
  // 响应式数据
  //   const chooseAddress = ref({
  //     ADDRESSID: '',
  //     ADDRESS: '',
  //   });
  //   const addressList = ref([]);
  //   const addressShow = ref(false);
  const titleString = ref('');
  const regularCustomDetailVisible = ref(false);
  const customDetailInfor = ref<any>({});
  const allTwoPinNumber = ref(0); //总数
  const twoPinPrice = ref(''); //单价
  const priceType = ref(''); // 0代表没有禁限销，1代表可销，2代表不可销，3代表既有禁限销，需要联系采购处理 0 1 可以加购
  const priceText = ref(''); // 价格异常提示
  const logList: any = ref<[]>([]);
  const activeNames = ref(['1']);
  const checkedAll = ref(false);
  const checkedAllList: any = ref([]);
  const lotCheckList: any = ref<[]>([]);
  const logChangeInfor: any = ref<{}>({}); // 批号选中列表
  const twoPinMemo = ref(''); // 备注
  const customShow = ref(false);
  const type = ref(2); // 1 直接从二销列表进入 这样得话是需要在选择客户啥的 2 客户列表进入

  // 计算属性
  const goodsDetail = computed(() => reportTwoStore.goodsDetail);
  const entryChoose = computed(() => reportTwoStore.entryChoose);
  const customParams = computed(() => reportTwoStore.customParams);

  //   // 获取运输地址列表
  //   const fetchContact = async () => {
  //     const response = await TwoPinService.queryContact({
  //       entryid: reportTwoStore.entryChoose.entryid,
  //       customid: reportTwoStore.customParams.customid,
  //       contactid: reportTwoStore.customParams.CONTACTID ? reportTwoStore.customParams.CONTACTID : '',
  //     });

  //     if (+response.code === 200) {
  //       if (response.data.length === 1) {
  //         chooseAddress.value = response.data[0];
  //       }
  //       addressList.value = response.data.map((item: any) => ({
  //         value: item.ADDRESSID,
  //         name: item.ADDRESS,
  //         ...item,
  //       }));
  //     }
  //   };

  // 选择运输地址
  //   const handleSelectAddress = (item: any) => {
  //     chooseAddress.value = item;
  //     addressShow.value = false;
  //   };

  // 点击运输地址单元格
  const cellClickAddress = () => {
    if (!customParams.value.customid) {
      showError('请先选择客户信息');
      return;
    }
    addressShow.value = true;
  };

  // 全选/取消全选
  const checkAllChange = (val: any) => {
    if (val.includes('全选')) {
      checkedAll.value = true;
      for (let index = 0; index < logList.value.length; index++) {
        const element: any = logList.value[index];
        lotCheckList.value.push(element.lotno);
      }
    } else {
      checkedAll.value = false;
      lotCheckList.value = [];
    }
    initLogChangeInfor();
  };

  // 批号选择变化
  const logChange = (val: any) => {
    if (val.length === logList.value.length) {
      checkedAll.value = true;
      checkedAllList.value = ['全选'];
    } else {
      checkedAll.value = false;
      checkedAllList.value = [];
    }
    initLogChangeInfor();
  };

  // 初始化批号信息
  const initLogChangeInfor = () => {
    allTwoPinNumber.value = 0;
    logChangeInfor.value = {};
    for (let index = 0; index < lotCheckList.value.length; index++) {
      const element = lotCheckList.value[index];
      logChangeInfor.value[element] = logList.value.find((val: any) => {
        if (element === val.lotno) {
          allTwoPinNumber.value += val.twoPinNumber;
        }
        return element === val.lotno;
      });
    }
  };

  // 获取商品详情
  const fetchGoodsDtl = () => {
    const params = {
      dirType: goodsDetail.value.dirType,
      entryId: entryChoose.value.entryid,
      goodsId: goodsDetail.value.goodsId,
    };

    TwoPinService.getGoodsDtl(params).then((res: any) => {
      logList.value = [];
      for (let index = 0; index < res.length; index++) {
        const element = res[index];
        if (+element.mindtlgoodsqty !== 0) logList.value.push(element);
      }

      for (let index = 0; index < logList.value.length; index++) {
        const element: any = logList.value[index];
        element.twoPinNumberMax = element.mindtlgoodsqty;
        element.twoPinNumber = element.mindtlgoodsqty;
      }
    });
  };

  // 获取商品价格
  const fetchGoodsPrice = () => {
    TwoPinService.getGoodsPrice({
      customId: customParams.value.customid,
      entryId: entryChoose.value.entryid,
      goodsId: goodsDetail.value.goodsId,
    }).then(res => {
      twoPinPrice.value = res.data.price;
      priceType.value = res.data.limitFlag;

      if (+twoPinPrice.value < 0) {
        priceText.value = '货品暂无价格，不允许销售。';
      } else if (+priceType.value === 2) {
        priceText.value = '货品不可销。';
      } else if (+priceType.value === 3) {
        priceText.value = '货品既有禁销也有限销，需要联系采购处理。';
      }
    });
  };

  // 加入购物车
  const addCartClick = () => {
    if (!customParams.value.customid) {
      showError('请先选择客户信息');
      return;
    }

    if (!goodsDetail.value.ADDRESSID) {
      showError('请先选择运输地址');
      return;
    }

    if (JSON.stringify(logChangeInfor.value) === '{}') {
      showError('请先选择批号信息');
      return;
    }

    if (!twoPinPrice.value) {
      showError('请输入价格');
      return;
    }

    if (+priceType.value === 2 || +priceType.value === 3) {
      showError(priceText.value);
      return;
    }

    const params = [];
    for (const key in logChangeInfor.value) {
      if (Object.prototype.hasOwnProperty.call(logChangeInfor.value, key)) {
        const element = logChangeInfor.value[key];
        params.push({
          entryId: entryChoose.value.entryid,
          entryName: entryChoose.value.entryname,
          customId: customParams.value.customid,
          customName: customParams.value.customname,
          goodsId: goodsDetail.value.goodsId,
          goodsName: goodsDetail.value.goodsName,
          CONTACTID: customParams.value.CONTACTID,
          CONTACTMAN: customParams.value.CONTACTMAN,
          addressId: goodsDetail.value.ADDRESSID,
          addressName: goodsDetail.value.ADDRESS,
          goodsStatusId: element.goodsStatusId,
          goodsStatus: element.goodsStatus,
          storageId: element.storageId,
          storageName: element.storageName,
          lotId: element.lotid,
          lotNo: element.lotno,
          goodsQty: element.twoPinNumber,
          price: twoPinPrice.value,
          invoiceWay: 1,
          zxSpecialFlag: 0,
          dtlMemo: twoPinMemo.value,
          cartType: 2,
        });
      }
    }

    ShopCartService.addCart(params).then(res => {
      if (res.code === '200') {
        showSuccess(res.msg);
      } else {
        showError(res.msg);
      }
    });
  };

  // 处理数量变化
  const handleChange = ({ value }: { value: number }) => {
    // 这里可以添加数量变化的处理逻辑
  };

  // 选择客户
  const chooseCustomClick = (val: any) => {
    reportTwoStore.setCustomParams(val);
    customShow.value = false;

    // 重置地址并重新查询地址和列表
    chooseAddress.value = {
      ADDRESSID: '',
      ADDRESS: '',
    } as any;

    fetchContact();
    fetchGoodsPrice();
  };

  // 初始化数据
  const initData = (options: any) => {
    type.value = +(options?.type || 1);

    if (+type.value === 2) {
      if (goodsDetail.value.price && +goodsDetail.value.price > 0)
        twoPinPrice.value = goodsDetail.value.price + '';
    } else {
      reportTwoStore.setCustomParams({
        customid: '',
        customname: '',
        CONTACTID: '',
        CONTACTMAN: '',
      });
      if (customParams.value.customid) {
        chooseAddress.value = {
          ADDRESSID: '',
          ADDRESS: '',
        } as any;

        fetchGoodsPrice();
        fetchContact();
      }
    }

    fetchGoodsDtl();
  };
  const regularCustomDetailClick = (type: number, item: any) => {
    regularCustomDetailVisible.value = true;
    titleString.value = type === 1 ? '仓管员反馈信息' : '常销客户';
    customDetailInfor.value = {
      ...goodsDetail.value,
      type,
      ...item,
    };
  };
  return {
    // 响应式数据
    chooseAddress,
    addressList,
    addressShow,
    allTwoPinNumber,
    twoPinPrice,
    priceType,
    priceText,
    logList,
    activeNames,
    checkedAll,
    checkedAllList,
    lotCheckList,
    logChangeInfor,
    twoPinMemo,
    customShow,
    type,
    regularCustomDetailVisible,
    titleString,
    customDetailInfor,
    // 计算属性
    goodsDetail,
    entryChoose,
    customParams,

    // 方法
    fetchContact,
    handleSelectAddress,
    cellClickAddress,
    checkAllChange,
    logChange,
    initLogChangeInfor,
    fetchGoodsDtl,
    fetchGoodsPrice,
    addCartClick,
    handleChange,
    chooseCustomClick,
    initData,
    regularCustomDetailClick,
  };
}
