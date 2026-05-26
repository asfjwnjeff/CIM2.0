# CIM 对外接口 API 文档

## 概述

- **Base URL**: `http://43.240.126.20:51466/prod-api`
- **认证方式**: JWT Token（Bearer Token）
- **Content-Type**: `application/json`

---

## 鉴权说明

三个接口均为**开放接口**，无需携带 Token 即可直接调用。

---

## 接口列表

### 1. 查询客户字段信息

获取指定客户关联的全部字段配置，包含字段基础属性及可选枚举值。

**GET** `/v1/fields/{customerCode}`

#### 路径参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| customerCode | String | 是 | 客户编码，如 `AMTS` |

#### 响应示例

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": [
        {
            "fieldCode": "department",
            "fieldName": "客户部门",
            "fieldType": "string",
            "controlType": "select_single",
            "required": 0,
            "sort": 1,
            "options": [
                { "label": "FWD", "value": "FWD" },
                { "label": "TKM", "value": "TKM" },
                { "label": "RVC", "value": "RVC" }
            ],
            "optionsSource": "customer"
        },
        {
            "fieldCode": "plant",
            "fieldName": "Plant",
            "fieldType": "string",
            "controlType": "select_single",
            "required": 0,
            "sort": 2,
            "options": [
                { "label": "8635", "value": "8635" },
                { "label": "8639", "value": "8639" },
                { "label": "8641", "value": "8641" },
                { "label": "8644", "value": "8644" },
                { "label": "8603", "value": "8603" },
                { "label": "8642", "value": "8642" },
                { "label": "8646", "value": "8646" },
                { "label": "8645", "value": "8645" },
                { "label": "8634", "value": "8634" },
                { "label": "8655", "value": "8655" },
                { "label": "8601", "value": "8601" },
                { "label": "8661", "value": "8661" },
                { "label": "8693", "value": "8693" }
            ],
            "optionsSource": "customer"
        },
        {
            "fieldCode": "location",
            "fieldName": "Location",
            "fieldType": "string",
            "controlType": "select_single",
            "required": 0,
            "sort": 3,
            "options": [
                { "label": "0002", "value": "0002" },
                { "label": "0004", "value": "0004" }
            ],
            "optionsSource": "customer"
        },
        {
            "fieldCode": "quotation",
            "fieldName": "报价单类型",
            "fieldType": "string",
            "controlType": "select_single",
            "required": 0,
            "sort": 4,
            "options": [
                { "label": "单独报价单", "value": "单独报价单" }
            ],
            "optionsSource": "customer"
        },
        {
            "fieldCode": "billingEntity",
            "fieldName": "账单主体",
            "fieldType": "string",
            "controlType": "select_single",
            "required": 0,
            "sort": 5,
            "options": [
                { "label": "FWD-8635", "value": "FWD-8635" },
                { "label": "FWD-8639&8641", "value": "FWD-8639&8641" },
                { "label": "FWD-8644", "value": "FWD-8644" },
                { "label": "TKM-8603", "value": "TKM-8603" },
                { "label": "RVC-35830", "value": "RVC-35830" },
                { "label": "RVC-340453", "value": "RVC-340453" },
                { "label": "FWD", "value": "FWD" }
            ],
            "optionsSource": "customer"
        }
    ]
}
```

#### 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| fieldCode | String | 字段编码（唯一标识） |
| fieldName | String | 字段名称（中文显示） |
| fieldType | String | 数据类型：`string` / `number` / `date` / `boolean` |
| controlType | String | 控件类型：`input` / `textarea` / `select_single` / `select_multi` / `date_picker` / `number_input` |
| required | Integer | 是否必填：`0`-否，`1`-是 |
| sort | Integer | 排序序号 |
| options | Array | 可选枚举值列表，每项含 `label`（显示文本）和 `value`（实际值） |
| optionsSource | String | 选项来源：`customer`-客户级覆盖，`default`-字段默认值，`none`-无选项 |

#### 错误码

| HTTP状态码 | code | 说明 |
|------------|------|------|
| 404 | 404 | 客户不存在 |
| 401 | — | 未认证或Token失效 |

---

### 2. 规则匹配

根据分类编码和业务字段进行规则匹配，返回匹配后的输出字段。

**POST** `/v1/{categoryCode}/match`

#### 路径参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| categoryCode | String | 是 | 分类编码，如 `billing_distinction` |

#### 请求体

```json
{
    "customerCode": "AMTS",
    "customerName": null,
    "fieldValues": {
        "dn": "DN20260518001",
        "department": "FWD",
        "quotation": "单独报价单",
        "plant": "8635",
        "location": "0001"
    }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| customerCode | String | 否* | 客户代码，优先使用 |
| customerName | String | 否* | 客户名称，customerCode为空时使用 |
| fieldValues | Map | 是 | 待验证的业务字段，key为字段编码，value为字段值 |

> **\*注意**：`customerCode` 和 `customerName` 至少填写一个，两者均为空时接口返回错误。

#### 查询优先级

1. 若 `customerCode` 非空 → 使用 **分类编码 + 客户编码** 查询匹配规则
2. 若 `customerCode` 为空 → 使用 **分类编码 + 客户名称** 查询客户后匹配规则

#### 响应示例（匹配成功）

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": {
        "matched": true,
        "outputs": {
            "billingEntity": "FWD-8635"
        },
        "ruleName": "FWD-8635计费区分规则"
    }
}
```

#### 响应示例（未匹配）

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": {
        "matched": false
    }
}
```

