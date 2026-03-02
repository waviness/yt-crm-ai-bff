/**
 * HTTP 请求工具
 * 基于 luch-request 封装的 HTTP 客户端
 * 提供统一的请求/响应处理、错误处理、拦截器等功能
 *
 * @fileoverview HTTP 请求工具类
 */
interface HttpRequestConfig {
  /** 请求地址 */
  url: string;
  /** 请求方法 */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  /** 参数对象 */
  params?: any;
  /** 请求数据 */
  data?: any;
  /** 请求头 */
  header?: Record<string, string>;
  /** 超时时间（毫秒） */
  timeout?: number;
  /** 数据类型 */
  dataType?: string;
  /** 响应类型 */
  responseType?: string;
  /** 是否验证 SSL 证书 */
  sslVerify?: boolean;
  /** 是否携带 Cookie */
  withCredentials?: boolean;
  /** 请求ID，用于取消请求 */
  requestId?: string;
  /** 是否显示loading效果 */
  showLoading?: boolean;
  /** loading的提示文字 */
  loadingTitle?: string;
  /** loading是否需要遮罩 */
  loadingMask?: boolean;
  /** 是否自动取消相同请求，默认为true */
  cancelSameRequest?: boolean;
  /** 相同请求判断策略：'url' 仅根据URL判断，'url+params' 根据URL+参数判断，默认为'url' */
  sameRequestStrategy?: 'url' | 'url+params';
}

// 基础返回体
interface BaseResult<T = any> {
  /** 状态码 */
  code: string;
  /** 返回数据 */
  data: T;
  /** 消息描述 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

// 定义响应接口
interface HttpResponse<T = any> {
  /** 响应数据 */
  data: T;
  /** 状态码 */
  statusCode: number;
  /** 响应头 */
  header: any;
  /** cookies */
  cookies: string[];
}

// 定义错误响应接口
interface HttpError {
  /** 错误信息 */
  errMsg: string;
  /** 错误主题 */
  errSubject?: string;
  /** HTTP 状态码（可能存在） */
  statusCode?: number;
  /** 原始错误对象 */
  originalError?: any;
}

// 拦截器接口
interface Interceptor<T = any> {
  /** 请求拦截器 */
  onRequest?: (config: HttpRequestConfig) => HttpRequestConfig | Promise<HttpRequestConfig>;
  /** 响应拦截器 */
  onResponse?: (response: HttpResponse<T>) => HttpResponse<T> | Promise<HttpResponse<T>>;
  /** 错误拦截器 */
  onError?: (error: any) => any;
}

/**
 * HTTP客户端类，用于发送HTTP请求
 */
class HttpClient {
  /** 基础URL */
  private baseUrl: string;
  /** 默认请求头 */
  private defaultHeaders: Record<string, string>;
  /** 超时时间 */
  private timeout: number;
  /** 请求拦截器列表 */
  private requestInterceptors: ((
    config: HttpRequestConfig
  ) => HttpRequestConfig | Promise<HttpRequestConfig>)[];
  /** 响应拦截器列表 */
  private responseInterceptors: ((
    response: HttpResponse<any>
  ) => HttpResponse<any> | Promise<HttpResponse<any>>)[];
  /** 错误拦截器列表 */
  private errorInterceptors: ((error: any) => any)[];
  /** 请求任务映射表 */
  private requestTasks: Map<string, UniApp.RequestTask>;
  /** 相同请求映射表，用于自动取消上一个相同请求 */
  private sameRequestTasks: Map<string, string>;
  /** 是否显示加载状态 */
  private showLoading: boolean;
  /** 当前活跃的请求数量 */
  private requestCount: number = 0;
  /** loading状态是否已显示 */
  private isLoadingShown: boolean = false;
  /** 是否正在处理登录超时 */
  private isHandlingLoginTimeout = false;
  // 登录相关错误码集合（类的私有属性）
  private loginErrorCodes = new Set(['LG00003', 'LG00004']);

  /**
   * 构造函数
   * @param config 配置对象
   * @param config.baseUrl 基础URL
   * @param config.timeout 超时时间
   * @param config.showLoading 是否显示加载状态
   */
  constructor(config?: { baseUrl?: string; timeout?: number; showLoading?: boolean }) {
    this.baseUrl = config?.baseUrl || '';
    this.timeout = config?.timeout || 60000; // uni-app默认超时时间为60000ms
    this.showLoading = config?.showLoading || true;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.errorInterceptors = [];
    this.requestTasks = new Map();
    this.sameRequestTasks = new Map();

    this.setupApiInterceptors();
    this.setupLoadingInterceptors();
  }

