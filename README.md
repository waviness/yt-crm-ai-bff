# Uni-App + Vue3 + TypeScript + UViewPlus 模板

基于 Uni-App、Vue3、TypeScript、Vite 和 UViewPlus 组件库构建的跨端应用模板，支持 H5 和微信小程序，兼容 Node 环境和 HBuilderX 开发。

## 项目特点

- **跨端兼容**：同时支持 H5 和微信小程序
- **开发环境兼容**：支持 Node 命令行开发和 HBuilderX 开发
- **组件库**：集成 UViewPlus 组件库，提供丰富的 UI 组件
- **TypeScript**：全面的类型支持，提升代码质量和开发效率
- **工程化**：集成 ESLint、Prettier、Husky 等工具，规范开发流程
- **状态管理**：使用 Pinia 进行状态管理
- **API 封装**：统一的请求封装，处理多端差异

## 🚀 快速开始

### 环境准备

在开始之前，请确保您的开发环境中已安装以下工具：

- [Node.js](https://nodejs.org/) (版本 18.x 或更高)
- [pnpm](https://pnpm.io/)
- 微信开发者工具（开发微信小程序时需要）
- 代码编辑器，推荐使用 [VS Code](https://code.visualstudio.com/)
- HBuilderX（可选，如需使用 HBuilderX 开发）

**建议将 `Node.js` 版本升级至最新 LTS 版本。**

**提示**
采用命令行方式构建的项目，可直接在 HBuilderX 中打开，无需额外安装 `Node.js` 运行环境。
_但如果需在其他编辑器中使用，建议安装 `Node.js` 运行环境。_

### 换行符设置

为避免跨平台换行符冲突，请执行以下命令：

```
# Windows/Linux/macOS 均执行
git config --global core.autocrlf input

```

### 安装依赖

```
# 克隆项目代码
git clone <项目地址>

# 进入项目目录
cd yt-crm-uniapp

# 安装项目依赖
pnpm install
```

### 启动开发服务器

```
# 启动 H5 开发服务器
pnpm run dev:h5

# 或启动微信小程序开发服务器
pnpm run dev:mp-weixin
```

启动成功后，您可以在浏览器中访问 `http://localhost:3000` 查看 H5 版本的应用。
微信小程序，打开微信开发者工具，导入项目根目录下的 `dist/dev/mp-weixin` 文件夹即可预览。

## 📁 项目结构

```
src/
├── api/                  # 接口定义
├── components/           # 组件库
│   ├── base/             # 基础组件
│   └── biz/              # 业务组件
├── composables/          # 可组合函数
├── config/               # 配置文件
├── pages/                # 页面组件
├── scss/                 # 样式文件
├── static/               # 静态资源
├── store/                # 状态管理
├── subpackages/          # 分包页面
├── utils/                # 工具函数
├── App.vue               # 根组件
├── main.ts               # 入口文件
└── pages.json            # 页面路由配置
```

## 🛠 技术栈

- [Vue 3](https://v3.vuejs.org/) - 渐进式 JavaScript 框架
- [Uniapp](https://uniapp.dcloud.io/) - 跨平台开发框架
- [uview-plus](https://uview-plus.jiangruyi.com/) - UI 组件库
- [Pinia](https://pinia.vuejs.org/) - 状态管理
- [TypeScript](https://www.typescriptlang.org/) - JavaScript 超集语言
- [Sass](https://sass-lang.com/) - CSS 预处理器
- [Unocss](https://www.unocss.cn/) - 原子CSS引擎

## 📚 入门文档

为了帮助开发者更好地理解和使用项目，我们准备了全面的文档：

### 基础指南

- [项目介绍指南](./docs/00_project_guide.md) - 项目整体架构和设计理念
- [Utils 工具函数详解](./docs/01_utils_guide.md) - 详细介绍项目中各种工具函数的使用方法
- [API 接口指南](./docs/02_api_guide.md) - API 调用和数据处理规范
- [组件使用指南](./docs/03_components_guide.md) - 项目组件的使用方法和最佳实践

### 进阶指南

- [状态管理指南](./docs/04_store_guide.md) - Pinia 状态管理的使用和规范
- [路由管理指南](./docs/05_router_guide.md) - 路由配置和导航管理

### 🆕 架构优化

- [代码结构优化指南](./docs/06_code_optimization_guide.md) - **最新发布** 📋 全面的代码结构重构和分包管理优化

## 🌐 多平台支持

项目支持构建为多个平台的应用：

```
# 开发环境
pnpm run dev:h5              # H5
pnpm run dev:mp-weixin       # 微信小程序
pnpm run dev:mp-alipay       # 支付宝小程序
pnpm run dev:mp-baidu        # 百度小程序
pnpm run dev:mp-qq           # QQ小程序
# ...及其他平台

# 生产构建
pnpm run build:h5            # H5
pnpm run build:mp-weixin     # 微信小程序
pnpm run build:mp-alipay     # 支付宝小程序
pnpm run build:mp-baidu      # 百度小程序
pnpm run build:mp-qq         # QQ小程序
# ...及其他平台
```

构建产物会生成在 `dist/build/mp-weixin` 目录下，可直接在微信开发者工具中上传。

## 在 HBuilderX 中使用

1. 打开 HBuilderX
2. 点击 "文件" -> "导入" -> "从本地目录导入"，选择项目根目录
3. 等待项目加载完成
4. 运行：
   - H5：点击菜单栏 "运行" -> "运行到浏览器" -> 选择浏览器
   - 微信小程序：点击菜单栏 "运行" -> "运行到小程序模拟器" -> "微信开发者工具"

## 📖 开发指南

### 新增页面

1. 在 [pages](./src/pages/) 目录下创建新的页面文件
2. 在 [pages.json](./src/pages.json) 中配置页面路由

### 新增组件

1. 在 [components](./src/components/) 目录下创建组件
   - 基础组件放在 [base](./src/components/base/) 目录下
   - 业务组件放在 [biz](./src/components/biz/) 目录下
2. 在页面中引入并使用组件

### 状态管理

项目使用 Pinia 进行状态管理，主要的 store 包括：

- [auth.ts](./src/store/auth.ts) - 认证相关状态
- [user.ts](./src/store/user.ts) - 用户信息状态
- [app.ts](./src/store/app.ts) - 应用级状态

## 🎨 代码规范

- 代码风格：遵循 ESLint 和 Prettier 配置
- 提交规范：使用 Husky 进行提交前校验，确保代码质量

```
# 手动检查代码规范
pnpm run type-check
```

## UViewPlus 组件库

本项目集成了 UViewPlus 组件库，可直接在页面中使用。如需自定义主题，可修改 `src/uni.scss` 文件。

详细使用文档请参考 [UViewPlus 官方文档](https://uview-plus.jiangruyi.com//)。

## Unocss 原子CSS引擎

本项目已集成 Unocss 原子 CSS 引擎，支持通过简洁的原子类快速构建界面样式，无需编写冗余 CSS。
内置 unocss-preset-weapp 预设，完美适配小程序与 H5 多端样式，自动处理 rpx/px 单位转换。支持灵活的自定义配置，可通过项目根目录的 `uno.config.ts` 文件扩展规则、快捷方式或颜色体系。搭配 unocss vscode 插件，智能提示.

详细语法与预设规则参考 [unocss-preset-weapp 官方文档](https://github.com/MellowCo/unocss-preset-weapp?tab=readme-ov-file)。

## 常见问题

1. **安装依赖时报错**：
   - 检查 Node.js 版本是否符合要求
   - 尝试删除 `node_modules` 和 `package-lock.json` 或 `pnpm-lock.yaml` 后重新安装

2. **运行微信小程序时白屏**：
   - 检查微信开发者工具是否已登录
   - 检查项目是否正确导入
   - 尝试清除微信开发者工具缓存

3. **H5 端样式异常**：
   - 检查是否正确导入 UViewPlus 样式
   - 检查自定义样式是否存在冲突
