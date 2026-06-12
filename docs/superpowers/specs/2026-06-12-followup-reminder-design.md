# 跟进提醒通知 — 功能设计文档

> 日期：2026-06-12 | 状态：待开发

## 1. 概述

客户管理系统中已有客户等级字段（K/A/B/C/D），每个等级应有不同的跟进频率要求。当一定时间未对某客户进行跟进时，系统自动提醒对应的负责人和协同人。

## 2. 等级-天数映射

| 等级 | 跟进频率（默认） | 说明 |
|:--:|:--:|------|
| K | 5 天 | 最高优先级 |
| A | 10 天 | 高优先级 |
| B | 20 天 | 中优先级 |
| C | 30 天 | 标准 |
| D | 60 天 | 低优先级 |

映射关系存储在数据库中，管理员可通过系统设置页面修改。

## 3. 提醒计算逻辑

```
输入：所有 status = 'active' 的客户
对于每个客户：
  ├── 查找该客户最近一条 followUpDate 不为空的跟进记录
  ├── 存在跟进记录 → 基准日期 = max(followUpDate)
  ├── 不存在跟进记录 → 基准日期 = 客户的 updatedAt（status 变更为 active 时自动更新此字段）
  ├── 逾期天数 = 今天 - 基准日期
  └── 如果 逾期天数 >= 该客户等级对应的天数 → 触发提醒
```

提醒对象列表：`customer.responsiblePersons ∪ customer.collaborators`

特殊情况处理：
- 草稿状态客户（status='draft'）不参与计算
- 客户等级未设置或等级在配置中不存在时，默认按 D 级（60 天）处理
- 同一客户同时在多个人的提醒列表中（如负责人和协同人同时被提醒）

## 4. UI 设计

### 4.1 Bell 图标红点

- 位置：AppLayout 右上角 Header 中的 Bell 图标
- 当前状态：有空壳 UI 但无功能（`components/layout/AppLayout.tsx:167`）
- 改动：Bell 图标右上角叠加红色数字 badge，数值 = 当前登录用户相关的超期客户数
- 更新频率：每次页面加载/路由切换时重新计算

### 4.2 Bell 下拉提醒列表

- 点击 Bell 图标展开 Popover 面板
- 每行显示：客户名称 | 等级标签 | 上次跟进日期 | 已逾期 X 天
- 点击某行跳转到该客户详情页（`/customers/{id}`）
- 空状态：「暂无待跟进提醒」

### 4.3 首页仪表盘卡片

- 位置：首页 Dashboard（`app/page.tsx`）的新增卡片
- 标题：「待跟进提醒」
- 列表内容与 Bell 下拉一致
- 点击行跳转客户详情

## 5. 数据库

### 5.1 新增表：`followup_reminder_config`

| 列名 | 类型 | 说明 |
|------|------|------|
| id | TEXT PK | `cfg-{level}` |
| level | TEXT NOT NULL | 等级：K/A/B/C/D |
| days | INTEGER NOT NULL | 跟进频率天数 |
| updated_at | TEXT | 更新时间 |

种子数据：K=5, A=10, B=20, C=30, D=60

### 5.2 提醒数据

原型阶段不做 `followup_reminders` 持久化表。提醒数据在前端/API 层实时计算，每次请求动态生成。

## 6. API

### 新增：`GET /api/followup-reminders`

- Query: `?userId={userId}` 筛选当前用户相关的提醒
- 返回：超期客户列表，每条含客户ID、名称、等级、上次跟进日期、逾期天数
- 实现：查 customers 表 + followups 表 + reminder_config 表，内存计算过滤

### 新增：`GET/PUT /api/followup-reminder-config`

- GET：返回当前等级-天数配置
- PUT：更新配置

## 7. 系统设置页

在 `app/settings/` 下新增路由 `followup-reminder/`，页面内容：
- 简单表格：等级 | 天数 | 编辑按钮
- 编辑弹窗：输入新天数，保存调用 PUT API

## 8. 涉及文件

| 文件 | 变更类型 |
|------|----------|
| `lib/types.ts` | 新增 `FollowupReminderConfig` 类型 |
| `lib/store.tsx` | 新增提醒数据计算/状态 |
| `lib/sample-data.ts` | 新增种子配置数据 |
| `db/schema.ts` | 新增 `followupReminderConfig` 表 |
| `db/seed.ts` | 建表 + 种子数据 |
| `app/api/followup-reminders/route.ts` | **新建** - GET 提醒列表 |
| `app/api/followup-reminder-config/route.ts` | **新建** - GET/PUT 配置 |
| `components/layout/AppLayout.tsx` | Bell 图标改造 |
| `app/page.tsx` | 首页新增提醒卡片 |
| `app/settings/followup-reminder/page.tsx` | **新建** - 配置页面 |
| `e2e/` | 新增提醒相关 E2E 测试 |

## 9. 验收标准

1. 客户提交后开始计时，到达等级天数后 Bell 出现红点
2. 新建跟进记录后，该客户的提醒计时重置
3. Bell 下拉 + 首页卡片同步展示待跟进客户
4. 配置页可修改等级对应天数，修改后立即生效
5. 草稿客户不触发提醒
6. 提醒仅推送给客户的负责人和协同人
