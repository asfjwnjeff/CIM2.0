# SAP Business Partner 模型详解

> 来源：SAP Help Portal、SAP Community、SAP S/4HANA 官方文档  
> 整理日期：2026-06-24

---

## 1. 什么是 Business Partner（BP）

Business Partner（业务伙伴）是 SAP S/4HANA 中**唯一的主导主数据对象（Leading Object）**。所有客户、供应商、联系人等外部实体都统一为 BP 进行管理，通过事务代码 `BP` 统一维护。

### 核心设计理念

```
                    Business Partner (BP) —— 唯一主导对象
                    - BP 编号（全局唯一 GUID，RAW16）
                    - 法定名称 / 地址 / 税号 / 银行（共享属性）
                    - 行业分类 / 所有权类型
                           /              \
                    Customer Role        Vendor Role
                    (FLCU00/FLCU01)      (FLVN00/FLVN01)
                    - 信用额度            - 付款条件
                    - 销售区域            - 采购组织
                    - 账户组              - 供应品类
```

---

## 2. 传统模型 vs BP 模型

### 传统 ECC 模型（分离式）

在 SAP ECC 中，客户和供应商是**完全独立的两套主数据**：

| 客户 | 供应商 |
|------|--------|
| 表：KNA1（一般数据）、KNB1（公司代码）、KNVV（销售） | 表：LFA1、LFB1、LFM1 |
| 事务代码：XD01/VD01/FD01 | 事务代码：XK01/MK01/FK01 |
| 独立编号段 | 独立编号段 |

### 统一 BP 模型（S/4HANA）

```
BP 主导层（直接维护）
  ├── BUT000 (BP 主表 -- 通用数据)
  ├── BUT020 / ADRC (地址)
  ├── BUT0BK (银行)
  └── BUT100 (角色: FLCU00/FLVN00 等)
         │
         ▼ CVI 实时同步（同一 LUW）
兼容层（只读/间接填充）
  ├── CVI_CUST_LINK (BP GUID ↔ KUNNR)
  ├── CVI_VEND_LINK (BP GUID ↔ LIFNR)
  ├── KNA1 / KNB1 / KNVV (客户影子表)
  └── LFA1 / LFB1 / LFM1 (供应商影子表)
```

### 为什么 SAP 要做这个转变

| 传统模型的痛点 | BP 模型的优势 |
|--------------|-------------|
| 同一公司既是客户又是供应商时，必须在两套表分别维护 | 核心身份数据只存一次，角色可多选 |
| 地址变更必须在两个地方重复操作 | 任何变更自动传播到所有角色 |
| 无 360 度视图：无法看到同一公司的应收+应付完整关系 | 资金和信用团队获得完整视图 |
| 主数据维护效率低 | 效率提升约 40% |
| 事务代码分散（XD01/XK01 等） | 统一事务 `BP` 处理所有维护 |

---

## 3. BP 的核心实体

### 3.1 BP 角色（Roles）

| 角色代码 | 含义 | 适用场景 |
|----------|------|---------|
| FLCU00 | FI 客户 | 财务应收 |
| FLCU01 | 销售客户 | 销售分销 |
| FLVN00 | FI 供应商 | 财务应付 |
| FLVN01 | 采购供应商 | 物料采购 |
| BUP001 | 联系人 | 业务联系人 |

### 3.2 BP 关系（Relationships）

BP 框架原生支持复杂组织关系：
- **母公司-子公司关系**：通过 BP Relationship 建立层级
- **联系人-组织关系**：Contact Person 关联到 Organization
- **集团-成员关系**：支持企业家族树（Corporate Family Tree）

### 3.3 BP 分组（Grouping）

| 分组 | 说明 |
|------|------|
| 组织（Organization） | 企业、公司、机构 |
| 个人（Person） | 自然人 |
| 组（Group） | 人群组、家庭、联合体 |

---

## 4. CVI（Customer-Vendor Integration）

CVI 是 BP 与兼容层之间的**双向实时同步层**。

### 核心映射表

| 表名 | 用途 |
|------|------|
| CVI_CUST_LINK | BP GUID → Customer Number (KUNNR) 映射 |
| CVI_VEND_LINK | BP GUID → Vendor Number (LIFNR) 映射 |

### 同步方向

| 方向 | 源 → 目标 | 场景 |
|------|----------|------|
| CVI_01 | Customer → BP | 迁移阶段：存量客户同步为 BP |
| CVI_02 | Vendor → BP | 迁移阶段：存量供应商同步为 BP |
| CVI_03 | BP → Customer | S/4HANA 运行阶段：BP 主导 |
| CVI_04 | BP → Vendor | S/4HANA 运行阶段：BP 主导 |

**同步是同步的（Synchronous）**：BP 变更在同一数据库提交（LUW）内立即反映到 KNA1/LFA1。

### 号码分配策略

| 策略 | 说明 |
|------|------|
| 相同编号 | BP 编号 = KUNNR = LIFNR；要求使用外部编号分配 |
| 不同编号 | BP、Customer、Vendor 各自独立编号；通过 CVI 链接表关联 |

---

## 5. KNA1/LFA1 在 S/4HANA 中的状态

| 维度 | 状态 |
|------|------|
| 物理存在 | **是**，仍然以透明表形式存在 |
| 直接维护 | **不允许**，必须通过事务 BP 或 BP API |
| 读取 | **可以**，现有报表和接口仍可 SELECT |
| 直接写入 | **严禁**，会绕过 CVI 同步导致数据不一致 |

---

## 6. 对 CIM2.0 的启示

1. **BP 模型是最成熟的"统一入口+角色标签"模式**：CIM 当前的"签约主体/服务主体/结算主体"本质上就是 BP 的角色标签

2. **CVI 的映射思路可直接借鉴**：如果未来 COS 等下游系统有自己的编码体系，CIM 生成新编码的同时保留旧系统映射——这正是 CVI_CUST_LINK 的作用

3. **BP 分组（Organization/Person/Group）对 CIM 的借鉴**：半导体供应链中，"收发货方"可能是 Organization（工厂）、也可能是 Person（指定收货人），需要统一建模

4. **KNA1 不删但不直接维护**：为 COS 等下游系统预留兼容层，不强制下游立刻改字段

---

## 7. 关键 SAP Notes 参考

| Note | 描述 |
|------|------|
| 2265093 | Business Partner Approach（中心 Note） |
| 2417298 | 通过 API 创建带客户和供应商角色的 BP |
| 2363892 | 将客户和供应商合并为一个 BP（合并重复 BP） |
| 3147029 | CVI 驾驶舱和 TCI for CVI |
