# CIM2.0 代码库技术参考

## 快速启动

| 操作 | 命令（从 `project_20260526_111004/projects/` 执行） |
|------|------|
| 启动开发 | `pnpm dev`（Turbopack，端口见终端输出） |
| 类型检查 | `pnpm ts-check` |
| 重建数据库 | `rm -f data/cim.db && npx tsx src/db/seed.ts`，然后**重启 dev server** |
| 生产构建 | `pnpm build`（sql.js 类型报错可忽略） |

## 技术栈

- **框架**: Next.js 16 App Router + React 19 + TypeScript 5
- **UI**: shadcn/ui + Tailwind CSS v4，品牌色 `#2D3BFF` / `#4338CA`
- **状态管理**: React Context + useReducer，全局通过 `useApp()` 访问
- **数据库**: sql.js（SQLite WASM）+ Drizzle ORM，文件 `data/cim.db`，每 5s 自动持久化
- **包管理**: pnpm

## 数据库注意事项 ⚠️

### Schema 演进机制（autoMigrate + 动态字段映射）

系统的 ORM 层（Drizzle schema）是**唯一真相源**。新增字段只需改 2 处，其余自动处理：

```
1. src/lib/types.ts          ← 加 TS 类型字段
2. src/db/schema.ts          ← 加 Drizzle 列定义
   → 启动时 autoMigrate() 自动 ALTER TABLE ADD COLUMN
   → seed 用 Object.entries() 动态遍历写入
   → API 用 buildDbData() 动态映射读写
```

**不再需要**手动同步 seed.ts CREATE TABLE、ALTER TABLE 数组、字段白名单。

### autoMigrate() 自动补列

`seed.ts` 中的 `autoMigrate()` 函数在每次启动时执行：
1. `PRAGMA table_info(customers)` 读取 DB 中已有列
2. 对比 schema 中定义的列 → 缺失列自动 `ALTER TABLE ADD COLUMN`
3. 已存在列跳过不报错

### 动态字段映射

| 位置 | 机制 |
|------|------|
| seed 插入 | `Object.entries(c)` 遍历所有字段，`typeof === 'object' → JSON.stringify`，其余直接赋值 |
| API GET | 遍历结果所有字段，值以 `{` 或 `[` 开头 → `JSON.parse` 尝试解析 |
| API POST/PUT | `buildDbData()` 遍历 body，`object → JSON.stringify`，其余直接赋值 |

### 数据库重建步骤

```bash
rm -f data/cim.db                          # 删除旧库
# 重启 dev server（seed 自动建表+插数据）
```

**注意**: DB 文件修改后必须重启 dev server。`getDb()` 是内存单例。

### 种子数据架构

- `src/lib/sample-data.ts` 导出所有 `initial*` 数组，同时被 store（内存初始化）和 seed（数据库初始化）引用
- `store.tsx` 启动时从 API 加载 DB 数据覆盖默认值
- 两层数据源：前端 store（交互即时） + DB 持久化（刷新保留）

## 数据流

```
用户操作 → dispatch(action) → reducer 更新 state → React 重渲染
                └→ fetch('/api/...') → Drizzle ORM → sql.js → 每5s写 data/cim.db
```

- 查询：API GET → Drizzle SELECT → JSON 响应 → store dispatch
- 写入：dispatch + fetch 并行（store 即时生效，API 异步持久化）
- `useEffect(() => {}, [])` 启动时从 DB 加载一次，通过 `RESET + 逐个 ADD` 替换初始数据

## 设计系统速查

全站 Swiss Modern：95% 黑白灰 + 5% 强调色。

| 类别 | 值 | 用途 |
|------|-----|------|
| 强调 | `#2D3BFF` / `#4338CA` / `#E8EBFF` | 按钮、链接 |
| 文字 | `#0A0A0A` / `#5A5A5A` / `#999999` | 标题→正文→占位 |
| 背景 | `#FAFAFA` / `#FFFFFF` / `#F5F5F5` | 页面→卡片→hover |
| 边框 | `#EBEBEB` / `#D5D5D5` | 细线→组件 |
| 状态色 | 成功 `#0D8A5E`/`#E6F7F0` / 警告 `#E8850C`/`#FFF4E8` / 错误 `#D63031`/`#FFEBEE` |

- 页面容器：`<div className="max-w-7xl mx-auto space-y-6">`
- 卡片：`bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6`
- 表单样式统一从 `@/lib/ui-constants` 的 `FIELD_STYLES` 引用

