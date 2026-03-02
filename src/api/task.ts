/**
 * 任务审批服务类
 * 提供任务审批相关的所有API接口
 */
export class TaskService {
  /**
   * 统计接收数据
   * @param params 查询参数
   * @returns 返回统计数据
   */
  static async queryCountReceive(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/taskApproval/queryCountReceive', params, {
      showLoading: true,
    });
    return response.data;
  }

  /**
   * 统计发送数据
   * @param params 查询参数
   * @returns 返回统计数据
   */
  static async queryCountSend(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/taskApproval/queryCountSend', params);
    return response.data;
  }

  /**
   * 查询特定任务信息
   * @returns 返回特定任务数据
   */
  static async specific() {
    const response = await http.wechat.get('/api/task/specific', {
      params: {},
      showLoading: true,
    });
    return response.data;
  }

  /**
   * 统计应收助手进行中数据
   * @param params 查询参数
   * @returns 返回统计数据
   */
  static async queryCount(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/receive/queryCount', params, {
      showLoading: true,
    });
    return response.data;
  }

  /**
   * 收款认领进行中数据
   * @param params 查询参数
   * @returns 返回未上传数量
   */
  static async getUnUploadNum(params: Record<string, any>) {
    const response = await http.wechat.post('/api/crmCollectionClaim/getUnUploadNum', params, {
      showLoading: true,
    });
    return response.data;
  }

  /**
   * 查询发送的消息
   * @param params 查询参数
   * @returns 返回发送的消息列表
   */
  static async querySend(params: Record<string, any>) {
    const response = await http.web.post('/api/taskApproval/querySend', params, {
      showLoading: false,
    });
    return response.data;
  }

  /**
   * 查询收到的消息
   * @param params 查询参数
   * @returns 返回收到的消息列表
   */
  static async queryReceive(params: Record<string, any>) {
    const response = await http.web.post('/api/taskApproval/queryReceive', params, {
      showLoading: false,
    });
    return response.data;
  }

  /**
   * 作废消息
   * @param params 作废参数
   * @returns 返回作废结果
   */
  static async deleteTaskApproval(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/taskApproval/delete', params);
    return response.data;
  }

  /**
   * 查询部门或组
   * @param params 查询参数
   * @returns 返回部门或组列表
   */
  static async queryDepOrGroup(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/taskApproval/queryDepOrGroup', params);
    return response.data;
  }

  /**
   * 查询标签
   * @param params 查询参数
   * @returns 返回标签列表
   */
  static async queryTag(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/taskApproval/queryTag', params);
    return response.data;
  }

  /**
   * 提交回执
   * @param params 回执参数
   * @returns 返回提交结果
   */
  static async submitReturn(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/taskApproval/submitReturn', params);
    return response.data;
  }

  /**
   * 发送消息详情
   * @param params 查询参数
   * @returns 返回消息详情
   */
  static async querySendMsgDetail(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/taskApproval/querySendMsgDetail', params);
    return response.data;
  }

  /**
   * 微信查询消息
   * @param params 查询参数
   * @returns 返回消息列表
   */
  static async queryWxMsg(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/taskApproval/queryWxMsg', params);
    return response.data;
  }

  /**
   * 催办
   * @param params 催办参数
   * @returns 返回催办结果
   */
  static async urgeReply(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/taskApproval/urgeReply', params);
    return response.data;
  }

  /**
   * 修改状态
   * @param params 修改参数
   * @returns 返回修改结果
   */
  static async modifyReceiveStatus(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/taskApproval/modifyReceiveStatus', params);
    return response.data;
  }

  /**
   * 新增消息
   * @param params 新增参数
   * @returns 返回新增结果
   */
  static async addTaskApproval(params: Record<string, any>) {
    const response = await http.web.post('/api/taskApproval/add', params);
    return response.data;
  }
}
