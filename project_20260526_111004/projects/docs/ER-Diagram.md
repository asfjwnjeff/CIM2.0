# CIM客户信息管理系统 - 数据模型ER图

## 实体关系图 (Mermaid)

```mermaid
erDiagram
    %% 核心实体
    Customer ||--o{ BillingEntity : "拥有(关联)"
    Customer ||--o{ BillingRule : "配置"
    Customer ||--o{ OrderMapping : "产生"
    Customer ||--o{ RelatedCompany : "关联"
    Customer ||--o{ CompanyProduct : "经营"
    Customer ||--o{ AuditLog : "被审计"
    Customer ||--o{ OperationLog : "被操作"

    BillingRule }o--|| BillingEntity : "目标主体"

    OrderMapping }o--|| Customer : "属于"
    OrderMapping }o--|| BillingEntity : "映射到"
    OrderMapping }o--|| BillingRule : "匹配规则"

    SystemField ||--o{ SplitField : "系统定义"

    User ||--o{ AuditLog : "执行"
    User ||--o{ OperationLog : "执行"

    %% 客户实体
    Customer {
        string id PK "客户ID"
        string name "客户名称"
        string erpCustomerId "ERP客户ID"
        string signingEntity "签约主体"
        string serviceEntity "服务主体"
        string[] billingEntities "账单主体ID列表"
        string[] ruleIds "拆分规则ID列表"
        Status status "状态"
        CompanyBasicInfo basicInfo "基本信息"
        CompanyBusinessInfo businessInfo "工商信息"
        CompanySemiconductorInfo semiconductorInfo "产业链信息"
        RelatedCompany[] relatedCompanies "关联企业"
        CompanyProduct[] products "经营商品"
        AuditLog[] auditLogs "审计日志"
        string createdAt "创建时间"
        string updatedAt "更新时间"
    }

    %% 账单主体
    BillingEntity {
        string id PK "账单主体ID"
        string name "名称"
        string code "编码"
        string taxId "税号"
        string settlementEntity "结算主体"
        Status status "状态"
        string createdAt "创建时间"
    }

    %% 账单拆分规则
    BillingRule {
        string id PK "规则ID"
        string customerId FK "客户ID"
        string customerName "客户名称"
        string name "规则名称"
        int priority "优先级"
        RuleGroup conditionGroup "条件组"
        string targetBillingEntity "目标主体名称"
        string targetBillingEntityId FK "目标主体ID"
        Status status "状态"
        string remark "备注"
        string createdAt "创建时间"
        string updatedAt "更新时间"
        string createdBy "创建人"
    }

    %% 条件组
    RuleGroup {
        string id PK "分组ID"
        LogicType logic "逻辑关系(AND/OR)"
        RuleItem[] items "条件项列表"
    }

    %% 订单映射
    OrderMapping {
        string id PK "映射ID"
        string orderNumber "COS订单号"
        string customerId FK "客户ID"
        string customerName "客户名称"
        json splitParams "拆分参数"
        string billingEntityId FK "账单主体ID"
        string billingEntityName "账单主体名称"
        string matchedRuleId FK "匹配规则ID"
        string matchedRuleName "匹配规则名称"
        string splitAt "拆分时间"
        string operator "操作人"
        string status "状态"
        string errorMessage "错误信息"
    }

    %% 拆分字段（客户级）
    SplitField {
        string id PK "字段ID"
        string name "显示名称"
        string fieldKey "字段标识"
        FieldType type "字段类型"
        string[] options "可选值"
        boolean required "是否必填"
        FieldCategory category "字段分类"
        string[] relatedBusinessSystems "关联系统"
        string[] validationRules "校验规则"
        int version "版本号"
    }

    %% 系统字段（系统级）
    SystemField {
        string id PK "字段ID"
        string field "字段标识"
        string label "显示名称"
        string type "类型"
        string[] options "可选值"
        string description "描述"
        boolean required "是否必填"
        Status status "状态"
    }

    %% 用户
    User {
        string id PK "用户ID"
        string name "用户名"
        string role "角色"
        string avatar "头像"
    }

    %% 审计日志
    AuditLog {
        string id PK "日志ID"
        string timestamp "时间戳"
        string operator "操作人"
        string operatorId "操作人ID"
        string action "操作类型"
        string targetType "目标类型"
        string targetId "目标ID"
        string targetName "目标名称"
        string fieldName "字段名"
        json oldValue "旧值"
        json newValue "新值"
        string details "详情"
        string customerId FK "客户ID"
        string ipAddress "IP地址"
    }

    %% 操作日志
    OperationLog {
        string id PK "日志ID"
        string timestamp "时间戳"
        string operator "操作人"
        string action "操作"
        string target "目标"
        string targetId "目标ID"
        string details "详情"
        string customerId FK "客户ID"
        string module "模块"
    }

    %% 关联企业
    RelatedCompany {
        string id PK "关联ID"
        string relatedCompanyId "关联企业ID"
        string relatedCompanyName "关联企业名称"
        string relation "关系类型"
        string relatedCompanyLevel "产业链层级"
        string validFrom "有效期开始"
        string validTo "有效期结束"
        string createdAt "创建时间"
    }

    %% 经营商品
    CompanyProduct {
        string id PK "商品ID"
        string productName "商品名称"
        string productCode "商品编码"
        string customsDeclarationElements "报关要素"
        string origin "产地"
        string industryChainCategory "产业链分类"
        string relatedBillingEntityId "关联账单主体ID"
        string relatedBillingEntityName "关联账单主体名称"
        string createdAt "创建时间"
    }

    %% 行业标签
    IndustryTag {
        string id PK "标签ID"
        string name "标签名称"
        string category "分类"
    }
```

