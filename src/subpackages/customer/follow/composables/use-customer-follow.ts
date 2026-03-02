/**
 * 客户随访 Composable
 * 提供客户随访相关的通用逻辑
 */
export function useCustomerFollow() {
  const appStore = useAppStore();
  const userStore = useUserStore();

  const commentShow = ref(false);
  const showAdressPicker = ref(false);
  const customerLabelShow = ref(false);

  /**
   * 提升星标
   */
  const addStarClick = (item: any): Promise<boolean> => {
    return new Promise(resolve => {
      showModal({
        title: '确认',
        content: '确定要将当前拜访记录提升为星标事件吗？',
        success: async res => {
          if (res.confirm) {
            try {
              await CustomerFollowService.raiseStarLevel({ cuvId: item.cuvId });
              showSuccess('提升星标成功');
              item.isRaisedStarFlag = true;
              item.starFlag = (item.starFlag || 0) + 1;
              resolve(true);
            } catch (error) {
              console.error('提升星标失败:', error);
              resolve(false);
            }
          } else {
            resolve(false);
          }
        },
      });
    });
  };

  /**
   * 编辑客情事件
   */
  const editClick = (item: any) => {
    const staffMemberCheckDetail = [];
    const middleVal = {
      userId: item.visitUserId,
      userName: item.visitUserName,
      phoneNumber: item.visitUserPhoneNum,
      hotid: item.warmthNum,
      starCheck: 0,
      outsideCheck: item.address ? 1 : 0,
      hotValue:
        +item.warmthNum === 1
          ? '业务员一般客情'
          : +item.warmthNum === 2
            ? '需要进阶的客情'
            : +item.warmthNum === 3
              ? '从未接触的客情'
              : '请选择热力值信息',
      remarkValueList: [...(item.crmLabelRemarkDtoList || [])],
      needLabelValueObj: [],
    };
    staffMemberCheckDetail.push(JSON.parse(JSON.stringify(middleVal)));
    item.staffMemberCheckDetail = staffMemberCheckDetail;
    appStore.setDetailObj(item);
    customerLabelShow.value = true;
  };

  /**
   * 批注点击
   */
  const commentClick = (item: any) => {
    appStore.setDetailObj(item);
    commentShow.value = true;
  };

  /**
   * 确认批注
   */
  const sureComment = async (val: string): Promise<boolean> => {
    try {
      const params = [
        {
          commentRemark: val,
          cuvId: appStore.detailObj.cuvId,
          cvcId: appStore.detailObj.cvcId,
          creName: userStore.userInfor?.userName,
          credate: time.format(new Date(), time.FORMATS.ISO_DATETIME),
        },
      ];
      await _insOrUpdComment(params);
      return true;
    } catch (error) {
      console.error('提交批注失败:', error);
      return false;
    }
  };

  /**
   * 新增或修改批注
   */
  const _insOrUpdComment = async (params: any[]) => {
    await CustomerFollowService.insOrUpdComment(params);
    const detailObj = JSON.parse(JSON.stringify(appStore.detailObj));
    detailObj.crmVisitCommentDtoList = (detailObj.crmVisitCommentDtoList || []).concat(params);
    appStore.setDetailObj(detailObj);
    appStore.setHadDoneOnDetail(true);
    commentShow.value = false;
  };

  /**
   * 关联打卡
   */
  const clickChange = (item: any) => {
    appStore.setDetailObj(item);
    showAdressPicker.value = true;
  };

  /**
   * 已有打卡信息选择
   */
  const adressOnConfirm = async (val: any) => {
    await _relateClockIn(
      {
        cciId: val.cciId,
        cuvId: appStore.detailObj.cuvId,
      },
      val
    );
    showAdressPicker.value = false;
  };

  /**
   * 关联打卡信息
   */
  const _relateClockIn = async (params: any, val: any) => {
    await CustomerFollowService.relateClockIn(params);
    showSuccess('关联打卡成功');
    const detailObj = appStore.detailObj;
    detailObj.address = val.address || val.addressDetail;
    detailObj.cciId = val.cciId || val.addressID;
    appStore.setDetailObj(detailObj);
    appStore.setHadDoneOnDetail(true);
    showAdressPicker.value = false;
  };

  /**
   * 立即打卡确定选择
   */
  const addressChoose = async (val: any) => {
    await _relateClockIn(
      {
        cciId: val.addressID,
        cuvId: appStore.detailObj.cuvId,
      },
      val
    );
    showAdressPicker.value = false;
  };

  /**
   * 取消打卡
   */
  const adressCancel = () => {
    showAdressPicker.value = false;
  };

  return {
    commentShow,
    showAdressPicker,
    customerLabelShow,
    addStarClick,
    editClick,
    commentClick,
    sureComment,
    clickChange,
    adressOnConfirm,
    addressChoose,
    adressCancel,
  };
}
