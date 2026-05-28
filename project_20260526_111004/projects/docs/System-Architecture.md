# CIM客户信息管理系统 - 系统架构图

## 业务架构图（简洁版）

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐  ┌──────────────┐ │
│  │              CIM客户信息管理系统                              │  │ 业务协同系统 │ │
│  ├──────────────────────────────────────────────────────────────┤  ├──────────────┤ │
│  │  ┌───────────────────────────────────────────────────────┐ │  │              │ │
│  │  │  客户管理                                              │ │  │ COS订单系统  │ │
│  │  │  企业基本信息 · 工商资质全景 · 产业链定位            │ │  │              │ │
│  │  │  上下游关联 · 经营商品档案 · 客户信息配置            │ │  │ CPQ报价系统  │ │
│  │  │  账单主体配置 · 操作日志                              │ │  │              │ │
│  │  └───────────────────────────────────────────────────────┘ │  │ 权限平台    │ │
│  │  ┌───────────────────────────────────────────────────────┐ │  │              │ │
│  │  │  账单主体规则管理                                      │ │  └──────────────┘ │
│  │  │  规则创建/编辑/删除 · 优先级排序                     │ │                     │
│  │  │  条件组配置 · AND/OR逻辑 · 账单主体选择 · 规则测试  │ │                     │
│  │  └───────────────────────────────────────────────────────┘ │                     │
│  │  ┌───────────────────────────────────────────────────────┐ │                     │
│  │  │  客户信息配置管理                                      │ │                     │
│  │  │  按客户分组配置 · 账单区分字段管理 · 字段名称配置   │ │                     │
│  │  │  字段类型配置 · 可选值管理 · 字段增删改 · 与规则同步  │ │                     │
│  │  │  字段分类管理                                      │ │                     │
│  │  └───────────────────────────────────────────────────────┘ │                     │
│  │  ┌───────────────────────────────────────────────────────┐ │                     │
│  │  │  系统管理                                              │ │                     │
│  │  │  字典管理 · 权限管理 · 接口管理 · 系统设置           │ │                     │
│  │  │  角色管理 · 用户管理 · 功能权限 · 数据权限           │ │                     │
│  │  └───────────────────────────────────────────────────────┘ │                     │
│  └──────────────────────────────────────────────────────────────┘                     │
│                                                                                           │
│  交互式查看：访问 /architecture-simple.html                                                │
│                                                                                           │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 技术架构图（完整版）

### 系统架构总览

```mermaid
graph TB
    subgraph "用户接入层 (User Access Layer)"
        User[用户]
        Browser[Web浏览器]
        MobileApp[移动端APP]
    end

    subgraph "网关层 (Gateway Layer)"
        Nginx[NGINX 反向代理]
        CDN[CDN 静态资源加速]
    end

    subgraph "应用层 (Application Layer)"
        subgraph "前端应用 (Frontend)"
            NextJS[Next.js 16<br/>App Router]
            React[React 19]
            Tailwind[Tailwind CSS 4]
            shadcn[shadcn/ui 组件]
        end

        subgraph "后端服务 (Backend)"
            API[API Routes<br/>Next.js Server]
            Auth[认证授权]
            Middleware[中间件]
        end
    end

    subgraph "业务逻辑层 (Business Logic Layer)"
        CustomerService[客户管理服务]
        RuleService[规则匹配引擎]
        BillingService[账单主体服务]
        FieldService[字段配置服务]
        OrderService[订单映射服务]
        LogService[日志审计服务]
    end

    subgraph "集成服务层 (Integration Layer)"
        COSIntegration[COS 集成]
        CPQIntegration[CPQ 集成]
        LLMService[AI大模型服务<br/>火山方舟/豆包]
    end

    subgraph "数据层 (Data Layer)"
        subgraph "状态管理 (State Management)"
            Context[React Context]
            Reducer[useReducer]
        end

        subgraph "数据存储 (Data Storage)"
            MockData[Mock 数据<br/>内存存储]
            LocalStorage[LocalStorage<br/>本地缓存]
        end
    end

    User --> Browser
    User --> MobileApp

    Browser --> CDN
    Browser --> Nginx
    MobileApp --> Nginx

    CDN --> NextJS
    Nginx --> NextJS

    NextJS --> React
    React --> Tailwind
    React --> shadcn

    NextJS --> API
    API --> Auth
    API --> Middleware

    API --> CustomerService
    API --> RuleService
    API --> BillingService
    API --> FieldService
    API --> OrderService
    API --> LogService

    RuleService --> COSIntegration
    OrderService --> CPQIntegration
    CustomerService --> LLMService

    CustomerService --> Context
    RuleService --> Context
    BillingService --> Context
    FieldService --> Context
    OrderService --> Context
    LogService --> Context

    Context --> Reducer
    Context --> MockData
    Context --> LocalStorage

    style NextJS fill:#2D3BFF,stroke:#fff,stroke-width:2px,color:#fff
    style React fill:#61DAFB,stroke:#333,stroke-width:2px
    style RuleService fill:#764ba2,stroke:#fff,stroke-width:2px,color:#fff
    style LLMService fill:#ff6b6b,stroke:#fff,stroke-width:2px,color:#fff
```

