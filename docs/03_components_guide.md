# 组件使用指南

本文档详细介绍了项目中使用的组件及使用方法。

## 目录

1. [基础组件](#基础组件)
   - [图标组件 (icon.vue)](#图标组件-iconvue)
   - [固定按钮组件 (fix-btn.vue)](#固定按钮组件-fix-btnvue)
   - [悬浮按钮组件 (fly-btn.vue)](#悬浮按钮组件-fly-btnvue)
   - [页面组件 (page.vue)](#页面组件-pagevue)
   - [底部导航栏组件 (tabbar.vue)](#底部导航栏组件-tabbarvue)
   - [水印组件 (watermark.vue)](#水印组件-watermarkvue)
2. [业务组件](#业务组件)
   - [菜单卡片组件 (menu-card.vue)](#菜单卡片组件-menu-cardvue)
   - [权限组件 (permission.vue)](#权限组件-permissionvue)
   - [用户卡片组件 (user-card.vue)](#用户卡片组件-user-cardvue)

## 基础组件

### 日历组件 (calendar.vue)

日历组件基于 `uv-calendars` 封装，支持日期选择、范围选择等功能。

#### ⚠️ 重要提示

**本组件已对底层 `uv-calendars` 组件进行源码修改，详细修改记录请查看 [组件修改文档](./05_component_modifications.md)**

#### 新增功能

- **autoSelectWeek**: 点击日期自动选中整周（用于周报选择）
- **firstDayOfWeek**: 自定义周起始日（0=周日，1=周一，...，6=周六）
- **setDateRange**: 程序化设置日期范围

#### 使用示例

```vue
<template>
  <app-calendar
    ref="calendarRef"
    mode="range"
    :first-day-of-week="6"
    :auto-select-week="true"
    @choice="handleDateChoice"
    @confirm="calendarConfirm"
  />
</template>
```

#### 相关文档

- [组件修改详细记录](./05_component_modifications.md)
- [组件源码修改说明](../../src/uni_modules/uv-calendars/README_MODIFICATIONS.md)

---

### 图标组件 (icon.vue)

图标组件用于显示项目中的各种图标，支持单色图标和多色图标两种模式。

#### 图标库配置

项目使用 Iconfont 图标库，包含两个图标项目：

1. **单色图标项目**: `ytcrm_phone_UI`
   - 文件位置: `static/iconfont/`
   - 包含文件: `iconfont.css`, `iconfont.svg`, `iconfont.ttf`, `iconfont.woff`

2. **多色图标项目**: `ytcrm_phone_UI_color`
   - 文件位置: `static/iconfont/`
   - 包含文件: `iconfont.js`

#### 图标更新流程

1. **下载单色图标**:
   - 从 Iconfont 下载 `ytcrm_phone_UI` 项目
   - 将 `css`、`svg`、`ttf`、`woff` 文件放至 `static/iconfont/` 目录

2. **下载多色图标**:
   - 从 Iconfont 下载 `ytcrm_phone_UI_color` 项目
   - 将 `js` 文件放至 `static/iconfont/` 目录

3. **更新图标**:
   ```bash
   pnpm run update:iconfont
   ```

#### 使用方法

**单色图标**:

```vue
<template>
  <app-icon name="home" size="24" color="#007AFF" />
</template>
```

**多色图标**:

```vue
<template>
  <app-icon name="home" multi size="32" />
</template>
```

#### Props

| 属性名       | 类型            | 默认值 | 说明                                          |
| ------------ | --------------- | ------ | --------------------------------------------- |
| name         | string          | -      | 图标名称                                      |
| size         | string / number | -      | 图标大小，支持数字(默认rpx)或字符串(如"20px") |
| color        | string          | -      | 图标颜色，优先级最高                          |
| fill         | string          | -      | 填充色，兼容部分图标                          |
| inheritColor | boolean         | true   | 是否继承父元素颜色                            |
| customClass  | string          | -      | 自定义类名                                    |
| customStyle  | object          | -      | 自定义样式                                    |
| multi        | boolean         | true   | 是否多色图标                                  |

#### 使用示例

```vue
<template>
  <view class="icon-examples">
    <!-- 基础单色图标 -->
    <app-icon name="home" size="24" />

    <!-- 带颜色的单色图标 -->
    <app-icon name="home" size="24" color="#007AFF" />

    <!-- 多色图标 -->
    <app-icon name="home" multi size="32" />

    <!-- 自定义样式的图标 -->
    <app-icon
      name="home"
      size="20px"
      color="#333"
      customClass="my-icon"
      :customStyle="{ marginRight: '10px' }"
    />

    <!-- 继承父元素颜色的图标 -->
    <view style="color: #ff6b6b;">
      <app-icon name="home" size="24" :inheritColor="true" />
    </view>
  </view>
</template>
```

#### 注意事项

1. **图标名称**: 使用图标时不需要添加 `ytcrm-` 前缀，直接使用图标名称即可
2. **多色图标**: 多色图标不支持 `color` 属性，颜色由图标本身决定
3. **单色图标**: 单色图标支持 `color` 属性自定义颜色
4. **尺寸单位**: 数字默认使用 `rpx` 单位，字符串直接使用指定单位
5. **图标更新**: 每次更新图标后需要运行 `pnpm run update:iconfont` 命令

#### 常用图标列表

**导航类**:

- `home` - 首页
- `my` - 我的
- `xiaoxi` - 消息
- `analysis` - 分析

**业务功能**:

- `dingdan` - 订单
- `customerUnit` - 客户单位
- `project` - 项目
- `funding` - 资金
- `policy` - 政策

**操作类**:

- `sousuo` - 搜索
- `bianji` - 编辑
- `shanchu` - 删除
- `tianjia` - 添加
- `baocun` - 保存
- `tijiao` - 提交

**状态类**:

- `duigou` - 对勾
- `yanjing` - 眼睛
- `tixing` - 提醒
- `yujing` - 预警

> 完整图标列表请参考 `static/iconfont/iconfont.css` 文件中的 `.ytcrm-*` 类名定义。

### 固定按钮组件 (fix-btn.vue)

固定按钮组件用于在页面固定位置显示按钮。

#### 使用方法

```vue
<template>
  <app-fix-btn @click="handleClick">固定按钮</app-fix-btn>
</template>
```

### 悬浮按钮组件 (fly-btn.vue)

悬浮按钮组件用于显示可拖拽的悬浮按钮。

#### 使用方法

```vue
<template>
  <app-fly-btn @click="handleClick">悬浮按钮</app-fly-btn>
</template>
```

### 页面组件 (page.vue)

页面基础组件，提供页面的基本结构。

#### 使用方法

```vue
<template>
  <app-page>
    <view>页面内容</view>
  </app-page>
</template>
```

### 底部导航栏组件 (tabbar.vue)

底部导航栏组件，用于显示应用的底部导航。

#### 使用方法

```vue
<template>
  <app-tabbar />
</template>
```

### 水印组件 (watermark.vue)

水印组件用于在页面上添加水印。

#### 使用方法

```vue
<template>
  <app-watermark text="内部使用" />
</template>
```

## 业务组件

### 菜单卡片组件 (menu-card.vue)

菜单卡片组件用于展示功能菜单项。

#### 使用方法

```vue
<template>
  <biz-menu-card :yw-obj="menuData" @update:isMoreShow="handleUpdate" />
</template>
```

#### Props

| 属性名 | 类型   | 默认值 | 说明         |
| ------ | ------ | ------ | ------------ |
| ywObj  | object | -      | 菜单数据对象 |

#### Events

| 事件名            | 说明             | 参数    |
| ----------------- | ---------------- | ------- |
| update:isMoreShow | 更新菜单显示状态 | boolean |

### 权限组件 (permission.vue)

权限组件用于根据用户权限控制内容显示。

#### 使用方法

```vue
<template>
  <biz-permission value="admin">
    <view>仅管理员可见</view>
  </biz-permission>

  <biz-permission :value="['admin', 'editor']">
    <view>管理员和编辑者可见</view>
  </biz-permission>
</template>
```

#### Props

| 属性名 | 类型              | 默认值 | 说明                               |
| ------ | ----------------- | ------ | ---------------------------------- |
| value  | string / string[] | -      | 权限标识，可以是单个权限或权限数组 |

### 用户卡片组件 (user-card.vue)

用户卡片组件用于展示用户信息。

#### 使用方法

```vue
<template>
  <biz-user-card :user="userData" />
</template>
```

#### Props

| 属性名 | 类型   | 默认值 | 说明         |
| ------ | ------ | ------ | ------------ |
| user   | object | -      | 用户信息对象 |
