# 旧版路由映射与兼容性说明文档

## 1. 背景

由于项目从 Vue2 H5 迁移至 UniApp (Vue3)，且后端消息推送服务可能通过旧版 URL 格式发送通知，前端需要兼容处理这些旧版链接。

为了保证用户体验，我们不能简单地让小程序或 H5 跳转到外部链接，而是应该尽可能地拦截这些旧路由，并将其重定向到新的 UniApp 内部页面。

## 2. 映射配置

映射表位于 `src/config/legacy-route.ts`。

该文件导出了 `PATH_REWRITE_MAP` 对象：

- **Key**: 旧版 Vue2 Hash 路由路径（不含 `#`，如 `/financeInquiryDetail`）
- **Value**: 新版 UniApp 页面路径（如 `/subpackages/business/confirmation-letter/detail`）

### 示例

```typescript
export const PATH_REWRITE_MAP = {
  // 旧版路由 -> 新版路由
  '/financeInquiryDetail': RouteMap.confirmationLetterDetail,
  '/projectManage': RouteMap.projectEntry,
  // ...
};
```

## 3. 解析与跳转逻辑

核心逻辑位于 `src/subpackages/home/composables/use-message.ts` 中的 `toFlowDetail` 方法。

处理流程如下：

1.  **已读标记**：用户点击消息后，立即标记为已读（无论后续跳转是否成功）。
2.  **路由解析**：
    - **优先尝试解析 Hash**：提取 URL 中 `#` 后面的部分。
      - 如果是旧版路径（在映射表中），转换为新版路径。
      - 如果是新版路径（`/pages` 或 `/subpackages` 开头），直接使用。
    - **兜底解析直连路径**：如果 Hash 解析失败，尝试从 URL 中直接提取 `/pages/...` 或 `/subpackages/...`，以支持不带 Hash 的新版链接。
3.  **跳转执行**：
    - **内部跳转**：如果解析出有效的内部路由，使用 `router.push()` 跳转。
    - **外部跳转（兜底）**：如果无法解析为内部路由：
      - H5 环境：使用 `window.location.href` 跳转原始链接。
      - 非 H5 环境（如小程序）：提示“不支持的链接格式”。

## 4. 技术债评估与清理计划

### 状态：`pending`

该模块属于为了兼容历史遗留问题而存在的“防腐层”，在长期维护中应被视为**技术债**。

### 影响

- **代码冗余**：保留了额外的正则匹配逻辑和映射表。
- **维护成本**：如果新版页面结构调整，需要同步检查是否影响了映射关系。

### 清理条件

满足以下条件时，可以考虑移除 `legacy-route.ts` 及相关解析逻辑：

1.  **后端改造完成**：确认所有后端服务、消息推送中心均已切换为发送新版 UniApp 路由格式（`/subpackages/...`）。
2.  **存量数据过期**：确认用户的历史消息列表中，不再包含（或极少包含）旧版链接格式的未读消息。通常可以设定一个过渡期（如 3-6 个月）。

### 清理步骤

1.  删除 `src/config/legacy-route.ts` 文件。
2.  移除 `src/App.vue` 中对 `legacy-route.ts` 的引用及相关初始化代码（如有）。
3.  简化 `use-message.ts` 中的 `toFlowDetail` 方法，移除 Hash 映射逻辑，仅保留标准路由跳转和错误提示。
