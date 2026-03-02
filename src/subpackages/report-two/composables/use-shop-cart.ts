import { useReportTwoStore } from '@/store/report-two';
// 定义购物车商品类型
interface CartItem {
  ccdDtlId: string;
  goodsId: string;
  goodsName: string;
  lotId: string;
  lotNo: string;
  goodsStatusId: number;
  goodsStatus: string;
  storageId: string;
  goodsQty: number;
  price: number;
  smallimglink: string;
  minQty: number;
  isCheck?: boolean;
  ccdDocId: string;
}

// 定义购物车文档类型
interface CartDoc {
  ccdDocId: string;
  customId: string;
  customName: string;
  addressId: string;
  addressName: string;
  CONTACTID: string;
  CONTACTMAN: string;
  logistcenterId: string;
  logistcenterName: string;
  crmCartDtlVOS: CartItem[];
  entryId: string;
  docMemo: string;
}

export function useShopCart() {
  const reportTwoStore = useReportTwoStore();
  const entryChoose = computed(() => reportTwoStore.entryChoose);

  // 购物车数据
  const dataList = ref<CartDoc[]>([]);
  const chooseResult = ref<string[][]>([]);
  const checkedAll = ref(false);
  const totalPrice = ref(0);
  const twoPinTotalMemo = ref('');

  // 弹窗相关
  const getWmsShow = ref(false);
  const wmsList = ref<any[]>([]);
  const contactList = ref<any[]>([]);
  const getContactShow = ref(false);
  const clickIndex = ref<number | string>('');
  const cartType = ref('');
  // 获取购物车数据
  const queryCart = async () => {
    dataList.value = [];
    const params = {
      entryId: entryChoose.value.entryid,
      cartType: cartType.value,
    };

    try {
      const res =
        cartType.value === '1'
          ? await ShopCartService.queryCartSaler(params)
          : await ShopCartService.queryCart(params);
      if (res.code === '200') {
        dataList.value = res.data;
        // 初始化chooseResult数组，确保与dataList结构完全匹配
        chooseResult.value = new Array(dataList.value.length).fill(null).map(() => []);
        checkedAll.value = false;
      }
    } catch {
      showError('获取购物车数据失败');
    }
  };

  // 计算总价
  const calculateTotalPrice = () => {
    totalPrice.value = 0;

    // 直接根据chooseResult数组计算总价
    chooseResult.value.forEach((itemKeys, index) => {
      if (Array.isArray(itemKeys) && itemKeys.length > 0) {
        const dataItem = dataList.value[index];
        if (dataItem && dataItem.crmCartDtlVOS) {
          dataItem.crmCartDtlVOS.forEach((cartItem: CartItem) => {
            // 只有当ccdDocId和ccdDtlId都存在时才计算总价
            if (cartItem.ccdDocId && cartItem.ccdDtlId) {
              const itemKey = `${cartItem.ccdDocId}-${cartItem.ccdDtlId}`;
              if (itemKeys.includes(itemKey)) {
                totalPrice.value += +(
                  (cartItem.goodsQty * +cartItem.price * 1000000) /
                  1000000
                ).toFixed(2);
              }
            }
          });
        }
      }
    });
  };

  // 选择变化
  const chooseChange = () => {
    calculateTotalPrice();
  };

  // 获取预校验、下单以及删除所需参数
  // needChange: 是否必须有勾选项
  // isXD: 是否为“下单”场景（需要校验物流中心）
  // isDelete: 是否为删除场景（删除时放宽部分校验）
  const getParams = (needChange: boolean = true, isXD = false, isDelete = false) => {
    console.log('getParams chooseResult:', chooseResult.value);
    console.log('getParams dataList:', dataList.value);
    // 检查是否有选择数据
    let hasSelection = false;
    for (const group of chooseResult.value) {
      if (Array.isArray(group) && group.length > 0) {
        hasSelection = true;
        break;
      }
    }
    if (needChange && !hasSelection) {
      showError('请选择要操作的数据');
      return false;
    }

    // 报货单（cartType === 1）时，校验最小销售数量倍数（删除场景不校验）
    if (+cartType.value === 1 && !isDelete) {
      let hasError = false;
      dataList.value.forEach(doc => {
        doc.crmCartDtlVOS.forEach((val: any) => {
          if (
            val.salesqtycontrol === 1 &&
            val.leastsaleqty !== 1 &&
            val.goodsQty % val.leastsaleqty !== 0
          ) {
            hasError = true;
          }
        });
      });
      if (hasError) {
        showError('报货数量有误');
        return [];
      }
    }

    // 构建参数 - 直接基于chooseResult数组，避免依赖isCheck属性
    const needParams: any = [];

    // 遍历所有分组
    chooseResult.value.forEach((groupSelections, groupIndex) => {
      // 只处理有选择商品的分组
      if (Array.isArray(groupSelections) && groupSelections.length > 0) {
        // 获取当前分组的文档
        const cartDoc = dataList.value[groupIndex];
        if (!cartDoc) return;
        // 只有下单场景才强制校验物流中心（删除、仅统计价格时不强制）
        if (isXD && !cartDoc.logistcenterId) {
          showError('请选择物流中心');
          return [];
        }
        // 存储当前文档中选中的商品
        const selectedItems: CartItem[] = [];

        // 遍历当前分组中所有选中的itemKey
        groupSelections.forEach((itemKey: string) => {
          // 分割出ccdDocId和ccdDtlId
          const [ccdDocId, ccdDtlId] = itemKey.split('-');

          if (!ccdDocId || !ccdDtlId || ccdDocId === 'undefined' || ccdDocId === 'null') {
            console.log('Invalid itemKey skipped:', itemKey);
            return;
          }

          // 在当前文档中查找对应的商品
          const cartItem = cartDoc.crmCartDtlVOS.find((val: CartItem) => {
            console.log('Comparing:', val.ccdDocId, val.ccdDtlId, ccdDocId, ccdDtlId);
            const match = +val.ccdDocId === +ccdDocId && +val.ccdDtlId === +ccdDtlId;
            return match;
          });

          if (cartItem) {
            selectedItems.push({
              ...cartItem,
              lotId: !cartItem.lotId || cartItem.lotId === '0' ? '9999999' : cartItem.lotId,
              lotNo: !cartItem.lotNo || cartItem.lotNo === '0' ? 'abc123' : cartItem.lotNo,
            });
            console.log('Found selected item:', cartItem);
          } else {
            console.log('Item not found for itemKey:', itemKey);
          }
        });

        // 如果当前文档中有选中的商品，添加到needParams数组
        if (selectedItems.length > 0) {
          // 深拷贝文档对象
          const param = JSON.parse(JSON.stringify(cartDoc));
          // 只保留选中的商品
          param.crmCartDtlVOS = selectedItems;
          needParams.push(param);
        }
      }
    });

    console.log('getParams needParams:', needParams);
    return needParams;
  };

  // 全选
  const checkAllClick = (checked: boolean) => {
    // 更新checkedAll状态
    checkedAll.value = checked;

    // 更新dataList中商品的isCheck属性
    const newDataList = [...dataList.value].map(item => {
      const newCartItems = [...item.crmCartDtlVOS].map(val => {
        // 只对有效的商品设置isCheck属性
        if (
          val.ccdDocId &&
          val.ccdDtlId &&
          val.ccdDocId !== 'undefined' &&
          val.ccdDocId !== 'null'
        ) {
          return {
            ...val,
            isCheck: checked,
          };
        }
        return val;
      });
      return {
        ...item,
        crmCartDtlVOS: newCartItems,
      };
    });
    dataList.value = newDataList;

    // 验证全选状态更新
    console.log(
      'checkAllClick - updated dataList:',
      dataList.value.map(item => ({
        docId: item.ccdDocId,
        itemCount: item.crmCartDtlVOS.length,
        selectedCount: item.crmCartDtlVOS.filter(i => i.isCheck === checked).length,
      }))
    );

    // 更新chooseResult数组
    const newChooseResult = [...chooseResult.value];
    if (checked) {
      // 全选时，生成所有要选择的商品ID（不包含全选标记），过滤掉无效的itemKey
      dataList.value.forEach((item, index) => {
        const validItems = item.crmCartDtlVOS.filter((val: CartItem) => {
          const isValid =
            val.ccdDocId && val.ccdDtlId && val.ccdDocId !== 'undefined' && val.ccdDocId !== 'null';
          if (!isValid) {
            console.log('Filtered invalid item in checkAllClick:', {
              ccdDocId: val.ccdDocId,
              ccdDtlId: val.ccdDtlId,
            });
          }
          return isValid;
        });
        const allItemIds = validItems.map((val: CartItem) => `${val.ccdDocId}-${val.ccdDtlId}`);
        console.log('checkAllClick: Generated itemIds for group', index, allItemIds);
        newChooseResult[index] = [...allItemIds];
      });
    } else {
      // 取消全选时，清空所有选择
      newChooseResult.fill([]);
      console.log('checkAllClick: Cleared all selections');
    }
    chooseResult.value = newChooseResult;

    chooseChange();
    // 不需要调用updateAllCheckStatus，因为我们已经手动设置了checkedAll.value
  };

  // 处理全选
  const handleCheckedAll = (index: number, cartItems: CartItem[]) => {
    // 直接生成所有要选择的商品ID（不包含全选标记），过滤掉无效的itemKey
    const allItemIds = cartItems
      .filter((val: CartItem) => val.ccdDocId && val.ccdDtlId)
      .map((val: CartItem) => `${val.ccdDocId}-${val.ccdDtlId}`);

    // 确保chooseResult数组索引存在且为数组
    if (!Array.isArray(chooseResult.value[index])) {
      chooseResult.value[index] = [];
    }

    // 检查当前是否已全选
    const isCurrentlyAllChecked = allItemIds.every(id => chooseResult.value[index].includes(id));

    // 更新dataList中商品的isCheck属性
    const newCartItems = [...dataList.value[index].crmCartDtlVOS].map(item => ({
      ...item,
      isCheck: !isCurrentlyAllChecked,
    }));
    const newDataList = [...dataList.value];
    newDataList[index] = {
      ...newDataList[index],
      crmCartDtlVOS: newCartItems,
    };
    dataList.value = newDataList;

    // 更新chooseResult数组
    const newChooseResult = [...chooseResult.value];
    newChooseResult[index] = isCurrentlyAllChecked ? [] : [...allItemIds];
    chooseResult.value = newChooseResult;

    chooseChange();
    updateAllCheckStatus();
  };

  // 处理单行选择
  const handleCheckedLine = (index: number, cartItem: CartItem, _cartArr?: CartItem[]) => {
    // 确保chooseResult数组索引存在且为数组
    if (!Array.isArray(chooseResult.value[index])) {
      chooseResult.value[index] = [];
    }

    // 检查cartItem是否有有效的ccdDocId和ccdDtlId
    if (!cartItem.ccdDocId || !cartItem.ccdDtlId || cartItem.ccdDocId === 'undefined') {
      console.error('Invalid cartItem: missing or undefined ccdDocId/ccdDtlId', {
        ccdDocId: cartItem.ccdDocId,
        ccdDtlId: cartItem.ccdDtlId,
      });
      return;
    }

    const itemKey = `${cartItem.ccdDocId}-${cartItem.ccdDtlId}`;
    console.log('handleCheckedLine itemKey:', itemKey);

    // 检查是否已选中
    const isSelected = chooseResult.value[index].includes(itemKey);
    console.log('handleCheckedLine isSelected:', isSelected);

    // 计算新的选中状态
    const newSelectedStatus = !isSelected;
    console.log('handleCheckedLine newSelectedStatus:', newSelectedStatus);

    // 更新dataList中对应的商品isCheck属性
    const itemIndex = dataList.value[index].crmCartDtlVOS.findIndex(
      item => item.ccdDocId === cartItem.ccdDocId && item.ccdDtlId === cartItem.ccdDtlId
    );
    if (itemIndex !== -1) {
      // 创建一个新的商品数组，只更新当前商品的isCheck属性
      const newCartItems = [...dataList.value[index].crmCartDtlVOS];
      const oldItem = newCartItems[itemIndex];
      newCartItems[itemIndex] = {
        ...newCartItems[itemIndex],
        isCheck: newSelectedStatus,
      };
      console.log('Updated cart item isCheck:', {
        oldIsCheck: oldItem.isCheck,
        newIsCheck: newCartItems[itemIndex].isCheck,
        itemKey: itemKey,
      });
      // 创建一个新的dataList数组，只更新当前索引处的值
      const newDataList = [...dataList.value];
      newDataList[index] = {
        ...newDataList[index],
        crmCartDtlVOS: newCartItems,
      };
      // 更新dataList数组
      dataList.value = newDataList;
      // 验证更新是否成功
      const updatedItem = dataList.value[index].crmCartDtlVOS[itemIndex];
      console.log('Verification - item after update:', {
        ccdDocId: updatedItem.ccdDocId,
        ccdDtlId: updatedItem.ccdDtlId,
        isCheck: updatedItem.isCheck,
      });
    }

    // 创建一个新的数组来存储更新后的选择结果
    const newChooseResult = [...chooseResult.value];

    if (isSelected) {
      // 取消选择
      newChooseResult[index] = newChooseResult[index].filter((item: string) => item !== itemKey);
    } else {
      // 选择商品
      newChooseResult[index] = [...newChooseResult[index], itemKey];
    }

    // 更新chooseResult数组
    chooseResult.value = newChooseResult;

    updateAllCheckStatus();
    chooseChange();
  };

  // 更新全选状态
  const updateAllCheckStatus = () => {
    let totalItems = 0;
    let selectedItems = 0;

    dataList.value.forEach((item, index) => {
      totalItems += item.crmCartDtlVOS.length;

      if (Array.isArray(chooseResult.value[index])) {
        selectedItems += chooseResult.value[index].length;
      }
    });

    checkedAll.value = totalItems > 0 && selectedItems === totalItems;
  };

  // 判断当前组是否全选
  const isGroupAllChecked = (index: number, cartItems: CartItem[]) => {
    // 确保chooseResult数组索引存在且为数组
    if (!Array.isArray(chooseResult.value[index])) {
      return false;
    }

    // 检查是否所有商品都被选中
    const allItemKeys = cartItems.map(item => item.ccdDocId + '-' + item.ccdDtlId);
    const selectedItemKeys = chooseResult.value[index];

    return allItemKeys.length > 0 && allItemKeys.every(key => selectedItemKeys.includes(key));
  };

  // 获取物流中心列表
  const getWmsCenter = async () => {
    try {
      const res = await ShopCartService.getWmsCenter({ entryId: entryChoose.value.entryid });
      if (res.code === '200') {
        wmsList.value = res.data.sort((a: any, b: any) => {
          return a.wmscenterucode - b.wmscenterucode;
        });

        // 如果只有一个物流中心，默认选择
        if (wmsList.value.length === 1) {
          dataList.value.forEach((item: CartDoc) => {
            item.logistcenterId = wmsList.value[0].wmscenterucode;
            item.logistcenterName = wmsList.value[0].wmscenterucodename;
          });
        }
      }
    } catch {
      showError('获取物流中心失败');
    }
  };

  // 选择物流中心
  const chooseWms = (index: any) => {
    clickIndex.value = index;
    getWmsShow.value = true;
  };

  // 批量/范围更新物流中心
  const updatedWms = (item: any, isRangeUpdate: boolean) => {
    // 仅在批量模式下处理（clickIndex 为空）
    if (clickIndex.value === '') {
      dataList.value.forEach((element: CartDoc) => {
        if (isRangeUpdate) {
          // 只更新“未选择物流中心”的订单
          if (!element.logistcenterId) {
            element.logistcenterId = item.wmscenterucode;
            element.logistcenterName = item.wmscenterucodename;
          }
        } else {
          // 全量更新所有订单
          element.logistcenterId = item.wmscenterucode;
          element.logistcenterName = item.wmscenterucodename;
        }
      });
      getWmsShow.value = false;
    }
  };

  // 选择物流中心项
  const chooseWmsItem = (item: any) => {
    console.log('chooseWmsItem', clickIndex.value);
    console.log('chooseWmsItem', item);

    // 批量选择：先弹出“仅更新未选择物流中心订单？”确认框
    if (clickIndex.value === '') {
      showModal({
        title: '提示',
        content: '仅更新未选择物流中心订单?',
        confirmText: '确定',
        confirmColor: '#2271F5',
        success: res => {
          if (res.confirm) {
            // 仅更新未选择物流中心的订单
            updatedWms(item, true);
          } else {
            // 取消按钮：更新所有订单
            updatedWms(item, false);
          }
        },
      });
      return;
    }

    // 单个选择
    dataList.value[+clickIndex.value].logistcenterId = item.wmscenterucode;
    dataList.value[+clickIndex.value].logistcenterName = item.wmscenterucodename;
    getWmsShow.value = false;
  };

  // 选择运输地址
  const chooseContact = async (item: CartDoc, index: number) => {
    clickIndex.value = index;
    const params = {
      entryid: item.entryId,
      customid: item.customId,
      contactid: item.CONTACTID || '',
    };

    try {
      const res = await TwoPinService.queryContact(params);
      if (res.code === '200') {
        contactList.value = res.data.map((item: any) => ({
          value: item.ADDRESSID,
          name: item.ADDRESS,
          ...item,
        }));
        getContactShow.value = true;
      }
    } catch {
      showError('获取运输地址失败');
    }
  };

  // 选择运输地址项
  const chooseContactItem = (item: any) => {
    dataList.value[Number(clickIndex.value)].addressId = item.ADDRESSID;
    dataList.value[Number(clickIndex.value)].addressName = item.ADDRESS;
    getContactShow.value = false;
    // 更新数量
    // stepperChange(dataList.value[Number(clickIndex.value)], null);
  };

  // 数量变化
  const stepperChange = (item: CartDoc, cartItem: CartItem | null, newQty?: number) => {
    console.log('stepperChange', item, cartItem, newQty);

    const crmCartDtlVOS: any[] = [];

    // 保存原数量，用于失败时回滚
    const originalQty: Map<string, number> = new Map();

    if (!cartItem) {
      // 更新整个文档的数量
      item.crmCartDtlVOS.forEach((val: CartItem) => {
        originalQty.set(val.ccdDtlId, val.goodsQty);
        crmCartDtlVOS.push({
          ccdDtlId: val.ccdDtlId,
          goodsId: val.goodsId,
          lotId: val.lotId,
          goodsStatusId: val.goodsStatusId,
          storageId: val.storageId,
          goodsQty: val.goodsQty,
        });
      });
    } else {
      // 更新单个商品的数量
      if (!cartItem.goodsQty) return;

      originalQty.set(cartItem.ccdDtlId, cartItem.goodsQty);

      crmCartDtlVOS.push({
        ccdDtlId: cartItem.ccdDtlId,
        goodsId: cartItem.goodsId,
        lotId: cartItem.lotId,
        goodsStatusId: cartItem.goodsStatusId,
        storageId: cartItem.storageId,
        goodsQty: cartItem.goodsQty,
      });
    }
    // 如果传递了新的数量值，直接更新到cartItem
    if (cartItem && newQty !== undefined) {
      cartItem.goodsQty = newQty;
    }
    updateCartsQty(item, cartItem, crmCartDtlVOS, originalQty);
  };

  // 更新购物车数量
  const updateCartsQty = async (
    item: CartDoc,
    cartItem: CartItem | null,
    crmCartDtlVOS: any[],
    originalQty?: Map<string, number>,
    isReload: boolean = false
  ) => {
    // 检查是否有无效的数量输入
    const isInvalid = crmCartDtlVOS.some((element: any) => {
      const qtyStr = String(element.goodsQty);
      return qtyStr.endsWith('.');
    });

    if (isInvalid) return;

    const params = [
      {
        ccdDocId: item.ccdDocId,
        entryId: item.entryId,
        addressId: item.addressId,
        addressName: item.addressName,
        crmCartDtlVOS: crmCartDtlVOS,
        cartType: cartType.value,
      },
    ];

    try {
      const res =
        cartType.value === '1'
          ? await ShopCartService.updateCartsQtySaler(params)
          : await ShopCartService.updateCartsQty(params);
      if (res.code === '200') {
        if (cartItem) {
          chooseChange();
        } else if (isReload) {
          queryCart();
        }
        showToast('修改成功');
      }
    } catch (error: any) {
      // 如果保存了原数量，则回滚
      if (originalQty) {
        if (!cartItem) {
          // 回滚整个文档的数量
          item.crmCartDtlVOS.forEach((val: CartItem) => {
            if (originalQty.has(val.ccdDtlId)) {
              val.goodsQty = originalQty.get(val.ccdDtlId) as number;
            }
          });
        } else {
          // 回滚单个商品的数量
          if (originalQty.has(cartItem.ccdDtlId)) {
            cartItem.goodsQty = originalQty.get(cartItem.ccdDtlId) as number;
          }
        }
      }
      showError(error.msg || '修改失败');
    }
  };

  // 删除购物车商品
  const deleteSubmit = async () => {
    const needParams = getParams(true, false, true) || [];
    if (needParams.length === 0) {
      showError('请选择要删除的商品');
      return;
    }
    showModal({
      title: '提示',
      content: '确定删除选中货品?',
      confirmText: '确定',
      confirmColor: '#2271F5',
      success: async res => {
        if (res.confirm) {
          try {
            const res = await ShopCartService.delCart(needParams);
            if (res.code === '200') {
              showToast('删除成功');
              setTimeout(() => {
                queryCart();
              });
            }
          } catch (error: any) {
            showError(error.msg || '删除失败');
          }
        }
        // 如果用户点击取消，不做任何操作
      },
    });
  };
  // 报货单使用
  const lockInfo = ref<any>({});
  const yyLockControlInfo = ref<any>({});
  // 二销使用
  const lockInfoList = ref<
    Array<{
      title: string;
      data: any;
    }>
  >([]);
  const showModalFlag = ref<boolean>(false);
  // 预创建订单
  const preCreateInvoice = async (params: any) => {
    try {
      const res =
        +cartType.value === 1
          ? await ShopCartService.preCreateInvoiceSaler(params)
          : await ShopCartService.preCreateInvoice(params);
      if (res.code === '200') {
        if (+cartType.value === 1) {
          lockInfo.value = res.data.lockControlInfo;
          yyLockControlInfo.value = res.data.yyLockControlInfo;
        } else {
          // 动态构造锁控列表（兼容 cartType === 2 的多 entry 返回）
          lockInfoList.value = [];
          for (const key in res.data) {
            if (!res.data[key]) continue;
            // 约定：lockControlInfo 用当前核算单元名称，其它 key 用 key.split('-')[0]
            const title =
              key === 'lockControlInfo'
                ? entryChoose.value?.entryname || '锁控'
                : key.split('-')[0] + '--' + (key.split('-')[1] || '') || '锁控';
            lockInfoList.value.push({
              title,
              data: res.data[key],
            });
          }
          console.log('lockInfoList', lockInfoList.value);
        }

        showModalFlag.value = true;
        // 使用uView Plus的对话框组件
        // showModal({
        //   title: '提示',
        //   content: content,
        //   showCancel: true,
        //   confirmText: '继续下单',
        //   cancelText: '取消',
        //   confirmColor: '#2271f5',
        //   success: async (modalRes: any) => {
        //     if (modalRes.confirm) {
        //       try {
        // const invoiceRes = await createInvoiceSaler(params)
        // if (invoiceRes.code === '200') {
        //   uni.$u.toast({
        //     title: '下单成功',
        //     type: 'success'
        //   })
        //   this.totalPrice = 0
        //   this._queryCart()
        // } else {
        //   uni.$u.toast({
        //     title: invoiceRes.msg || '下单失败',
        //     type: 'error'
        //   })
        // }
        //         } catch (error) {
        //           showError('下单失败');
        //         }
        //       }
        //     },
        //   });
        // } else {
        //   showError(res.msg || '操作失败');
        // }
        // if (res.code === '200') {
        //   return res.data;
        // } else {
        //   showError(res.msg);
        //   return null;
      }
    } catch (error: any) {
      showError(error.msg || '预创建订单失败');
      return null;
    }
  };
  const handlePreConfirm = async () => {
    const params = getParams(true, true) || [];
    if (!Array.isArray(params) || params.length === 0) return;

    const preRes =
      +cartType.value === 1
        ? await ShopCartService.preCreateInvoiceSaler(params)
        : await ShopCartService.preCreateInvoice(params);

    if (preRes.code !== '200') {
      showError(preRes.msg || '预校验失败');
      return;
    }

    const createRes =
      +cartType.value === 1
        ? await ShopCartService.createInvoiceSaler(params)
        : await ShopCartService.createInvoice(params);

    if (createRes.code === '200') {
      showSuccess('下单成功');
      totalPrice.value = 0;
      showModalFlag.value = false;
      queryCart();
    } else {
      showError(createRes.msg || '下单失败');
    }
  };
  // 创建订单
  const createInvoice = async (params: any) => {
    try {
      const res = await ShopCartService.createInvoice(params);
      if (res.code === '200') {
        showToast('下单成功');
        queryCart();
        totalPrice.value = 0;
        return true;
      } else {
        showError(res.msg);
        return false;
      }
    } catch (error: any) {
      showError(error.msg || '下单失败');
      return false;
    }
  };

  // 提交订单
  const onSubmit = async () => {
    const needParams = getParams(true, true) || [];
    if (needParams.length === 0) {
      showError('请选择要下单的商品');
      return;
    }

    // 预创建订单
    const preData = await preCreateInvoice(needParams);
    if (!preData) return;

    // 这里可以根据预创建的结果显示提示信息
    console.log('预创建订单结果:', preData);

    // 创建订单
    await createInvoice(needParams);
  };

  // 阻止事件冒泡
  const overlimit = (event: Event) => {
    event.stopPropagation();
  };

  // 更新全选状态
  const ishandleCheckAll = () => {
    let dataLengthSum = 0;
    let chooseResultLengthSum = 0;

    dataList.value.forEach((item: CartDoc) => {
      dataLengthSum += item.crmCartDtlVOS.length;
    });

    chooseResult.value.forEach((element: any[]) => {
      if (element && element.length > 0) {
        if (element.includes('all-0')) {
          // 移除全选标记
          chooseResultLengthSum += element.length - 1;
        } else {
          chooseResultLengthSum += element.length;
        }
      }
    });

    return dataLengthSum === chooseResultLengthSum;
  };

  return {
    // 数据
    dataList,
    chooseResult,
    checkedAll,
    totalPrice,
    twoPinTotalMemo,
    getWmsShow,
    wmsList,
    contactList,
    getContactShow,
    cartType,
    showModalFlag,
    lockInfo,
    yyLockControlInfo,
    entryChoose,
    lockInfoList,
    // 方法
    queryCart,
    chooseChange,
    getParams,
    checkAllClick,
    handleCheckedAll,
    handleCheckedLine,
    deleteSubmit,
    onSubmit,
    preCreateInvoice,
    createInvoice,
    stepperChange,
    overlimit,
    chooseWms,
    chooseWmsItem,
    chooseContact,
    chooseContactItem,
    ishandleCheckAll,
    getWmsCenter,
    isGroupAllChecked,
    handlePreConfirm,
  };
}
