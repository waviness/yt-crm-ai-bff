interface User {
  userId: string | number;
  userCode: string;
  userName: string;
  depName: string;
  headImgUrl: string;
  isExistGoodsOrCustomer: string | number;
  hasTabFlag: object;
}

export interface Menu {
  sjzx: object;
  ywzx: object;
  wd: object;
  lockPowerForPurchaser?: any;
  lockPowerForSalesman?: any;
}

export const useUserStore = defineStore(
  'user',
  () => {
    const userInfor = ref<User>({
      userId: '登录失效',
      userCode: '登录失效',
      userName: '登录失效',
      depName: '登录失效',
      headImgUrl: '登录失效',
      isExistGoodsOrCustomer: '登录失效',
      hasTabFlag: {},
    });

    const menu = ref<Menu>({
      sjzx: {},
      ywzx: {},
      wd: {},
    });

    const permissions = ref<string[]>([]);

    const watermark = computed(() => {
      return `${userInfor.value.userCode} ${userInfor.value.userName}`;
    });

    const setUser = (newUser: User) => {
      userInfor.value = newUser;
    };

    const setMenu = (newMenu: Menu) => {
      menu.value = newMenu;
    };

    // 存储权限信息
    const setPermissions = (perm: string[]) => {
      permissions.value = perm;
    };

    return {
      userInfor,
      menu,
      permissions,
      watermark,
      setUser,
      setMenu,
      setPermissions,
    };
  },
  {
    persist: {},
  }
);
