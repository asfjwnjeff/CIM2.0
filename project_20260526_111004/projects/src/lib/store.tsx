'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { initialSplitFields, initialBillingEntities, initialBillingRules, initialCustomers, initialQuotes, initialApprovalWorkflows, initialAutoApprovalRules, initialQuoteTemplates, initialSigningEntities, initialServiceEntities, initialSettlementEntities } from './sample-data';
import type {
  RuleGroup,
  SplitField,
  BillingEntity,
  BillingRule,
  RuleCondition,
  Customer,
  OperationLog,
  User,
  Quote,
  FollowUpRecord,
  Opportunity,
  Contact,
  Contract,
  RiskApproval,
  ServiceEntity,
  SigningEntity,
  SettlementEntity,
  QuoteTemplate,
  ApprovalWorkflow,
  ApprovalWorkflowHistory,
  AutoApprovalRule,
  AITranscription,
  ProgressStatus,
} from './types';
import { currentUser } from './types';

// 导出类型
export type { RuleGroup, SplitField, BillingEntity, BillingRule, RuleCondition, Customer, OperationLog, User, FollowUpRecord, Opportunity, Contact, Contract, RiskApproval, ServiceEntity, SigningEntity, SettlementEntity, QuoteTemplate, ApprovalWorkflow, ApprovalWorkflowHistory, AutoApprovalRule, AITranscription };

// ==================== 应用上下文类型 ====================

export interface AppContextType {
  // 数据
  currentUser: User;
  splitFields: SplitField[];
  billingEntities: BillingEntity[];
  billingRules: BillingRule[];
  customers: Customer[];
  quotes: Quote[];
  salesQuotes: Quote[];
  operationLogs: OperationLog[];
  followUps: FollowUpRecord[];
  opportunities: Opportunity[];
  contacts: Contact[];
  contracts: Contract[];
  riskApprovals: RiskApproval[];
  serviceEntities: ServiceEntity[];
  signingEntities: SigningEntity[];
  settlementEntities: SettlementEntity[];
  approvalWorkflows: ApprovalWorkflow[];
  approvalWorkflowHistories: ApprovalWorkflowHistory[];
  autoApprovalRules: AutoApprovalRule[];
  aiTranscriptions: AITranscription[];
  quoteTemplates: QuoteTemplate[];

  // 字段管理
  addSplitField: (field: Omit<SplitField, 'id'>) => void;
  updateSplitField: (id: string, updates: Partial<SplitField>) => void;
  deleteSplitField: (id: string) => void;

  // 账单主体管理
  addBillingEntity: (entity: Omit<BillingEntity, 'id' | 'createdAt'>) => void;
  updateBillingEntity: (id: string, updates: Partial<BillingEntity>) => void;
  deleteBillingEntity: (id: string) => void;

  // 账单主体规则管理
  addBillingRule: (rule: Omit<BillingRule, 'id' | 'createdAt' | 'createdBy'>) => void;
  updateBillingRule: (id: string, updates: Partial<BillingRule>) => void;
  deleteBillingRule: (id: string) => void;

  // 签约主体管理
  addSigningEntity: (entity: Omit<SigningEntity, 'id' | 'createdAt'>) => void;
  updateSigningEntity: (id: string, updates: Partial<SigningEntity>) => void;
  deleteSigningEntity: (id: string) => void;

  // 服务主体管理
  addServiceEntity: (entity: Omit<ServiceEntity, 'id' | 'createdAt'>) => void;
  updateServiceEntity: (id: string, updates: Partial<ServiceEntity>) => void;
  deleteServiceEntity: (id: string) => void;

  // 结算主体管理
  addSettlementEntity: (entity: Omit<SettlementEntity, 'id' | 'createdAt'>) => void;
  updateSettlementEntity: (id: string, updates: Partial<SettlementEntity>) => void;
  deleteSettlementEntity: (id: string) => void;

  // 客户管理
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // 操作日志
  addLog: (log: Omit<OperationLog, 'id' | 'timestamp'>) => void;