#### 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| matched | Boolean | 是否匹配成功 |
| outputs | Map | 匹配成功时返回，输出字段映射（key为字段编码，value为输出值） |
| ruleName | String | 匹配成功时返回，命中的规则名称 |

#### 错误码

| HTTP状态码 | code | 说明 |
|------------|------|------|
| 400 | 500 | 分类编码为空 / 待验证业务字段为空 / 客户代码与客户名称同时为空 |
| 404 | 404 | 分类编码不存在 / 客户不存在 |

---

### 3. 查询客户规则信息

获取指定客户关联的全部规则配置，包含条件树和输出配置。

**GET** `/v1/rules/{customerCode}`

#### 路径参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| customerCode | String | 是 | 客户编码，如 `AMTS` |

#### 响应示例

> 以下示例仅列出 AMTS 客户下第 1 条规则（FWD-8635 计费区分规则）。实际响应会返回该客户名下全部规则。

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": [
        {
            "ruleName": "FWD-8635计费区分规则",
            "categoryName": "账单拆分规则",
            "customerCode": "AMTS",
            "customerName": "AMTS客户",
            "status": 1,
            "priority": 1,
            "conditions": {
                "items": [
                    {
                        "type": "condition",
                        "logicalOperator": null,
                        "sort": 1,
                        "fieldCode": "dn",
                        "fieldName": "DN单号",
                        "operator": "NOT_EMPTY",
                        "fieldValue": ""
                    },
                    {
                        "type": "condition",
                        "logicalOperator": "AND",
                        "sort": 2,
                        "fieldCode": "department",
                        "fieldName": "客户部门",
                        "operator": "EQUALS",
                        "fieldValue": "FWD"
                    },
                    {
                        "type": "condition",
                        "logicalOperator": "AND",
                        "sort": 3,
                        "fieldCode": "quotation",
                        "fieldName": "报价单类型",
                        "operator": "EQUALS",
                        "fieldValue": "单独报价单"
                    },
                    {
                        "type": "condition",
                        "logicalOperator": "AND",
                        "sort": 4,
                        "fieldCode": "plant",
                        "fieldName": "工厂",
                        "operator": "EQUALS",
                        "fieldValue": "8635"
                    },
                    {
                        "type": "condition",
                        "logicalOperator": "AND",
                        "sort": 5,
                        "fieldCode": "location",
                        "fieldName": "库位",
                        "operator": "NOT_IN_LIST",
                        "fieldValue": "[\"0002\",\"0004\"]"
                    }
                ]
            },
            "conditionText": "DN单号 不为空  且 客户部门 等于 FWD 且 报价单类型 等于 单独报价单 且 工厂 等于 8635 且 库位 不在列表中 [\"0002\",\"0004\"]",
            "outputs": [
                {
                    "fieldCode": "billingEntity",
                    "fieldName": "账单主体",
                    "outputValue": "FWD-8635",
                    "sort": 0
                }
            ]
        }
    ]
}
```

#### 响应字段说明

**规则基本信息**

| 字段 | 类型 | 说明 |
|------|------|------|
| ruleName | String | 规则名称 |
| categoryName | String | 分类名称 |
| customerCode | String | 客户编码 |
| customerName | String | 客户名称 |
| status | Integer | 状态：`0`-停用，`1`-启用 |
| priority | Integer | 优先级（数字越小越优先匹配） |
| conditions | Object | 规则条件树 |
| conditionText | String | 条件树拼接后的可读字符串 |
| outputs | Array | 规则输出列表 |

**条件树结构**

`conditions.items` 为顶层条件列表，每项类型为 `condition` 或 `group`：

| 字段 | 类型 | 条件类型 | 说明 |
|------|------|----------|------|
| type | String | 通用 | `condition`-条件，`group`-条件组 |
| logicalOperator | String | 通用 | 与前一条件的逻辑关系：`AND` / `OR`（首项为null） |
| sort | Integer | 通用 | 排序 |
| fieldCode | String | condition | 字段编码 |
| fieldName | String | condition | 字段名称 |
| operator | String | condition | 操作符：`EQUALS` / `NOT_EQUALS` / `CONTAINS` / `NOT_CONTAINS` / `IN_LIST` / `NOT_IN_LIST` / `GREATER_THAN` / `LESS_THAN` / `GREATER_EQUALS` / `LESS_EQUALS` / `STARTS_WITH` / `ENDS_WITH` / `IS_EMPTY` / `NOT_EMPTY` / `BETWEEN` |
| fieldValue | String | condition | 条件值（多值时JSON数组格式，如 `["A","B"]`） |
| items | Array | group | 子条件列表（嵌套递归结构） |

**输出列表**

| 字段 | 类型 | 说明 |
|------|------|------|
| fieldCode | String | 输出字段编码 |
| fieldName | String | 输出字段名称 |
| outputValue | String | 输出值（多值时JSON数组格式） |
| sort | Integer | 排序 |

#### 无规则时的响应

```json
{
    "code": 200,
    "msg": "该客户暂无关联规则",
    "data": []
}
```

#### 错误码

| HTTP状态码 | code | 说明 |
|------------|------|------|
| 404 | 404 | 客户不存在 |

---

### 4. 查询字段规则输出值

查询指定字段在所有规则输出中的全部不同值，返回去重后的字符串数组。

**GET** `/v1/rule-output-values/{fieldCode}`

#### 路径参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| fieldCode | String | 是 | 字段编码，如 `billingEntity` |

#### 响应示例

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": [
        "FWD-8635",
        "FWD-8639&8641",
        "FWD-8644",
        "TKM-8603",
        "RVC-35830",
        "RVC-340453",
        "FWD",
        "物流部",
        "Sales Operations Analyst部门",
        "工程师部门",
        "NNP 实验室部门",
        "TMF部门",
        "账单1",
        "账单2",
        "CMP部门",
        "COMP部门",
        "上海部",
        "德国部",
        "设备类",
        "备件类",
        "备件货",
        "闲置品",
        "分子泵",
        "工程师",
        "LAM",
        "DSC",
        "BKO项目",
        "销毁物",
        "维修件",
        "月度",
        "CC项目",
        "CT",
        "ES",
        "SR",
        "DS",
        "MT",
        "MB",
        "蚀刻部",
        "CD-SEM部",
        "NAIS",
        "NIC"
    ]
}
```

