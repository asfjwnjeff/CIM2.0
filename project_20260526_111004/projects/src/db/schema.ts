import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// 客户表
export const customers = sqliteTable('customers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  customerCode: text('customer_code'),
  signingEntityIds: text('signing_entity_ids'),
  serviceEntityIds: text('service_entity_ids'),
  settlementEntityIds: text('settlement_entity_ids'),
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

// 审批字段配置表
export const approvalFields = sqliteTable('approval_fields', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  fieldKey: text('field_key').notNull(),
  fieldType: text('field_type').notNull().default('text'),
  serviceProducts: text('service_products').notNull().default('[]'),
  options: text('options').notNull().default('[]'),
  isRequired: integer('is_required').notNull().default(0),
  approvalPoint: text('approval_point'),
  status: text('status').notNull().default('active'),
  remark: text('remark'),
  createdBy: text('created_by'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at'),
});

// 风控审批记录
export const riskApprovals = sqliteTable('risk_approvals', {
  id: text('id').primaryKey(),
  companyName: text('company_name').notNull(),
  serviceProduct: text('service_product'),
  isTradeAgent: text('is_trade_agent').default('否'),
  businessType: text('business_type'),
  approvalStatus: text('approval_status').default('草稿'),
  status: text('status'),                        // RiskApprovalStatus: draft/in_review/approved/rejected
  approvalSteps: text('approval_steps'),          // JSON
  pickedApprover: text('picked_approver'),
  dynamicFieldValues: text('dynamic_field_values'),  // JSON { fieldKey: value }
  submitter: text('submitter'),
  remark: text('remark'),
  // 公司扩展信息
  englishName: text('english_name'),
  parentCompany: text('parent_company'),
  subsidiaryCompany: text('subsidiary_company'),
  // 业务信息
  goodsType: text('goods_type'),
  monthlyBusinessVolume: text('monthly_business_volume'),
  monthlyOrders: text('monthly_orders'),
  monthlyInvoiceAmount: text('monthly_invoice_amount'),
  customsKpiRequirement: text('customs_kpi_requirement'),
  transportKpiRequirement: text('transport_kpi_requirement'),
  warehouseLeaseRequirement: text('warehouse_lease_requirement'),
  customServiceRequirement: text('custom_service_requirement'),
  customRequirementDescription: text('custom_requirement_description'),
  // 风控信息
  riskControlPurpose: text('risk_control_purpose'),
  relationshipWithHMG: text('relationship_with_hmg'),
  settlementPeriod: text('settlement_period'),
  contactName: text('contact_name'),
  suggestedSystemCode: text('suggested_system_code'),
  opportunityId: text('opportunity_id'),
  // JSON 数组字段
  businessCustomerIds: text('business_customer_ids'),
  invoiceInfoIds: text('invoice_info_ids'),
  // 审批元数据
  submitTime: text('submit_time'),
  approvedBy: text('approved_by'),
  approvedAt: text('approved_at'),
  rejectReason: text('reject_reason'),
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
  remark: text('remark'),
  isSystem: integer('is_system', { mode: 'boolean' }).default(false),
  createdBy: text('created_by'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});
