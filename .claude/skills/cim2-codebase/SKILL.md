# CIM2.0 代码库技术参考

当修改或开发 CIM2.0 项目代码时使用此 skill。

## 技术栈

- **项目路径**: `project_20260526_111004/projects/`
- **框架**: Next.js 16.1 App Router + React 19 + TypeScript 5
- **UI**: shadcn/ui + Tailwind CSS v4，品牌色 #2D3BFF → #4338CA（Swiss Modern 重设计）
- **图标**: Lucide React
- **数据层**: Drizzle ORM (SQLite) + 内存 store（useReducer + React Context）
- **包管理**: pnpm（强制，preinstall hook 禁止 npm/yarn）

## 常用命令

| 命令 | 用途 |
| ---- | ---- |
| `cd project_20260526_111004/projects && pnpm dev` | 启动开发服务器 |
| `cd project_20260526_111004/projects && pnpm ts-check` | TypeScript 类型检查 |
| `cd project_20260526_111004/projects && pnpm build` | 生产构建 |

## 设计系统 (Swiss Modern) **← 所有页面开发必须遵守**

全站基于 Swiss Modern 设计语言：95%黑白灰 + 5%强调色，1px细线分隔，字重驱动层级，无渐变。

**设计令牌是唯一权威来源：** 开发任何新页面时必须从以下两个文件引用设计值，禁止自行发明颜色或样式：
- `src/lib/ui-constants.tsx` — `FIELD_STYLES`、`BRAND_COLORS`、`SEMANTIC_COLORS`、`NEUTRAL_COLORS`、`TYPOGRAPHY`、`SHADOWS`、`RADIUS`
- `src/app/globals.css` — CSS 自定义属性（`--color-*`、`--text-*`、`--shadow-*` 等）

### 设计令牌表

| 类别 | 变量/值 | 用途 |
| ---- | ----- | ---- |
| 强调色 | `#2D3BFF`（主）/ `#4338CA`（hover）/ `#E8EBFF`（浅底） | 按钮、链接、选中态、高亮区 |
| 文字 | `#0A0A0A`（主）/ `#5A5A5A`（辅）/ `#999999`（占位） | 标题→正文→辅助信息 |
| 背景 | `#FAFAFA`（页面）/ `#FFFFFF`（卡片）/ `#F5F5F5`（hover） | 页面底色→卡片→行悬停 |
| 边框 | `#EBEBEB`（细线分隔）/ `#D5D5D5`（组件边框） | 表格线、卡片边←输入框、下拉框 |
| 功能色 | 成功 `#0D8A5E`/`#E6F7F0` / 警告 `#E8850C`/`#FFF4E8` / 错误 `#D63031`/`#FFEBEE` | 状态标签背景/文字 |
| 圆角 | 标签 `6px` / 按钮 `8px` / 卡片 `16px`（`rounded-2xl`） / 弹窗 `24px` | |
| 阴影 | xs `0 1px 2px` / sm `0 2px 8px rgba(0,0,0,0.06)` / md `0 4px 16px` / lg `0 8px 32px` | 卡片默认用 sm |

### 页面开发速查（务必遵守）

开发或重设计任何页面时，必须使用以下样式值，禁止使用旧颜色：

```text
页面标题:     text-2xl font-bold text-[#0A0A0A]
页面副标题:   text-[13px] text-[#5A5A5A]
面包屑:       text-[13px] text-[#999999]（可点击项 hover:text-[#2D3BFF]）
页面背景:     bg-[#FAFAFA]

卡片容器:     bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)]
表单分区:     同上卡片样式 + p-6 内边距
分区标题:     text-md font-semibold text-[#0A0A0A] mb-4

表格容器:     bg-white rounded-2xl border border-[#EBEBEB] shadow-sm overflow-hidden
表格表头:     border-b border-[#EBEBEB] bg-[#FAFAFA] h-[36px]
表头文字:     text-left text-[11px] font-semibold uppercase text-[#5A5A5A]
表格数据行:   border-b border-[#EBEBEB] h-[44px] hover:bg-[#F5F5F5] transition-colors
表格数据:     text-[13px] text-[#5A5A5A]（名称列加 font-medium text-[#0A0A0A]）

按钮主要:     bg-[#2D3BFF] text-white hover:bg-[#4338CA] rounded-lg
按钮次要:     border border-[#D5D5D5] text-[#5A5A5A] hover:bg-[#F5F5F5] rounded-lg
危险按钮:     text-[#D63031] hover:underline（文字链接形式）

搜索输入框:   h-[38px] border border-[#D5D5D5] rounded-lg focus:outline-none focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)]
筛选下拉框:   使用原生 select（仅简单 2-3 选项筛选），样式同上搜索框

表单标签:     text-sm font-semibold text-[#0A0A0A]（即 FIELD_STYLES.label）
表单输入:     h-[38px] border border-[#D5D5D5] rounded-lg（即 FIELD_STYLES.input）
表单必填:     text-[#D63031]（即 FIELD_STYLES.requiredStar）

启用标签:     bg-[#E6F7F0] text-[#0D8A5E]
停用标签:     bg-[#EBEBEB] text-[#5A5A5A]
```

