import { randomBytes, scryptSync, timingSafeEqual, createHash, randomUUID } from 'crypto';

// ==================== 密码哈希工具 ====================

/** 使用 scrypt + salt 哈希密码，格式: "scrypt:salt:hash" */
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

/** 验证密码，兼容旧的 SHA-256 格式 */
function verifyPassword(password: string, stored: string): boolean {
  // 新格式: scrypt:salt:hash
  if (stored.startsWith('scrypt:')) {
    const [, salt, hash] = stored.split(':');
    const inputHash = scryptSync(password, salt, 64);
    const storedHash = Buffer.from(hash, 'hex');
    if (inputHash.length !== storedHash.length) return false;
    return timingSafeEqual(inputHash, storedHash);
  }
  // 兼容旧 SHA-256 格式
  const legacyHash = createHash('sha256').update(password).digest('hex');
  return legacyHash === stored;
}

// ==================== 默认权限资源 ====================

export const DEFAULT_PERMISSIONS = [
  // 菜单权限
  { id: 'perm-menu-dashboard', name: '首页', code: 'dashboard:view', type: 'menu', parentId: null, path: '/', sort: 1 },
  { id: 'perm-menu-customers', name: '客户管理', code: 'customers:view', type: 'menu', parentId: null, path: '/customers', sort: 2 },
  { id: 'perm-menu-followup', name: '客户跟进', code: 'followup:view', type: 'menu', parentId: null, path: '/followup', sort: 3 },
  { id: 'perm-menu-opportunities', name: '商机管理', code: 'opportunities:view', type: 'menu', parentId: null, path: '/opportunities', sort: 4 },
  { id: 'perm-menu-quotes', name: '售前报价', code: 'quotes:view', type: 'menu', parentId: null, path: '/quotes', sort: 5 },
  { id: 'perm-menu-approvals', name: '风控审批', code: 'approvals:view', type: 'menu', parentId: null, path: '/approvals', sort: 6 },
  { id: 'perm-menu-approval-workflows', name: '流程配置', code: 'approval.workflows:view', type: 'menu', parentId: 'perm-menu-approvals', path: '/approval/workflows', sort: 1 },
  { id: 'perm-menu-approval-rules', name: '自动规则', code: 'approval.rules:view', type: 'menu', parentId: 'perm-menu-approvals', path: '/approval/auto-rules', sort: 2 },
  { id: 'perm-menu-approval-fields', name: '字段配置', code: 'approval.fields:view', type: 'menu', parentId: 'perm-menu-approvals', path: '/approval/fields', sort: 3 },
  { id: 'perm-menu-entities', name: '主体管理', code: 'entities:view', type: 'menu', parentId: null, path: '/entities', sort: 7 },
  { id: 'perm-menu-entities-service', name: '服务主体', code: 'entities.service:view', type: 'menu', parentId: 'perm-menu-entities', path: '/entities/service', sort: 1 },
  { id: 'perm-menu-entities-signing', name: '签约主体', code: 'entities.signing:view', type: 'menu', parentId: 'perm-menu-entities', path: '/entities/signing', sort: 2 },
  { id: 'perm-menu-entities-settlement', name: '结算主体', code: 'entities.settlement:view', type: 'menu', parentId: 'perm-menu-entities', path: '/entities/settlement', sort: 3 },
  { id: 'perm-menu-rules', name: '账单主体规则管理', code: 'rules:view', type: 'menu', parentId: null, path: '/rules', sort: 8 },
  { id: 'perm-menu-billing-fields', name: '账单拆分字段管理', code: 'billing-fields:view', type: 'menu', parentId: null, path: '/customer-billing-fields', sort: 9 },
  { id: 'perm-menu-settings', name: '系统管理', code: 'settings:view', type: 'menu', parentId: null, path: '/settings', sort: 10 },
  { id: 'perm-menu-settings-dict', name: '字典管理', code: 'settings.dict:view', type: 'menu', parentId: 'perm-menu-settings', path: '/settings/dictionary', sort: 1 },
  { id: 'perm-menu-settings-api', name: '接口管理', code: 'settings.api:view', type: 'menu', parentId: 'perm-menu-settings', path: '/settings/api', sort: 2 },
  { id: 'perm-menu-permissions', name: '权限管理', code: 'permissions:view', type: 'menu', parentId: null, path: '/settings/permissions', sort: 11 },
  { id: 'perm-menu-permissions-roles', name: '角色管理', code: 'permissions.roles:view', type: 'menu', parentId: 'perm-menu-permissions', path: '/settings/roles', sort: 1 },
  { id: 'perm-menu-permissions-users', name: '用户管理', code: 'permissions.users:view', type: 'menu', parentId: 'perm-menu-permissions', path: '/settings/users', sort: 2 },
  { id: 'perm-menu-permissions-functions', name: '功能管理', code: 'permissions.functions:view', type: 'menu', parentId: 'perm-menu-permissions', path: '/settings/functions', sort: 3 },
  { id: 'perm-menu-permissions-data', name: '数据权限管理', code: 'permissions.data:view', type: 'menu', parentId: 'perm-menu-permissions', path: '/settings/data-permissions', sort: 4 },
  { id: 'perm-menu-audit-logs', name: '审计日志', code: 'audit-logs:view', type: 'menu', parentId: 'perm-menu-permissions', path: '/settings/audit-logs', sort: 5 },

  // 按钮权限 - 客户管理
  { id: 'perm-btn-customers-create', name: '新增客户', code: 'customers:create', type: 'button', parentId: null, path: null, sort: 1 },
  { id: 'perm-btn-customers-edit', name: '编辑客户', code: 'customers:edit', type: 'button', parentId: null, path: null, sort: 2 },
  { id: 'perm-btn-customers-delete', name: '删除客户', code: 'customers:delete', type: 'button', parentId: null, path: null, sort: 3 },
  { id: 'perm-btn-customers-export', name: '导出客户', code: 'customers:export', type: 'button', parentId: null, path: null, sort: 4 },

  // 按钮权限 - 跟进
  { id: 'perm-btn-followup-create', name: '新建跟进', code: 'followup:create', type: 'button', parentId: null, path: null, sort: 1 },
  { id: 'perm-btn-followup-edit', name: '编辑跟进', code: 'followup:edit', type: 'button', parentId: null, path: null, sort: 2 },
  { id: 'perm-btn-followup-delete', name: '删除跟进', code: 'followup:delete', type: 'button', parentId: null, path: null, sort: 3 },

  // 按钮权限 - 商机
  { id: 'perm-btn-opportunities-create', name: '新建商机', code: 'opportunities:create', type: 'button', parentId: null, path: null, sort: 1 },
  { id: 'perm-btn-opportunities-edit', name: '编辑商机', code: 'opportunities:edit', type: 'button', parentId: null, path: null, sort: 2 },
  { id: 'perm-btn-opportunities-delete', name: '删除商机', code: 'opportunities:delete', type: 'button', parentId: null, path: null, sort: 3 },

  // 按钮权限 - 报价
  { id: 'perm-btn-quotes-create', name: '新建报价', code: 'quotes:create', type: 'button', parentId: null, path: null, sort: 1 },
  { id: 'perm-btn-quotes-edit', name: '编辑报价', code: 'quotes:edit', type: 'button', parentId: null, path: null, sort: 2 },
  { id: 'perm-btn-quotes-delete', name: '删除报价', code: 'quotes:delete', type: 'button', parentId: null, path: null, sort: 3 },
  { id: 'perm-btn-quotes-approve', name: '审批报价', code: 'quotes:approve', type: 'button', parentId: null, path: null, sort: 4 },

  // 按钮权限 - 规则
  { id: 'perm-btn-rules-create', name: '新增规则', code: 'rules:create', type: 'button', parentId: null, path: null, sort: 1 },
  { id: 'perm-btn-rules-edit', name: '编辑规则', code: 'rules:edit', type: 'button', parentId: null, path: null, sort: 2 },
  { id: 'perm-btn-rules-delete', name: '删除规则', code: 'rules:delete', type: 'button', parentId: null, path: null, sort: 3 },

  // 按钮权限 - 审批
  { id: 'perm-btn-approvals-approve', name: '审批通过', code: 'approvals:approve', type: 'button', parentId: null, path: null, sort: 1 },
  { id: 'perm-btn-approvals-reject', name: '审批驳回', code: 'approvals:reject', type: 'button', parentId: null, path: null, sort: 2 },

  // 按钮权限 - 权限管理
  { id: 'perm-btn-users-create', name: '新增用户', code: 'permissions.users:create', type: 'button', parentId: null, path: null, sort: 1 },
  { id: 'perm-btn-users-edit', name: '编辑用户', code: 'permissions.users:edit', type: 'button', parentId: null, path: null, sort: 2 },
  { id: 'perm-btn-users-delete', name: '删除用户', code: 'permissions.users:delete', type: 'button', parentId: null, path: null, sort: 3 },
  { id: 'perm-btn-roles-create', name: '新增角色', code: 'permissions.roles:create', type: 'button', parentId: null, path: null, sort: 1 },
  { id: 'perm-btn-roles-edit', name: '编辑角色', code: 'permissions.roles:edit', type: 'button', parentId: null, path: null, sort: 2 },
  { id: 'perm-btn-roles-delete', name: '删除角色', code: 'permissions.roles:delete', type: 'button', parentId: null, path: null, sort: 3 },
  { id: 'perm-btn-functions-create', name: '新增功能', code: 'permissions.functions:create', type: 'button', parentId: null, path: null, sort: 1 },
  { id: 'perm-btn-functions-edit', name: '编辑功能', code: 'permissions.functions:edit', type: 'button', parentId: null, path: null, sort: 2 },
  { id: 'perm-btn-functions-delete', name: '删除功能', code: 'permissions.functions:delete', type: 'button', parentId: null, path: null, sort: 3 },
];

