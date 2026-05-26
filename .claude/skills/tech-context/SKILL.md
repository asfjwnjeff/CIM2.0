# CPQ Flask App 技术上下文

操作 `cpq-flask-app/` 代码时使用此 skill。

## 项目简介

CPQ 定制化账单设计器，用于从物流报关数据生成客户费用账单。三种报表类型：清单（list）、分组汇总（group）、交叉透视（cross）。

## 启动命令

```bash
cd cpq-flask-app
pip install -r requirements.txt   # flask==3.1.2, flask-sqlalchemy==3.1.1, openpyxl==3.1.5, duckdb>=1.0.0
python app.py                     # → http://127.0.0.1:5000，debug 模式
```

首次运行自动创建 `instance/cpq.db`（SQLite）并在 DuckDB 内存库中加载 mock 数据。无测试、无 CI/CD。

## 架构

**双数据库**：SQLite（SQLAlchemy ORM）存 `Template` 和 `Bill`；DuckDB 内存表 `bill_data` 通过 `sql_generator.py` 执行分析查询。

**Flask 应用工厂** (`app.py`)：注册 5 个 blueprint：

| Blueprint | 模块 | 职责 |
| ---------- | ---- | ---- |
| `views_bp` | `routes/views.py` | 页面渲染：`/`, `/designer`, `/bills` |
| `api_templates_bp` | `routes/api_templates.py` | 模板 CRUD + 复制 |
| `api_bills_bp` | `routes/api_bills.py` | 账单生成/列表/删除 + Excel 导出 |
| `api_data_bp` | `routes/api_data.py` | 字段元数据、数据预览、客户/期间列表 |
| `api_reports_bp` | `routes/api_reports.py` | 报表预览（DuckDB 查询路径） |

**Engine 层**：
- `sql_generator.py` — 前端配置 → DuckDB SQL（7 种聚合、11 种筛选运算符、递归条件树、笛卡尔展开）
- `aggregator.py` — 报表编排器，SQL + Python 分组树构建
- `excel_writer.py` — openpyxl 生成 .xlsx（斑马纹、合并单元格、千分位、冻结窗格）

**前端**：Jinja2 模板继承 `base.html`，vanilla JS。三个页面：模板画廊、账单设计器（三栏布局）、账单列表。

## 核心数据流

```
拖拽字段配置 → POST /api/reports/preview
  → aggregator → sql_generator 生成 DuckDB SQL
  → DuckDB 查询 bill_data → 结构化 JSON
  → 前端渲染预览表格
  → 生成账单: POST /api/bills → SQLite Bill(含 config_snapshot)
  → 导出: GET /api/bills/<id>/export → 重新全量查询 → excel_writer.generate_excel()
```

## 关键模型字段

**Template**：`row_fields`, `col_fields`, `value_fields`（JSON `{field, dataMode, agg, direction}`）、`filter_tree`（AND/OR条件树 JSON）、`sort_configs`、`style_config`、`fee_name_filter`（null/"all"/["费项1","费项2"]）、`is_example`

**Bill**：`config_snapshot`（生成时完整配置快照）、`status`（"generated"/"exported"）、`total_amount`

## Mock 数据

`seed_data.py`：`get_duckdb()` 全局单例，`bill_data` 表 164 行、26 列（17维度+9度量），全 VARCHAR。5 个客户，18 种费用名称。4 个示例模板。

## 验证方式

1. `python cpq-flask-app/app.py` 启动无报错
2. `http://127.0.0.1:5000` 展示 4 个示例模板
3. 进入设计器 → 预览 → 确认 DuckDB 查询正常
4. 导出 Excel → 确认文件可打开、样式正常
5. 修改 `seed_data.py` 后删除 `instance/cpq.db` 重启

## 已知约束

- 无认证，`config.py` 硬编码 `CURRENT_USER_ID = "zhangxm"`
- DuckDB 内存模式，重启后丢失
- `designer-core.js` ~1156 行，命令式 DOM 操作
- 无测试文件