## 分层架构详解

### 1. 用户接入层 (User Access Layer)

| 组件 | 说明 |
|------|------|
| **用户** | 使用系统的各类角色（管理员、操作员、查看者） |
| **Web浏览器** | 主要访问方式，支持Chrome、Firefox、Safari等现代浏览器 |
| **移动端APP** | 预留移动端接入能力 |

### 2. 网关层 (Gateway Layer)

| 组件 | 说明 |
|------|------|
| **NGINX** | 反向代理服务器，负责请求转发、负载均衡、SSL终止 |
| **CDN** | 内容分发网络，加速静态资源（JS、CSS、图片）访问 |

### 3. 应用层 (Application Layer)

#### 前端应用 (Frontend)

```mermaid
graph LR
    subgraph "Next.js 16 App Router"
        Pages[页面层<br/>app/目录]
        Components[组件层<br/>components/目录]
        Layouts[布局层<br/>layout.tsx]
    end

    subgraph "React 19"
        Hooks[React Hooks<br/>useState/useEffect]
        Context[React Context<br/>全局状态]
        ServerComponents[Server Components<br/>服务端组件]
        ClientComponents[Client Components<br/>客户端组件]
    end

    subgraph "UI组件"
        shadcn[shadcn/ui 组件]
        Tailwind[Tailwind CSS 4]
        Icons[图标库]
    end

    Pages --> Layouts
    Pages --> Components
    Components --> Hooks
    Components --> Context
    Components --> shadcn
    shadcn --> Tailwind
    Components --> Icons

    style NextJS fill:#2D3BFF,stroke:#fff,stroke-width:2px,color:#fff
```

#### 后端服务 (Backend)

```mermaid
graph LR
    subgraph "API Routes"
        CustomerAPI[客户管理API<br/>/api/customers]
        RuleAPI[规则管理API<br/>/api/rules]
        BillingAPI[账单主体API<br/>/api/billing-entities]
        FieldAPI[字段配置API<br/>/api/fields]
        OrderAPI[订单映射API<br/>/api/orders]
        LogAPI[日志审计API<br/>/api/logs]
    end

    subgraph "中间件"
        Auth[认证授权]
        CORS[CORS 处理]
        Logger[请求日志]
        ErrorHandler[错误处理]
    end

    CustomerAPI --> Auth
    RuleAPI --> Auth
    BillingAPI --> Auth
    FieldAPI --> Auth
    OrderAPI --> Auth
    LogAPI --> Auth

    CustomerAPI --> CORS
    RuleAPI --> CORS
    BillingAPI --> CORS
    FieldAPI --> CORS
    OrderAPI --> CORS
    LogAPI --> CORS

    CustomerAPI --> Logger
    RuleAPI --> Logger
    BillingAPI --> Logger
    FieldAPI --> Logger
    OrderAPI --> Logger
    LogAPI --> Logger

    CustomerAPI --> ErrorHandler
    RuleAPI --> ErrorHandler
    BillingAPI --> ErrorHandler
    FieldAPI --> ErrorHandler
    OrderAPI --> ErrorHandler
    LogAPI --> ErrorHandler
```

### 4. 业务逻辑层 (Business Logic Layer)

```mermaid
graph TB
    subgraph "业务服务"
        CustomerService[客户管理服务]
        RuleService[规则匹配引擎<br/>核心服务]
        BillingService[账单主体服务]
        FieldService[字段配置服务]
        OrderService[订单映射服务]
        LogService[日志审计服务]
    end

    subgraph "核心算法"
        PrioritySort[规则优先级排序]
        ConditionMatch[条件匹配引擎]
        LogicEvaluate[AND/OR 逻辑求值]
        FirstMatch[首次匹配返回]
    end

    RuleService --> PrioritySort
    RuleService --> ConditionMatch
    RuleService --> LogicEvaluate
    RuleService --> FirstMatch

    CustomerService --> RuleService
    OrderService --> RuleService

    style RuleService fill:#764ba2,stroke:#fff,stroke-width:2px,color:#fff
```