  /**
   * 生成请求的唯一键（用于判断是否为相同请求）
   * @param config 请求配置
   * @returns 请求唯一键
   */
  private generateRequestKey(config: HttpRequestConfig): string {
    const { url, method = 'GET', params, data, sameRequestStrategy = 'url' } = config;

    // 如果策略是仅根据URL判断，则忽略参数
    if (sameRequestStrategy === 'url') {
      return `${method}:${url}`;
    }

    // 默认策略：根据URL+参数判断
    // 对于 formData，需要特殊处理，因为 data 可能是字符串
    let dataKey = data;
    if (typeof data === 'string') {
      // 如果是字符串，尝试解析为对象进行比较
      try {
        const urlParams = new URLSearchParams(data);
        const obj: Record<string, string> = {};
        urlParams.forEach((value, key) => {
          obj[key] = value;
        });
        dataKey = obj;
      } catch {
        // 解析失败，使用原始字符串
        dataKey = data;
      }
    }

    return `${method}:${url}:${JSON.stringify(params || {})}:${JSON.stringify(dataKey || {})}`;
  }

  /**
   * 设置接口相关拦截器
   */
  private setupApiInterceptors() {
    this.addRequestInterceptor((config: HttpRequestConfig) => {
      // 此处增加接口所需配置，如 token
      const authStore = useAuthStore();
      const token = authStore.token || '';
      // 若 Token 存在，添加到请求头
      if (token) {
        config.header = {
          ...config.header,
          'X-TOKEN': token,
        };
      }

      return config;
    });

    this.addResponseInterceptor((response: HttpResponse<BaseResult>) => {
      // 开发环境下打印响应日志
      if (import.meta.env.DEV) {
        console.log('API Response:', response);
      }

      const { data, statusCode } = response;

      // 处理非 200 的 HTTP 状态码（如 400、401、500 等）
      if (statusCode !== 200) {
        // 处理 401 未授权（登录失效）
        if (statusCode === 401) {
          this.handleLoginTimeout();
          const error: HttpError = {
            errMsg: '登录已失效，请重新登录',
            statusCode: statusCode,
            originalError: response,
          };
          throw error;
        }

        const error: HttpError = {
          errMsg: `请求失败（${statusCode}）`,
          statusCode: statusCode, // 携带状态码
          originalError: response,
        };
        throw error; // 抛到错误拦截器处理
      }

      // 处理登录超时/失效
      // 判断当前错误码是否在登录相关错误码集合中
      if (this.loginErrorCodes.has(data.code)) {
        this.handleLoginTimeout(); // 触发重新登录逻辑
        const error: HttpError = { errMsg: '登录已失效，请重新登录' };
        throw error;
      }
      // 由于/api/secondSell/getGoodsResell 和/secondSell/getCustomersOftenPin 接口返回的直接是分页包 和别的都不一致 建议后续后端修改 先临时处理一下
      // 由于/api/secondSell/getGoodsDtl接口返回的直接是数组 所以这里需要特殊处理 建议后续后端修改 先临时处理一下
      if ((!data.success && (data as any)?.list) || (!data.success && (data as any)?.length)) {
        return response;
      }
      if (!data.success) {
        const error: HttpError = {
          errMsg: data.msg,
          originalError: response,
        };
        // 将 code 也添加到错误对象中，方便在 catch 中获取
        (error as any).code = data.code;
        throw error;
      }

      return response;
    });

    this.addErrorInterceptor((error: HttpError) => {
      // 如果是取消请求的错误，不显示提示
      if (this.isAbortError(error)) {
        return Promise.reject(error);
      }

      // 如果是登录失效错误
      if (this.isLoginTimeoutError(error)) {
        // H5端显示提示，小程序端不显示
        if (!isMiniProgram()) {
          const errorMsg = this.getErrorMessage(error);
          showError(errorMsg);
        }
        return Promise.reject(error);
      }

      const errorMsg = this.getErrorMessage(error);

      // 显示错误信息（showError 会抛出新的 Error，但我们需要保留原始错误信息）
      // 将原始错误信息附加到新的 Error 对象上
      try {
        showError(errorMsg);
      } catch (e: any) {
        // 将原始错误信息附加到新的 Error 对象上
        if (e instanceof Error) {
          (e as any).originalHttpError = error;
          (e as any).code = (error as any).code;
        }
        throw e;
      }

      return Promise.reject(error);
    });
  }

