export const useReportTwoStore = defineStore('report-two', () => {
  const customParams = ref<any>({});
  const entryChoose = ref({ entryid: '', entryname: '' });
  const goodsDetail = ref({
    smallimglink: '',
    bigimglink: '',
    goodsId: '',
    goodsName: '',
    goodstype: '',
    goodsunit: '',
    factoryid: '',
    factoryname: '',
    limitQty: 0,
    entryId: '',
    bgzQty: 0,
    limitQtyOfYy: 0,
    yyBgzQty: 0,
    nearlyEffectiveFlag: 0,
  });
  const setCustomParams = (params: any) => {
    customParams.value = params;
  };
  const setEntryChoose = (params: any) => {
    entryChoose.value = params;
  };
  const setGoodsDetail = (params: any) => {
    goodsDetail.value = params;
  };
  return {
    entryChoose,
    customParams,
    goodsDetail,
    setEntryChoose,
    setCustomParams,
    setGoodsDetail,
  };
});
