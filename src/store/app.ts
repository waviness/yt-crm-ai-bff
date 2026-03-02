interface ThemeColor {
  primary: string;
  main: string;
  danger: string;
  black: string;
}

interface Theme {
  color: ThemeColor;
}

interface SalerInfo {
  userId?: string;
  userName?: string;
  entryId?: string;
  entryName?: string;
  [key: string]: any;
}

export const useAppStore = defineStore('app', () => {
  const theme = ref<Theme>({
    color: {
      primary: '#3561F2',
      main: '#2271f5',
      danger: '#E34D59',
      black: '#323233',
    },
  });

  const domainUrl = ref('https://intmedic-wx.oss-cn-hangzhou.aliyuncs.com/');

  const msgObj = ref();

  const hadDoneOnDetail = ref();

  const detailObj = ref(); // 点击详情传递的对象

  const salerInfor = ref<SalerInfo>({});

  const setMsgObj = (msg: any) => {
    msgObj.value = msg;
  };

  const setHadDoneOnDetail = (hadDone: boolean) => {
    hadDoneOnDetail.value = hadDone;
  };

  const setSalerInfo = (salerInfo: SalerInfo) => {
    salerInfor.value = salerInfo;
  };

  const setDetailObj = (obj: any) => {
    detailObj.value = obj;
  };

  return {
    theme,
    domainUrl,
    hadDoneOnDetail,
    msgObj,
    detailObj,
    salerInfor,
    setMsgObj,
    setHadDoneOnDetail,
    setSalerInfo,
    setDetailObj,
  };
});
