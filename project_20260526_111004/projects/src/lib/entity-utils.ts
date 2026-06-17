import type { Customer, EntityType } from './types';

// ====== 主体类型标签 / 颜色 ======

export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  signing: '签约主体',
  service: '服务主体',
  settlement: '结算主体',
};

/** Tailwind 颜色类（背景 / 文字 / 浅色背景） */
export const ENTITY_TYPE_COLORS: Record<EntityType, { bg: string; text: string; light: string }> = {
  signing:  { bg: '#2D3BFF', text: '#2D3BFF', light: '#E8EBFF' },
  service:  { bg: '#0D8A5E', text: '#0D8A5E', light: '#E6F7F0' },
  settlement: { bg: '#E8850C', text: '#E8850C', light: '#FFF4E8' },
};

export function getEntityTypeLabel(type: EntityType): string {
  return ENTITY_TYPE_LABELS[type];
}

export function getEntityTypeColor(type: EntityType): { bg: string; text: string; light: string } {
  return ENTITY_TYPE_COLORS[type];
}

// ====== 必填字段清单 ======

/** 签约主体（CIM 来源）的必填字段 */
const SIGNING_REQUIRED_FIELDS = [
  'name',
  'responsiblePersons',
  'basicInfo.unifiedSocialCreditCode',
  'basicInfo.industryCategory',
  'basicInfo.countryRegion',
  'basicInfo.serviceProducts',
];

/** CPQ 服务主体额外必填字段 */
const SERVICE_CPQ_EXTRA_FIELDS = [
  'domesticFlag',
  'settlementCycle',
  'invoiceAddress',
  'bankAccounts',
];

/** CPQ 结算主体额外必填字段 */
const SETTLEMENT_CPQ_EXTRA_FIELDS = [
  'domesticFlag',
  'settlementCycle',
  'invoiceAddress',
  'bankAccounts',
  'settlementRelationType',
  'settlementRelationName',
];

// ====== 信息完整度计算 ======

/**
 * 从 Customer 对象中按路径取嵌套值
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: unknown, key: string) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * 判断一个字段值是否"已填写"
 * - string: 非空
 * - string[]: 长度 > 0
 * - object[]: 长度 > 0
 * - 其他: 非 null / undefined
 */
function isFieldFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export interface CompletenessResult {
  percentage: number;
  total: number;
  filled: number;
  missingFields: string[];
}

/**
 * 计算客户信息完整度（仅必填字段）
 * 仅对草稿状态和 CPQ 来源的服务/结算主体有意义
 */
export function getEntityCompleteness(customer: Customer): CompletenessResult {
  const requiredFields = getRequiredFields(customer);
  const filled: string[] = [];
  const missing: string[] = [];

  const record = customer as unknown as Record<string, unknown>;

  for (const field of requiredFields) {
    const value = getNestedValue(record, field);
    if (isFieldFilled(value)) {
      filled.push(field);
    } else {
      missing.push(field);
    }
  }

  const total = requiredFields.length;
  const percentage = total === 0 ? 100 : Math.round((filled.length / total) * 100);

  return { percentage, total, filled: filled.length, missingFields: missing };
}

/**
 * 根据客户的主体类型和数据来源，确定需要检查的必填字段列表
 */
function getRequiredFields(customer: Customer): string[] {
  const entityTypes = customer.entityTypes ?? [];
  const isCpq = customer.sourceSystem === 'cpq';

  // 基础必填字段（所有主体类型共用）
  let fields = [...SIGNING_REQUIRED_FIELDS];

  if (isCpq) {
    if (entityTypes.includes('service')) {
      fields = [...fields, ...SERVICE_CPQ_EXTRA_FIELDS];
    }
    if (entityTypes.includes('settlement')) {
      // 结算主体可能同时也有服务字段
      const extra = new Set([...SERVICE_CPQ_EXTRA_FIELDS, ...SETTLEMENT_CPQ_EXTRA_FIELDS]);
      fields = [...fields, ...extra];
    }
  }

  // 如果 entityTypes 为空且 sourceSystem 为空（旧签约主体数据），默认使用签约主体必填项
  return [...new Set(fields)];
}

/**
 * 判断是否需要显示完整度相关信息（列表提醒/详情横幅）
 * 条件：草稿状态 或 CPQ 来源的服务/结算主体
 */
export function shouldShowCompleteness(customer: Customer): boolean {
  if (customer.status === 'blacklisted') return false;
  if (customer.status === 'draft') return true;
  if (customer.sourceSystem === 'cpq') {
    const types = customer.entityTypes ?? [];
    return types.includes('service') || types.includes('settlement');
  }
  return false;
}
