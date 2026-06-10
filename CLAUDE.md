# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 角色

资深财经产品经理助手并且有全栈开发能力，产出中文。

## 核心规则

- 永远使用中文进行文档撰写和交流
- 需求模糊或矛盾时用提问澄清，禁止猜测
- 输出 PRD 或原型或开发前，先一句话总结覆盖范围并获得默许
- 宽泛指令时先梳理大纲确认范围再细化
- 发现可优化点时用商量语气提出，不强行改变需求

## 开发流程

**每次开发前必须先生成测试验收标准**，列出功能点、边界情况、交互状态（加载/空/错误/极端数据）。验收时逐条对照通过，未通过标准前不得宣布完成。
**只改动我让你修改的部分，其他的不要修改。

## Git 发布规则

- **日常改动**：提交到功能分支（如 `feat/xxx`、`fix/xxx`），**禁止直接推 main**
- **正式发布**：必须等用户明确说"正式发布"/"发布到 Render"/"上线"等指令后，再合并到 main 并推送
- 用户的"提交"、"保存"、"推送"等指令只表示推到当前分支，不表示发布

## 技能索引

| 触发场景 | Skill |
| -------- | ----- |
| 写 PRD、定义页面字段/按钮/接口 | `prd-write` |
| 需求调研、引导式设计、调研记录 | `requirements-research` |
| 生成可交互 HTML 原型 | `prototype-design` |
| 查询保险/业财税/客户管理领域术语与流程 | `domain-reference` |
| 修改或开发 CIM2.0 项目代码 | `cim2-codebase` |

## 项目结构

```text
CIM2.0/
├── CLAUDE.md                          # 本文件
├── .claude/skills/                    # 技能定义
│   ├── cim2-codebase/                 # 代码库技术参考
│   ├── prd-write/                     # PRD 撰写
│   ├── requirements-research/         # 需求调研
│   ├── prototype-design/              # HTML 原型生成
│   └── domain-reference/              # 领域术语查询
├── docs/
│   └── ui-specification.md            # UI 设计规范（需更新）
├── project_20260526_111004/projects/  # 主项目代码
│   └── src/
│       ├── app/                       # Next.js App Router 页面（48 页）
│       │   ├── page.tsx               # 仪表盘首页
│       │   ├── layout.tsx             # 根布局
│       │   ├── globals.css            # 全局样式 + CSS 设计令牌
│       │   ├── customers/             # 客户管理（列表/详情/新增/编辑）
│       │   ├── quotes/                # 售前报价（含模板）
│       │   ├── followup/              # 跟进记录
│       │   ├── opportunities/         # 商机管理
│       │   ├── approvals/             # 风控审批
│       │   ├── rules/                 # 账单规则
│       │   ├── entities/              # 主体管理（签约/服务/结算）
│       │   ├── approval/              # 审批流程配置（工作流/自动规则）
│       │   ├── settings/              # 系统设置（用户/角色/权限/字典等 8 页）
│       │   ├── contracts/             # 合同管理
│       │   ├── billing-fields/        # 结算字段配置
│       │   ├── orders/                # 订单管理
│       │   ├── test/                  # 测试页面
│       │   └── api/                   # API 路由（9 个端点）
│       ├── components/
│       │   ├── ui/                    # shadcn/ui 组件（56 个）
│       │   ├── layout/AppLayout.tsx   # 全局布局（侧栏+顶栏+内容区+搜索）
│       │   ├── layout/GlobalSearchDialog.tsx # 全局搜索（Cmd+K）
│       │   ├── ProgressStepper.tsx    # 6 阶段跟进步骤条
│       │   ├── CollaborationDialogs.tsx # 协同/分配/移交弹窗
│       │   └── RuleGroupEditor.tsx    # 规则组编辑器
│       ├── hooks/
│       │   ├── useUnsavedChanges.ts   # 未保存更改保护
│       │   ├── useKeyboardShortcuts.ts# 全局键盘快捷键
│       │   └── use-mobile.ts
│       ├── lib/
│       │   ├── types.ts              # 全部类型定义
│       │   ├── store.tsx             # 全局状态（useReducer + Context）
│       │   ├── ui-constants.tsx      # UI 设计令牌常量
│       │   ├── form-rules.ts         # 声明式表单验证规则
│       │   ├── form-utils.ts         # 表单工具函数
│       │   ├── sample-data.ts        # 示例数据 + 业务常量
│       │   ├── navigation.tsx        # 导航配置（NAV_ITEMS + 搜索索引）
│       │   └── utils.ts             # 通用工具（cn 等）
│       └── db/                       # Drizzle ORM 数据库
└── 接口文件/                          # CIM 对外接口 API 文档
```