### 组件规范

- 所有下拉选择**必须**使用 `SearchableSelect` 或 `SearchableMultiSelect`，禁止在表单中使用原生 `<select>`
- 筛选栏中简单的 2-3 选项下拉可用原生 `<select>`（使用上方筛选下拉框样式）
- 表单样式必须从 `@/lib/ui-constants` 导入 `FIELD_STYLES`
- 图标统一使用 Lucide React，禁止使用 emoji 作为图标
- 用户选择器基于 `SearchableSelect`/`SearchableMultiSelect` 的 `renderOption`/`renderBadge` 自定义渲染

### 禁止使用的旧颜色（已废弃）

| 旧颜色 | 替代色 |
| ------ | ----- |
| `#1C2550`（深蓝标题） | `#0A0A0A` |
| `#1E2340`（深蓝文字） | `#0A0A0A` |
| `#4B5563`（灰标题） | `#5A5A5A` |
| `#F8FAFC`（表头背景） | `#FAFAFA` |
| `#F8FAFF`（行悬停） | `#F5F5F5` |
| `#0D904F`（绿色文字） | `#0D8A5E` |
| `#E6F4EA`（绿色背景） | `#E6F7F0` |
| `#F3F4F6`（灰色标签） | `#EBEBEB` |
| `#6B7280`（灰色文字） | `#5A5A5A` |

### 重设计新增文件

| 文件 | 用途 |
| ---- | ---- |
| `src/components/ui/skeleton.tsx` | 骨架屏（表格/卡片/详情/列表等 7 种变体） |
| `src/components/ui/empty-state.tsx` | 空状态（列表空/搜索无结果/详情无数据） |
| `src/components/ui/page-transition.tsx` | 页面过渡动画（200ms 淡入+微上移） |
| `src/components/ui/form-field.tsx` | 表单字段包装（Label-Top 布局 + 验证） |
| `src/components/ui/form-section.tsx` | 表单分区包装 |
| `src/components/ui/validation-message.tsx` | 字段验证错误/成功提示 |
| `src/lib/form-rules.ts` | 声明式表单验证规则 |
| `src/lib/form-utils.ts` | 脏检测、字数统计工具函数 |
| `src/hooks/useUnsavedChanges.ts` | 未保存更改保护（beforeunload + 路由拦截） |
| `src/hooks/useKeyboardShortcuts.ts` | 全局键盘快捷键（Cmd+K/Esc/↑↓/Tab） |

### 重设计新增文件（第二轮 — 布局修复与搜索）

| 文件 | 用途 |
| ---- | ---- |
| `src/lib/navigation.tsx` | 导航配置 — NAV_ITEMS、NavIcons、SearchItem、getSearchItems() |
| `src/components/layout/GlobalSearchDialog.tsx` | 全局搜索对话框（Cmd+K / Ctrl+K 快捷键） |

### 页面布局标准 **← 所有 page.tsx 必须遵守**

经过全站 48 页统一标准化后，以下布局规范必须严格遵守：

**AppLayout 间距（在 AppLayout.tsx `<main>` 元素统一处理）：**

| 参数 | 数值 | 说明 |
| ---- | ---- | ---- |
| `pt-[87px]` | header 55px + 32px 顶部呼吸空间 | 页面标题与 header 的间距 |
| `px-8` | 32px 水平内边距 | 替代各页面自带的 p-6/p-5，统一水平留白 |
| `ml-[256px]` | 侧栏展开时 240px + 16px 间隙 | 内容区与侧栏之间留有间距 |
| `ml-[72px]` | 侧栏折叠时 56px + 16px 间隙 | 折叠状态同样保留间距 |
| `transition-[margin-left] duration-200 ease-out` | 200ms 缓出过渡 | 侧栏展开/折叠平滑动画 |

**每个 page.tsx 最外层 wrapper 必须为：**

```tsx
<div className="max-w-7xl mx-auto space-y-6">
  {/* 页面内容 */}
</div>
```

**页面标题（h1）统一为：**

