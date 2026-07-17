# CIM2.0 — 客户信息管理系统

半导体供应链行业客户信息管理平台，覆盖客户全生命周期管理：从客户建档、跟进推进、商机转化、报价审批，到风控审核、合同管理、账单结算。

> **当前版本**：v3.12.0 · 分支 `main`

---

## 功能模块

### 客户管理

| 功能 | 说明 |
|------|------|
| 📋 客户列表 | 卡片/表格双视图，支持搜索、筛选、分组 |
| 🏢 客户详情 | 8 个信息 Tab：基本信息、业务档案、工商信息、半导体产业链、关联企业、产品信息、审计日志 |
| ✏️ 客户编辑 | 分步表单，含省市区级联、多选标签、文件上传 |
| 📊 进度流转 | 6 阶段漏斗（新获取→待跟进→初步意向→商机确认→成交→失效），可手动推进/回退/标记失效 |
| 🚫 黑名单 | 失效态客户可加入黑名单，总经理审批解除 |

### 主体管理

| 功能 | 说明 |
|------|------|
| 📝 签约主体 | 合同签署法律实体 |
| 🚚 服务主体 | 业务履约实体，下挂收发货方和地址站点 |
| 💰 结算主体 | 发票收款实体，含银行账户信息 |
| 🔗 主体关联 | 通过统一社会信用代码（USCC）与客商双向关联 |

### 业务管理

| 模块 | 说明 |
|------|------|
| 📝 客户跟进 | 跟进记录 CRUD，支持电话/现场/在线/高层会议 4 种方式，可选录音转写 |
| 💡 商机管理 | 销售阶段追踪（需求确认→方案报价→商务谈判→跟进中→赢单/输单） |
| 📊 售前报价 | 报价模板库（8 大业务类型）+ 报价单全流程（草稿→审核→发出→成交/流转） |
| 🛡️ 风控审批 | 多步骤审批流，支持 6 种审批节点（发起人/部门经理/职能/财务/总经理/IT运维） |

### 配置与治理

| 模块 | 说明 |
|------|------|
| 🔧 审批配置 | 工作流模板、自动审批规则（条件+动作引擎）、动态字段配置（13 个审批字段） |
| 🧾 账单规则 | 拆分规则引擎，支持 AND/OR 条件组逻辑，自动匹配账单主体 |
| 📋 账单字段 | 客户级可配置拆分字段 |
| 📄 合同管理 | 合同档案 CRUD，支持签署中/生效/到期/终止状态流转 |

### 系统管理

| 模块 | 说明 |
|------|------|
| 👥 用户管理 | 用户 CRUD + 角色分配 |
| 🔐 角色权限 | 角色 CRUD + 功能权限分配 |
| 🗂️ 功能管理 | 菜单/按钮级权限点管理 |
| 🛡️ 数据权限 | 按用户/角色/部门维度的数据可见范围 |
| 📋 审计日志 | 全操作审计追踪 |
| 📖 字典管理 | 业务枚举字典维护 |
| 🔌 接口管理 | API 接口文档与配置 |
| ⏰ 跟进提醒 | 按客户等级配置跟进频率 + 超期提醒列表 |

### 移动端

| 功能 | 说明 |
|------|------|
| 📱 H5 微应用 | 底栏导航：首页/风控/消息/跟进 |
| ✅ 审批处理 | 移动端风控审批（通过/驳回） |
| 📝 跟进录入 | 移动端快速录入跟进记录 |

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 16（App Router） |
| 语言 | TypeScript 5 |
| UI | React 19 + shadcn/ui（56 个组件）+ Tailwind CSS v4 |
| 设计风格 | Swiss Modern：95% 黑白灰 + 5% 强调色 `#2D3BFF` |
| 状态管理 | React Context + useReducer（全局 `useApp()` 访问） |
| 数据库 | SQLite（sql.js WASM）+ Drizzle ORM |
| 表单 | React Hook Form + Zod |
| 数据持久化 | 内存优先 + 每 5s 自动写入 SQLite |
| 测试 | Playwright（E2E，28 个用例） |
| 包管理 | pnpm |
| 深色模式 | next-themes，跟随系统，iOS 纯黑风格 |

---

## 快速开始

### 环境要求

- **Node.js** ≥ 20
- **pnpm** ≥ 9

### 安装与启动

```bash
# 1. 克隆仓库
git clone git@github.com:asfjwnjeff/CIM2.0.git
cd CIM2.0

# 2. 进入项目目录
cd project_20260526_111004/projects

# 3. 安装依赖
pnpm install

# 4. 启动开发服务器
pnpm dev
```

启动后浏览器访问 `http://localhost:5001`

### 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器（Turbopack，端口 5001） |
| `pnpm build` | 生产构建 |
| `pnpm start` | 生产模式启动 |
| `pnpm ts-check` | TypeScript 类型检查 |
| `pnpm start-dev` | 后台启动开发服务器 |
| `pnpm stop-dev` | 停止后台开发服务器 |

### 数据库

使用 SQLite（sql.js WASM），数据库文件 `data/cim.db`，首次启动自动创建并填充种子数据。

```bash
# 重建数据库
rm -f data/cim.db
# 重启 dev server，seed 脚本自动建表+填充
```

**Schema 演进机制**：Drizzle ORM 是唯一真相源。新增字段只需改 `types.ts` + `schema.ts`，启动时 `autoMigrate()` 自动 ALTER TABLE ADD COLUMN，无需手动写迁移。

---

## 项目结构

