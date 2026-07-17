# CIM2.0 — 客户主数据平台

半导体供应链行业客户主数据管理平台。以 **CIM 为源头**，统一管理客商档案、法律主体、地址主数据、联系人、产业链关系等核心主数据，向下游业务系统（COS/CPQ/TMS/WMS/DMS）分发标准化数据。

> 当前版本：技术预览版 · 分支 `feat/platform`

---

## 功能概览

| 模块 | 说明 |
|------|------|
| 📊 仪表盘 | 工作台首页，业务数据概览 |
| 🏢 客商管理 | 客户/供应商档案管理（CRUD + 进度流转 + 黑名单） |
| 📋 主体管理 | 签约主体 / 服务主体 / 结算主体，支持 USCC 双向关联 |
| 📍 地址主数据 | 统一地址表，标签化区分注册/营业/开票/收货/发货等用途，高德解析 + 版本快照 |
| 👤 客户跟进 | 跟进记录 CRUD，6 阶段进度流转 |
| 💡 商机管理 | 销售机会追踪 |
| 📊 售前报价 | 报价模板 + 报价单管理 |
| 🛡️ 风控审批 | 审批流配置（工作流/自动规则/字段配置）+ 审批提交 |
| 🧾 账单规则 | 拆分规则引擎，条件组逻辑 |
| ⚙️ 系统管理 | 字典管理、接口管理、跟进提醒配置 |
| 🔐 权限管理 | 用户/角色/功能/数据权限 + 审计日志 |
| 📱 移动端 | H5 微应用（底栏导航：首页/风控/消息/跟进） |

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 16（App Router + Turbopack） |
| 语言 | TypeScript 5 |
| UI | React 19 + shadcn/ui + Tailwind CSS v4 |
| 状态管理 | React Context + useReducer |
| 数据库 | SQLite（sql.js WASM）+ Drizzle ORM |
| 表单 | React Hook Form + Zod |
| 测试 | Playwright（E2E） |
| 包管理 | pnpm |

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

项目使用 SQLite（sql.js WASM），数据库文件为 `data/cim.db`，首次启动时自动创建并填充种子数据。

```bash
# 重建数据库（清空所有数据，重新初始化）
rm -f data/cim.db
# 重启 dev server 即可，seed 脚本会自动建表+插种子数据
```

数据库通过 Drizzle ORM 访问，schema 定义在 `src/db/schema.ts`，启动时 `autoMigrate()` 会自动补列，无需手动执行 migration。

---

## 项目结构

```
CIM2.0/
├── CLAUDE.md                     # Claude Code 配置
├── docs/                         # 文档
│   ├── reference/                #   调研报告
│   └── superpowers/specs/        #   架构设计文档
├── prototypes/                   # 可交互 HTML 原型
├── project_20260526_111004/
│   └── projects/                 # 主项目代码
│       ├── package.json
│       ├── playwright.config.ts
│       ├── scripts/              #   启停脚本
│       ├── e2e/                  #   Playwright E2E 测试
│       ├── data/                 #   SQLite 数据库文件
│       └── src/
│           ├── app/              #   Next.js 页面（App Router）
│           │   ├── api/          #     API 路由
│           │   ├── customers/    #     客户管理
│           │   ├── entities/     #     主体管理
│           │   ├── addresses/    #     地址主数据
│           │   ├── opportunities/#     商机管理
│           │   ├── quotes/       #     售前报价
│           │   ├── followup/     #     跟进记录
│           │   ├── approvals/    #     风控审批
│           │   ├── approval/     #     审批配置
│           │   ├── settings/     #     系统与权限管理
│           │   ├── mobile/       #     移动端 H5
│           │   └── contracts/    #     合同管理
│           ├── components/       #   共享组件
│           │   ├── ui/           #     shadcn/ui 组件
│           │   ├── layout/       #     全局布局
│           │   └── mobile/       #     移动端组件
│           ├── hooks/            #   自定义 Hooks
│           ├── lib/              #   类型/状态/工具
│           │   ├── types.ts      #     全部 TS 类型定义
│           │   ├── store.tsx     #     全局状态管理
│           │   ├── navigation.tsx#     导航 + 搜索配置
│           │   └── utils.ts      #     通用工具
│           └── db/               #   Drizzle ORM Schema + Seed
├── 客户主数据升级设计思想与整体逻辑.md
└── 客户主数据盘点与地址主数据设计.xlsx
```

---

## API 概览

11 个模块，完整的 RESTful CRUD：

| 模块 | 端点 |
|------|------|
| 客户管理 | `/api/customers` |
| 服务主体 | `/api/service-entities` |
| 收发货方 | `/api/shipper-consignees` |
| 地址站点 | `/api/address-sites` |
| 地址解析 | `/api/address-resolve`（高德地图） |
| 编码生成 | `/api/code-generate` |
| 商机 | `/api/opportunities` |
| 跟进 | `/api/followups` |
| 报价 | `/api/quotes` |
| 风控审批 | `/api/risk-approvals` |
| 联系人 | `/api/contacts` |

---

## 文档索引

| 文档 | 说明 |
|------|------|
| [客户主数据升级设计思想与整体逻辑](客户主数据升级设计思想与整体逻辑.md) | 产品设计思想、目标架构 |
| [地址主数据架构设计](docs/superpowers/specs/2026-06-26-地址主数据架构设计.md) | 地址统一标签模型、纠偏机制 |
| [架构设计-数据结构与菜单](docs/superpowers/specs/2026-06-25-架构设计-数据结构与菜单.md) | V1/V3 架构对比、数据模型 |
| [地址主数据管理调研报告](docs/reference/地址主数据管理调研报告.md) | 现状→改进、业务流程梳理 |
| [MDM 业界调研](docs/reference/mdm-research/) | SAP BP模型、用友金蝶、DAMA |

---

## License

Private — 内部项目，未开源。
