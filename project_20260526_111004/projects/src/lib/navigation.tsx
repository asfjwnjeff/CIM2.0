import React from 'react';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  permissionCode?: string;  // 权限码，用于菜单过滤
  children?: NavItem[];
}

/* ====== 极简 SVG 图标 ====== */

export const NavIcons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Clipboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  StickyNote: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Briefcase: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  FileText: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  ShieldCheck: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Building: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426-1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Search: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Bell: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
};

/* ====== 导航菜单配置 ====== */

export const NAV_ITEMS: NavItem[] = [
  { label: '首页', href: '/', icon: <NavIcons.Dashboard />, permissionCode: 'dashboard:view' },
  { label: '客户管理', href: '/customers', icon: <NavIcons.Users />, permissionCode: 'customers:view' },
  { label: '客户跟进', href: '/followup', icon: <NavIcons.StickyNote />, permissionCode: 'followup:view' },
  { label: '商机管理', href: '/opportunities', icon: <NavIcons.Briefcase />, permissionCode: 'opportunities:view' },
  { label: '售前报价', href: '/quotes', icon: <NavIcons.FileText />, permissionCode: 'quotes:view' },
  {
    label: '风控审批', href: '/approvals', icon: <NavIcons.ShieldCheck />, permissionCode: 'approvals:view',
    children: [
      { label: '审批列表', href: '/approvals', icon: <NavIcons.ShieldCheck />, permissionCode: 'approvals:view' },
      { label: '流程配置', href: '/approval/workflows', icon: <NavIcons.Settings />, permissionCode: 'approval.workflows:view' },
      { label: '自动规则', href: '/approval/auto-rules', icon: <NavIcons.Settings />, permissionCode: 'approval.rules:view' },
      { label: '字段配置', href: '/approval/fields', icon: <NavIcons.Settings />, permissionCode: 'approval.fields:view' },
    ],
  },
  {
    label: '主体管理', href: '/entities', icon: <NavIcons.Building />, permissionCode: 'entities:view',
    children: [
      { label: '服务主体', href: '/entities/service', icon: <NavIcons.Building />, permissionCode: 'entities.service:view' },
      { label: '签约主体', href: '/entities/signing', icon: <NavIcons.FileText />, permissionCode: 'entities.signing:view' },
      { label: '结算主体', href: '/entities/settlement', icon: <NavIcons.Clipboard />, permissionCode: 'entities.settlement:view' },
    ],
  },
  { label: '账单主体规则管理', href: '/rules', icon: <NavIcons.Settings />, permissionCode: 'rules:view' },
  { label: '账单拆分字段管理', href: '/customer-billing-fields', icon: <NavIcons.Clipboard />, permissionCode: 'billing-fields:view' },
  {
    label: '系统管理', href: '/settings', icon: <NavIcons.Settings />, permissionCode: 'settings:view',
    children: [
      { label: '字典管理', href: '/settings/dictionary', icon: <NavIcons.Clipboard />, permissionCode: 'settings.dict:view' },
      { label: '接口管理', href: '/settings/api', icon: <NavIcons.Settings />, permissionCode: 'settings.api:view' },
      { label: '跟进提醒配置', href: '/settings/followup-reminder', icon: <NavIcons.Bell />, permissionCode: 'settings.reminder:view' },
    ],
  },
  {
    label: '权限管理', href: '/settings/permissions', icon: <NavIcons.Shield />, permissionCode: 'permissions:view',
    children: [
      { label: '角色管理', href: '/settings/roles', icon: <NavIcons.Users />, permissionCode: 'permissions.roles:view' },
      { label: '用户管理', href: '/settings/users', icon: <NavIcons.Users />, permissionCode: 'permissions.users:view' },
      { label: '功能管理', href: '/settings/functions', icon: <NavIcons.Settings />, permissionCode: 'permissions.functions:view' },
      { label: '数据权限管理', href: '/settings/data-permissions', icon: <NavIcons.Shield />, permissionCode: 'permissions.data:view' },
      { label: '审计日志', href: '/settings/audit-logs', icon: <NavIcons.Clipboard />, permissionCode: 'audit-logs:view' },
    ],
  },
];

/** 将 NAV_ITEMS 扁平化为可搜索的页面列表 */
export interface SearchItem {
  label: string;
  href: string;
  group: string;
}

export function getSearchItems(): SearchItem[] {
  const items: SearchItem[] = [];
  for (const item of NAV_ITEMS) {
    if (item.children) {
      for (const child of item.children) {
        items.push({ label: child.label, href: child.href, group: item.label });
      }
    } else {
      items.push({ label: item.label, href: item.href, group: '导航' });
    }
  }
  return items;
}

/** 快捷操作 */
export const QUICK_ACTIONS = [
  { label: '新建客户', href: '/customers/new', icon: <NavIcons.Plus /> },
  { label: '新建跟进', href: '/followup/new', icon: <NavIcons.Plus /> },
  { label: '新建商机', href: '/opportunities/new', icon: <NavIcons.Plus /> },
  { label: '新建报价', href: '/quotes/new', icon: <NavIcons.Plus /> },
];