  // 报价管理
  addQuote: (quote: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateQuote: (id: string, updates: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;

  // 审批流程管理
  addApprovalWorkflow: (workflow: Omit<ApprovalWorkflow, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateApprovalWorkflow: (id: string, updates: Partial<ApprovalWorkflow>) => void;
  deleteApprovalWorkflow: (id: string) => void;

  // 自动审批规则管理
  addAutoApprovalRule: (rule: Omit<AutoApprovalRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAutoApprovalRule: (id: string, updates: Partial<AutoApprovalRule>) => void;
  deleteAutoApprovalRule: (id: string) => void;

  // 跟进记录管理
  addFollowUp: (followUp: Omit<FollowUpRecord, 'id' | 'createdAt'>) => void;
  updateFollowUp: (id: string, updates: Partial<FollowUpRecord>) => void;

  // 客户协同操作
  updateCustomerProgress: (id: string, status: ProgressStatus) => void;
  collaborateCustomer: (id: string, collaborators: string[]) => void;
  assignCustomer: (id: string, responsiblePersons: string[]) => void;
  transferCustomer: (id: string, newResponsiblePerson: string, reason?: string) => void;
  batchCollaborate: (ids: string[], collaborators: string[]) => void;
  batchAssign: (ids: string[], responsiblePersons: string[]) => void;
  batchTransfer: (ids: string[], newResponsiblePerson: string, reason?: string) => void;

  // 规则匹配
  matchBillingEntity: (params: Record<string, string>) => { entity: BillingEntity | null; rule: BillingRule | null; matchedConditions: string[] };
}

// ==================== 初始状态 ====================

// defaultState 用于 useReducer 的初始值
const defaultState = {
  splitFields: initialSplitFields,
  billingEntities: initialBillingEntities,
  billingRules: initialBillingRules,
  customers: initialCustomers,
  quotes: initialQuotes,
  salesQuotes: initialQuotes,
  operationLogs: [] as OperationLog[],
  followUps: [] as FollowUpRecord[],
  opportunities: [] as Opportunity[],
  contacts: [] as Contact[],
  contracts: [] as Contract[],
  riskApprovals: [] as RiskApproval[],
  serviceEntities: initialServiceEntities as ServiceEntity[],
  signingEntities: initialSigningEntities as SigningEntity[],
  settlementEntities: initialSettlementEntities as SettlementEntity[],
  approvalWorkflows: initialApprovalWorkflows as ApprovalWorkflow[],
  approvalWorkflowHistories: [] as ApprovalWorkflowHistory[],
  autoApprovalRules: initialAutoApprovalRules as AutoApprovalRule[],
  aiTranscriptions: [] as AITranscription[],
  quoteTemplates: initialQuoteTemplates as QuoteTemplate[],
};

// ==================== Reducer ====================

interface AppState {
  currentUser: User;
  splitFields: SplitField[];
  billingEntities: BillingEntity[];
  billingRules: BillingRule[];
  customers: Customer[];
  quotes: Quote[];
  salesQuotes: Quote[];
  operationLogs: OperationLog[];
  followUps: FollowUpRecord[];
  opportunities: Opportunity[];
  contacts: Contact[];
  contracts: Contract[];
  riskApprovals: RiskApproval[];
  serviceEntities: ServiceEntity[];
  signingEntities: SigningEntity[];
  settlementEntities: SettlementEntity[];
  approvalWorkflows: ApprovalWorkflow[];
  approvalWorkflowHistories: ApprovalWorkflowHistory[];
  autoApprovalRules: AutoApprovalRule[];
  aiTranscriptions: AITranscription[];
  quoteTemplates: QuoteTemplate[];
}

type Action =
  | { type: 'ADD_SPLIT_FIELD'; payload: Omit<SplitField, 'id'> }
  | { type: 'UPDATE_SPLIT_FIELD'; payload: { id: string; updates: Partial<SplitField> } }
  | { type: 'DELETE_SPLIT_FIELD'; payload: string }
  | { type: 'ADD_BILLING_ENTITY'; payload: Omit<BillingEntity, 'id' | 'createdAt'> }
  | { type: 'UPDATE_BILLING_ENTITY'; payload: { id: string; updates: Partial<BillingEntity> } }
  | { type: 'DELETE_BILLING_ENTITY'; payload: string }
  | { type: 'ADD_BILLING_RULE'; payload: Omit<BillingRule, 'id' | 'createdAt' | 'createdBy'> }
  | { type: 'UPDATE_BILLING_RULE'; payload: { id: string; updates: Partial<BillingRule> } }
  | { type: 'DELETE_BILLING_RULE'; payload: string }
  | { type: 'ADD_CUSTOMER'; payload: Omit<Customer, 'id' | 'createdAt'> }
  | { type: 'UPDATE_CUSTOMER'; payload: { id: string; updates: Partial<Customer> } }
  | { type: 'DELETE_CUSTOMER'; payload: string }
  | { type: 'UPDATE_CUSTOMER_PROGRESS'; payload: { id: string; status: ProgressStatus } }
  | { type: 'COLLABORATE_CUSTOMER'; payload: { id: string; collaborators: string[] } }
  | { type: 'ASSIGN_CUSTOMER'; payload: { id: string; responsiblePersons: string[] } }
  | { type: 'TRANSFER_CUSTOMER'; payload: { id: string; newResponsiblePerson: string; reason?: string } }
  | { type: 'BATCH_COLLABORATE'; payload: { ids: string[]; collaborators: string[] } }
  | { type: 'BATCH_ASSIGN'; payload: { ids: string[]; responsiblePersons: string[] } }
  | { type: 'BATCH_TRANSFER'; payload: { ids: string[]; newResponsiblePerson: string; reason?: string } }
  | { type: 'ADD_QUOTE'; payload: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_QUOTE'; payload: { id: string; updates: Partial<Quote> } }
  | { type: 'DELETE_QUOTE'; payload: string }
  | { type: 'ADD_LOG'; payload: Omit<OperationLog, 'id' | 'timestamp'> }
  | { type: 'ADD_APPROVAL_WORKFLOW'; payload: Omit<ApprovalWorkflow, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_APPROVAL_WORKFLOW'; payload: { id: string; updates: Partial<ApprovalWorkflow> } }
  | { type: 'DELETE_APPROVAL_WORKFLOW'; payload: string }
  | { type: 'ADD_AUTO_APPROVAL_RULE'; payload: Omit<AutoApprovalRule, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_AUTO_APPROVAL_RULE'; payload: { id: string; updates: Partial<AutoApprovalRule> } }
  | { type: 'DELETE_AUTO_APPROVAL_RULE'; payload: string }
  | { type: 'ADD_FOLLOWUP'; payload: Omit<FollowUpRecord, 'id' | 'createdAt'> }
  | { type: 'UPDATE_FOLLOWUP'; payload: { id: string; updates: Partial<FollowUpRecord> } }
  | { type: 'ADD_SIGNING_ENTITY'; payload: Omit<SigningEntity, 'id' | 'createdAt'> }
  | { type: 'UPDATE_SIGNING_ENTITY'; payload: { id: string; updates: Partial<SigningEntity> } }
  | { type: 'DELETE_SIGNING_ENTITY'; payload: string }
  | { type: 'ADD_SERVICE_ENTITY'; payload: Omit<ServiceEntity, 'id' | 'createdAt'> }
  | { type: 'UPDATE_SERVICE_ENTITY'; payload: { id: string; updates: Partial<ServiceEntity> } }
  | { type: 'DELETE_SERVICE_ENTITY'; payload: string }
  | { type: 'ADD_SETTLEMENT_ENTITY'; payload: Omit<SettlementEntity, 'id' | 'createdAt'> }
  | { type: 'UPDATE_SETTLEMENT_ENTITY'; payload: { id: string; updates: Partial<SettlementEntity> } }
  | { type: 'DELETE_SETTLEMENT_ENTITY'; payload: string };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_SPLIT_FIELD':
      return {
        ...state,
        splitFields: [...state.splitFields, { ...action.payload, id: `field-${Date.now()}` }],
      };
    case 'UPDATE_SPLIT_FIELD':
      return {
        ...state,
        splitFields: state.splitFields.map((f) =>
          f.id === action.payload.id ? { ...f, ...action.payload.updates } : f
        ),
      };
    case 'DELETE_SPLIT_FIELD':
      return {
        ...state,
        splitFields: state.splitFields.filter((f) => f.id !== action.payload),
      };
    case 'ADD_BILLING_ENTITY':
      return {
        ...state,
        billingEntities: [...state.billingEntities, { ...action.payload, id: `entity-${Date.now()}`, createdAt: new Date().toISOString() }],
      };
    case 'UPDATE_BILLING_ENTITY':
      return {
        ...state,
        billingEntities: state.billingEntities.map((e) =>
          e.id === action.payload.id ? { ...e, ...action.payload.updates } : e
        ),
      };
    case 'DELETE_BILLING_ENTITY':
      return {
        ...state,
        billingEntities: state.billingEntities.filter((e) => e.id !== action.payload),
      };
    case 'ADD_BILLING_RULE':
      return {
        ...state,
        billingRules: [...state.billingRules, { ...action.payload, id: `rule-${Date.now()}`, createdAt: new Date().toISOString() }],
      };
    case 'UPDATE_BILLING_RULE':
      return {
        ...state,
        billingRules: state.billingRules.map((r) =>
          r.id === action.payload.id ? { ...r, ...action.payload.updates } : r
        ),
      };
    case 'DELETE_BILLING_RULE':
      return {
        ...state,
        billingRules: state.billingRules.filter((r) => r.id !== action.payload),
      };
    case 'ADD_CUSTOMER':
      return {
        ...state,
        customers: [...state.customers, { ...action.payload, id: `cust-${Date.now()}`, createdAt: new Date().toISOString() }],
      };
    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload.updates } : c
        ),
      };
    case 'DELETE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.filter((c) => c.id !== action.payload),
      };
    case 'UPDATE_CUSTOMER_PROGRESS':
      return {
        ...state,
        customers: state.customers.map((c) =>
          c.id === action.payload.id
            ? { ...c, progressStatus: action.payload.status, updatedAt: new Date().toISOString() }
            : c
        ),
      };
    case 'COLLABORATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map((c) =>
          c.id === action.payload.id
            ? { ...c, collaborators: action.payload.collaborators, updatedAt: new Date().toISOString() }
            : c
        ),
      };
    case 'ASSIGN_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map((c) =>
          c.id === action.payload.id
            ? { ...c, responsiblePersons: action.payload.responsiblePersons, updatedAt: new Date().toISOString() }
            : c
        ),
      };
    case 'TRANSFER_CUSTOMER': {
      return {
        ...state,
        customers: state.customers.map((c) => {
          if (c.id !== action.payload.id) return c;
          const prevOwners = c.responsiblePersons;
          const newCollaborators = prevOwners
            .filter((id) => !c.collaborators.includes(id))
            .concat(c.collaborators);
          return {
            ...c,
            responsiblePersons: [action.payload.newResponsiblePerson],
            collaborators: [...new Set(newCollaborators)],
            updatedAt: new Date().toISOString(),
          };
        }),
      };
    }
    case 'BATCH_COLLABORATE':
      return {
        ...state,
        customers: state.customers.map((c) =>
          action.payload.ids.includes(c.id)
            ? { ...c, collaborators: [...new Set([...c.collaborators, ...action.payload.collaborators])], updatedAt: new Date().toISOString() }
            : c
        ),
      };
    case 'BATCH_ASSIGN':
      return {
        ...state,
        customers: state.customers.map((c) =>
          action.payload.ids.includes(c.id)
            ? { ...c, responsiblePersons: action.payload.responsiblePersons, updatedAt: new Date().toISOString() }
            : c
        ),
      };
    case 'BATCH_TRANSFER':
      return {
        ...state,
        customers: state.customers.map((c) => {
          if (!action.payload.ids.includes(c.id)) return c;
          const prevOwners = c.responsiblePersons;
          const newCollaborators = prevOwners
            .filter((id) => !c.collaborators.includes(id))
            .concat(c.collaborators);
          return {
            ...c,
            responsiblePersons: [action.payload.newResponsiblePerson],
            collaborators: [...new Set(newCollaborators)],
            updatedAt: new Date().toISOString(),
          };
        }),
      };
    case 'ADD_LOG':
      return {
        ...state,
        operationLogs: [
          { ...action.payload, id: `log-${Date.now()}`, timestamp: new Date().toISOString() },
          ...state.operationLogs,
        ],
      };
    case 'ADD_QUOTE':
      return {
        ...state,
        quotes: [...state.quotes, { 
          ...action.payload as any, 
          id: `quote-${Date.now()}`, 
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }],
      };
    case 'UPDATE_QUOTE':
      return {
        ...state,
        quotes: state.quotes.map((q: Quote) =>
          q.id === (action.payload as any).id ? { ...q, ...(action.payload as any).updates, updatedAt: new Date().toISOString() } : q
        ),
      };
    case 'DELETE_QUOTE':
      return {
        ...state,
        quotes: state.quotes.filter((q: Quote) => q.id !== action.payload),
      };
    case 'ADD_APPROVAL_WORKFLOW':
      return {
        ...state,
        approvalWorkflows: [...state.approvalWorkflows, {
          ...action.payload as any,
          id: `aw-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }],
      };
    case 'UPDATE_APPROVAL_WORKFLOW':
      return {
        ...state,
        approvalWorkflows: state.approvalWorkflows.map((w: ApprovalWorkflow) =>
          w.id === (action.payload as any).id ? { ...w, ...(action.payload as any).updates, updatedAt: new Date().toISOString() } : w
        ),
      };
    case 'DELETE_APPROVAL_WORKFLOW':
      return {
        ...state,
        approvalWorkflows: state.approvalWorkflows.filter((w: ApprovalWorkflow) => w.id !== action.payload),
      };
    case 'ADD_AUTO_APPROVAL_RULE':
      return {
        ...state,
        autoApprovalRules: [...state.autoApprovalRules, {
          ...action.payload as any,
          id: `ar-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }],
      };
    case 'UPDATE_AUTO_APPROVAL_RULE':
      return {
        ...state,
        autoApprovalRules: state.autoApprovalRules.map((r: AutoApprovalRule) =>
          r.id === (action.payload as any).id ? { ...r, ...(action.payload as any).updates, updatedAt: new Date().toISOString() } : r
        ),
      };
    case 'DELETE_AUTO_APPROVAL_RULE':
      return {
        ...state,
        autoApprovalRules: state.autoApprovalRules.filter((r: AutoApprovalRule) => r.id !== action.payload),
      };
    case 'ADD_FOLLOWUP':
      return {
        ...state,
        followUps: [...state.followUps, { ...action.payload, id: `fu-${Date.now()}`, createdAt: new Date().toISOString() }],
      };
    case 'UPDATE_FOLLOWUP':
      return {
        ...state,
        followUps: state.followUps.map((fu: FollowUpRecord) =>
          fu.id === action.payload.id ? { ...fu, ...action.payload.updates } : fu
        ),
      };
    case 'ADD_SIGNING_ENTITY':
      return {
        ...state,
        signingEntities: [...state.signingEntities, { ...action.payload, id: `se-${Date.now()}`, createdAt: new Date().toISOString() }],
      };
    case 'UPDATE_SIGNING_ENTITY':
      return {
        ...state,
        signingEntities: state.signingEntities.map((e) =>
          e.id === action.payload.id ? { ...e, ...action.payload.updates } : e
        ),
      };
    case 'DELETE_SIGNING_ENTITY':
      return {
        ...state,
        signingEntities: state.signingEntities.filter((e) => e.id !== action.payload),
      };
    case 'ADD_SERVICE_ENTITY':
      return {
        ...state,
        serviceEntities: [...state.serviceEntities, { ...action.payload, id: `svc-${Date.now()}`, createdAt: new Date().toISOString() }],
      };
    case 'UPDATE_SERVICE_ENTITY':
      return {
        ...state,
        serviceEntities: state.serviceEntities.map((e) =>
          e.id === action.payload.id ? { ...e, ...action.payload.updates } : e
        ),
      };
    case 'DELETE_SERVICE_ENTITY':
      return {
        ...state,
        serviceEntities: state.serviceEntities.filter((e) => e.id !== action.payload),
      };
    case 'ADD_SETTLEMENT_ENTITY':
      return {
        ...state,
        settlementEntities: [...state.settlementEntities, { ...action.payload, id: `stl-${Date.now()}`, createdAt: new Date().toISOString() }],
      };
    case 'UPDATE_SETTLEMENT_ENTITY':
      return {
        ...state,
        settlementEntities: state.settlementEntities.map((e) =>
          e.id === action.payload.id ? { ...e, ...action.payload.updates } : e
        ),
      };
    case 'DELETE_SETTLEMENT_ENTITY':
      return {
        ...state,
        settlementEntities: state.settlementEntities.filter((e) => e.id !== action.payload),
      };
    default:
      return state;
  }
}

