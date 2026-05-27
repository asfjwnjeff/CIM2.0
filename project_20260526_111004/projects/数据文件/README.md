# 示例数据文件说明

**版本**: v2.0.0  
**最后更新**: 2024-12

---

## 目录结构

```
数据文件/
├── README.md                    # 本说明文档
├── customers.csv                # 客户数据
├── billing_entities.csv         # 账单主体数据
├── billing_rules.csv            # 账单规则数据
├── opportunities.csv            # 商机数据
├── approvals.csv                # 风控审批数据
├── contracts.csv                # 合同数据
├── followup.csv                 # 客户跟进数据
├── split_fields.csv             # 拆分字段数据
└── audit_logs.csv               # 操作日志数据
```

---

## 数据文件说明

### 1. customers.csv - 客户数据

**包含字段**:
- `id`: 客户唯一标识
- `name`: 客户名称
- `erpCustomerId`: ERP客户ID
- `status`: 状态 (active/正常, inactive/停用)
- `unifiedSocialCreditCode`: 统一社会信用代码
- `industryChainLevel`: 产业链层级 (upstream/上游, midstream/中游, downstream/下游)
- `industryChainRole`: 产业链角色 (JSON数组)
- `industryTags`: 行业标签 (JSON数组)
- `remark`: 备注
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

**示例数据**: 6个客户，包括应用材料、飞雅贸易、荏原、苏斯贸易、昇先创、上海华力

---

### 2. billing_entities.csv - 账单主体数据

**包含字段**:
- `id`: 账单主体唯一标识
- `name`: 主体名称
- `code`: 主体代码
- `taxpayerId`: 纳税人识别号
- `status`: 状态 (active/正常, inactive/停用)
- `settlementEntity`: 结算主体
- `createdAt`: 创建时间

**示例数据**: 23个账单主体，包括各客户的不同部门和代码

---

### 3. billing_rules.csv - 账单规则数据

**包含字段**:
- `id`: 规则唯一标识
- `name`: 规则名称
- `customerId`: 关联客户ID
- `customerName`: 关联客户名称
- `priority`: 优先级 (数字越小优先级越高)
- `targetBillingEntity`: 目标账单主体
- `status`: 状态 (active/启用, inactive/停用)
- `remark`: 备注
- `createdAt`: 创建时间
- `createdBy`: 创建人

**示例数据**: 14条规则，包括应用材料的复杂规则组合和其他客户的简单规则

---

### 4. opportunities.csv - 商机数据

**包含字段**:
- `id`: 商机唯一标识
- `name`: 商机名称
- `customerId`: 关联客户ID
- `customerName`: 关联客户名称
- `amount`: 商机金额
- `stage`: 商机阶段
- `owner`: 负责人
- `status`: 状态
- `expectedCloseDate`: 预计成交日期
- `description`: 描述
- `createdAt`: 创建时间

**示例数据**: 5个商机，包括应用材料、飞雅贸易、荏原、昇先创、上海华力的商机

---

### 5. approvals.csv - 风控审批数据

**包含字段**:
- `id`: 风控记录唯一标识
- `customerId`: 关联客户ID
- `customerName`: 关联客户名称
- `riskType`: 风险类型
- `riskLevel`: 风险等级 (low/低, medium/中, high/高)
- `occurrenceDate`: 发生日期
- `status`: 状态
- `owner`: 负责人
- `description`: 风险描述
- `measures`: 处理措施
- `createdAt`: 创建时间

**示例数据**: 3条风控记录，包括低、中、高风险等级

---

### 6. contracts.csv - 合同数据

**包含字段**:
- `id`: 合同唯一标识
- `contractNumber`: 合同编号
- `name`: 合同名称
- `customerId`: 关联客户ID
- `customerName`: 关联客户名称
- `amount`: 合同金额
- `signer`: 签署人
- `status`: 状态 (draft/草稿, pending/审批中, signing/待签署, active/已生效, archived/已归档)
- `createdAt`: 创建时间

