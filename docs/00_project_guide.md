# 项目开发指南

本文档旨在为新加入的开发者提供关于 yt-crm-uniapp 项目的全面介绍，包括项目结构、技术栈、开发规范等。

## 目录

1. [项目概述](#项目概述)
2. [技术栈](#技术栈)
3. [项目结构](#项目结构)
4. [开发环境搭建](#开发环境搭建)
5. [核心功能模块](#核心功能模块)
6. [开发规范与流程](#开发规范与流程)
7. [构建与部署](#构建与部署)
8. [常见问题解决方案](#常见问题解决方案)

## 项目概述

yt-crm-uniapp 是一个基于 Uniapp 的多平台应用，支持微信小程序平台和 H5，简化开发和维护成本。

### 核心功能

- 用户认证: 登录、管理员登录
- 仪表盘: 提供用户概览信息
- 首页: 展示核心功能和信息
- 用户管理: 用户信息管理
- 消息通知: 实时消息推送
- 权限控制: 基于角色的访问控制

### 关键特性

- 多平台支持: 支持微信、支付宝、百度、京东、快手、飞书、QQ、头条、小红书等多个小程序平台
- 实时通信: 使用 GoEasy 实现实时消息推送
- 国际化支持: 使用 vue-i18n 支持多语言

## 技术栈

- 前端框架: Vue 3.4.21 + Uniapp 3.0.0
- UI 库: uview-plus 3.4.86
- 状态管理: Pinia 2.3.1
- 实时通信: GoEasy 2.13.23
- 国际化: vue-i18n 9.1.9
- 构建工具: Vite 5.4.19
- 代码规范: ESLint 9.32.0, Prettier 3.6.2
- 语言: TypeScript 4.9.4
- 样式: SCSS

## 项目结构

```
.
├── config                      # 配置文件目录
│   └── iconfont.config.js     # iconfont 配置
├── docs                       # 文档目录
│   ├── 00_project_guide.md    # 项目开发指南（本文档）
│   └── 01_utils_guide.md      # 工具函数使用指南
├── src                        # 源代码目录
│   ├── api                    # 接口定义
│   ├── components             # 组件
│   │   ├── base               # 基础组件
│   │   └── biz                # 业务组件
│   ├── composables            # 可组合函数
│   ├── config                 # 配置文件
│   ├── pages                  # 页面组件
│   ├── scss                   # 样式文件
│   ├── static                 # 静态资源
│   ├── store                  # 状态管理
│   ├── subpackages            # 子包页面
│   ├── uni_modules            # uni-app 模块
│   └── utils                  # 工具函数
├── PROBLEMLOG.md              # 问题日志
├── README.md                  # 项目说明
├── package.json               # 项目依赖和脚本
└── vite.config.ts             # Vite 配置
```

### 核心模块详解

#### src/api

接口定义模块，包含与后端服务通信的 API 类。

- [auth.ts](../src/api/auth.ts): 认证服务类，提供多种登录方式和协议同意功能
- [message.ts](../src/api/message.ts): 消息服务类，处理消息相关的 API 请求

#### src/components

UI 组件模块，分为基础组件和业务组件。

##### 基础组件 (base)

- [fix-btn.vue](../src/components/base/fix-btn.vue): 固定按钮组件
- [fly-btn.vue](../src/components/base/fly-btn.vue): 悬浮按钮组件
- [icon.vue](../src/components/base/icon.vue): 图标组件
- [page.vue](../src/components/base/page.vue): 页面基础组件
- [tabbar.vue](../src/components/base/tabbar.vue): 底部导航栏组件
- [watermark.vue](../src/components/base/watermark.vue): 水印组件

##### 业务组件 (biz)

- [menu-card.vue](../src/components/biz/menu-card.vue): 菜单卡片组件
- [permission.vue](../src/components/biz/permission.vue): 权限控制组件
- [user-card.vue](../src/components/biz/user-card.vue): 用户卡片组件

#### src/composables

可组合函数模块，提供可复用的逻辑。

- [use-hide-home-button.ts](../src/composables/use-hide-home-button.ts): 隐藏主页按钮的可组合函数
- [use-init-tab-page-settings.ts](../src/composables/use-init-tab-page-settings.ts): 初始化标签页设置的可组合函数
- [use-update-active-index.ts](../src/composables/use-update-active-index.ts): 更新活动索引的可组合函数

#### src/config

配置文件模块，包含项目的各种配置。

- [agreement.ts](../src/config/agreement.ts): 用户协议相关配置
- [constants.ts](../src/config/constants.ts): 常量配置
- [route.ts](../src/config/route.ts): 路由映射配置
- [tabbar.ts](../src/config/tabbar.ts): 底部导航栏配置

#### src/pages

页面组件模块，包含应用的主要页面。

- auth/: 认证相关页面
  - [admin-login.vue](../src/pages/auth/admin-login.vue): 管理员登录页面
  - [login.vue](../src/pages/auth/login.vue): 用户登录页面
- dashboard/: 仪表盘页面
  - [index.vue](../src/pages/dashboard/index.vue): 仪表盘首页
- home/: 首页
  - [home.vue](../src/pages/home/home.vue): 主页
- user/: 用户中心页面
  - [user.vue](../src/pages/user/user.vue): 用户中心页面

#### src/store

状态管理模块，使用 Pinia 进行状态管理。

- [app.ts](../src/store/app.ts): 应用级状态管理
- [auth.ts](../src/store/auth.ts): 认证状态管理
- [tabbar.ts](../src/store/tabbar.ts): 底部导航栏状态管理
- [user.ts](../src/store/user.ts): 用户状态管理
- plugins/: 插件
  - [cache.ts](../src/store/plugins/cache.ts): 缓存插件

#### src/utils

工具函数模块，提供各种通用工具函数。

- [cache.ts](../src/utils/cache.ts): 缓存管理工具
- [converter.ts](../src/utils/converter.ts): 类型转换工具
- [env.ts](../src/utils/env.ts): 环境检测工具
- [fontLoader.ts](../src/utils/fontLoader.ts): 字体加载工具
- [goeasy.ts](../src/utils/goeasy.ts): GoEasy 实时通信工具
- [http.ts](../src/utils/http.ts): HTTP 请求工具
- [permission.ts](../src/utils/permission.ts): 权限管理工具
- [router.ts](../src/utils/router.ts): 路由管理工具
- [time.ts](../src/utils/time.ts): 时间处理工具
- [toast.ts](../src/utils/toast.ts): 提示信息工具
- [type-checker.ts](../src/utils/type-checker.ts): 类型检查工具
- [url.ts](../src/utils/url.ts): URL 处理工具

#### src/subpackages

子包页面模块，包含分包加载的页面。

- home/: 首页相关子页面
  - [message.vue](../src/subpackages/home/message.vue): 消息中心页面
  - [search.vue](../src/subpackages/home/search.vue): 搜索页面

## 开发环境搭建

### 必需工具

1. Node.js 18.x 或更高版本
2. pnpm 包管理器
3. TypeScript 4.9.4
4. Vue 开发工具

### 可选工具

1. VS Code + Volar 插件
2. Git
3. Husky + lint-staged 用于代码提交前检查

### 安装依赖

```bash
pnpm install
```

## 核心功能模块

### 用户认证模块

用户认证模块负责处理用户登录、权限验证等功能。

### 消息推送模块

消息推送模块基于 GoEasy 实现，负责处理实时消息推送。

### 权限控制模块

权限控制模块基于角色的访问控制（RBAC），确保用户只能访问其权限范围内的功能。

## 开发规范与流程

### 代码规范

项目使用 ESLint 和 Prettier 作为代码规范工具，确保代码风格的一致性。

### Git 工作流程

1. Fork 项目仓库
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request

### 命名规范

1. 文件命名: 使用 kebab-case（短横线分隔）
2. 组件命名: 使用 kebab-case（短横线分隔）
3. 变量命名: 使用 camelCase（小驼峰）
4. 常量命名: 使用 UPPER_SNAKE_CASE（大写蛇形）

## 构建与部署

### 开发环境

```bash
# H5 开发环境
pnpm run dev:h5

# 微信小程序开发环境
pnpm run dev:mp-weixin

# 其他平台开发环境
pnpm run dev:mp-alipay
pnpm run dev:mp-baidu
# ... 其他平台
```

### 生产环境构建

```bash
# H5 生产环境构建
pnpm run build:h5

# 微信小程序生产环境构建
pnpm run build:mp-weixin

# 其他平台生产环境构建
pnpm run build:mp-alipay
pnpm run build:mp-baidu
# ... 其他平台
```

### 部署

- H5: 构建后部署到 Web 服务器
- 小程序: 上传到对应平台进行审核和发布

## 常见问题解决方案

### TypeScript 类型报错排查步骤

当遇到 TypeScript 类型报错时，请按以下步骤进行排查：

#### 1. 检查 auto-imports.d.ts 文件

**问题描述**: 出现 `Cannot find name 'xxx'` 或 `Property 'xxx' does not exist` 等类型错误

**排查步骤**:

1. **确认文件存在**: 检查 `src/auto-imports.d.ts` 文件是否存在

   ```bash
   ls src/auto-imports.d.ts
   ```

2. **重新生成类型文件**: 如果文件不存在或内容过时，执行以下命令重新生成

   ```bash
   npm run generate:types
   # 或者
   pnpm run generate:types
   ```

3. **检查 IDE 类型服务**: 重启 TypeScript 语言服务
   - VS Code: `Ctrl+Shift+P` → `TypeScript: Restart TS Server`
   - 其他 IDE: 重启 IDE 或重新加载项目

#### 2. 检查组件导入问题

**问题描述**: 出现 `Cannot find module` 或组件未定义错误

**排查步骤**:

1. **检查组件路径**: 确认组件文件路径是否正确
2. **检查组件注册**: 确认组件是否在 `main.ts` 中正确注册
3. **检查组件名称**: 确认组件名称与文件名匹配

#### 3. 检查 SCSS 变量问题

**问题描述**: 出现 `Undefined variable` 错误

**排查步骤**:

1. **检查变量定义**: 确认变量在 `src/uni.scss` 中已定义
2. **检查导入顺序**: 确认 `uview-plus` 变量在使用前已定义
3. **重新启动开发服务器**: 清除缓存并重新启动

   ```bash
   # 清除缓存
   rm -rf node_modules/.vite
   rm -rf dist

   # 重新安装依赖
   pnpm install

   # 重新启动开发服务器
   pnpm run dev:mp-weixin
   ```

#### 4. 检查环境配置问题

**问题描述**: 在不同平台（H5、微信小程序）出现不同错误

**排查步骤**:

1. **检查平台特定配置**: 确认 `vite.config.ts` 中的平台配置正确
2. **检查环境变量**: 确认环境变量配置正确
3. **检查依赖版本**: 确认依赖版本兼容性

#### 5. 常见错误类型及解决方案

| 错误类型                        | 可能原因             | 解决方案                       |
| ------------------------------- | -------------------- | ------------------------------ |
| `Cannot find name 'xxx'`        | auto-imports 未生成  | 运行 `npm run generate:types`  |
| `Undefined variable '$xxx'`     | SCSS 变量未定义      | 检查 `uni.scss` 变量定义       |
| `Cannot find module`            | 路径错误或文件不存在 | 检查文件路径和导入语句         |
| `Property 'xxx' does not exist` | 类型定义缺失         | 检查类型定义或重新生成类型文件 |

#### 6. 预防措施

1. **定期更新类型文件**: 在添加新的 composables 或 API 后，及时运行 `npm run generate:types`
2. **版本控制**: `auto-imports.d.ts` 已加入 `.gitignore`，团队成员拉取代码后需要重新生成
3. **代码规范**: 遵循项目的命名规范和导入规范
4. **依赖管理**: 定期更新依赖版本，注意兼容性

### 其他问题

请参考 [问题日志](../PROBLEMLOG.md) 获取更多常见问题及其解决方案。
