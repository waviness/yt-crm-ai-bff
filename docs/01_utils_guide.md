# Utils 工具函数入门指南## 字体加载 (fontLoader.ts)

字体加载工具用于批量加载自定义字体。

### 主要功能

- `loadFonts(timeout)`: 批量加载字体

### 使用示例

```javascript
// 加载字体
const result = await loadFonts(10000);
console.log('成功加载的字体:', result.success);
console.log('加载失败的字体:', result.error);
console.log('超时的字体:', result.timeout);
```

在项目开发中，我们经常会用到一些通用的工具函数。这些函数被封装在 [src/utils](../src/utils) 目录下，以模块化的方式提供各种功能。本文档将详细介绍每个工具函数的作用和使用方法。

## 目录

1. [缓存管理 (cache.ts)](#缓存管理-cachets)
2. [类型转换 (converter.ts)](#类型转换-converterts)
3. [环境检测 (env.ts)](#环境检测-envts)
4. [HTTP 请求 (http.ts)](#http-请求-httpts)
5. [权限管理 (permission.ts)](#权限管理-permissionts)
6. [路由管理 (router.ts)](#路由管理-routerts)
7. [时间处理 (time.ts)](#时间处理-timets)
8. [提示信息 (toast.ts)](#提示信息-toastts)
9. [类型检查 (type-checker.ts)](#类型检查-type-checkerts)
10. [URL 处理 (url.ts)](#url-处理-urlts)
11. [实时通信 (goeasy.ts)](#实时通信-goeasyts)

## 缓存管理 (cache.ts)

缓存管理工具提供了一套完整的本地缓存操作方案，支持设置过期时间。

### 主要功能

- `set(key, data, ttl)`: 设置缓存项
- `get(key)`: 获取缓存项
- `remove(key)`: 删除缓存项
- `clear()`: 清空所有缓存
- `clearExpired()`: 清除过期缓存

### 使用示例

```javascript
// 设置缓存，10分钟后过期
cache.set('userInfo', { name: '张三', age: 25 }, 10 * 60 * 1000);

// 获取缓存
const userInfo = cache.get('userInfo');

// 删除缓存
cache.remove('userInfo');
```

## 类型转换 (converter.ts)

类型转换工具提供了一系列安全的类型转换方法。

### 主要功能

- `toNumber(value, defaultValue)`: 转换为数字
- `toString(value, defaultValue)`: 转换为字符串

### 使用示例

```javascript
// 将字符串转换为数字
const num = converter.toNumber('123', 0); // 返回 123

// 将数字转换为字符串
const str = converter.toString(123, ''); // 返回 '123'
```

## 环境检测 (env.ts)

环境检测工具用于判断当前运行环境。

### 主要功能

- `getEnv()`: 获取当前环境（development/production）
- `getPlatform()`: 获取当前平台（h5/mp-weixin等）
- `isH5()`: 判断是否为H5环境
- `isMiniProgram()`: 判断是否为小程序环境

### 使用示例

```javascript
// 判断是否为H5环境
if (env.isH5()) {
  // 执行H5特有的逻辑
}

// 判断是否为小程序环境
if (env.isMiniProgram()) {
  // 执行小程序特有的逻辑
}
```

## HTTP 请求 (http.ts)

HTTP 请求工具基于 uni.request 封装，提供了统一的请求接口。

### 主要功能

- `get(url, params)`: 发送 GET 请求
- `post(url, data)`: 发送 POST 请求
- `put(url, data)`: 发送 PUT 请求
- `del(url, params)`: 发送 DELETE 请求

### 使用示例

```javascript
// 发送 GET 请求
const users = await http.get('/api/users', { page: 1, size: 10 });

// 发送 POST 请求
const newUser = await http.post('/api/users', { name: '张三', email: 'zhangsan@example.com' });
```

## 权限管理 (permission.ts)

权限管理工具用于处理用户权限相关操作。

### 主要功能

- `getPermissions(array)`: 从权限树中提取权限关键字

### 使用示例

```javascript
// 从权限树中提取权限关键字列表
const permissions = getPermissions(userPermissionTree);
```

## 路由管理 (router.ts)

路由管理工具提供了页面跳转的统一接口。

### 主要功能

- `push(url, params)`: 跳转到新页面
- `redirect(url, params)`: 重定向到新页面
- `tab(url)`: 跳转到 tabBar 页面
- `back(delta)`: 返回上一页
- `reLaunch(url, params)`: 关闭所有页面并打开指定页面

### 使用示例

```javascript
// 跳转到用户详情页
router.push('/pages/user/detail', { id: 123 });

// 跳转到首页（tabBar页面）
router.tab('/pages/home/home');

// 关闭所有页面并跳转到登录页
router.reLaunch('/pages/auth/login');
```

## 时间处理 (time.ts)

时间处理工具提供了丰富的日期时间操作功能。

### 主要功能

- `format(date, pattern)`: 格式化日期
- `relativeTime(date)`: 获取相对时间（如"5分钟前"）
- `add(date, amount, unit)`: 增加时间
- `diff(date1, date2, unit)`: 计算时间差

### 使用示例

```javascript
// 格式化当前时间
const now = time.format(new Date(), 'yyyy-MM-dd HH:mm:ss');

// 获取相对时间
const relative = time.relativeTime(new Date('2023-01-01')); // "3个月前"

// 增加7天
const nextWeek = time.add(new Date(), 7, 'day');
```

## 提示信息 (toast.ts)

提示信息工具提供了统一的消息提示接口。

### 主要功能

- `showToast(title)`: 显示普通提示
- `showSuccess(title)`: 显示成功提示
- `showError(title)`: 显示错误提示

### 使用示例

```javascript
// 显示普通提示
toast.showToast('操作成功');

// 显示成功提示
toast.showSuccess('保存成功');

// 显示错误提示
toast.showError('网络错误');
```

## 类型检查 (type-checker.ts)

类型检查工具提供了准确的类型判断方法。

### 主要功能

- `isString(value)`: 判断是否为字符串
- `isNumber(value)`: 判断是否为数字
- `isObject(value)`: 判断是否为对象
- `isArray(value)`: 判断是否为数组
- `isEmpty(value)`: 判断是否为空

### 使用示例

```javascript
// 判断是否为字符串
if (typeChecker.isString(value)) {
  // 处理字符串逻辑
}

// 判断是否为空
if (typeChecker.isEmpty(data)) {
  // 处理空数据逻辑
}
```

## URL 处理 (url.ts)

URL 处理工具提供了 URL 相关的操作方法。

### 主要功能

- `buildUrlWithParams(url, params)`: 构建带参数的 URL
- `parseUrlSearch(url)`: 解析 URL 中的查询参数

### 使用示例

```javascript
// 构建带参数的 URL
const url = buildUrlWithParams('/api/users', { page: 1, size: 10 });
// 返回 '/api/users?page=1&size=10'

// 解析 URL 参数
const params = parseUrlSearch('/api/users?page=1&size=10');
// 返回 { page: '1', size: '10' }
```

## 实时通信 (goeasy.ts)

实时通信工具基于 GoEasy SDK 实现。

### 主要功能

- `initGoEasy()`: 初始化 GoEasy
- `connectGoEasy()`: 连接 GoEasy 服务器
- `subscribeGoEasy()`: 订阅消息频道

### 使用示例

```javascript
// 初始化并连接 GoEasy
initGoEasy();
connectGoEasy();
subscribeGoEasy();
```

## 总结

以上就是项目中常用的工具函数介绍。这些工具函数都是为了提高开发效率和代码质量而设计的，建议在开发过程中充分利用它们。如果有任何疑问，可以查看对应文件的源码获取更详细的信息。
