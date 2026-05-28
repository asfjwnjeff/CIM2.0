import {
  type GroupCondition,
  type GroupDefinition,
  type GroupFieldMeta,
  type ModuleGroupConfig,
} from '@/lib/types';

export type ModuleKey = 'customers' | 'followup' | 'opportunities' | 'approvals';

// ==================== 日期工具 ====================

function toDate(val: unknown): Date | null {
  if (!val) return null;
  const d = new Date(val as string);
  return isNaN(d.getTime()) ? null : d;
}

function isToday(dateStr: string): boolean {
  const d = toDate(dateStr);
  if (!d) return false;
  const now = new Date();
  return d.getFullYear() === now.getFullYear()
    && d.getMonth() === now.getMonth()
    && d.getDate() === now.getDate();
}

function isThisWeek(dateStr: string): boolean {
  const d = toDate(dateStr);
  if (!d) return false;
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return d >= startOfWeek && d < endOfWeek;
}

function isThisMonth(dateStr: string): boolean {
  const d = toDate(dateStr);
  if (!d) return false;
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function isThisYear(dateStr: string): boolean {
  const d = toDate(dateStr);
  if (!d) return false;
  return d.getFullYear() === new Date().getFullYear();
}

// ==================== 字段元数据 ====================

export const CUSTOMER_FIELD_META: GroupFieldMeta[] = [
  { key: 'status', label: '客户状态', type: 'select', options: [
    { value: 'active', label: '正常' }, { value: 'inactive', label: '停用' },
    { value: 'potential', label: '潜在' }, { value: 'frozen', label: '冻结' },
  ]},
  { key: 'progressStatus', label: '跟进进度', type: 'select', options: [
    { value: 'newly_acquired', label: '新客户' }, { value: 'preliminary_intent', label: '初步意向' },
    { value: 'pending_followup', label: '待跟进' }, { value: 'new_opportunity', label: '新商机' },
    { value: 'deal_closed', label: '已成交' }, { value: 'invalid', label: '无效' },
  ]},
  { key: 'level', label: '客户等级', type: 'select', options: [
    { value: 'vip', label: 'VIP' }, { value: 'key', label: '重点' },
    { value: 'normal', label: '普通' }, { value: 'small', label: '小微' },
  ]},
  { key: 'createdAt', label: '创建时间', type: 'date' },
  { key: 'responsiblePersons', label: '负责人', type: 'string' },
  { key: 'collaborators', label: '协同人', type: 'string' },
];

export const FOLLOWUP_FIELD_META: GroupFieldMeta[] = [
  { key: 'status', label: '跟进状态', type: 'select', options: [
    { value: 'new', label: '新需求' }, { value: 'discussing', label: '沟通中' },
    { value: 'promoting', label: '推进中' }, { value: 'completed', label: '成功' },
    { value: 'cancelled', label: '无进展' }, { value: 'no_progress', label: '需求取消' },
    { value: 'terminated', label: '合同终止' },
  ]},
  { key: 'type', label: '跟进类型', type: 'select', options: [
    { value: 'visit', label: '拜访' }, { value: 'phone', label: '电话' },
    { value: 'email', label: '邮件' }, { value: 'meeting', label: '会议' },
    { value: 'wechat', label: '微信' }, { value: 'other', label: '其他' },
  ]},
  { key: 'method', label: '跟进方式', type: 'select', options: [
    { value: 'onsite', label: '现场' }, { value: 'remote', label: '远程' },
    { value: 'phone_call', label: '电话' }, { value: 'video', label: '视频' },
    { value: 'email', label: '邮件' }, { value: 'other', label: '其他' },
  ]},
  { key: 'date', label: '跟进日期', type: 'date' },
  { key: 'createdAt', label: '创建时间', type: 'date' },
  { key: 'owner', label: '负责人', type: 'string' },
  { key: 'collaborators', label: '协同人', type: 'string' },
];

export const OPPORTUNITY_FIELD_META: GroupFieldMeta[] = [
  { key: 'stage', label: '销售阶段', type: 'select', options: [
    { value: 'demand_confirmation', label: '需求确认' },
    { value: 'requirements_confirmation', label: '方案报价' },
    { value: 'solution_quotation', label: '商务谈判' },
    { value: 'business_negotiation', label: '跟进中' },
    { value: 'following_up', label: '跟进中' },
    { value: 'following', label: '跟进中' },
    { value: 'won', label: '赢单' },
    { value: 'lost', label: '输单' },
  ]},
  { key: 'serviceProducts', label: '服务产品', type: 'multiselect', options: [
    { value: '货代', label: '货代' }, { value: '关务', label: '关务' },
    { value: '仓储', label: '仓储' }, { value: '运输', label: '运输' },
    { value: '进出口', label: '进出口' }, { value: '维修', label: '维修' },
    { value: '合同物流', label: '合同物流' },
  ]},
  { key: 'createdAt', label: '创建时间', type: 'date' },
  { key: 'amount', label: '商机金额', type: 'number' },
  { key: 'owner', label: '负责人', type: 'string' },
  { key: 'ownerName', label: '负责人姓名', type: 'string' },
];

export const APPROVAL_FIELD_META: GroupFieldMeta[] = [
  { key: 'approvalStatus', label: '审批状态', type: 'select', options: [
    { value: '审批中', label: '审批中' }, { value: '审批完成', label: '审批完成' },
    { value: '已驳回', label: '已驳回' }, { value: '草稿', label: '草稿' },
  ]},
  { key: 'serviceProduct', label: '服务产品', type: 'select', options: [
    { value: '货代', label: '货代' }, { value: '关务', label: '关务' },
    { value: '仓储', label: '仓储' }, { value: '运输', label: '运输' },
    { value: '进出口', label: '进出口' }, { value: '维修', label: '维修' },
    { value: '合同物流', label: '合同物流' },
  ]},
  { key: 'involvesTradeAgent', label: '贸易代理', type: 'select', options: [
    { value: 'true', label: '涉及' }, { value: 'false', label: '不涉及' },
  ]},
  { key: 'createdAt', label: '创建时间', type: 'date' },
  { key: 'submitter', label: '提交人', type: 'string' },
];

export const FIELD_META_MAP: Record<ModuleKey, GroupFieldMeta[]> = {
  customers: CUSTOMER_FIELD_META,
  followup: FOLLOWUP_FIELD_META,
  opportunities: OPPORTUNITY_FIELD_META,
  approvals: APPROVAL_FIELD_META,
};

// ==================== 系统分组工厂 ====================

function getDateField(moduleKey: ModuleKey): string {
  const map: Record<ModuleKey, string> = {
    customers: 'createdAt',
    followup: 'date',
    opportunities: 'createdAt',
    approvals: 'createdAt',
  };
  return map[moduleKey];
}

function getOwnerField(moduleKey: ModuleKey): string {
  const map: Record<ModuleKey, string> = {
    customers: 'responsiblePersons',
    followup: 'owner',
    opportunities: 'owner',
    approvals: 'submitter',
  };
  return map[moduleKey];
}

function getCollabField(moduleKey: ModuleKey): string {
  const map: Record<ModuleKey, string> = {
    customers: 'collaborators',
    followup: 'collaborators',
    opportunities: '',
    approvals: '',
  };
  return map[moduleKey];
}

function genId(): string {
  return `cond-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createSystemGroups(moduleKey: ModuleKey, currentUserId: string): GroupDefinition[] {
  const dateField = getDateField(moduleKey);
  const ownerField = getOwnerField(moduleKey);
  const collabField = getCollabField(moduleKey);

  const groups: GroupDefinition[] = [
    { id: 'sys-all', name: '全部', isSystem: true, conditions: [], sortOrder: 0 },
    { id: 'sys-today', name: '当日新增', isSystem: true, conditions: [
      { id: genId(), field: dateField, operator: 'today', value: '' },
    ], sortOrder: 1 },
    { id: 'sys-month', name: '当月新增', isSystem: true, conditions: [
      { id: genId(), field: dateField, operator: 'this_month', value: '' },
    ], sortOrder: 2 },
    { id: 'sys-mine', name: '我负责的', isSystem: true, conditions: [
      { id: genId(), field: ownerField, operator: 'contains', value: currentUserId },
    ], sortOrder: 3 },
  ];

  if (collabField) {
    groups.push({
      id: 'sys-collab', name: '我协同的', isSystem: true, conditions: [
        { id: genId(), field: collabField, operator: 'contains', value: currentUserId },
      ], sortOrder: 4,
    });
  }

  return groups;
}

// ==================== localStorage 工具 ====================

function storageKey(moduleKey: ModuleKey): string {
  return `cim-groups-${moduleKey}`;
}

export function loadGroupConfig(moduleKey: ModuleKey): ModuleGroupConfig {
  try {
    const raw = localStorage.getItem(storageKey(moduleKey));
    if (raw) {
      const config = JSON.parse(raw) as ModuleGroupConfig;
      if (config.groups && Array.isArray(config.groups) && config.activeGroupId) {
        return config;
      }
    }
  } catch { /* ignore */ }
  return { groups: [], activeGroupId: 'sys-all' };
}

export function saveGroupConfig(moduleKey: ModuleKey, config: ModuleGroupConfig): void {
  try {
    const toSave: ModuleGroupConfig = {
      ...config,
      groups: config.groups.filter(g => !g.isSystem),
    };
    localStorage.setItem(storageKey(moduleKey), JSON.stringify(toSave));
  } catch { /* quota exceeded, silently ignore */ }
}

// ==================== 条件匹配引擎 ====================

function getFieldValue(item: Record<string, unknown>, field: string): unknown {
  return item[field] ?? null;
}

function matchSingleCondition(item: unknown, cond: GroupCondition): boolean {
  const raw = getFieldValue(item as Record<string, unknown>, cond.field);

  const { operator, value } = cond;

  switch (operator) {
    case 'empty':
      return raw === null || raw === undefined || raw === '' || (Array.isArray(raw) && raw.length === 0);
    case 'not_empty':
      return !(raw === null || raw === undefined || raw === '' || (Array.isArray(raw) && raw.length === 0));
    case 'today':
      return raw ? isToday(String(raw)) : false;
    case 'this_week':
      return raw ? isThisWeek(String(raw)) : false;
    case 'this_month':
      return raw ? isThisMonth(String(raw)) : false;
    case 'this_year':
      return raw ? isThisYear(String(raw)) : false;
    default: break;
  }

  if (raw === null || raw === undefined || raw === '') return false;

  switch (operator) {
    case 'equals':
      return String(raw) === value;
    case 'not_equals':
      return String(raw) !== value;
    case 'contains': {
      if (Array.isArray(raw)) {
        return raw.some(v => String(v).includes(value));
      }
      return String(raw).includes(value);
    }
    case 'not_contains': {
      if (Array.isArray(raw)) {
        return !raw.some(v => String(v).includes(value));
      }
      return !String(raw).includes(value);
    }
    case 'in': {
      const vals = value.split(',').map(v => v.trim());
      return vals.includes(String(raw));
    }
    case 'not_in': {
      const vals = value.split(',').map(v => v.trim());
      return !vals.includes(String(raw));
    }
    case 'gt':
      return Number(raw) > Number(value);
    case 'gte':
      return Number(raw) >= Number(value);
    case 'lt':
      return Number(raw) < Number(value);
    case 'lte':
      return Number(raw) <= Number(value);
    default:
      return true;
  }
}

export function matchGroupConditions(item: unknown, conditions: GroupCondition[]): boolean {
  if (conditions.length === 0) return true;
  return conditions.every(c => matchSingleCondition(item, c));
}

export function applyGroupFilter<T>(
  items: T[],
  conditions: GroupCondition[],
): T[] {
  if (conditions.length === 0) return items;
  return items.filter(item => matchGroupConditions(item, conditions));
}
