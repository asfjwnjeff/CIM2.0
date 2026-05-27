import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// 客户表
export const customers = sqliteTable('customers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  customerCode: text('customer_code'),
  signingEntity: text('signing_entity'),
  serviceEntity: text('service_entity'),
  status: text('status').default('active'),
  basicInfo: text('basic_info'),       // JSON
  businessInfo: text('business_info'),  // JSON
  semiconductorInfo: text('semiconductor_info'), // JSON
  relatedCompanies: text('related_companies'),   // JSON array
  products: text('products'),           // JSON array
  billingEntities: text('billing_entities'),     // JSON array of IDs
  ruleIds: text('rule_ids'),            // JSON array of IDs
  auditLogs: text('audit_logs'),        // JSON array
  createdAt: text('created_at').default('2024-01-01'),
  updatedAt: text('updated_at').default('2024-01-01'),
});

// 账单主体
export const billingEntities = sqliteTable('billing_entities', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code'),
  status: text('status').default('active'),
  createdAt: text('created_at'),
});

// 账单规则
export const billingRules = sqliteTable('billing_rules', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  customerId: text('customer_id'),
  customerName: text('customer_name'),
  priority: integer('priority').default(99),
  conditionGroup: text('condition_group'), // JSON
  targetBillingEntity: text('target_billing_entity'),
  status: text('status').default('active'),
  createdAt: text('created_at'),
  createdBy: text('created_by'),
});

// 报价单
export const quotes = sqliteTable('quotes', {
  id: text('id').primaryKey(),
  quoteNumber: text('quote_number'),
  customerId: text('customer_id'),
  customerName: text('customer_name'),
  title: text('title'),
  status: text('status').default('draft'),
  currency: text('currency').default('CNY'),
  validFrom: text('valid_from'),
  validTo: text('valid_to'),
  owner: text('owner'),
  ownerName: text('owner_name'),
  totalAmount: real('total_amount').default(0),
  items: text('items'),             // JSON array
  collaborators: text('collaborators'), // JSON array
  history: text('history'),         // JSON array
  remark: text('remark'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
  submittedAt: text('submitted_at'),
  approvedAt: text('approved_at'),
  sentAt: text('sent_at'),
  pdfUrl: text('pdf_url'),
  excelUrl: text('excel_url'),
  h5Url: text('h5_url'),
});

// 拆分字段
export const splitFields = sqliteTable('split_fields', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  fieldKey: text('field_key'),
  type: text('type').default('text'),
  options: text('options'), // JSON array
  required: integer('required', { mode: 'boolean' }).default(false),
});

// 审批流程
export const approvalWorkflows = sqliteTable('approval_workflows', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  serviceProduct: text('service_product'),
  isTradeAgency: integer('is_trade_agency', { mode: 'boolean' }).default(false),
  status: text('status').default('active'),
  approvalNodes: text('approval_nodes'), // JSON array
  remark: text('remark'),
  createdBy: text('created_by'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

// 自动审批规则
export const autoApprovalRules = sqliteTable('auto_approval_rules', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  serviceProduct: text('service_product'),
  status: text('status').default('active'),
  conditionLogic: text('condition_logic').default('AND'),
  conditions: text('conditions'),  // JSON array
  actions: text('actions'),        // JSON array
  successMessage: text('success_message'),
  failureMessage: text('failure_message'),
  priority: integer('priority').default(99),
  createdBy: text('created_by'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});
