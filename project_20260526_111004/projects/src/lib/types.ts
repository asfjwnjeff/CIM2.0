// ==================== 基础枚举 ====================

export type LogicOperator = 'AND' | 'OR';

export type Operator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'in'
  | 'not_in'
  | 'regex'
  | 'any'
  | 'empty'
  | 'not_empty';

export type Status = 'active' | 'inactive';

// ==================== 用户 ====================

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  avatar?: string;
  // IAM 扩展字段
  username?: string;
  realName?: string;
  phone?: string;
  status?: 'active' | 'inactive';
  roleIds?: string[];
  roleNames?: string[];
}

export const currentUser: User = {
  id: 'user-1',
  name: '系统管理员',
  email: 'admin@company.com',
  role: 'admin',
  department: '信息技术部',
};

// ==================== 权限管理 ====================

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  userCount: number;
  status: 'active' | 'inactive';
  permissionIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  type: 'menu' | 'button';
  parentId?: string | null;
  path?: string | null;
  sort: number;
  status: 'active' | 'inactive';
  createdAt?: string;
}

export interface DataPermission {
  id: string;
  dimension: 'user' | 'role' | 'department';
  targetId: string;
  targetName: string;
  customerIds: string[];
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  detail?: string;
  ip?: string;
  createdAt: string;
}

// ==================== 产业链相关 ====================

export type IndustryChainLevel = 'upstream' | 'midstream' | 'downstream';
export type IndustryChainRole = 
  | 'equipment_manufacturer' | 'material_supplier' | 'ip_provider' | 'eda_vendor'
  | 'foundry' | 'fabless' | 'idf' | 'osat' | 'sip'
  | 'distributor' | 'system_integrator' | 'terminal_manufacturer' | 'consumer'
  | 'equipment_supplier' | 'distributor_agent' | 'wafer_foundry' | 'chip_design';

export interface CompanyBasicInfo {
  // 客户LOGO
  logoUrls?: string[];
  // 统一社会信用证代码
  unifiedSocialCreditCode?: string;
  // 客户国（地）别：中企/美企/日企/韩企/台企等
  countryRegion?: string;
  // 产业分类：半导体/消费品/工业工程/医疗健康/新能源
  industryCategory?: string;
  // 主营产品工艺
  mainProducts?: string;
  // 产业链业态
  industryChainFormat?: string;
  // 供应链角色
  supplyChainRole?: string;
  // 跨境模式：口岸/直通/保税仓库/保税区域/普通仓库/其他
  crossBorderMode?: string;
  // 客户渠道：直客/代理/同行
  customerChannel?: string;
  // 客户来源：公司资源/自主开拓/电话咨询/客户推荐
  customerSource?: string;
  // 潜在竞争对手
  potentialCompetitors?: string;
  // 关联上下游企业
  relatedEnterprises?: string;
  // 公司营业地址 - 省
  addressProvince?: string;
  // 公司营业地址 - 市
  addressCity?: string;
  // 公司营业地址 - 区
  addressDistrict?: string;
  // 公司营业地址 - 详细地址
  addressDetail?: string;
  // 意向服务地区（多选国内城市）
  intendedServiceRegions?: string[];
  // 服务产品需求：货代/关务/仓储/运输/进出口/维修/合同物流/一体化供应链/其他
  serviceProducts?: string[];
  // 其他服务产品需求（当服务产品选"其他"时）
  otherServiceRequirement?: string;
  // 预计月均业务量（票）
  estimatedMonthlyVolume?: string;
  // 仓库面积（平方米）
  warehouseArea?: string;
  // 仓库温湿度要求
  warehouseConditions?: string;
  // 客户系统代码（风控审批通过后自动回填，不可修改）
  customerSystemCode?: string;
  // 客户等级：K/A/B/C/D
  customerLevel?: string;
  // 我司优势简述
  ourAdvantage?: string;
  // 我司劣势简述
  ourDisadvantage?: string;
}

