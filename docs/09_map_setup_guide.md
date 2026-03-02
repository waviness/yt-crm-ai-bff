# 地图功能配置指南

## 概述

本项目使用高德地图实现打卡定位功能，支持 H5 端和小程序端。

## 文件说明

### 新增文件

1. **`src/composables/use-amap-location.ts`**
   - 核心 composable，封装所有地图相关功能
   - 支持 H5 端（高德 Web API）和小程序端（高德小程序 SDK）

2. **`src/utils/amap-wx.js`**（需要手动下载）
   - 高德地图微信小程序 SDK 文件
   - 需要从高德开放平台下载

### 修改文件

1. **`src/manifest.json`**
   - 添加定位权限说明

2. **`.env` 或 `.env.local`**（需要手动创建）
   - 配置高德地图 Key

## 配置步骤

### 1. 下载高德地图小程序 SDK

#### 1.1 登录高德开放平台

- 网址：https://lbs.amap.com
- 使用高德账号登录

#### 1.2 下载 SDK 文件

1. 进入：控制台 → 开发支持 → 下载中心
2. 选择：**微信小程序 SDK**
3. 下载压缩包（如：`AMapWX_SDK_V1.3.0.zip`）

#### 1.3 解压并放置文件

1. 解压下载的压缩包
2. 找到 `amap-wx.js` 文件（这是主要的SDK文件）
3. **忽略 `_MACOSX` 文件夹**（这是macOS系统自动生成的元数据文件夹，可以删除）
4. 将 `amap-wx.js` 文件复制到项目目录：`src/utils/amap-wx.js`

### 2. 环境变量配置

创建 `.env` 或 `.env.local` 文件（项目根目录），添加以下配置：

```env
# 高德地图 H5端 Key（Web端 JS API）
VITE_AMAP_KEY=your_h5_amap_key_here

# 高德地图 小程序端 Key（小程序 SDK）
VITE_AMAP_MP_KEY=your_mp_amap_key_here
```

**注意**：请将 `your_h5_amap_key_here` 和 `your_mp_amap_key_here` 替换为实际的高德地图 Key。

### 3. 高德开放平台配置

#### 3.1 创建 H5 端应用

1. 进入：控制台 → 应用管理 → 我的应用 → 创建新应用
2. 应用名称：如 "CRM系统H5端"
3. 应用类型：**Web端（JS API）**
4. 服务平台：**Web端（JS API）**
5. 获取 Key，复制到 `.env` 的 `VITE_AMAP_KEY`

#### 3.2 创建小程序端应用

1. 创建新应用或使用现有应用
2. 应用名称：如 "CRM系统小程序端"
3. 应用类型：**小程序**
4. 服务平台：**微信小程序**
5. 填写小程序 AppID：`wxcde1194690c367db`（从 manifest.json 获取）
6. 获取 Key，复制到 `.env` 的 `VITE_AMAP_MP_KEY`

#### 3.3 配置 H5 端安全域名

1. 在 H5 端应用设置中
2. 添加安全域名：你的 H5 域名（如：`https://yourdomain.com`）
3. 注意：需要包含协议（https://）

### 4. 微信小程序后台配置

#### 4.1 登录微信小程序管理后台

- 网址：https://mp.weixin.qq.com
- 使用小程序账号登录

#### 4.2 开启地理位置接口

1. 进入：设置 → 接口设置 → 地理位置接口
2. 开启 "地理位置接口"

#### 4.3 配置服务器域名

1. 进入：设置 → 开发管理 → 开发设置 → 服务器域名
2. 在 **request合法域名** 中添加：
   - `https://restapi.amap.com`
   - `https://webapi.amap.com`

#### 4.4 检查后端接口域名（可选）

1. 确认后端接口域名已配置

## 功能说明

### H5 端功能

- ✅ 动态加载高德地图 JS SDK（按需加载，不污染全局）
- ✅ **智能定位策略**（带降级机制）：
  - 微信环境：优先使用微信 JS-SDK（更精确），失败自动降级到 `uni.getLocation`
  - 普通浏览器：直接使用 `uni.getLocation`
- ✅ POI 搜索（附近位置搜索）
- ✅ 地图标记显示
- ✅ 信息窗口展示

**优势**：

- 微信环境优先使用 JS-SDK，定位更精确
- 自动降级机制，确保功能可用性
- 普通浏览器直接使用原生定位，无需额外配置

### 小程序端功能

- ✅ 使用高德地图小程序 SDK（本地引入）
- ✅ 使用 uni.getLocation 获取定位
- ✅ POI 搜索（附近位置搜索）
- ✅ 使用 uni-app 原生 map 组件

## 使用方式

在组件中使用：

```vue
<script setup lang="ts">
import { useAmapLocation } from '@/composables/use-amap-location';

const {
  locationList,
  nowChooseId,
  nowChooseObj,
  addressValue,
  wxRegister,
  onSearch,
  nowChooseClick,
} = useAmapLocation();

// 获取定位
await wxRegister('click');

// 搜索附近位置
onSearch();
</script>
```

## 注意事项

1. **SDK 文件位置**
   - 必须将 `amap-wx.js` 文件放在 `src/utils/` 目录下
   - 文件名必须为 `amap-wx.js`

2. **环境变量安全**
   - 不要将 `.env` 文件提交到 Git
   - 使用 `.env.example` 作为模板（已创建）

3. **Key 管理**
   - H5 端和小程序端需要不同的 Key
   - 确保 Key 配置正确，否则功能无法使用

4. **权限说明**
   - manifest.json 中已配置定位权限说明
   - 首次使用需要用户授权

5. **测试顺序**
   - 先下载 SDK 文件
   - 再配置环境变量
   - 再配置平台（高德、微信）
   - 最后进行功能测试

## 常见问题

### 1. SDK 加载失败

- 检查 `src/utils/amap-wx.js` 文件是否存在
- 检查文件路径是否正确
- 检查文件是否完整（未损坏）
- 注意：`_MACOSX` 文件夹可以忽略，只需要 `amap-wx.js` 文件

### 2. 定位失败

- 检查 manifest.json 中权限配置
- 检查小程序后台是否开启地理位置接口
- 检查用户是否授权定位权限

### 3. 地图加载失败

- 检查环境变量中的 Key 是否正确
- 检查高德平台中 Key 是否配置正确
- 检查网络连接是否正常
- 检查服务器域名是否配置

### 4. 搜索无结果

- 检查 Key 是否正确
- 检查定位是否成功
- 检查网络是否正常

### 5. 服务器域名配置问题

- 确保在微信小程序后台配置了高德 API 域名
- 域名必须使用 HTTPS
- 域名不能包含端口号

## 下载链接

高德地图微信小程序 SDK 下载地址：

- 高德开放平台：https://lbs.amap.com/api/wx/download
- 或登录高德开放平台 → 开发支持 → 下载中心 → 微信小程序 SDK

## 技术支持

如有问题，请参考：

- 高德开放平台文档：https://lbs.amap.com/api
- 高德小程序 SDK 文档：https://lbs.amap.com/api/wx/summary
- 微信小程序文档：https://developers.weixin.qq.com/miniprogram/dev/
