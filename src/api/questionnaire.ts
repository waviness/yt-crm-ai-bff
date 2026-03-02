import http from '@/utils/http';

/**
 * 问卷服务类
 */
export class QuestionnaireService {
  /**
   * 手机端查询问卷总单
   * @param payload 查询参数
   * @returns 返回问卷列表
   */
  static async getDocUser(payload: Record<string, any>) {
    const response = await http.web.formDataPost('/api/questionSurvey/getDocUser', payload, {
      showLoading: false,
    });
    return response.data;
  }

  /**
   * 查询问卷细单
   * @param payload 查询参数
   * @returns 返回问卷详情
   */
  static async getDtl(payload: Record<string, any>) {
    const response = await http.web.formDataPost('/api/questionSurvey/getDtl', payload, {
      showLoading: false,
    });
    return response.data;
  }

  /**
   * 提交问卷
   * @param payload 提交参数
   * @returns 返回提交结果
   */
  static async submitSurvey(payload: Record<string, any>) {
    const response = await http.web.post('/api/questionSurvey/submitSurvey', payload);
    return response.data;
  }

  /**
   * 查询人员填写的问卷
   * @param payload 查询参数
   * @returns 返回人员填写的问卷列表
   */
  static async getPersonsSurvey(payload: Record<string, any>) {
    const response = await http.web.formDataPost('/api/questionSurvey/getPersonsSurvey', payload);
    return response.data;
  }
}
