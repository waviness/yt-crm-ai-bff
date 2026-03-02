import {
  QUANTITY_POLICY_OPTIONS,
  VBP_POLICY_OPTIONS,
  VBP_DECISION_DEPT_OPTIONS,
  MANAGEMENT_TYPE_OPTIONS,
  ADJUSTMENT_CYCLE_OPTIONS,
} from '../../constants';

/**
 * 政策模块专属业务逻辑
 */
export function useVbpPolicy() {
  const getPolicyList = async (params: any) => {
    return await VbpService.queryHospitalPolicyList(params);
  };

  const getPolicyDetail = async (recordId: number) => {
    return await VbpService.queryHospitalPolicyDetail({ recordId });
  };

  const submitPolicy = async (params: any) => {
    await VbpService.addHospitalPolicyDetail(params);
    showSuccess('提交成功');
  };

  const mapPolicyOptions = (res: any, statusType: number) => {
    if (statusType) {
      return {
        quantityObj: res.goodsQuantity
          ? {
              id: res.goodsQuantity,
              name: findNameById(res.goodsQuantity, QUANTITY_POLICY_OPTIONS),
            }
          : undefined,
        vbpObj: res.vbpPolicy
          ? {
              id: res.vbpPolicy,
              name: findNameById(res.vbpPolicy, VBP_POLICY_OPTIONS),
            }
          : undefined,
        deptObj: res.department
          ? {
              id: res.department,
              name: findNameById(res.department, VBP_DECISION_DEPT_OPTIONS),
            }
          : undefined,
        cycleObj: res.adjustCycle
          ? {
              id: res.adjustCycle,
              name: findNameById(res.adjustCycle, ADJUSTMENT_CYCLE_OPTIONS),
            }
          : undefined,
        manageObj: res.manageType
          ? {
              id: res.manageType,
              name: findNameById(res.manageType, MANAGEMENT_TYPE_OPTIONS),
            }
          : undefined,
      };
    }
    return {
      quantityObj: undefined,
      vbpObj: undefined,
      deptObj: undefined,
      cycleObj: undefined,
      manageObj: undefined,
    };
  };

  return {
    getPolicyList,
    getPolicyDetail,
    submitPolicy,
    mapPolicyOptions,
  };
}