// ==================== 默认角色 ====================

export const DEFAULT_ROLES = [
  {
    id: 'role-admin',
    name: '系统管理员',
    code: 'admin',
    description: '拥有系统所有功能的访问和管理权限',
    permissionIds: DEFAULT_PERMISSIONS.map(p => p.id), // 全部权限
  },
  {
    id: 'role-finance',
    name: '财务人员',
    code: 'finance',
    description: '负责账单拆分规则配置和订单映射管理',
    permissionIds: [
      'perm-menu-dashboard', 'perm-menu-customers', 'perm-menu-rules',
      'perm-btn-customers-export',
      'perm-btn-rules-create', 'perm-btn-rules-edit', 'perm-btn-rules-delete',
    ],
  },
  {
    id: 'role-cm',
    name: '客户经理',
    code: 'customer_manager',
    description: '负责客户信息维护和上下游关系管理',
    permissionIds: [
      'perm-menu-dashboard', 'perm-menu-customers', 'perm-menu-followup',
      'perm-menu-opportunities', 'perm-menu-quotes', 'perm-menu-entities',
      'perm-menu-entities-service', 'perm-menu-entities-signing', 'perm-menu-entities-settlement',
      'perm-btn-customers-create', 'perm-btn-customers-edit',
      'perm-btn-followup-create', 'perm-btn-followup-edit',
      'perm-btn-opportunities-create', 'perm-btn-opportunities-edit',
      'perm-btn-quotes-create', 'perm-btn-quotes-edit',
    ],
  },
  {
    id: 'role-data',
    name: '数据管理员',
    code: 'data_manager',
    description: '负责字典管理和字段配置',
    permissionIds: [
      'perm-menu-dashboard', 'perm-menu-settings', 'perm-menu-settings-dict',
      'perm-menu-billing-fields',
    ],
  },
  {
    id: 'role-auditor',
    name: '审计人员',
    code: 'auditor',
    description: '负责查看操作日志和数据审计',
    permissionIds: [
      'perm-menu-dashboard', 'perm-menu-customers', 'perm-menu-audit-logs',
      'perm-btn-customers-export',
    ],
  },
];

