import type { Entry } from '../types/index';
export function useBaseIndex(type: string = 'report') {
  const reportTwoStore = useReportTwoStore();
  const activeTab = ref<number>(0);
  const entryShow = ref(true);
  // 处理核算单元悬浮按钮点击
  const handleEntryClick = (item: Entry) => {
    activeTab.value = 0;
    entryShow.value = false;
    reportTwoStore.setEntryChoose(item);
  };
  // 切换tab
  const onhandleActiveChange = ({ index }: { index: number }) => {
    http.wechat.cancelAllRequests();
    activeTab.value = index;
  };
  // 切换核算单元
  const changeEntryClick = () => {
    entryShow.value = !entryShow.value;
    if (entryShow.value) {
      reportTwoStore.setEntryChoose({
        entryid: '',
        entryname: '',
      });
    }
  };
  // 处理客户列表点击
  const handleCellClick = (val: any) => {
    reportTwoStore.setCustomParams(val);
    uni.navigateTo({
      url: `/subpackages/report-two/${type}/custom-detail`,
    });
  };
  const chooseAddress = ref({
    ADDRESSID: '',
    ADDRESS: '',
  });
  const addressList = ref([]);
  const addressShow = ref(false);
  const fetchContact = async () => {
    const response = await TwoPinService.queryContact({
      entryid: reportTwoStore.entryChoose.entryid,
      customid: reportTwoStore.customParams.customid,
      contactid: reportTwoStore.customParams.CONTACTID ? reportTwoStore.customParams.CONTACTID : '',
    });
    console.log(response);
    if (+response.code === 200) {
      if (response.data.length === 1) {
        chooseAddress.value = response.data[0];
      }
      addressList.value = response.data.map((item: any) => ({
        value: item.ADDRESSID,
        name: item.ADDRESS,
        ...item,
      }));
    }
  };
  const handleSelectAddress = (item: any) => {
    console.log(item);
    chooseAddress.value = item;
    addressShow.value = false;
  };
  return {
    activeTab,
    entryShow,
    chooseAddress,
    addressList,
    addressShow,
    handleEntryClick,
    onhandleActiveChange,
    changeEntryClick,
    handleCellClick,
    fetchContact,
    handleSelectAddress,
  };
}