#### 规则匹配引擎工作流程

```mermaid
sequenceDiagram
    participant COS as COS订单系统
    participant CIM as CIM系统
    participant Rule as 规则匹配引擎
    participant DB as 数据存储

    COS->>CIM: 发送订单数据 (orderNumber, customerId, fields)
    CIM->>DB: 查询客户规则列表
    DB-->>CIM: 返回规则列表 (按优先级排序)
    CIM->>Rule: 开始规则匹配
    loop 按优先级遍历规则
        Rule->>Rule: 评估条件组 (AND/OR)
        alt 条件匹配成功
            Rule-->>CIM: 返回匹配的规则和账单主体
            break
        else 条件不匹配
            Rule->>Rule: 继续下一条规则
        end
    end
    alt 找到匹配规则
        CIM->>DB: 保存OrderMapping记录
        CIM-->>COS: 返回账单主体信息
    else 未找到匹配规则
        CIM-->>COS: 返回默认账单主体或错误
    end
```

### 5. 集成服务层 (Integration Layer)

```mermaid
graph TB
    subgraph "外部系统集成"
        COS[COS 订单系统]
        CPQ[CPQ 报价系统]
        LLM[AI大模型<br/>火山方舟/豆包]
    end

    subgraph "CIM 集成接口"
        COSAPI[COS 集成接口]
        CPQAPI[CPQ 集成接口]
        LLMAPI[AI 服务接口]
    end

    COS --> COSAPI
    CPQ --> CPQAPI
    LLM --> LLMAPI

    subgraph "集成方向"
        COSPull[CIM 主动调用 COS<br/>获取字段清单]
        COSPush[COS 调用 CIM<br/>获取字段配置/发送订单]
        CPQPush[CPQ 调用 CIM<br/>获取规则/查询映射]
    end

    COSAPI --> COSPull
    COSAPI --> COSPush
    CPQAPI --> CPQPush

    style LLM fill:#ff6b6b,stroke:#fff,stroke-width:2px,color:#fff
```

#### 系统交互时序图

```mermaid
sequenceDiagram
    participant User as 用户
    participant CIM as CIM客户信息管理系统
    participant COS as COS订单系统
    participant CPQ as CPQ报价系统

    Note over User,CPQ: 初始化阶段
    User->>CIM: 配置账单拆分规则
    User->>CIM: 配置客户信息字段
    CIM->>COS: 主动调用获取字段清单
    COS-->>CIM: 返回字段清单

    Note over User,CPQ: 订单处理阶段
    User->>COS: 创建订单
    COS->>CIM: 获取客户字段配置
    CIM-->>COS: 返回字段配置
    User->>COS: 录入字段值 (Plant, Location, 部门)
    COS->>CIM: 发送订单和字段值
    CIM->>CIM: 规则匹配
    CIM-->>COS: 返回账单主体
    CIM->>CIM: 记录订单映射

    Note over User,CPQ: CPQ查询阶段
    CPQ->>CIM: 获取账单主体规则
    CIM-->>CPQ: 返回规则列表
    CPQ->>CIM: 查询订单映射
    CIM-->>CPQ: 返回映射结果
```

### 6. 数据层 (Data Layer)

```mermaid
graph LR
    subgraph "状态管理"
        AppContext[AppContext<br/>全局状态]
        useReducer[useReducer<br/>状态更新]
    end

    subgraph "数据存储"
        MockData[Mock 数据<br/>sample-data.ts]
        LocalStorage[LocalStorage<br/>浏览器缓存]
    end

    subgraph "数据类型"
        Types[TypeScript 类型定义<br/>types.ts]
    end

    AppContext --> useReducer
    AppContext --> MockData
    AppContext --> LocalStorage
    MockData --> Types
    LocalStorage --> Types

    style MockData fill:#4CAF50,stroke:#fff,stroke-width:2px,color:#fff
```

## 技术栈详解

### 前端技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| **Next.js** | 16 | React框架，App Router |
| **React** | 19 | UI库 |
| **TypeScript** | 5 | 类型安全 |
| **Tailwind CSS** | 4 | 原子化CSS |
| **shadcn/ui** | - | UI组件库 |

### 后端技术栈