## 关键模块

```
src/app/
├── approvals/       # 风控审批申请（列表/详情/新建/编辑）
├── approval/        # 审批配置
│   ├── fields/      # 字段配置（13字段，store CRUD）
│   ├── auto-rules/  # 自动规则（7条，store CRUD）
│   └── workflows/   # 审批流模板
├── customers/       # 客户管理
└── api/             # 10 个 API 端点（含 risk-approvals 完整 CRUD）
```

## 开发注意事项

### 重复结构页面

客户列表页等存在卡片视图和表格视图两个渲染分支时：
1. 修改前 `grep -n "变量名" page.tsx` 找全所有声明点
2. 新增变量必须在每个作用域独立声明
3. 改后立即 `pnpm ts-check`

### useState 初始值

`useState(value)` 仅在组件首次挂载时生效。如果数据是异步加载的（如 DB），需用 `useEffect` 同步：`useEffect(() => setFormData(data), [data])`。

### 不可变更新

所有 state 必须用 spread 创建新对象，禁止直接修改。

## 禁止事项 / 反模式 ⛔

### 数据层

- **禁止 `sample-data.ts` 中的数据分散到各页面的局部常量**。
  所有初始数据必须在 `sample-data.ts` 中统一导出。跨页面需要同一份数据时，各页面从 sample-data 导入，不允许各自维护一份副本。违反 → 数据不同步、改一处漏一处。

- **禁止在 seed.ts 或 API route 中手写字段白名单**。
  seed 已改为 `Object.entries()` 动态遍历，API 已改为 `buildDbData()`。新增字段无需手动同步到这些位置。手写白名单 = 遗留字段漏同步 → 数据丢失。

- **禁止给 `useState` 传 `localStorage` 相关的函数调用而不加 lazy initializer**。
  `useState(getStoredValue())` 每次渲染都执行 → SSR 返回默认值、客户端返回 localStorage 值 → hydration mismatch。
  正确写法：`useState(() => getStoredValue())`，函数只在初始化时调用一次。

- **禁止把 `sample-data.ts` 当成 mock 数据随意修改**。
  它是**生产数据库种子文件**，store 用它初始化内存状态，seed 用它初始化 SQLite。改它 = 改生产数据。任何改动必须在 Plan Mode 中获用户确认。

- **禁止修改 `src/db/schema.ts` 后不同步更新 `src/db/seed.ts`** 的 CREATE TABLE 语句。列名不一致 → seed 静默失败 → `no such column`。

- **禁止 DB 文件修改后不重启 dev server**。`getDb()` 是内存单例。

### 类型与属性

- **禁止 `RuleCondition` 接口的 `field` 和 `fieldKey` 出现二义性**。
  `field` 是主属性（必填），`fieldKey` 是可选冗余。UI 绑定必须 `field || fieldKey` 双保险，绝不能只绑一个。违反 → select 静默回退到第一项，全部条件显示同一个字段。

- **禁止 onChange 更新条件时只写部分属性**。
  修改字段必须同时更新 `{ field, fieldKey, fieldName }` 三个属性。只更新 `fieldKey` 而不更新 `field` → `renderConditionPreview` 读不到字段名 → 显示「未知字段」。

- **禁止 `<select>` 元素不提供空选项兜底**。
  当 `value` 在 options 中无匹配时，浏览器静默展示第一个 option，不会报错。始终确保有 `<option value="">` 或 value 必能匹配。

### 业务逻辑

- **禁止在规则编辑器中使用全局字段列表**。
  条件字段下拉必须按**选中客户**过滤：应用材料 → DN/Plant/Location，华力 → 货物属性。用全局 `splitFields` 会导致错配。

- **禁止操作符列表与数据不同步**。
  数据中已有 `not_in_list` 操作符时，OPERATORS 常量也必须包含它。否则 `renderConditionPreview` 会显示原始英文 key 而非中文标签。

- **禁止 equals/not_equals 操作符接受多值而不转换**。
  `equals` 语义不支持多值。选了 ≥2 个值 → 必须自动转为 `in_list`。选了 1 个值 → 转回 `equals`。违反 → 规则引擎解析时逻辑错误。

- **禁止账单主体下拉使用 `customer.billingEntities` ID 数组过滤**。
  账单主体可选值应来自 `initialCustomerBillingFields` 中该客户「账单主体」字段的 `options`。

