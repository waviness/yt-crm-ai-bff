export const useVarietyFollowStore = defineStore('variety-follow', () => {
  const pcObj = ref<any>({});
  const opTopObj = ref<any>({});
  const tableTopObj = ref<any>({});
  // 设置当前批次对象
  const setPcObj = (obj: any) => {
    pcObj.value = obj;
  };
  // 设置当前表格顶部对象
  const setTableTopObj = (obj: any) => {
    tableTopObj.value = obj;
  };
  const setOpTopObj = (obj: any) => {
    opTopObj.value = obj;
  };
  return {
    pcObj,
    setPcObj,
    tableTopObj,
    setTableTopObj,
    opTopObj,
    setOpTopObj,
  };
});