export interface CompanyBusinessInfo {
  paidInCapital: string;
  organizationCode: string;
  businessRegistrationNumber: string;
  taxpayerIdentificationNumber: string;
  enterpriseType: string;
  businessTerm: string;
  taxpayerQualification: string;
  staffSize: string;
  insuredNumber: string;
  approvalDate: string;
  region: string;
  registrationAuthority: string;
  englishName: string;
  registeredAddress: string;
  correspondenceAddress: string;
  businessScope: string;
  // 从旧 CompanyBasicInfo 移入的工商类字段（可选）
  phone?: string;
  registrationStatus?: string;
  legalRepresentative?: string;
  email?: string;
  enterpriseScale?: string;
  registeredCapital?: string;
  website?: string;
  establishmentDate?: string;
  countryRegion?: string;
  industryTags?: string[];
}

export interface CompanySemiconductorInfo {
  industryChainLevel: IndustryChainLevel;
  industryChainRole: IndustryChainRole | '';
  industryTags: string[];
}

export interface RelatedCompany {
  id: string;
  name?: string;
  relation: string;
  direction?: 'upstream' | 'downstream';
  industryChainRole?: string;
  relatedCompanyLevel?: string;
  relatedCompanyName?: string;
  relatedCompanyId?: string;
  validFrom?: string;
  validTo?: string;
  createdAt?: string;
}

export interface CustomerProduct {
  id: string;
  name?: string;
  category?: string;
  specification?: string;
  unit?: string;
  productName?: string;
  productCode?: string;
  customsDeclarationElements?: string;
  origin?: string;
  industryChainCategory?: string;
  relatedBillingEntityId?: string;
  relatedBillingEntityName?: string;
  createdAt?: string;
}

// ==================== 操作日志 ====================

export interface OperationLog {
  id: string;
  timestamp: string;
  action: string;
  module?: string;
  details: string;
  operator?: string;
  operatorId?: string;
  target?: string;
  targetType?: string;
  targetId?: string;
  targetName?: string;
  fieldName?: string;
}

export interface CustomerAuditLog {
  id: string;
  customerId?: string;
  field?: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  operator?: string;
  operatorId?: string;
  action?: string;
  details?: string;
  targetName?: string;
  targetId?: string;
  targetType?: string;
  timestamp?: string;
}

// ==================== 跟进进度 ====================

export type ProgressStatus = 'newly_acquired' | 'pending_followup' | 'preliminary_intent' | 'opportunity_confirmed' | 'deal_closed' | 'invalid';

export type OperationAction = 'create' | 'update' | 'delete' | 'associate' | 'disassociate' | 'advance' | 'rollback' | 'collaborate' | 'assign' | 'transfer';

export type CustomerStatus = 'draft' | 'active' | 'inactive' | 'potential' | 'frozen';
export type RelationshipLoyalty = 'strategic' | 'important' | 'normal' | 'tobe_developed';
export type CustomerLevel = 'vip' | 'key' | 'normal' | 'small';

export interface Contact {
  id: string;
  name?: string;
  title?: string;
  phone?: string;
  email?: string;
  department?: string;
  isPrimary?: boolean;
  customerId?: string;
  customerName?: string;
  createdAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  customerCode?: string;
  signingEntityIds?: string[];
  serviceEntityIds?: string[];
  settlementEntityIds?: string[];
  billingEntities?: string[];
  rules?: SplitRule[];
  status: CustomerStatus;
  level?: CustomerLevel;
  relationshipLoyalty?: RelationshipLoyalty;
  industry?: string;
  region?: string;
  address?: string;
  website?: string;
  description?: string;
  contacts?: Contact[];
  createdAt: string;
  updatedAt?: string;
  // 新增：协同管理字段
  createdBy: string;
  responsiblePersons: string[];
  collaborators: string[];
  progressStatus: ProgressStatus;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  // 子模块信息
  basicInfo?: CompanyBasicInfo;
  businessInfo?: CompanyBusinessInfo;
  semiconductorInfo?: CompanySemiconductorInfo;
  relatedCompanies?: RelatedCompany[];
  products?: CustomerProduct[];
  auditLogs?: CustomerAuditLog[];
  ruleIds?: string[];
}

// ==================== 账单主体 ====================

export interface BillingEntity {
  id: string;
  name: string;
  code?: string;
  taxId?: string;
  settlementEntity?: string;
  status: Status;
  createdAt: string;
}

// ==================== 拆分规则 ====================

export type SplitRuleStatus = 'active' | 'inactive' | 'draft';

