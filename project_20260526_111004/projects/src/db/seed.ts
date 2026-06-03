import { sql } from 'drizzle-orm';
import { getDb, saveDb } from './index';
import {
  customers,
  billingEntities,
  billingRules,
  quotes,
  splitFields,
  approvalWorkflows,
  autoApprovalRules,
  approvalFields,
  riskApprovals,
} from './schema';
import {
  initialCustomers,
  initialBillingEntities,
  initialBillingRules,
  initialQuotes,
  initialSplitFields,
  initialApprovalWorkflows,
  initialAutoApprovalRules,
  initialApprovalFields,
  initialRiskApprovals,
} from '@/lib/sample-data';

const CREATE_TABLES = [
  `CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, customer_code TEXT,
    signing_entity_ids TEXT, service_entity_ids TEXT, settlement_entity_ids TEXT,
    status TEXT DEFAULT 'active',
    basic_info TEXT, business_info TEXT, semiconductor_info TEXT,
    related_companies TEXT, products TEXT, billing_entities TEXT,
    rule_ids TEXT, audit_logs TEXT, created_at TEXT, updated_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS billing_entities (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, code TEXT,
    status TEXT DEFAULT 'active', created_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS billing_rules (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, customer_id TEXT,
    customer_name TEXT, priority INTEGER DEFAULT 99,
    condition_group TEXT, target_billing_entity TEXT,
    status TEXT DEFAULT 'active', created_at TEXT, created_by TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS quotes (
    id TEXT PRIMARY KEY, quote_number TEXT, customer_id TEXT,
    customer_name TEXT, title TEXT, status TEXT DEFAULT 'draft',
    currency TEXT DEFAULT 'CNY', valid_from TEXT, valid_to TEXT,
    owner TEXT, owner_name TEXT, total_amount REAL DEFAULT 0,
    items TEXT, collaborators TEXT, history TEXT, remark TEXT,
    created_at TEXT, updated_at TEXT, submitted_at TEXT,
    approved_at TEXT, sent_at TEXT, pdf_url TEXT, excel_url TEXT, h5_url TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS split_fields (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, field_key TEXT,
    type TEXT DEFAULT 'text', options TEXT,
    required INTEGER DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS approval_workflows (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, service_product TEXT,
    is_trade_agency INTEGER DEFAULT 0, status TEXT DEFAULT 'active',
    approval_nodes TEXT, remark TEXT, created_by TEXT,
    created_at TEXT, updated_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS auto_approval_rules (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, service_product TEXT,
    status TEXT DEFAULT 'active', condition_logic TEXT DEFAULT 'AND',
    conditions TEXT, actions TEXT, success_message TEXT,
    failure_message TEXT, message TEXT, priority INTEGER DEFAULT 99,
    remark TEXT, is_system INTEGER DEFAULT 0,
    created_by TEXT, created_at TEXT, updated_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS risk_approvals (
    id TEXT PRIMARY KEY, company_name TEXT NOT NULL,
    service_product TEXT, is_trade_agent TEXT DEFAULT '否',
    business_type TEXT, approval_status TEXT DEFAULT '草稿',
    status TEXT, approval_steps TEXT, picked_approver TEXT,
    dynamic_field_values TEXT, submitter TEXT, remark TEXT,
    english_name TEXT, parent_company TEXT, subsidiary_company TEXT,
    goods_type TEXT, monthly_business_volume TEXT, monthly_orders TEXT, monthly_invoice_amount TEXT,
    customs_kpi_requirement TEXT, transport_kpi_requirement TEXT, warehouse_lease_requirement TEXT,
    custom_service_requirement TEXT, custom_requirement_description TEXT,
    risk_control_purpose TEXT, relationship_with_hmg TEXT,
    settlement_period TEXT, contact_name TEXT,
    suggested_system_code TEXT, opportunity_id TEXT,
    business_customer_ids TEXT, invoice_info_ids TEXT,
    submit_time TEXT, approved_by TEXT, approved_at TEXT, reject_reason TEXT,
    created_at TEXT, updated_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS approval_fields (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, field_key TEXT NOT NULL,
    field_type TEXT DEFAULT 'text', service_products TEXT DEFAULT '[]',
    options TEXT DEFAULT '[]', is_required INTEGER DEFAULT 0,
    approval_point TEXT, status TEXT DEFAULT 'active',
    remark TEXT, created_by TEXT, created_at TEXT NOT NULL, updated_at TEXT
  )`,
];