## 实体说明

### 核心实体

#### 1. Customer (客户)
- **主键**: `id`
- **描述**: 系统的核心实体，存储客户的所有信息
- **关系**:
  - 拥有多个 BillingEntity
  - 配置多个 BillingRule
  - 产生多个 OrderMapping
  - 关联多个 RelatedCompany
  - 经营多个 CompanyProduct
  - 被审计日志记录

#### 2. BillingEntity (账单主体)
- **主键**: `id`
- **描述**: 账单拆分的目标主体，如FWD-8635等
- **关系**:
  - 被多个 BillingRule 指向
  - 被多个 OrderMapping 指向

#### 3. BillingRule (账单拆分规则)
- **主键**: `id`
- **描述**: 定义如何将订单拆分到不同账单主体的规则
- **关系**:
  - 属于一个 Customer
  - 指向一个 BillingEntity
  - 被多个 OrderMapping 匹配

#### 4. OrderMapping (订单映射)
- **主键**: `id`
- **描述**: 记录订单与账单主体的匹配结果
- **关系**:
  - 属于一个 Customer
  - 映射到一个 BillingEntity
  - 匹配一个 BillingRule

### 配置实体

#### 5. SplitField (拆分字段 - 客户级)
- **主键**: `id`
- **描述**: 客户自定义的拆分字段配置

#### 6. SystemField (系统字段 - 系统级)
- **主键**: `id`
- **描述**: 系统预定义的拆分字段模板
- **关系**: 被 SplitField 引用

### 业务实体

#### 7. RelatedCompany (关联企业)
- **主键**: `id`
- **描述**: 客户的上下游关联企业
- **关系**: 属于一个 Customer

#### 8. CompanyProduct (经营商品)
- **主键**: `id`
- **描述**: 客户经营的商品档案
- **关系**: 属于一个 Customer

#### 9. IndustryTag (行业标签)
- **主键**: `id`
- **描述**: 行业分类标签

### 日志与用户

#### 10. User (用户)
- **主键**: `id`
- **描述**: 系统用户
- **关系**: 执行多个 AuditLog 和 OperationLog

#### 11. AuditLog (审计日志)
- **主键**: `id`
- **描述**: 详细的字段级变更记录
- **关系**:
  - 属于一个 User
  - 属于一个 Customer

#### 12. OperationLog (操作日志)
- **主键**: `id`
- **描述**: 简化的操作记录
- **关系**:
  - 属于一个 User
  - 属于一个 Customer

## 枚举类型

### Status (状态)
- `active` - 激活
- `inactive` - 停用

### LogicType (逻辑类型)
- `AND` - 与
- `OR` - 或

### FieldType (字段类型)
- `text` - 文本
- `select` - 单选
- `multiselect` - 多选
- `date` - 日期
- `number` - 数字

### FieldCategory (字段分类)
- `all` - 全部
- `billing` - 账单
- `business` - 业务
- `semiconductor` - 半导体

### Operator (操作符)
- `equals` - 等于
- `not_equals` - 不等于
- `contains` - 包含
- `not_contains` - 不包含
- `in` - 在列表中
- `not_in` - 不在列表中
- `regex` - 正则匹配
- `any` - 任意值
- `empty` - 为空
- `not_empty` - 不为空

## 数据流向

```
COS订单录入
    ↓
传入拆分参数字段 (Plant, Location, 客户部门等)
    ↓
BillingRule 规则匹配 (按优先级)
    ↓
匹配成功 → OrderMapping 记录结果
    ↓
目标 BillingEntity
    ↓
CPQ 获取账单主体信息
```

## 关键业务流程

### 1. 账单拆分流程
```
1. COS 调用 CIM 获取字段配置
2. 用户在 COS 中输入字段值
3. COS 发送订单和字段值到 CIM
4. CIM 按优先级匹配 BillingRule
5. 返回匹配的 BillingEntity
6. 记录 OrderMapping
```

### 2. 规则配置流程
```
1. 选择客户
2. 创建/编辑 BillingRule
3. 设置优先级
4. 配置条件组 (支持嵌套 AND/OR)
5. 选择目标 BillingEntity
6. 保存并激活规则
```