export interface ConditionGroup {
  id: string;
  logic: LogicOperator;
  conditions: {
    field: string;
    operator: Operator;
    value: string;
  }[];
}

export interface SplitRule {
  id: string;
  customerId: string;
  name: string;
  priority?: number;
  conditionGroups: ConditionGroup[];
  targetBillingEntityId: string;
  targetBillingEntityName?: string;
  status: SplitRuleStatus;
  remark?: string;
  createdAt: string;
  createdBy?: string;
  updatedAt?: string;
}

// ==================== 订单映射 ====================

export interface OrderMapping {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName?: string;
  billingEntityId: string;
  billingEntityName: string;
  matchedRuleId?: string;
  matchedRuleName?: string;
  splitAt: string;
  operator?: string;
}

// ==================== 客户 ====================

export type FollowUpType = 'kpi_not_met' | 'contract_mgmt' | 'biz_meeting' | 'other_customer';
export type FollowUpStatus = 'draft' | 'new' | 'discussing' | 'promoting' | 'completed' | 'cancelled' | 'success' | 'no_progress' | 'terminated';
export type FollowUpMethod = 'phone_visit' | 'onsite_visit' | 'online_visit' | 'hmg_meeting';

export interface FollowUpRecord {
  id: string;
  customerId: string;
  customerName?: string;
  contactId?: string;
  contactName?: string;
  contactPerson?: string;
  opportunityId?: string;
  opportunityName?: string;
  type: FollowUpType;
  followUpType?: FollowUpType;
  method?: FollowUpMethod;
  content?: string;
  followUpDate?: string;
  date?: string;
  status?: FollowUpStatus;
  owner?: string;
  collaborator?: string;
  collaborators?: string;
  nextFollowUpDate?: string;
  nextFollowUp?: string;
  nextFollowUpContent?: string;
  recordingUrl?: string;
  transcript?: string;
  meetingSummary?: string;
  keyPoints?: string[];
  actionItems?: string[];
  decisions?: string[];
  attachments?: string[];
  createdAt: string;
  updatedAt?: string;
}

// ==================== 商机 ====================

export type SalesStage =
  | 'demand_confirmation' | 'requirements_confirmation'
  | 'solution_quotation' | 'business_negotiation'
  | 'following_up' | 'following'
  | 'won' | 'lost';

export type OpportunityStatus = 'draft' | 'active';

export interface Opportunity {
  status?: OpportunityStatus;
  id: string;
  customerId: string;
  customerName?: string;
  name: string;
  opportunityNumber?: string;
  opportunityName?: string;
  amount?: number;
  opportunityAmount?: number;
  estimatedMonthlyAmount?: number;
  currency?: string;
  stage: SalesStage;
  salesStage?: SalesStage;
  probability?: number;
  expectedCloseDate?: string;
  owner?: string;
  ownerName?: string;
  description?: string;
  serviceProducts?: string[];
  serviceProduct?: string;
  contacts?: Contact[];
  createdAt: string;
  updatedAt?: string;
}

// ==================== 合同 ====================

export type ContractStatus = 'not_started' | 'signing' | 'active' | 'expired' | 'terminated' | 'draft' | 'not_archived' | 'archived' | 'void';

export interface Contract {
  id: string;
  customerId: string;
  customerName?: string;
  name: string;
  contractNumber?: string;
  contractName?: string;
  contractNo?: string;
  contractType?: string;
  currency?: string;
  contractAmount?: number;
  startDate?: string;
  endDate?: string;
  status: ContractStatus;
  owner?: string;
  signingDate?: string;
  remark?: string;
  createdAt: string;
  updatedAt?: string;
}

// ==================== 售前报价 ====================

export type QuoteTemplateBusiness = 'forwarding' | 'customs' | 'warehousing' | 'transportation' | 'import_export' | 'repair' | 'contract_logistics' | 'integrated_supply_chain' | 'other';

export interface QuoteTemplate {
  id: string;
  name: string;
  business: QuoteTemplateBusiness;
  version: string;
  itemCount: number;
  maintainer: string;
  lastUpdated: string;
  status: 'enabled' | 'disabled';
  isCustomerServiceVisible: boolean;
  remark?: string;
  createdAt: string;
  updatedAt?: string;
  items?: QuoteItem[];
}