```tsx
<h1 className="text-2xl font-bold text-[#0A0A0A]">页面标题</h1>
```

**禁止的布局模式（已统一修复）：**

| 禁止项 | 说明 |
| ------ | ---- |
| 外层 `p-6` / `p-5` | AppLayout px-8 已提供水平留白，页面不得重复加 padding |
| 双层 wrapper（如 `min-h-screen` + `max-w-*`） | 必须合并为单一 wrapper |
| `max-w-6xl` | 统一改为 `max-w-7xl` |
| 自定义 CSS gradient 背景 | 统一使用 `bg-[#FAFAFA]` 页面底色 |
| `-mx-2` 负边距 hack | 不再需要，移除 |
| 内嵌 header（页面内重复顶栏） | AppLayout 统一提供 header，页面内不得重复 |
| `space-y-4` / `space-y-5` | 统一改为 `space-y-6` |
| h1 使用 `text-xl` / `text-[20px]` / `text-3xl` | 统一改为 `text-2xl` |
| 标题颜色 `text-[#1E2340]` / `text-[#1C2550]` | 统一改为 `text-[#0A0A0A]` |

**返回按钮规范（所有页面头部保持一致）：**

```tsx
<Button
  variant="outline"
  onClick={() => router.back()}
  className="border border-[#EBEBEB] text-[#5A5A5A] hover:bg-[#FAFAFA] px-3 py-2"
>
  <ArrowLeft className="w-4 h-4" />
</Button>
```

**全局搜索对话框：**

- 使用 `Cmd+K` / `Ctrl+K` 键盘快捷键打开
- 搜索项从 `src/lib/navigation.tsx` 的 NAV_ITEMS 扁平化提取
- 包含 "页面导航" 和 "快捷操作" 两个分组
- 选中后通过 `router.push()` 跳转
- 状态在 AppLayout 中管理，通过 `searchOpen` / `setSearchOpen` 控制

## 项目架构

```
src/
├── lib/
│   ├── types.ts          # 所有类型定义（Customer, Quote, BillingRule 等）
│   ├── store.tsx         # 全局状态 — useReducer + Context，通过 useApp() 访问
│   ├── sample-data.ts    # 示例数据 + 常量（MOCK_USERS, PROGRESS_STEPS 等）
│   ├── ui-constants.tsx  # UI 设计令牌常量（FIELD_STYLES, BRAND_COLORS 等）
│   ├── form-rules.ts     # 声明式表单验证规则
│   └── form-utils.ts     # 脏检测、字数统计等表单工具函数
├── components/
│   ├── ui/               # shadcn/ui 组件 + CIM 自定义组件（56 个）
│   ├── layout/AppLayout.tsx
│   ├── ProgressStepper.tsx   # 6 阶段跟进步骤条
│   ├── CollaborationDialogs.tsx  # 协同/分配/移交弹窗
│   └── RuleGroupEditor.tsx
├── hooks/
│   ├── useUnsavedChanges.ts    # 未保存更改保护
│   ├── useKeyboardShortcuts.ts # 全局键盘快捷键
│   └── use-mobile.ts
├── app/
│   ├── customers/        # 客户管理（列表/详情/新增/编辑 4 页）
│   ├── quotes/           # 售前报价（含模板 5 页）
│   ├── followup/         # 跟进记录（4 页）
│   ├── opportunities/    # 商机管理（4 页）
│   ├── approvals/        # 风控审批（4 页）
│   ├── rules/            # 账单规则（1 页）
│   ├── entities/         # 主体管理 — 签约/服务/结算（6 页）
│   ├── approval/         # 审批流程配置 — 工作流/自动规则（6 页）
│   ├── settings/         # 系统设置 — 用户/角色/权限/字典等（8 页）
│   ├── contracts/        # 合同管理（1 页）
│   ├── billing-fields/   # 结算字段配置（1 页）
│   ├── orders/           # 订单管理（1 页）
│   ├── test/             # 测试页面
│   └── api/              # API 路由（9 个端点）
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

## 数据模型要点

- 客户 `Customer`: `responsiblePersons: string[]`（多选负责人），`customerCode?: string`（客户代码）
- 所有数据操作通过 `useApp()` hook → dispatch action → reducer 不可变更新
- 协同操作: `assignCustomer(id, responsiblePersons[])`, `transferCustomer(id, newPerson, reason?)`

## 已知问题

- `pnpm build` 因 `src/db/index.ts` 缺少 `@types/sql.js` 报错，前端修改可忽略此报错
- 仅做前端修改时，用 `pnpm ts-check` 验证即可
