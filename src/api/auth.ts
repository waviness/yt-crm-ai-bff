/**
 * 认证服务类，提供多种登录方式和协议同意功能
 */
export class AuthService {
  /**
   * 使用用户名密码凭证登录
   * @param payload 包含登录凭证的对象，通常包含用户名和密码等字段
   * @returns 返回登录请求的响应结果
   */
  static async signInWithCredentials(payload: Record<string, string>) {
    const response = await http.formDataPost('/api/login/plaintextLogin', payload);
    return response.data;
  }

  /**
   * 使用小程序登录
   * @param payload 包含小程序登录所需信息的对象
   */
  static async signInWithMiniProgram(payload: Record<string, string>) {
    const response = await http.formDataPost('/api/login/doLogin', payload);
    return response.data;
  }

  /**
   * 使用公众号登录
   * @param payload 包含公众号登录所需信息的对象
   * @returns 返回登录成功的用户数据
   * @throws 当登录失败时抛出错误，包含服务器返回的错误信息
   */
  static async signInWithOfficialAccount(payload: Record<string, any>) {
    // 发送登录请求
    const response = await http.formDataPost('/api/login/doLogin', payload);
    return response.data;
  }

  /**
   * 同意用户协议
   * @param payload 包含协议同意相关信息的对象
   * @throws 当协议同意失败时抛出错误，包含服务器返回的错误信息
   */
  static async agreeAgreement(payload: Record<string, any>) {
    // 发送协议同意请求
    return await http.post('/api/login/agreeAgreement', payload);
  }
}