export const QUOTE_TEMPLATE_BUSINESS_LABELS: Record<QuoteTemplateBusiness, string> = {
  forwarding: '货代',
  customs: '关务',
  warehousing: '仓储',
  transportation: '运输',
  import_export: '进出口',
  repair: '维修',
  contract_logistics: '合同物流',
  integrated_supply_chain: '一体化供应链',
  other: '其他'
};

export type QuoteStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'sent' | 'pending' | 'accepted' | 'transferred';

export interface QuoteItem {
  id: string;
  name?: string;
  description?: string;
  category?: string;
  productCode?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  discount?: number;
  discountPercent?: string;
  discountAfterUnitPrice?: number;
  subtotal?: number;
  // 原型新增字段
  businessGroup?: string;
  productL1?: string;
  productL2?: string;
  productL3?: string;
  englishName?: string;
  billingUnit?: string;
  remark?: string;
}

export interface QuoteCollaborator {
  id: string;
  name?: string;
  role?: string;
  userName?: string;
  userId?: string;
  joinedAt?: string;
}

export interface QuoteHistory {
  id: string;
  action: string;
  operator: string;
  operatorId?: string;
  timestamp: string;
  details?: string;
}

export interface Quote {
  id: string;
  name?: string;
  title?: string;
  customerId: string;
  customerName?: string;
  opportunityId?: string;
  opportunityName?: string;
  status: QuoteStatus;
  owner?: string;
  ownerName?: string;
  totalAmount?: number;
  totalBeforeDiscount?: number;
  totalDiscount?: number;
  currency?: string;
  validFrom?: string;
  validTo?: string;
  validStartDate?: string;
  validEndDate?: string;
  remark?: string;
  excelUrl?: string;
  pdfUrl?: string;
  h5Url?: string;
  quoteNumber?: string;
  quoteName?: string;
  currentRound?: number;
  items?: QuoteItem[];
  collaborators?: QuoteCollaborator[];
  history?: QuoteHistory[];
  ownerId?: string;
  submittedAt?: string;
  approvedAt?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt?: string;
  // 原型新增字段
  businessTemplate?: string;
  hmgEntity?: string;
  department?: string;
  initiator?: string;
  isTaxIncluded?: boolean;
  taxRate?: string;
  effectiveDate?: string;
  expiryDate?: string;
  statement?: string;
}

// ==================== 风控审批 ====================

export type RiskApprovalStatus = 'draft' | 'in_review' | 'approved' | 'rejected';
export type ApprovalNodeType = 'initiator' | 'department_manager' | 'functional' | 'finance' | 'general_manager' | 'it_ops';

export interface ApprovalNodeApprover {
  id: string;
  name: string;
  role?: string;
}

export interface ApprovalNode {
  id?: string;
  nodeType?: ApprovalNodeType;
  type?: ApprovalNodeType;
  name: string;
  description?: string;
  level?: number;
  order?: number;
  isRequired: boolean;
  isCountersign: boolean;
  approvers: ApprovalNodeApprover[];
}

export type ServiceProduct = '货代' | '关务' | '仓库' | '运输' | '进出口' | '维修' | '合同物流' | '一体化供应链';

export interface RiskApproval {
  id: string;
  companyName?: string;
  englishName?: string;
  parentCompany?: string;
  subsidiaryCompany?: string;
  serviceProducts?: ServiceProduct[];
  serviceProduct?: string;
  isTradeAgent?: string;        // '是' | '否'
  businessType?: string;
  goodsType?: string;
  monthlyBusinessVolume?: string;
  monthlyInvoiceAmount?: string;
  monthly_orders?: string;
  monthly_invoice_amount?: string;
  customsKpiRequirement?: string;
  transportKpiRequirement?: string;
  warehouseLeaseRequirement?: string;
  customServiceRequirement?: string;
  customRequirementDescription?: string;
  riskControlPurpose?: string;
  relationshipWithHMG?: string;
  settlementPeriod?: string;
  contactName?: string;
  businessCustomerIds?: string[];
  suggestedSystemCode?: string;
  opportunityId?: string;
  invoiceInfoIds?: string[];
  approvalSteps?: Record<string, unknown>[];  // 审批步骤（从mock/DB数据中）
  approvalStatus?: string;       // 审批状态（中文：草稿/审批中/审批完成/已驳回）
  pickedApprover?: string;       // 合同物流四选一结果
  dynamicFieldValues?: Record<string, string>;  // 动态字段值 { fieldKey: value }
  status: RiskApprovalStatus | string;
  remark?: string;
  submitTime?: string;
  submitter?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectReason?: string;
  createdAt: string;
  updatedAt?: string;
  history?: ApprovalHistoryEntry[];
}