```
CIM2.0/
├── CLAUDE.md                     # Claude Code 配置
├── .claude/skills/               # 技能定义
│   ├── cim2-codebase/            #   代码库技术参考
│   ├── prd-write/                #   PRD 撰写
│   ├── requirements-research/    #   需求调研
│   ├── prototype-design/         #   HTML 原型生成
│   └── domain-reference/         #   领域术语查询
├── docs/
│   ├── ui-specification.md       #   UI 设计规范
│   └── superpowers/specs/        #   功能设计文档
├── project_20260526_111004/
│   └── projects/                 # 主项目代码
│       ├── package.json
│       ├── playwright.config.ts
│       ├── scripts/              #   启停脚本
│       ├── e2e/                  #   Playwright E2E 测试（28 个用例）
│       ├── data/                 #   SQLite 数据库文件
│       └── src/
│           ├── app/              #   Next.js 页面（App Router）
│           │   ├── page.tsx      #     仪表盘首页
│           │   ├── layout.tsx    #     根布局
│           │   ├── globals.css   #     全局样式 + CSS 令牌
│           │   ├── api/          #     API 路由（11 模块）
│           │   ├── customers/    #     客户管理（列表/详情/新增/编辑）
│           │   ├── entities/     #     主体管理（签约/服务/结算）
│           │   ├── followup/     #     跟进记录
│           │   ├── opportunities/#     商机管理
│           │   ├── quotes/       #     售前报价（含模板）
│           │   ├── approvals/    #     风控审批
│           │   ├── approval/     #     审批流程配置
│           │   ├── rules/        #     账单规则
│           │   ├── billing-fields/#    账单拆分字段
│           │   ├── contracts/    #     合同管理
│           │   ├── settings/     #     系统与权限管理（9 页）
│           │   ├── orders/       #     订单管理
│           │   ├── mobile/       #     移动端 H5
│           │   ├── blacklist-removal/ # 黑名单解除审批
│           │   └── test/         #     测试页面
│           ├── components/
│           │   ├── ui/           #     shadcn/ui 组件（56 个）
│           │   ├── layout/       #     全局布局 + 搜索
│           │   └── mobile/       #     移动端组件（12 个）
│           ├── hooks/            #   自定义 Hooks
│           ├── lib/              #   类型/状态/工具/表单/导航
│           └── db/               #   Drizzle ORM Schema + Seed
└── 接口文件/                     # CIM 对外接口 API 文档
```

---

## 数据流架构

```
用户操作 → dispatch(action) → reducer 更新 state → React 重渲染
              └→ fetch('/api/...') → Drizzle ORM → sql.js → 每 5s 写 data/cim.db
```

- **查询**：API GET → Drizzle SELECT → JSON 响应 → store dispatch
- **写入**：dispatch + fetch 并行（store 即时生效，API 异步持久化）
- **启动**：useEffect 从 DB 加载数据，通过 RESET + ADD 替换初始数据

---

## 设计系统速查

| 类别 | 值 | 用途 |
|------|-----|------|
| 强调色 | `#2D3BFF` / `#4338CA` / `#E8EBFF` | 按钮、链接 |
| 文字 | `#0A0A0A` / `#5A5A5A` / `#999999` | 标题→正文→占位 |
| 背景 | `#FAFAFA` / `#FFFFFF` / `#F5F5F5` | 页面→卡片→hover |
| 边框 | `#EBEBEB` / `#D5D5D5` | 细线→组件 |
| 成功 | `#0D8A5E` / `#E6F7F0` | 生效、通过 |
| 警告 | `#E8850C` / `#FFF4E8` | 待处理、提醒 |
| 错误 | `#D63031` / `#FFEBEE` | 失效、驳回 |
| 圆角 | 8px / 12px / 16px / 20px | 组件→卡片→弹窗 |
| 容器 | `max-w-7xl mx-auto space-y-6` | 页面容器 |
| 卡片 | `bg-white rounded-2xl border border-[#EBEBEB] shadow-sm p-6` | 标准卡片 |

---

## API 端点

11 个模块，完整 RESTful CRUD：

| 模块 | 端点 |
|------|------|
| 客户管理 | `/api/customers` |
| 联系人 | `/api/contacts` |
| 跟进记录 | `/api/followups` |
| 商机 | `/api/opportunities` |
| 报价 | `/api/quotes` |
| 风控审批 | `/api/risk-approvals` |
| 审批流程 | `/api/approval-workflows` |
| 自动规则 | `/api/auto-approval-rules` |
| 审批字段 | `/api/approval-fields` |
| 账单规则 | `/api/billing-rules` |
| 通知 | `/api/notifications` |

---

## 关键特性

- **Schema 演进自动化**：新增字段仅需修改 `types.ts` + `schema.ts`，启动自动补列，无需手动迁移
- **数据持久化**：全局状态通过 Context + useReducer 管理，API 写入 SQLite，每 5s 自动保存
- **深色模式**：全站覆盖，next-themes 跟随系统，iOS 纯黑风格，悬浮交互有独立深色规则
- **权限控制**：菜单级 + 按钮级权限，按用户/角色/部门维度的数据权限
- **全局搜索**：Cmd+K 快捷键，跨模块搜索页面和快捷操作
- **未保存保护**：编辑页离开时提示未保存更改
- **移动端 H5**：独立的移动端微应用，底栏导航，支持审批处理和跟进录入

---

## 开发约定

- **命名**：变量/函数 `camelCase`，组件/接口 `PascalCase`，常量 `UPPER_SNAKE_CASE`
- **不可变性**：所有 state 使用 spread 创建新对象，禁止直接修改
- **文件大小**：函数 < 50 行，文件 < 800 行
- **表单样式**：统一从 `@/lib/ui-constants` 的 `FIELD_STYLES` 引用
- **种子数据**：所有初始数据在 `sample-data.ts` 统一导出，禁止分散到各页面

---

## License

Private — 内部项目，未开源。
