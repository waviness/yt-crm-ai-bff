export class LicenseService {
  // 分页查询证照列表接口
  static async queryLicenseList(payload: Record<string, string | number>) {
    const response = await http.wechat.get('/api/license/getList', {
      params: payload,
      showLoading: false,
    });
    return response.data;
  }

  // 分页查询客户法人委托书列表接口
  static async queryAttorneyLetterList(payload: Record<string, string | number>) {
    const response = await http.wechat.get('/api/attorneyLetter/getList', {
      params: payload,
      showLoading: false,
    });
    return response.data;
  }

  // 获取当前登录用户所在部门的经理人员列表接口
  static async getManagersByCurrentUser(payload: Record<string, string | number>) {
    const response = await http.wechat.get('/api/task/getManagersByCurrentUser', payload);
    return response.data;
  }

  // 证照延期申请接口
  static async delayApply(payload: Record<string, string | number | string[] | undefined>) {
    const response = await http.wechat.formDataPost('/api/license/delayApply', payload);
    return response.data;
  }

  // 客户法人委托书延期申请接口
  static async delayAttorneyLetterApply(
    payload: Record<string, string | number | string[] | undefined>
  ) {
    const response = await http.wechat.formDataPost('/api/attorneyLetter/delayApply', payload);
    return response.data;
  }

  // 质量人员给延期申请中的证照审核接口
  static async audit(payload: Record<string, string | number>) {
    const response = await http.wechat.formDataPost('/api/license/delayApply/audit', payload);
    return response.data;
  }

  // 给延期申请中的客户法人委托书审核接口
  static async attorneyLetterAudit(payload: Record<string, string | number>) {
    const response = await http.wechat.formDataPost(
      '/api/attorneyLetter/delayApply/audit',
      payload
    );
    return response.data;
  }

  // 选择一个经理人复签(证照/法人委托书延期申请)接口
  static async chooseManager(payload: Record<string, string>) {
    const response = await http.wechat.formDataPost('/api/material/chooseManager', payload);
    return response.data;
  }

  // 经理复签近七天内有解锁记录的证照/法人委托书接口
  static async managerResign(payload: Record<string, string>) {
    const response = await http.wechat.post('/api/material/managerResign', payload);
    return response.data;
  }
}