#### 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| data | Array\<String\> | 该字段在规则输出中的所有不同值（去重） |

#### 空结果时的响应

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": []
}
```

#### 错误码

| HTTP状态码 | code | 说明 |
|------------|------|------|
| 400 | 500 | 字段编码为空 |
| 404 | 404 | 字段不存在 |

---

### 5. 查询外部系统的 CIM 字段映射

供外部系统以自身 `systemCode` 为入口，反查在 CIM 中为其配置的所有字段映射关系（每条记录明确告知：CIM 侧哪个字段 ↔ 外部哪张表哪个字段）。

**GET** `/v1/external/{systemCode}/field-mappings`

#### 路径参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| systemCode | String | 是 | 外部系统编码，如 `COS` / `CPQ` / `CIS` |

#### 响应示例

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": {
        "systemCode": "COS",
        "systemName": "COS系统",
        "mappings": [
            {
                "fieldCode": "goodsAttribute",
                "fieldName": "货物属性",
                "externalTable": "order",
                "externalColumn": "goodsAttribute",
                "remark": ""
            },
            {
                "fieldCode": "plant",
                "fieldName": "Plant",
                "externalTable": "order",
                "externalColumn": "plant",
                "remark": ""
            }
        ]
    }
}
```

#### 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| systemCode | String | 外部系统编码 |
| systemName | String | 外部系统名称 |
| mappings | Array | 映射记录列表 |
| mappings[].fieldCode | String | CIM 字段编码 |
| mappings[].fieldName | String | CIM 字段名称 |
| mappings[].externalTable | String | 外部系统表名 |
| mappings[].externalColumn | String | 外部系统字段名 |
| mappings[].remark | String | 备注 |

> 仅返回 状态为启用（status=1）的 CIM 字段对应的映射。

#### 错误码

| HTTP状态码 | code | 说明 |
|------------|------|------|
| 400 | 500 | systemCode 为空 |
| 404 | 404 | 外部系统不存在或已停用 |

---

## 公共错误码

| HTTP状态码 | code | 说明 |
|------------|------|------|
| 200 | 200 | 操作成功 |
| 400 | 500 | 参数校验失败 |
| 404 | 404 | 资源不存在 |
| 500 | 500 | 服务器内部异常 |
