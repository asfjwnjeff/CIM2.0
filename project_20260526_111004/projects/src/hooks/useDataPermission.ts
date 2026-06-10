'use client';

import { useCallback, useMemo } from 'react';
import { useApp } from '@/lib/store';

/**
 * 数据权限 Hook
 * 基于负责人/协同人机制，判断当前用户是否对某个客户有访问权限
 */
export function useDataPermission() {
  const { currentUser, customers } = useApp();

  /** 当前用户的角色 ID 列表 */
  const roleIds = useMemo(() => {
    return currentUser.roleIds || [currentUser.role];
  }, [currentUser]);

  /** 判断当前用户是否为管理员 */
  const isAdmin = useMemo(() => {
    return roleIds.includes('role-admin') || roleIds.includes('admin');
  }, [roleIds]);

  /** 判断当前用户是否能查看某个客户 */
  const canViewCustomer = useCallback(
    (customerId: string): boolean => {
      if (isAdmin) return true;

      const customer = customers.find(c => c.id === customerId);
      if (!customer) return false;

      const resp = customer.responsiblePersons || [];
      const collab = customer.collaborators || [];

      return resp.includes(currentUser.id) || collab.includes(currentUser.id);
    },
    [customers, currentUser.id, isAdmin]
  );

  /** 获取当前用户可见的客户列表 */
  const visibleCustomers = useMemo(() => {
    if (isAdmin) return customers;
    return customers.filter(c => {
      const resp = c.responsiblePersons || [];
      const collab = c.collaborators || [];
      return resp.includes(currentUser.id) || collab.includes(currentUser.id);
    });
  }, [customers, currentUser.id, isAdmin]);

  return { canViewCustomer, visibleCustomers, isAdmin };
}
