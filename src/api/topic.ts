export class TopicService {
  /**
   * 统计接收数据
   * @param params 查询参数
   * @returns 返回统计数据
   */
  static async getTopicNum(params: Record<string, any>) {
    const response = await http.web.post('/api/TopicSquare/getTopicNum', params, {
      showLoading: true,
    });
    return response.data;
  }

  static async getTopicList(params: Record<string, any>) {
    const response = await http.web.post('/api/TopicSquare/getTopicList', params, {
      showLoading: true,
    });
    return response.data;
  }
  /**
   * @description: 新增评论或回复
   * @param {*} params
   */
  static async insDiscuss(params: Record<string, any>) {
    const response = await http.web.post('/api/TopicSquare/insDiscuss', params, {
      showLoading: true,
    });
    return response.data;
  }
  /**
   * @description: 获取话题的评论与回复
   * @param {*} params
   */
  static async getTopicDiscuss(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/TopicSquare/getTopicDiscuss', params, {
      showLoading: true,
    });
    return response.data;
  }
  /**
   * @description: 有用和取消有用
   * @param {*} params
   */
  static async addSubscribe(params: Record<string, any>) {
    const response = await http.web.post('/api/TopicSquare/addSubscribe', params, {
      showLoading: true,
    });
    return response.data;
  }
  /**
   * @description: 获取有用信息
   * @param {*} params
   */
  static async getSubscribe(params: Record<string, any>) {
    const response = await http.web.post('/api/TopicSquare/getSubscribe', params, {
      showLoading: true,
    });
    return response.data;
  }
  /**
   * @description: 加签'@'个人或组织架构标签
   * @param {*} params
   */
  static async insSign(params: Record<string, any>) {
    const response = await http.web.post('/api/TopicSquare/insSign', params, {
      showLoading: true,
    });
    return response.data;
  }
  /**
   * @description: 个人新增话题
   * @param {*} params
   */
  static async insTopicPersonal(params: Record<string, any>) {
    const response = await http.web.post('/api/TopicSquare/insTopicPersonal', params, {
      showLoading: true,
    });
    return response.data;
  }
  /**
   * @description: 获取话题详细信息
   * @param {*} params
   */
  static async getTopicDetail(params: Record<string, any>) {
    const response = await http.web.formDataPost('/api/TopicSquare/getTopicDetail', params, {
      showLoading: true,
    });
    return response.data;
  }
}
