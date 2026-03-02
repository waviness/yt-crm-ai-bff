interface User {
  userId: string | number;
  userCode: string;
  userName: string;
  depName: string;
  headImgUrl: string;
  isExistGoodsOrCustomer: string | number;
  hasTabFlag: object;
  ywLeaderLevel?: number; // 业务领导级别（可选）
  isYw?: number; // 是否一线业务（可选）
  cgLeaderLevel?: number; // 采购领导级别（可选）
  isCg?: number; // 是否一线采购（可选）
}
interface IdentityItem {
  leftIco: string; // 图标文件名
  titlePrefix: string; // 标题前缀
  titleHighlight: string; // 标题高亮部分
  desc: string; // 描述文本
  type: number; // 类型标识
  levelText?: string; // 级别文本
  deptLevel?: number; // 级别数值
}
/**
 * 数据中心最外层逻辑
 */
export function useDashboardIndex() {
  const dashboardStore = useDashboardStore(); // 获取数据中心数据
  const identityList = ref<IdentityItem[]>([]); // 用户权限列表
  const userStore = useUserStore(); // 获取用户信息
  const userInfor: User = userStore.userInfor;
  const showIdentityPage = ref(false);
  dashboardStore.setDateTime(time.format(time.add(new Date(), 0, 'year'), time.FORMATS.ISO_DATE));
  /*
   *如果用户是一线业务人员，添加一线业务身份标识
   * 初始化仪表盘函数
   * 该函数根据用户信息添加不同的身份标识，并加载相应的数据
   */
  const initDashboard = async () => {
    identityList.value = [];
    if (userInfor.isYw) {
      identityList.value.push({
        leftIco: 'yixianyewu',
        titlePrefix: '一线业务',
        titleHighlight: '',
        desc: '适用于一线业务的普通权限',
        type: 1,
        levelText: 'isYw',
        // 如果用户是采购领导，添加采购管理身份标识
        deptLevel: 5,
      });
    }

    if (userInfor.cgLeaderLevel) {
      identityList.value.push({
        leftIco: 'caigouguanli',
        titlePrefix: '采购',
        titleHighlight: '管理',
        desc: '适用于管理层的高等级权限',
        type: 2,
        // 如果用户是一线采购人员，添加一线采购身份标识
        levelText: 'cgLeader',
      });
    }

    if (userInfor.isCg) {
      identityList.value.push({
        leftIco: 'yixiancaigou',
        titlePrefix: '一线采购',
        titleHighlight: '',
        desc: '适用于一线采购的普通权限',
        type: 3,
        levelText: 'isCg',
      });
    }
    // 根据用户权限添加身份列表
    if (userInfor.ywLeaderLevel === 0 || userInfor.ywLeaderLevel) {
      identityList.value.push({
        leftIco: 'yewuguanli',
        titlePrefix: '业务',
        titleHighlight: '管理',
        desc: '适用于管理层的高等级权限',
        type: 0,
        levelText: 'ywLeader',
        deptLevel: userInfor.ywLeaderLevel,
      });
      dashboardStore.setSybOriginList([]); // 事业部List
      dashboardStore.setXszxOriginList([]); // 销售中心List
      dashboardStore.setBmList([]); // 部门List
      dashboardStore.setBmChildList([]); // 子部门List
      // 根据业务领导级别加载数据
      switch (userInfor.ywLeaderLevel) {
        case 1:
        case 0:
          await Promise.all([
            dashboardStore._getsybOriginList(),
            dashboardStore._getxszxOriginList(),
            dashboardStore._getbmList(),
            dashboardStore._getbmChildList(),
          ]);
          break;
        case 2:
          await Promise.all([
            dashboardStore._getxszxOriginList(),
            dashboardStore._getbmList(),
            dashboardStore._getbmChildList(),
          ]);
          break;
        case 3:
          await Promise.all([dashboardStore._getbmList(), dashboardStore._getbmChildList()]);
          break;
        case 4:
          await dashboardStore._getbmChildList();
          break;
      }
    }
    if (identityList.value.length === 1) {
      console.log('自动进入', identityList.value[0]);
      cardClick(identityList.value[0], false);
    }
    if (identityList.value.length > 1) {
      showIdentityPage.value = true;
      return;
    }
  };
  const cardClick = async (item: any, isInner: boolean = true) => {
    // 埋点上报
    // await $crmUserClick({
    //   catalogType: 605,
    //   catalogTypeName: '查数据',
    //   cucrId: '',
    //   menuId: item.level,
    //   menuName: item.titlePrefix + item.titleHighlight,
    //   menuOperation: '查数据卡片',
    //   operationType: 1
    // });
    console.log('item', item);
    switch (item.type) {
      case 0:
      case 1:
        salesClick(item.deptLevel, isInner);
        break;
      case 2:
        // 采购管理卡片点击事件
        purchaseClick(item.deptLevel, true);
        break;
      case 3:
        // router.push({
        //   name: isInner ? 'purchaseManIndexInner' : 'purchaseManIndex',
        //   query: {
        //     level: '5',
        //     id: userInfor.userId,
        //     name: userInfor.userName,
        //   },
        // });
        break;
    }
  };

  const salesClick = (deptLevel: number, isInner: boolean = true) => {
    console.log('dashboardStore.sybOriginList', dashboardStore.sybOriginList);
    console.log('dashboardStore.sybOriginList', dashboardStore.sybOriginList);
    const routeConfig: Record<number, any> = {
      0: {
        path: RouteMap.salesLineRise,
        query: {
          deptLevel: 0,
          isInner: isInner ? '1' : '0',
        },
      },
      1: {
        path: RouteMap.salesLineRise,
        query: {
          deptLevel: dashboardStore.sybOriginList[0]?.deptLevel,
          deptId: dashboardStore.sybOriginList[0]?.deptId,
          deptName: dashboardStore.sybOriginList[0]?.deptName,
          isInner: isInner ? '1' : '0',
        },
      },
      2: {
        path: RouteMap.salesLineRise,
        query: {
          deptLevel: dashboardStore.xszxOriginList[0]?.deptLevel,
          deptId: dashboardStore.xszxOriginList[0]?.deptId,
          deptName: dashboardStore.xszxOriginList[0]?.deptName,
          isInner: isInner ? '1' : '0',
        },
      },
      3: {
        path: RouteMap.salesLineRise,
        query: {
          deptLevel: dashboardStore.bmList[0]?.deptLevel,
          deptId: dashboardStore.bmList[0]?.deptId,
          deptName: dashboardStore.bmList[0]?.deptName,
          isInner: isInner ? '1' : '0',
        },
      },
      4: {
        path: RouteMap.salesLineRise,
        query: {
          deptLevel: dashboardStore.bmChildList[0]?.deptLevel,
          deptId: dashboardStore.bmChildList[0]?.deptId,
          deptName: dashboardStore.bmChildList[0]?.deptName,
          isInner: isInner ? '1' : '0',
        },
      },
      5: {
        path: RouteMap.salesLineRiseDetail,
        query: {
          deptLevel: '5',
          userId: userInfor.userId,
          userName: userInfor.userName,
          isInner: isInner ? '1' : '0',
        },
      },
    };
    const config = routeConfig[deptLevel];
    if (config) {
      const currentRoute: any = router.getCurrentRoute();
      // 只在路径不同时才进行跳转
      if (currentRoute.path !== config.path) {
        router.push(config.path, { ...config.query });
      }
    }
  };

  const purchaseClick = (deptLevel: number | undefined, isInner: boolean = true) => {
    // 采购管理路由配置
    const routeConfig: Record<number, any> = {
      0: {
        path: RouteMap.purchaseLineRise,
        query: {
          deptLevel: 0,
          isInner: isInner ? '1' : '0',
        },
      },
      // 这里可以根据需要添加更多采购管理的路由配置
    };
    const config = routeConfig[deptLevel || 0];
    if (config) {
      const currentRoute: any = router.getCurrentRoute();
      if (currentRoute.path !== config.path) {
        router.push(config.path, { ...config.query });
      }
    }
  };
  const hasDifferentValues = (arr: any[], prop: any) => {
    return new Set(arr.map((item: any) => item[prop])).size > 1;
  };
  const initSelectFlag = () => {
    dashboardStore.setSelectDeptFlag(false);
    if (
      userInfor &&
      userInfor.ywLeaderLevel !== undefined &&
      +userInfor.ywLeaderLevel !== 0 &&
      +userInfor.ywLeaderLevel !== 1 &&
      (hasDifferentValues(dashboardStore.sybOriginList, 'deptId') ||
        hasDifferentValues(dashboardStore.xszxOriginList, 'deptId') ||
        hasDifferentValues(dashboardStore.bmList, 'deptId') ||
        hasDifferentValues(dashboardStore.bmChildList, 'deptId'))
    ) {
      dashboardStore.setSelectDeptFlag(true);
    }
    console.log('dashboardStore.selectDeptFlag', dashboardStore.selectDeptFlag);
  };
  return {
    showIdentityPage,
    identityList,
    initDashboard,
    initSelectFlag,
    cardClick,
    salesClick,
    purchaseClick,
  };
}