  /**
   * 判断是否为取消请求的错误
   * @param error 错误对象
   * @returns 是否为取消请求的错误
   */
  private isAbortError(error: HttpError): boolean {
    const errMsg = error.errMsg || '';
    return errMsg.includes('abort') || errMsg.includes('cancel') || errMsg.includes('中断');
  }

  /**
   * 判断是否为登录失效错误
   * @param error 错误对象
   * @returns 是否为登录失效错误
   */
  private isLoginTimeoutError(error: HttpError): boolean {
    const errMsg = error.errMsg || '';
    // 更精确的判断：必须是完整的登录失效提示
    return errMsg === '登录已失效，请重新登录';
  }

  /**
   * 处理登录超时/失效
   * H5端：清空缓存，返回入口重新进入会触发登录
   * 小程序端：清空缓存，relaunch到登录页面
   */
  private handleLoginTimeout(): void {
    if (this.isHandlingLoginTimeout) return;
    this.isHandlingLoginTimeout = true;
    try {
      const authStore = useAuthStore();
      if (isMiniProgram()) {
        // 小程序端：清空缓存并relaunch到登录页面
        authStore.clear();
        router.reLaunch(RouteMap.login);
      } else {
        // H5端：清空缓存，返回入口重新进入会触发登录
        authStore.clear();
        // H5端不需要主动跳转，返回入口后会重新触发登录流程
      }
    } catch (error) {
      console.error('处理登录超时失败:', error);
    } finally {
      this.isHandlingLoginTimeout = false; // 确保释放锁
    }
  }

  /**
   * 获取用户友好的错误信息
   */
  private getErrorMessage(error: HttpError): string {
    // 优先使用业务错误信息
    if (error.errMsg && !error.statusCode) {
      return error.errMsg;
    }

    // HTTP状态码错误映射
    const statusCodeMessages: Record<number, string> = {
      400: '请求参数错误，请检查输入',
      401: '身份验证失败，请重新登录',
      403: '没有权限访问该资源',
      404: '请求的资源不存在',
      500: '服务器内部错误，请稍后重试',
      502: '网关错误，请稍后重试',
      503: '服务暂时不可用，请稍后重试',
      504: '网关超时，请稍后重试',
    };

    // 处理有状态码的错误
    if (error.statusCode !== undefined) {
      return statusCodeMessages[error.statusCode] || `请求错误（${error.statusCode}）`;
    }

    // 处理网络错误
    if (error.errMsg) {
      return this.parseNetworkError(error.errMsg);
    }

    return '请求失败，请稍后重试';
  }

  /**
   * 解析网络错误信息
   */
  private parseNetworkError(errMsg: string): string {
    const errorPatterns = [
      { pattern: /网络|Network/i, message: '网络连接失败，请检查网络' },
      { pattern: /超时|timeout/i, message: '请求超时，请稍后重试' },
      { pattern: /中断|abort/i, message: '请求被中断' },
      { pattern: /连接|connection/i, message: '连接失败，请检查网络' },
    ];

    for (const { pattern, message } of errorPatterns) {
      if (pattern.test(errMsg)) {
        return message;
      }
    }

    return `请求失败：${errMsg}`;
  }

  /**
   * 设置loading拦截器
   */
  private setupLoadingInterceptors(): void {
    // 请求拦截器 - 开始loading
    this.addRequestInterceptor((config: HttpRequestConfig) => {
      // 处理loading效果
      if (this.isShowLoading(config)) {
        this.requestCount++;
        if (!this.isLoadingShown) {
          uni.showLoading({
            title: config.loadingTitle || '加载中...',
            mask: typeChecker.isDefined(config.loadingMask) ? config.loadingMask : true,
          });
          this.isLoadingShown = true;
        }
      }

      return config;
    });
  }

  /**
   * 判断是否显示加载状态
   * @param config HTTP请求配置对象
   * @returns 返回是否显示加载状态的布尔值
   */
  private isShowLoading(config: HttpRequestConfig): boolean {
    return typeChecker.isDefined(config.showLoading) ? config.showLoading! : this.showLoading;
  }

  /**
   * 设置默认请求头
   * @param headers 请求头
   */
  setDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  /**
   * 添加请求拦截器
   * @param onFulfilled 请求拦截器
   */
  addRequestInterceptor(
    onFulfilled: (config: HttpRequestConfig) => HttpRequestConfig | Promise<HttpRequestConfig>
  ): void {
    this.requestInterceptors.push(onFulfilled);
  }

