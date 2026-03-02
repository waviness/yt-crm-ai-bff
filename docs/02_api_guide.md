# API 接口使用指南

本文档详细介绍了项目中使用的 API 接口及调用方法。

## 目录

1. [认证服务 (auth.ts)](#认证服务-authts)
2. [消息服务 (message.ts)](#消息服务-messagets)

## 认证服务 (auth.ts)

认证服务类提供了多种登录方式和协议同意功能。

### 导入方式

```typescript
import { AuthService } from '@/api/auth';
```

### 方法说明

#### signInWithCredentials

使用用户名密码凭证登录

```typescript
static async signInWithCredentials(payload: Record<string, string>)
```

**参数说明:**

- `payload`: 登录凭证对象
  - `userCode`: 用户名
  - `password`: 密码

**返回值:**

- Promise，包含登录请求的响应结果

**使用示例:**

```typescript
const data = await AuthService.signInWithCredentials({
  userCode: 'username',
  password: 'password',
});
```

#### signInWithOfficialAccount

使用公众号登录

```typescript
static async signInWithOfficialAccount(payload: Record<string, any>)
```

**参数说明:**

- `payload`: 登录凭证对象
  - 根据具体接口要求传入相应参数

**返回值:**

- Promise，包含登录成功的用户数据

**使用示例:**

```typescript
const data = await AuthService.signInWithOfficialAccount({
  code: 'authorization_code',
  type: 2,
});
```

#### agreeAgreement

同意用户协议

```typescript
static async agreeAgreement(payload: Record<string, any>)
```

**参数说明:**

- `payload`: 协议同意相关信息对象

**返回值:**

- Promise，包含协议同意的响应结果

**使用示例:**

```typescript
await AuthService.agreeAgreement({
  agreementId: '123',
});
```

## 消息服务 (message.ts)

消息服务类处理与消息相关的 API 请求。

### 导入方式

```typescript
import { MessageService } from '@/api/message';
```

### 方法说明

#### getCrmMessageList

获取 CRM 消息列表

```typescript
static async getCrmMessageList(payload: Record<string, string>)
```

**参数说明:**

- `payload`: 请求参数对象

**返回值:**

- Promise，包含消息列表数据

**使用示例:**

```typescript
const messages = await MessageService.getCrmMessageList({
  page: '1',
  size: '10',
});
```

#### getUnReadCount

获取未读消息数量

```typescript
static async getUnReadCount(payload: Record<string, string>)
```

**参数说明:**

- `payload`: 请求参数对象

**返回值:**

- Promise，包含未读消息数量

**使用示例:**

```typescript
const count = await MessageService.getUnReadCount({});
```

#### readMessage

标记消息为已读

```typescript
static async readMessage(payload: Record<string, string>)
```

**参数说明:**

- `payload`: 请求参数对象，包含消息ID等信息

**返回值:**

- Promise，包含标记结果

**使用示例:**

```typescript
const result = await MessageService.readMessage({
  messageId: '123',
});
```