// ==================== Context ====================

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { ...defaultState, currentUser });

  const addSplitField = useCallback((field: Omit<SplitField, 'id'>) => {
    dispatch({ type: 'ADD_SPLIT_FIELD', payload: field });
  }, []);

  const updateSplitField = useCallback((id: string, updates: Partial<SplitField>) => {
    dispatch({ type: 'UPDATE_SPLIT_FIELD', payload: { id, updates } });
  }, []);

  const deleteSplitField = useCallback((id: string) => {
    dispatch({ type: 'DELETE_SPLIT_FIELD', payload: id });
  }, []);

  const addBillingEntity = useCallback((entity: Omit<BillingEntity, 'id' | 'createdAt'>) => {
    dispatch({ type: 'ADD_BILLING_ENTITY', payload: entity });
  }, []);

  const updateBillingEntity = useCallback((id: string, updates: Partial<BillingEntity>) => {
    dispatch({ type: 'UPDATE_BILLING_ENTITY', payload: { id, updates } });
  }, []);

  const deleteBillingEntity = useCallback((id: string) => {
    dispatch({ type: 'DELETE_BILLING_ENTITY', payload: id });
  }, []);

  const addBillingRule = useCallback((rule: Omit<BillingRule, 'id' | 'createdAt' | 'createdBy'>) => {
    dispatch({ type: 'ADD_BILLING_RULE', payload: rule });
  }, []);

  const updateBillingRule = useCallback((id: string, updates: Partial<BillingRule>) => {
    dispatch({ type: 'UPDATE_BILLING_RULE', payload: { id, updates } });
  }, []);

  const deleteBillingRule = useCallback((id: string) => {
    dispatch({ type: 'DELETE_BILLING_RULE', payload: id });
  }, []);

  const addCustomer = useCallback((customer: Omit<Customer, 'id' | 'createdAt'>) => {
    dispatch({ type: 'ADD_CUSTOMER', payload: customer });
  }, []);

  const updateCustomer = useCallback((id: string, updates: Partial<Customer>) => {
    dispatch({ type: 'UPDATE_CUSTOMER', payload: { id, updates } });
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    dispatch({ type: 'DELETE_CUSTOMER', payload: id });
  }, []);

  const addLog = useCallback((log: Omit<OperationLog, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_LOG', payload: log });
  }, []);

  const addQuote = useCallback((quote: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>) => {
    dispatch({ type: 'ADD_QUOTE', payload: quote });
  }, []);

  const updateQuote = useCallback((id: string, updates: Partial<Quote>) => {
    dispatch({ type: 'UPDATE_QUOTE', payload: { id, updates } });
  }, []);

  const deleteQuote = useCallback((id: string) => {
    dispatch({ type: 'DELETE_QUOTE', payload: id });
  }, []);

  const addApprovalWorkflow = useCallback((workflow: Omit<ApprovalWorkflow, 'id' | 'createdAt' | 'updatedAt'>) => {
    dispatch({ type: 'ADD_APPROVAL_WORKFLOW', payload: workflow });
  }, []);

  const updateApprovalWorkflow = useCallback((id: string, updates: Partial<ApprovalWorkflow>) => {
    dispatch({ type: 'UPDATE_APPROVAL_WORKFLOW', payload: { id, updates } });
  }, []);

  const deleteApprovalWorkflow = useCallback((id: string) => {
    dispatch({ type: 'DELETE_APPROVAL_WORKFLOW', payload: id });
  }, []);

  const addAutoApprovalRule = useCallback((rule: Omit<AutoApprovalRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    dispatch({ type: 'ADD_AUTO_APPROVAL_RULE', payload: rule });
  }, []);

  const updateAutoApprovalRule = useCallback((id: string, updates: Partial<AutoApprovalRule>) => {
    dispatch({ type: 'UPDATE_AUTO_APPROVAL_RULE', payload: { id, updates } });
  }, []);

  const deleteAutoApprovalRule = useCallback((id: string) => {
    dispatch({ type: 'DELETE_AUTO_APPROVAL_RULE', payload: id });
  }, []);

  // 跟进记录管理
  const addFollowUp = useCallback((followUp: Omit<FollowUpRecord, 'id' | 'createdAt'>) => {
    dispatch({ type: 'ADD_FOLLOWUP', payload: followUp });
  }, []);

  const updateFollowUp = useCallback((id: string, updates: Partial<FollowUpRecord>) => {
    dispatch({ type: 'UPDATE_FOLLOWUP', payload: { id, updates } });
  }, []);

  // 签约主体管理
  const addSigningEntity = useCallback((entity: Omit<SigningEntity, 'id' | 'createdAt'>) => {
    dispatch({ type: 'ADD_SIGNING_ENTITY', payload: entity });
  }, []);

  const updateSigningEntity = useCallback((id: string, updates: Partial<SigningEntity>) => {
    dispatch({ type: 'UPDATE_SIGNING_ENTITY', payload: { id, updates } });
  }, []);

  const deleteSigningEntity = useCallback((id: string) => {
    dispatch({ type: 'DELETE_SIGNING_ENTITY', payload: id });
  }, []);

  // 服务主体管理
  const addServiceEntity = useCallback((entity: Omit<ServiceEntity, 'id' | 'createdAt'>) => {
    dispatch({ type: 'ADD_SERVICE_ENTITY', payload: entity });
  }, []);

  const updateServiceEntity = useCallback((id: string, updates: Partial<ServiceEntity>) => {
    dispatch({ type: 'UPDATE_SERVICE_ENTITY', payload: { id, updates } });
  }, []);

  const deleteServiceEntity = useCallback((id: string) => {
    dispatch({ type: 'DELETE_SERVICE_ENTITY', payload: id });
  }, []);

  // 结算主体管理
  const addSettlementEntity = useCallback((entity: Omit<SettlementEntity, 'id' | 'createdAt'>) => {
    dispatch({ type: 'ADD_SETTLEMENT_ENTITY', payload: entity });
  }, []);

  const updateSettlementEntity = useCallback((id: string, updates: Partial<SettlementEntity>) => {
    dispatch({ type: 'UPDATE_SETTLEMENT_ENTITY', payload: { id, updates } });
  }, []);

  const deleteSettlementEntity = useCallback((id: string) => {
    dispatch({ type: 'DELETE_SETTLEMENT_ENTITY', payload: id });
  }, []);

  // 客户协同操作
  const updateCustomerProgress = useCallback((id: string, status: ProgressStatus) => {
    dispatch({ type: 'UPDATE_CUSTOMER_PROGRESS', payload: { id, status } });
  }, []);

  const collaborateCustomer = useCallback((id: string, collaborators: string[]) => {
    dispatch({ type: 'COLLABORATE_CUSTOMER', payload: { id, collaborators } });
  }, []);

  const assignCustomer = useCallback((id: string, responsiblePersons: string[]) => {
    dispatch({ type: 'ASSIGN_CUSTOMER', payload: { id, responsiblePersons } });
  }, []);

  const transferCustomer = useCallback((id: string, newResponsiblePerson: string, reason?: string) => {
    dispatch({ type: 'TRANSFER_CUSTOMER', payload: { id, newResponsiblePerson, reason } });
  }, []);

  const batchCollaborate = useCallback((ids: string[], collaborators: string[]) => {
    dispatch({ type: 'BATCH_COLLABORATE', payload: { ids, collaborators } });
  }, []);

  const batchAssign = useCallback((ids: string[], responsiblePersons: string[]) => {
    dispatch({ type: 'BATCH_ASSIGN', payload: { ids, responsiblePersons } });
  }, []);

  const batchTransfer = useCallback((ids: string[], newResponsiblePerson: string, reason?: string) => {
    dispatch({ type: 'BATCH_TRANSFER', payload: { ids, newResponsiblePerson, reason } });
  }, []);

  // 规则匹配逻辑
  const matchBillingEntity = useCallback((params: Record<string, string>) => {
    const { billingRules, billingEntities } = state;
    const matchedConditions: string[] = [];

    for (const rule of billingRules) {
      if (rule.status !== 'active') continue;
      
      // 如果有 conditionGroup，使用嵌套分组匹配
      if (rule.conditionGroup) {
        const passed = evaluateRuleGroup(rule.conditionGroup, params);
        if (passed) {
          const entity = billingEntities.find(e => e.name === rule.targetBillingEntity);
          return { entity: entity || null, rule, matchedConditions };
        }
      }
    }

    return { entity: null, rule: null, matchedConditions };
  }, [state]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        splitFields: state.splitFields,
        billingEntities: state.billingEntities,
        billingRules: state.billingRules,
        customers: state.customers,
        quotes: state.quotes,
        salesQuotes: state.salesQuotes,
        operationLogs: state.operationLogs,
        followUps: state.followUps,
        opportunities: state.opportunities,
        contacts: state.contacts,
        contracts: state.contracts,
        riskApprovals: state.riskApprovals,
        serviceEntities: state.serviceEntities,
        signingEntities: state.signingEntities,
        settlementEntities: state.settlementEntities,
        addSplitField,
        updateSplitField,
        deleteSplitField,
        addBillingEntity,
        updateBillingEntity,
        deleteBillingEntity,
        addBillingRule,
        updateBillingRule,
        deleteBillingRule,
        addSigningEntity,
        updateSigningEntity,
        deleteSigningEntity,
        addServiceEntity,
        updateServiceEntity,
        deleteServiceEntity,
        addSettlementEntity,
        updateSettlementEntity,
        deleteSettlementEntity,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addQuote,
        updateQuote,
        deleteQuote,
        addLog,
        matchBillingEntity,
        approvalWorkflows: state.approvalWorkflows,
        autoApprovalRules: state.autoApprovalRules,
        approvalWorkflowHistories: state.approvalWorkflowHistories,
        aiTranscriptions: state.aiTranscriptions,
        quoteTemplates: state.quoteTemplates,
        addApprovalWorkflow,
        updateApprovalWorkflow,
        deleteApprovalWorkflow,
        addAutoApprovalRule,
        updateAutoApprovalRule,
        deleteAutoApprovalRule,
        addFollowUp,
        updateFollowUp,
        updateCustomerProgress,
        collaborateCustomer,
        assignCustomer,
        transferCustomer,
        batchCollaborate,
        batchAssign,
        batchTransfer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export const useAppContext = useApp;

// ==================== 工具函数 ====================

// 评估规则分组
function evaluateRuleGroup(group: RuleGroup, params: Record<string, string>): boolean {
  const results: boolean[] = [];

  for (const item of (group.items || [])) {
    if (item.type === 'condition' && item.condition) {
      const cond = item.condition as RuleCondition;
      const fieldKey = cond.fieldKey || cond.field || '';
      const result = evaluateCondition(cond, params[fieldKey] || '');
      results.push(result);
    } else if (item.type === 'group' && item.group) {
      const result = evaluateRuleGroup(item.group as RuleGroup, params);
      results.push(result);
    }
  }

  if (results.length === 0) return false;
  return group.logic === 'OR' ? results.some(r => r) : results.every(r => r);
}

// 评估单个条件
function evaluateCondition(condition: RuleCondition, actualValue: string): boolean {
  const { operator, value } = condition;
  const values = value.split(',').map(v => v.trim());

  switch (operator) {
    case 'equals':
      return actualValue === value;
    case 'not_equals':
      return actualValue !== value;
    case 'contains':
      return actualValue.includes(value);
    case 'not_contains':
      return !actualValue.includes(value);
    case 'in':
      return values.includes(actualValue);
    case 'not_in':
      return !values.includes(actualValue);
    case 'any':
      return true;
    case 'empty':
      return actualValue === '' || actualValue === undefined;
    case 'not_empty':
      return actualValue !== '' && actualValue !== undefined;
    case 'regex':
      try {
        return new RegExp(value).test(actualValue);
      } catch {
        return false;
      }
    default:
      return false;
  }
}
