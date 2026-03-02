export class FundingService {
  // 查询填报列表
  static async queryFundForm(payload: Record<string, string | number>) {
    const response = await http.web.formDataPost('/api/fund/queryFundForm', payload);
    return response.data;
  }

  // 查询资金填报部门
  static async queryFundDept(payload: Record<string, string>) {
    const response = await http.web.formDataPost('/api/fund/queryFundDept', payload);
    return response.data;
  }

  // 查询填报历史
  static async queryFundFormHistory(payload: Record<string, string | number>) {
    const response = await http.web.formDataPost('/api/fund/queryFundFormHistory', payload);
    return response.data;
  }

  // 查询填报详情
  static async queryFundFormDtl(payload: Record<string, string>) {
    const response = await http.web.formDataPost('/api/fund/queryFundFormDtl', payload);
    return response.data;
  }

  // 月初填报
  static async addFundForm(payload: Record<string, string | number>) {
    const response = await http.web.formDataPost('/api/fund/addFundForm', payload);
    return response.data;
  }

  // 月末修改
  static async modifyFundForm(payload: Record<string, string | number>) {
    const response = await http.web.formDataPost('/api/fund/modifyFundForm', payload);
    return response.data;
  }

  // 查询资金填报报表统计
  static async queryFundTableBar(payload: Record<string, string>) {
    const response = await http.web.formDataPost('/api/fund/queryFundTableBar', payload);
    return response.data;
  }

  // 查询资金填报报表
  static async queryFundTable(payload: Record<string, string | number>) {
    const response = await http.web.formDataPost('/api/fund/queryFundTable', payload);
    return response.data;
  }

  // 添加到款金额
  static async addPaymentAmount(payload: Record<string, string | number>) {
    const response = await http.web.formDataPost('/api/fund/addPaymentAmount', payload);
    return response.data;
  }
}