  /**
   * 添加响应拦截器
   * @param onFulfilled 响应拦截器
   */
  addResponseInterceptor(
    onFulfilled: (response: HttpResponse<any>) => HttpResponse<any> | Promise<HttpResponse<any>>
  ): void {
    this.responseInterceptors.push(onFulfilled);
  }

  /**
   * 添加错误拦截器
   * @param onError 错误拦截器
   */
  addErrorInterceptor(onError: (error: any) => any): void {
    this.errorInterceptors.push(onError);
  }

  /**
   * 添加拦截器
   * @param interceptor 拦截器对象
   */
  addInterceptor<T = any>(interceptor: Interceptor<T>): void {
    if (interceptor.onRequest) {
      this.requestInterceptors.push(interceptor.onRequest);
    }

    if (interceptor.onResponse) {
      this.responseInterceptors.push(interceptor.onResponse);
    }

    if (interceptor.onError) {
      this.errorInterceptors.push(interceptor.onError);
    }
  }

  /**
   * 取消请求
   * @param requestId 请求ID
   */
  cancelRequest(requestId: string): void {
    const task = this.requestTasks.get(requestId);
    if (task) {
      task.abort();
      this.requestTasks.delete(requestId);
    }
  }

  /**
   * 取消所有请求
   */
  cancelAllRequests(): void {
    this.requestTasks.forEach(task => task.abort());
    this.requestTasks.clear();
    // 重置请求计数和loading状态
    this.requestCount = 0;
    if (this.isLoadingShown) {
      uni.hideLoading();
      this.isLoadingShown = false;
    }
  }

