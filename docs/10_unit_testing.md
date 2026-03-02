# 单元测试说明

## 技术栈

| 工具                          | 版本 | 用途                          |
| ----------------------------- | ---- | ----------------------------- |
| [Vitest](https://vitest.dev/) | ^4.0 | 测试运行器 + 断言库           |
| jsdom                         | -    | 浏览器环境模拟（vitest 内置） |
| @vitest/coverage-v8           | -    | 代码覆盖率                    |

## 目录结构

```
tests/
└── unit/                         # 单元测试目录
    ├── config/
    │   └── legacy-route.test.ts  # 旧路由映射表校验
    └── utils/
        ├── array.test.ts         # 数组工具（findNameById、deepClone）
        ├── converter.test.ts     # 类型转换（toNumber、toString、toArray、toObject）
        ├── number.test.ts        # 数值处理（formatValue、formatNumber、arithmetic 等）
        ├── resolve-message-url.test.ts  # 消息 URL 解析
        ├── time.test.ts          # 时间工具（format、diff、isLeapYear 等）
        └── type-checker.test.ts  # 类型检查（isString、isEmpty、isDefined 等）

vitest.config.ts                  # Vitest 配置文件
```

## 可用命令

```bash
# 运行全部测试（一次性）
pnpm test

# 监听模式（修改文件后自动重新运行）
pnpm test:watch

# 可视化 UI（浏览器中查看测试结果）
pnpm test:ui

# 生成覆盖率报告（终端文本 + coverage/index.html）
pnpm test:coverage
```

## 配置说明

配置文件：`vitest.config.ts`

```typescript
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // 与项目保持一致的路径别名
    },
  },
  test: {
    globals: true, // 全局注入 describe/it/expect，无需手动 import
    environment: 'jsdom', // 模拟浏览器 DOM 环境
    include: ['tests/unit/**/*.{test,spec}.ts'], // 测试文件匹配规则
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/utils/**', 'src/config/**', 'src/composables/**'],
    },
  },
});
```

## 编写规范

### 文件命名

- 测试文件与源文件同名，后缀为 `.test.ts`
- 放置在 `tests/unit/` 下，保持与 `src/` 相同的目录层级
- 示例：`src/utils/number.ts` → `tests/unit/utils/number.test.ts`

### 代码结构

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '@/utils/my-module';

describe('myFunction', () => {
  it('正常输入返回预期结果', () => {
    expect(myFunction('input')).toBe('expected');
  });

  it('边界值处理', () => {
    expect(myFunction(null)).toBe('');
  });
});
```

### 什么应该测试

- ✅ **纯工具函数**：`src/utils/` 下不依赖 UI 和 API 的函数
- ✅ **配置校验**：路由映射表完整性、枚举值正确性
- ✅ **数据转换逻辑**：格式化、类型转换、计算逻辑
- ❌ **不测试**：Vue 组件渲染、API 请求、UniApp 原生 API

## CI 集成

单元测试已集成到 GitLab CI（`.gitlab-ci.yml`）：

- **触发条件**：推送到 `dev` 分支 或 MR 目标为 `dev` 分支
- **执行阶段**：`test` 阶段，`install_deps` 之后
- **阻塞构建**：单元测试失败会阻止 H5 构建（`build_h5` 依赖 `unit_test`）

```
install_deps → unit_test → build_h5
                type_check (allow_failure)
                lint_check (allow_failure)
```

## 覆盖率报告

运行 `pnpm test:coverage` 后：

- **终端**：直接输出文本格式的覆盖率摘要
- **HTML 报告**：生成在 `coverage/index.html`，浏览器打开可查看每个文件的逐行覆盖情况

> `coverage/` 目录已在 `.gitignore` 中忽略，不会提交到仓库。

## 当前测试统计

| 指标     | 数量                                                                                  |
| -------- | ------------------------------------------------------------------------------------- |
| 测试文件 | 7                                                                                     |
| 测试用例 | 271                                                                                   |
| 覆盖模块 | number / time / type-checker / converter / array / resolve-message-url / legacy-route |

## 已发现的潜在问题

通过编写测试发现以下代码隐患，可后续修复：

1. **`converter.toNumber(Date)`**：Date 对象的 `getType()` 返回 `"date"` 而非 `"object"`，导致 `isObject(date)` 为 false，永远走不到 `isDate` 分支，Date 对象会返回默认值 0 而非时间戳。
2. **`formatNumber(null)`**：`Number(null)` 等于 `0`，不会被 `isNaN` 捕获，因此 null 会被当作 0 格式化，而非返回占位符 `"--"`。
