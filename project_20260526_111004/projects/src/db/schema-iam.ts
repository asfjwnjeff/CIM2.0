import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// ==================== 用户表 ====================

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  realName: text('real_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  department: text('department'),
  password: text('password').notNull(),
  avatar: text('avatar'),
  status: text('status').default('active'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

// ==================== 角色表 ====================

export const roles = sqliteTable('roles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  description: text('description'),
  status: text('status').default('active'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

// ==================== 权限资源表 ====================

export const permissions = sqliteTable('permissions', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  type: text('type').notNull(), // 'menu' | 'button'
  parentId: text('parent_id'),
  path: text('path'),
  sort: integer('sort').default(1),
  status: text('status').default('active'),
  createdAt: text('created_at'),
});

// ==================== 角色-权限关联表 ====================

export const rolePermissions = sqliteTable('role_permissions', {
  id: text('id').primaryKey(),
  roleId: text('role_id').notNull().references(() => roles.id),
  permissionId: text('permission_id').notNull().references(() => permissions.id),
});

// ==================== 用户-角色关联表 ====================

export const userRoles = sqliteTable('user_roles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  roleId: text('role_id').notNull().references(() => roles.id),
});

// ==================== 数据权限配置表 ====================

export const dataPermissions = sqliteTable('data_permissions', {
  id: text('id').primaryKey(),
  dimension: text('dimension').notNull(), // 'user' | 'role' | 'department'
  targetId: text('target_id').notNull(),
  targetName: text('target_name'),
  customerIds: text('customer_ids'), // JSON array
  updatedAt: text('updated_at'),
});

// ==================== 操作审计日志表 ====================

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  userName: text('user_name'),
  action: text('action').notNull(), // 'login' | 'logout' | 'create' | 'update' | 'delete' | 'grant_permission' | 'revoke_permission'
  resource: text('resource'),
  resourceId: text('resource_id'),
  detail: text('detail'), // JSON
  ip: text('ip'),
  createdAt: text('created_at').notNull(),
});