| 技术 | 说明 |
|------|------|
| **Next.js API Routes** | 服务端API |
| **Node.js** | 运行环境 |
| **React Context + useReducer** | 状态管理 |

### 开发工具

| 工具 | 说明 |
|------|------|
| **pnpm** | 包管理器 |
| **coze CLI** | 项目管理 |
| **ESLint** | 代码检查 |
| **TypeScript Compiler** | 类型检查 |

## 部署架构

```mermaid
graph TB
    subgraph "开发环境 (Development)"
        Dev[开发服务器<br/>coze dev]
        HotReload[热更新 HMR]
        Dev --> HotReload
    end

    subgraph "生产环境 (Production)"
        Build[构建阶段<br/>coze build]
        Run[运行阶段<br/>coze start]
        Build --> Run
    end

    subgraph "沙箱环境 (Sandbox)"
        Port5000[端口 5000]
        StaticServer[静态文件服务]
        APIServer[API服务]
        Port5000 --> StaticServer
        Port5000 --> APIServer
    end

    Dev --> Sandbox
    Run --> Sandbox
```

## 目录结构架构

```mermaid
graph TB
    subgraph "项目根目录"
        Root["/workspace/projects/"]
        Coze[".coze<br/>配置文件"]
        Package["package.json<br/>依赖配置"]
        TsConfig["tsconfig.json<br/>TS配置"]
        Tailwind["tailwind.config.ts<br/>Tailwind配置"]
        Public["public/<br/>静态资源"]
        Src["src/<br/>源代码"]
        Docs["docs/<br/>文档"]
    end

    subgraph "源代码目录"
        App["src/app/<br/>页面路由"]
        Components["src/components/<br/>组件"]
        Lib["src/lib/<br/>工具库"]
    end

    subgraph "页面路由"
        PageIndex["page.tsx<br/>首页"]
        PageCustomers["customers/<br/>客户管理"]
        PageRules["rules/<br/>规则管理"]
        PageBillingFields["billing-fields/<br/>字段配置"]
        PageOrders["orders/<br/>订单映射"]
        PageSettings["settings/<br/>系统设置"]
        PagePermissions["permissions/<br/>权限管理"]
        PageApi["api/<br/>API路由"]
    end

    subgraph "工具库"
        Types["types.ts<br/>类型定义"]
        Store["store.tsx<br/>状态管理"]
        SampleData["sample-data.ts<br/>示例数据"]
    end

    Root --> Coze
    Root --> Package
    Root --> TsConfig
    Root --> Tailwind
    Root --> Public
    Root --> Src
    Root --> Docs

    Src --> App
    Src --> Components
    Src --> Lib

    App --> PageIndex
    App --> PageCustomers
    App --> PageRules
    App --> PageBillingFields
    App --> PageOrders
    App --> PageSettings
    App --> PagePermissions
    App --> PageApi

    Lib --> Types
    Lib --> Store
    Lib --> SampleData
```

## 安全架构

```mermaid
graph LR
    subgraph "安全层"
        Auth[认证授权]
        CORS[CORS 安全策略]
        Input[输入验证]
        XSS[XSS 防护]
        Log[操作日志]
    end

    subgraph "数据安全"
        Masking[敏感数据脱敏]
        Audit[审计日志]
        Backup[数据备份]
    end

    Auth --> Masking
    CORS --> XSS
    Input --> XSS
    Log --> Audit
    Audit --> Backup
```

## 性能优化策略

```mermaid
graph TB
    subgraph "前端优化"
        SSR[服务端渲染 SSR]
        CodeSplit[代码分割]
        LazyLoad[懒加载]
        Cache[缓存策略]
    end

    subgraph "后端优化"
        API[API 优化]
        Compress[数据压缩]
        Stream[流式响应]
    end

    SSR --> CodeSplit
    CodeSplit --> LazyLoad
    LazyLoad --> Cache
    API --> Compress
    API --> Stream
```

## 扩展架构

```mermaid
graph TB
    subgraph "当前系统"
        CIM[CIM核心系统]
    end

    subgraph "未来扩展"
        Database[(数据库<br/>PostgreSQL)]
        Cache[(缓存<br/>Redis)]
        MessageQueue[消息队列]
        Analytics[数据分析]
        AI[AI增强功能]
    end

    CIM -.-> Database
    CIM -.-> Cache
    CIM -.-> MessageQueue
    CIM -.-> Analytics
    CIM -.-> AI
```

---

**文档版本**: v1.0  
**最后更新**: 2026-04-23  
**系统名称**: CIM客户信息管理系统
