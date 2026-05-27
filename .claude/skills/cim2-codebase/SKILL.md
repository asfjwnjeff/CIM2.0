# CIM2.0 代码库技术参考

当修改或开发 CIM2.0 项目代码时使用此 skill。

## 技术栈

- **项目路径**: `project_20260526_111004/projects/`
- **框架**: Next.js 16.1 App Router + React 19 + TypeScript 5
- **UI**: shadcn/ui + Tailwind CSS v4，品牌色 #1A2FFF → #3B52FF
- **图标**: Lucide React
- **数据层**: Drizzle ORM (SQLite) + 内存 store（useReducer + React Context）
- **包管理**: pnpm（强制，preinstall hook 禁止 npm/yarn）

## 常用命令

| 命令 | 用途 |
|------|------|
| `cd project_20260526_111004/projects && pnpm dev` | 启动开发服务器 |
| `cd project_20260526_111004/projects && pnpm build` | 生产构建 |
| `cd project_20260526_111004/projects && pnpm ts-check` | TypeScript 类型检查 |

## 项目架构

```
src/
├── lib/
│   ├── types.ts          # 所有类型定义（Customer, Quote, BillingRule 等）
│   ├── store.tsx         # 全局状态 — useReducer + Context，通过 useApp() 访问
│   └── sample-data.ts    # 示例数据 + 常量（MOCK_USERS, PROGRESS_STEPS 等）
├── components/
│   ├── ui/               # shadcn/ui 组件（button, dialog, command, popover 等）
│   ├── layout/AppLayout.tsx
│   ├── ProgressStepper.tsx   # 6 阶段跟进步骤条
│   ├── CollaborationDialogs.tsx  # 协同/分配/移交弹窗
│   └── RuleGroupEditor.tsx
├── app/
│   ├── customers/        # 客户管理（列表/详情/新增/编辑 4 页）
│   ├── quotes/           # 售前报价
│   ├── followup/         # 跟进记录
│   ├── opportunities/    # 商机管理
│   ├── approvals/        # 风控审批
│   ├── rules/            # 账单规则
│   ├── entities/         # 主体管理（签约/服务/结算）
│   ├── approval/         # 审批流程配置
│   └── settings/         # 系统设置
└── db/schema.ts          # Drizzle 数据库 schema（8 表）
```

## 核心模式

### 数据流
- 所有数据操作通过 `useApp()` hook 获取，dispatch action 到 reducer
- 新增客户: `addCustomer(customer)` → reducer ADD_CUSTOMER → 自动生成 id + createdAt
- 更新客户: `updateCustomer(id, updates)` → reducer UPDATE_CUSTOMER → 合并更新
- 协同操作: `collaborateCustomer / assignCustomer / transferCustomer` + 对应的 batch 版本
- 操作日志: `addLog(log)` → 记入 operationLogs 数组

### 组件约定
- 所有页面均为 `'use client'`
- 不可变更新 — 永远用 spread 创建新对象，不直接修改 state
- 中文 UI 文案 — 所有面向用户的文字用中文
- 文件大小 — 控制在 800 行以内，超出拆分子组件
- 用户选择器 — 统一用 shadcn Popover + Command 实现

### 自定义 checkbox 模式
```tsx
<label className="flex items-center gap-2 cursor-pointer">
  <input type="checkbox" checked={checked} onChange={...} className="sr-only" />
  <div className={`w-4 h-4 rounded border-2 ...`}>
    {checked && <Check className="w-3 h-3" />}
  </div>
</label>
```

## 已知问题

- `pnpm build` 因 `src/db/index.ts` 缺少 `@types/sql.js` 报错，前端修改可忽略此报错
- 仅做前端修改时，用 `pnpm ts-check` 验证即可
