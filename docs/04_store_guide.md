# 状态管理 (Pinia Store) 使用指南

本文档详细介绍了项目中使用的 Pinia Store 及使用方法。

## 目录

1. [概述](#概述)
2. [应用状态管理 (app.ts)](#应用状态管理-appts)
3. [认证状态管理 (auth.ts)](#认证状态管理-authts)
4. [底部导航栏状态管理 (tabbar.ts)](#底部导航栏状态管理-tabbarts)
5. [用户状态管理 (user.ts)](#用户状态管理-userts)
6. [缓存插件 (cache.ts)](#缓存插件-cachets)

## 概述

项目使用 Pinia 作为状态管理方案，通过模块化的方式管理应用状态。每个 store 模块负责管理特定领域的状态。

## 应用状态管理 (app.ts)

应用状态管理模块负责管理应用级别的状态，如主题、语言等。

### 使用方法

```typescript
import { useAppStore } from '@/store/app';

const appStore = useAppStore();
```

### 状态说明

- `theme`: 应用主题配置
- `locale`: 应用语言设置

### 方法说明

- `setTheme(theme)`: 设置应用主题
- `setLocale(locale)`: 设置应用语言

## 认证状态管理 (auth.ts)

认证状态管理模块负责管理用户的登录状态、权限等认证相关信息。

### 使用方法

```typescript
import { useAuthStore } from '@/store/auth';

const authStore = useAuthStore();
```

### 状态说明

- `isSignedIn`: 用户是否已登录
- `signInAgreement`: 登录协议状态
- `autoLoading`: 自动登录加载状态

### 方法说明

- `signInWithMiniProgram(payload)`: 小程序登录
- `signInWithCredentials(formData)`: 账号密码登录
- `agreeAgreement()`: 同意登录协议
- `autoSignIn()`: 自动登录
- `signOut()`: 退出登录

## 底部导航栏状态管理 (tabbar.ts)

底部导航栏状态管理模块负责管理底部导航栏的状态。

### 使用方法

```typescript
import { useTabbarStore } from '@/store/tabbar';

const tabbarStore = useTabbarStore();
```

### 状态说明

- `activeIndex`: 当前激活的导航项索引

### 方法说明

- `setActiveIndex(index)`: 设置激活的导航项索引

## 用户状态管理 (user.ts)

用户状态管理模块负责管理用户个人信息、权限等。

### 使用方法

```typescript
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
```

### 状态说明

- `info`: 用户信息
- `permissions`: 用户权限列表

### 方法说明

- `setUserInfo(userInfo)`: 设置用户信息
- `setPermissions(permissions)`: 设置用户权限

## 缓存插件 (cache.ts)

缓存插件用于将 store 状态持久化到本地缓存中。

### 使用方法

插件会在 store 初始化时自动应用，无需手动调用。

### 功能说明

- 自动将指定的 store 状态保存到本地缓存
- 应用启动时从本地缓存恢复状态
- 支持设置缓存过期时间
