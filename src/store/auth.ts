import { SignInAgreement } from '@/config/agreement';
import { LogUpdateService } from '@/api/log-update';
import type { Menu } from './user';

export interface SignInWithCredentialsFormData {
  /** 登录账号 */
  account: string;
  /** 登录密码 */
  password: string;
}

export interface SignInAgreement {
  /** 协议标题 */
  title: string;
  /** 协议内容 */
  content: string;
  /** 显示状态 */
  show: boolean;
  /** 数据 */
  data: Record<string, any>;
}

export interface UpdateLogModal {
  /** 显示状态 */
  show: boolean;
  /** 更新日志状态：'0' 表示需要显示，'1' 表示已读 */
  status: string | number | null;
}

/**
 * 认证状态管理模块
 *
 * 该模块负责处理用户认证相关的状态管理，包括多种登录方式、菜单构建、权限控制等功能。
 * 支持微信小程序登录、微信公众号登录、账号密码登录等多种认证方式。
 */
export const useAuthStore = defineStore(
  'auth',
  () => {
    const userStore = useUserStore();
    const tabbarStore = useTabbarStore();

    const token = ref('');
    const isLoggedIn = computed(() => typeChecker.isDefined(token.value));

    /** 自动加载状态标识 */
    const autoLoading = ref(true);

    /** 登录协议 */
    const signInAgreement = ref<SignInAgreement>({
      title: SignInAgreement.title,
      content: SignInAgreement.content,
      show: false,
      data: {},
    });

    /** 更新日志弹窗 */
    const updateLogModal = ref<UpdateLogModal>({
      show: false,
      status: null,
    });

    /**
     * 同意用户协议函数
     * 该函数用于调用认证服务来同意用户协议
     *
     * @returns Promise<void> - 无返回值的异步函数
     */
    const agreeAgreement = async () => {
      try {
        // 调用认证服务同意协议接口，传入登录类型、协议状态和用户ID列表
        await AuthService.agreeAgreement({
          loginType: 2,
          agreementStatus: 1,
          userIdList: [signInAgreement.value.data.userId],
        });
        buildMenu(signInAgreement.value.data);
      } catch (error) {
        console.error(error);
      }
    };

    /**
     * 标记更新日志为已读
     * 调用更新日志服务标记已读，并更新缓存和状态
     *
     * @returns Promise<void> - 无返回值的异步函数
     */
    const markUpdateLogAsRead = async () => {
      try {
        await LogUpdateService.updateRead({ type: 2 });
        cache.set('phoneUpdateLogStatus', '1');
        updateLogModal.value.show = false;
        updateLogModal.value.status = '1';
      } catch (error) {
        console.error(error);
      }
    };

    /**
     * 微信小程序登录
     *
     * 通过微信登录接口获取授权码，并调用后端服务完成小程序登录流程
     * @param payload - 登录附加参数
     */
    const signInWithMiniProgram = async (payload: Record<string, any>) => {
      const { code } = await uni.login({ provider: 'weixin' });
      const data = await AuthService.signInWithMiniProgram({ ...payload, code });
      buildMenu(data);
    };

    /**
     * 通过官方账号登录函数
     *
     * 处理微信公众号授权登录流程，包括获取授权码、清理缓存、调用登录接口、检查协议状态和构建菜单
     */
    const signInWithOfficialAccount = async () => {
      try {
        // 获取URL中的授权码参数
        const code = getUrlParam(window.location.href, 'code');
        if (typeChecker.isEmpty(code)) {
          showError('未获取到授权码');
        }

        // 清除相关缓存数据
        cache.clear();

        // 调用官方账号登录服务接口
        const data = await AuthService.signInWithOfficialAccount({ code, type: 2 });
        // 检查用户协议签署状态
        if (converter.toNumber(data.phoneAgreementStatus) !== 1) {
          signInAgreement.value.show = true;
          signInAgreement.value.title = data.phoneReadTime
            ? SignInAgreement.updateTitle
            : SignInAgreement.title;
          signInAgreement.value.data = data;
          return;
        }
        // 根据登录数据构建用户菜单
        buildMenu(data);
      } catch (error) {
        console.error(error);
      }
    };

    /**
     * 账号密码登录
     *
     * 使用用户名和密码进行系统登录，并构建用户菜单
     * @param formData - 登录表单数据，包含账号和密码
     */
    const signInWithCredentials = async (formData: SignInWithCredentialsFormData) => {
      const data = await AuthService.signInWithCredentials({
        userCode: formData.account,
        password: formData.password,
      });
      buildMenu(data);
    };

    /**
     * 构建用户菜单系统
     *
     * 根据登录返回的权限数据构建用户可访问的菜单结构，包括：
     * - 平台菜单分类
     * - 权限缓存设置
     * - 用户信息存储
     * - 底部导航栏构建
     * - 页面跳转路由设置
     * @param data - 登录接口返回的用户权限数据
     */
    const buildMenu = (data: any) => {
      const newPortMenu = [];
      for (let index = 0; index < data.resListTree.length; index++) {
        const element = data.resListTree[index];
        if (element.plantformType === 2) {
          newPortMenu.push(element);
        }
      }

      const hasTabObj = {
        ywzx: {},
        sjzx: {},
        wd: {},
      };

      let menu: any = [];
      let lockPowerForSalesmanObj: any = {};
      let lockMenuForPurchaserObj: any = {};
      let phmlDept: any = [];
      for (let index = 0; index < data.resListTree.length; index++) {
        const element = data.resListTree[index];

        if (element.plantformType === 1 && element.children) {
          const permissions = getPermissions(element.children);
          cache.set('webCRMPermissions', permissions);
        }

        if (element.pmsName && element.pmsName == '经营看板' && element.children) {
          element.children.forEach((ele: any) => {
            if (ele.pmsName == '平衡毛利' && ele.children) {
              ele.children.forEach((item: any) => {
                if (item.path) {
                  phmlDept.push(item.pmsName);
                }
              });
            }
          });

          cache.set('phmlArray', phmlDept);
        }
        if (element.plantformType === 2 && (element.keyword !== 'AppIndex' || element.children)) {
          menu.push(element);

          if (element.keyword === 'operationSystemWX' && element.children) {
            element.children.forEach((elementChild: any) => {
              if (elementChild.keyword === 'lockMenuForSalesman') {
                lockPowerForSalesmanObj = elementChild;
              }
            });
          } else if (element.keyword === 'AppIndex' && element.children) {
            element.children.forEach((elementChild: any) => {
              if (elementChild.pmsType === 3) {
                elementChild.icon = '#ytcrm-' + elementChild.keyword;
              }
            });
          } else if (element.keyword === 'taskIndex' && element.children) {
            lockMenuForPurchaserObj = element.children.find(
              (val: any) => val.keyword === 'lockMenuForPurchaser'
            );
          }
        }
      }

      if (
        lockPowerForSalesmanObj &&
        lockPowerForSalesmanObj.children &&
        lockPowerForSalesmanObj.children.length > 0
      ) {
        data.lockPowerForSalesman = true;
        data.lockMenuForSalesman = lockMenuForSalesman;
      }
      if (
        lockMenuForPurchaserObj &&
        lockMenuForPurchaserObj.children &&
        lockMenuForPurchaserObj.children.length > 0
      ) {
        data.lockPowerForPurchaser = true;
        data.lockMenuForPurchaser = lockMenuForPurchaser;
      }

      const menuObj = getNewMenuObj(newPortMenu, {});
      const hasTabFlag = getNewPortMenu(data, menuObj, hasTabObj);
      const permissions = getPermissions(data.resListTree); // 需要使用web权限
      userStore.setPermissions(permissions);
      const { lockPowerForPurchaser, lockPowerForSalesman, ...user } = data;
      userStore.setUser(user);
      userStore.setMenu({
        ...hasTabObj,
        lockPowerForPurchaser,
        lockPowerForSalesman,
      } as Menu);
      cache.set('phoneUpdateLogStatus', data.phoneUpdateLogStatus);

      // 检查是否需要显示更新日志弹窗
      if (
        data.phoneUpdateLogStatus !== null &&
        data.phoneUpdateLogStatus !== undefined &&
        (data.phoneUpdateLogStatus === 0 || data.phoneUpdateLogStatus === '0')
      ) {
        updateLogModal.value = {
          show: true,
          status: data.phoneUpdateLogStatus,
        };
      }

      token.value = data.token;
      tabbarStore.buildItems(hasTabFlag);
      tabbarStore.init();
    };

    /**
     * 构建新门户菜单对象
     *
     * 将菜单数据按照新门户类型进行分类整理，生成结构化的菜单对象
     * @param source - 原始菜单数据数组
     * @param target - 目标菜单对象
     * @returns 分类整理后的菜单对象
     */
    const getNewMenuObj = (source: any, target: any) => {
      source.reduce((acc: any, curr: any) => {
        if (curr.newPortalType && curr.pmsType === 3) {
          // 如果该类别不存在于结果数组中，则创建新的数组并添加到结果对象中
          if (!acc[curr.newPortalType]) {
            acc[curr.newPortalType] = [];
          }
          // 将当前对象添加到对应的类别数组中
          acc[curr.newPortalType].push(curr);
        } else if (curr.children) {
          getNewMenuObj(curr.children, target);
        }
        return acc;
      }, target);
      return target;
    };

    /**
     * 处理新门户菜单数据
     *
     * 根据菜单对象构建不同门户类型的菜单结构，并处理特殊菜单项（如锁控菜单）
     * @param data - 用户权限数据
     * @param menuObj - 分类后的菜单对象
     * @param hasTabObj - 门户标签对象
     */
    const getNewPortMenu = (data: any, menuObj: any, hasTabObj: any) => {
      const hasTabFlag = {
        ywzxFlag: false,
        wdFlag: false,
        sjzxFlag: false,
      };

      for (const key in menuObj) {
        if (Object.prototype.hasOwnProperty.call(menuObj, key)) {
          const element = menuObj[key].sort((a: any, b: any) => a.orderNum - b.orderNum);
          const keyArr = key.split('000');
          const tabType = keyArr[0];
          const detailType = keyArr[1];
          switch (+tabType) {
            case 11:
              hasTabFlag.ywzxFlag = true;
              switch (+detailType) {
                case 1:
                  hasTabObj.ywzx[key] = {
                    isMoreShow: element.length >= 8,
                    arr: element,
                    title: ['日常管理', '客情、库存、任务等'],
                  };
                  break;
                case 2:
                  hasTabObj.ywzx[key] = {
                    isMoreShow: element.length >= 8,
                    arr: element,
                    title: ['订单管理', '报货单、二销、客户订单审批等'],
                  };
                  break;
                case 3:
                  hasTabObj.ywzx[key] = {
                    isMoreShow: element.length >= 8,
                    arr: element,
                    title: ['锁控管理', '锁控、证照、质量等'],
                  };
                  break;
                case 4:
                  hasTabObj.ywzx[key] = {
                    isMoreShow: element.length >= 8,
                    arr: element,
                    title: ['业务协同', '逾期、回款、询证函等'],
                  };
                  break;
                case 5:
                  hasTabObj.ywzx[key] = {
                    isMoreShow: element.length >= 8,
                    arr: element,
                    title: ['项目管理', 'VBP'],
                  };
                  break;
                default:
                  break;
              }

              break;
            case 44:
              hasTabFlag.wdFlag = true;
              hasTabObj.wd[key] = element;
              break;
            case 33:
              hasTabFlag.sjzxFlag = true;
              hasTabObj.sjzx[key] = element;
              break;
            default:
              break;
          }
        }
      }
      if (data.lockMenuForPurchaser && data.lockMenuForPurchaser.length) {
        if (
          hasTabObj.ywzx &&
          hasTabObj.ywzx[110003] &&
          hasTabObj.ywzx[110003].arr &&
          hasTabObj.ywzx[110003].arr.length
        ) {
          hasTabObj.ywzx[110003].arr = hasTabObj.ywzx[110003].arr.concat(data.lockMenuForPurchaser);
          hasTabObj.ywzx[110003].isMoreShow = hasTabObj.ywzx[110003].arr.length >= 8;
        } else {
          hasTabObj.ywzx[110003] = {};
          hasTabObj.ywzx[110003].arr = [];

          hasTabObj.ywzx[110003] = {
            arr: data.lockMenuForPurchaser,
            title: ['订单异常处理', '锁控、证照、质量等'],
          };
          hasTabObj.ywzx[110003].isMoreShow = hasTabObj.ywzx[110003].arr.length >= 8;
        }
      }
      if (data.lockMenuForSalesman && data.lockMenuForSalesman.length) {
        if (
          hasTabObj.ywzx &&
          hasTabObj.ywzx[110003] &&
          hasTabObj.ywzx[110003].arr &&
          hasTabObj.ywzx[110003].arr.length
        ) {
          hasTabObj.ywzx[110003].arr = hasTabObj.ywzx[110003].arr.concat(data.lockMenuForSalesman);
          hasTabObj.ywzx[110003].isMoreShow = hasTabObj.ywzx[110003].arr.length >= 8;
        } else {
          hasTabObj.ywzx[110003] = {};
          hasTabObj.ywzx[110003].arr = [];

          hasTabObj.ywzx[110003] = {
            arr: data.lockMenuForSalesman,
            title: ['订单异常处理', '锁控、证照、质量等'],
          };
          hasTabObj.ywzx[110003].isMoreShow = hasTabObj.ywzx[110003].arr.length >= 8;
        }
      }

      return hasTabFlag;
    };

    /**
     * 自动登录函数
     *
     * 该函数用于处理用户的自动登录逻辑，包括从缓存中获取用户信息、
     * 判断是否为小程序环境以及调用官方账号登录等操作。
     */
    const autoSignIn = () => {
      // 如果缓存中存在用户信息，则直接构建菜单并返回
      if (isLoggedIn.value) {
        tabbarStore.init();
        return;
      }

      // 如果是小程序环境，则关闭自动加载状态并返回
      if (isMiniProgram()) {
        autoLoading.value = false;
        return;
      }

      // 调用官方账号登录方法
      signInWithOfficialAccount();
    };

    /**
     * 清理登录状态
     * 清空 token 和所有缓存，用于登录失效时重置状态
     */
    const clear = () => {
      // 清空内存中的 token
      token.value = '';
      // 清空所有缓存（包括持久化存储）
      cache.clear();
    };

    return {
      // state
      token,
      isLoggedIn,
      autoLoading,
      signInAgreement,
      updateLogModal,

      // actions
      autoSignIn,
      agreeAgreement,
      signInWithMiniProgram,
      signInWithCredentials,
      markUpdateLogAsRead,
      clear,
    };
  },
  {
    persist: {
      // 只持久化 token，排除其他临时状态（如 updateLogModal）
      paths: ['token'],
    },
  }
);
