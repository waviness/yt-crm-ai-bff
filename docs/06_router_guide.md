# 路由配置和导航管理指南

本文档介绍项目中路由的配置方式、导航工具类的使用方法以及路由管理的最佳实践。

## 📋 目录

1. [路由配置](#路由配置)
2. [路由工具类](#路由工具类)
3. [路由映射](#路由映射)
4. [路径重写](#路径重写)
5. [最佳实践](#最佳实践)
6. [常见问题](#常见问题)

---

## 路由配置

### pages.json 配置

项目使用 `pages.json` 进行页面路由配置，支持主包和分包结构。

#### 主包页面

主包页面位于 `pages/` 目录下，包括：

- 登录页面：`pages/auth/login`
- 首页：`pages/home/home`
- 数据中心：`pages/dashboard/dashboard`
- 用户中心：`pages/user/user`

#### 分包页面

分包页面位于 `subpackages/` 目录下，按业务模块划分：

- **业务管理** (`subpackages/business/`)
  - 回款管理、询证函、最终结账等

- **订单管理** (`subpackages/order/`)
  - 急救订单、订单管理、冲差管理等

- **合规管理** (`subpackages/compliance/`)
  - 证照延期、订阅提醒等

- **项目管理** (`subpackages/project/`)
  - 准入管理、深分进度、排名等

- **客户管理** (`subpackages/customer/`)
  - 客户单位、客户跟进等

- **日常管理** (`subpackages/daily/`)
  - 任务督办、周报等

- **VBP管理** (`subpackages/vbp/`)
  - VBP政策、VBP项目等

### TabBar 配置

TabBar 页面需要在 `pages.json` 中配置 `tabBar`，当前项目的主要 TabBar 页面包括：

- 首页 (`pages/home/home`)
- 数据中心 (`pages/dashboard/dashboard`)
- 用户中心 (`pages/user/user`)

---

## 路由工具类

项目提供了统一的路由管理工具类 `src/utils/router.ts`，封装了 uni-app 的路由 API。

### 导入方式

```typescript
import router from '@/utils/router';
```

### API 方法

#### 1. `router.push()` - 页面跳转

跳转到应用内的某个页面（保留当前页面，可以返回）。

```typescript
// 基本用法
router.push('/pages/home/home');

// 带参数跳转
router.push('/subpackages/project/detail', {
  projectId: '123',
  projectName: '测试项目',
});

// 使用 RouteMap
import { RouteMap } from '@/config/route';
router.push(RouteMap.projectDetail, {
  projectId: '123',
});
```

**特点**：

- 保留当前页面在页面栈中
- 可以通过返回按钮返回
- 最多支持 10 层页面栈

#### 2. `router.redirect()` - 页面重定向

关闭当前页面，跳转到应用内的某个页面。

```typescript
// 基本用法
router.redirect('/pages/home/home');

// 带参数重定向
router.redirect(RouteMap.projectDetail, {
  projectId: '123',
});
```

**特点**：

- 关闭当前页面
- 无法返回上一页
- 适用于登录后跳转等场景

#### 3. `router.tab()` - TabBar 页面跳转

跳转到 TabBar 页面。

```typescript
// 跳转到首页
router.tab('/pages/home/home');

// 跳转到数据中心
router.tab(RouteMap.dashboard);
```

**特点**：

- 只能跳转到 TabBar 页面
- 会关闭所有非 TabBar 页面
- 无法传递参数（TabBar 页面不支持参数）

#### 4. `router.reLaunch()` - 重启应用

关闭所有页面，打开到应用内的某个页面。

```typescript
// 重启到登录页
router.reLaunch(RouteMap.login);

// 重启到首页
router.reLaunch('/pages/home/home', {
  refresh: true,
});
```

**特点**：

- 清空所有页面栈
- 适用于退出登录、重新初始化等场景

#### 5. `router.back()` - 返回上一页

返回上一页面或多级页面。

```typescript
// 返回上一页
router.back();

// 返回上两页
router.back(2);
```

**特点**：

- 默认返回 1 页
- 可以指定返回的页面数
- 如果页面栈为空，会失败

#### 6. `router.getCurrentRoute()` - 获取当前路由

获取当前页面的路由信息。

```typescript
const route = router.getCurrentRoute();
if (route) {
  console.log(route.route); // 当前页面路径
  console.log(route.options); // 页面参数对象
}
```

#### 7. `router.getCurrentPages()` - 获取页面栈

获取当前页面栈数组。

```typescript
const pages = router.getCurrentPages();
console.log(pages.length); // 页面栈深度
```

---

## 路由映射

### RouteMap 配置

项目使用 `src/config/route.ts` 统一管理路由路径，避免硬编码。

```typescript
import { RouteMap } from '@/config/route';

// 使用路由映射
router.push(RouteMap.projectDetail, { projectId: '123' });
```

### 路由命名规范

路由名称采用驼峰命名，遵循以下规范：

- **页面路由**: 使用模块名 + 页面名
  - `projectDetail` - 项目详情
  - `orderManage` - 订单管理
  - `customerUnit` - 客户单位

- **详情页路由**: 页面名 + `Detail`
  - `projectDetail` - 项目详情
  - `orderManageDetail` - 订单管理详情
  - `customerUnitDetail` - 客户单位详情

- **列表页路由**: 页面名 + `List`
  - `orderManageList` - 订单管理列表
  - `vbpProjectList` - VBP项目列表

### 添加新路由

在 `src/config/route.ts` 中添加新路由：

```typescript
export const RouteMap = {
  // ... 现有路由
  newPage: '/subpackages/module/new-page',
  newPageDetail: '/subpackages/module/new-page-detail',
} as const;
```

**注意事项**：

- 使用 `as const` 确保类型安全
- 路径必须以 `/` 开头
- 分包页面路径以 `/subpackages/` 开头

---

## 路径重写

### H5 路径重写

项目在 H5 环境下支持路径重写，用于兼容外部链接。

#### 配置位置

`src/App.vue` 中的 `PATH_REWRITE_MAP`：

```typescript
const PATH_REWRITE_MAP: Record<string, string> = {
  '/projectManage': RouteMap.projectEntry,
  '/projectManageRank': RouteMap.projectRank,
  '/projectManageExRank': RouteMap.projectExRank,
  '/message/licenseDetail': RouteMap.licenseMessage,
  '/message/taskDetail': RouteMap.taskMessage,
};
```

#### 工作原理

1. 检测 H5 环境下的 URL 路径
2. 匹配 `PATH_REWRITE_MAP` 中的旧路径
3. 自动重定向到新路径

#### 添加路径重写

```typescript
const PATH_REWRITE_MAP: Record<string, string> = {
  // ... 现有映射
  '/oldPath': RouteMap.newPath,
};
```

---

## 最佳实践

### 1. 使用 RouteMap 而非硬编码

❌ **不推荐**：

```typescript
router.push('/subpackages/project/detail');
```

✅ **推荐**：

```typescript
import { RouteMap } from '@/config/route';
router.push(RouteMap.projectDetail);
```

### 2. 参数传递规范

使用对象传递参数，工具类会自动处理 URL 编码：

```typescript
// ✅ 推荐：使用对象传递参数
router.push(RouteMap.projectDetail, {
  projectId: '123',
  projectName: '测试项目',
});

// ❌ 不推荐：手动拼接 URL
router.push(`${RouteMap.projectDetail}?projectId=123&projectName=测试项目`);
```

### 3. 页面参数接收

在目标页面的 `onLoad` 生命周期中接收参数：

```vue
<script setup lang="ts">
onLoad((options: any) => {
  const projectId = options.projectId;
  const projectName = options.projectName;
  // 处理参数...
});
</script>
```

### 4. 路由跳转错误处理

使用 Promise 的错误处理：

```typescript
router
  .push(RouteMap.projectDetail, { projectId: '123' })
  .then(() => {
    console.log('跳转成功');
  })
  .catch(error => {
    console.error('跳转失败', error);
    showToast('页面跳转失败');
  });
```

### 5. TabBar 页面跳转

TabBar 页面必须使用 `router.tab()`：

```typescript
// ✅ 正确
router.tab(RouteMap.home);

// ❌ 错误：TabBar 页面不能使用 push
router.push(RouteMap.home); // 会失败
```

### 6. 登录后跳转

登录成功后使用 `router.reLaunch()` 或 `router.redirect()`：

```typescript
// 登录成功后重启应用
router.reLaunch(RouteMap.home);

// 或重定向到首页
router.redirect(RouteMap.home);
```

---

## 常见问题

### Q1: 如何判断当前页面栈深度？

```typescript
const pages = router.getCurrentPages();
const depth = pages.length;
if (depth >= 10) {
  console.warn('页面栈已满，无法继续跳转');
}
```

### Q2: 如何获取页面参数？

```typescript
// 方法1：在 onLoad 中接收
onLoad((options: any) => {
  const id = options.id;
});

// 方法2：使用 getCurrentRoute
const route = router.getCurrentRoute();
const id = route?.options.id;
```

### Q3: TabBar 页面如何传递参数？

TabBar 页面不支持通过 URL 传递参数，可以使用以下方式：

1. **使用全局状态管理**（Pinia）
2. **使用本地存储**（localStorage）
3. **使用事件总线**

### Q4: 如何实现页面返回并刷新？

```typescript
// 在目标页面
onShow(() => {
  // 从其他页面返回时刷新数据
  if (needRefresh) {
    loadData();
    needRefresh = false;
  }
});
```

### Q5: 分包页面跳转有限制吗？

分包页面跳转需要注意：

- 主包可以跳转到分包
- 分包可以跳转到主包
- 分包之间可以互相跳转
- 但需要确保分包已加载

### Q6: 如何处理路由跳转失败？

```typescript
router.push(RouteMap.projectDetail).catch(error => {
  // 处理错误
  if (error.errMsg?.includes('not found')) {
    showToast('页面不存在');
  } else {
    showToast('跳转失败，请重试');
  }
});
```

---

## 相关文件

- **路由配置**: `src/config/route.ts`
- **路由工具**: `src/utils/router.ts`
- **URL 工具**: `src/utils/url.ts`
- **页面配置**: `src/pages.json`
- **路径重写**: `src/App.vue`

---

## 参考链接

- [uni-app 路由文档](https://uniapp.dcloud.net.cn/api/router.html)
- [uni-app 页面路由](https://uniapp.dcloud.net.cn/tutorial/page.html)

---

**最后更新**: 2025-12-5  
**维护者**: 开发团队  
**版本**: 1.0.0