### 组件设计

- **禁止 RuleGroupEditor 和 rules/page.tsx 各自维护一份 OPERATORS**。
  操作符列表必须在两处保持完全一致（名称、数量、value）。任何增删必须两处同步改。

### 深色模式

- **禁止新增浅色 hover 背景（如 `hover:bg-[#FFEBEE]`）而不在 `globals.css` 加对应的深色覆盖规则**。
  本项目的深色模式不是靠 Tailwind 的 `dark:hover:bg-xxx`，而是通过 `globals.css` 中的手工规则
  `.dark .hover\:bg-\[\#xxx\]:hover { background-color: #yyy; }` 实现。

  根因：当 `dark:bg-[暗色]` 和 `hover:bg-[亮色]` 同时挂在一个元素上时，
  两者 CSS 优先级相同（都是 0,2,0），源顺序靠后的 `dark:bg` 会覆盖 `hover:bg` → **悬浮交互完全失效**。

  修复流程：定位冲突元素 → 在 globals.css 中已有规则附近加覆盖 → 颜色值参考已有静态覆盖色。

  现有深色悬浮覆盖规则（`globals.css` §深色模式）：
  | 浅色 hover | 深色覆盖 |
  |-----------|---------|
  | `hover:bg-[#F5F5F5]` | `#2C2C2E` |
  | `hover:bg-[#E8EBFF]` | `#3A3A3C` |
  | `hover:bg-[#FFEBEE]` | `#2E1A1D` |
  | `hover:bg-[#E6F7F0]` | `#1A2A1D` |
  | `hover:bg-[#FFF4E8]` | `#2E2A10` |

## 故障排查

| 症状 | 可能原因 | 解决 |
|------|---------|------|
| 深色模式悬浮交互不生效 | `dark:bg-` 覆盖了 `hover:bg-`（CSS 同级冲突） | 在 globals.css 加 `.dark .hover\:bg-[#xxx]:hover` 覆盖规则 |

| 症状 | 可能原因 | 解决 |
|------|---------|------|
| 编辑保存后列表不变 | DB 未连接 / server 缓存旧 DB | 重建 DB + 重启 server |
| seed 报 `no such column` | CREATE TABLE 列名与 Drizzle schema 不一致 | 对齐 seed.ts 的 SQL 列名 |
| 新增字段后数据不显示 | 旧 DB 缺少列（未运行 autoMigrate） | 重启 server，autoMigrate 自动补列 |
| `hydration mismatch` 错误 | `useState(fn())` 缺少 `() =>` lazy initializer | 改为 `useState(() => fn())` |
| API 返回 `no such table` | seed 未运行或表被跳过 | 检查 seed 输出，确保所有表创建成功 |
| 页面数据不更新 | store 与 API 不同步 | 检查 API 是否返回正确数据，store reducer 是否正确匹配 ID |
| 修改 schema 后插入失败 | 未同步更新 seed.ts CREATE TABLE | schema.ts 和 seed.ts 必须同时修改 |

## 新功能模块速查

| 功能 | 关键文件 | 核心逻辑 |
|------|---------|---------|
| 黑名单 | `store.tsx` BLACKLIST_CUSTOMER action, `customers/[id]/page.tsx`, `blacklist-removal/[customerId]/page.tsx` | 仅失效状态可加入、两次确认弹窗、总经理审批解除、编辑页整页只读 |
| 主体类型+CPQ | `types.ts` EntityType/BoundCustomer, `entity-utils.ts`, `customers/page.tsx` | 签约/服务/结算三色标签、关联主体数量列、绑定关系只读展示、信息完整度提示 |
| 联系人权限 | `ContactManagementDialog.tsx` readonly prop, `customers/[id]/page.tsx` | 详情页只读Dialog(可查看不可编辑)、编辑页完整CRUD |
| 进度流转 | `ProgressStepper.tsx`, `customers/[id]/edit/page.tsx` | 标记失效(二次确认)/恢复(还原原状态)、失效态全灰、编辑页步骤条可交互 |
| Schema演进 | `db/seed.ts` autoMigrate(), `api/customers/route.ts` buildDbData() | 启动自动补列、动态字段映射、新增字段仅需改 types+schema |
| 暗色模式 | `globals.css` .dark 规则, `components/ThemeToggle.tsx` | iOS纯黑风格、next-themes跟随系统、灰色系/Tailwind工具类全量覆盖 |