async function seed() {
  console.log('正在初始化数据库...');
  const db = await getDb();

  // 逐条建表
  for (const stmt of CREATE_TABLES) {
    db.run(sql.raw(stmt));
  }
  console.log('  表结构创建完成');

  // 清空已有数据
  db.delete(customers).run();
  db.delete(billingEntities).run();
  db.delete(billingRules).run();
  db.delete(quotes).run();
  db.delete(splitFields).run();
  db.delete(approvalWorkflows).run();
  db.delete(autoApprovalRules).run();
  db.delete(approvalFields).run();
  db.delete(riskApprovals).run();

  // 插入审批字段
  for (const f of initialApprovalFields) {
    db.insert(approvalFields).values({
      id: f.id, name: f.name, fieldKey: f.fieldKey, fieldType: f.fieldType,
      serviceProducts: JSON.stringify(f.serviceProducts),
      options: JSON.stringify(f.options),
      isRequired: f.isRequired ? 1 : 0,
      approvalPoint: f.approvalPoint ?? null,
      status: f.status, remark: f.remark ?? null,
      createdBy: f.createdBy ?? null, createdAt: f.createdAt,
      updatedAt: f.updatedAt ?? null,
    }).run();
  }
  console.log(`  审批字段: ${initialApprovalFields.length} 条`);
  saveDb();

  // 插入拆分字段
  for (const f of initialSplitFields) {
    db.insert(splitFields).values({
      id: f.id, name: f.name, fieldKey: f.fieldKey, type: f.type,
      options: f.options ? JSON.stringify(f.options) : null,
      required: f.required ?? false,
    }).run();
  }
  console.log(`  拆分字段: ${initialSplitFields.length} 条`);

  // 插入账单主体
  for (const e of initialBillingEntities) {
    db.insert(billingEntities).values({
      id: e.id, name: e.name, code: e.code, status: e.status, createdAt: e.createdAt,
    }).run();
  }
  console.log(`  账单主体: ${initialBillingEntities.length} 条`);

  // 插入客户
  for (const c of initialCustomers) {
    db.insert(customers).values({
      id: c.id, name: c.name, customerCode: c.customerCode ?? null,
      signingEntityIds: c.signingEntityIds ? JSON.stringify(c.signingEntityIds) : null, serviceEntityIds: c.serviceEntityIds ? JSON.stringify(c.serviceEntityIds) : null, settlementEntityIds: c.settlementEntityIds ? JSON.stringify(c.settlementEntityIds) : null,
      status: c.status,
      basicInfo: c.basicInfo ? JSON.stringify(c.basicInfo) : null,
      businessInfo: c.businessInfo ? JSON.stringify(c.businessInfo) : null,
      semiconductorInfo: c.semiconductorInfo ? JSON.stringify(c.semiconductorInfo) : null,
      relatedCompanies: (c as any).relatedCompanies ? JSON.stringify((c as any).relatedCompanies) : null,
      products: (c as any).products ? JSON.stringify((c as any).products) : null,
      billingEntities: (c as any).billingEntities ? JSON.stringify((c as any).billingEntities) : null,
      ruleIds: (c as any).ruleIds ? JSON.stringify((c as any).ruleIds) : null,
      auditLogs: (c as any).auditLogs ? JSON.stringify((c as any).auditLogs) : null,
      createdAt: c.createdAt,
    }).run();
  }
  console.log(`  客户: ${initialCustomers.length} 条`);

  // 插入账单规则（去重 ID）
  const seenRuleIds = new Set<string>();
  for (let i = 0; i < initialBillingRules.length; i++) {
    const r = initialBillingRules[i];
    let ruleId = r.id;
    if (seenRuleIds.has(ruleId)) {
      ruleId = `${r.id}-${i}`;
    }
    seenRuleIds.add(ruleId);
    db.insert(billingRules).values({
      id: ruleId, name: r.name, customerId: r.customerId ?? null,
      customerName: r.customerName ?? null, priority: r.priority ?? 99,
      conditionGroup: (r as any).conditionGroup ? JSON.stringify((r as any).conditionGroup) : null,
      targetBillingEntity: r.targetBillingEntity ?? null,
      status: r.status, createdAt: r.createdAt ?? null, createdBy: r.createdBy ?? null,
    }).run();
  }
  console.log(`  账单规则: ${initialBillingRules.length} 条`);

  // 插入报价单
  for (const q of initialQuotes) {
    db.insert(quotes).values({
      id: q.id, quoteNumber: q.quoteNumber ?? null, customerId: q.customerId ?? null,
      customerName: q.customerName ?? null, title: q.title ?? null,
      status: q.status, currency: q.currency ?? 'CNY',
      validFrom: q.validFrom ?? null, validTo: q.validTo ?? null,
      owner: q.owner ?? null, ownerName: q.ownerName ?? null,
      totalAmount: q.totalAmount ?? 0,
      items: (q as any).items ? JSON.stringify((q as any).items) : null,
      collaborators: (q as any).collaborators ? JSON.stringify((q as any).collaborators) : null,
      history: (q as any).history ? JSON.stringify((q as any).history) : null,
      remark: q.remark ?? null, createdAt: q.createdAt ?? null,
      updatedAt: q.updatedAt ?? null, submittedAt: q.submittedAt ?? null,
      approvedAt: q.approvedAt ?? null, sentAt: q.sentAt ?? null,
      pdfUrl: (q as any).pdfUrl ?? null, excelUrl: (q as any).excelUrl ?? null,
      h5Url: (q as any).h5Url ?? null,
    }).run();
  }
  console.log(`  报价单: ${initialQuotes.length} 条`);

  // 插入审批流程
  for (const w of initialApprovalWorkflows) {
    db.insert(approvalWorkflows).values({
      id: w.id, name: w.name, serviceProduct: w.serviceProduct ?? null,
      isTradeAgency: w.isTradeAgency ?? false, status: w.status,
      approvalNodes: (w as any).approvalNodes ? JSON.stringify((w as any).approvalNodes) : null,
      remark: w.remark ?? null, createdBy: (w as any).createdBy ?? null,
      createdAt: (w as any).createdAt ?? null, updatedAt: (w as any).updatedAt ?? null,
    }).run();
  }
  console.log(`  审批流程: ${initialApprovalWorkflows.length} 条`);

  // 插入自动审批规则
  for (const r of initialAutoApprovalRules) {
    db.insert(autoApprovalRules).values({
      id: r.id, name: r.name, serviceProduct: r.serviceProduct ?? null,
      status: r.status, conditionLogic: r.conditionLogic ?? 'AND',
      conditions: (r as any).conditions ? JSON.stringify((r as any).conditions) : null,
      actions: (r as any).actions ? JSON.stringify((r as any).actions) : null,
      successMessage: r.successMessage ?? null, failureMessage: r.failureMessage ?? null,
      priority: r.priority ?? 99, createdBy: r.createdBy ?? null,
      createdAt: r.createdAt ?? null, updatedAt: r.updatedAt ?? null,
    }).run();
  }
  console.log(`  自动审批规则: ${initialAutoApprovalRules.length} 条`);

  // 插入风控审批记录
  if (initialRiskApprovals && initialRiskApprovals.length > 0) {
    const raAny = initialRiskApprovals as any[];
    for (const ra of raAny) {
      db.insert(riskApprovals).values({
        id: ra.id, companyName: ra.companyName || '',
        serviceProduct: ra.serviceProduct ?? null,
        isTradeAgent: ra.isTradeAgent ?? '否',
        businessType: ra.businessType ?? null,
        approvalStatus: ra.approvalStatus ?? '草稿',
        status: ra.status ?? null,
        approvalSteps: ra.approvalSteps ? JSON.stringify(ra.approvalSteps) : null,
        pickedApprover: ra.pickedApprover ?? null,
        dynamicFieldValues: ra.dynamicFieldValues ? JSON.stringify(ra.dynamicFieldValues) : null,
        submitter: ra.submitter ?? null, remark: ra.remark ?? null,
        englishName: ra.englishName ?? null, parentCompany: ra.parentCompany ?? null,
        subsidiaryCompany: ra.subsidiaryCompany ?? null, goodsType: ra.goodsType ?? null,
        monthlyBusinessVolume: ra.monthlyBusinessVolume ?? null,
        monthlyOrders: (ra as any).monthly_orders ?? null,
        monthlyInvoiceAmount: (ra as any).monthly_invoice_amount ?? ra.monthlyInvoiceAmount ?? null,
        customsKpiRequirement: ra.customsKpiRequirement ?? null,
        transportKpiRequirement: ra.transportKpiRequirement ?? null,
        warehouseLeaseRequirement: ra.warehouseLeaseRequirement ?? null,
        customServiceRequirement: ra.customServiceRequirement ?? null,
        customRequirementDescription: ra.customRequirementDescription ?? null,
        riskControlPurpose: ra.riskControlPurpose ?? null,
        relationshipWithHMG: ra.relationshipWithHMG ?? null,
        settlementPeriod: ra.settlementPeriod ?? null, contactName: ra.contactName ?? null,
        suggestedSystemCode: ra.suggestedSystemCode ?? null, opportunityId: ra.opportunityId ?? null,
        businessCustomerIds: ra.businessCustomerIds ? JSON.stringify(ra.businessCustomerIds) : null,
        invoiceInfoIds: ra.invoiceInfoIds ? JSON.stringify(ra.invoiceInfoIds) : null,
        submitTime: ra.submitTime ?? null, approvedBy: ra.approvedBy ?? null,
        approvedAt: ra.approvedAt ?? null, rejectReason: ra.rejectReason ?? null,
        createdAt: ra.createdAt ?? new Date().toISOString(),
        updatedAt: ra.updatedAt ?? null,
      }).run();
    }
  }
  console.log(`  风控审批: ${initialRiskApprovals?.length ?? 0} 条`);

  saveDb();
  console.log('\n数据库初始化完成! data/cim.db');
}

seed().catch((err) => {
  console.error('种子数据写入失败:', err);
  process.exit(1);
});