// ==================== 默认用户 ====================

export const DEFAULT_USERS = [
  {
    id: 'user-admin',
    username: 'admin',
    realName: '系统管理员',
    email: 'admin@cim.com',
    phone: '13800000001',
    department: '信息技术部',
    password: hashPassword('admin123'),
    roleIds: ['role-admin'],
    status: 'active',
  },
  {
    id: 'user-finance01',
    username: 'finance01',
    realName: '张三',
    email: 'zhangsan@cim.com',
    phone: '13800000002',
    department: '财务部',
    password: hashPassword('123456'),
    roleIds: ['role-finance'],
    status: 'active',
  },
  {
    id: 'user-cm01',
    username: 'cm01',
    realName: '王五',
    email: 'wangwu@cim.com',
    phone: '13800000003',
    department: '客户服务部',
    password: hashPassword('123456'),
    roleIds: ['role-cm'],
    status: 'active',
  },
  {
    id: 'user-data01',
    username: 'data01',
    realName: '赵六',
    email: 'zhaoliu@cim.com',
    phone: '13800000004',
    department: '数据中心',
    password: hashPassword('123456'),
    roleIds: ['role-data'],
    status: 'active',
  },
  {
    id: 'user-auditor01',
    username: 'auditor01',
    realName: '钱七',
    email: 'qianqi@cim.com',
    phone: '13800000005',
    department: '审计部',
    password: hashPassword('123456'),
    roleIds: ['role-auditor'],
    status: 'active',
  },
];

// ==================== 工具函数 ====================

export { hashPassword, verifyPassword };

/** 生成唯一 ID */
export function genId(): string {
  return randomUUID();
}