  /**
   * 生成请求ID
   * @returns 请求ID
   */
  private generateRequestId(): string {
    return (
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * GET请求
   * @param url 请求地址
   * @param config 请求配置
   * @returns Promise<BaseResult<T>>
   */
  get<T = any>(
    url: string,
    config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>
  ): Promise<BaseResult<T>> {
    return this.request<T>({ ...config, url, method: 'GET' });
  }

  /**
   * POST请求
   * @param url 请求地址
   * @param data 请求数据
   * @param config 请求配置
   * @returns Promise<BaseResult<T>>
   */
  post<T = any>(
    url: string,
    data?: any,
    config?: Omit<HttpRequestConfig, 'url' | 'method'>
  ): Promise<BaseResult<T>> {
    return this.request<T>({ ...config, url, method: 'POST', data });
  }

  /**
   * PUT请求
   * @param url 请求地址
   * @param data 请求数据
   * @param config 请求配置
   * @returns Promise<BaseResult<T>>
   */
  put<T = any>(
    url: string,
    data?: any,
    config?: Omit<HttpRequestConfig, 'url' | 'method'>
  ): Promise<BaseResult<T>> {
    return this.request<T>({ ...config, url, method: 'PUT', data });
  }
  /**
   * PUT请求
   * @param url 请求地址
   * @param config 请求配置
   * @returns Promise<BaseResult<T>>
   */
  putGet<T = any>(
    url: string,
    config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>
  ): Promise<BaseResult<T>> {
    return this.request<T>({ ...config, url, method: 'PUT' });
  }

  /**
   * DELETE请求
   * @param url 请求地址
   * @param data 请求数据
   * @param config 请求配置
   * @returns Promise<BaseResult<T>>
   */
  delete<T = any>(
    url: string,
    data?: any,
    config?: Omit<HttpRequestConfig, 'url' | 'method'>
  ): Promise<BaseResult<T>> {
    return this.request<T>({ ...config, url, method: 'DELETE', data });
  }

  /**
   * PATCH请求
   * @param url 请求地址
   * @param data 请求数据
   * @param config 请求配置
   * @returns Promise<BaseResult<T>>
   */
  patch<T = any>(
    url: string,
    data?: any,
    config?: Omit<HttpRequestConfig, 'url' | 'method'>
  ): Promise<BaseResult<T>> {
    return this.request<T>({ ...config, url, method: 'PATCH', data });
  }

  /**
   * HEAD请求
   * @param url 请求地址
   * @param config 请求配置
   * @returns Promise<BaseResult<T>>
   */
  head<T = any>(
    url: string,
    config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>
  ): Promise<BaseResult<T>> {
    return this.request<T>({ ...config, url, method: 'HEAD' });
  }

  /**
   * OPTIONS请求
   * @param url 请求地址
   * @param config 请求配置
   * @returns Promise<BaseResult<T>>
   */
  options<T = any>(
    url: string,
    config?: Omit<HttpRequestConfig, 'url' | 'method' | 'data'>
  ): Promise<BaseResult<T>> {
    return this.request<T>({ ...config, url, method: 'OPTIONS' });
  }

  /**
   * formDataPost请求
   * @param url 请求地址
   * @param data 请求数据
   * @param config 请求配置
   * @returns Promise<BaseResult<T>>
   */
  formDataPost<T = any>(
    url: string,
    data?: any,
    config?: Omit<HttpRequestConfig, 'url' | 'method'>
  ): Promise<BaseResult<T>> {
    config = config || {};

    config.header = {
      ...config.header,
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const formData = Object.entries(data || {})
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`)
      .join('&');

    return this.request<T>({
      ...config,
      url,
      method: 'POST',
      data: formData,
    });
  }

  /**
   * 发送HTTP请求
   * @param config 请求配置
   * @returns Promise<BaseResult<T>>
   */
  async request<T = any>(config: HttpRequestConfig): Promise<BaseResult<T>> {
    // 生成请求唯一键
    const requestKey = this.generateRequestKey(config);

    // 检查是否需要自动取消相同请求（默认为true）
    const shouldCancelSameRequest = config.cancelSameRequest !== false;

    // 如果存在相同的请求且允许取消，则取消上一个请求
    if (shouldCancelSameRequest) {
      const previousRequestId = this.sameRequestTasks.get(requestKey);
      if (previousRequestId) {
        this.cancelRequest(previousRequestId);
      }
    }

    // 生成请求ID
    const requestId = config.requestId || this.generateRequestId();
    const showLoading = this.isShowLoading(config);

    // 记录当前请求（只有在允许取消相同请求时才记录）
    if (shouldCancelSameRequest) {
      this.sameRequestTasks.set(requestKey, requestId);
    }

    try {
      // 执行请求拦截器
      let interceptedConfig: HttpRequestConfig & { requestId: string } = {
        ...config,
        requestId,
      };

      for (const interceptor of this.requestInterceptors) {
        interceptedConfig = (await interceptor(interceptedConfig)) as HttpRequestConfig & {
          requestId: string;
        };
      }

      // 发送请求
      const response = await this.sendRequest<T>(interceptedConfig, requestId);

      // 执行响应拦截器，并传递原始配置
      let interceptedResponse = response;
      for (const interceptor of this.responseInterceptors) {
        // 如果拦截器支持第二个参数（配置），则传递配置
        if (interceptor.length >= 2) {
          interceptedResponse = await (interceptor as any)(interceptedResponse, interceptedConfig);
        } else {
          interceptedResponse = await interceptor(interceptedResponse);
        }
      }

      // 处理loading计数和隐藏
      if (showLoading) {
        this.decreaseRequestCount();
      }

      // 请求完成后从任务列表中移除
      this.requestTasks.delete(requestId);
      if (shouldCancelSameRequest) {
        this.sameRequestTasks.delete(requestKey);
      }

      return interceptedResponse.data as unknown as BaseResult<T>;
    } catch (error) {
      // 先处理loading计数和隐藏，确保一定会执行
      if (showLoading) {
        this.decreaseRequestCount();
      }

      // 请求完成后从任务列表中移除
      this.requestTasks.delete(requestId);
      if (shouldCancelSameRequest) {
        this.sameRequestTasks.delete(requestKey);
      }

      // 执行错误拦截器，并传递原始配置
      let interceptedError = error;
      const errorInterceptorsWithConfig = this.errorInterceptors.filter(i => i.length >= 2);
      const errorInterceptorsWithoutConfig = this.errorInterceptors.filter(i => i.length < 2);

      try {
        // 处理带配置的错误拦截器
        for (const interceptor of errorInterceptorsWithConfig) {
          interceptedError = await (interceptor as any)(interceptedError, config);
        }

        // 处理不带配置的错误拦截器
        for (const interceptor of errorInterceptorsWithoutConfig) {
          interceptedError = await interceptor(interceptedError);
        }
      } catch (interceptorError) {
        // 如果拦截器本身抛出错误，使用该错误
        interceptedError = interceptorError;
      }

      throw interceptedError;
    }
  }

  /**
   * 减少请求计数并根据需要隐藏loading
   */
  private decreaseRequestCount(): void {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      if (this.isLoadingShown) {
        uni.hideLoading();
        this.isLoadingShown = false;
      }
    }
  }

  /**
   * 发送HTTP请求
   * @param config 请求配置
   * @param requestId 请求ID
   * @returns Promise<HttpResponse<T>>
   */
  private sendRequest<T = any>(
    config: HttpRequestConfig & { requestId: string },
    requestId: string
  ): Promise<HttpResponse<T>> {
    return new Promise((resolve, reject) => {
      const {
        url,
        method = 'GET',
        params,
        data,
        header = {},
        timeout = this.timeout,
        dataType = 'json',
        responseType = 'text',
        sslVerify = true,
        withCredentials = false,
      } = config;

      // 构建完整URL
      let fullUrl = this.baseUrl ? this.baseUrl + url : url;
      fullUrl = buildUrlWithParams(fullUrl, params);

      // 合并请求头
      const mergedHeaders = { ...this.defaultHeaders, ...header };

      // 调用uni.request发送请求
      const task = uni.request({
        url: fullUrl,
        method: method as any, // 类型断言，因为uni-app支持的方法与我们定义的略有不同
        data,
        header: mergedHeaders,
        timeout,
        dataType,
        responseType,
        sslVerify,
        withCredentials,
        success: (res: any) => {
          // 转换响应格式以匹配我们的接口定义
          const response: HttpResponse<T> = {
            data: res.data,
            statusCode: res.statusCode,
            header: res.header,
            cookies: res.cookies || [],
          };
          resolve(response);
        },
        fail: (err: HttpError) => {
          // 检查是否为取消请求的错误 -- 测试发现总有一些取消失败
          if (this.isAbortError(err)) {
            console.log(err.errMsg + '请求被取消');
          } else {
            reject({
              ...err,
              statusCode: undefined, // 网络错误无状态码
              originalError: err,
            });
          }
        },
      });

      // 保存请求任务，用于取消请求
      this.requestTasks.set(requestId, task);
    });
  }
}

/**
 * HttpClient扩展接口，支持链式调用不同服务
 */
interface HttpClient2 extends HttpClient {
  /** web服务客户端 */
  web: HttpClient;
  /** wechat服务客户端 */
  wechat: HttpClient;
  /** bigdata服务客户端 */
  bigdata: HttpClient;
}

/**
 * 创建支持链式调用的代理对象
 * @param defaultClient 默认客户端实例
 * @returns HttpClient2代理对象
 */
function createHttpProxy(defaultClient: HttpClient): HttpClient2 {
  // 预定义的客户端配置
  const clientConfigs: Record<string, { baseUrl: string }> = {
    web: {
      baseUrl: isMiniProgram()
        ? import.meta.env.VITE_WEB_API_URL
        : import.meta.env.VITE_WEB_API_PREFIX,
    },
    wechat: {
      baseUrl: isMiniProgram()
        ? import.meta.env.VITE_WECHAT_API_URL
        : import.meta.env.VITE_WECHAT_API_PREFIX,
    },
    bigdata: {
      baseUrl: isMiniProgram()
        ? import.meta.env.VITE_BIGDATA_API_URL
        : import.meta.env.VITE_BIGDATA_API_PREFIX,
    },
  };

  // 缓存已创建的客户端实例
  const clientCache: Map<string, HttpClient> = new Map();
  clientCache.set('default', defaultClient);

  // 创建代理处理器
  const handler: ProxyHandler<any> = {
    get(target: HttpClient, prop: any) {
      // 如果属性存在于默认客户端中，直接返回
      if (prop in target) {
        return (target as any)[prop];
      }

      // 如果是预定义的客户端名称，创建或返回对应的客户端实例
      if (prop in clientConfigs) {
        if (!clientCache.has(prop)) {
          clientCache.set(prop, new HttpClient(clientConfigs[prop]));
        }
        return clientCache.get(prop);
      }

      // 其他情况返回 undefined
      return undefined;
    },
  };

  // 返回代理对象
  return new Proxy(defaultClient, handler);
}

// 创建默认实例
const defaultHttp = new HttpClient({
  baseUrl: isMiniProgram()
    ? import.meta.env.VITE_AUTHOR_API_URL
    : import.meta.env.VITE_AUTHOR_API_PREFIX,
  showLoading: true,
});

// 创建代理对象以支持 http.xxx.xxx 的调用模式
const http = createHttpProxy(defaultHttp);

export default http as HttpClient2;
export { HttpClient };
export type { HttpRequestConfig, HttpResponse, HttpError, Interceptor, HttpClient2 };