// ==================== 审批流程配置 ====================

export interface ApprovalWorkflow {
  id: string;
  name: string;
  serviceProducts?: ServiceProduct[];
  serviceProduct?: string;
  isTradeAgency?: boolean;
  approvalNodes?: ApprovalNode[];
  status: Status;
  remark?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

// ==================== 审批流程历史 ====================

export interface ApprovalWorkflowHistory {
  id: string;
  workflowId: string;
  action: string;
  operator: string;
  details: string;
  timestamp: string;
}

/** 审批操作历史 */
export interface ApprovalHistoryEntry {
  id: string;
  approvalId: string;
  action: 'submitted' | 'approved' | 'rejected' | 'withdrawn';
  operator: string;
  operatorName: string;
  nodeName?: string;
  reason?: string;
  timestamp: string;
}

// ==================== 自动审批规则 ====================

export type AutoApprovalOperator = 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'in' | 'empty' | 'not_empty' | 'greater_than' | 'less_than' | 'less_than_or_equal' | 'greater_than_or_equal' | '';
export type AutoApprovalActionType = 'auto_approve' | 'auto_reject' | 'add_approver' | 'show_message' | '';

export interface AutoApprovalCondition {
  id?: string;
  field: string;
  operator: AutoApprovalOperator;
  value: string;
  logic?: 'AND' | 'OR';
}

export interface AutoApprovalAction {
  id?: string;
  actionType?: AutoApprovalActionType;
  type?: AutoApprovalActionType;
  target?: string;
  message?: string;
  description?: string;
}

export interface AutoApprovalRule {
  id: string;
  name: string;
  serviceProduct?: string;
  status: Status;
  conditionLogic?: LogicOperator;
  conditions: AutoApprovalCondition[];
  actions: AutoApprovalAction[];
  successMessage?: string;
  failureMessage?: string;
  message?: string;
  priority?: number;
  isSystem?: boolean;
  remark?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

// ========== 审批字段配置 ==========

/** 审批字段类型 */
export type ApprovalFieldType =
  | 'single_select'    // 单选（可搜索）
  | 'multi_select'     // 多选（可搜索）
  | 'single_other'     // 单选+其他
  | 'boolean'          // 布尔
  | 'percentage'       // 百分比
  | 'number'           // 数字（保留两位小数）
  | 'text';            // 文本输入

/** 审批字段选项 */
export interface ApprovalFieldOption {
  id: string;
  label: string;
  order: number;
}

/** 审批结构化字段 */
export interface ApprovalField {
  id: string;
  name: string;
  fieldKey: string;
  fieldType: ApprovalFieldType;
  serviceProducts: ServiceProduct[];
  options: ApprovalFieldOption[];
  isRequired: boolean;
  approvalPoint?: string;
  status: Status;
  remark?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

/** 规则触发的追加审批人 */
export interface RuleTriggeredApprover {
  approver: ApprovalNodeApprover;
  reason: string;
  ruleId: string;
}

// ==================== 可配置拆分字段 ====================

export interface SplitField {
  id: string;
  name: string;
  label?: string;
  type: 'text' | 'select' | 'multiselect' | 'number';
  options?: string[];
  enabled?: boolean;
  fieldKey?: string;
  required?: boolean;
}

// ==================== 客户主体管理 ====================

export interface ServiceEntity {
  id: string;
  name: string;
  code?: string;
  unifiedSocialCreditCode?: string;
  legalRepresentative?: string;
  type?: string;
  status: Status;
  establishmentDate?: string;
  taxId?: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  remark?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SigningEntity {
  id: string;
  name: string;
  code?: string;
  unifiedSocialCreditCode?: string;
  legalRepresentative?: string;
  type?: string;
  status: Status;
  establishmentDate?: string;
  taxId?: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  industry?: string;
  registeredCapital?: string;
  businessScope?: string;
  settlementEntity?: string;
  remark?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SettlementEntity {
  id: string;
  name: string;
  code?: string;
  unifiedSocialCreditCode?: string;
  type?: string;
  status: Status;
  taxId?: string;
  bankName?: string;
  bankAccount?: string;
  currency?: string;
  remark?: string;
  createdAt: string;
  updatedAt?: string;
}

// ==================== 账单规则（兼容 store） ====================

export interface RuleCondition {
  field: string;
  operator: string;
  value: string;
  id?: string;
  fieldKey?: string;
  fieldName?: string;
}

export interface RuleGroupItem {
  id: string;
  type: 'condition' | 'group';
  condition?: {
    id: string;
    fieldKey?: string;
    fieldName?: string;
    field?: string;
    operator: string;
    value: string;
  };
  group?: RuleGroup;
}

export interface RuleGroup {
  id?: string;
  logic: LogicOperator;
  conditions?: RuleCondition[];
  items: RuleGroupItem[];
}

export interface BillingRule {
  id: string;
  name: string;
  customerId?: string;
  customerName?: string;
  status: Status;
  priority?: number;
  conditionGroup?: RuleGroup;
  conditionGroups?: ConditionGroup[];
  targetBillingEntity?: string;
  targetBillingEntityId?: string;
  targetBillingEntityName?: string;
  remark?: string;
  createdAt: string;
  createdBy?: string;
  updatedAt?: string;
}

// ==================== 客户账单区分字段 ====================

export interface CustomerBillingField {
  id: string;
  customerId: string;
  customerName: string;
  name: string;
  options: string[];
  createdAt: number;
  updatedAt: number;
}

// ==================== AI 转录 ====================

export interface AITranscription {
  id: string;
  followUpId?: string;
  audioUrl?: string;
  transcript?: string;
  summary?: string;
  keyPoints?: string[];
  actionItems?: string[];
  createdAt: string;
  updatedAt?: string;
}

// ==================== 分组功能 ====================

export type GroupConditionOperator =
  | 'equals' | 'not_equals' | 'contains' | 'not_contains'
  | 'in' | 'not_in'
  | 'gt' | 'gte' | 'lt' | 'lte'
  | 'today' | 'this_week' | 'this_month' | 'this_year'
  | 'empty' | 'not_empty';

export interface GroupCondition {
  id: string;
  field: string;
  operator: GroupConditionOperator;
  value: string;
}

export interface GroupDefinition {
  id: string;
  name: string;
  isSystem: boolean;
  conditions: GroupCondition[];
  sortOrder: number;
}

export interface ModuleGroupConfig {
  groups: GroupDefinition[];
  activeGroupId: string;
}

export interface GroupFieldMeta {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'select' | 'multiselect';
  options?: { value: string; label: string }[];
}

// ==================== 兼容类型别名 ====================

export type FollowUp = FollowUpRecord;
export type LogicType = LogicOperator;
export type RuleConditionItem = RuleGroupItem;

// ==================== 钉钉对接（预留） ====================

/** 钉钉审批实例 */
export interface DingTalkApprovalInstance {
  id: string;
  cimApprovalId: string;
  dingTalkProcessInstanceId?: string;
  status: 'pending' | 'synced' | 'completed' | 'terminated';
  syncedAt?: string;
  completedAt?: string;
  result?: string;
}

// ==================== 舆情分析 ====================

export type SentimentSourceType = '官网公告' | '监管公告' | '媒体报道' | '行业研报';

export type ImpactAssessment = '正面' | '中性' | '负面';

export interface SentimentItem {
  id: string;
  title: string;
  source: string;
  sourceType: SentimentSourceType;
  publishDate: string;
  summary: string;
  content: string;
  images: string[];
  originalUrl: string;
  tags: string[];
  impactAssessment: ImpactAssessment;
  collectedAt: string;
}

export interface SentimentFilters {
  sourceType: SentimentSourceType | 'all';
  impactAssessment: ImpactAssessment | 'all';
  dateRange: { start: string; end: string } | null;
  search: string;
}
