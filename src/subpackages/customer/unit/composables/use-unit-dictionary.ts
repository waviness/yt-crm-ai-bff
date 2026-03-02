/**
 * 客户单位字典数据 Composable
 */
/**
 * 字典表查询
 * @param typeId 字典类型ID
 * @param typeSecondId 二级类型ID（可选）
 */
export const getDictionary = async (
  typeId: number,
  typeSecondId?: number
): Promise<Array<{ value: string | number; name: string }>> => {
  const params: any = {
    full: true,
    pageNum: 1,
    pageSize: 100000,
    typeId,
    usestatus: 1,
  };
  if (typeSecondId) {
    params.typeSecondId = typeSecondId;
  }
  const res = await CommonService.getDictionaries(params);
  return res.list.map((ele: any) => ({
    value: ele.DIC_SELECT_ID,
    name: ele.DIC_SELECT_NAME,
  }));
};

/**
 * 批量获取客户单位相关字典数据
 * @returns 返回医院等级、销售规模、学术专线、科室角色列表
 */
export const useUnitDictionary = () => {
  const hosTypeList = ref<any[]>([]); // 医院等级
  const saleTypeList = ref<any[]>([]); // 销售规模
  const learnTypeList = ref<any[]>([]); // 学术专线
  const roleTypeList = ref<any[]>([]); // 科室角色

  /**
   * 获取所有字典数据
   */
  const getSearchList = async () => {
    try {
      const [hosTypeRes, saleTypeRes, learnTypeRes, roleTypeRes] = await Promise.all([
        getDictionary(12),
        getDictionary(13),
        getDictionary(1),
        getDictionary(2, 1),
      ]);
      hosTypeList.value = hosTypeRes;
      saleTypeList.value = saleTypeRes;
      learnTypeList.value = learnTypeRes;
      roleTypeList.value = roleTypeRes;
    } catch (error) {
      console.error('获取字典数据失败:', error);
    }
  };

  return {
    hosTypeList,
    saleTypeList,
    learnTypeList,
    roleTypeList,
    getSearchList,
    getDictionary,
  };
};