**示例数据**: 4个合同，包括草稿、审批中、待签署、已生效状态

---

### 7. followup.csv - 客户跟进数据

**包含字段**:
- `id`: 跟进记录唯一标识
- `customerId`: 关联客户ID
- `customerName`: 关联客户名称
- `type`: 跟进类型 (电话/邮件/会面/其他)
- `followupTime`: 跟进时间
- `owner`: 负责人
- `status`: 状态 (进行中/已完成)
- `nextFollowupTime`: 下次跟进时间
- `content`: 跟进内容
- `summary`: 纪要
- `createdAt`: 创建时间

**示例数据**: 3条跟进记录，包括会面、电话、邮件类型

---

### 8. split_fields.csv - 拆分字段数据

**包含字段**:
- `id`: 字段唯一标识
- `name`: 字段名称
- `fieldKey`: 字段标识
- `type`: 字段类型 (text/select/multiselect/number/date)
- `options`: 选项 (JSON数组)
- `required`: 是否必填
- `category`: 分类 (billing/business/semiconductor)
- `status`: 状态 (active/启用, inactive/停用)
- `createdAt`: 创建时间

**示例数据**: 46个字段，分为3类：
- 账单拆分字段 (6个)
- 工商档案字段 (26个)
- 半导体产业链字段 (4个)

---

### 9. audit_logs.csv - 操作日志数据

**包含字段**:
- `id`: 日志唯一标识
- `action`: 操作类型
- `target`: 操作目标
- `details`: 操作详情
- `operator`: 操作人
- `timestamp`: 操作时间

**示例数据**: 10条操作日志，包括创建客户、更新客户、创建规则、启用规则、创建商机、更新商机、创建跟进、创建合同、创建风控、解决风控

---

## 数据关系图

```
customers (客户)
  ├── billing_entities (账单主体) - 多对多
  ├── billing_rules (账单规则) - 一对多
  ├── opportunities (商机) - 一对多
  ├── approvals (风控审批) - 一对多
  ├── contracts (合同) - 一对多
  ├── followup (客户跟进) - 一对多
  └── audit_logs (操作日志) - 一对多

split_fields (拆分字段) - 独立配置表
```

---

## 使用说明

### 导入数据库

可以将这些CSV文件导入到任何支持CSV的数据库系统中。

#### SQLite 示例

```sql
-- 创建表
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  name TEXT,
  erpCustomerId TEXT,
  status TEXT,
  unifiedSocialCreditCode TEXT,
  industryChainLevel TEXT,
  industryChainRole TEXT,
  industryTags TEXT,
  remark TEXT,
  createdAt TEXT,
  updatedAt TEXT
);

-- 导入数据
.mode csv
.import customers.csv customers
```

#### PostgreSQL 示例

```sql
-- 创建表
CREATE TABLE customers (
  id VARCHAR PRIMARY KEY,
  name VARCHAR,
  erpCustomerId VARCHAR,
  status VARCHAR,
  unifiedSocialCreditCode VARCHAR,
  industryChainLevel VARCHAR,
  industryChainRole JSON,
  industryTags JSON,
  remark TEXT,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);

-- 导入数据
COPY customers FROM '/path/to/customers.csv' WITH (
  FORMAT csv,
  HEADER,
  DELIMITER ',',
  ENCODING 'UTF8'
);
```

### Excel 使用

直接用Excel打开CSV文件即可查看和编辑数据。

---

## 注意事项

1. **JSON字段**: `industryChainRole`、`industryTags`、`options` 字段存储为JSON字符串，导入时需要解析
2. **日期格式**: 所有日期时间字段格式为 `YYYY-MM-DD HH:MM:SS`
3. **编码**: 所有CSV文件使用UTF-8编码
4. **分隔符**: 使用逗号(,)作为字段分隔符
5. **关联关系**: 注意各表之间的ID关联关系

---

## 数据更新记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v2.0.0 | 2024-12 | 初始版本，包含完整示例数据 |

---

**文档结束**
