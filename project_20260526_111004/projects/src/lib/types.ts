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
}

export const currentUser: User = {
  id: 'user-1',
  name: '系统管理员',
  email: 'admin@company.com',
  role: 'admin',
  department: '信息技术部',
};

// ==================== 产业链相关 ====================

export type IndustryChainLevel = 'upstream' | 'midstream' | 'downstream';
export type IndustryChainRole = 
  | 'equipment_manufacturer' | 'material_supplier' | 'ip_provider' | 'eda_vendor'
  | 'foundry' | 'fabless' | 'idf' | 'osat' | 'sip'
  | 'distributor' | 'system_integrator' | 'terminal_manufacturer' | 'consumer'
  | 'equipment_supplier' | 'distributor_agent' | 'wafer_foundry' | 'chip_design';

export interface CompanyBasicInfo {
  unifiedSocialCreditCode?: string;
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

export type ProgressStatus = 'newly_acquired' | 'preliminary_intent' | 'pending_followup' | 'new_opportunity' | 'deal_closed' | 'invalid';

export type OperationAction = 'create' | 'update' | 'delete' | 'associate' | 'disassociate' | 'advance' | 'rollback' | 'collaborate' | 'assign' | 'transfer';

export type CustomerStatus = 'active' | 'inactive' | 'potential' | 'frozen';
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
  signingEntity?: string;
  serviceEntity?: string;
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

export type FollowUpType = 'visit' | 'phone' | 'email' | 'meeting' | 'wechat' | 'other';
export type FollowUpStatus = 'new' | 'discussing' | 'promoting' | 'completed' | 'cancelled' | 'success' | 'no_progress' | 'terminated';
export type FollowUpMethod = 'onsite' | 'remote' | 'phone_call' | 'video' | 'email' | 'other';

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

export interface Opportunity {
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

export type RiskApprovalStatus = 'draft' | 'pending' | 'approved' | 'rejected';
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

export type ServiceProduct = '货代' | '关务' | '仓库' | '运输' | '进出口' | '维修' | '合同物流';

export interface RiskApproval {
  id: string;
  customerId: string;
  customerName?: string;
  serviceProducts?: ServiceProduct[];
  serviceProduct?: string;
  isTradeAgent?: boolean;
  approvalNumber?: string;
  businessType?: string;
  riskPurpose?: string;
  approvalNodes?: ApprovalNode[];
  status: RiskApprovalStatus;
  remark?: string;
  submitTime?: string;
  submitter?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectReason?: string;
  createdAt: string;
  updatedAt?: string;
}

// ==================== 审批流程配置 ====================

export interface ApprovalWorkflow {
  id: string;
  name: string;
  serviceProducts?: ServiceProduct[];
  serviceProduct?: string;
  isTradeAgent?: boolean;
  isTradeAgency?: boolean;
  approvalNodes?: ApprovalNode[];
  status: Status;
  remark?: string;
  createdBy?: string;
  updatedBy?: string;
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

// ==================== 自动审批规则 ====================

export type AutoApprovalOperator = 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'in' | 'empty' | 'not_empty' | 'greater_than' | 'less_than' | 'less_than_or_equal' | 'greater_than_or_equal' | '';
export type AutoApprovalActionType = 'auto_approve' | 'auto_reject' | 'add_approver' | 'show_message' | 'skip_node' | '';

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
  serviceProducts?: ServiceProduct[];
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
  type?: string;
  status: Status;
  taxId?: string;
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
  remark?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SigningEntity {
  id: string;
  name: string;
  code?: string;
  type?: string;
  status: Status;
  taxId?: string;
  address?: string;
  legalPerson?: string;
  contactPerson?: string;
  contactPhone?: string;
  remark?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SettlementEntity {
  id: string;
  name: string;
  code?: string;
  type?: string;
  status: Status;
  bankName?: string;
  bankAccount?: string;
  currency?: string;
  taxId?: string;
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

// ==================== 兼容类型别名 ====================

export type FollowUp = FollowUpRecord;
export type LogicType = LogicOperator;
export type RuleConditionItem = RuleGroupItem;
